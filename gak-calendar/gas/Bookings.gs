/**
 * Bookings.gs - CRUD operations for bookings
 */

/**
 * Get bookings with optional filters
 */
function getBookings(params) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.BOOKINGS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Convert to objects
    const bookings = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Skip cancelled bookings unless requested
      if (row[17] === 'cancelled' && params.includeCancelled !== 'true') {
        continue;
      }

      const booking = {
        id: row[0],
        programName: row[1],
        teacher: row[2],
        programType: row[3],
        location: row[4],
        room: row[5],
        scheduleType: row[6],
        days: row[7] ? JSON.parse(row[7]) : [],
        date: row[8],
        startTime: row[9],
        endTime: row[10],
        startDate: row[11],
        endDate: row[12],
        notes: row[13],
        createdBy: row[14],
        createdAt: row[15],
        modifiedBy: row[16],
        modifiedAt: row[17],
        status: row[18]
      };

      // Apply filters
      if (params.location && booking.location !== params.location) continue;
      if (params.week && !isInWeek(booking, params.week)) continue;

      bookings.push(booking);
    }

    return jsonResponse({ bookings: bookings });
  } catch (error) {
    Logger.log('Error in getBookings: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Check if booking is in specified week
 */
function isInWeek(booking, weekStart) {
  const weekDate = new Date(weekStart);
  const bookingStart = new Date(booking.startDate);
  const bookingEnd = booking.endDate ? new Date(booking.endDate) : new Date('2099-12-31');

  // Check if booking's date range overlaps with the week
  const weekEnd = new Date(weekDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return bookingStart <= weekEnd && bookingEnd >= weekDate;
}

/**
 * Create a new booking
 */
function createBooking(booking, userEmail) {
  try {
    // Validate
    const validation = validateBooking(booking);
    if (!validation.valid) {
      return jsonResponse({ error: 'Validation failed', errors: validation.errors }, 400);
    }

    // Check permissions
    const user = getUserByEmail(userEmail);
    if (!user || !user.canCreate) {
      return jsonResponse({ error: 'Permission denied' }, 403);
    }

    // Get next ID
    const sheet = getSheet(CONFIG.SHEETS.BOOKINGS);
    const lastRow = sheet.getLastRow();
    const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;

    // Prepare row
    const now = new Date().toISOString();
    const row = [
      newId,
      booking.programName,
      booking.teacher,
      booking.programType,
      booking.location,
      booking.room || '',
      booking.scheduleType,
      JSON.stringify(booking.days || []),
      booking.date || '',
      booking.startTime,
      booking.endTime,
      booking.startDate,
      booking.endDate || '',
      booking.notes || '',
      userEmail,
      now,
      '',
      '',
      'active'
    ];

    // Append
    sheet.appendRow(row);

    booking.id = newId;
    booking.createdBy = userEmail;
    booking.createdAt = now;
    booking.status = 'active';

    return jsonResponse({
      success: true,
      booking: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    Logger.log('Error in createBooking: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Update an existing booking
 */
function updateBooking(booking, userEmail) {
  try {
    // Validate
    const validation = validateBooking(booking);
    if (!validation.valid) {
      return jsonResponse({ error: 'Validation failed', errors: validation.errors }, 400);
    }

    // Check permissions
    const user = getUserByEmail(userEmail);
    const existingBooking = getBookingById(booking.id);

    if (!canUserEditBooking(user, existingBooking)) {
      return jsonResponse({ error: 'Permission denied' }, 403);
    }

    // Find and update row
    const sheet = getSheet(CONFIG.SHEETS.BOOKINGS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === booking.id) {
        const now = new Date().toISOString();
        const row = [
          booking.id,
          booking.programName,
          booking.teacher,
          booking.programType,
          booking.location,
          booking.room || '',
          booking.scheduleType,
          JSON.stringify(booking.days || []),
          booking.date || '',
          booking.startTime,
          booking.endTime,
          booking.startDate,
          booking.endDate || '',
          booking.notes || '',
          data[i][14], // Keep original createdBy
          data[i][15], // Keep original createdAt
          userEmail,
          now,
          booking.status || 'active'
        ];

        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);

        booking.modifiedBy = userEmail;
        booking.modifiedAt = now;

        return jsonResponse({
          success: true,
          booking: booking,
          message: 'Booking updated successfully'
        });
      }
    }

    return jsonResponse({ error: 'Booking not found' }, 404);
  } catch (error) {
    Logger.log('Error in updateBooking: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Delete (cancel) a booking
 */
function deleteBooking(bookingId, userEmail) {
  try {
    // Check permissions
    const user = getUserByEmail(userEmail);
    const booking = getBookingById(bookingId);

    if (!canUserDeleteBooking(user, booking)) {
      return jsonResponse({ error: 'Permission denied' }, 403);
    }

    // Soft delete - mark as cancelled
    const sheet = getSheet(CONFIG.SHEETS.BOOKINGS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bookingId) {
        const now = new Date().toISOString();
        sheet.getRange(i + 1, 17).setValue(userEmail); // modifiedBy
        sheet.getRange(i + 1, 18).setValue(now); // modifiedAt
        sheet.getRange(i + 1, 19).setValue('cancelled'); // status

        return jsonResponse({
          success: true,
          message: 'Booking deleted successfully'
        });
      }
    }

    return jsonResponse({ error: 'Booking not found' }, 404);
  } catch (error) {
    Logger.log('Error in deleteBooking: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Get booking by ID
 */
function getBookingById(bookingId) {
  const sheet = getSheet(CONFIG.SHEETS.BOOKINGS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === bookingId) {
      return {
        id: data[i][0],
        programName: data[i][1],
        teacher: data[i][2],
        programType: data[i][3],
        location: data[i][4],
        room: data[i][5],
        scheduleType: data[i][6],
        days: data[i][7] ? JSON.parse(data[i][7]) : [],
        date: data[i][8],
        startTime: data[i][9],
        endTime: data[i][10],
        startDate: data[i][11],
        endDate: data[i][12],
        notes: data[i][13],
        createdBy: data[i][14],
        createdAt: data[i][15],
        modifiedBy: data[i][16],
        modifiedAt: data[i][17],
        status: data[i][18]
      };
    }
  }

  return null;
}

/**
 * Validate booking data
 */
function validateBooking(booking) {
  const errors = [];

  // Required fields
  if (!booking.programName) errors.push("Program name is required");
  if (!booking.teacher) errors.push("Teacher is required");
  if (!booking.programType) errors.push("Program type is required");
  if (!booking.location) errors.push("Location is required");
  if (!booking.scheduleType) errors.push("Schedule type is required");
  if (!booking.startTime) errors.push("Start time is required");
  if (!booking.endTime) errors.push("End time is required");
  if (!booking.startDate) errors.push("Start date is required");

  // Time validation
  if (booking.startTime && booking.endTime && booking.startTime >= booking.endTime) {
    errors.push("End time must be after start time");
  }

  // Schedule type validation
  if (booking.scheduleType === 'weekly' && (!booking.days || booking.days.length === 0)) {
    errors.push("Please select at least one day for recurring booking");
  }

  // Date validation
  if (booking.endDate && booking.startDate && booking.endDate < booking.startDate) {
    errors.push("End date must be after start date");
  }

  return { valid: errors.length === 0, errors: errors };
}
