// reservationController.js
import Reservation from '../model/bookingModel.js';
import Car from '../model/carModel.js';
import _ from 'lodash';
import mongoose from "mongoose"
import sendEmail from '../utils/mailer.js';
const reservationCltr = {};
import Payment from '../model/paymentModel.js';
import razorpay from '../config/payment.js';
import crypto from "crypto"
import User from '../model/userModel.js';
import Razorpay from "razorpay"



// Create a new reservation

reservationCltr.createReservation = async (req, res) => {
    try {
        const { carId, startDate, endDate, paymentId } = req.body;  // FIXED: carId instead of car

        console.log("Received Car ID:", carId);  // Debugging log

        // Ensure the user is approved
        const user = req.currentUser;
        if (!user || user.role !== 'customer' || user.isApproved === false) {
            return res.status(403).json({ error: 'Only approved users can book a car.' });
        }

        // Ensure the car exists
        const car1 = await Car.findById(carId);
        if (!car1) {
            return res.status(404).json({ error: 'Car not found.' });
        }

        // Check for existing reservations
        const existingReservation = await Reservation.findOne({
            car: car1._id,
            $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
            status: { $nin: ['cancelled', 'completed'] }, // ✅ Fixes condition
        });

        if (existingReservation) {
            return res.status(400).json({ error: 'Car is already reserved for the selected dates.' });
        }

        // Validate date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end) || end < start) {
            return res.status(400).json({ error: 'Invalid date range.' });
        }

        const days = start.toDateString() === end.toDateString()
            ? 1
            : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const totalAmount = days * car1.dailyRate;

        // Create the reservation with status 'Pending'
        const reservation = new Reservation({
            car: car1._id,
            user: req.currentUser.userId,
            startDate,
            endDate,
            totalAmount,
            status: 'pending',
            paymentId: paymentId || null,
        });

        // Save the reservation
        await reservation.save();

        // Populate the car details and send the response

        const populatedReservation = await Reservation.findById(reservation._id).populate('car');
        console.log("Populated Reservation:", populatedReservation);  // Log to verify car is populated
        res.status(201).json({
            message: 'Reservation created successfully. Please proceed with payment.',
            reservation: populatedReservation, // Send populated reservation
            bookingId: reservation._id,
        });
    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};


// Get a reservation by ID
reservationCltr.getReservationById = async (req, res) => {
    try {
        // Fetch reservation and populate car and user details
        const reservation = await Reservation.findById(req.params.id).populate('car user');
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        // Fetch car details to check the car owner
        const car = await Car.findById(reservation.car); // Ensure `_id` is used correctly
        if (!car) {
            return res.status(404).json({ error: 'Car not found.' });
        }

        // Check authorization
        const isAdmin = req.currentUser.role === 'admin';
        const isCustomer = req.currentUser.userId === reservation.user._id.toString();
        const isCarOwner = req.currentUser.userId === car.userId.toString();

        if (isAdmin || isCustomer || isCarOwner) {
            return res.json(reservation);
        } else {
            return res.status(403).json({ error: 'Access denied.' });
        }
    } catch (err) {
        console.error('Error fetching reservation:', err.message);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};

// Get all reservations for a specific user
reservationCltr.getUserReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.currentUser.userId })
            .populate('car', 'name address googleMapsLink transmission fuelType seats mileage features image'); // Add 'image' explicitly

        console.log("Reservations Data:", reservations); // Debugging log
        res.json(reservations);
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};


//for specific car
reservationCltr.getReservationsByCarId = async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch reservations for the given carId
        const reservations = await Reservation.find({ car: id })
            .populate('car', 'make model licensePlate image')
            .populate('user', 'name email');

        // Handle no reservations case
        if (reservations.length === 0) {
            return res.status(200).json({ message: 'No reservations found for this car.', reservations: [] });
        }

        // Return reservations
        res.status(200).json( reservations );
    } catch (err) {
        console.error('Error fetching reservations for car:', err);
        res.status(500).json({ error: 'Something went wrong while fetching the reservations.' });
    }
};


// Get all reservations (Admin only)
reservationCltr.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().populate('car user');
        res.json(reservations);
    } catch (err) {
        console.error('Error fetching all reservations:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};


// Update a reservation
reservationCltr.updateReservation = async (req, res) => {
    try {
        const { startDate, endDate,status } = req.body;
        const reservation = await Reservation.findById(req.params.id);

        // Ensure reservation exists
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        // Check if the current user is authorized to update the reservation
        const isAdmin = req.currentUser.role === 'admin';
        const isCustomer = req.currentUser.userId.toString() === reservation.user.toString();

        if (!isAdmin && !isCustomer) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // Fetch car details to get the daily rate
        const car = await Car.findById(reservation.car);
        if (!car) {
            return res.status(404).json({ error: 'Car not found.' });
        }

        // Validate the date range
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ error: 'End date must be after start date.' });
        }

        // Calculate the total amount based on the new dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = (end - start) / (1000 * 3600 * 24); // Calculate the number of days
        const totalAmount = car.dailyRate * days; // Recalculate the total amount

        // Update reservation details
        reservation.startDate = startDate;
        reservation.endDate = endDate;
        reservation.totalAmount = totalAmount; // Update totalAmount

        // Save the updated reservatio
      // Find the reservation and populate user and car details
const populatedReservation = await Reservation.findById(reservation._id)
.populate('user', 'name email role')  // Populate the user's name, email, and role (customer)
.populate('car', 'name userId');  // Populate the car's name and userId (owner's userId)

// Fetch the car owner using the userId from the car model
const carOwner = await User.findById(populatedReservation.car.userId); 

// Prepare email details for the customer (if the user is a customer)
if (populatedReservation.user.role === 'customer') {
const customerSubject = `Your reservation for "${populatedReservation.car.name}" has been updated`;
const customerText = `Dear ${populatedReservation.user.name},\n\nYour reservation for the car "${populatedReservation.car.name}" has been updated. The new reservation details are as follows:\n\nStart Date: ${reservation.startDate}\nEnd Date: ${reservation.endDate}\n\nWe look forward to your updated ride!\n\nThank you for booking with us.`;
await sendEmail(populatedReservation.user.email, customerSubject, customerText);
}

// Prepare email details for the owner (if the userId is an owner)
if (carOwner.role === 'owner') {
const ownerSubject = `A reservation for your car "${populatedReservation.car.name}" has been updated`;
const ownerText = `Dear ${carOwner.name},\n\nA customer has updated their reservation for your car "${populatedReservation.car.name}". The new reservation details are as follows:\n\nStart Date: ${reservation.startDate}\nEnd Date: ${reservation.endDate}\n\nCar Status: Reserved\n\nPlease make necessary arrangements for the updated reservation.\n\nThank you for listing your car with us.`;
await sendEmail(carOwner.email, ownerSubject, ownerText);
}
        await reservation.save();
        return res.json({ message: 'Reservation updated successfully.', reservation });
    } catch (err) {
        console.error('Error updating reservation:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};



// delete a reservation
reservationCltr.deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        // Check authorization
        const isAdmin = req.currentUser.role === 'admin';
        const isCustomer = req.currentUser.userId.toString() === reservation.user.toString();
        const car = await Car.findById(reservation.car);

        if (!car) {
            return res.status(404).json({ error: 'Car not found.' });
        }

        const isCarOwner = req.currentUser.userId.toString() === car.userId.toString();

        if (!(isAdmin || isCarOwner || isCustomer)) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        // Delete the reservation
        await Reservation.deleteOne({ _id: req.params.id });

        // Update the car status to available
        car.status = 'Available';
        await car.save();

        res.json({ message: 'Reservation deleted successfully, car status updated to available.' });
    } catch (err) {
        console.error('Error deleting reservation:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
};

//cancel reservation
reservationCltr.cancelReservation = async (req, res) => {
    try {
        const bookingId = req.params.id;

        // Find the reservation by ID
        const reservation = await Reservation.findById(bookingId);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        // Fetch the car details
        const car = await Car.findById(reservation.car);
        if (!car) {
            return res.status(404).json({ error: 'Car not found.' });
        }

        // Change the reservation status to 'cancelled' and set the endDate to the current date
        reservation.status = 'cancelled';
        reservation.endDate = new Date(); // Set the end date to the cancellation date
        await reservation.save();

        // Update the car status to 'Available'
        car.status = 'Available';
        await car.save();

        // Send an email to the user about the cancellation
       // Find the reservation and populate user and car details
const populatedReservation = await Reservation.findById(reservation._id)
.populate('user', 'name email role')  // Populate the user's name, email, and role (customer)
.populate('car', 'name userId');  // Populate the car's name and userId (owner's userId)

// Fetch the car owner using the userId from the car model
const carOwner = await User.findById(populatedReservation.car.userId);

// Prepare email details for the customer (if the user is a customer)
if (populatedReservation.user.role === 'customer') {
const customerSubject = `Your reservation for "${populatedReservation.car.name}" has been cancelled`;
const customerText = `Dear ${populatedReservation.user.name},\n\nWe regret to inform you that your reservation for the car "${populatedReservation.car.name}" from ${reservation.startDate} to ${reservation.endDate} has been cancelled.\n\nCar Status: Available\n\nWe apologize for any inconvenience caused.\n\nThank you for your understanding.`;
await sendEmail(populatedReservation.user.email, customerSubject, customerText);
}

// Prepare email details for the owner (if the userId is an owner)
if (carOwner.role === 'owner') {
const ownerSubject = `A reservation for your car "${populatedReservation.car.name}" has been cancelled`;
const ownerText = `Dear ${carOwner.name},\n\nA reservation for your car "${populatedReservation.car.name}" has been cancelled. The reservation was scheduled from ${reservation.startDate} to ${reservation.endDate}.\n\nCar Status: Available\n\nPlease note that the car is now available.\n\nThank you for listing your car with us.`;
await sendEmail(carOwner.email, ownerSubject, ownerText);
}
      return res.json({ message: 'Booking cancelled successfully, car status updated to available.' });
    } catch (err) {
        console.error('Error canceling booking:', err);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};
 

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to verify Razorpay signature
const verifyRazorpaySignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        throw new Error("Razorpay secret key is missing!");
    }

    // Ensure all values are properly formatted
    const orderId = String(razorpay_order_id).trim();
    const paymentId = String(razorpay_payment_id).trim();
    const receivedSignature = String(razorpay_signature).trim();

    // Generate HMAC signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    // Debugging logs
    console.log(" Secret Key:", secret);
    console.log(" Order ID:", orderId);
    console.log(" Payment ID:", paymentId);
    console.log(" Received Signature:", receivedSignature);
    console.log(" Generated Signature:", generatedSignature);

    return generatedSignature === receivedSignature;
};


// Function to confirm reservation and verify payment
reservationCltr.confirmReservation = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debug: Log the request body
        console.log("Reservation ID:", req.params.id); // Debug: Log the reservation ID

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        const { id } = req.params; // Reservation ID from URL param

        // Step 1: Verify the Razorpay payment signature
        const isSignatureValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isSignatureValid) {
            console.error("Invalid signature"); // Debug: Log invalid signature error
            return res.status(400).json({ error: "Invalid signature" });
        }

        // Step 2: Fetch payment details from Razorpay API
        const paymentDetails = await razorpayInstance.payments.fetch(razorpay_payment_id);
        if (paymentDetails.status !== "captured") {
            console.error("Payment not successful"); // Debug: Log payment failure
            return res.status(400).json({ error: "Payment not successful" });
        }

        // Step 3: Update reservation status to "confirmed"
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            console.error("Reservation not found"); // Debug: Log reservation not found
            return res.status(404).json({ error: "Reservation not found" });
        }

        reservation.status = "confirmed"; // Set reservation status to confirmed
        await reservation.save();
        

        // Step 4: Update car status to "rented"
        const car = await Car.findById(reservation.car); // Assuming reservation has a carId
        if (!car) {
            console.error("Car not found"); // Debug: Log car not found
            return res.status(404).json({ error: "Car not found" });
        }

        car.status = "Rented"; // Set car status to rented
        await car.save();
        const populatedReservation = await Reservation.findById(reservation._id)
    .populate('user', 'name email role') // Populate the user's name, email, and role (customer)
    .populate('car', 'name userId'); // Populate the car's name and userId (owner's userId)

const carOwner = await User.findById(populatedReservation.car.userId); // Fetch the owner of the car using the userId

// Prepare email details for the customer (if the user is a customer)
if (populatedReservation.user.role === 'customer') {
    const customerSubject = `Your reservation for "${populatedReservation.car.name}" has been confirmed`;
    const customerText = `Dear ${populatedReservation.user.name},\n\nYour reservation for the car "${populatedReservation.car.name}" from ${reservation.startDate} to ${reservation.endDate} has been confirmed.\n\nWe look forward to your ride!\n\nThank you for booking with us.`;
    await sendEmail(populatedReservation.user.email, customerSubject, customerText);
}

// Prepare email details for the owner (if the userId is an owner)
if (carOwner.role === 'owner') {
    const ownerSubject = `A new reservation for your car "${populatedReservation.car.name}" has been confirmed`;
    const ownerText = `Dear ${carOwner.name},\n\nA customer has confirmed a reservation for your car "${populatedReservation.car.name}" from ${reservation.startDate} to ${reservation.endDate}.\n\nCar Status: Reserved\n\nPlease make necessary arrangements for the reservation.\n\nThank you for listing your car with us.`;
    await sendEmail(carOwner.email, ownerSubject, ownerText);
}


        // Step 5: Send success response
        res.status(200).json({ message: "Reservation confirmed and car status updated", paymentDetails });

    } catch (err) {
        console.error("Error confirming reservation:", err); // Debug: Log any unexpected errors
        res.status(500).json({ error: "Failed to confirm reservation" });
    }
};


//admin bookings
reservationCltr.adminBook = async (req, res) => {
  try {
    console.log(" Incoming request to fetch admin bookings...");

    const bookings = await Reservation.find()
    .populate({
      path: "car",
      populate: {
        path: "userId", // Assuming `owner` is a reference in the `Car` model
        select: "name phoneNo", // Fetch only name & phone
      },
    })
    .populate("user", "name"); // Fetch customer name
    console.log("✅ Successfully fetched bookings:", bookings.length, "records found.");
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error(" Error fetching admin bookings:", error.message);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};


export default reservationCltr;
