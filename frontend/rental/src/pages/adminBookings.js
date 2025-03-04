import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { FaCar, FaClock, FaCheckCircle, FaHistory, FaChartBar, FaMoneyBillWave } from "react-icons/fa";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    pastBookings: 0,
    ongoingBookings: 0,
    futureBookings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get("http://localhost:3020/admin/bookings", {
          headers: { Authorization: `${localStorage.getItem("token")}` },
        });

        setBookings(data);
        calculateStats(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  const currentDate = new Date();

  const filteredBookings = bookings.filter((booking) =>
    booking.car.name.toLowerCase().includes(search.toLowerCase())
  );

  // Categorize bookings & calculate statistics
  const calculateStats = (bookings) => {
    let past = 0, ongoing = 0, future = 0, revenue = 0;

    bookings.forEach((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);

      if (endDate < currentDate) past++;
      else if (startDate <= currentDate && endDate >= currentDate) ongoing++;
      else future++;

      // Calculate revenue if `totalAmount` exists
      if (booking.totalAmount) {
        revenue += booking.totalAmount;
      }
    });

    setStats({
      totalBookings: bookings.length,
      pastBookings: past,
      ongoingBookings: ongoing,
      futureBookings: future,
      totalRevenue: revenue,
    });
  };

  // Group bookings by car name
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    let category = "future"; // Default to future bookings
    if (endDate < currentDate) category = "past";
    else if (startDate <= currentDate && endDate >= currentDate) category = "ongoing";

    if (!acc[booking.car.name]) acc[booking.car.name] = { past: [], ongoing: [], future: [] };
    acc[booking.car.name][category].push(booking);

    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Car Bookings Overview</h1>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={<FaChartBar className="text-blue-600" />} title="Total Bookings" value={stats.totalBookings} />
          <StatCard icon={<FaHistory className="text-gray-600" />} title="Past Bookings" value={stats.pastBookings} />
          <StatCard icon={<FaClock className="text-yellow-600" />} title="Ongoing Bookings" value={stats.ongoingBookings} />
          <StatCard icon={<FaCheckCircle className="text-green-600" />} title="Future Bookings" value={stats.futureBookings} />
          <StatCard icon={<FaMoneyBillWave className="text-green-500" />} title="Total Revenue" value={`Rs${stats.totalRevenue.toFixed(2)}`} />
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by car name..."
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Display Bookings by Car */}
        {Object.keys(groupedBookings).map((carName) => (
          <div key={carName} className="bg-white shadow-md p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <FaCar className="text-blue-500" /> {carName}
            </h2>

            {/* Ongoing Bookings */}
            {groupedBookings[carName].ongoing.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-yellow-600 flex items-center gap-2">
                  <FaClock /> Ongoing Bookings
                </h3>
                {groupedBookings[carName].ongoing.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} color="yellow-500" />
                ))}
              </div>
            )}

            {/* Future Bookings */}
            {groupedBookings[carName].future.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <FaCheckCircle /> Future Bookings
                </h3>
                {groupedBookings[carName].future.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} color="green-500" />
                ))}
              </div>
            )}

            {/* Past Bookings */}
            {groupedBookings[carName].past.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-600 flex items-center gap-2">
                  <FaHistory /> Past Bookings
                </h3>
                {groupedBookings[carName].past.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} color="gray-500" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Statistics Card Component
function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg flex items-center gap-4">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-gray-600">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({ booking, color }) {
  return (
    <div className={`border-l-4 border-${color} bg-gray-50 p-4 my-2 rounded-lg shadow-sm`}>
      <p className="text-gray-700"><strong>Customer:</strong> {booking.user?.name || "Unknown"}</p>
      <p className="text-gray-700"><strong>Owner:</strong> {booking.car?.userId?.name || "Unknown"}</p>
      <p className="text-gray-700"><strong>Owner Contact:</strong> {booking.car?.userId?.phoneNo || "Not available"}</p>
      <p className="text-gray-700"><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
      <p className="text-gray-700"><strong>End Date:</strong> {new Date(booking.endDate).toLocaleDateString()}</p>
      <p className="text-gray-700"><strong>Amount Paid:</strong> Rs{booking.totalAmount?.toFixed(2) || "N/A"}</p>
    </div>
  );
}
