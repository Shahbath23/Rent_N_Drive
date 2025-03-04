import React from "react";
import { Link } from "react-router-dom";

function CustomerNavbar() {
    return (
        <nav className="bg-gradient-to-r from-gray-800 to-gray-600 p-5 text-white flex justify-between items-center shadow-lg rounded-lg mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 hover:text-gray-300 transition duration-300">
                 Rent N Ride
            </h1>
            <div>
               
                <Link to="/cars" className="text-lg hover:text-gray-300 mr-6 transition duration-300">
                    Cars
                </Link>
                <Link to="/bookings" className="text-lg hover:text-gray-300 mr-6 transition duration-300">
                    Bookings
                </Link>
                <Link to="/customer/reviews/:userId" className="text-lg hover:text-gray-300 mr-6 transition duration-300">
                    Reviews
                </Link>
                <Link to="/account" className="text-lg hover:text-gray-300 transition duration-300">
                    Account
                </Link>
            </div>
        </nav>
    );
}

function Dashboard() {
    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-700 to-black min-h-screen p-6 font-['Roboto']">
            {/* Navbar */}
            <CustomerNavbar />

            <div className="text-center bg-gradient-to-r from-gray-800 to-gray-600 p-10 rounded-xl shadow-2xl max-w-4xl mx-auto mt-12">
                <h2 className="text-4xl font-bold text-yellow-400 mb-6">Welcome to Your Dashboard</h2>

                <p className="text-lg text-white mb-6">
                    Manage your bookings, reviews, and explore available cars effortlessly.
                </p>

               
                    <Link
                        to="/customer/reviews/:userId"
                        className="py-3 px-6 bg-green-500 text-white text-xl font-semibold rounded-lg shadow-lg transform transition duration-300 hover:bg-green-600 hover:scale-105"
                    >
                        My Reviews
                    </Link>
                </div>
            </div>
        
    );
}

export default Dashboard;
