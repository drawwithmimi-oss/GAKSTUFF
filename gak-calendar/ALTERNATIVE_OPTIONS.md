# Alternative: Use Google Sheets Public URL

Since Apps Script keeps giving 403 errors, here's a simpler approach:

## Option 1: Make Your Sheet Publicly Readable

1. **Open your spreadsheet**
2. **Click Share** (top right)
3. **Change "Restricted" to "Anyone with the link"**
4. **Set permission to "Viewer"**
5. **Copy the link**

Then we can use Google Sheets' public CSV export:
```
https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:json&sheet=Bookings
```

This gives us READ access without any authentication issues!

For WRITE access, we'd need to fix Apps Script OR use a different service.

---

## Option 2: Use a Free Backend Service

I can set up your calendar with:
- **Supabase** (free tier, very easy)
- **Firebase** (Google's service, simple)
- **Airtable** (spreadsheet + API in one)

These are specifically designed for web apps and don't have the CORS/authentication issues.

---

## What do you prefer?

1. **Keep trying Apps Script** (I can help you verify the deployment one more time)
2. **Use public Google Sheets for now** (read-only, but you can manually add bookings to the sheet)
3. **Switch to a proper backend service** (5-10 min setup, but will work perfectly)

Let me know and I'll help you set it up!
