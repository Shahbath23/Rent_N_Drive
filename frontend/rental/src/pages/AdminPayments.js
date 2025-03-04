import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { FaCar, FaMoneyBill, FaUser } from "react-icons/fa";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        console.log("📡 Fetching payments...");
        const { data } = await axios.get("http://localhost:3020/payments/admin", {
          headers: { Authorization: `${localStorage.getItem("token")}` },
        });
        console.log(`✅ Received ${data.length} payments.`);
        setPayments(data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) =>
    payment.carId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group payments by car
  const groupedPayments = filteredPayments.reduce((acc, payment) => {
    const carName = `${payment.carId?.make} ${payment.carId?.model} (${payment.carId?.name})`;

    if (!acc[carName]) acc[carName] = [];
    acc[carName].push(payment);

    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Car Payments Overview</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by car name..."
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Display Payments by Car */}
        {Object.keys(groupedPayments).map((carName) => (
          <div key={carName} className="bg-white shadow-md p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <FaCar className="text-blue-500" /> {carName}
            </h2>

            {groupedPayments[carName].map((payment) => (
              <PaymentCard key={payment._id} payment={payment} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Payment Card Component
function PaymentCard({ payment }) {
  return (
    <div className="border-l-4 border-green-500 bg-gray-50 p-4 my-2 rounded-lg shadow-sm">
      <p className="text-gray-700"><strong>Customer:</strong> {payment.userId?.name} ({payment.userId?.phoneNo})</p>
      <p className="text-gray-700"><strong>Amount Paid:</strong> Rs{payment.amount}</p>
      <p className="text-gray-700"><strong>Payment Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
      <p className="text-gray-700"><strong>Payment Status:</strong> {payment.paymentStatus}</p>
    </div>
  );
}
