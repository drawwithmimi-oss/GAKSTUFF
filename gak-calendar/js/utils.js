/**
 * Utility Functions
 */

class CalendarUtilities {
  /**
   * Convert 12-hour time to 24-hour format
   */
  convertTo24Hour(time12) {
    if (!time12) return '';
    if (!time12.includes('AM') && !time12.includes('PM')) {
      return time12; // Already 24-hour format
    }

    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM' || modifier === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  /**
   * Format time from 24-hour to 12-hour format
   */
  formatTime(time24) {
    if (!time24) return '';

    // If already formatted, return as-is
    if (time24.includes('AM') || time24.includes('PM')) {
      return time24;
    }

    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  }

  /**
   * Convert time to minutes since midnight
   */
  timeToMinutes(timeString) {
    if (!timeString) return 0;

    // Convert to 24-hour if needed
    let time24 = timeString;
    if (timeString.includes('AM') || timeString.includes('PM')) {
      time24 = this.convertTo24Hour(timeString);
    }

    const [hours, minutes] = time24.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if two time ranges overlap
   */
  hasTimeOverlap(start1, end1, start2, end2) {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && e1 > s2;
  }

  /**
   * Check if two bookings have conflicting days
   */
  hasDayOverlap(booking1, booking2) {
    // Weekly vs Weekly
    if (booking1.scheduleType === 'weekly' && booking2.scheduleType === 'weekly') {
      return booking1.days.some(day => booking2.days.includes(day));
    }

    // One-time vs Weekly
    if (booking1.scheduleType === 'onetime' && booking2.scheduleType === 'weekly') {
      const dayOfWeek = this.getDayOfWeek(booking1.date);
      return booking2.days.includes(dayOfWeek);
    }

    if (booking1.scheduleType === 'weekly' && booking2.scheduleType === 'onetime') {
      const dayOfWeek = this.getDayOfWeek(booking2.date);
      return booking1.days.includes(dayOfWeek);
    }

    // Both one-time
    if (booking1.scheduleType === 'onetime' && booking2.scheduleType === 'onetime') {
      return booking1.date === booking2.date;
    }

    return true;
  }

  /**
   * Get day of week from date
   */
  getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[dayIndex];
  }

  /**
   * Check if two date ranges overlap
   */
  hasDateOverlap(booking1, booking2) {
    const start1 = new Date(booking1.startDate);
    const end1 = booking1.endDate ? new Date(booking1.endDate) : new Date('2099-12-31');
    const start2 = new Date(booking2.startDate);
    const end2 = booking2.endDate ? new Date(booking2.endDate) : new Date('2099-12-31');

    return start1 <= end2 && end1 >= start2;
  }

  /**
   * Complete conflict check
   */
  hasConflict(booking1, booking2) {
    // Same location
    if (booking1.location !== booking2.location) return false;

    // Same room (if both specified)
    if (booking1.room && booking2.room && booking1.room !== booking2.room) {
      return false;
    }

    // Day overlap
    if (!this.hasDayOverlap(booking1, booking2)) return false;

    // Time overlap
    if (!this.hasTimeOverlap(booking1.startTime, booking1.endTime, booking2.startTime, booking2.endTime)) {
      return false;
    }

    // Date range overlap
    if (!this.hasDateOverlap(booking1, booking2)) return false;

    return true;
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Show loading indicator
   */
  showLoading(message = 'Loading...') {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'globalLoader';
      loader.className = 'global-loader';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="spinner"></div>
          <p>${message}</p>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    alert('Error: ' + message);
    // TODO: Implement better error UI
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    // TODO: Implement toast notification
    console.log('Success:', message);
  }
}

// Export utilities
window.CalendarUtils = new CalendarUtilities();

// Global helper functions
window.showLoading = (msg) => window.CalendarUtils.showLoading(msg);
window.hideLoading = () => window.CalendarUtils.hideLoading();
window.showError = (msg) => window.CalendarUtils.showError(msg);
window.showSuccess = (msg) => window.CalendarUtils.showSuccess(msg);

/**
 * Clear all data (for development/testing)
 */
function clearAllData() {
  if (confirm('This will delete ALL your bookings. Are you sure?')) {
    localStorage.removeItem('gabBookings');
    location.reload();
  }
}

/**
 * Close modal when clicking outside
 */
window.onclick = function(event) {
  const modal = document.getElementById('bookingModal');
  if (event.target == modal) {
    closeModal();
  }
};

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing GAK Calendar...');

  try {
    // Show loading
    window.showLoading?.('Initializing calendar...');

    // Initialize API first and wait for it
    await initializeAPI();

    // Verify API is ready
    if (!window.API || typeof window.API.getBookingsForWeek !== 'function') {
      throw new Error('API not properly initialized');
    }

    console.log('API initialized:', window.API.constructor.name);

    // Initialize Calendar
    await window.CalendarInstance.initialize();

    // Hide loading
    window.hideLoading?.();

    console.log('GAK Calendar initialized successfully');
  } catch (error) {
    console.error('Failed to initialize calendar:', error);
    window.hideLoading?.();
    alert('Failed to initialize calendar: ' + error.message + '\n\nPlease refresh the page.');
  }
});
