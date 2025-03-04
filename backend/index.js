import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";  
import path from "path";

import { checkSchema } from "express-validator";
import { userRegisterSchema } from "./validations/userRegisterSchema.js";
import { userLoginSchema } from "./validations/userLoginSchema.js";
import idValidationSchema from "./validations/idValidationSchema.js";
import reservationValidationSchema from "./validations/bookingValidationSchema.js";
import carValidationSchema from "./validations/carValidationSchema.js";


import userCltr from "./controller/userCltr.js";
import carCltr from "./controller/carCltr.js";
import reservationCltr from "./controller/bookingCltr.js";
import reviewCltr from "./controller/reviewCltr.js";

import authenticateUser from "./middleware/userAuth.js";
import authorizeUser from "./middleware/authorize.js";
import upload from "./middleware/multer.js";
import updateCarValidationSchema from "./validations/carUpdateSchema.js";
import paymentCltr from "./controller/paymentCltr.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
dotenv.config()
// Connect to the database
connectDB();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date()} - ${req.method} - ${req.ip} - ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


//routes for users
app.post('/user/register',  upload.fields([
  { name: 'proofOfLicense', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
]),checkSchema(userRegisterSchema),userCltr.create );
app.post('/user/login', checkSchema(userLoginSchema), userCltr.login);
app.get('/user/account', authenticateUser, userCltr.account);
app.get('/user', userCltr.list);
app.get('/user/:id', checkSchema(idValidationSchema), userCltr.one);
app.put('/user/:id/approve',authenticateUser,authorizeUser(["admin"]),userCltr.approve)
app.put('/update-profile',upload.single('ProfilePicture'),authenticateUser,authorizeUser(["customer","owner","admin"]),userCltr.updatePic)
app.post('/profilePic',upload.single('ProfilePicture'),authenticateUser,authorizeUser(["customer","owner"]),userCltr.pic)

app.post(
    '/car',
    authenticateUser,
    authorizeUser(['owner']),
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'proofOfCar', maxCount: 1 },
    ]),
    checkSchema(carValidationSchema),
    carCltr.create
  );
app.get('/cars', authenticateUser, authorizeUser(["admin","owner"]),carCltr.listOwnerCars);// Get all Cars for an Owner
app.get('/api/cars',authenticateUser,carCltr.listAllCars);
app.get('/car/:id', authenticateUser, carCltr.one);
app.put("/car/:id", authenticateUser,authorizeUser(["owner"]),upload.fields([{ name: "image", maxCount: 1 }, { name: "proofOfCar", maxCount: 1 }]),checkSchema(updateCarValidationSchema),carCltr.update)
app.delete('/car/:id', authenticateUser, authorizeUser(["owner","admin"]),carCltr.delete);
app.put('/admin/car/:id/approve', authenticateUser,authorizeUser(["admin"]), carCltr.approveCar);
app.put('/car/return/:id', authenticateUser,authorizeUser(["owner"]), carCltr.statusUpdate);
app.get('/address-suggestions',authenticateUser,authorizeUser(["owner"]),carCltr.address)
app.get('/admin/cars',authenticateUser,authorizeUser(["admin"]),carCltr.listAllCarsAdmin)


app.post('/reservation', authenticateUser,authorizeUser(["customer"]),checkSchema(reservationValidationSchema),reservationCltr.createReservation);
app.get('/reservation/:id', authenticateUser, reservationCltr.getReservationById);
app.get('/reservations', authenticateUser,authorizeUser(["customer","admin","owner"]),reservationCltr.getUserReservations);
app.get('/admin/reservations', authenticateUser, authorizeUser(['admin']), reservationCltr.getAllReservations);
app.put('/reservation/update/:id', authenticateUser, reservationCltr.updateReservation);
app.delete('/reservation/cancel/:id', authenticateUser, reservationCltr.deleteReservation);
app.get('/reservations/car/:id', authenticateUser,authorizeUser(["owner"]), reservationCltr.getReservationsByCarId);
app.put('/reservation/cancel/:id', authenticateUser,authorizeUser(["owner","customer"]), reservationCltr.cancelReservation);
app.put('/reservation/:id/confirm',authenticateUser,reservationCltr.confirmReservation)
app.get('/admin/bookings',authenticateUser,authorizeUser(["admin"]),reservationCltr.adminBook)

app.post('/payment', authenticateUser,authorizeUser(["customer","admin"]),paymentCltr.createPayment);
app.post('/payment/verify', authenticateUser, authorizeUser(["customer", "admin"]), paymentCltr.verifyPayment);
// app.get('/payment', authenticateUser,authorizeUser(["admin"]),paymentCltr.listPayments);
// app.get('/payment/user/:id', authenticateUser,authorizeUser(["admin","owner"]),paymentCltr.listOwnerPayments);
app.get('/payments/car/:id',authenticateUser,authorizeUser(["owner","admin"]),paymentCltr.carPayment)
app.get('/payments/admin',authenticateUser,authorizeUser(["admin"]),paymentCltr.adminPayments)
app.get('/payments/customer',authenticateUser,authorizeUser(["customer"]),paymentCltr.customerPayments)



app.post('/review',authenticateUser,authorizeUser(["owner","customer"]),reviewCltr.add)
app.get('/reviews',authenticateUser,authorizeUser(["admin"]),reviewCltr.getReview)
app.get('/reviews/:id',authenticateUser,authorizeUser(["customer","owner"]),reviewCltr.ownReviews)
app.delete('/reviews',authenticateUser,authorizeUser(["admin","customer"]),reviewCltr.delete)
app.get('/admin/reviews',authenticateUser,authorizeUser(["admin"]),reviewCltr.adminReviews)
app.get('/customer/reviews',authenticateUser,authorizeUser(["customer"]),reviewCltr.customerReviews)
app.get('/reviews/car/:id',authenticateUser,authorizeUser(["customer"]),reviewCltr.carReview)

// Start the server
const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
