import User from "../model/userModel.js";
import { validationResult } from "express-validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import OTP from '../model/otpModel.js';
import sendEmail from "../utils/mailer.js";
import cloudinary from "../config/cloudinary.js";
import geolib from "geolib"

const userCltr = {};

userCltr.create = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files); // Logs uploaded files

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure required fields from the request body
    const { name, email, phoneNo, password, role,address } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNo || !password || !address) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Handle profile picture upload if provided
    let profilePictureUrl = null;
    if (req.files && req.files.profilePicture) {
      const profilePicture = req.files.profilePicture[0]; // Access the first file (since it's an array)
      console.log('Profile picture file:', profilePicture);

      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(profilePicture.path, {
        folder: 'profile_pictures', // Store in a specific folder on Cloudinary
      });

      // Log the Cloudinary response
      console.log('Cloudinary response for profile picture:', cloudinaryResponse);

      // Get the URL of the uploaded image
      profilePictureUrl = cloudinaryResponse.secure_url; // This is the string URL you need to save
      console.log('Profile picture URL:', profilePictureUrl);
    }

    // Handle proofOfLicense upload if provided
    let proofOfLicenseUrl = null;
    if (req.files && req.files.proofOfLicense) {
      const proofOfLicense = req.files.proofOfLicense[0]; // Access the first file (since it's an array)
      console.log('Proof of license file:', proofOfLicense);

      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(proofOfLicense.path, {
        folder: 'proof_of_licenses', // Store in a specific folder on Cloudinary
      });

      // Log the Cloudinary response
      console.log('Cloudinary response for proof of license:', cloudinaryResponse);

      // Get the URL of the uploaded file
      proofOfLicenseUrl = cloudinaryResponse.secure_url; // This is the string URL you need to save
      console.log('Proof of license URL:', proofOfLicenseUrl);
    }

    // Hash the password before saving it
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log('Hashed password:', hashedPassword);

    // Prepare user data
    const newUser = new User({
      name,
      email,
      phoneNo,
      password: hashedPassword, // Store hashed password
      role,
      address,
      proofOfLicense: proofOfLicenseUrl, // Store Cloudinary URL for proofOfLicense
      profilePicture: profilePictureUrl, // Store Cloudinary URL for profile picture
    });

    // Save the new user to the database
    await newUser.save();

    // Send a welcome email to the user (use your own mailer utility)
    const subject = `Welcome to Rent N Drive, ${name}!`;
    const text = `Hello ${name},\n\nYou have successfully registered.\n\nBest regards,\nRent N Drive`;
    await sendEmail(email, subject, text); // Send email (replace with your actual mailer)

    // Respond with success message
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phoneNo: newUser.phoneNo,
        address:newUser.address,
        proofOfLicense: newUser.proofOfLicense, // Include Cloudinary URL
        profilePicture: newUser.profilePicture, // Include Cloudinary profile picture URL
      },
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};





userCltr.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { name, password, latitude, longitude } = req.body;  // Getting user data and location

  try {
      const user = await User.findOne({ name });
      if (!user) {
          return res.status(401).json({ errors: 'Invalid email/password' });
      }

      const isValidUser = await bcryptjs.compare(password, user.password);
      if (!isValidUser) {
          return res.status(401).json({ errors: 'Invalid email/password' });
      }

      const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
      );

      // Example: Calculate distance from user's location to a reference point (e.g., server location)
      const referenceLocation = { latitude: 40.7128, longitude: -74.0060 }; // Example reference location (New York)

      const distance = geolib.getDistance(
          { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          referenceLocation
      );

      const isNearby = distance <= 5000;  // Check if user is within 5km

      res.json({
          token: `Bearer ${token}`,
          user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              isNearby  // Send distance-based info to frontend
          }
      });

  } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ error: 'Something went wrong' });
  }
};



userCltr.updatePic = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pictures",
    });

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: cloudinaryRes.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ profilePicture: updatedUser.profilePicture });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

userCltr.pic= async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Get the URL of the uploaded file from Cloudinary
    const profilePictureUrl = req.file.path;

    // Update the user's profile with the new profile picture URL
    const user = await User.findById(req.user._id); // Assuming you have JWT-based authentication and user is in req.user

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update the user's profile picture
    user.profilePicture = profilePictureUrl;
    await user.save();

    // Respond with the updated user profile
    res.status(200).json({
      message: 'Profile picture updated successfully.',
      profilePicture: profilePictureUrl,
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ error: 'Something went wrong while uploading the image.' });
  }
};

// userCltr.requestOtp = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ errors: 'User not found' });
//         }

//         // Generate a 6-digit OTP
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         // Store OTP temporarily (in-memory or Redis)
//         storeOtp(email, otp);

//         // Send OTP to the user's email
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Your OTP for Login',
//             text: `Your OTP is: ${otp}`,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return res.status(500).json({ error: 'Failed to send OTP' });
//             }
//             res.status(200).json({ message: 'OTP sent successfully' });
//         });
//     } catch (err) {
//         console.error("OTP Request Error:", err);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// };


userCltr.account = async (req, res) => {
    try {
        // Log currentUser to debug
        console.log('Authenticated User ID:', req.currentUser.userId);

        // Fetch the user using the correct userId
        const user = await User.findById(req.currentUser.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);  // Return user data
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};



userCltr.list = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

userCltr.one = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id;
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
userCltr.approve = async (req, res) => {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;
  
      // Update the user in the database
      const user = await User.findByIdAndUpdate(id, { isApproved }, { new: true });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Return the updated user
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };
  userCltr.getProofOfLicense = async (req, res) => {
    try {
      // Fetch the user and their proof of license from the database
      const user = await User.findById(req.params.id).select('proofOfLicense');
  
      // Check if the user exists and has a proof of license
      if (!user || !user.proofOfLicense) {
        return res.status(404).json({ error: "Proof of license not found" });
      }
  
      // Ensure only the user (customer) or admin can access the proof of license
      if (user._id.toString() !== req.currentUser.userId && req.currentUser.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }
  
      // Send the Cloudinary URL directly as the response
      res.status(200).json({ proofOfLicense: user.proofOfLicense });
    } catch (err) {
      console.error("Error fetching proof of license:", err);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  
  


export default userCltr;
