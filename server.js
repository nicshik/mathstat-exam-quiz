const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Email config error:', error);
    } else {
        console.log('Email service ready');
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/feedback', async (req, res) => {
    try {
        const { taskId, questionText, userAnswer, correctAnswer, description, timestamp, userAgent } = req.body;

        if (!taskId || !description || !questionText) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const htmlContent = `
            <h2>Feedback from Mathstat Quiz</h2>
            <h3>Question Info:</h3>
            <ul>
                <li><strong>Task:</strong> ${taskId}</li>
                <li><strong>Question:</strong> ${questionText}</li>
                <li><strong>Student Answer:</strong> ${userAnswer}</li>
                <li><strong>Correct Answer:</strong> ${correctAnswer}</li>
                <li><strong>Time:</strong> ${new Date(timestamp).toLocaleString('ru-RU')}</li>
            </ul>
            <h3>Description:</h3>
            <p>${description.replace(/\n/g, '<br>')}</p>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL || 'shikhirev.nn@phystech.edu',
            subject: `[Mathstat Quiz] Task ${taskId} Feedback`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Feedback sent!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error sending feedback' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
