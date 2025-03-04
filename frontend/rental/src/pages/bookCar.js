import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import pic from "./pic.png";
import "leaflet/dist/leaflet.css";

export default function CarBooking() {
    const { carId } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pickupLocation, setPickupLocation] = useState(null);
    const [addressError, setAddressError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [isBookingDisabled, setIsBookingDisabled] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [customer, setCustomer] = useState(null);
    const [isCustomerApproved, setIsCustomerApproved] = useState(null);
    const navigate = useNavigate();

    const customIcon = useMemo(
        () =>
            L.icon({
                iconUrl: pic,
                iconSize: [25, 29],
                iconAnchor: [1, 41],
                popupAnchor: [1, -34],
            }),
        []
    );

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3020/car/${carId}`, {
                    headers: { Authorization: `${localStorage.getItem("token")}` },
                });
                setCar(response.data);
                geocodeAddress(response.data.address);
                setLoading(false);
            } catch (err) {
                setAddressError("Unable to fetch car details.");
                setLoading(false);
            }
        };

        const fetchCustomerDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3020/user/account`, {
                    headers: { Authorization: `${localStorage.getItem("token")}` },
                });
                setCustomer(response.data);
                setIsCustomerApproved(response.data.isApproved);
            } catch (err) {
                alert("Error fetching customer details.");
            }
        };

        fetchCarDetails();
        fetchCustomerDetails();
    }, [carId]);

    const geocodeAddress = async (address) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: address, format: 'json', addressdetails: 1, limit: 1 },
            });

            if (response.data.length > 0) {
                const location = response.data[0];
                setPickupLocation([parseFloat(location.lat), parseFloat(location.lon)]);
                setAddressError(null);
            } else {
                setAddressError('Unable to find the location.');
            }
        } catch (err) {
            setAddressError('Error geocoding the address.');
        }
    };

    const calculateTotalAmount = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            let days = (end - start) / (1000 * 60 * 60 * 24);
            days = days === 0 ? 1 : days;

            if (days > 0) {
                setTotalAmount(days * car.dailyRate);
                setIsBookingDisabled(false);
            } else {
                setTotalAmount(0);
                setIsBookingDisabled(true);
            }
        }
    };

    const validateForm = () => {
        let errors = {};
        const today = new Date().toISOString().split("T")[0];

        if (!startDate) errors.startDate = "Start date is required.";
        else if (startDate < today) errors.startDate = "Start date cannot be in the past.";

        if (!endDate) errors.endDate = "End date is required.";
        else if (endDate < startDate) errors.endDate = "End date must be after start date.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirmBooking = async () => {
        if (!validateForm() || !car) return alert("Please fill all required fields.");

        try {
            const bookingData = { carId: car._id, startDate, endDate, totalAmount };
            const token = localStorage.getItem("token");
            if (!token) return alert("You are not authenticated. Please log in.");

            const response = await axios.post(`http://localhost:3020/reservation`, bookingData, {
                headers: { Authorization: `${token}` },
            });

            const bookingId = response.data.bookingId || response.data.reservation?._id;
            navigate("/payment", { state: { bookingData, bookingId } });
        } catch (err) {
            alert(err.response?.data?.error || "Booking failed. Please try again.");
        }
    };

    useEffect(() => {
        calculateTotalAmount();
    }, [startDate, endDate]);

    const today = new Date().toISOString().split("T")[0];

    if (loading) return <p className="text-center text-lg">Loading car details...</p>;

    if (!car) return <p className="text-center text-red-500 text-lg">Car not found.</p>;

    if (isCustomerApproved === false) {
        return (
            <div className="text-center p-6 border border-red-500 rounded-lg bg-red-50 mx-auto max-w-lg">
                <h3 className="text-red-600 text-xl font-semibold">Account Not Approved</h3>
                <p>Your account needs to be approved before you can book. Contact support.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
                Back
            </button>

            <h2 className="text-2xl font-bold">Booking {car.make} {car.model}</h2>
            <div className="border p-4 rounded-lg shadow-lg">
                {car.image && <img src={car.image} alt={car.model} className="w-full rounded-lg" />}
                <p><b>Year:</b> {car.year}</p>
                <p><b>Price:</b> Rs{car.dailyRate} / day</p>
                <p><b>Status:</b> <span className={car.status === "Available" ? "text-green-600" : "text-red-600"}>{car.status}</span></p>
                <p><b>Pickup Address:</b> {car.address}</p>

                {pickupLocation && (
                    <a
                        href={`https://www.google.com/maps?q=${pickupLocation[0]},${pickupLocation[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        Open in Google Maps
                    </a>
                )}

                <div className="mt-4">
                    <label>Start Date:</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={today} className="border p-2 w-full" />
                    {formErrors.startDate && <p className="text-red-500">{formErrors.startDate}</p>}

                    <label>End Date:</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="border p-2 w-full" />
                    {formErrors.endDate && <p className="text-red-500">{formErrors.endDate}</p>}

                    <p><b>Total Amount:</b> Rs {totalAmount}</p>

                    <button onClick={handleConfirmBooking} disabled={isBookingDisabled} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
