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

    const booking = {
      id: row[0],
      location: row[1],
      room: row[2],
      programType: row[3],
      teacherName: row[4],
      className: row[5],
      dayOfWeek: row[6],
      startTime: row[7],
      endTime: row[8],
      startDate: row[9] ? formatDate(row[9]) : null,
      endDate: row[10] ? formatDate(row[10]) : null,
      isRecurring: row[11],
      specificDate: row[12] ? formatDate(row[12]) : null,
      notes: row[13],
      status: row[14],
      createdBy: row[15],
      createdAt: row[16],
      modifiedAt: row[17]
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

  // Prepare row data
  const now = new Date();
  const rowData = [
    nextId,
    booking.location || '',
    booking.room || '',
    booking.programType || '',
    booking.teacherName || '',
    booking.className || '',
    booking.dayOfWeek || '',
    booking.startTime || '',
    booking.endTime || '',
    booking.startDate || '',
    booking.endDate || '',
    booking.isRecurring || false,
    booking.specificDate || '',
    booking.notes || '',
    'active',
    'team@gabrielsartkids.com',
    now,
    now
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

  // Update row
  const now = new Date();
  const rowData = [
    booking.id,
    booking.location || '',
    booking.room || '',
    booking.programType || '',
    booking.teacherName || '',
    booking.className || '',
    booking.dayOfWeek || '',
    booking.startTime || '',
    booking.endTime || '',
    booking.startDate || '',
    booking.endDate || '',
    booking.isRecurring || false,
    booking.specificDate || '',
    booking.notes || '',
    booking.status || 'active',
    data[rowIndex - 1][15], // Keep original createdBy
    data[rowIndex - 1][16], // Keep original createdAt
    now // Update modifiedAt
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
  sheet.getRange(rowIndex, 15).setValue('deleted');
  sheet.getRange(rowIndex, 18).setValue(new Date()); // Update modifiedAt

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
    if (!row[0] || row[14] === 'deleted' || row[0] === newBooking.id) continue;

    const existing = {
      id: row[0],
      location: row[1],
      room: row[2],
      dayOfWeek: row[6],
      startTime: row[7],
      endTime: row[8],
      startDate: row[9],
      endDate: row[10],
      isRecurring: row[11],
      specificDate: row[12],
      className: row[5]
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
  // If either is a specific date (not recurring), check if they're on same day
  if (booking1.specificDate && booking2.specificDate) {
    const date1 = new Date(booking1.specificDate);
    const date2 = new Date(booking2.specificDate);
    return date1.getTime() === date2.getTime();
  }

  // If one is specific date, check if it falls on the other's day of week
  if (booking1.specificDate) {
    const date = new Date(booking1.specificDate);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    return booking2.dayOfWeek === dayOfWeek;
  }

  if (booking2.specificDate) {
    const date = new Date(booking2.specificDate);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    return booking1.dayOfWeek === dayOfWeek;
  }

  // Both recurring - check if same day of week
  return booking1.dayOfWeek === booking2.dayOfWeek;
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
