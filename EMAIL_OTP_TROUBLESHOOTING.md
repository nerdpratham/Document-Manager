# Email OTP Verification - Troubleshooting Guide

## Possible Problems and Solutions

### 1. **Missing Environment Variables** ⚠️ (MOST COMMON)

**Problem:** `EMAIL_USER` and `EMAIL_PASS` are not set in your `.env` file.

**Solution:**
1. Create a `.env` file in the `backend` directory (if it doesn't exist)
2. Add the following variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
3. **Important:** For Gmail, you MUST use an App Password, not your regular password!

---

### 2. **Gmail App Password Not Configured** 🔐

**Problem:** Using Gmail with regular password won't work. Gmail requires App Passwords for third-party applications.

**Solution:**
1. **Enable 2-Step Verification** on your Google account:
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter a name like "NoticeBoard App"
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **Use the App Password in `.env`**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  (the 16-character app password)
   ```

---

### 3. **Gmail Security Settings** 🛡️

**Problem:** Gmail might be blocking the authentication attempt.

**Check:**
- Make sure 2-Step Verification is enabled
- Verify you're using an App Password (not regular password)
- Check if your account has any security alerts

---

### 4. **Environment Variables Not Loading** 📝

**Problem:** The `.env` file exists but variables aren't being loaded.

**Solution:**
1. Make sure `dotenv` is installed: `npm install dotenv`
2. Verify `require('dotenv').config()` is called in `backend/index.js` (it should be at the top)
3. Restart your backend server after changing `.env` file
4. Check that `.env` is in the `backend` directory (same level as `index.js`)

---

### 5. **Email Service Provider Issues** 📧

**Problem:** If not using Gmail, the nodemailer configuration might need adjustment.

**For other email providers:**
- Update the `service` in `backend/routes/index.js`
- Or use SMTP configuration instead:
  ```javascript
  const transporter = nodemailer.createTransport({
      host: 'smtp.your-provider.com',
      port: 587,
      secure: false,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
      }
  });
  ```

---

### 6. **Network/Firewall Issues** 🌐

**Problem:** Server cannot connect to Gmail SMTP servers.

**Check:**
- Firewall settings
- Network connectivity
- If using a VPN, try disabling it

---

## How to Test

1. **Check Backend Logs:**
   - When you start the server, you should see:
     - `✅ Email transporter is ready to send emails` (if configured correctly)
     - `❌ Email transporter verification failed:` (if there's an issue)

2. **Test the Endpoint:**
   - Use Postman or curl to test:
     ```bash
     POST http://localhost:3000/api/v1/send-verification-email
     Body: { "email": "test@example.com" }
     ```

3. **Check Console Errors:**
   - Look at your backend console for detailed error messages
   - The improved error handling will show specific issues

---

## Quick Checklist ✅

- [ ] `.env` file exists in `backend` directory
- [ ] `EMAIL_USER` is set in `.env`
- [ ] `EMAIL_PASS` is set in `.env` (App Password for Gmail)
- [ ] 2-Step Verification is enabled on Gmail account
- [ ] App Password is generated and used (not regular password)
- [ ] Backend server has been restarted after `.env` changes
- [ ] `dotenv` package is installed
- [ ] Check backend console for transporter verification message

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `EAUTH` | Authentication failed | Check EMAIL_USER and EMAIL_PASS, use App Password for Gmail |
| `ECONNECTION` | Cannot connect to server | Check network/firewall settings |
| `Email service is not configured` | Environment variables missing | Add EMAIL_USER and EMAIL_PASS to .env |

---

## Need More Help?

Check the backend console logs when you try to send an email. The improved error handling will provide specific error messages to help identify the exact issue.
