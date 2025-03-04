import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCars, fetchBookings } from "../redux/carSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OwnerNavbar from "../components/OwnerNavbar";

function BookingList({ bookings, carId, refreshBookings }) {
  const navigate = useNavigate();
  const currentDate = new Date();

  const ongoingBookings = bookings.filter(
    (booking) =>
      new Date(booking.startDate) <= currentDate && new Date(booking.endDate) >= currentDate
  );

  const handleStatusUpdate = async (bookingId) => {
    try {
      const response = await axios.put(
        `http://localhost:3020/car/return/${carId}`,
        { bookingId },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message);
      refreshBookings();
      navigate(`/car/${carId}/review`);
    } catch (error) {
      alert("Error updating status. Please try again.");
    }
  };

  return (
    <div className="mt-4 space-y-6">
      {ongoingBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Ongoing Bookings</h3>
          <ul className="space-y-4">
            {ongoingBookings.map((booking) => (
              <li key={booking._id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                <p className="text-lg font-semibold">
                  Booked By: {booking.user.name} ({booking.user.email})
                </p>
                <p>Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(booking.endDate).toLocaleDateString()}</p>
                <p>Status: {booking.status || "Ongoing"}</p>
                <button
                  onClick={() => handleStatusUpdate(booking._id)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark as Returned
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


function CarItem({ car, bookings, refreshBookings }) {
  return (
    <div className="car-bookings mb-6 p-6 border rounded-lg shadow-lg bg-gray-50">
      <div className="flex items-center gap-6">
        {car.image && <img src={`${car.image}`} alt={car.model} className="w-20 h-20 object-contain rounded-md border" />}
        <div>
          <h3 className="text-xl font-bold text-gray-800">{car.make} {car.model}</h3>
          <p className="text-gray-600">License Plate: {car.licensePlate}</p>
        </div>
      </div>
      {bookings && bookings.length > 0 ? <BookingList bookings={bookings} carId={car._id} refreshBookings={refreshBookings} /> : <p className="text-center text-gray-600">No bookings for this car.</p>}
    </div>
  );
}

export default function OwnerBookings() {
  const dispatch = useDispatch();
  const { cars, bookings, loading, error } = useSelector((state) => state.cars);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  useEffect(() => {
    if (cars.length > 0) {
      cars.forEach((car) => {
        dispatch(fetchBookings(car._id));
      });
    }
  }, [cars, dispatch, trigger]);

  const refreshBookings = () => setTrigger(!trigger);

  const totalBookings = Object.values(bookings).flat().length;
  const ongoingBookings = Object.values(bookings).flat().filter(
    (booking) => new Date(booking.startDate) <= new Date() && new Date(booking.endDate) >= new Date()
  ).length;
  const completedBookings = Object.values(bookings).flat().filter((booking) => booking.status === "completed").length;
  const futureBookings = Object.values(bookings).flat().filter((booking) => new Date(booking.startDate) > new Date()).length;

  if (loading) return <div className="text-center p-4">Loading your cars...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <OwnerNavbar />
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Your Cars and Bookings</h2>
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4 text-center mb-6">
          <div className="p-4 bg-white shadow rounded-lg">
            <p className="text-lg font-semibold">Total Bookings</p>
            <p className="text-2xl font-bold">{totalBookings}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <p className="text-lg font-semibold">Ongoing Bookings</p>
            <p className="text-2xl font-bold">{ongoingBookings}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <p className="text-lg font-semibold">Completed Bookings</p>
            <p className="text-2xl font-bold">{completedBookings}</p>
          </div>
          <div className="p-4 bg-white shadow rounded-lg">
            <p className="text-lg font-semibold">Future Bookings</p>
            <p className="text-2xl font-bold">{futureBookings}</p>
          </div>
        </div>
        {cars.length === 0 ? <p className="text-center text-gray-600">You don't have any cars listed yet.</p> : cars.map((car) => <CarItem key={car._id} car={car} bookings={bookings[car._id]} refreshBookings={refreshBookings} />)}
      </div>
    </div>
  );
}
