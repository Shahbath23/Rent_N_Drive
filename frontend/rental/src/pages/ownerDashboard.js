import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OwnerNavbar from "../components/OwnerNavbar";

export default function OwnerDashboard() {
    const { userState } = useContext(AuthContext);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch the owner's cars
    useEffect(() => {
        const fetchOwnerCars = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3020/cars", {
                    headers: { Authorization: `${token}` },
                });
                setCars(response.data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOwnerCars();
    }, []);

    // Handle Edit Car
    const handleEdit = (carId) => {
        navigate(`/edit-car/${carId}`);
    };

    // Handle Remove Car
    const handleRemove = async (carId) => {
        const confirmRemove = window.confirm("Are you sure you want to remove this car?");
        if (confirmRemove) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:3020/cars/${carId}`, {
                    headers: { Authorization: `${token}` },
                });
                setCars(cars.filter((car) => car._id !== carId));
            } catch (error) {
                console.error("Error removing car:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Owner Navbar */}
            <OwnerNavbar />

            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Owner Dashboard</h2>
                    
                    {/* View All Payments Link */}
                 
                </div>

                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : cars.length === 0 ? (
                    <p className="text-center text-gray-500">No cars found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cars.map((car) => (
                            <div key={car._id} className="bg-white shadow-md rounded-lg p-6">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                     className="w-full h-40 object-contain rounded"
                                />
                                <h3 className="text-xl font-semibold mb-2">{car.name}</h3>
                                <p className="text-gray-600">{car.make} {car.model} ({car.year})</p>
                                <p className="text-gray-500">License Plate: {car.licensePlate}</p>
                                <p className="text-gray-500">Seats: {car.seats}</p>
                                <p className="text-gray-500">Mileage: {car.mileage} km</p>
                                <p className="text-gray-500">Fuel: {car.fuelType}</p>
                                <p className="text-gray-500">Transmission: {car.transmission}</p>
                                <p className="text-gray-500">Features: {car.features}</p>

                                <div className="mt-4">
                                    {car.proofOfCar ? (
                                        <a
                                            href={car.proofOfCar}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Proof of Car
                                        </a>
                                    ) : (
                                        <span className="text-gray-500">No proof available</span>
                                    )}
                                </div>

                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(car._id)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleRemove(car._id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                    <button
    onClick={() => navigate(`/payments/car/${car._id}`)}
    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
>
    View Payments
</button>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
