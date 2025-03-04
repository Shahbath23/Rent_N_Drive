import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // Reference to the Car model
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentStatus: { type: String, default: 'Pending' },
    paymentMethod: { type: String, required: true },
    paymentOrderId: { type: String, required: true },
    transactionId: { type: String, required: true },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
