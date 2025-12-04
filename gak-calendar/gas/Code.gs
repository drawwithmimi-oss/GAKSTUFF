/**
 * Gabriel's Art Kids - Calendar Booking System
 * Main Google Apps Script Backend
 *
 * This script provides the backend API for the calendar booking system.
 * It handles CRUD operations, conflict detection, and authentication.
 */

// Configuration
const CONFIG = {
  SHEET_ID: PropertiesService.getScriptProperties().getProperty('SHEET_ID'),
  SHEETS: {
    BOOKINGS: 'Bookings',
    LOCATIONS: 'Locations',
    PROGRAM_TYPES: 'Program_Types',
    USERS: 'Users'
  },
  ALLOWED_ORIGINS: [
    'https://script.google.com',
    'https://script.googleusercontent.com'
  ]
};

/**
 * Handle GET requests (retrieve data)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const user = getUserEmail();

    // Check authentication
    if (!user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    switch (action) {
      case 'getBookings':
        return getBookings(e.parameter);
      case 'getLocations':
        return getLocations();
      case 'getProgramTypes':
        return getProgramTypes();
      case 'getUserInfo':
        return getUserInfo();
      case 'checkHealth':
        return jsonResponse({ status: 'ok', timestamp: new Date() });
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle POST requests (create, update, delete)
 */
function doPost(e) {
  try {
    const user = getUserEmail();

    // Check authentication
    if (!user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'createBooking':
        return createBooking(data.booking, user);
      case 'updateBooking':
        return updateBooking(data.booking, user);
      case 'deleteBooking':
        return deleteBooking(data.bookingId, user);
      case 'checkConflicts':
        return checkConflicts(data.booking);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Get user's email address
 */
function getUserEmail() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (e) {
    Logger.log('Error getting user email: ' + e.toString());
    return null;
  }
}

/**
 * Get user information and permissions
 */
function getUserInfo() {
  const email = getUserEmail();
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  // Find user
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return jsonResponse({
        email: data[i][0],
        name: data[i][1],
        role: data[i][2],
        canCreate: data[i][3],
        canEditAll: data[i][4],
        canDelete: data[i][5],
        active: data[i][6]
      });
    }
  }

  return jsonResponse({ error: 'User not found' }, 404);
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  return output;
}

/**
 * Get spreadsheet sheet by name
 */
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  return spreadsheet.getSheetByName(sheetName);
}

/**
 * Serve the HTML web app
 */
function doGetWebApp(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('GAK Calendar Booking System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
