# Feedback Feature Documentation

## Overview

The Mathstat Quiz now includes a feedback system that allows students to report inaccuracies in questions and answers. When a student gets a question wrong, they can click "Сообщить о неточности" (Report an inaccuracy) to submit feedback directly via email.

## Features

- **Feedback Modal**: A clean modal dialog appears when students click the feedback link
- **Context Preservation**: The modal displays the question, student's answer, and correct answer for context
- **Email Notification**: Feedback is sent to your email with full question details and timestamp
- **Anonymous Submission**: Students don't need to provide their name or email
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Frontend

**Files Modified:**
- `index.html`: Added modal HTML and CSS styling
- `app.js`: Added feedback modal logic and form submission

**Key Functions:**
- `openFeedbackModal(context)`: Opens the feedback modal with question context
- `closeFeedbackModal()`: Closes the modal
- `submitFeedback(event)`: Handles form submission and sends data to backend

### Backend

**New Files:**
- `server.js`: Express.js server with email endpoint
- `package.json`: Dependencies management
- `.env.example`: Environment variables template

**Backend Endpoint:**
```
POST /api/feedback
```

Expects JSON payload:
```json
{
  "taskId": "1",
  "questionText": "Question text here",
  "userAnswer": "A. Option A",
  "correctAnswer": "B. Option B",
  "description": "Student's feedback text",
  "timestamp": "2025-12-26T07:55:35.000Z",
  "userAgent": "browser user agent"
}
```

Returns:
```json
{
  "success": true,
  "message": "Спасибо за обратную связь!"
}
```

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd mathstat-exam-quiz
npm install
```

This will install:
- `express`: Web server framework
- `nodemailer`: Email sending library
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `nodemon`: Development auto-reload tool

### Step 2: Configure Email (Gmail)

The system uses Gmail SMTP for sending emails. Follow these steps:

1. **Enable 2FA on Your Gmail Account**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character app password
   - Copy this password

3. **Create `.env` File**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` File**
   ```bash
   # .env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   RECIPIENT_EMAIL=shikhirev.nn@phystech.edu
   PORT=3000
   NODE_ENV=development
   ```

   Replace:
   - `your-gmail@gmail.com`: Your Gmail address (will appear as "From" in emails)
   - `xxxx xxxx xxxx xxxx`: Your 16-character App Password
   - `shikhirev.nn@phystech.edu`: Where feedback emails should be sent

### Step 3: Run the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will start on `http://localhost:3000`

### Step 4: Test Email Configuration

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok"}`

## Email Template

When a student submits feedback, they receive an email with this structure:

```
Subject: [Mathstat Quiz] Task 1 Feedback

Task: 1
Question: [Full question text]
Student Answer: [Their answer]
Correct Answer: [Right answer]
Time: [Timestamp]

Feedback:
[Student's description of the inaccuracy]
```

## Deployment Options

### Option 1: Heroku (Free)

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set EMAIL_USER=your-gmail@gmail.com
heroku config:set EMAIL_PASSWORD="xxxx xxxx xxxx xxxx"
heroku config:set RECIPIENT_EMAIL=shikhirev.nn@phystech.edu

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option 2: Railway

1. Push to GitHub
2. Go to https://railway.app
3. Create new project from GitHub repo
4. Add environment variables in dashboard
5. Deploy

### Option 3: AWS EC2 / DigitalOcean

```bash
# SSH into your server
ssh ubuntu@your-server-ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/nicshik/mathstat-exam-quiz.git
cd mathstat-exam-quiz

# Install dependencies
npm install

# Create .env file with your configuration
nano .env

# Run with PM2 (recommended for production)
sudo npm install -g pm2
pm2 start server.js --name "mathstat-quiz"
pm2 startup
pm2 save
```

### Option 4: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t mathstat-quiz .
docker run -p 3000:3000 \
  -e EMAIL_USER=your-email@gmail.com \
  -e EMAIL_PASSWORD="app-password" \
  -e RECIPIENT_EMAIL=shikhirev.nn@phystech.edu \
  mathstat-quiz
```

## Troubleshooting

### "Email service not ready" Error

**Cause**: Invalid Gmail credentials

**Solution**:
1. Double-check your App Password (it has spaces in the middle)
2. Verify 2FA is enabled on your Gmail account
3. Make sure you're using the 16-character App Password, not your Gmail password

### "CORS Error" on Frontend

**Cause**: Frontend making requests to different domain/port

**Solution**:
1. Make sure server is running on same port and domain
2. In production, ensure the frontend and backend are on the same domain or properly CORS-configured
3. Check browser console for exact error message

### Emails Not Arriving

**Cause**: Gmail marking as spam or email bouncing

**Solution**:
1. Check your Gmail "Spam" folder
2. Try sending test email via Gmail directly first
3. Verify `RECIPIENT_EMAIL` is correct
4. Check if 2FA and App Password are still active

### Modal Not Showing

**Cause**: JavaScript error or incorrect HTML structure

**Solution**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab to ensure resources load
4. Verify HTML modal element exists in page

## User Experience Flow

1. Student starts quiz and answers questions
2. Completes quiz and sees results page
3. For each incorrect answer, sees "Сообщить о неточности" link
4. Clicks the link → Modal appears with:
   - Task number
   - Question text
   - Their answer
   - Correct answer
   - Current timestamp
5. Types feedback description
6. Clicks "Отправить"
7. Feedback sent to email, student sees success message
8. Modal closes automatically

## API Reference

### POST /api/feedback

Submit feedback about a question.

**Request Body:**
```json
{
  "taskId": "1",
  "questionText": "Question text...",
  "userAnswer": "A. Answer",
  "correctAnswer": "B. Answer",
  "description": "I think this answer is wrong because...",
  "timestamp": "2025-12-26T08:00:00Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Спасибо за обратную связь!"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

### GET /api/health

Check if server is running.

**Response:**
```json
{
  "status": "ok"
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` file. Add to `.gitignore`
2. **Input Validation**: Backend validates all required fields
3. **No User Tracking**: Feedback is anonymous, no email collection
4. **HTTPS**: Use HTTPS in production to encrypt email data in transit
5. **Rate Limiting**: Consider adding rate limiting in production to prevent spam

## Future Enhancements

- [ ] Rate limiting to prevent spam
- [ ] Admin dashboard to view feedback
- [ ] Question tagging (e.g., "answer unclear", "typo", "outdated")
- [ ] Feedback status tracking
- [ ] Automatic response to student
- [ ] Webhook integration for Slack notifications

## Support

For issues or questions:
1. Check this documentation
2. Review error logs: `npm run dev`
3. Check browser console (F12)
4. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment info (OS, browser, Node version)
