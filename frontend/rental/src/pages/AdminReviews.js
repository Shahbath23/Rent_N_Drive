import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { FaCar, FaUser, FaStar } from "react-icons/fa";

export default function AdminReviews() {
  const [carReviews, setCarReviews] = useState({});
  const [customerReviews, setCustomerReviews] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get("http://localhost:3020/admin/reviews", {
          headers: { Authorization: `${localStorage.getItem("token")}` },
        });

        setCarReviews(data.groupedByCar); // Reviews of cars by customers
        setCustomerReviews(data.groupedByUser); // Reviews of customers by owners
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Reviews Overview</h1>

        {/* Customer Reviews for Cars (Written by Customers) */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FaCar className="text-blue-500" /> Customer Reviews for Cars
          </h2>
          {Object.keys(carReviews).length === 0 ? (
            <p className="text-gray-600">No reviews available.</p>
          ) : (
            Object.keys(carReviews).map((carName) => (
              <div key={carName} className="bg-white shadow-md p-6 rounded-lg my-4">
                <h3 className="text-xl font-semibold">{carName}</h3>
                {carReviews[carName].map((review) => (
                  <ReviewCard key={review._id} review={review} reviewType="car" />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Owner Reviews for Customers (Written by Owners) */}
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FaUser className="text-green-500" /> Owner Reviews for Customers
          </h2>
          {Object.keys(customerReviews).length === 0 ? (
            <p className="text-gray-600">No reviews available.</p>
          ) : (
            Object.keys(customerReviews).map((customerName) => (
              <div key={customerName} className="bg-white shadow-md p-6 rounded-lg my-4">
                <h3 className="text-xl font-semibold">
                  <span className="text-blue-600">Reviewed Customer:</span> {customerReviews[customerName][0]?.reviewedEntity?.name || "Anonymous"} 
                  ({customerReviews[customerName][0]?.reviewedEntity?.email || "N/A"}, 
                  {customerReviews[customerName][0]?.reviewedEntity?.phoneNo || "N/A"})
                </h3>
                {customerReviews[customerName].map((review) => (
                  <ReviewCard key={review._id} review={review} reviewType="customer" />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review, reviewType }) {
  return (
    <div className="border-l-4 border-yellow-500 bg-gray-50 p-4 my-2 rounded-lg shadow-sm">
      {reviewType === "car" ? (
        // Customer Reviewing a Car
        <p className="text-gray-700">
          <strong>Customer:</strong> {review.reviewer?.name || "Anonymous"} 
          ({review.reviewer?.email || "N/A"}, {review.reviewer?.phoneNo || "N/A"})
        </p>
      ) : (
        // Owner Reviewing a Customer
        <>
          <p className="text-gray-700">
            <strong>Reviewer (Owner):</strong> {review.reviewer?.name || "Anonymous"} 
            ({review.reviewer?.email || "N/A"}, {review.reviewer?.phoneNo || "N/A"})
          </p>
         
        </>
      )}
      
      <p className="text-gray-700 flex items-center">
        <strong>Rating:</strong> {review.rating}
        <FaStar className="text-yellow-500 ml-1" />
      </p>
      <p className="text-gray-700">
        <strong>Review:</strong> {review.comment || "No comments provided."}
      </p>
    </div>
  );
}
