import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/footer";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNo: "",
        password: "",
        role: "customer",
        address:"",
        proofOfLicense: null,
        profilePicture: null,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file && file.size > maxSize) {
            setError("File size must not exceed 2MB.");
        } else if (file && (file.type !== "application/pdf" && !file.type.startsWith("image/"))) {
            setError("Invalid file type. Only images and PDFs are allowed.");
        } else {
            setForm({ ...form, [field]: file });
            setError("");
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        if (!form.name || !form.email || !form.phoneNo || !form.password || !form.address) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }
    
        if (!/\S+@\S+\.\S+/.test(form.email)) {
            setError("Invalid email format.");
            setLoading(false);
            return;
        }
    
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setLoading(false);
            return;
        }
    
        if ((form.role === "customer" || form.role === "owner") && !form.proofOfLicense) {
            setError("License file is required.");
            setLoading(false);
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("phoneNo", form.phoneNo);
            formData.append("password", form.password);
            formData.append("role", form.role);
            formData.append("address", form.address);

    
            if (form.proofOfLicense) {
                formData.append("proofOfLicense", form.proofOfLicense);
            }
    
            if (form.profilePicture) {
                formData.append("profilePicture", form.profilePicture);
            }
    
            const response = await axios.post("http://localhost:3020/user/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            navigate("/login");  // Redirect after successful registration
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.error || "Registration failed. Please try again.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-2xl p-8 transform transition-all duration-500 hover:scale-105 border-t-8 border-red-600">
                <div className="text-center">
                    <h2 className="text-4xl font-black text-gray-900 mb-2">Rent N Drive</h2>
                    <p className="text-sm text-gray-600 font-medium">Register here to rent a car and drive anywhere!</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-all duration-300"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                disabled={loading}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-all duration-300"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                disabled={loading}
                                placeholder="Enter your email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNo" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Phone Number</label>
                            <input
                                type="text"
                                id="phoneNo"
                                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-all duration-300"
                                value={form.phoneNo}
                                onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
                                disabled={loading}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Password</label>
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
                    <div>
                            <label htmlFor="address" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">address</label>
                            <input
                                type="text"
                                id="address"
                                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm transition-all duration-300"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                disabled={loading}
                                placeholder="Enter your address"
                            />
                        </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Role</label>
                            <div className="flex items-center space-x-4">
                                <label>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="owner"
                                        checked={form.role === "owner"}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    />
                                    Owner
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="customer"
                                        checked={form.role === "customer"}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    />
                                    Customer
                                </label>
                            </div>
                        </div>

                        {(form.role === "customer" || form.role === "owner") && (
                            <div>
                                <label htmlFor="license-file" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Upload Your License</label>
                                <input
                                    type="file"
                                    id="license-file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => handleFileChange(e, "proofOfLicense")}
                                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md"
                                />
                                {form.proofOfLicense && <p className="text-sm text-gray-600 mt-2">Selected File: {form.proofOfLicense.name}</p>}
                            </div>
                        )}

                        <div>
                            <label htmlFor="profile-picture" className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Upload Profile Picture</label>
                            <input
                                type="file"
                                id="profile-picture"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(e, "profilePicture")}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md"
                            />
                            {form.profilePicture && <p className="text-sm text-gray-600 mt-2">Selected File: {form.profilePicture.name}</p>}
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
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-bold text-red-600 hover:text-red-800 transition-colors duration-300">
                            Login Now
                        </a>
                    </p>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
}
