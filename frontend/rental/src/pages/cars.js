import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "../components/customerNavbar";

export default function Cars() {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("priceLow");
    const [currentPage, setCurrentPage] = useState(1);
    const carsPerPage = 6;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [userApproved, setUserApproved] = useState(false);
    const navigate = useNavigate();

    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve({ latitude, longitude });
                    },
                    (error) => {
                        console.error("Error getting user location:", error);
                        reject(error);
                    }
                );
            } else {
                reject("Geolocation is not supported by this browser.");
            }
        });
    };

    useEffect(() => {
        const fetchCars = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You must be logged in to view available cars.");
                setLoading(false);
                return;
            }

            try {
                const location = await getUserLocation();
                if (!location) throw new Error("User location not available");

                const response = await axios.get("http://localhost:3020/api/cars", {
                    headers: { Authorization: `${token}` },
                    params: { latitude: location.latitude, longitude: location.longitude },
                });

                setCars(response.data);
                setFilteredCars(response.data);
                setLoading(false);

                setShowLocationPopup(true);
                setTimeout(() => setShowLocationPopup(false), 5000);
            } catch (err) {
                console.error("Error fetching cars:", err);
                setError("An error occurred while fetching the cars.");
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    useEffect(() => {
        const fetchUserStatus = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:3020/user/account", {
                    headers: { Authorization: `${token}` },
                });

                setUserApproved(response.data.isApproved);
            } catch (err) {
                console.error("Error fetching user status:", err);
                setUserApproved(false);
            }
        };

        fetchUserStatus();
    }, []);

    // Handle search
    useEffect(() => {
        let filtered = cars.filter((car) =>
            `${car.name} ${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Handle sorting
        if (sortOption === "priceLow") {
            filtered.sort((a, b) => a.dailyRate - b.dailyRate);
        } else if (sortOption === "priceHigh") {
            filtered.sort((a, b) => b.dailyRate - a.dailyRate);
        } else if (sortOption === "yearNewest") {
            filtered.sort((a, b) => b.year - a.year);
        } else if (sortOption === "yearOldest") {
            filtered.sort((a, b) => a.year - b.year);
        }

        setFilteredCars(filtered);
        setCurrentPage(1); // Reset pagination when filtering
    }, [searchQuery, sortOption, cars]);

    const handleBookClick = (carId) => {
        if (!userApproved) return;
        navigate(`/book-car/${carId}`);
    };

    const indexOfLastCar = currentPage * carsPerPage;
    const indexOfFirstCar = indexOfLastCar - carsPerPage;
    const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);

    const nextPage = () => {
        if (currentPage < Math.ceil(filteredCars.length / carsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) return <p className="text-center text-lg text-white bg-blue-900 p-4 rounded">Loading cars...</p>;
    if (error) return <p className="text-center text-lg text-red-500 p-4 bg-red-700 rounded">{error}</p>;

    return (
        <div>
            <div className="p-5 text-white shadow-md rounded-lg mb-8">
                <CustomerNavbar />
            </div>

            <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">Available Cars</h2>

            {/* Search & Sort Options */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, make, model..."
                    className="px-4 py-2 border rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select className="px-4 py-2 border rounded-md" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="yearNewest">Year: Newest First</option>
                    <option value="yearOldest">Year: Oldest First</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {currentCars.length > 0 ? (
                    currentCars.map((car) => (
                        <div key={car._id} className="bg-white p-6 rounded-lg shadow-md">
                            <img src={car.image} alt={car.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{car.name}</h3>
                            <p className="text-lg text-gray-700"><b>Make:</b> {car.make} {car.model}</p>
                            <p className="text-lg text-gray-700"><b>Year:</b> {car.year}</p>
                            <p className="text-lg text-blue-700"><b>Price:</b> Rs {car.dailyRate} / Day</p>
                            <p className="text-lg text-gray-700"><b>Address:</b> {car.address}</p>

                            <button
                                onClick={() => handleBookClick(car._id)}
                                disabled={!userApproved}
                                className={`w-full py-2 px-4 rounded-lg ${userApproved ? "bg-blue-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`}
                            >
                                {userApproved ? "Book This Car" : "Approval Pending"}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg text-gray-700">No cars found.</p>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6 gap-4">
                <button onClick={prevPage} disabled={currentPage === 1} className="px-4 py-2 border rounded-md bg-gray-200">
                    Previous
                </button>
                <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredCars.length / carsPerPage)} className="px-4 py-2 border rounded-md bg-gray-200">
                    Next
                </button>
            </div>
        </div>
    );
}
