import './App.css';
import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Register from './pages/Register.js';
import Dashboard from './pages/dashboard.js';
import Login from './pages/login.js';
import Home from './pages/home.js';
import Account from './pages/account.js';
import AuthContext from './context/AuthContext.js';
import { useContext, useEffect } from 'react';
import AdminDashboard from './pages/adminDashboard.js';
import PrivateRoute from './components/privateRoute.js';
import OwnerDashboard from './pages/ownerDashboard.js';
import EditCar from './pages/editCar.js';
import Cars from './pages/cars.js';
import CarBooking from './pages/bookCar.js';
import Bookings from './pages/customerBookings.js';
import OwnerBookings from './pages/ownerBookings.js';
import AdminUsersPage from './pages/adminUsers.js';
import CreateCar from './pages/add-car.js';
import OwnerReviewPage from './pages/ownerReview.js';
import CustomerReviewPage from './pages/custReview.js';
import CustomerReviews from './pages/customerReviews.js';
import PaymentPage from './pages/payment.js';
import "./index.css";
import CarPayments from './pages/carPayments.js';
import AdminBookings from './pages/adminBookings.js';
import AdminPayments from './pages/AdminPayments.js';
import AdminReviews from './pages/AdminReviews.js';
import CustomerPayments from './pages/customerPayments.js';

const getRedirectPath = (role) => {
    switch (role) {
        case 'admin':
            return '/Adashboard';
        case 'owner':
            return '/Odashboard';
        case 'customer':
            return '/cars';
        default:
            return '/home';
    }
};

export default function App() {
    const { userState } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!userState.isLoggedIn && !['/home', '/login', '/register'].includes(location.pathname)) {
            navigate('/home'); // Ensure users go to the home page first
            return;
        }

        if (userState.isLoggedIn && location.pathname === '/home') {
            const redirectPath = getRedirectPath(userState.user?.role);
            navigate(redirectPath);
        }
    }, [userState.isLoggedIn, userState.user?.role, location.pathname, navigate]);

    return (
        <div className='p-0'>
            <Routes>
                {/* Default route redirects to Home */}
                <Route path="/" element={<Navigate to="/home" />} />

                {/* Public Routes */}
                <Route path='/home' element={<Home />} />
                <Route 
                    path='/register' 
                    element={
                        !userState.isLoggedIn ? <Register /> : <Navigate to={getRedirectPath(userState.user?.role)} />
                    } 
                />
                <Route 
                    path='/login' 
                    element={
                        !userState.isLoggedIn ? <Login /> : <Navigate to={getRedirectPath(userState.user?.role)} />
                    } 
                />

                {/* Protected Routes */}
                <Route 
                    path='/account' 
                    element={<PrivateRoute permittedRoles={['customer', 'admin', 'owner']}><Account /></PrivateRoute>} 
                />

                {/* Role-Specific Routes */}
                <Route path='/dashboard' element={<PrivateRoute permittedRoles={['customer']}><Dashboard /></PrivateRoute>} />
                <Route path='/Adashboard' element={<PrivateRoute permittedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
                <Route path='/Odashboard' element={<PrivateRoute permittedRoles={['owner']}><OwnerDashboard /></PrivateRoute>} />

                {/* Owner Routes */}
                <Route path='/edit-car/:id' element={<PrivateRoute permittedRoles={['owner']}><EditCar /></PrivateRoute>} />
                <Route path='/add-car' element={<PrivateRoute permittedRoles={['owner']}><CreateCar /></PrivateRoute>} />
                <Route path='/booked-cars' element={<PrivateRoute permittedRoles={['owner']}><OwnerBookings /></PrivateRoute>} />
                <Route path='/car/:carId/review' element={<PrivateRoute permittedRoles={['owner']}><OwnerReviewPage /></PrivateRoute>} />

                {/* Customer Routes */}
                <Route path='/cars' element={<PrivateRoute permittedRoles={['customer']}><Cars /></PrivateRoute>} />
                <Route path="/book-car/:carId" element={<PrivateRoute permittedRoles={['customer']}><CarBooking /></PrivateRoute>} />
                <Route path="/bookings" element={<PrivateRoute permittedRoles={['customer']}><Bookings /></PrivateRoute>} />
                <Route path='/leave-review/:bookingId' element={<PrivateRoute permittedRoles={['customer']}><CustomerReviewPage /></PrivateRoute>} />
                <Route path='/payment' element={<PrivateRoute permittedRoles={['customer']}><PaymentPage /></PrivateRoute>} />

                {/* Admin Routes */}
                <Route path='/users' element={<PrivateRoute permittedRoles={['admin']}><AdminUsersPage /></PrivateRoute>} />
                <Route path='/payments/car/:id' element={<PrivateRoute permittedRoles={['admin', 'owner']}><CarPayments /></PrivateRoute>} />
                <Route path='/admin/bookings' element={<PrivateRoute permittedRoles={['admin']}><AdminBookings /></PrivateRoute>} />
                <Route path='/payments/admin' element={<PrivateRoute permittedRoles={['admin']}><AdminPayments /></PrivateRoute>} />
                <Route path='/admin/reviews' element={<PrivateRoute permittedRoles={['admin']}><AdminReviews /></PrivateRoute>} />

                {/* Customer Reviews and Payments */}
                <Route path='/customer/reviews' element={<PrivateRoute permittedRoles={['customer']}><CustomerReviews /></PrivateRoute>} />
                <Route path='/customer/payments' element={<PrivateRoute permittedRoles={['customer']}><CustomerPayments /></PrivateRoute>} />

                {/* Catch-All Route */}
                <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
        </div>
    );
}
