import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomerNavbar from '../components/customerNavbar';

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [today] = useState(new Date());

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get('http://localhost:3020/reservations', {
                    headers: { Authorization: `${localStorage.getItem('token')}` },
                });
                setBookings(response.data);
            } catch (err) {
                setError('Failed to fetch bookings.');
            }
            setLoading(false);
        };
        fetchBookings();
    }, []);

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const pastBookings = bookings.filter((b) => new Date(b.endDate) < today);
    const futureBookings = bookings.filter((b) => (b.status === 'confirmed' || b.status === 'ongoing') && new Date(b.startDate) > today);
    const ongoingBookings = bookings.filter((b) => (b.status === 'confirmed' || b.status === 'ongoing') && new Date(b.startDate) <= today && new Date(b.endDate) >= today);
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

    const totalAmountSpent = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await axios.put(`http://localhost:3020/reservation/cancel/${bookingId}`, {}, {
                headers: { Authorization: `${localStorage.getItem('token')}` },
            });
            setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b)));
        } catch (err) {
            setError('Failed to cancel booking.');
        }
    };

    const handleUpdate = (bookingId) => {
        alert(`Redirecting to update form for booking ID: ${bookingId}`);
        // You can replace the alert with navigation logic
    };

    if (loading) return <div className="text-center py-5">Loading bookings...</div>;

    return (
        <div>
            <CustomerNavbar />
            <div className="max-w-6xl mx-auto p-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Bookings</h2>
                {error && <div className="text-red-500">{error}</div>}

                {/* Statistics Section */}
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-medium text-gray-700">Booking Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <StatCard label="Total Bookings" value={bookings.length} />
                        <StatCard label="Total Amount Spent" value={`Rs ${totalAmountSpent}`} />
                        <StatCard label="Ongoing Bookings" value={ongoingBookings.length} />
                        <StatCard label="Future Bookings" value={futureBookings.length} />
                        <StatCard label="Past Bookings" value={pastBookings.length} />
                        <StatCard label="Cancelled Bookings" value={cancelledBookings.length} />
                    </div>
                </div>

                <BookingSection title="Ongoing Bookings" bookings={ongoingBookings} formatDate={formatDate} onCancel={handleCancel} />
                <BookingSection title="Future Bookings" bookings={futureBookings} formatDate={formatDate} onCancel={handleCancel} onUpdate={handleUpdate} />
                <BookingSection title="Past Bookings" bookings={pastBookings} formatDate={formatDate} />
                <BookingSection title="Cancelled Bookings" bookings={cancelledBookings} formatDate={formatDate} />
            </div>
        </div>
    );
}

// Booking Section Component
function BookingSection({ title, bookings, formatDate, onCancel, onUpdate }) {
    const placeholderImage = "https://via.placeholder.com/100?text=No+Image";
    return (
        <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-700 mb-2">{title}</h3>
            {bookings.length === 0 ? (
                <p className="text-gray-500">No {title.toLowerCase()}.</p>
            ) : (
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Image</th>
                            <th className="border border-gray-300 p-2">Car</th>
                            <th className="border border-gray-300 p-2">Start Date</th>
                            <th className="border border-gray-300 p-2">End Date</th>
                            <th className="border border-gray-300 p-2">Status</th>
                            <th className="border border-gray-300 p-2">Total Amount</th>
                            {(onCancel || onUpdate) && <th className="border border-gray-300 p-2">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id} className="border-b hover:bg-gray-50 text-center">
                                <td className="p-3">
                                    <img
                                        src={booking.car?.image || placeholderImage}
                                        alt="Car"
                                        className="w-20 h-14 object-cover rounded-md mx-auto"
                                    />
                                </td>
                                <td className="p-3">{booking.car?.name || "Car details unavailable"}</td>
                                <td className="p-3">{formatDate(booking.startDate)}</td>
                                <td className="p-3">{formatDate(booking.endDate)}</td>
                                <td className="p-3">{booking.status}</td>
                                <td className="p-3">Rs {booking.totalAmount}</td>
                                {(onCancel || onUpdate) && (
                                    <td className="p-3 flex justify-center space-x-2">
                                        {onCancel && booking.status !== 'cancelled' && (
                                            <button
                                                onClick={() => onCancel(booking._id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {onUpdate && (
                                            <button
                                                onClick={() => onUpdate(booking._id)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                            >
                                                Update
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-white p-3 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-sm">{label}</p>
            <p className="text-lg font-semibold text-gray-800">{value}</p>
        </div>
    );
}
