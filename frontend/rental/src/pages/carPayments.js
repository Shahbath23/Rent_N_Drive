import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CarPayments() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [car, setCar] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Car ID is missing.");
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        console.log("Fetching payments for carId:", id);
        const response = await axios.get(`http://localhost:3020/payments/car/${id}`, {
          headers: { Authorization: `${token}` },
        });

        console.log("API response:", response.data);
        setCar(response.data.car);
        setPayments(response.data.payments);
      } catch (err) {
        console.error("API error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to fetch payments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [id]);

  if (loading) return <div className="text-center text-gray-600 text-lg">Loading payments...</div>;
  if (error) return <div className="text-center text-red-500 text-lg">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-700 text-white px-5 py-2 rounded-md hover:bg-gray-800 transition mb-4"
      >
        ⬅ Back
      </button>

      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* Car Image - Improved Styling */}
        <div className="w-80 md:w-96 lg:w-[400px] h-56 md:h-64 lg:h-100 mx-auto overflow-hidden rounded-lg shadow-lg">
  <img
    src={car?.image}
    alt={car?.name}
    className="w-full h-full object-cover rounded-lg"
  />
</div>


        <h3 className="text-2xl font-semibold mt-4">{car?.make} {car?.model}</h3>

        {/* Payments List */}
        <h3 className="text-xl font-semibold mt-6 border-b pb-2">Payments for this Car:</h3>

        {payments.length > 0 ? (
          <ul className="mt-4">
            {payments.map((payment) => (
              <li key={payment._id} className="border p-5 rounded-md shadow-md mb-3 bg-gray-50">
                <p className="text-gray-800 font-semibold">
                  <span className="text-gray-500">Transaction ID:</span> {payment.transactionId}
                </p>
                <p className="text-green-600 font-bold">
                  <span className="text-gray-500">Amount:</span> 
                  {Number(payment.amount).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                </p>
                <p className="text-gray-700"><span className="text-gray-500">Status:</span> {payment.paymentStatus}</p>
                <p className="text-gray-700"><span className="text-gray-500">Paid by:</span> {payment.userId.name} ({payment.userId.email})</p>
                <p className="text-gray-700">
                  <span className="text-gray-500">Booking:</span> 
                  {new Date(payment.bookingId.startDate).toLocaleDateString("en-GB")} 
                  {" "}to{" "} 
                  {new Date(payment.bookingId.endDate).toLocaleDateString("en-GB")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-4">No payments found for this car.</p>
        )}
      </div>
    </div>
  );
}
