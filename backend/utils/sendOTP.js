import nodemailer from 'nodemailer';

// Set up the transporter with your email service (Gmail, SMTP, etc.)
const transporter = nodemailer.createTransport({
    service: 'gmail', // For Gmail. You can change this based on your email service.
    auth: {
        user: process.env.EMAIL_USER,  // Set your email address here
        pass: process.env.EMAIL_PASS   // Set your email password here or use OAuth2
    }
});

// Function to send OTP email
export const sendOTP = async (user, otp) => {
    const message = {
        from: process.env.EMAIL_USER,   // sender address
        to: user.email,                 // recipient address
        subject: 'Your OTP Code for Login',  // Subject
        text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`  // OTP message
    };

    try {
        await transporter.sendMail(message);  // Send the email
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
