# Google Sheets Setup Guide

## Step 1: Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "GAK Calendar Bookings"
3. Note the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

## Step 2: Create the Sheets

Create 4 sheets with the following names and structures:

### Sheet 1: "Bookings"

**Headers (Row 1):**
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | programName | teacher | programType | location | room | scheduleType | days | date | startTime | endTime | startDate | endDate | notes | createdBy | createdAt | modifiedBy | modifiedAt | status |

**Column Details:**
- **id**: Number (auto-increment)
- **programName**: Text - "Pre-K Program", "Adult Art Class", etc.
- **teacher**: Text - "Lisa", "Gina", etc.
- **programType**: Text - "ece", "asap", "music", "adult", "offsite"
- **location**: Text - "holly", "dupont"
- **room**: Text - "Upstairs Classroom", "Orange Room", etc.
- **scheduleType**: Text - "weekly", "specific", "onetime"
- **days**: Text (JSON array) - `["mon","wed","fri"]`
- **date**: Date - For one-time or specific bookings
- **startTime**: Text - "08:30" (24-hour format)
- **endTime**: Text - "15:00" (24-hour format)
- **startDate**: Date - First occurrence date
- **endDate**: Date - Last occurrence date (optional)
- **notes**: Text - Additional information
- **createdBy**: Email - User who created
- **createdAt**: Timestamp - When created
- **modifiedBy**: Email - Last editor
- **modifiedAt**: Timestamp - When last modified
- **status**: Text - "active", "cancelled", "completed"

### Sheet 2: "Locations"

**Headers (Row 1):**
| A | B | C | D |
|---|---|---|---|
| location_id | location_name | rooms | active |

**Sample Data:**
```
Row 2: holly | Holly Street | ["Upstairs Classroom","Downstairs Space"] | TRUE
Row 3: dupont | D Street/DuPont | ["Orange Room","Green Room","Great Room","Stage Area","Cubby Room"] | TRUE
```

### Sheet 3: "Program_Types"

**Headers (Row 1):**
| A | B | C | D |
|---|---|---|---|
| type_id | type_name | color_code | active |

**Sample Data:**
```
Row 2: ece | ECE Programs | #28a745 | TRUE
Row 3: asap | ASAP | #17a2b8 | TRUE
Row 4: music | Music Programs | #ffc107 | TRUE
Row 5: adult | Adult/Teen Classes | #dc3545 | TRUE
Row 6: offsite | Off-site | #6c757d | TRUE
```

### Sheet 4: "Users"

**Headers (Row 1):**
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| email | name | role | can_create | can_edit_all | can_delete | active |

**Sample Data (UPDATE WITH YOUR EMAILS):**
```
Row 2: mimi@gabrielsartkids.com | Mimi | admin | TRUE | TRUE | TRUE | TRUE
Row 3: amanda@gabrielsartkids.com | Amanda | manager | TRUE | TRUE | FALSE | TRUE
Row 4: lisa@gabrielsartkids.com | Lisa | teacher | TRUE | FALSE | FALSE | TRUE
```

**Role Types:**
- **admin**: Full access (Mimi, Gabriel)
- **manager**: Program leads (Amanda, Meredith, Trin)
- **teacher**: Can create own bookings only
- **viewer**: Read-only access

## Step 3: Configure Google Apps Script

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Delete the default `Code.gs` file content
3. Create the following files in Apps Script:

### File 1: Code.gs
Copy content from `/gas/Code.gs`

### File 2: Bookings.gs
Create new file: Click **+** > Script file > Name it "Bookings"
Copy content from `/gas/Bookings.gs`

### File 3: Conflicts.gs
Create new file: Click **+** > Script file > Name it "Conflicts"
Copy content from `/gas/Conflicts.gs`

### File 4: Users.gs
Create new file: Click **+** > Script file > Name it "Users"
Copy content from `/gas/Users.gs`

## Step 4: Set Script Properties

1. In Apps Script, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property**
4. Add property:
   - **Property**: `SHEET_ID`
   - **Value**: Your spreadsheet ID from Step 1

## Step 5: Deploy as Web App

1. In Apps Script, click **Deploy > New deployment**
2. Click **Select type > Web app**
3. Configure:
   - **Description**: GAK Calendar API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone with Google account
4. Click **Deploy**
5. **IMPORTANT**: Copy the Web App URL - you'll need this for the frontend

## Step 6: Test the API

1. In Apps Script, select `doGet` function from dropdown
2. Click **Run**
3. Authorize the script (first time only)
4. Check **Execution log** - should see no errors

Test with browser:
```
WEB_APP_URL?action=checkHealth
```

Should return:
```json
{"status":"ok","timestamp":"2024-12-04..."}
```

## Step 7: Authorize Users

Add users to the **Users** sheet with their actual Gabriel's Art Kids email addresses.

## Troubleshooting

### "Reference Error: CONFIG is not defined"
- Make sure all `.gs` files are saved
- Click **Run** on `doGet` function to initialize

### "Cannot find function getSheet"
- Ensure `Code.gs` is saved with the `getSheet()` function

### "Permission denied"
- Check that you're logged in with the correct Google account
- Verify authorization in Apps Script

### "User not found"
- Add your email to the Users sheet
- Check email spelling matches exactly

## Next Steps

After setup is complete:
1. Add sample bookings to test
2. Configure the frontend with your Web App URL
3. Test conflict detection
4. Train users

## Security Notes

- Never share the Web App URL publicly
- Only add trusted users to the Users sheet
- Regularly review audit logs (createdBy/modifiedBy columns)
- Consider restricting "Who has access" to specific domain only
