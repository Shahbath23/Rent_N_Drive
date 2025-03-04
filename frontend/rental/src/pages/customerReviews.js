import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaStar, FaCar, FaArrowLeft } from "react-icons/fa";

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not authenticated. Please log in.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get("http://localhost:3020/customer/reviews", {
                    headers: { Authorization: `${token}` },
                });

                console.log("API Response:", response.data); // Debugging
                setReviews(response.data); // Ensure the response is correctly structured
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Failed to fetch reviews. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2 text-gray-800 bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
                <FaArrowLeft /> Back
            </button>

            <h2 className="text-3xl font-semibold text-gray-800 mb-6">My Reviews</h2>

            {loading && <p className="text-gray-600">Loading reviews...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && reviews.length === 0 && (
                <p className="text-gray-600">You haven't posted any reviews yet.</p>
            )}

            {/* Reviews List */}
            <div className="w-full max-w-2xl">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white shadow-md rounded-lg p-6 mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                            <FaCar className="text-blue-500" /> 
                            {review.reviewedEntity?.name || "Unknown Car"}
                        </h3>
                        <div className="flex items-center mt-2 text-yellow-500">
                            {[...Array(5)].map((_, index) => (
                                <FaStar key={index} className={index < review.rating ? "text-yellow-500" : "text-gray-300"} />
                            ))}
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Posted on {new Date(review.createdAt).toLocaleDateString("en-GB")}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerReviews;
