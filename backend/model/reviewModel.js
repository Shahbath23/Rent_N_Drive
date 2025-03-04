import mongoose from "mongoose";
const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedEntity: { type: mongoose.Schema.Types.ObjectId, refPath: 'type', required: true }, // Reference to Car, User, or Service
    type: { type: String, enum: ['Car', 'User'], required: true }, // Defines the type of review
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Review= mongoose.model("Review",reviewSchema)
export default Review