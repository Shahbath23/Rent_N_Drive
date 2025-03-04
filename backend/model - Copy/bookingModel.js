import mongoose from 'mongoose';
import Car from './carModel.js';
const reservationSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
    
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
       
    },
    startDate: {
        type: Date,
       
    },
    endDate: {
        type: Date,
       
    },
    status: {
        type: String,
        enum: ['pending','confirmed', 'ongoing', 'completed','cancelled'], 
        default: 'pending',
    },
    totalAmount: {
        type: Number,
      
    }
}, { 
    timestamps: true
});


const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
