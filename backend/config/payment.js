import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your API Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your API Secret
});

export default razorpay;
