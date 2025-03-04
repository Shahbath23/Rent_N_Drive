import { validationResult } from 'express-validator';
import _ from 'lodash';
import Car from '../model/carModel.js'; // Adjust path to your Car model
import { geocodeAddress } from '../utils/geocode.js'; 
import geocoder from "../utils/geocode.js"
import { getAddressSuggestions } from '../utils/addressSuggestion.js';
import path from 'path';
import fs from "fs"
const carCltr={}
import cron from 'node-cron';
import mongoose from 'mongoose';
import Reservation from '../model/bookingModel.js';
import sendEmail from '../utils/mailer.js';
import cloudinary from '../config/cloudinary.js';
import axios from "axios"
import { getDistance } from 'geolib';

// carCltr.create = async (req, res) => {
//   try {
//     // Ensure only users with the role 'owner' can create cars
//     if (!req.currentUser || req.currentUser.role !== 'owner') {
//       return res.status(403).json({ message: 'Access denied. Only owners can create cars.' });
//     }

//     // Pick only allowed fields from the request body
//     const allowedFields = [
//       'name',
//       'make',
//       'model',
//       'year',
//       'licensePlate',
//       'dailyRate',
//       'address',
//       'transmission',
//       'fuelType',
//       'seats',
//       'mileage',
//       'features'
//     ];
//     const carData = _.pick(req.body, allowedFields);

//   // Handle file uploads for image and proofOfCar
// if (req.files) {
//   if (req.files.image) {
//     const imagePath = path.join('uploads', req.files.image[0].filename).replace(/\\/g, '/');
//     carData.image = imagePath;
//   }
//   if (req.files.proofOfCar) {
//     const proofPath = path.join('uploads', req.files.proofOfCar[0].filename).replace(/\\/g, '/');
//     carData.proofOfCar = { filePath: proofPath, documentType: req.body.documentType };
//   }
// }


//     // Geocode the address to get latitude and longitude
//     const geocodeResult = await geocoder.geocode(carData.address);
//     if (!geocodeResult.length) {
//       return res.status(400).json({ message: 'Invalid address provided.' });
//     }

//     // Extract latitude and longitude
//     const { latitude, longitude } = geocodeResult[0];
//     carData.latitude = latitude;
//     carData.longitude = longitude;

//     // Assign the userId of the owner (from the authenticated user context)
//     carData.userId = req.currentUser.userId;

//     // Create the car document
//     const newCar = new Car(carData);
//     await newCar.save();

//     return res.status(201).json({ message: 'Car created successfully', car: newCar });
//   } catch (error) {
//     console.error(error);

//     // Cleanup uploaded files if an error occurs
//     if (req.files) {
//       if (req.files.image) {
//         fs.unlinkSync(req.files.image[0].path);
//       }
//       if (req.files.proofOfCar) {
//         fs.unlinkSync(req.files.proofOfCar[0].path);
//       }
//     }

//     return res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };


carCltr.create = async (req, res) => {
  try {
    // Ensure only users with the role 'owner' can create cars
    if (!req.currentUser || req.currentUser.role !== "owner") {
      return res.status(403).json({ message: "Access denied. Only owners can create cars." });
    }

    // Pick allowed fields from the request body
    const allowedFields = [
      "name",
      "make",
      "model",
      "year",
      "licensePlate",
      "dailyRate",
      "address",
      "transmission",
      "fuelType",
      "seats",
      "mileage",
      "features",
      "googleMapsLink",
      "image",
      "proofOfCar"
    ];
    const carData = _.pick(req.body, allowedFields);

    // Fetch address suggestions if address is provided (but continue to car creation)
    let suggestions = [];
    if (carData.address) {
      try {
        suggestions = await getAddressSuggestions(carData.address);
      } catch (error) {
        return res.status(500).json({ message: "Error fetching address suggestions", error: error.message });
      }
    }

    // Handle file uploads using Multer & Cloudinary
    if (req.files) {
      console.log("Received files:", req.files);

      try {
        // Upload car image
        if (req.files.image) {
          const imageFormData = new FormData();
          imageFormData.append('file', req.files.image[0]);
          imageFormData.append('upload_preset', 'ml_default');
          imageFormData.append('folder', 'cars');
          
          const imageResponse = await axios.post(
            'https://api.cloudinary.com/v1_1/ddjcj0vkn/upload',
            imageFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              transformRequest: [(data) => data],
            }
          );
          carData.image = imageResponse.data.secure_url;
        }

        // Upload proof of car
        if (req.files.proofOfCar) {
          const proofFormData = new FormData();
          proofFormData.append('file', req.files.proofOfCar[0]);
          proofFormData.append('upload_preset', 'ml_default');
          proofFormData.append('folder', 'cars/proofs');
          
          const proofResponse = await axios.post(
            'https://api.cloudinary.com/v1_1/ddjcj0vkn/raw/upload',
            proofFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              transformRequest: [(data) => data],
            }
          );
          carData.proofOfCar = proofResponse.data.secure_url;
        }

        // Clean up temporary files
        if (req.files.image && fs.existsSync(req.files.image[0].path)) {
          fs.unlinkSync(req.files.image[0].path);
        }
        if (req.files.proofOfCar && fs.existsSync(req.files.proofOfCar[0].path)) {
          fs.unlinkSync(req.files.proofOfCar[0].path);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ 
          message: "File upload failed", 
          error: uploadError.message 
        });
      }
    }

    // Geocode the address to get latitude and longitude if address is valid
    const geocodeResult = await geocoder.geocode(carData.address);
    if (!geocodeResult.length) {
      return res.status(400).json({ message: "Invalid address provided." });
    }
    carData.latitude = geocodeResult[0].latitude;
    carData.longitude = geocodeResult[0].longitude;

    // Assign the userId of the owner
    carData.userId = req.currentUser.userId;

    // Create the car document
    const newCar = new Car(carData);
    await newCar.save();

    return res.status(201).json({
      message: "Car created successfully",
      car: newCar,
      addressSuggestions: suggestions,  // Include suggestions if available
    });
  } catch (error) {
    console.error("Error creating car:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};







carCltr.listOwnerCars = async (req, res) => {
  try {
    if (!req.currentUser?.userId) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    // Log the userId being queried
    console.log('Searching for cars with userId:', req.currentUser.userId);

    // Correctly instantiate ObjectId with `new`
    // const userId = new mongoose.Types.ObjectId(req.currentUser.userId);

    // Query cars uploaded by the specific user
    const cars = await Car.find({userId: req.currentUser.userId })
      .select('-image.data -proofOfCar.data') // Exclude large data fields
      .populate('userId', 'name email phoneNo proofOfLicense'); // Include specific user fields

    // Check if no cars are found
    if (!cars || cars.length === 0) {
      console.log('No cars found for userId:', req.currentUser.userId);
      return res.status(404).json({ message: 'No cars found for this user.' });
    }

    res.json(cars);
  } catch (err) {
    console.error("Error fetching owner's cars:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

carCltr.listAllCarsAdmin = async (req, res) => {
  try {
      // Fetch all cars, including unavailable and unapproved ones
      const cars = await Car.find().populate("userId", "name email phoneNo");

      res.json(cars);
  } catch (err) {
      console.error("Error fetching cars for admin:", err);
      res.status(500).json({ error: "Something went wrong" });
  }
};






// carCltr.listAllCars = async (req, res) => {
//   try {
//     const query = {};
//     const options = {
//       select: '-image.data -proofOfCar.data', // Exclude large fields like image and proofOfCar
//     };

//     // Apply filters based on query parameters
//     if (req.query.make) query.make = new RegExp(req.query.make, 'i');
//     if (req.query.model) query.model = new RegExp(req.query.model, 'i');
//     if (req.query.year) query.year = req.query.year;
//     if (req.query.minPrice) query.dailyRate = { $gte: parseFloat(req.query.minPrice) };
//     if (req.query.maxPrice) {
//       query.dailyRate = { ...query.dailyRate, $lte: parseFloat(req.query.maxPrice) };
//     }

//     // Role-based filtering
//     if (req.currentUser.role === "admin") {
//       // Admin can see all cars, no specific filtering required
//     } else if (req.currentUser.role === "customer") {
//       query.approved = true;
//       query.status = "Available";
//       // Populate user details (name, email, phoneNo, and proofOfLicense) for customers
//       options.populate = {
//         path: 'userId', 
//         select: 'name email phoneNo proofOfLicense', // Include the relevant user fields
//       };
//     } else {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     // Fetch cars based on query and options, and populate userId as needed
//     const cars = await Car.find(query, null, options);
//     res.json(cars);
//   } catch (err) {
//     console.error("Error fetching cars:", err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };
carCltr.listAllCars = async (req, res) => {
  try {
      // Extract user location from request query
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
          return res.status(400).json({ error: "User location is required" });
      }

      // Convert to float
      const userLatitude = parseFloat(latitude);
      const userLongitude = parseFloat(longitude);

      // Fetch all available and approved cars
      const cars = await Car.find({ status: "Available", approved: true });

      // Filter cars within 5km radius
      const filteredCars = cars.filter((car) => {
          if (!car.latitude || !car.longitude) return false;
          
          const carLocation = { latitude: car.latitude, longitude: car.longitude };
          const userLocation = { latitude: userLatitude, longitude: userLongitude };

          const distance = getDistance(userLocation, carLocation); // Distance in meters
          return distance <= 5000;  // 5km radius
      });

      res.json(filteredCars);
  } catch (err) {
      console.error("Error fetching cars:", err);
      res.status(500).json({ error: "Something went wrong" });
  }
};






carCltr.one = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      ;  // Populate user details

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // If user is customer, only show approved cars
    if (req.currentUser.role === "customer" && !car.approved) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(car);
  } catch (err) {
    console.error("Error fetching car:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

carCltr.update = async (req, res) => {
  try {
    // Check validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedFields = [
      "name", "make", "model", "year", "licensePlate", 
      "dailyRate", "specifications", "features", 
      "googleMapsLink",'address'
    ];
    const body = _.pick(req.body, allowedFields);

    // Process location if provided
    if (req.body.location && req.body.location.longitude && req.body.location.latitude) {
      const { longitude, latitude, address } = req.body.location;
      body.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || {}
      };
    }

    // Handle image file upload if provided
    if (req.files?.image?.[0]) {
      if (req.files.image[0].size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "Image file is too large" });
      }

      // Upload the image to Cloudinary
      const imageUploadResult = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "cars/images",
        resource_type: "image", // Cloudinary resource type
        allowed_formats: ["jpeg", "jpg", "png"], // Allowed formats
      });

      body.image = imageUploadResult.secure_url;
    }

    // Handle proof of car file upload if provided
    if (req.files?.proofOfCar?.[0]) {
      if (req.files.proofOfCar[0].size > MAX_FILE_SIZE) {
        return res.status(400).json({ error: "Proof of car file is too large" });
      }

      // Upload the proof of car document to Cloudinary
      const proofUploadResult = await cloudinary.uploader.upload(req.files.proofOfCar[0].path, {
        folder: "cars/proofs",
        resource_type: "raw", // Allows uploading non-image files (like PDFs)
        allowed_formats: ["pdf"], // Allowed format (PDF)
      });

      body.proofOfCar = proofUploadResult.secure_url;
    }

    // Find the car by ID
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Ensure that the current user is the owner of the car
    if (car.userId.toString() !== req.currentUser.userId) {
      return res.status(403).json({ error: "Access denied. You can only edit your own cars." });
    }

    // Update the car details with the filtered data
    Object.assign(car, body);

    // Set the 'approved' status to false after editing
    car.approved = false;

    // Save the updated car
    await car.save();

    // Optionally, populate user details or additional data if necessary
    const carResponse = await Car.findById(car._id);

    // Send a success response
    res.status(200).json({
      message: "Car updated successfully. Waiting for admin approval.",
      car: carResponse
    });
  } catch (err) {
    console.error("Error updating car:", err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "License plate already exists" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
};


carCltr.delete = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    const { userId, role } = req.currentUser;
    
    if (car.userId.toString() !== userId && role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (role === "customer") {
      return res.status(403).json({ error: "Customers cannot delete cars" });
    }

    await car.deleteOne();
    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error("Error deleting car:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

carCltr.approveCar = async (req, res) => {
  try {
    if (req.currentUser.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    )
    .select('-image.data -proofOfCar.data')
    .populate('userId', 'name email phoneNo proofOfLicense'); // Populate user details

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(car);
  } catch (err) {
    console.error("Error approving car:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};


// New method to get car image
carCltr.getImage = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).select('image');
    if (!car || !car.image) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    res.set('Content-Type', car.image.contentType);
    res.send(car.image.data);
  } catch (err) {
    console.error("Error fetching car image:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// New method to get proof of car document
carCltr.getProofOfCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).select('proofOfCar');
    if (!car || !car.proofOfCar) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Only allow owner or admin to access proof of car
    if (car.userId.toString() !== req.currentUser.userId && 
        req.currentUser.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.set('Content-Type', car.proofOfCar.contentType);
    res.send(car.proofOfCar.data);
  } catch (err) {
    console.error("Error fetching proof of car:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
 
carCltr.statusUpdate = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const carId = req.params.id;

    // Find the car by ID
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Find the booking reservation
    const reservation = await Reservation.findById(bookingId);
    if (!reservation) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the reservation is not already completed
    if (reservation.status === 'completed') {
      return res.status(400).json({ message: 'Booking is already completed' });
    }

    // Update the reservation status to 'completed' and set the endDate to today
    reservation.status = 'completed';
    reservation.endDate = new Date(); // Set the end date to today's date
    await reservation.save();

    // Update the car status to 'available'
    car.status = 'Available';
    await car.save();

    // Fetch the populated reservation to get user and car details
    const populatedReservation = await Reservation.findById(reservation._id)
    .populate('user', 'name email') // Populate the user's name and email
    .populate('car', 'name');// Populate car's name

    // Compose the email details
    const subject = `Your ride with "${populatedReservation.car.name}" has been completed`;
    const text = `Dear ${populatedReservation.user.name},\n\nWe are pleased to inform you that your ride with the car "${populatedReservation.car.name}" has been successfully completed.\n\nThank you for choosing our service. We hope to see you again soon!\n\nBest regards,\nRent N Drive`;

    // Send the email
    await sendEmail(populatedReservation.user.email, subject, text); // Send email

    return res.status(200).json({
      message: 'Car status updated to available, reservation marked as completed, and notification email sent to the user',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating car status, reservation, or sending email' });
  }
};




cron.schedule('0 0 * * *', async () => {
  try {
    // Find all cars where status is 'booked' and the booking has ended
    const carsToUpdate = await Car.find({ status: 'confirmed' });

    for (const car of carsToUpdate) {
      // Check if the car's booking has ended (assuming there's a "bookingEnd" field)
      const ongoingBooking = await Booking.findOne({ car: car._id, status: 'ongoing' });

      if (ongoingBooking && new Date() > ongoingBooking.bookingEnd) {
        // Update car status to 'available'
        car.status = 'Available';
        await car.save();

        // Optionally, update the booking status
        await Booking.updateMany(
          { car: car._id, status: 'ongoing' },
          { status: 'completed' }
        );

        console.log(`Car status updated to 'available' for car ${car._id}`);
      }
    }
  } catch (err) {
    console.error('Error during cron job execution:', err);
  }
});
carCltr.address = async (req, res) => {
  const { input } = req.query; 
  const cache={}
  // Get the input from the query string

  if (!input) {
    return res.status(400).json({ message: 'Input is required' });
  }

  // Check if the input is cached (optional)
  if (cache[input]) {
    return res.json({ suggestions: cache[input] });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
        params: {
          input,
          key: process.env.GOOGLE_API_KEY,
        }
      }
    );
    console.log({"api": process.env.GOOGLE_API_KEY})

    if (response.data.status === 'OK') {
      // Cache the response for future requests
      cache[input] = response.data.predictions;
      return res.json({ suggestions: response.data.predictions });
    } else {
      return res.status(500).json({ message: 'Failed to fetch address suggestions' });
    }
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return res.status(500).json({ message: 'Error fetching address suggestions', error: error.message });
  }
};


export default carCltr;