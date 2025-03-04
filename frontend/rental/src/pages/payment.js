import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingData, bookingId } = location.state || {}; // Get booking data
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const carId = bookingData?.car?._id || bookingData?.carId;
    const totalAmount = bookingData?.totalAmount;

    useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => setScriptLoaded(true);
            script.onerror = () => setError("Error loading Razorpay script.");
            document.body.appendChild(script);
        };
        loadRazorpayScript();
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("User not authenticated. Please log in again.");
                setLoading(false);
                return;
            }

            if (!carId || !totalAmount || !bookingId) {
                setError("Invalid booking data.");
                setLoading(false);
                return;
            }

            console.log("📤 Sending Payment Request:", { amount: totalAmount, carId, bookingId });

            // Request Backend to Create a Payment Order
            const response = await axios.post(
                "http://localhost:3020/payment",
                { amount: totalAmount, carId, bookingId, paymentMethod: "Razorpay" },
                { headers: { Authorization: `${token}` } }
            );

            if (response.status !== 200) {
                setError("Failed to create payment order. Please try again.");
                setLoading(false);
                return;
            }

            const { orderId, key } = response.data;

            if (scriptLoaded && window.Razorpay) {
                const options = {
                    key,
                    amount: totalAmount * 100, // Convert to paise
                    currency: "INR",
                    name: "Car Rental",
                    description: `Payment for ${carId}`,
                    order_id: orderId,
                    handler: async function (response) {
                        console.log("🔹 Razorpay Payment Response:", response);
                    
                        if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
                            setError("Invalid Razorpay response. Payment ID missing.");
                            return;
                        }
                    
                        try {
                            // Verify Payment with Backend
                            await axios.post(
                                "http://localhost:3020/payment/verify",
                                {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                },
                                { headers: { Authorization: `${token}` } }
                            );
                    
                            // Confirm Reservation
                            await axios.put(
                                `http://localhost:3020/reservation/${bookingId}/confirm`,
                                {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    status: "Success",
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                },
                                { headers: { Authorization: `${token}` } }
                            );
                    
                            console.log("✅ Payment successful! Redirecting to Bookings...");
                    
                            // Use replace: true to prevent going back
                            navigate("/bookings", { replace: true });
                        } catch (err) {
                            setError("Payment verification failed.");
                        }
                    }
                  
                  
                };

                const rzp = new window.Razorpay(options);
              
                // Event listener for successful payment
                rzp.on("payment.success", function (response) {
                    console.log("✅ Razorpay Success Event Triggered");
                    setTimeout(() => navigate("/bookings", { replace: true }), 1000);
                });

                // Event listener for failed payment
                rzp.on("payment.failed", function (response) {
                    console.log("❌ Razorpay Payment Failed:", response.error);
                    setError("Payment failed. Please try again.");
                });

                rzp.open();
            } else {
                setError("Razorpay script not loaded properly. Please try again later.");
            }
        } catch (err) {
            setError("Error initiating payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800 text-center">Payment for Booking</h2>
                <p className="text-lg text-gray-700 text-center mt-4"><b>Total Amount:</b> ₹{totalAmount}</p>

                {/* Pay Now Button */}
                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className={`w-full mt-6 py-3 rounded-lg text-lg font-medium text-white transition ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                    {loading ? "Processing..." : "Pay Now"}
                </button>

                {/* Error Message */}
                {error && <p className="text-red-600 text-center mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default PaymentPage;
