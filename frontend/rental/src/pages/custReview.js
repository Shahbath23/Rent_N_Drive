import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomerReviewPage() {
    const [completedBookings, setCompletedBookings] = useState([]);
    const [review, setReview] = useState({ rating: 5, comment: "" });
    const [selectedCar, setSelectedCar] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompletedBookings = async () => {
            try {
                const response = await axios.get("http://localhost:3020/reservations", {
                    headers: { Authorization: `${localStorage.getItem("token")}` },
                });

                // Filter completed reservations
                const completed = response.data.filter(
                    (booking) => booking.status?.toLowerCase() === "completed"
                );

                setCompletedBookings(completed);
            } catch (err) {
                console.error("Error fetching completed bookings:", err);
                setError("Failed to fetch bookings.");
            }
        };

        fetchCompletedBookings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!review.comment || review.rating < 1 || review.rating > 5 || !selectedCar) {
            setError("Please select a car and provide a valid rating and comment.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:3020/review",
                {
                    type: "Car",
                    targetId: selectedCar._id, // Car ID
                    rating: review.rating,
                    comment: review.comment,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${token}`,
                    },
                }
            );

            alert("Review submitted successfully!");
            setReview({ rating: 5, comment: "" });
            setSelectedCar(null);
            navigate("/home");
        } catch (err) {
            setError("Failed to submit the review.");
            console.error("Failed to submit the review:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            <h2 className="text-4xl font-extrabold text-teal-400 mb-8">Review Your Ride 🚗✨</h2>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl">
                <h3 className="text-2xl font-semibold mb-4 text-yellow-400">Completed Bookings</h3>
                {completedBookings.length > 0 ? (
                    <ul className="space-y-3">
                        {completedBookings.map((booking) => (
                            <li key={booking._id}>
                                <button
                                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                                    onClick={() => setSelectedCar(booking.car)}
                                >
                                    Review {booking.car.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No completed bookings to review.</p>
                )}
            </div>

            {selectedCar && (
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl mt-8">
                    <h3 className="text-2xl font-semibold text-yellow-400 mb-4">
                        Leave a Review for {selectedCar.name}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-lg font-medium text-teal-400">Rating (1-5):</label>
                            <select
                                id="rating"
                                value={review.rating}
                                onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                                disabled={loading}
                                className="mt-2 w-full bg-gray-700 text-white p-2 rounded-lg border border-teal-400"
                            >
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-lg font-medium text-teal-400">Comment:</label>
                            <textarea
                                id="comment"
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                disabled={loading}
                                className="mt-2 w-full bg-gray-700 text-white p-3 rounded-lg border border-teal-400"
                                placeholder="Share your experience..."
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-500 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                            >
                                {loading ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>

                    {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                </div>
            )}
        </div>
    );
}
