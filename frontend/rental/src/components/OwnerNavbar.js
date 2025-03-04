import React from 'react';
import { LogOut, Car, LayoutDashboard, ClipboardList, User } from 'lucide-react';

const OwnerNavbar = () => {
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const getLinkClasses = (path) => {
    return `flex items-center space-x-2 hover:text-gray-300 transition-colors cursor-pointer ${
      currentPath === path ? 'text-blue-400' : ''
    }`;
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Rent N Drive - Owner</div>
          
          <div className="flex items-center space-x-6">
            <div
              onClick={() => handleNavigation('/Odashboard')}
              className={getLinkClasses('/Odashboard')}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>

            <div
              onClick={() => handleNavigation('/add-car')}
              className={getLinkClasses('/add-car')}
            >
              <Car size={20} />
              <span>Add Car</span>
            </div>

            <div
              onClick={() => handleNavigation('/booked-cars')}
              className={getLinkClasses('/booked-cars')}
            >
              <ClipboardList size={20} />
              <span>Bookings</span>
            </div>

            <div
              onClick={() => handleNavigation('/account')}
              className={getLinkClasses('/account')}
            >
              <User size={20} />
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

export default OwnerNavbar;
