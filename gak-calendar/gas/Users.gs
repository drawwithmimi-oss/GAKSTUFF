/**
 * Users.gs - User management and permissions
 */

/**
 * Get user by email
 */
function getUserByEmail(email) {
  const sheet = getSheet(CONFIG.SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return {
        email: data[i][0],
        name: data[i][1],
        role: data[i][2],
        canCreate: data[i][3],
        canEditAll: data[i][4],
        canDelete: data[i][5],
        active: data[i][6]
      };
    }
  }

  return null;
}

/**
 * Check if user can edit a booking
 */
function canUserEditBooking(user, booking) {
  if (!user || !user.active) return false;

  // Admins can edit anything
  if (user.role === 'admin') return true;

  // Managers can edit within their program
  if (user.role === 'manager' && user.canEditAll) {
    // TODO: Add program association to users
    return true;
  }

  // Teachers can only edit their own
  if (user.role === 'teacher') {
    return booking.createdBy === user.email;
  }

  return false;
}

/**
 * Check if user can delete a booking
 */
function canUserDeleteBooking(user, booking) {
  if (!user || !user.active) return false;

  // Admins can delete anything
  if (user.role === 'admin' && user.canDelete) return true;

  // Teachers can only delete their own
  if (user.role === 'teacher' && user.canDelete) {
    return booking.createdBy === user.email;
  }

  return false;
}

/**
 * Get locations configuration
 */
function getLocations() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.LOCATIONS);
    const data = sheet.getDataRange().getValues();

    const locations = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][3]) { // active
        locations.push({
          id: data[i][0],
          name: data[i][1],
          rooms: JSON.parse(data[i][2]),
          active: data[i][3]
        });
      }
    }

    return jsonResponse({ locations: locations });
  } catch (error) {
    Logger.log('Error in getLocations: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Get program types configuration
 */
function getProgramTypes() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.PROGRAM_TYPES);
    const data = sheet.getDataRange().getValues();

    const programTypes = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][3]) { // active
        programTypes.push({
          id: data[i][0],
          name: data[i][1],
          color: data[i][2],
          active: data[i][3]
        });
      }
    }

    return jsonResponse({ programTypes: programTypes });
  } catch (error) {
    Logger.log('Error in getProgramTypes: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}
