import { Link } from "react-router-dom";
import { FaCar, FaSearch, FaCheckCircle } from "react-icons/fa";
import Footer from "../components/footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <section className="relative bg-gray-900 text-white py-20 px-6 text-center">
                <h1 className="text-5xl font-extrabold">Rent N Drive</h1>
                <p className="mt-4 text-lg text-gray-300">
                    Discover the best cars at affordable prices with hassle-free bookings.
                </p>
               
            </section>

            {/* Features Section */}
            <section className="py-16 px-8 max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-800">Why Choose Us?</h2>
                <p className="text-gray-600 mt-2">We offer top-quality vehicles with the best service.</p>

                <div className="grid md:grid-cols-3 gap-8 mt-10">
                    {/* Feature 1 */}
                    <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center">
                        <FaCar className="text-blue-500 text-4xl mb-4" />
                        <h3 className="text-xl font-semibold">Wide Selection</h3>
                        <p className="text-gray-600 mt-2">Choose from a variety of cars to fit your needs.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center">
                        <FaCheckCircle className="text-green-500 text-4xl mb-4" />
                        <h3 className="text-xl font-semibold">Verified Cars</h3>
                        <p className="text-gray-600 mt-2">All vehicles are inspected and approved.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white shadow-lg p-6 rounded-lg flex flex-col items-center">
                        <FaSearch className="text-yellow-500 text-4xl mb-4" />
                        <h3 className="text-xl font-semibold">Easy Booking</h3>
                        <p className="text-gray-600 mt-2">Book your car in just a few clicks.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-blue-600 text-white py-16 text-center">
                <h2 className="text-3xl font-bold">Start Your Journey Today</h2>
                <p className="mt-2 text-lg">Sign up now and book your first ride!</p>
                <Link 
                    to="/register" 
                    className="mt-6 inline-block bg-white text-blue-600 font-semibold text-lg px-6 py-3 rounded-lg hover:bg-gray-200 transition"
                >
                    Get Started
                </Link>
            </section>
            <Footer />

        </div>
    );
}
