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

    // Allow health check without authentication
    if (action === 'checkHealth') {
      return jsonResponse({ status: 'ok', timestamp: new Date() });
    }

    const user = getUserEmail();

    // User will be 'public@gabrielsartkids.com' if not authenticated
    // This allows the app to work without requiring Google login

    switch (action) {
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
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Handle POST requests (create, update, delete)
 */
function doPost(e) {
  try {
    const user = getUserEmail();

    // User will be 'public@gabrielsartkids.com' if not authenticated
    // This allows the app to work without requiring Google login

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
 * Returns null if no authenticated user (e.g., public access)
 */
function getUserEmail() {
  try {
    const email = Session.getActiveUser().getEmail();
    if (email && email !== '') {
      return email;
    }
    // No authenticated user - return default for public access
    return 'public@gabrielsartkids.com';
  } catch (e) {
    Logger.log('Error getting user email: ' + e.toString());
    // Return default email for public/anonymous access
    return 'public@gabrielsartkids.com';
  }
}

/**
 * Get user information and permissions
 * No authentication - everyone has full access
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
