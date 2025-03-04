import Review from "../model/reviewModel.js";
import Car from "../model/carModel.js";
import User from "../model/userModel.js";

 const reviewCltr={}
 reviewCltr.add = async (req, res) => {
  try {
      const { targetId, type, rating, comment } = req.body;
      const reviewer = req.currentUser.userId; // Assumes user is authenticated

      // Validate the review type
      if (!['Car', 'User'].includes(type)) {
          return res.status(400).json({ message: 'Invalid review type' });
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Check if the reviewed entity exists (either Car or User)
      let reviewedEntityObj;
      if (type === 'User') {
          reviewedEntityObj = await User.findById(targetId);  // Use targetId instead of reviewedEntity
      } else if (type === 'Car') {
          reviewedEntityObj = await Car.findById(targetId);  // Same for Car if that's the type
      }

      if (!reviewedEntityObj) {
          return res.status(404).json({ message: `${type} not found` });
      }

      // Create the review
      const review = new Review({
          reviewer,
          reviewedEntity: targetId,  // Use targetId here as well
          type,
          rating,
          comment,
      });

      await review.save();
      res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding review' });
  }
};



  reviewCltr.getReview= async (req, res) => {
    try {
      const { reviewedEntity, type } = req.query;
  
      const reviews = await Review.find({ reviewedEntity, type })
        .populate('reviewer', 'name email') // Populate reviewer details
        .sort({ date: -1 });
  
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  };

  reviewCltr.delete=async (req, res) => {
    try {
      const { reviewId } = req.params; // Review ID to delete
      const userId = req.user._id; // Logged-in user's ID (from authentication middleware)
  
      // Find the review
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Check if the user is the reviewer
      if (review.reviewer.toString() === userId.toString()) {
        await review.remove();
        return res.status(200).json({ message: 'Review deleted successfully' });
      }
  
      // Check if the user is the owner of the car associated with the review
      if (review.type === 'Car') {
        const car = await Car.findById(review.reviewedEntity);
  
        if (car && car.userId.toString() === userId.toString()) {
          await review.remove();
          return res.status(200).json({ message: 'Review deleted successfully by car owner' });
        }
      }
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error deleting review' });
  }
};
reviewCltr.ownReviews = async (req, res) => {
  try {
      if (!req.currentUser) {
          return res.status(401).json({ message: 'User not authenticated' });
      }

      const userId = req.currentUser.userId;
      const role = req.currentUser.role;

      console.log('User ID:', userId);
      console.log('Role:', role);

      if (role === 'customer') {
          const userReviews = await Review.find({ reviewer: userId })
            .populate({
              path: 'reviewedEntity',
              select: 'name ',
            });

          console.log("User Reviews:", userReviews);

          return res.status(200).json({
            message: 'Reviews written by customer',
            reviews: userReviews,
          });
      }

      if (role === 'owner') {
          const ownerCars = await Car.find({ userId }).select('_id');
          const carIds = ownerCars.map(car => car._id);
          const carReviews = await Review.find({ reviewedEntity: { $in: carIds }, type: 'Car' })
            .populate({
              path: 'reviewedEntity',
              select: 'name',
            });

          console.log("Car Reviews:", carReviews);

          return res.status(200).json({
            message: 'Reviews for your cars',
            reviews: carReviews,
          });
      }

      return res.status(403).json({ message: 'You are not authorized to view reviews' });
  } catch (err) {
      console.error("Error retrieving reviews:", err);
      return res.status(500).json({ message: 'Server error' });
  }
};



reviewCltr.adminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("reviewer", "name email phoneNo") // Who wrote the review
      .populate({
        path: "reviewedEntity",
        select: "name email phoneNo make model", // Get customer or car details
      })
      .exec();

    const groupedByCar = {};
    const groupedByUser = {};

    reviews.forEach((review) => {
      if (review.type === "Car" && review.reviewedEntity) {
        const carName = `${review.reviewedEntity.make} ${review.reviewedEntity.model} (${review.reviewedEntity.name})`;
        if (!groupedByCar[carName]) groupedByCar[carName] = [];
        groupedByCar[carName].push(review);
      }

      if (review.type === "User" && review.reviewedEntity) {
        const customerName = review.reviewedEntity.name;
        if (!groupedByUser[customerName]) groupedByUser[customerName] = [];
        groupedByUser[customerName].push(review);
      }
    });

    res.json({ groupedByCar, groupedByUser });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


reviewCltr.customerReviews= async (req, res) => {
  try {
      const userId = req.currentUser.userId;  // Ensure this is set correctly
      console.log("Logged-in user ID:", userId);

      const reviews = await Review.find({ reviewer: userId })  // Use `reviewer` instead of `customerId`
          .populate("reviewedEntity", "name");  // Populate the car name

      console.log("Fetched Reviews:", reviews);

      res.json(reviews);
  } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Server error" });
  }
}

reviewCltr.carReview=async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // "Car" or "User"

    if (!type || !["Car", "User"].includes(type)) {
      return res.status(400).json({ message: "Invalid review type" });
    }

    const reviews = await Review.find({ reviewedEntity: id, type })
      .populate("reviewer", "name") // Populate reviewer's name
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
}









  export default reviewCltr