/**
 * Gabriel's Art Kids - Calendar Booking System
 * Simple All-in-One Version - No Authentication Required
 *
 * Just copy this ENTIRE file into Apps Script Code.gs
 */

// Configuration - UPDATE THIS!
const SHEET_ID = '1MiHog2QrFkhiObUBbwujO_T_sL3QU9lHqzR9-i1U2OQ'; // Your spreadsheet ID

const SHEETS = {
  BOOKINGS: 'Bookings',
  LOCATIONS: 'Locations',
  PROGRAM_TYPES: 'Program_Types'
};

/**
 * Handle GET requests (retrieve data)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'checkHealth':
        return jsonResponse({ status: 'ok', timestamp: new Date() });
      case 'getBookings':
        return getBookings(e.parameter);
      case 'getLocations':
        return getLocations();
      case 'getProgramTypes':
        return getProgramTypes();
      case 'getUserInfo':
        return getUserInfo();
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return jsonResponse({ error: error.toString(), stack: error.stack }, 500);
  }
}

/**
 * Handle POST requests (create, update, delete)
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'createBooking':
        return createBooking(data.booking);
      case 'updateBooking':
        return updateBooking(data.booking);
      case 'deleteBooking':
        return deleteBooking(data.bookingId);
      case 'checkConflicts':
        return checkConflicts(data.booking);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({ error: error.toString(), stack: error.stack }, 500);
  }
}

/**
 * Get user information - No authentication, everyone has access
 */
function getUserInfo() {
  return jsonResponse({
    email: 'team@gabrielsartkids.com',
    name: 'GAK Team',
    role: 'admin',
    canCreate: true,
    canEditAll: true,
    canDelete: true,
    active: true
  });
}

/**
 * Get all bookings with optional filters
 */
function getBookings(params) {
  const sheet = getSheet(SHEETS.BOOKINGS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const bookings = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row[0]) continue;

    // Parse days if it's JSON
    let days = [];
    try {
      if (row[7] && row[7].startsWith('[')) {
        days = JSON.parse(row[7]);
      }
    } catch (e) {
      Logger.log('Error parsing days: ' + e);
    }

    const booking = {
      id: row[0],
      programName: row[1],
      teacher: row[2],
      programType: row[3],
      location: row[4],
      room: row[5],
      scheduleType: row[6],
      days: days,
      date: row[8] ? formatDate(row[8]) : null,
      startTime: row[9],
      endTime: row[10],
      startDate: row[11] ? formatDate(row[11]) : null,
      endDate: row[12] ? formatDate(row[12]) : null,
      notes: row[13],
      createdBy: row[14],
      createdAt: row[15],
      modifiedBy: row[16],
      modifiedAt: row[17],
      status: row[18]
    };

    // Apply filters
    if (params.location && booking.location !== params.location) continue;
    if (params.status && booking.status !== params.status) continue;

    bookings.push(booking);
  }

  return jsonResponse({ bookings: bookings });
}

/**
 * Create a new booking
 */
function createBooking(booking) {
  const sheet = getSheet(SHEETS.BOOKINGS);

  // Get next ID
  const lastRow = sheet.getLastRow();
  const nextId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;

  // Convert frontend field names to backend format
  const programName = booking.programName || booking.className || '';
  const teacher = booking.teacher || booking.teacherName || '';
  const days = booking.days || [];
  const scheduleType = booking.scheduleType || 'weekly';
  const isRecurring = scheduleType === 'weekly';
  const specificDate = booking.date || booking.specificDate || '';

  // Prepare row data matching your Google Sheet columns
  const now = new Date();
  const rowData = [
    nextId,
    programName,
    teacher,
    booking.programType || '',
    booking.location || '',
    booking.room || '',
    scheduleType,
    JSON.stringify(days),  // Store days as JSON array
    specificDate,
    booking.startTime || '',
    booking.endTime || '',
    booking.startDate || '',
    booking.endDate || '',
    booking.notes || '',
    'team@gabrielsartkids.com',
    now,
    '',  // modifiedBy
    '',  // modifiedAt
    'active'
  ];

  // Append row
  sheet.appendRow(rowData);

  booking.id = nextId;
  booking.status = 'active';
  booking.createdAt = now;
  booking.modifiedAt = now;

  return jsonResponse({ success: true, booking: booking });
}

/**
 * Update an existing booking
 */
function updateBooking(booking) {
  const sheet = getSheet(SHEETS.BOOKINGS);
  const data = sheet.getDataRange().getValues();

  // Find booking row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === booking.id) {
      rowIndex = i + 1; // Sheet rows are 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse({ success: false, error: 'Booking not found' }, 404);
  }

  // Convert frontend field names to backend format
  const programName = booking.programName || booking.className || '';
  const teacher = booking.teacher || booking.teacherName || '';
  const days = booking.days || [];
  const scheduleType = booking.scheduleType || 'weekly';
  const specificDate = booking.date || booking.specificDate || '';

  // Update row
  const now = new Date();
  const rowData = [
    booking.id,
    programName,
    teacher,
    booking.programType || '',
    booking.location || '',
    booking.room || '',
    scheduleType,
    JSON.stringify(days),
    specificDate,
    booking.startTime || '',
    booking.endTime || '',
    booking.startDate || '',
    booking.endDate || '',
    booking.notes || '',
    data[rowIndex - 1][14], // Keep original createdBy
    data[rowIndex - 1][15], // Keep original createdAt
    'team@gabrielsartkids.com', // modifiedBy
    now, // modifiedAt
    booking.status || 'active'
  ];

  sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);

  booking.modifiedAt = now;

  return jsonResponse({ success: true, booking: booking });
}

/**
 * Delete a booking (soft delete)
 */
function deleteBooking(bookingId) {
  const sheet = getSheet(SHEETS.BOOKINGS);
  const data = sheet.getDataRange().getValues();

  // Find booking row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return jsonResponse({ success: false, error: 'Booking not found' }, 404);
  }

  // Soft delete - set status to 'deleted'
  sheet.getRange(rowIndex, 19).setValue('deleted'); // Column 19 is status
  sheet.getRange(rowIndex, 18).setValue(new Date()); // Column 18 is modifiedAt

  return jsonResponse({ success: true });
}

/**
 * Check for booking conflicts
 */
function checkConflicts(newBooking) {
  const sheet = getSheet(SHEETS.BOOKINGS);
  const data = sheet.getDataRange().getValues();

  const conflicts = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows, deleted bookings, and self
    if (!row[0] || row[18] === 'deleted' || row[0] === newBooking.id) continue;

    // Parse days if it's JSON
    let days = [];
    try {
      if (row[7] && row[7].startsWith('[')) {
        days = JSON.parse(row[7]);
      }
    } catch (e) {
      Logger.log('Error parsing days: ' + e);
    }

    const existing = {
      id: row[0],
      programName: row[1],
      location: row[4],
      room: row[5],
      scheduleType: row[6],
      days: days,
      date: row[8],
      startTime: row[9],
      endTime: row[10],
      startDate: row[11],
      endDate: row[12]
    };

    if (hasConflict(newBooking, existing)) {
      conflicts.push(existing);
    }
  }

  return jsonResponse({
    hasConflicts: conflicts.length > 0,
    conflicts: conflicts
  });
}

/**
 * Check if two bookings conflict
 */
function hasConflict(booking1, booking2) {
  // Same location?
  if (booking1.location !== booking2.location) return false;

  // Same room? (if both specified)
  if (booking1.room && booking2.room && booking1.room !== booking2.room) return false;

  // Check day overlap
  if (!hasDayOverlap(booking1, booking2)) return false;

  // Check time overlap
  if (!hasTimeOverlap(booking1.startTime, booking1.endTime, booking2.startTime, booking2.endTime)) return false;

  // Check date range overlap
  if (!hasDateOverlap(booking1, booking2)) return false;

  return true;
}

/**
 * Check if day of week overlaps
 */
function hasDayOverlap(booking1, booking2) {
  // Helper to convert day name to 3-letter abbreviation
  const dayMap = {
    'sunday': 'sun', 'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
    'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat'
  };

  // If either is a specific date (not recurring), check if they're on same day
  if ((booking1.scheduleType === 'specific' || booking1.scheduleType === 'onetime') &&
      (booking2.scheduleType === 'specific' || booking2.scheduleType === 'onetime')) {
    const date1 = new Date(booking1.date || booking1.specificDate);
    const date2 = new Date(booking2.date || booking2.specificDate);
    return date1.getTime() === date2.getTime();
  }

  // If one is specific date, check if it falls on any of the other's days
  if (booking1.scheduleType === 'specific' || booking1.scheduleType === 'onetime') {
    const date = new Date(booking1.date || booking1.specificDate);
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    const days2 = booking2.days || [];
    return days2.includes(dayOfWeek);
  }

  if (booking2.scheduleType === 'specific' || booking2.scheduleType === 'onetime') {
    const date = new Date(booking2.date || booking2.specificDate);
    const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
    const days1 = booking1.days || [];
    return days1.includes(dayOfWeek);
  }

  // Both recurring - check if any days overlap
  const days1 = booking1.days || [];
  const days2 = booking2.days || [];
  return days1.some(day => days2.includes(day));
}

/**
 * Check if time ranges overlap
 */
function hasTimeOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

/**
 * Check if date ranges overlap
 */
function hasDateOverlap(booking1, booking2) {
  const start1 = booking1.startDate ? new Date(booking1.startDate) : new Date('1900-01-01');
  const end1 = booking1.endDate ? new Date(booking1.endDate) : new Date('2100-12-31');
  const start2 = booking2.startDate ? new Date(booking2.startDate) : new Date('1900-01-01');
  const end2 = booking2.endDate ? new Date(booking2.endDate) : new Date('2100-12-31');

  return start1 <= end2 && end1 >= start2;
}

/**
 * Get locations from sheet
 */
function getLocations() {
  const sheet = getSheet(SHEETS.LOCATIONS);
  const data = sheet.getDataRange().getValues();

  const locations = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    locations.push({
      id: row[0],
      name: row[1],
      address: row[2],
      rooms: row[3] ? row[3].split(',').map(r => r.trim()) : []
    });
  }

  return jsonResponse({ locations: locations });
}

/**
 * Get program types from sheet
 */
function getProgramTypes() {
  const sheet = getSheet(SHEETS.PROGRAM_TYPES);
  const data = sheet.getDataRange().getValues();

  const programTypes = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    programTypes.push({
      id: row[0],
      name: row[1],
      color: row[2],
      description: row[3]
    });
  }

  return jsonResponse({ programTypes: programTypes });
}

/**
 * Helper: Get sheet by name
 */
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  return spreadsheet.getSheetByName(sheetName);
}

/**
 * Helper: Format date for output
 */
function formatDate(date) {
  if (!date) return null;
  if (typeof date === 'string') return date;

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Helper: Create JSON response
 */
function jsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
