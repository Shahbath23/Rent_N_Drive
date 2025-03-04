import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Company Info */}
          <div>
            <h2 className="text-lg font-bold text-white">Rent N Drive</h2>
            <p className="mt-2 text-gray-400">
              Your trusted partner for hassle-free car rentals.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="/about" className="hover:text-indigo-400 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="/cars" className="hover:text-indigo-400 transition">
                  Browse Cars
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-indigo-400 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold text-white">Follow Us</h3>
            <div className="flex justify-center md:justify-start gap-4 mt-2">
              <a href="#" className="hover:text-indigo-400 transition text-2xl">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-indigo-400 transition text-2xl">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-indigo-400 transition text-2xl">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-indigo-400 transition text-2xl">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center border-t border-gray-700 mt-6 pt-4 text-gray-500 text-sm">
          © {new Date().getFullYear()} Car Rental. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
