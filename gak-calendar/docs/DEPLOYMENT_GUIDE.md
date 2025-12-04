# GAK Calendar - Complete Deployment Guide

This guide will walk you through deploying the Gabriel's Art Kids Calendar Booking System from development to production.

## 📋 Prerequisites

- Google Workspace account (gabrielsartkids.com domain)
- Access to Google Sheets and Google Apps Script
- Web hosting (optional - can use Google Apps Script hosting)

## 🚀 Deployment Steps

### Step 1: Set Up Google Sheets (30 minutes)

Follow the instructions in [`SHEETS_SETUP.md`](./SHEETS_SETUP.md) to:
1. Create the spreadsheet
2. Set up the 4 sheets (Bookings, Locations, Program_Types, Users)
3. Add sample data

### Step 2: Deploy Google Apps Script (20 minutes)

1. **Open Apps Script**
   - In your Google Sheet: Extensions > Apps Script

2. **Copy Backend Code**
   - Delete default `Code.gs` content
   - Create 4 script files:
     - `Code.gs` - Copy from `/gas/Code.gs`
     - `Bookings.gs` - Copy from `/gas/Bookings.gs`
     - `Conflicts.gs` - Copy from `/gas/Conflicts.gs`
     - `Users.gs` - Copy from `/gas/Users.gs`

3. **Set Script Properties**
   - Click **Project Settings** (gear icon)
   - Add Script Property:
     - Property: `SHEET_ID`
     - Value: Your spreadsheet ID

4. **Deploy as Web App**
   - Click **Deploy > New deployment**
   - Select type: **Web app**
   - Settings:
     - Description: `GAK Calendar API v1`
     - Execute as: **Me**
     - Who has access: **Anyone with Google account** (or your specific domain)
   - Click **Deploy**
   - **IMPORTANT**: Copy the Web App URL

5. **Test the Deployment**
   ```
   Visit: YOUR_WEB_APP_URL?action=checkHealth
   Should return: {"status":"ok","timestamp":"..."}
   ```

### Step 3: Configure Frontend (10 minutes)

1. **Open `config.js`**
   ```javascript
   window.CONFIG = {
     API_URL: 'YOUR_WEB_APP_URL_HERE',  // Paste the URL from Step 2
     ...
   };
   ```

2. **Test Locally**
   - Open `index.html` in a web browser
   - You should see the calendar load
   - Try creating a test booking

### Step 4: Deploy Frontend (Choose One Option)

#### Option A: Use Google Apps Script HTML Service (Recommended - Free!)

1. In Apps Script, create a new HTML file:
   - Click **+** > HTML file > Name it `index`

2. Copy the contents of your `index.html` into this file

3. Update `Code.gs` to serve the HTML:
   ```javascript
   function doGet(e) {
     // If no action parameter, serve the web app
     if (!e.parameter.action) {
       return HtmlService.createHtmlOutputFromFile('index')
         .setTitle('GAK Calendar')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
     }

     // Otherwise handle API requests
     return handleAPIRequest(e);
   }
   ```

4. Deploy again (new version)

5. **Access your app**: Visit the Web App URL (without ?action parameter)

#### Option B: Host on Your Website

1. Upload these files to your web server:
   ```
   /calendar/
   ├── index.html
   ├── config.js
   ├── js/
   │   ├── api.js
   │   ├── calendar.js
   │   ├── booking-form.js
   │   └── utils.js
   └── css/
       └── styles.css (if separated)
   ```

2. Update CORS settings in `Code.gs`:
   ```javascript
   const CONFIG = {
     ALLOWED_ORIGINS: [
       'https://yourwebsite.com',
       'https://www.yourwebsite.com'
     ]
   };
   ```

3. Access: `https://yourwebsite.com/calendar/index.html`

### Step 5: Add Users (15 minutes)

1. Open your Google Sheet
2. Go to the **Users** tab
3. Add all staff members:
   ```
   email                        | name   | role    | can_create | can_edit_all | can_delete | active
   mimi@gabrielsartkids.com    | Mimi   | admin   | TRUE       | TRUE         | TRUE       | TRUE
   amanda@gabrielsartkids.com  | Amanda | manager | TRUE       | TRUE         | FALSE      | TRUE
   lisa@gabrielsartkids.com    | Lisa   | teacher | TRUE       | FALSE        | FALSE      | TRUE
   ```

### Step 6: Initial Data Migration (30 minutes)

If you have existing schedule data:

1. **Format your data** to match the Bookings sheet structure
2. **Import to Google Sheets**:
   - Open your Bookings sheet
   - File > Import > Upload your CSV
   - Choose "Append to current sheet"

3. **Verify data**:
   - Check that all bookings have:
     - Valid `programType` (ece, asap, music, adult, offsite)
     - Valid `location` (holly, dupont)
     - Valid `scheduleType` (weekly, specific, onetime)
     - Correct date formats

### Step 7: User Training (30 minutes)

1. **Schedule a training session** with all users
2. **Cover these topics**:
   - How to view the calendar
   - Creating a new booking
   - Editing existing bookings
   - Understanding conflict warnings
   - Deleting bookings
   - Mobile usage

3. **Provide quick reference guide** (create from README)

### Step 8: Go Live! 🎉

1. **Announce to all staff**
   - Share the Web App URL
   - Remind everyone to use Chrome/Firefox/Safari
   - Encourage mobile bookmarking

2. **Monitor for issues**
   - Check Google Apps Script logs daily for first week
   - Be available for questions

3. **Collect feedback**
   - Create a feedback form
   - Make improvements based on user input

## 🔧 Post-Deployment Configuration

### Enable Email Notifications (Optional)

Add to `Bookings.gs`:

```javascript
function sendNotification(booking, action) {
  const subject = `Booking ${action}: ${booking.programName}`;
  const body = `
    Program: ${booking.programName}
    Teacher: ${booking.teacher}
    Location: ${booking.location}
    Time: ${booking.startTime} - ${booking.endTime}
    ${action} by: ${booking.createdBy}
  `;

  // Send to relevant people
  MailApp.sendEmail('mimi@gabrielsartkids.com', subject, body);
}
```

### Set Up Automatic Backups

1. In Google Sheets: File > Version history > See version history
2. Set up daily backups:
   - Tools > Script editor
   - Add trigger: Time-driven, Day timer

### Monitor Usage

Add analytics to track:
- Number of bookings created
- Most active users
- Conflict frequency
- Peak usage times

## 🐛 Troubleshooting

### "Script function not found"
- **Solution**: Make sure all `.gs` files are saved
- Run `doGet` function once to initialize

### "User not authenticated"
- **Solution**: User needs to visit the Web App URL while logged into Google
- Check Users sheet for their email

### "Booking not saving"
- **Check**: Google Apps Script logs (View > Executions)
- **Verify**: Script has permission to edit the sheet
- **Test**: Try creating booking directly in sheet

### "Conflicts not detecting properly"
- **Review**: Conflict detection logic in `Conflicts.gs`
- **Test**: Create two obviously conflicting bookings
- **Debug**: Add logging to `hasConflict()` function

### "Mobile not working"
- **Check**: Responsive CSS is loaded
- **Test**: Different mobile browsers
- **Fix**: Ensure viewport meta tag is present

## 📊 Success Metrics

After 2 weeks, measure:
- [ ] 90%+ user adoption
- [ ] Zero double-bookings reported
- [ ] <5% error rate
- [ ] Positive user feedback

## 🔄 Update Process

To deploy updates:

1. **Test locally** with development data
2. **Deploy new version** in Apps Script
3. **Test web app** before announcing
4. **Notify users** of new features
5. **Monitor** for issues

## 📞 Support

For issues:
- **Technical**: Check Apps Script execution logs
- **User questions**: Refer to user guide
- **Feature requests**: Document for future development

## 🎯 Next Steps

After successful deployment:
- [ ] Set up weekly review of bookings
- [ ] Plan Phase 2 features (monthly view, exports)
- [ ] Collect user feedback
- [ ] Document lessons learned

---

**Congratulations! Your GAK Calendar is now live!** 🎉

For questions or issues, contact: mimi@gabrielsartkids.com
