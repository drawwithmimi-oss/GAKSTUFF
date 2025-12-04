# Gabriel's Art Kids - Calendar Booking System

A comprehensive calendar booking system for managing class schedules and location reservations across multiple Gabriel's Art Kids locations.

## 🎯 Overview

This system provides a user-friendly interface for:
- Viewing weekly schedules across multiple locations
- Creating recurring or one-time class bookings
- Detecting scheduling conflicts automatically
- Managing room assignments
- Tracking booking changes with full audit trail

## ✨ Features

### Core Features
- ✅ **Visual Weekly Calendar** - Easy-to-read week view with color-coded programs
- ✅ **Click-to-Book** - Click any day to create a new booking
- ✅ **Flexible Scheduling** - Weekly recurring, specific dates, or one-time bookings
- ✅ **Conflict Detection** - Automatically warns about overlapping bookings
- ✅ **Multi-Location Support** - Holly Street and D Street/DuPont tabs
- ✅ **Room Management** - Track specific rooms at each location
- ✅ **Mobile Responsive** - Works on phones, tablets, and desktops

### Advanced Features
- ✅ **Week Navigation** - Browse previous/next weeks easily
- ✅ **User Permissions** - Role-based access (Admin, Manager, Teacher, Viewer)
- ✅ **Audit Trail** - Track who created/modified each booking
- ✅ **Google Sheets Backend** - Centralized data in Google Sheets
- ✅ **Offline Mode** - Falls back to localStorage when Google Sheets unavailable

## 📁 Project Structure

```
gak-calendar/
├── index.html              # Main application (production-ready)
├── calendar.html           # Original prototype
├── config.js               # Configuration (API URL, settings)
├── js/
│   ├── api.js             # Google Sheets API client
│   ├── calendar.js        # Calendar rendering & navigation
│   ├── booking-form.js    # Booking form management
│   └── utils.js           # Utility functions
├── gas/                   # Google Apps Script backend
│   ├── Code.gs            # Main API handlers
│   ├── Bookings.gs        # CRUD operations
│   ├── Conflicts.gs       # Conflict detection logic
│   └── Users.gs           # User management & permissions
├── docs/
│   ├── SHEETS_SETUP.md    # Google Sheets setup guide
│   ├── DEPLOYMENT_GUIDE.md # Complete deployment instructions
│   └── DEVELOPER_HANDOFF.md # Original specification document
└── README.md              # This file
```

## 🚀 Quick Start

### For Development (Local Testing)

1. **Open the application**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```

2. **Test locally**
   - Uses localStorage by default (no Google Sheets needed)
   - Create, edit, delete bookings to test functionality
   - All features work offline

### For Production (Google Sheets Backend)

1. **Set up Google Sheets** (30 min)
   - Follow [`docs/SHEETS_SETUP.md`](./docs/SHEETS_SETUP.md)
   - Create spreadsheet with 4 sheets
   - Add users and configuration

2. **Deploy Google Apps Script** (20 min)
   - Copy all `.gs` files to Apps Script
   - Set script properties
   - Deploy as Web App
   - Get Web App URL

3. **Configure Frontend** (5 min)
   - Open `config.js`
   - Set `API_URL` to your Web App URL:
     ```javascript
     window.CONFIG = {
       API_URL: 'https://script.google.com/macros/s/YOUR_ID/exec'
     };
     ```

4. **Deploy**
   - Option A: Use Google Apps Script hosting (free)
   - Option B: Upload to your web server
   - See [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md) for details

## 📖 User Guide

### Creating a Booking

1. **Click "+ New Booking"** or click any day's "+ Add" button
2. **Fill out the form**:
   - Program/Class Name (e.g., "Pre-K Program")
   - Teacher/Instructor
   - Program Type (ECE, ASAP, Music, Adult, Off-site)
   - Location (Holly Street or D Street/DuPont)
   - Room (optional)
   - Schedule Type:
     - **Weekly Recurring**: Select days (Mon-Fri)
     - **Specific Dates**: Choose individual dates
     - **One-time**: Single occurrence
   - Start/End Times
   - Start/End Dates
   - Notes (optional)

3. **Click "Check Availability"** to detect conflicts
4. **Click "Save Booking"**

### Editing a Booking

1. **Click on any booking block** in the calendar
2. **Modify the fields** as needed
3. **Check availability** again if you changed time/location
4. **Click "Save Booking"** or "Delete" to remove

### Navigating the Calendar

- **Previous/Next Buttons**: Move between weeks
- **Today Button**: Jump to current week
- **Location Tabs**: Switch between Holly Street, D Street/DuPont, or All Locations
- **Week Title**: Shows current week's date range

### Understanding Conflicts

When you check availability, the system detects conflicts based on:
- ✓ Same location
- ✓ Same room (if specified)
- ✓ Overlapping days
- ✓ Overlapping times
- ✓ Overlapping date ranges

**Note**: Different rooms = No conflict

## 🎨 Program Type Colors

- 🟢 **Green** - ECE Programs
- 🔵 **Blue** - ASAP
- 🟡 **Yellow** - Music Programs
- 🔴 **Red** - Adult/Teen Classes
- ⚫ **Gray** - Off-site

## 👥 User Roles & Permissions

| Role | View | Create | Edit Own | Edit All | Delete |
|------|------|--------|----------|----------|--------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ✅ | ✅ | ✅ (program) | ❌ |
| **Teacher** | ✅ | ✅ | ✅ | ❌ | ✅ (own) |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |

## 📱 Mobile Support

The calendar is fully responsive and works on:
- iOS (Safari, Chrome)
- Android (Chrome, Firefox)
- Tablets (iPad, Android tablets)

**Mobile Tips**:
- Use landscape mode for best calendar view
- All buttons are touch-friendly (44px minimum)
- Forms scroll within the modal

## 🔧 Configuration Options

Edit `config.js` to customize:

```javascript
window.CONFIG = {
  API_URL: '',                    // Google Apps Script Web App URL
  DEFAULT_LOCATION: 'holly',      // Default location tab
  CACHE_DURATION: 300000,         // API cache duration (5 min)
  ENABLE_OFFLINE_MODE: true,      // Fallback to localStorage
  DEBUG: false                     // Enable console logging
};
```

## 🐛 Troubleshooting

### "Failed to load bookings"
- **Check**: Is `API_URL` set in `config.js`?
- **Verify**: Can you access the Web App URL in browser?
- **Test**: Visit `YOUR_URL?action=checkHealth`

### Conflicts not detecting
- **Review**: Check that bookings have correct location and times
- **Verify**: Different rooms should not conflict
- **Test**: Create two obviously overlapping bookings

### Mobile display issues
- **Clear**: Browser cache and reload
- **Check**: Viewport meta tag is present
- **Test**: Different mobile browsers

### Bookings disappearing
- **Verify**: Google Sheets permissions
- **Check**: Apps Script execution logs
- **Ensure**: User is authorized in Users sheet

## 📊 Data Structure

### Booking Object
```javascript
{
  id: 1,
  programName: "Pre-K Program",
  teacher: "Lisa",
  programType: "ece",
  location: "holly",
  room: "Upstairs Classroom",
  scheduleType: "weekly",
  days: ["mon", "wed", "fri"],
  startTime: "08:30",
  endTime: "15:00",
  startDate: "2024-09-01",
  endDate: "2025-06-15",
  notes: "Needs art supplies",
  createdBy: "mimi@gabrielsartkids.com",
  createdAt: "2024-12-04T10:30:00Z",
  status: "active"
}
```

## 🔒 Security & Privacy

- ✅ User authentication via Google OAuth
- ✅ Role-based access control
- ✅ Audit trail for all changes
- ✅ No public data exposure
- ✅ CORS protection

## 🚧 Development

### Prerequisites
- Google Workspace account
- Modern web browser
- Text editor (VS Code recommended)

### Local Development
```bash
# 1. Clone the repository
git clone https://github.com/drawwithmimi-oss/GAKSTUFF.git
cd GAKSTUFF/gak-calendar

# 2. Open in browser
open index.html

# 3. Make changes to JS/HTML files
# 4. Refresh browser to test
```

### Testing
- Create test bookings with different schedules
- Test conflict detection thoroughly
- Verify mobile responsiveness
- Check all user roles

### Deploying Updates
1. Test changes locally
2. Update Google Apps Script files
3. Deploy new version
4. Test live deployment
5. Notify users of changes

## 📚 Documentation

- [`SHEETS_SETUP.md`](./docs/SHEETS_SETUP.md) - Google Sheets setup instructions
- [`DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md) - Complete deployment walkthrough
- [`DEVELOPER_HANDOFF.md`](./docs/DEVELOPER_HANDOFF.md) - Full technical specification

## 🎯 Future Enhancements

### Phase 2 (Planned)
- [ ] Monthly calendar view
- [ ] Export to PDF/Print
- [ ] Email notifications
- [ ] Drag-and-drop booking changes
- [ ] Bulk booking creation
- [ ] Equipment tracking
- [ ] Analytics dashboard

### Phase 3 (Ideas)
- [ ] Mobile app (React Native)
- [ ] Integration with parent communication system
- [ ] Automatic reminder emails
- [ ] Room capacity tracking
- [ ] Attendance tracking

## 🤝 Support

For questions or issues:
- **Technical Support**: Check documentation first
- **Feature Requests**: Contact Mimi
- **Bugs**: Note the steps to reproduce and share screenshots

## 📝 License

Copyright © 2024 Gabriel's Art Kids. All rights reserved.

This software is for internal use only at Gabriel's Art Kids locations.

## 👏 Credits

**Developed for**: Gabriel's Art Kids
**Product Owner**: Manon (Mimi) Coutarel
**Version**: 1.0
**Last Updated**: December 4, 2024

---

## 🚀 Getting Started Checklist

- [ ] Read this README
- [ ] Follow `SHEETS_SETUP.md` to create Google Sheet
- [ ] Deploy Google Apps Script (copy `.gs` files)
- [ ] Get Web App URL and update `config.js`
- [ ] Add users to Users sheet
- [ ] Test creating a booking
- [ ] Test conflict detection
- [ ] Test on mobile device
- [ ] Train staff members
- [ ] Go live! 🎉

**Need help?** Contact mimi@gabrielsartkids.com

---

Made with ❤️ for Gabriel's Art Kids
