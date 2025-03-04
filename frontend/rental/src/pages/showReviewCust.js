import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

export default function CustomerReviews() {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userId } = useParams();

    useEffect(() => {
        const fetchCustomerReviews = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError('No authentication token found');
                    setLoading(false);
                    return;
                }

                if (!userId) {
                    setError('User ID not found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`http://localhost:3020/reviews/${userId}`, {
                    headers: { Authorization: `${token}` },
                });

                setReviews(response.data.reviews);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching reviews:", err.response?.data || err.message);
                setError(err.response?.data.message || 'Error fetching reviews');
                setLoading(false);
            }
        };

        fetchCustomerReviews();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            <h2 className="text-4xl font-extrabold text-teal-400 mb-6">Your Reviews 📝</h2>

            <Link
                to="/dashboard"
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 mb-6"
            >
                Back to Dashboard
            </Link>

            {loading ? (
                <p className="text-gray-400 text-lg">Loading reviews...</p>
            ) : error ? (
                <p className="text-red-400 text-lg">{error}</p>
            ) : reviews.length > 0 ? (
                <ul className="w-full max-w-3xl space-y-6">
                    {reviews.map((review) => (
                        <li key={review._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-semibold text-yellow-400">
                                {review.reviewedEntity?.name || "Unknown Car"}
                            </h3>
                            <p className="text-lg mt-2">
                                <span className="text-teal-400 font-medium">Rating:</span> ⭐ {review.rating} / 5
                            </p>
                            <p className="text-gray-300 mt-2">
                                <span className="text-teal-400 font-medium">Comment:</span> {review.comment}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400 text-lg">You haven't posted any reviews yet.</p>
            )}
        </div>
    );
}
