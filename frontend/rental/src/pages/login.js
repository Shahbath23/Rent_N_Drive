import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Footer from "../components/footer"; // Ensure you have the Footer component

export default function Login() {
    const { handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
    
        if (!form.name.trim() || !form.password.trim()) {
            setError("Both username and password are required.");
            return;
        }
    
        setLoading(true);
    
        try {
            // Get the user's geolocation
            const position = await new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                } else {
                    reject(new Error("Geolocation is not supported"));
                }
            });
    
            const { latitude, longitude } = position.coords;
    
            // Save location info to localStorage
            localStorage.setItem("latitude", latitude);
            localStorage.setItem("longitude", longitude);
    
            // Send login request along with the user's location
            const lresponse = await axios.post("http://localhost:3020/user/login", { ...form, latitude, longitude }, {
                headers: { "Content-Type": "application/json" },
            });
    
            localStorage.setItem("token", lresponse.data.token);
            const response = await axios.get("http://localhost:3020/user/account", {
                headers: { Authorization: localStorage.getItem("token") },
            });
    
            handleLogin(response.data);
            navigate("/home");
        } catch (err) {
            console.error("Login Error:", err);
            const serverErrors = err.response?.data?.errors;
            if (Array.isArray(serverErrors)) {
                setError(serverErrors.map((err) => err.msg).join(", "));
            } else if (err.response?.status === 401) {
                setError("Invalid credentials. Please try again.");
            } else {
                setError("An error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Main Content (Login Form) */}
            <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-2xl p-8 transform transition-all duration-500 hover:scale-105 border-t-8 border-red-600">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-gray-900 mb-2">Rent N Drive</h2>
                        <p className="text-sm text-gray-600 font-medium">Login to access exclusive cars</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-all duration-300"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    disabled={loading}
                                    placeholder="Enter your username"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-all duration-300"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    disabled={loading}
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                            >
                                {loading ? (
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                ) : null}
                                {loading ? "Starting Engine..." : "Start Your Journey"}
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="font-bold text-red-600 hover:text-red-800 transition-colors duration-300">
                                Register Now
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer (Always at Bottom) */}
            {/* <Footer /> */}
        </div>
    );
}
