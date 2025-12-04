# Quick Apps Script Setup Guide

Your Spreadsheet ID: `1MiHog2QrFkhiObUBbwujO_T_sL3QU9lHqzR9-i1U2OQ`

## Step 1: Open Apps Script (1 minute)

1. In your spreadsheet: **Extensions > Apps Script**
2. You'll see a new tab with `Code.gs` file

## Step 2: Set Up Script Files (5 minutes)

### Delete Default Code First
1. In `Code.gs`, delete all the default code

### Create 4 Script Files

You need to copy 4 files from the `gas/` folder:

#### File 1: Code.gs
1. Stay in `Code.gs`
2. Copy ALL the code from: `gak-calendar/gas/Code.gs`
3. Paste it into the Apps Script editor

#### File 2: Bookings.gs
1. Click **+** next to Files
2. Select **Script**
3. Name it: `Bookings`
4. Copy ALL the code from: `gak-calendar/gas/Bookings.gs`
5. Paste it

#### File 3: Conflicts.gs
1. Click **+** again
2. Select **Script**
3. Name it: `Conflicts`
4. Copy ALL the code from: `gak-calendar/gas/Conflicts.gs`
5. Paste it

#### File 4: Users.gs
1. Click **+** again
2. Select **Script**
3. Name it: `Users`
4. Copy ALL the code from: `gak-calendar/gas/Users.gs`
5. Paste it

## Step 3: Set Script Property (2 minutes)

**CRITICAL - Don't skip this!**

1. Click the **⚙️ Settings** icon (Project Settings) on the left
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Add:
   - **Property**: `SHEET_ID`
   - **Value**: `1MiHog2QrFkhiObUBbwujO_T_sL3QU9lHqzR9-i1U2OQ`
5. Click **Save script property**

## Step 4: Deploy as Web App (3 minutes)

1. Click **Deploy > New deployment**
2. Click the **⚙️ gear icon** next to "Select type"
3. Select **Web app**
4. Configure:
   - **Description**: `GAK Calendar API v1`
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone with Google account**
     (or select "Only users in gabrielsartkids.com" if you have a Google Workspace domain)
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** > **Go to GAK Calendar (unsafe)** > **Allow**

## Step 5: Get Your Web App URL

After deployment, you'll see:
```
Web app URL: https://script.google.com/macros/s/ABC123xyz.../exec
```

**COPY THIS URL!** You'll need it for the next step.

## Step 6: Test the API (1 minute)

1. Copy your Web App URL
2. Open a new browser tab
3. Paste: `YOUR_WEB_APP_URL?action=checkHealth`
4. You should see: `{"status":"ok","timestamp":"..."}`

If you see that, **IT WORKS!** 🎉

## Step 7: Update Frontend Config (1 minute)

1. Open `gak-calendar/config.js`
2. Update the API_URL:
   ```javascript
   window.CONFIG = {
     API_URL: 'https://script.google.com/macros/s/YOUR_ID_HERE/exec',
     ...
   };
   ```
3. Save the file

## Step 8: Test the Calendar!

1. Open `gak-calendar/index.html` in your browser
2. You should see the calendar with your sample bookings!
3. Try creating a new booking
4. Test conflict detection

## Troubleshooting

### "ReferenceError: CONFIG is not defined"
- **Fix**: Make sure you set the SHEET_ID in Script Properties
- Go to Settings > Script Properties > Add `SHEET_ID`

### "User not found" error
- **Fix**: Add your email to the Users sheet in your spreadsheet
- Make sure the email matches exactly

### "Authorization required"
- **Fix**: Deploy again and authorize
- Deploy > Manage deployments > Edit > Re-authorize

### API returns error
- **Fix**: Check Executions log
- View > Executions to see error details

## Need the Code Files?

The 4 .gs files are in your project at:
```
gak-calendar/gas/
├── Code.gs
├── Bookings.gs
├── Conflicts.gs
└── Users.gs
```

Just copy and paste the content of each file!

## Next Steps After Setup

1. ✅ Apps Script deployed
2. ✅ API URL copied
3. 📝 Update config.js with your API URL
4. 📝 Open index.html to test
5. 🎉 Start using your calendar!

---

**Your Progress:**
- ✅ Created Google Spreadsheet
- ✅ Imported all 4 sheets
- ⏳ Setting up Apps Script (YOU ARE HERE!)
- ⏹️ Configure frontend
- ⏹️ Go live!

Good luck! 🚀
