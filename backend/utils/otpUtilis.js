import OTP from '../model/otpModel.js';

// Generate a 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();  // Generates a 6-digit OTP
}

// Validate OTP: Check if the OTP is correct and not expired
export async function isOTPValid(userId, otp) {
    const otpRecord = await OTP.findOne({ userId, otp });
    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
        return false; // OTP is either incorrect or expired
    }
    return true;
}
