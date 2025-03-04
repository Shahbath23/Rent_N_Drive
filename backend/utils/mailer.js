// mailer.js

import nodemailer from "nodemailer"
// Create a transporter using Gmail (or other email service)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS,   // Replace with your email password (use App Passwords for Gmail)
    },
});
const sendEmail = (to, subject, text) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
  
    return transporter.sendMail(mailOptions);
  };
  

export default sendEmail