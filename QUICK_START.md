# Quick Start: Feedback Feature

## 5-Minute Setup

### 1. Prepare Gmail Credentials

```
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" + "Windows Computer"
5. Copy the 16-character password (has spaces)
```

### 2. Install & Configure

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# EMAIL_USER: your Gmail address
# EMAIL_PASSWORD: the 16-char App Password (with spaces)
# RECIPIENT_EMAIL: where to send feedback (shikhirev.nn@phystech.edu)
```

### 3. Run Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

Open `http://localhost:3000` in browser.

### 4. Test It

1. Start a quiz
2. Answer wrong on purpose
3. Click "Сообщить о неточности" link
4. Submit feedback
5. Check your email

## Deployment Quick Links

| Platform | Setup Time | Cost | Link |
|----------|-----------|------|------|
| Heroku | 5 min | Free | [Deploy](https://dashboard.heroku.com/new?template=https://github.com/nicshik/mathstat-exam-quiz) |
| Railway | 3 min | Free | [Deploy](https://railway.app/new) |
| Vercel | 2 min | Free | [Deploy](https://vercel.com/new) |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Email service not ready" | Check Gmail credentials in `.env` |
| "CORS Error" | Backend and frontend must be same origin |
| No emails received | Check spam folder, verify `RECIPIENT_EMAIL` |
| Modal not showing | Open DevTools (F12), check Console |

## File Structure

```
mathstat-exam-quiz/
├── index.html          ← Frontend (with modal HTML)
├── app.js              ← Frontend logic (with feedback functions)
├── server.js           ← Backend (email handler)
├── package.json        ← Dependencies
├── .env.example        ← Template for credentials
├── .gitignore          ← (Must exclude .env!)
└── FEEDBACK_FEATURE.md ← Full documentation
```

## Environment Variables

```bash
# Required for email
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password, not Gmail password!
RECIPIENT_EMAIL=shikhirev.nn@phystech.edu

# Optional
PORT=3000
NODE_ENV=development
```

## What Students See

1. Quiz results page → "Сообщить о неточности" link appears under wrong answers
2. Click link → Modal opens with question context
3. Type feedback → Click "Отправить" → Success message
4. Your email receives feedback with all question details

## Feedback Email Example

```
From: your-gmail@gmail.com
To: shikhirev.nn@phystech.edu
Subject: [Mathstat Quiz] Task 1 Feedback

Task: 1
Question: What is E[X+Y]?
Student Answer: A. E[X] + E[Y]
Correct Answer: B. E[X] + E[Y] (only if independent)
Time: Dec 26, 2025, 8:10 AM

Description:
I think the answer should be option A because...
```

## Next Steps

- [ ] Get App Password from Gmail
- [ ] Create `.env` file with credentials
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test feedback submission
- [ ] Deploy to production (Heroku/Railway/other)
- [ ] Share link with students

## Full Documentation

See `FEEDBACK_FEATURE.md` for:
- Detailed setup instructions
- All deployment options
- API reference
- Troubleshooting guide
- Security considerations
