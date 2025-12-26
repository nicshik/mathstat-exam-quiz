# FAQ - Feedback Feature

## General Questions

### Q: Can students see their feedback history?
**A:** No, the current implementation is anonymous one-way feedback. Students submit, you receive the email. Consider adding a feedback dashboard in future versions if needed.

### Q: Can I customize the email recipient?
**A:** Yes! Set `RECIPIENT_EMAIL` in `.env` file to any email address. Currently defaults to shikhirev.nn@phystech.edu.

### Q: Is feedback moderated before sending to email?
**A:** No, all feedback goes directly to your email. Consider adding a review step if you expect inappropriate content.

### Q: Can multiple people receive feedback emails?
**A:** Not yet, but you can:
1. Forward emails from your Gmail to another address
2. Use Gmail forwarding rules
3. Use a team email address that multiple people access

## Technical Questions

### Q: What if Gmail gives a "password incorrect" error?
**A:** Most common cause: You're using your Gmail password instead of the App Password.

**Solution:**
```
1. Go to https://myaccount.google.com/apppasswords
2. Make sure 2FA is enabled first
3. Generate a NEW app password
4. Copy the full 16-character password (with spaces!)
5. Update .env file
6. Restart server
```

### Q: Can I test email sending locally?
**A:** Yes!

```bash
# Run server
npm run dev

# In another terminal, test with curl:
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "1",
    "questionText": "Test question?",
    "userAnswer": "A. Wrong",
    "correctAnswer": "B. Right",
    "description": "This is a test",
    "timestamp": "2025-12-26T08:00:00Z",
    "userAgent": "curl/test"
  }'
```

### Q: Why does the modal sometimes not show?
**A:** Check these:
1. JavaScript errors in console (F12 > Console)
2. Feedback function being called (add `console.log`)
3. Modal HTML exists in index.html
4. CSS not hiding the modal (check modal-overlay style)

### Q: Can I change the email subject line?
**A:** Yes, in `server.js` line:
```javascript
subject: `[Mathstat Quiz] Task ${taskId} Feedback`
```

Change to whatever you want:
```javascript
subject: `New Feedback from Quiz: Task ${taskId}`
```

### Q: How do I add more information to the email?
**A:** Edit `server.js` email template. Add fields to:
1. HTML content: `htmlContent`
2. Text content: `textContent`
3. In `app.js`, add field to `feedbackPayload`

## Deployment Questions

### Q: Can I deploy without backend (just frontend)?
**A:** No, email requires backend. However, you could:
1. Use third-party service (Firebase, Zapier)
2. Use Google Forms instead
3. Use email service API (SendGrid, Mailgun)

### Q: What's the cheapest deployment option?
**A:** Free options:
- **Heroku**: Free tier (may sleep after inactivity)
- **Railway**: Free tier with generous limits
- **Render**: Free tier
- **Glitch**: Free community projects
- **GitHub Pages** (frontend) + cloud function (backend)

Total email cost: $0 with Gmail's free tier

### Q: Can I use a different email provider instead of Gmail?
**A:** Yes! Nodemailer supports many providers:

```javascript
// Yahoo Mail
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-yahoo@yahoo.com',
    pass: 'app-password'
  }
});

// Outlook/Office365
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  auth: {
    user: 'your-email@outlook.com',
    pass: 'password'
  }
});
```

### Q: How do I set up HTTPS for production?
**A:** Most platforms handle this automatically:
- **Heroku**: Free HTTPS
- **Railway**: Free HTTPS
- **Vercel**: Free HTTPS

If self-hosted, use Let's Encrypt:
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

## Troubleshooting

### Q: "Cannot find module 'express'"
**A:** Run `npm install` in project directory.

### Q: "CORS error in browser console"
**A:** This means frontend and backend on different domains.
- Make sure backend is running
- Make sure you're accessing from same domain
- In production, ensure CORS is configured

### Q: "Email service not ready" on startup
**A:** Gmail credentials invalid. Check:
1. `EMAIL_USER` is correct Gmail address
2. `EMAIL_PASSWORD` is 16-char App Password (not Gmail password)
3. 2FA is enabled
4. Credentials have no typos

### Q: Emails going to spam folder
**A:**
1. White-list your email in contacts
2. Move one email to inbox and mark as "not spam"
3. Check Gmail forwarding isn't blocking them
4. Verify sender address is your Gmail

## Performance Questions

### Q: How many feedback submissions can the system handle?
**A:** Realistically:
- **Local machine**: 10-20 per minute
- **Small server**: 100+ per minute
- **Production setup**: 1000+ per minute

Gmail rate limits: ~300 emails per day per account
For more, use commercial email service.

### Q: Does sending email slow down the quiz?
**A:** No, it's async. Student sees success message while email sends in background.

### Q: Should I worry about database storage?
**A:** Currently, emails are only stored in your email inbox. No database needed. If you want to store feedback locally later, add a simple JSON file or database.

## Feature Questions

### Q: Can I add categories to feedback (bug/typo/unclear)?
**A:** Yes! Add a select dropdown in the modal:

```html
<select id="feedback-category" required>
  <option>-- Select category --</option>
  <option value="typo">Typo</option>
  <option value="unclear">Unclear</option>
  <option value="wrong_answer">Wrong Answer</option>
  <option value="other">Other</option>
</select>
```

Then include in feedback payload:
```javascript
category: document.getElementById('feedback-category').value
```

### Q: Can I let students optionally provide their email?
**A:** Yes, add an optional email field in modal. Then use it to send confirmation:

```javascript
if (studentEmail) {
  // Send confirmation to student
  // Send feedback to you
}
```

### Q: Can I rate-limit feedback (e.g., 1 per question max)?
**A:** Yes, track which questions user already submitted feedback for:

```javascript
let feedbackSubmitted = {}; // Track submitted questions

// Before opening modal:
if (feedbackSubmitted[questionId]) {
  alert('Already submitted feedback for this question');
  return;
}

// After submit:
feedbackSubmitted[questionId] = true;
```

## Data Privacy

### Q: What data is collected?
**A:** Only:
- Task number
- Question text
- Student's answer
- Correct answer
- Feedback description
- Timestamp
- User Agent (browser info)

NO:
- Student names/emails
- IP addresses
- Location data
- Cookies
- Third-party tracking

### Q: Can students be identified?
**A:** No, feedback is completely anonymous. You only know:
- When they submitted
- What they said
- Nothing else

### Q: Where is data stored?
**A:** Only in your email inbox (Gmail or other provider). No third-party storage by default.

## Next Steps

1. Read `QUICK_START.md` for 5-minute setup
2. Read `FEEDBACK_FEATURE.md` for detailed docs
3. Test locally: `npm run dev`
4. Deploy to production (Heroku/Railway)
5. Share link with students
6. Check feedback in your email

## Still Have Questions?

Check these files in order:
1. `QUICK_START.md` - Quick setup guide
2. `FEEDBACK_FEATURE.md` - Detailed documentation
3. `IMPLEMENTATION_SUMMARY.md` - Technical details
4. GitHub Issues - Search for similar problems

Or create a GitHub Issue describing your problem!
