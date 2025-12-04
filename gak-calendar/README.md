# GAK Calendar Booking System

A single-file HTML calendar booking system for Gabriel's Art Kids (GAK) to manage class schedules and location reservations.

## Features

- **Two Location Views**: Holly Street and D Street/DuPont
- **Interactive Calendar**: Click any day to add bookings
- **Color-Coded Programs**: ECE, ASAP, Music, Adult/Teen, Off-site
- **Conflict Detection**: Checks for scheduling overlaps before saving
- **Recurring Bookings**: Support for weekly recurring, specific dates, or one-time bookings
- **Room Management**: Track specific rooms at each location
- **Local Storage**: Currently saves bookings in browser localStorage
- **Mobile Responsive**: Works on phones, tablets, and desktops

## Current Status

✅ **Complete single-file solution** - Ready to host on any website
✅ **Sample data included** - Holly Street and DuPont calendars pre-populated
✅ **Full CRUD operations** - Create, Read, Update, Delete bookings
📋 **Uses localStorage** - Data persists in browser

## Future Enhancement: Google Sheets Integration

To connect this calendar to Google Sheets for centralized data management:

### Option 1: Google Apps Script Web App
- Create a Google Sheet with columns: ID, Program Name, Teacher, Type, Location, Room, Days, Start Time, End Time, etc.
- Write a Google Apps Script to expose the sheet as a REST API
- Replace localStorage functions with fetch() calls to the Apps Script endpoint

### Option 2: Google Sheets API
- Set up Google Sheets API authentication
- Use the Sheets API v4 to read/write booking data
- Requires API key or OAuth setup

### Option 3: Third-party Services
- Use services like Zapier, Make (Integromat), or SheetDB to create a bridge between the HTML and Google Sheets

## Usage

1. Open `calendar.html` in any modern web browser
2. Click the "+ New Booking" button or click "+ Add" on any day
3. Fill in the booking details
4. Click "Check Availability" to detect conflicts
5. Click "Save Booking" to store the booking
6. Click on any booking to edit or delete it

## Deployment

To host on your website:
1. Upload `calendar.html` to your web server
2. Access it via: `https://yourwebsite.com/calendar.html`
3. No server-side requirements - runs entirely in the browser!

## Data Structure

Bookings are stored with the following fields:
- Program Name, Teacher, Type (ece/asap/music/adult/offsite)
- Location (holly/dupont), Room
- Schedule Type (weekly/specific/onetime)
- Days of Week, Start/End Times, Start/End Dates
- Notes

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)
