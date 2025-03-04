import { checkSchema } from 'express-validator';

const carValidationSchema = {
  name: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Car name is required',
    },
  },
  make: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Car make is required',
    },
  },
  model: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Car model is required',
    },
  },
  year: {
    in: ['body'],
    isInt: {
      options: { min: 1900, max: new Date().getFullYear() + 1 },
      errorMessage: `Year must be between 1900 and ${new Date().getFullYear() + 1}`,
    },
    toInt: true,
  },
  licensePlate: {
    in: ['body'],
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'License plate is required',
    },
    isLength: {
      options: { min: 1, max: 10 },
      errorMessage: 'License plate must be between 1 and 10 characters',
    },
  },
  dailyRate: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Daily rate must be a positive number',
    },
    toFloat: true,
  },
  status: {
    in: ['body'],
    optional: true,
    isIn: {
      options: [['Available', 'Rented']],
      errorMessage: 'Status must be either "Available" or "Rented"',
    },
  },
  address: {
    in: ['body'],
    exists: { errorMessage: 'Address field is required' },
    notEmpty: { errorMessage: 'Address cannot be empty' },},
    
  transmission: {
    in: ['body'],
    isString: true,
    isIn: {
      options: [['Automatic', 'Manual']],
      errorMessage: 'Transmission must be either "Automatic" or "Manual"',
    },
  },
  fuelType: {
    in: ['body'],
    isString: true,
    isIn: {
      options: [['Petrol', 'Diesel', 'Electric', 'Hybrid']],
      errorMessage: 'Fuel type must be one of "Petrol", "Diesel", "Electric", or "Hybrid"',
    },
  },
  seats: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'Seats must be at least 1',
    },
    toInt: true,
  },
  mileage: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Mileage must be a positive number',
    },
    toFloat: true,
  },
  features: {
    in: ['body'],
    optional: true,
  },
  image: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'Image URL is required',
    },
  },
  'proofOfCar.filePath': {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'Proof of car file path is required',
    },
  },
  'proofOfCar.documentType': {
    in: ['body'],
    isString: true,
    isIn: {
      options: [['Registration', 'Insurance', 'Inspection']],
      errorMessage: 'Document type must be "Registration", "Insurance", or "Inspection"',
    },
  },
  userId: {
    in: ['body'],
    isMongoId: true,
    errorMessage: 'Invalid user ID',
  },
  approved: {
    in: ['body'],
    optional: true,
    isBoolean: true,
    toBoolean: true,
  },
};

export default carValidationSchema;
