import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { FaCar, FaListAlt, FaUser, FaSignOutAlt, FaStar, FaCreditCard } from "react-icons/fa";

export default function CustomerNavbar() {
  const { handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    handleLogout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/cars", label: "Browse Cars", icon: <FaCar /> },
    { to: "/bookings", label: "My Bookings", icon: <FaListAlt /> },
    { to: "/customer/reviews", label: "My Reviews", icon: <FaStar /> }, // Customer Reviews
    { to: "/customer/payments", label: "My Payments", icon: <FaCreditCard /> }, // Customer Payments
    { to: "/account", label: "Account", icon: <FaUser /> },
  ];

  return (
    <nav className="bg-gray-800 text-white shadow-lg py-4 px-8 flex justify-between items-center">
      {/* Logo */}
      <Link to="/cars" className="text-2xl font-bold tracking-wide hover:text-gray-300 transition">
        Rent-N-Drive
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-8 text-lg">
        {navLinks.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-2 transition ${
              location.pathname === to ? "text-blue-400" : "hover:text-gray-300"
            }`}
          >
            {icon} {label}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="flex items-center gap-2 bg-red-600 px-5 py-2 rounded-lg text-lg font-medium hover:bg-red-700 transition"
      >
        <FaSignOutAlt /> Logout
      </button>
    </nav>
  );
}
