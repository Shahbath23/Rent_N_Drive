import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../model/paymentModel.js';
import Car from '../model/carModel.js';
import { validationResult } from 'express-validator';
import Reservation from '../model/bookingModel.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config(); // Make sure this is at the top of your server file

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentCltr = {};

// Create a Razorpay order & redirect to checkout page
paymentCltr.createPayment = async (req, res) => {
    console.log('Payment creation endpoint hit');
    try {
        const { amount, carId, bookingId, paymentMethod } = req.body;
        console.log('Request body:', req.body);

        if (!amount || !carId || !bookingId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Ensure amount is positive
        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }

        // Check if carId and bookingId are valid
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: "Car not found" });
        }

        const booking = await Reservation.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        console.log("Creating Razorpay Order...");

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        console.log('Razorpay Order Response:', order);

        if (!order || !order.id) {
            console.error('Error: Order ID is missing in the Razorpay response');
            return res.status(500).json({ error: 'Failed to create Razorpay order. Order ID is missing' });
        }

        console.log('Order ID:', order.id);

        // Generate transaction ID
        const generateTransactionId = () => {
            return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        };
        const newPayment = new Payment({
            userId: req.currentUser.userId,
            carId,
            bookingId,
            amount,
            currency: "INR",
            paymentStatus: "Pending",
            paymentMethod,
            paymentOrderId: order.id,
            transactionId: generateTransactionId(),
        });

        // Save payment
        const savedPayment = await newPayment.save();

        // Populate car data after saving payment
        const populatedPayment = await Payment.findById(savedPayment._id).populate('carId');

        res.json({
            orderId: order.id,
            key: process.env.RAZORPAY_KEY_ID,
            payment: populatedPayment, // Send populated payment with car data
        });
    } catch (err) {
        console.error("Error creating payment:", err);
        res.status(500).json({ error: "Failed to create payment order" });
    }
};

// Verify payment after successful Razorpay transaction
paymentCltr.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        console.log({"reqBody":req.body})

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: "Invalid payment details" });
        }

        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed" });
        }
        console.log

        // Update payment status to success
        const updatedPayment = await Payment.findOneAndUpdate(
            { paymentOrderId: razorpay_order_id },
            { paymentStatus: "Success", transactionId: razorpay_payment_id },
            { new: true }
        );

        // Check if payment was found and updated
        if (!updatedPayment) {
            return res.status(404).json({ error: "Payment not found or could not be updated" });
        }

        // Populate the car data after updating payment status
        const populatedPayment = await Payment.findById(updatedPayment._id).populate('carId');

        // Check if the populated payment exists
        if (!populatedPayment) {
            return res.status(404).json({ error: "Payment record not found after population" });
        }

        res.json({
            message: "Payment verified successfully",
            payment: populatedPayment, // Send populated payment with car details
        });
    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ error: "Failed to verify payment" });
    }
};





paymentCltr.carPayment = async (req, res) => {
    try {
        const { id } = req.params; // Extract car ID
        console.log("Received carId:", id);

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Car ID format" });
        }

        // Fetch car details
        const car = await Car.findById(id).select("name make model image year");
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }

        // Fetch payments for this car
        const payments = await Payment.find({ carId: id })
            .populate("userId", "name email")  // Populate user details
            .populate("bookingId", "startDate endDate status");  // Populate booking details

        res.status(200).json({ car, payments }); // Return car details + payments
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Server error. Unable to fetch payments." });
    }
};


paymentCltr.adminPayments = async (req, res) => {
  try {
    console.log(" Fetching all payments for admin...");
    
    const payments = await Payment.find()
      .populate("carId", "name make model") // Get car details
      .populate("userId", "name phoneNo"); // Get user details
    
    console.log(` Successfully fetched ${payments.length} payments.`);
    
    res.status(200).json(payments);
  } catch (error) {
    console.error(" Error fetching admin payments:", error);
    res.status(500).json({ message: "Error fetching payments", error });
  }
};



paymentCltr.customerPayments = async (req, res) => {
    try {
        console.log("Fetching customer payments..."); // Log function entry

        if ( !req.currentUser.userId) {
            console.error(" Error: User ID is missing in request.");
            return res.status(401).json({ message: "Unauthorized. User ID is missing." });
        }

        const customerId = req.currentUser.userId;
        console.log(" Customer ID:", customerId);

        // Fetch payments for this customer and populate car details
        const payments = await Payment.find({ userId: customerId }).populate("carId", "name");

        console.log(" Payments found:", payments.length);
        res.json(payments);
    } catch (error) {
        console.error(" Error fetching customer payments:", error);
        res.status(500).json({ message: "Error fetching payments", error });
    }
};






export default paymentCltr;
