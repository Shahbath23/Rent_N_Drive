import React from "react";
import { LogOut, Users, LayoutDashboard, CreditCard, Car, UserCog} from "lucide-react";
import { FaCar, FaUser, FaStar } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Force redirect immediately
  };
  

  const getLinkClasses = (path) => {
    return `flex items-center space-x-2 hover:text-gray-300 transition-colors cursor-pointer ${
      currentPath === path ? "text-blue-400" : ""
    }`;
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Rent N Drive - Admin</div>

          <div className="flex items-center space-x-6">
            <div
              onClick={() => navigate("/Adashboard")}
              className={getLinkClasses("/Adashboard")}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>

            <div
              onClick={() => navigate("/users")}
              className={getLinkClasses("/users")}
            >
              <Users size={20} />
              <span>Users</span>
            </div>

            <div
              onClick={() => navigate('/admin/bookings')}
              className={getLinkClasses('/admin/bookings')}
            >
              <Car size={20} />
              <span>Bookings</span>
            </div>

            <div
              onClick={() => navigate('/payments/admin')}
              className={getLinkClasses('/payments/admin')}
            >
              <CreditCard size={20} />
              <span>Payments</span>
            </div>
            <div onClick={() => navigate("/admin/reviews")} className={getLinkClasses("/admin/reviews")}>
             <FaStar size={20} />
             <span>Reviews</span>
              </div>

            <div
              onClick={() => navigate('/account')}
              className={getLinkClasses('/account')}
            >
              <UserCog size={20} />
              <span>Account</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
