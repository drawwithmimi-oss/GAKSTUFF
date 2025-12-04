/**
 * Booking Form Management
 */

class BookingFormManager {
  constructor() {
    this.editingBookingId = null;
    this.currentBooking = null;
  }

  /**
   * Open booking form
   */
  openForm(mode = 'new', data = {}) {
    const modal = document.getElementById('bookingModal');
    const form = document.getElementById('bookingForm');
    const modalTitle = document.getElementById('modalTitle');
    const deleteBtn = document.getElementById('deleteBtn');

    form.reset();
    document.getElementById('conflictWarning')?.classList.remove('active');
    document.getElementById('successMessage')?.classList.remove('active');
    document.getElementById('saveBtn').disabled = true;

    if (mode === 'new') {
      modalTitle.textContent = 'New Booking';
      deleteBtn.style.display = 'none';
      this.editingBookingId = null;

      // Pre-fill with data
      if (data.location) {
        document.getElementById('location').value = data.location;
        this.updateRooms();
      }
      if (data.date) {
        document.getElementById('startDate').value = data.date;
      }
      if (data.day) {
        const dayCheckbox = document.getElementById(data.day.toLowerCase());
        if (dayCheckbox) dayCheckbox.checked = true;
      }
    } else {
      modalTitle.textContent = 'Edit Booking';
      deleteBtn.style.display = 'block';
    }

    modal.classList.add('active');
  }

  /**
   * Close modal
   */
  closeModal() {
    document.getElementById('bookingModal')?.classList.remove('active');
    this.editingBookingId = null;
    this.currentBooking = null;
  }

  /**
   * View/edit existing booking
   */
  async viewBooking(bookingId) {
    try {
      window.showLoading?.();

      // Find booking
      const bookings = await window.API.getBookings();
      const booking = bookings.find(b => b.id === bookingId);

      if (!booking) {
        alert('Booking not found');
        return;
      }

      this.editingBookingId = bookingId;
      this.currentBooking = booking;

      // Open modal
      this.openForm('edit');

      // Populate form
      document.getElementById('programName').value = booking.programName;
      document.getElementById('teacher').value = booking.teacher;
      document.getElementById('programType').value = booking.programType;
      document.getElementById('location').value = booking.location;

      this.updateRooms();
      document.getElementById('room').value = booking.room || '';

      // Set schedule type
      document.querySelector(`input[name="scheduleType"][value="${booking.scheduleType}"]`).checked = true;
      this.toggleScheduleOptions();

      // Set days if weekly
      if (booking.scheduleType === 'weekly' && booking.days) {
        booking.days.forEach(day => {
          const checkbox = document.getElementById(day);
          if (checkbox) checkbox.checked = true;
        });
      }

      // Set times
      document.getElementById('startTime').value = window.CalendarUtils.convertTo24Hour(booking.startTime);
      document.getElementById('endTime').value = window.CalendarUtils.convertTo24Hour(booking.endTime);
      document.getElementById('startDate').value = booking.startDate;
      document.getElementById('endDate').value = booking.endDate || '';
      document.getElementById('notes').value = booking.notes || '';

    } catch (error) {
      console.error('Error loading booking:', error);
      window.showError?.('Failed to load booking: ' + error.message);
    } finally {
      window.hideLoading?.();
    }
  }

  /**
   * Handle day cell click
   */
  handleDayClick(location, day, date) {
    this.openForm('new', { location, day, date });
  }

  /**
   * Update rooms dropdown based on location
   */
  updateRooms() {
    const location = document.getElementById('location').value;
    const roomSelect = document.getElementById('room');

    roomSelect.innerHTML = '<option value="">Select room...</option>';

    const locationData = window.CalendarInstance?.locations.find(l => l.id === location);

    if (locationData && locationData.rooms) {
      locationData.rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room;
        option.textContent = room;
        roomSelect.appendChild(option);
      });
    }
  }

  /**
   * Toggle schedule options visibility
   */
  toggleScheduleOptions() {
    const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value;
    const weeklyOptions = document.getElementById('weeklyOptions');
    const dateOptions = document.getElementById('dateOptions');

    if (scheduleType === 'weekly') {
      weeklyOptions.style.display = 'block';
      dateOptions.style.display = 'none';
    } else if (scheduleType === 'specific') {
      weeklyOptions.style.display = 'none';
      dateOptions.style.display = 'block';
    } else {
      weeklyOptions.style.display = 'none';
      dateOptions.style.display = 'none';
    }
  }

  /**
   * Check for conflicts
   */
  async checkConflicts() {
    try {
      const booking = this.collectFormData();

      if (!booking.location || !booking.startTime || !booking.endTime) {
        alert('Please fill in location and times first');
        return;
      }

      window.showLoading?.();

      const result = await window.API.checkConflicts(booking);

      const conflictWarning = document.getElementById('conflictWarning');
      const conflictList = document.getElementById('conflictList');
      const saveBtn = document.getElementById('saveBtn');

      if (result.hasConflicts && result.conflicts.length > 0) {
        conflictWarning.classList.add('active');
        conflictList.innerHTML = result.conflicts.map(c =>
          `<li>${c.programName} (${c.teacher}) - ${c.startTime} to ${c.endTime}</li>`
        ).join('');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Anyway';
        saveBtn.style.background = '#ffc107';
      } else {
        conflictWarning.classList.remove('active');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Booking';
        saveBtn.style.background = '#667eea';
        alert('✅ No conflicts found! Ready to save.');
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
      window.showError?.('Failed to check conflicts: ' + error.message);
    } finally {
      window.hideLoading?.();
    }
  }

  /**
   * Collect form data into booking object
   */
  collectFormData() {
    const formData = {
      programName: document.getElementById('programName').value,
      teacher: document.getElementById('teacher').value,
      programType: document.getElementById('programType').value,
      location: document.getElementById('location').value,
      room: document.getElementById('room').value,
      scheduleType: document.querySelector('input[name="scheduleType"]:checked')?.value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      notes: document.getElementById('notes').value,
      days: [],
      date: null
    };

    // Add ID if editing
    if (this.editingBookingId) {
      formData.id = this.editingBookingId;
    }

    // Collect selected days for weekly recurring
    if (formData.scheduleType === 'weekly') {
      ['mon', 'tue', 'wed', 'thu', 'fri'].forEach(day => {
        if (document.getElementById(day)?.checked) {
          formData.days.push(day);
        }
      });
    } else if (formData.scheduleType === 'specific' || formData.scheduleType === 'onetime') {
      formData.date = document.getElementById('specificDate')?.value || formData.startDate;
    }

    return formData;
  }

  /**
   * Save booking
   */
  async saveBooking(event) {
    event.preventDefault();

    try {
      const booking = this.collectFormData();

      // Validation
      if (booking.scheduleType === 'weekly' && booking.days.length === 0) {
        alert('Please select at least one day of the week');
        return false;
      }

      window.showLoading?.();

      let result;
      if (this.editingBookingId) {
        result = await window.API.updateBooking(booking);
      } else {
        result = await window.API.createBooking(booking);
      }

      // Show success message
      const successMessage = document.getElementById('successMessage');
      successMessage.classList.add('active');

      // Re-render calendar
      await window.CalendarInstance?.render();

      // Close modal after delay
      setTimeout(() => {
        this.closeModal();
        successMessage.classList.remove('active');
      }, 1500);

    } catch (error) {
      console.error('Error saving booking:', error);
      window.showError?.('Failed to save booking: ' + error.message);
    } finally {
      window.hideLoading?.();
    }

    return false;
  }

  /**
   * Delete booking
   */
  async deleteBooking() {
    if (!this.editingBookingId) return;

    if (!confirm('Are you sure you want to delete this booking? This cannot be undone.')) {
      return;
    }

    try {
      window.showLoading?.();

      await window.API.deleteBooking(this.editingBookingId);

      // Re-render calendar
      await window.CalendarInstance?.render();

      // Close modal
      this.closeModal();

      alert('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      window.showError?.('Failed to delete booking: ' + error.message);
    } finally {
      window.hideLoading?.();
    }
  }
}

// Export instance
window.BookingForm = new BookingFormManager();

// Global functions for onclick handlers
function openBookingForm(mode, data) {
  window.BookingForm.openForm(mode, data);
}

function closeModal() {
  window.BookingForm.closeModal();
}

function viewBooking(bookingId) {
  window.BookingForm.viewBooking(bookingId);
}

function handleDayClick(location, day, date) {
  window.BookingForm.handleDayClick(location, day, date);
}

function updateRooms() {
  window.BookingForm.updateRooms();
}

function toggleScheduleOptions() {
  window.BookingForm.toggleScheduleOptions();
}

function checkConflicts() {
  window.BookingForm.checkConflicts();
}

function saveBooking(event) {
  return window.BookingForm.saveBooking(event);
}

function deleteBooking() {
  window.BookingForm.deleteBooking();
}

function switchLocation(location) {
  window.CalendarInstance?.switchLocation(location);
}
