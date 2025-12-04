# Update Apps Script to Fix CORS Issue

## The Problem
Your calendar is saving to localStorage instead of Google Sheets because:
- The Apps Script requires Google authentication for cross-origin requests
- This doesn't work well with fetch() from Netlify

## The Solution
Update your Apps Script to allow public access and redeploy.

---

## Step 1: Update Code.gs (2 minutes)

1. **Open Apps Script**
   - Go to your spreadsheet: https://docs.google.com/spreadsheets/d/1MiHog2QrFkhiObUBbwujO_T_sL3QU9lHqzR9-i1U2OQ/edit
   - Click **Extensions > Apps Script**

2. **Update Code.gs**
   - Open the `Code.gs` file
   - **Delete ALL the code**
   - Copy ALL the code from: `gak-calendar/gas/Code.gs`
   - Paste it into Apps Script
   - Click **Save** (💾 icon)

---

## Step 2: Add Public User to Users Sheet (1 minute)

1. **Go to Users sheet** in your spreadsheet
2. **Add a new row** at the bottom:
   ```
   public@gabrielsartkids.com | Public User | admin | TRUE | TRUE | TRUE | TRUE
   ```

   Or copy this row:
   | Email | Name | Role | Can Create | Can Edit All | Can Delete | Active |
   |-------|------|------|------------|--------------|------------|--------|
   | public@gabrielsartkids.com | Public User | admin | TRUE | TRUE | TRUE | TRUE |

---

## Step 3: Create New Deployment (3 minutes)

**IMPORTANT:** You need to create a NEW deployment with different settings.

1. Click **Deploy > New deployment**
2. Click the **⚙️ gear icon** next to "Select type"
3. Select **Web app**
4. Configure:
   - **Description**: `GAK Calendar API v2 - Public Access`
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ (NOT "Anyone with Google account")
5. Click **Deploy**
6. You might see a warning about "Anyone" - this is okay for internal tools
7. Click **Authorize access** if prompted
8. **Copy the new Web App URL**

---

## Step 4: Update config.js (1 minute)

You should already have the URL in config.js, but if you got a new URL:

1. Open: `gak-calendar/config.js`
2. Update `API_URL` with your new URL if it changed
3. Save the file

---

## Step 5: Test It! (1 minute)

1. Go to your Netlify site
2. Press **Ctrl + Shift + R** (hard refresh)
3. Open browser console (F12)
4. Look for: **✅ Connected to Google Sheets API**
5. Try creating a new booking
6. Check your Google Sheet - the booking should appear!

---

## Troubleshooting

### Still seeing localStorage?
- Make sure you did a hard refresh (Ctrl + Shift + R)
- Check console for error messages
- Make sure the API_URL in config.js is correct

### "User not found" error?
- Make sure you added `public@gabrielsartkids.com` to Users sheet
- Check spelling and that all columns are filled

### Still not working?
- Open browser console (F12)
- Share any error messages you see

---

## Why This Works

The original deployment required users to log in with Google, which doesn't work for cross-origin JavaScript requests. By deploying with "Anyone" access and using a default "public" user, the app can access the API without authentication issues.

**Security Note:** Since this is an internal tool for your team, having it publicly accessible is okay. If you need more security later, we can add API key authentication.
