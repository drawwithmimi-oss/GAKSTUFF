# Super Simple Setup - No Authentication

## Step 1: Update Apps Script (2 minutes)

1. **Open Apps Script**
   - Go to: https://docs.google.com/spreadsheets/d/1MiHog2QrFkhiObUBbwujO_T_sL3QU9lHqzR9-i1U2OQ/edit
   - Click: **Extensions > Apps Script**

2. **Replace ALL the code**
   - Click on `Code.gs` in the left sidebar
   - **Select ALL** (Ctrl+A) and **Delete**
   - Open the file: `gak-calendar/gas/Code-Simple.gs`
   - **Copy ALL the code**
   - **Paste** into Apps Script
   - Click **Save** (💾 icon)

3. **Delete other files (if they exist)**
   - If you see Bookings.gs, Conflicts.gs, or Users.gs in the left sidebar
   - Click the 3 dots next to each → Remove file
   - You only need Code.gs!

---

## Step 2: Deploy It (2 minutes)

1. **Click Deploy > New deployment**

2. **Click ⚙️ gear > Select "Web app"**

3. **Settings:**
   - Description: `Public Calendar`
   - Execute as: **Me (your email)**
   - Who has access: **Anyone** ⬅️ Critical!

4. **Click Deploy**

5. **Authorize** if prompted:
   - Click "Authorize access"
   - If you see "This app isn't verified" → Click "Advanced"
   - Click "Go to [project name] (unsafe)"
   - Click "Allow"

6. **Copy the Web App URL** and send it to me!

---

## What This Does

✅ No user authentication - anyone with the link can use it
✅ Everyone has full access (create, edit, delete)
✅ All bookings save to your Google Sheet
✅ Simple single-file setup

---

## That's It!

Once you deploy and send me the URL, I'll update your config and you're done! 🎉
