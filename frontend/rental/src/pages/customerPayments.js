import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    FaRupeeSign, 
    FaCar, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaArrowLeft, 
    FaClock, 
    FaChartBar 
} from "react-icons/fa";

const CustomerPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                console.log("Fetching customer payments...");
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("User not authenticated. Please log in.");
                    setLoading(false);
                    return;
                }

                const response = await axios.get("http://localhost:3020/payments/customer", {
                    headers: { Authorization: `${token}` },
                });

                console.log("Payments fetched successfully:", response.data);
                setPayments(response.data);
            } catch (err) {
                console.error("Error fetching payments:", err);
                setError("Failed to fetch payments. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Function to format date as DD/M/YYYY
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Statistics
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.paymentStatus === "Success").length;
    const failedPayments = payments.filter(p => p.paymentStatus === "Failed").length;
    const pendingPayments = payments.filter(p => p.paymentStatus === "Pending").length;
    const totalAmountSpent = payments.filter(p => p.paymentStatus === "Success").reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2 text-gray-800 bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
                <FaArrowLeft /> Back
            </button>

            <h2 className="text-3xl font-semibold text-gray-800 mb-6">My Payments</h2>

            {loading && <p className="text-gray-600">Loading payments...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && payments.length === 0 && (
                <p className="text-gray-600">You haven't made any payments yet.</p>
            )}

            {/* Statistics Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full max-w-3xl">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                    <FaChartBar className="text-blue-500" /> Payment Statistics
                </h3>
                <p className="text-gray-700 mt-2">Total Payments: {totalPayments}</p>
                <p className="text-green-600 mt-1">Successful: {successfulPayments}</p>
                <p className="text-red-600 mt-1">Failed: {failedPayments}</p>
                <p className="text-yellow-600 mt-1">Pending: {pendingPayments}</p>
                <p className="text-gray-800 mt-1 font-semibold">Total Amount Spent: <FaRupeeSign className="inline" /> {totalAmountSpent}</p>
            </div>

            {/* Payments List */}
            <div className="w-full max-w-3xl">
                {payments.map((payment) => {
                    let statusText = "";
                    let statusColor = "";
                    let statusIcon = null;

                    // Determine the text, color, and icon based on payment status
                    if (payment.paymentStatus === "Success") {
                        statusText = "Payment Successful";
                        statusColor = "text-green-600";
                        statusIcon = <FaCheckCircle />;
                    } else if (payment.paymentStatus === "Failed") {
                        statusText = "Payment Failed";
                        statusColor = "text-red-600";
                        statusIcon = <FaTimesCircle />;
                    } else if (payment.paymentStatus === "Pending") {
                        statusText = "Payment Pending";
                        statusColor = "text-yellow-600";
                        statusIcon = <FaClock />;
                    }

                    return (
                        <div key={payment._id} className="bg-white shadow-md rounded-lg p-6 mb-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                                <FaCar className="text-blue-500" /> {payment.carId?.name || "Unknown Car"}
                            </h3>
                            <p className="flex items-center text-lg text-gray-700 mt-2">
                                <FaRupeeSign className="text-green-600" /> {payment.amount}
                            </p>

                            {/* Payment Status in Written Form */}
                            <p className={`flex items-center gap-2 mt-2 text-lg ${statusColor}`}>
                                {statusIcon} {statusText}
                            </p>

                            {/* Formatted Payment Date */}
                            <p className="text-sm text-gray-500 mt-2">
                                Paid on {formatDate(payment.createdAt)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomerPayments;
