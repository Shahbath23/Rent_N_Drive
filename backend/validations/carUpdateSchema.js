import { checkSchema } from 'express-validator';

const updateCarValidationSchema = {
  name: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Car name cannot be empty if provided',
    },
  },
  make: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Car make cannot be empty if provided',
    },
  },
  model: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Car model cannot be empty if provided',
    },
  },
  year: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isInt: {
      options: { min: 1900, max: new Date().getFullYear() + 1 },
      errorMessage: `Year must be between 1900 and ${new Date().getFullYear() + 1}`,
    },
    toInt: true,
  },
  licensePlate: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isString: true,
    trim: true,
    notEmpty: {
      errorMessage: 'License plate cannot be empty if provided',
    },
    isLength: {
      options: { min: 1, max: 10 },
      errorMessage: 'License plate must be between 1 and 10 characters',
    },
  },
  dailyRate: {
    in: ['body'],
    optional: true, // Make this optional for updates
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
    optional: true, // Make this optional for updates
    exists: { errorMessage: 'Address field cannot be empty if provided' },
    notEmpty: { errorMessage: 'Address cannot be empty if provided' },
  },
  transmission: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isString: true,
    isIn: {
      options: [['Automatic', 'Manual']],
      errorMessage: 'Transmission must be either "Automatic" or "Manual"',
    },
  },
  fuelType: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isString: true,
    isIn: {
      options: [['Petrol', 'Diesel', 'Electric', 'Hybrid']],
      errorMessage: 'Fuel type must be one of "Petrol", "Diesel", "Electric", or "Hybrid"',
    },
  },
  seats: {
    in: ['body'],
    optional: true, // Make this optional for updates
    isInt: {
      options: { min: 1 },
      errorMessage: 'Seats must be at least 1',
    },
    toInt: true,
  },
  mileage: {
    in: ['body'],
    optional: true, // Make this optional for updates
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
    optional: true, // Make this optional for updates
    isString: true,
    notEmpty: {
      errorMessage: 'Image'}}
    }
    export default updateCarValidationSchema