/**
 * Conflicts.gs - Conflict detection logic
 */

/**
 * Check for scheduling conflicts
 */
function checkConflicts(newBooking) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.BOOKINGS);
    const data = sheet.getDataRange().getValues();

    const conflicts = [];

    // Check against all active bookings
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Skip cancelled bookings and self
      if (row[18] === 'cancelled') continue;
      if (newBooking.id && row[0] === newBooking.id) continue;

      const existingBooking = {
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
        status: row[18]
      };

      if (hasConflict(newBooking, existingBooking)) {
        conflicts.push({
          id: existingBooking.id,
          programName: existingBooking.programName,
          teacher: existingBooking.teacher,
          startTime: existingBooking.startTime,
          endTime: existingBooking.endTime,
          days: existingBooking.days,
          room: existingBooking.room
        });
      }
    }

    return jsonResponse({
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts
    });
  } catch (error) {
    Logger.log('Error in checkConflicts: ' + error.toString());
    return jsonResponse({ error: error.toString() }, 500);
  }
}

/**
 * Check if two bookings conflict
 * CONFLICT EXISTS IF ALL CONDITIONS ARE TRUE:
 * 1. Same location
 * 2. Same room (if both specified)
 * 3. Overlapping days
 * 4. Overlapping times
 * 5. Overlapping date ranges
 */
function hasConflict(booking1, booking2) {
  // Rule 1: Check location
  if (booking1.location !== booking2.location) {
    return false;
  }

  // Rule 2: Check room (if both have rooms specified)
  if (booking1.room && booking2.room) {
    if (booking1.room !== booking2.room) {
      return false;
    }
  }

  // Rule 3: Check day overlap
  if (!hasDayOverlap(booking1, booking2)) {
    return false;
  }

  // Rule 4: Check time overlap
  if (!hasTimeOverlap(booking1.startTime, booking1.endTime, booking2.startTime, booking2.endTime)) {
    return false;
  }

  // Rule 5: Check date range overlap
  if (!hasDateOverlap(booking1, booking2)) {
    return false;
  }

  // All rules passed = CONFLICT
  return true;
}

/**
 * Check if two bookings have overlapping days
 */
function hasDayOverlap(booking1, booking2) {
  // Weekly vs Weekly
  if (booking1.scheduleType === 'weekly' && booking2.scheduleType === 'weekly') {
    return booking1.days.some(day => booking2.days.includes(day));
  }

  // One-time vs Weekly
  if (booking1.scheduleType === 'onetime' && booking2.scheduleType === 'weekly') {
    const dayOfWeek = getDayOfWeek(booking1.date);
    return booking2.days.includes(dayOfWeek);
  }

  if (booking1.scheduleType === 'weekly' && booking2.scheduleType === 'onetime') {
    const dayOfWeek = getDayOfWeek(booking2.date);
    return booking1.days.includes(dayOfWeek);
  }

  // Both one-time
  if (booking1.scheduleType === 'onetime' && booking2.scheduleType === 'onetime') {
    return booking1.date === booking2.date;
  }

  // Specific dates handling
  if (booking1.scheduleType === 'specific' || booking2.scheduleType === 'specific') {
    // For simplicity, assume potential overlap
    return true;
  }

  return true;
}

/**
 * Get day of week from date (mon, tue, wed, thu, fri)
 */
function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[dayIndex];
}

/**
 * Check if two time ranges overlap
 */
function hasTimeOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Overlap occurs if: start1 < end2 AND end1 > start2
  return s1 < e2 && e1 > s2;
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(timeString) {
  // Handle both 24-hour format (HH:MM) and 12-hour format (HH:MM AM/PM)
  let time = timeString;

  // Convert 12-hour to 24-hour if needed
  if (timeString.includes('AM') || timeString.includes('PM')) {
    time = convertTo24Hour(timeString);
  }

  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  return hours * 60 + minutes;
}

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(time12) {
  const [time, modifier] = time12.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return hours.toString().padStart(2, '0') + ':' + minutes;
}

/**
 * Check if two date ranges overlap
 */
function hasDateOverlap(booking1, booking2) {
  const start1 = new Date(booking1.startDate);
  const end1 = booking1.endDate ? new Date(booking1.endDate) : new Date('2099-12-31');
  const start2 = new Date(booking2.startDate);
  const end2 = booking2.endDate ? new Date(booking2.endDate) : new Date('2099-12-31');

  // Overlap occurs if: start1 <= end2 AND end1 >= start2
  return start1 <= end2 && end1 >= start2;
}
