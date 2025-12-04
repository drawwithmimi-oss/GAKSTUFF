# Apps Script Deployment Checklist

## ⚠️ Current Status: Getting 403 Forbidden Errors

Your new deployment URL is returning 403 errors, which means it's still blocking public access.

---

## Quick Fix Steps

### 1. Check Your Deployment Settings (2 minutes)

1. Go to Apps Script: https://script.google.com
2. Open your GAK Calendar project
3. Click **Deploy > Manage deployments**
4. Look at your most recent deployment (the one ending in `...schUHFOmRjR1g`)
5. Click the **✏️ pencil icon** (Edit) next to it

**Check these settings:**
- ✅ **Execute as**: Me (your email)
- ✅ **Who has access**: **Anyone** (NOT "Anyone with Google account")

If it says "Anyone with Google account", that's the problem!

---

### 2. Fix the Access Setting

**Option A: Edit Current Deployment**
1. Click the **✏️ pencil icon** next to your deployment
2. Change "Who has access" to **Anyone**
3. Click **Deploy**
4. You may need to authorize again

**Option B: Create Fresh Deployment**
1. Click **Deploy > New deployment**
2. Click ⚙️ gear > Select **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone** ⬅️ This is critical!
4. Click **Deploy**
5. Copy the new URL and send it to me

---

### 3. Authorization Check

When you click Deploy, you might see:
- **"Authorize access"** button → Click it
- **"This app isn't verified"** warning → Click "Advanced" then "Go to [project name] (unsafe)"
- This is normal for personal scripts!

---

### 4. After Fixing

Once you've updated the deployment:
- The same URL should work (no need to update config.js)
- Wait 30 seconds for changes to take effect
- Tell me "done" and I'll test it again

---

## Common Mistakes

❌ **"Anyone with Google account"** - Requires users to log in (doesn't work with Netlify)
✅ **"Anyone"** - Allows public access (what we need)

❌ Skipping authorization when deploying
✅ Clicking through all authorization prompts

---

## Still Having Issues?

If you're stuck, send me a screenshot of:
1. The deployment settings screen (where you see "Who has access")
2. Any error messages you're seeing

I can help diagnose from there!
