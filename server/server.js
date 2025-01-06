const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'group38cheer@gmail.com', // Your Gmail email address
    pass: 'bzaw mfim qtri tbqs', // Your Gmail password
  },
});

app.use(express.json());

// Route for sending emails
app.post('/send-email', (req, res) => {
  const { email, emailContent } = req.body;

  // Email content
  const mailOptions = {
    from: 'andrewbliss11@gmail.com', // Sender address
    to: 'group38cheer@gmail.com', // List of recipients
    subject: 'New Email from Contact Form', // Subject line
    text: `Email: ${email}\n\nContent: ${emailContent}`, // Plain text body
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.json({ success: false });
    } else {
      console.log('Email sent:', info.response);
      res.json({ success: true });
    }
  });
});

app.listen(3001, () => console.log('Server started on port 3001'));
