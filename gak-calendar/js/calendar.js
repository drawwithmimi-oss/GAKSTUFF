/**
 * Calendar Rendering and Week Navigation
 */

class Calendar {
  constructor() {
    this.currentWeekStart = this.getWeekStart(new Date());
    this.currentLocation = 'holly';
    this.bookings = [];
    this.locations = [];
    this.programTypes = [];
  }

  /**
   * Get Monday of the current week
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get array of dates for the week
   */
  getWeekDates() {
    const dates = [];
    for (let i = 0; i < 5; i++) { // Mon-Fri
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  /**
   * Navigate to previous week
   */
  previousWeek() {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    this.currentWeekStart = newDate;
    this.render();
  }

  /**
   * Navigate to next week
   */
  nextWeek() {
    const newDate = new Date(this.currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    this.currentWeekStart = newDate;
    this.render();
  }

  /**
   * Go to current week
   */
  goToToday() {
    this.currentWeekStart = this.getWeekStart(new Date());
    this.render();
  }

  /**
   * Switch location
   */
  switchLocation(location) {
    this.currentLocation = location;

    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });

    event.target.classList.add('active');

    // Show/hide views
    document.querySelectorAll('.location-view').forEach(view => {
      view.classList.remove('active');
    });

    document.getElementById(location)?.classList.add('active');

    if (location !== 'all') {
      this.render();
    }
  }

  /**
   * Load bookings from API
   */
  async loadBookings() {
    try {
      window.showLoading?.();

      this.bookings = await window.API.getBookingsForWeek(
        this.formatDate(this.currentWeekStart),
        this.currentLocation !== 'all' ? this.currentLocation : null
      );

      return this.bookings;
    } catch (error) {
      console.error('Failed to load bookings:', error);
      window.showError?.('Failed to load bookings: ' + error.message);
      return [];
    } finally {
      window.hideLoading?.();
    }
  }

  /**
   * Load configuration data
   */
  async loadConfig() {
    try {
      [this.locations, this.programTypes] = await Promise.all([
        window.API.getLocations(),
        window.API.getProgramTypes()
      ]);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  /**
   * Render the calendar
   */
  async render() {
    await this.loadBookings();

    const weekDates = this.getWeekDates();
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

    // Update week header
    this.updateWeekHeader(weekDates);

    // Render for current location
    if (this.currentLocation !== 'all') {
      this.renderLocation(this.currentLocation, weekDates, days);
    }
  }

  /**
   * Update week header with navigation
   */
  updateWeekHeader(dates) {
    const start = dates[0];
    const end = dates[4];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();

    let weekText = '';
    if (start.getMonth() === end.getMonth()) {
      weekText = `${startMonth} ${startDay}-${endDay}, ${year}`;
    } else {
      weekText = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }

    // Update all location views
    document.querySelectorAll('.location-view h2').forEach((header, index) => {
      const locationName = ['Holly Street', 'D Street/DuPont', 'All Locations'][index];
      header.textContent = `${locationName} - Week of ${weekText}`;
    });
  }

  /**
   * Render calendar for specific location
   */
  renderLocation(location, weekDates, days) {
    const locationView = document.getElementById(location);
    if (!locationView) return;

    const tbody = locationView.querySelector('.calendar tbody');
    if (!tbody) return;

    // Get cells
    const cells = tbody.querySelectorAll('.day-cell');

    // Clear and render each day
    days.forEach((day, index) => {
      if (cells[index]) {
        const date = this.formatDate(weekDates[index]);
        this.renderDay(cells[index], day, date, location);
      }
    });
  }

  /**
   * Render bookings for a single day
   */
  renderDay(cell, dayCode, date, location) {
    const stackDiv = cell.querySelector('.bookings-stack');
    if (!stackDiv) return;

    // Clear existing bookings
    stackDiv.innerHTML = '';

    // Filter bookings for this day
    const dayBookings = this.bookings.filter(booking => {
      if (booking.location !== location) return false;

      if (booking.scheduleType === 'weekly') {
        return booking.days && booking.days.includes(dayCode);
      } else if (booking.scheduleType === 'onetime' || booking.scheduleType === 'specific') {
        return booking.date === date;
      }

      return false;
    });

    // Sort by start time
    dayBookings.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    // Create booking elements
    dayBookings.forEach(booking => {
      const bookingEl = this.createBookingElement(booking);
      stackDiv.appendChild(bookingEl);
    });

    // Show empty state if no bookings
    if (dayBookings.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-day';
      empty.textContent = 'No bookings';
      stackDiv.appendChild(empty);
    }
  }

  /**
   * Create booking element
   */
  createBookingElement(booking) {
    const div = document.createElement('div');
    div.className = `booking-block ${booking.programType}`;
    div.onclick = (e) => {
      e.stopPropagation();
      window.BookingForm?.viewBooking(booking.id);
    };

    div.innerHTML = `
      <div class="booking-time">${booking.startTime} - ${booking.endTime}</div>
      <div class="booking-title">${this.escapeHtml(booking.programName)}</div>
      <div class="booking-teacher">${this.escapeHtml(booking.teacher)}${booking.room ? ' • ' + this.escapeHtml(booking.room) : ''}</div>
    `;

    return div;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize calendar
   */
  async initialize() {
    await this.loadConfig();
    await this.render();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Week navigation
    const prevBtn = document.getElementById('prevWeek');
    const nextBtn = document.getElementById('nextWeek');
    const todayBtn = document.getElementById('todayBtn');

    if (prevBtn) prevBtn.onclick = () => this.previousWeek();
    if (nextBtn) nextBtn.onclick = () => this.nextWeek();
    if (todayBtn) todayBtn.onclick = () => this.goToToday();

    // Location tabs are handled by switchLocation method
  }
}

// Export calendar instance
window.CalendarInstance = new Calendar();
