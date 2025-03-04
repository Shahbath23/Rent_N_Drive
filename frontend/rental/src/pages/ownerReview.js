import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import OwnerNavbar from "../components/OwnerNavbar";



export default function OwnerReviewPage() {
    const { carId } = useParams();
    const [completedBookings, setCompletedBookings] = useState([]);
    const [review, setReview] = useState({
        rating: 5,
        comment: "",
    });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!carId) {
            console.error("No carId available in URL params");
            return;
        }

        const fetchCompletedBookings = async () => {
            try {
                const response = await axios.get(`http://localhost:3020/reservations/car/${carId}`, {
                    headers: { "Authorization": `${localStorage.getItem('token')}` }
                });

                const completed = response.data.filter((booking) => booking.status && booking.status.toLowerCase() === 'completed' && booking.car._id === carId);
                setCompletedBookings(completed);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to fetch bookings.");
            }
        };

        fetchCompletedBookings();
    }, [carId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!review.comment || review.rating < 1 || review.rating > 5 || !selectedBooking) {
            setError("Please provide a valid rating, comment, and select a booking.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                "http://localhost:3020/review",
                {
                    type: "User",
                    targetId: selectedBooking.user._id,
                    rating: review.rating,
                    comment: review.comment,
                },
                {
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `${token}` 
                    },
                }
            );

            setReview({ rating: 5, comment: "" });
            setSelectedBooking(null);
            navigate("/home");
        } catch (err) {
            setError("Failed to submit the review.");
            console.error("Failed to submit the review:", err.response ? err.response.data : err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <OwnerNavbar />

            <div className="container mx-auto p-6">
                <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Review Customers</h2>

                <div className="mb-6">
                    <h3 className="text-xl font-medium mb-4">Select a completed booking to review:</h3>
                    {completedBookings.length > 0 ? (
                        <ul className="space-y-4">
                            {completedBookings.map((booking) => (
                                <li key={booking._id}>
                                    <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className="w-full text-left p-4 bg-white border rounded-lg shadow hover:bg-indigo-50"
                                    >
                                        Review {booking.user.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No completed bookings to review.</p>
                    )}
                </div>

                {selectedBooking && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold mb-4">
                            Leave a Review for {selectedBooking.user.name}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="rating" className="block text-lg font-medium mb-2">Rating (1-5):</label>
                                <select
                                    id="rating"
                                    value={review.rating}
                                    onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    disabled={loading}
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="comment" className="block text-lg font-medium mb-2">Comment:</label>
                                <textarea
                                    id="comment"
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    rows="4"
                                    disabled={loading}
                                />
                            </div>

                            <div className="mb-4">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>

                        {error && <p className="text-red-600">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
