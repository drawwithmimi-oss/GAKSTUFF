# Google Sheets Import Instructions

Follow these steps to create your GAK Calendar Google Sheets database.

## Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it: **GAK Calendar Bookings**
4. **IMPORTANT**: Note the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   You'll need this ID later!

## Step 2: Create the Sheets

You need to create 4 separate sheets (tabs) in your spreadsheet.

### Sheet 1: Bookings

1. **Rename** the default "Sheet1" to **Bookings**
2. Click **File > Import > Upload**
3. Upload `1_Bookings.csv`
4. **Import settings**:
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
   - Convert text to numbers: **Yes**
5. Click **Import data**

### Sheet 2: Locations

1. Click the **+** button to add a new sheet
2. Name it **Locations**
3. Click **File > Import > Upload**
4. Upload `2_Locations.csv`
5. **Import settings**:
   - Import location: **Replace current sheet**
   - Separator type: **Comma**
6. Click **Import data**

### Sheet 3: Program_Types

1. Add another new sheet **+**
2. Name it **Program_Types**
3. Import `3_Program_Types.csv` (same process as above)

### Sheet 4: Users

1. Add one more new sheet **+**
2. Name it **Users**
3. Import `4_Users.csv`
4. **IMPORTANT**: Update the email addresses with your actual staff emails!

## Step 3: Verify the Data

Check each sheet:

### ✅ Bookings Sheet
- Should have 19 columns (A-S)
- Should have 11 sample bookings
- Headers: id, programName, teacher, programType, location, room, scheduleType, days, date, startTime, endTime, startDate, endDate, notes, createdBy, createdAt, modifiedBy, modifiedAt, status

### ✅ Locations Sheet
- Should have 4 columns (A-D)
- Should have 2 locations (holly, dupont)
- Headers: location_id, location_name, rooms, active

### ✅ Program_Types Sheet
- Should have 4 columns (A-D)
- Should have 5 program types
- Headers: type_id, type_name, color_code, active

### ✅ Users Sheet
- Should have 7 columns (A-G)
- Should have your staff members
- Headers: email, name, role, can_create, can_edit_all, can_delete, active

## Step 4: Update User Emails

**CRITICAL**: Replace demo emails with real emails!

1. Go to the **Users** sheet
2. Update each email in column A:
   ```
   OLD: mimi@gabrielsartkids.com
   NEW: [actual Mimi's email]
   ```
3. Add or remove users as needed
4. Keep the same format:
   - **Admin**: Full access
   - **Manager**: Can edit their program
   - **Teacher**: Can edit their own bookings
   - **Viewer**: Read-only

## Step 5: Format the Sheets (Optional but Recommended)

### Make headers bold:
1. Select row 1 in each sheet
2. Click **Bold** (Ctrl+B / Cmd+B)
3. Add background color: Light gray
4. Center align

### Freeze header rows:
1. Click **View > Freeze > 1 row** in each sheet

### Set column widths:
- Auto-resize: Select all columns → Double-click column border

## Step 6: Share Settings

1. Click **Share** button (top right)
2. **General access**: Restricted
3. Add specific people:
   - Add your Google Apps Script service account (if needed)
   - Add yourself (admin access)

## Step 7: Get Your Spreadsheet ID

1. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123xyz-EXAMPLE-ID/edit
                                      ^^^^^^^^^^^^^^^^^^^
                                      This is your ID!
   ```
2. **Copy this ID** - you'll need it for:
   - Google Apps Script setup
   - Configuration

## Sample Data Included

The CSV files include sample bookings from the specification:

**Holly Street**:
- Pre-K Program (Mon-Fri, 8:30-3:00)
- Toddler Music (Mon/Wed/Fri mornings)
- Adult Art Class (Tue/Thu mornings)
- Teen Art Class (Tue evenings)

**D Street/DuPont**:
- ASAP Program (Mon-Fri, 8:30-3:00)
- ASAP After School (Mon-Fri, 4:00-5:30)
- Ceramics Classes (Tue/Thu evenings)

## Troubleshooting

### Import fails with "Error: Could not parse CSV"
- **Fix**: Make sure you selected "Comma" as separator
- Try: Open the CSV in a text editor and copy/paste directly

### Columns look weird
- **Fix**: Select all → Format > Number > Automatic
- Adjust column widths manually

### Can't see all sheets
- **Fix**: Scroll the sheet tabs at the bottom
- All 4 should be visible: Bookings, Locations, Program_Types, Users

### TRUE/FALSE shows as text
- **Fix**: That's okay! Google Sheets will interpret them correctly

## Next Steps

After importing:

1. ✅ Verify all 4 sheets are created
2. ✅ Update user emails
3. ✅ Note your Spreadsheet ID
4. 📝 Proceed to Google Apps Script setup
5. 📝 Follow `../docs/SHEETS_SETUP.md` for Apps Script configuration

## Quick Reference

**Sheet Names** (must be exactly these):
- `Bookings`
- `Locations`
- `Program_Types`
- `Users`

**Files to Import**:
- `1_Bookings.csv` → Bookings sheet
- `2_Locations.csv` → Locations sheet
- `3_Program_Types.csv` → Program_Types sheet
- `4_Users.csv` → Users sheet

---

## Need Help?

If you run into issues:
1. Check that sheet names are exact (case-sensitive)
2. Verify all columns imported correctly
3. Make sure TRUE/FALSE values are present
4. Ensure emails are updated in Users sheet

Contact: mimi@gabrielsartkids.com

---

**Time Required**: 15-20 minutes
**Difficulty**: Easy (just importing CSVs!)
