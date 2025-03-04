import mongoose from 'mongoose';
import { type } from 'os';

const carSchema = new mongoose.Schema(
  {
    name: {type: String},
    make: {type: String},
    model: {type: String},
    year: { type: Number},
    licensePlate: { type: String},
    dailyRate: {type: Number},
    status: { 
      type: String, 
      enum: ['Available', 'Rented'],
      default: 'Available' 
    },
    latitude: { 
      type: Number, 
    },
    longitude: { 
      type: Number, 
    },
    address:String,
    googleMapsLink: {
      type: String,
      required: true,
      trim: true,
    },
    transmission: {
      type: String,
      enum: ['Automatic', 'Manual'],
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    },
    seats: {
      type: Number,
      
    },
    mileage: {
      type: Number,
      
    },
    features: {
      type: String,
    },
    image: {
      type: String, // File path or URL
    },
    proofOfCar: {
      type:String
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
    },
    approved: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true,
  })
const Car = mongoose.model('Car', carSchema);

export default Car;
