import React, { useEffect, useState } from "react";
import { UserCheck, UserX, Shield } from "lucide-react";
import AdminNavbar from "../components/AdminNavbar";

const AdminUsersPage = () => {
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [approvedCustomers, setApprovedCustomers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3020/user", {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const allUsers = await response.json();
      const customers = allUsers.filter((user) => user.role === "customer");
      const ownerUsers = allUsers.filter((user) => user.role === "owner");

      setPendingCustomers(customers.filter((user) => !user.isApproved));
      setApprovedCustomers(customers.filter((user) => user.isApproved));
      setOwners(ownerUsers);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing");

      const response = await fetch(
        `http://localhost:3020/user/${userId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isApproved: true }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve user");

      setPendingCustomers((prev) =>
        prev.filter((user) => user._id !== userId)
      );
      await fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const UserCard = ({ user, type, onApprove }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <a
            href={user.profilePicture}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-contain border border-gray-300 bg-gray-200"
              />
          </a>
          <div>
            <h4 className="font-semibold">{user.name}</h4>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>

      {user.proofOfLicense && (
        <div className="mb-3">
          <a
            href={user.proofOfLicense}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
          >
            View License Document
          </a>
        </div>
      )}

      {type === "pending" && (
        <button
          onClick={() => onApprove(user._id)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <UserCheck size={16} />
          Approve User
        </button>
      )}
    </div>
  );

  const Section = ({ title, icon, users, type, onApprove }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold ml-2">{title}</h3>
        <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
          {users.length}
        </span>
      </div>

      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((user) => (
            <UserCard key={user._id} user={user} type={type} onApprove={onApprove} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No users found</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section
            title="Pending Customers"
            icon={<UserX className="text-yellow-500" size={24} />}
            users={pendingCustomers}
            type="pending"
            onApprove={handleApprove}
          />

          <Section
            title="Approved Customers"
            icon={<UserCheck className="text-green-500" size={24} />}
            users={approvedCustomers}
            type="approved"
          />

          <Section
            title="Car Owners"
            icon={<Shield className="text-blue-500" size={24} />}
            users={owners}
            type="owner"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
