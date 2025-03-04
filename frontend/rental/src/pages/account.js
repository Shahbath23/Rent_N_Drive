import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import OwnerNavbar from "../components/OwnerNavbar";
import AdminNavbar from "../components/AdminNavbar";
import CustomerNavbar from "../components/customerNavbar";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";

export default function Account() {
  const { userState, userDispatch, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for handling profile image
  const [profileImage, setProfileImage] = useState(userState.user.profilePicture);
  const [imagePreview, setImagePreview] = useState(profileImage);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("userId", userState.user._id);
    formData.append("ProfilePicture", file);

    setLoading(true);

    try {
      const response = await axios.put("http://localhost:3020/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Backend response:", response.data); // Debugging

      if (response.data.profilePicture) {
        userDispatch({
          type: "UPDATE_PROFILE_PICTURE",
          payload: response.data.profilePicture,
        });

        setShowSuccessModal(true); // Show success modal
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    handleLogout();
    navigate("/login");
  };

  if (!userState.user) {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  // Conditionally render Navbar based on user role
  const renderNavbar = () => {
    switch (userState.user.role) {
      case "admin":
        return <AdminNavbar />;
      case "owner":
        return <OwnerNavbar />;
      case "customer":
      default:
        return <CustomerNavbar />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Render the appropriate Navbar */}
      {renderNavbar()}

      <div className="container mx-auto p-6 flex justify-center">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full text-center">
          {/* Profile Picture */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={imagePreview || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-gray-300"
            />
            <button
              onClick={() => document.getElementById("profile-picture").click()}
              className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
              disabled={loading}
            >
              <FaEdit className="text-gray-600" />
            </button>
            <input
              type="file"
              id="profile-picture"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
{/* User Info */}
<h2 className="text-2xl font-semibold text-gray-800">{userState.user.name}</h2>
<p className="text-gray-600">{userState.user.email}</p>
<p className="text-gray-600">{userState.user.phoneNo || "No phone number available"}</p>
<p className="text-gray-500 capitalize">{userState.user.role}</p>

          {/* Proof of License */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Proof of License</h3>
            {console.log("Proof of License URL:", userState.user.proofOfLicense)}

            {userState.user.proofOfLicense ? (
           <a
           href={`http://localhost:3020/${userState.user.proofOfLicense.replace(/\\/g, "/")}`}
           target="_blank"
           rel="noopener noreferrer"
           className="text-blue-500 hover:underline"
         >
           View Proof of License
         </a>
         
            ) : (
              <p className="text-gray-500">No proof available</p>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold text-green-600">Image Updated Successfully!</h2>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
