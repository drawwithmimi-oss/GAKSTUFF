/**
 * GAK Calendar - Simple Clean Version
 * Mobile-first, spreadsheet-like interface
 */

// Global state
let currentWeekStart = null;
let currentLocation = '';
let allBookings = [];
let locations = [];
let programTypes = [];
let editingBooking = null;
let copiedBooking = null;

// Time slots (8:30 AM to 6:00 PM in 30-min intervals)
const TIME_SLOTS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

const ROOMS = {
  holly: ['Upstairs Classroom', 'Downstairs Space'],
  dupont: ['Orange Room', 'Green Room', 'Great Room', 'Stage Area', 'Cubby Room']
};

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing GAK Calendar...');

  try {
    showLoading();

    // Initialize API
    await initializeAPI();

    // Load data
    await loadLocations();
    await loadProgramTypes();

    // Set current week to this week
    currentWeekStart = getWeekStart(new Date());

    // Render calendar
    await renderCalendar();

    // Setup event listeners
    setupEventListeners();

    hideLoading();
    console.log('✅ Calendar initialized');
  } catch (error) {
    console.error('Failed to initialize:', error);
    hideLoading();
    alert('Failed to load calendar: ' + error.message);
  }
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('prevWeek').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('nextWeek').addEventListener('click', () => navigateWeek(1));
  document.getElementById('todayBtn').addEventListener('click', goToToday);
  document.getElementById('locationFilter').addEventListener('change', (e) => {
    currentLocation = e.target.value;
    renderCalendar();
  });
}

// Navigate weeks
function navigateWeek(direction) {
  const newDate = new Date(currentWeekStart);
  newDate.setDate(newDate.getDate() + (direction * 7));
  currentWeekStart = getWeekStart(newDate);
  renderCalendar();
}

function goToToday() {
  currentWeekStart = getWeekStart(new Date());
  renderCalendar();
}

// Get Monday of the week for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Load locations
async function loadLocations() {
  try {
    const data = await window.API.getLocations();
    locations = data;
  } catch (error) {
    console.error('Failed to load locations:', error);
    locations = [
      { id: 'holly', name: 'Holly Street', rooms: ROOMS.holly },
      { id: 'dupont', name: 'D Street/DuPont', rooms: ROOMS.dupont }
    ];
  }
}

// Load program types
async function loadProgramTypes() {
  try {
    const data = await window.API.getProgramTypes();
    programTypes = data;
  } catch (error) {
    console.error('Failed to load program types:', error);
  }
}

// Render calendar
async function renderCalendar() {
  try {
    showLoading();

    // Update week display
    updateWeekDisplay();

    // Load bookings
    await loadBookings();

    // Render the grid
    renderGrid();

    hideLoading();
  } catch (error) {
    console.error('Failed to render calendar:', error);
    hideLoading();
  }
}

// Update week display in header
function updateWeekDisplay() {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // Friday

  const options = { month: 'short', day: 'numeric' };
  const startStr = currentWeekStart.toLocaleDateString('en-US', options);
  const endStr = weekEnd.toLocaleDateString('en-US', options);

  document.getElementById('currentWeek').textContent = `${startStr} - ${endStr}`;

  // Update day headers
  for (let i = 0; i < 5; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);

    const dayEl = document.getElementById(`day-${DAYS[i]}`);
    const dateEl = dayEl.querySelector('.day-date');
    dateEl.textContent = date.getDate();

    // Highlight today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    } else {
      dayEl.classList.remove('today');
    }
  }
}

// Load bookings for current week
async function loadBookings() {
  try {
    const weekStart = formatDate(currentWeekStart);
    let bookings = await window.API.getBookingsForWeek(weekStart, currentLocation);

    // Filter out deleted bookings
    allBookings = bookings.filter(b => b.status !== 'deleted');
  } catch (error) {
    console.error('Failed to load bookings:', error);
    allBookings = [];
  }
}

// Render the calendar grid
function renderGrid() {
  const body = document.getElementById('calendarBody');
  body.innerHTML = '';

  TIME_SLOTS.forEach(time => {
    // Time label
    const timeSlot = document.createElement('div');
    timeSlot.className = 'time-slot';
    timeSlot.textContent = formatTime12Hour(time);
    body.appendChild(timeSlot);

    // Day cells
    DAYS.forEach((day, index) => {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.day = day;
      cell.dataset.time = time;

      // Get date for this cell
      const cellDate = new Date(currentWeekStart);
      cellDate.setDate(cellDate.getDate() + index);
      cell.dataset.date = formatDate(cellDate);

      // Find bookings for this cell
      const cellBookings = getBookingsForCell(day, time, cellDate);

      if (cellBookings.length > 0) {
        cell.classList.add('has-booking');
        cellBookings.forEach(booking => {
          const card = createBookingCard(booking);
          cell.appendChild(card);
        });
      } else {
        // Empty cell - click to add booking
        cell.addEventListener('click', () => openNewBooking(day, time, cellDate));
      }

      body.appendChild(cell);
    });
  });
}

// Get bookings that match this cell
function getBookingsForCell(day, time, date) {
  return allBookings.filter(booking => {
    // Check if booking applies to this day
    if (!bookingAppliesToDay(booking, day, date)) return false;

    // Check if booking includes this time
    if (!bookingIncludesTime(booking, time)) return false;

    // Check location filter
    if (currentLocation && booking.location !== currentLocation) return false;

    return true;
  });
}

// Check if booking applies to this day
function bookingAppliesToDay(booking, day, date) {
  // Check if date is within booking range
  const bookingStart = booking.startDate ? new Date(booking.startDate) : new Date('1900-01-01');
  const bookingEnd = booking.endDate ? new Date(booking.endDate) : new Date('2100-12-31');
  const checkDate = new Date(date);

  if (checkDate < bookingStart || checkDate > bookingEnd) return false;

  // Check if this day is selected
  if (booking.days && booking.days.length > 0) {
    return booking.days.includes(day);
  }

  return false;
}

// Check if booking includes this time slot
function bookingIncludesTime(booking, timeSlot) {
  const slotTime = timeToMinutes(timeSlot);
  const startTime = timeToMinutes(booking.startTime);
  const endTime = timeToMinutes(booking.endTime);

  // Booking starts at or before this slot, and ends after this slot
  return startTime <= slotTime && endTime > slotTime;
}

// Convert HH:MM to minutes since midnight
function timeToMinutes(time) {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format time as 12-hour
function formatTime12Hour(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

// Create booking card element
function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = `booking-card ${booking.programType}`;
  card.onclick = (e) => {
    e.stopPropagation();
    openEditBooking(booking);
  };

  const title = document.createElement('div');
  title.className = 'booking-title';
  title.textContent = booking.programName || 'Untitled';

  const teacher = document.createElement('div');
  teacher.className = 'booking-teacher';
  teacher.textContent = booking.teacher || '';

  card.appendChild(title);
  if (booking.teacher) {
    card.appendChild(teacher);
  }

  return card;
}

// Open modal for new booking
function openNewBooking(day, time, date) {
  editingBooking = null;

  document.getElementById('modalTitle').textContent = 'New Booking';
  document.getElementById('deleteBtn').style.display = 'none';
  document.getElementById('copyBtn').style.display = 'none';

  // Reset form
  document.getElementById('bookingForm').reset();

  // Pre-fill day and time
  document.getElementById(day).checked = true;
  document.getElementById('startTime').value = time;

  // Calculate end time (30 min later)
  const endMinutes = timeToMinutes(time) + 30;
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  document.getElementById('endTime').value = endTime;

  // Set start date to this date
  document.getElementById('startDate').value = formatDate(date);

  // Show modal
  document.getElementById('bookingModal').classList.add('active');
}

// Open modal to edit booking
function openEditBooking(booking) {
  editingBooking = booking;

  document.getElementById('modalTitle').textContent = 'Edit Booking';
  document.getElementById('deleteBtn').style.display = 'block';
  document.getElementById('copyBtn').style.display = 'block';

  // Populate form
  document.getElementById('programName').value = booking.programName || '';
  document.getElementById('teacher').value = booking.teacher || '';
  document.getElementById('programType').value = booking.programType || '';
  document.getElementById('location').value = booking.location || '';
  updateRooms();
  document.getElementById('room').value = booking.room || '';

  // Set days
  DAYS.forEach(day => {
    const checkbox = document.getElementById(day);
    checkbox.checked = booking.days && booking.days.includes(day);
  });

  document.getElementById('startTime').value = booking.startTime || '';
  document.getElementById('endTime').value = booking.endTime || '';
  document.getElementById('startDate').value = booking.startDate || '';
  document.getElementById('endDate').value = booking.endDate || '';
  document.getElementById('notes').value = booking.notes || '';

  // Show modal
  document.getElementById('bookingModal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('bookingModal').classList.remove('active');
  editingBooking = null;
}

// Update rooms dropdown based on location
function updateRooms() {
  const location = document.getElementById('location').value;
  const roomSelect = document.getElementById('room');

  roomSelect.innerHTML = '<option value="">Select room...</option>';

  if (location && ROOMS[location]) {
    ROOMS[location].forEach(room => {
      const option = document.createElement('option');
      option.value = room;
      option.textContent = room;
      roomSelect.appendChild(option);
    });
  }
}

// Save booking
async function saveBooking(event) {
  event.preventDefault();

  try {
    showLoading();

    // Collect selected days
    const days = [];
    DAYS.forEach(day => {
      if (document.getElementById(day).checked) {
        days.push(day);
      }
    });

    if (days.length === 0) {
      alert('Please select at least one day');
      hideLoading();
      return false;
    }

    // Build booking object
    const booking = {
      programName: document.getElementById('programName').value,
      teacher: document.getElementById('teacher').value,
      programType: document.getElementById('programType').value,
      location: document.getElementById('location').value,
      room: document.getElementById('room').value,
      days: days,
      scheduleType: 'weekly',
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      notes: document.getElementById('notes').value
    };

    // Save
    if (editingBooking) {
      booking.id = editingBooking.id;
      await window.API.updateBooking(booking);
    } else {
      await window.API.createBooking(booking);
    }

    // Show success
    showSuccess();

    // Close modal and refresh
    closeModal();
    await renderCalendar();

    hideLoading();
  } catch (error) {
    console.error('Failed to save:', error);
    alert('Failed to save booking: ' + error.message);
    hideLoading();
  }

  return false;
}

// Delete booking
async function deleteBooking() {
  if (!editingBooking) return;

  if (!confirm('Delete this booking?')) return;

  try {
    showLoading();
    await window.API.deleteBooking(editingBooking.id);
    showSuccess('Deleted');
    closeModal();
    await renderCalendar();
    hideLoading();
  } catch (error) {
    console.error('Failed to delete:', error);
    alert('Failed to delete booking: ' + error.message);
    hideLoading();
  }
}

// Copy booking (store in memory)
function copyBooking() {
  if (!editingBooking) return;

  copiedBooking = { ...editingBooking };
  delete copiedBooking.id; // Remove ID so it creates new

  alert('Booking copied! Click on a time slot to paste.');
  closeModal();
}

// Show loading overlay
function showLoading() {
  document.getElementById('loadingOverlay').classList.add('active');
}

// Hide loading overlay
function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

// Show success message
function showSuccess(message = 'Saved successfully!') {
  const successEl = document.getElementById('successMessage');
  successEl.textContent = '✓ ' + message;
  successEl.classList.add('active');

  setTimeout(() => {
    successEl.classList.remove('active');
  }, 2000);
}

// Make functions global for onclick handlers
window.closeModal = closeModal;
window.saveBooking = saveBooking;
window.deleteBooking = deleteBooking;
window.copyBooking = copyBooking;
window.updateRooms = updateRooms;
