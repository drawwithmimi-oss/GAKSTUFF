/**
 * API Client for Google Sheets Backend
 * Handles all communication with the Google Apps Script API
 */

class CalendarAPI {
  constructor() {
    // Web App URL - SET THIS AFTER DEPLOYMENT
    this.baseURL = window.CONFIG?.API_URL || '';
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Make GET request to API
   */
  async get(action, params = {}) {
    const url = new URL(this.baseURL);
    url.searchParams.append('action', action);

    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    // Check cache
    const cacheKey = url.toString();
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful responses
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw new Error(`Failed to ${action}: ${error.message}`);
    }
  }

  /**
   * Make POST request to API
   */
  async post(action, data = {}) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ action, ...data })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Clear cache on mutations
      this.clearCache();

      return result;
    } catch (error) {
      console.error('API POST Error:', error);
      throw new Error(`Failed to ${action}: ${error.message}`);
    }
  }

  /**
   * Clear API cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get all bookings with optional filters
   */
  async getBookings(filters = {}) {
    const data = await this.get('getBookings', filters);
    return data.bookings || [];
  }

  /**
   * Get bookings for a specific week
   */
  async getBookingsForWeek(weekStart, location = null) {
    const filters = { week: weekStart };
    if (location) {
      filters.location = location;
    }
    return this.getBookings(filters);
  }

  /**
   * Create a new booking
   */
  async createBooking(booking) {
    const result = await this.post('createBooking', { booking });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create booking');
    }

    return result.booking;
  }

  /**
   * Update an existing booking
   */
  async updateBooking(booking) {
    const result = await this.post('updateBooking', { booking });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update booking');
    }

    return result.booking;
  }

  /**
   * Delete a booking
   */
  async deleteBooking(bookingId) {
    const result = await this.post('deleteBooking', { bookingId });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete booking');
    }

    return true;
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(booking) {
    const result = await this.post('checkConflicts', { booking });
    return {
      hasConflicts: result.hasConflicts || false,
      conflicts: result.conflicts || []
    };
  }

  /**
   * Get location configuration
   */
  async getLocations() {
    const data = await this.get('getLocations');
    return data.locations || [];
  }

  /**
   * Get program types configuration
   */
  async getProgramTypes() {
    const data = await this.get('getProgramTypes');
    return data.programTypes || [];
  }

  /**
   * Get current user information
   */
  async getUserInfo() {
    const data = await this.get('getUserInfo');
    return data;
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const data = await this.get('checkHealth');
      return data.status === 'ok';
    } catch (error) {
      return false;
    }
  }
}

/**
 * Fallback to localStorage for offline mode or development
 */
class LocalStorageAPI {
  constructor() {
    this.storageKey = 'gabBookings';
    this.idCounter = this.getNextId();
  }

  getNextId() {
    const bookings = this.getBookings();
    return bookings.length > 0
      ? Math.max(...bookings.map(b => b.id)) + 1
      : 1;
  }

  async getBookings(filters = {}) {
    const stored = localStorage.getItem(this.storageKey);
    let bookings = stored ? JSON.parse(stored) : [];

    // Apply filters
    if (filters.location) {
      bookings = bookings.filter(b => b.location === filters.location);
    }

    if (filters.week) {
      // Filter by week would require date logic
      // For now, return all
    }

    return bookings;
  }

  async getBookingsForWeek(weekStart, location = null) {
    const filters = { week: weekStart };
    if (location) {
      filters.location = location;
    }
    return this.getBookings(filters);
  }

  async createBooking(booking) {
    const bookings = await this.getBookings();
    booking.id = this.idCounter++;
    booking.createdAt = new Date().toISOString();
    booking.status = 'active';
    bookings.push(booking);
    localStorage.setItem(this.storageKey, JSON.stringify(bookings));
    return booking;
  }

  async updateBooking(booking) {
    const bookings = await this.getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);

    if (index === -1) {
      throw new Error('Booking not found');
    }

    booking.modifiedAt = new Date().toISOString();
    bookings[index] = booking;
    localStorage.setItem(this.storageKey, JSON.stringify(bookings));
    return booking;
  }

  async deleteBooking(bookingId) {
    let bookings = await this.getBookings();
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem(this.storageKey, JSON.stringify(bookings));
    return true;
  }

  async checkConflicts(booking) {
    const bookings = await this.getBookings();
    // Use the same conflict detection logic
    const conflicts = bookings.filter(existing => {
      if (booking.id && existing.id === booking.id) return false;
      return window.CalendarUtils?.hasConflict(booking, existing);
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts
    };
  }

  async getLocations() {
    return [
      {
        id: 'holly',
        name: 'Holly Street',
        rooms: ['Upstairs Classroom', 'Downstairs Space']
      },
      {
        id: 'dupont',
        name: 'D Street/DuPont',
        rooms: ['Orange Room', 'Green Room', 'Great Room', 'Stage Area', 'Cubby Room']
      }
    ];
  }

  async getProgramTypes() {
    return [
      { id: 'ece', name: 'ECE Programs', color: '#28a745' },
      { id: 'asap', name: 'ASAP', color: '#17a2b8' },
      { id: 'music', name: 'Music Programs', color: '#ffc107' },
      { id: 'adult', name: 'Adult/Teen Classes', color: '#dc3545' },
      { id: 'offsite', name: 'Off-site', color: '#6c757d' }
    ];
  }

  async getUserInfo() {
    return {
      email: 'demo@gabrielsartkids.com',
      name: 'Demo User',
      role: 'admin',
      canCreate: true,
      canEditAll: true,
      canDelete: true
    };
  }

  async checkHealth() {
    return true;
  }
}

// Export API instance
window.API = null;

// Initialize API (will be called when page loads)
async function initializeAPI() {
  try {
    // Try to use Google Sheets API if configured
    if (window.CONFIG?.API_URL && window.CONFIG.API_URL.trim() !== '') {
      console.log('Attempting to connect to Google Sheets API...');
      window.API = new CalendarAPI();

      // Test connection with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API connection timeout')), 10000)
      );

      const healthPromise = window.API.checkHealth();

      try {
        const healthy = await Promise.race([healthPromise, timeoutPromise]);

        if (!healthy) {
          throw new Error('Health check failed');
        }

        console.log('✅ Connected to Google Sheets API');
        return window.API;
      } catch (error) {
        console.warn('⚠️ Google Sheets API not available:', error.message);
        console.log('Falling back to localStorage');
        window.API = new LocalStorageAPI();
        return window.API;
      }
    } else {
      console.log('📦 Using localStorage (development mode)');
      window.API = new LocalStorageAPI();
      return window.API;
    }
  } catch (error) {
    console.error('❌ Error initializing API:', error);
    console.log('Falling back to localStorage');
    window.API = new LocalStorageAPI();
    return window.API;
  }
}
