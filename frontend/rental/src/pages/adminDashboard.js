import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Check } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';

const AdminDashboard = () => {
    const [pendingCars, setPendingCars] = useState([]);
    const [approvedCars, setApprovedCars] = useState([]);

    const fetchCars = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token is missing!");
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3020/admin/cars', {
                headers: {
                    Authorization: `${token}`,
                },
            });
            const data = await response.json();
            
            const pending = data.filter(car => !car.approved);
            const approved = data.filter(car => car.approved);
    
            setPendingCars(pending);
            setApprovedCars(approved);
        } catch (err) {
            console.error("Error fetching cars", err);
        }
    };

    const approveCar = async (carId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token is missing!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3020/admin/car/${carId}/approve`, {
                method: 'PUT',
                headers: {
                    Authorization: `${token}`,
                },
            });
            const data = await response.json();

            if (data) {
                setPendingCars(pendingCars.filter(car => car._id !== carId));
                setApprovedCars([...approvedCars, data]);
            }
        } catch (err) {
            console.error("Error approving car", err);
        }
    };

    const declineCar = async (carId) => {
        setPendingCars(pendingCars.filter(car => car._id !== carId));
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const CarCard = ({ car, isPending }) => (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold">{car.name}</h3>
                    <p className="text-gray-600">{car.make} - {car.model}</p>
                </div>
                {isPending && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => approveCar(car._id)}
                            className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <Check size={16} className="mr-1" />
                            Approve
                        </button>
                        <button 
                            onClick={() => declineCar(car._id)}
                            className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            <X size={16} className="mr-1" />
                            Decline
                        </button>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <img
                        src={car.image}
                        alt={car.name}
                         className="w-full h-40 object-contain rounded"
                    />
                </div>
                <div className="space-y-2">
                    {car.userId && (
                        <div className="bg-gray-50 p-3 rounded">
                            <h4 className="font-semibold mb-2">Owner Details</h4>
                            <p>{car.userId.name}</p>
                            <p className="text-gray-600">{car.userId.email}</p>
                            <p className="text-gray-600">Phone: {car.userId.phoneNo || 'N/A'}</p>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <a
                            href={car.proofOfCar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 flex items-center"
                        >
                            View Proof of Car
                        </a>
                        {car.userId?.proofOfLicense && (
                            <a
                                href={car.userId.proofOfLicense}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 flex items-center"
                            >
                                View License
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <AdminNavbar />
            <div className="container mx-auto px-4 py-6">
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <AlertCircle className="text-yellow-500 mr-2" size={24} />
                        <h2 className="text-2xl font-bold">Pending Cars</h2>
                    </div>
                    <div className="space-y-4">
                        {pendingCars.map((car) => (
                            <CarCard key={car._id} car={car} isPending={true} />
                        ))}
                        {pendingCars.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No pending cars</p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center mb-4">
                        <CheckCircle className="text-green-500 mr-2" size={24} />
                        <h2 className="text-2xl font-bold">Approved Cars</h2>
                    </div>
                    <div className="space-y-4">
                        {approvedCars.map((car) => (
                            <CarCard key={car._id} car={car} isPending={false} />
                        ))}
                        {approvedCars.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No approved cars</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;