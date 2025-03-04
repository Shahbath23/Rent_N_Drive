import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OwnerNavbar from '../components/OwnerNavbar';

const CreateCar = () => {
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    dailyRate: '',
    address: '',
    googleMapsLink: '',
    transmission: '',
    fuelType: '',
    seats: '',
    mileage: '',
    features: '',
  });

  const [image, setImage] = useState(null);
  const [proofOfCar, setProofOfCar] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Fetch address suggestions if the address field is updated and its length is greater than 1
    if (name === 'address' && value.length > 1) {
      getAddressSuggestions(value);
    }
  };

  // Fetch address suggestions from the backend
  const getAddressSuggestions = (input) => {
    axios
      .get(`http://localhost:3020/address-suggestions?input=${input}`)
      .then((response) => {
        setAddressSuggestions(response.data.suggestions || []);
      })
      .catch((error) => {
        console.error('Error fetching address suggestions:', error);
        setAddressSuggestions([]);
      });
  };

  // Select an address from suggestions
  const handleAddressSelect = (suggestion) => {
    setFormData({ ...formData, address: suggestion.description });
    setAddressSuggestions([]); // Clear suggestions after selection
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === 'image') {
      setImage(file);
    } else if (e.target.name === 'proofOfCar') {
      setProofOfCar(file);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.make.trim()) newErrors.make = 'Make is required.';
    if (!formData.model.trim()) newErrors.model = 'Model is required.';
    if (!formData.year || isNaN(formData.year) || formData.year < 1886 || formData.year > new Date().getFullYear()) {
      newErrors.year = 'Enter a valid year.';
    }
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License Plate is required.';
    if (!formData.dailyRate || isNaN(formData.dailyRate) || formData.dailyRate <= 0) {
      newErrors.dailyRate = 'Enter a valid daily rate.';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.googleMapsLink.trim()) {
      newErrors.googleMapsLink = 'Enter a valid Google Maps link.';
    }
    if (!formData.transmission) newErrors.transmission = 'Transmission type is required.';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required.';
    if (!formData.seats || isNaN(formData.seats) || formData.seats <= 0) {
      newErrors.seats = 'Enter a valid number of seats.';
    }
    if (!formData.mileage || isNaN(formData.mileage) || formData.mileage <= 0) {
      newErrors.mileage = 'Enter a valid mileage.';
    }
    if (!formData.features.trim()) newErrors.features = 'Features description is required.';

    setErrors({ ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
  
    console.log("Uploading to Cloudinary:", file.name);
  
    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/ddjcj0vkn/upload",
        {
          method: "POST",
          body: formData, // No need for custom headers
        }
      );
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
      
      console.log("Upload successful:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
  
    if (!validateForm()) {
      setMessage("Please fix the highlighted errors.");
      return;
    }
  
    setLoading(true);
  
    try {
      let imageUrl = "";
      let proofUrl = "";
  
      console.log("Uploading image:", image);
      if (image) {
        imageUrl = await uploadToCloudinary(image);
        if (!imageUrl) throw new Error("Image upload failed.");
      }
  
      console.log("Uploading proofOfCar:", proofOfCar);
      if (proofOfCar) {
        proofUrl = await uploadToCloudinary(proofOfCar);
        if (!proofUrl) throw new Error("Proof of car upload failed.");
      }
  
      console.log("Final data before sending to backend:", {
        ...formData,
        image: imageUrl,
        proofOfCar: proofUrl,
      });
  
      const response = await axios.post(
        "http://localhost:3020/car",
        { ...formData, image: imageUrl, proofOfCar: proofUrl },
        {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Car created successfully:", response.data);
      navigate('/Odashboard')
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Car creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100">
      <OwnerNavbar />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-3/4 lg:w-1/2">
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">Add a New Car</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          {[
            { label: 'Name', name: 'name', type: 'text' },
            { label: 'Make', name: 'make', type: 'text' },
            { label: 'Model', name: 'model', type: 'text' },
            { label: 'Year', name: 'year', type: 'number' },
            { label: 'License Plate', name: 'licensePlate', type: 'text' },
            { label: 'Daily Rate', name: 'dailyRate', type: 'number' },
            { label: 'Google Maps Link', name: 'googleMapsLink', type: 'text' },
            { label: 'Seats', name: 'seats', type: 'number' },
            { label: 'Mileage', name: 'mileage', type: 'number' },
          ].map(({ label, name, type }) => (
            <div key={name} className="space-y-1">
              <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}:</label>
              <input
                id={name}
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors[name] && <span className="text-red-500 text-xs">{errors[name]}</span>}
            </div>
          ))}

          {/* Address */}
          <div className="space-y-1">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.address && <span className="text-red-500 text-xs">{errors.address}</span>}
          </div>
          
          {/* Show Address Suggestions */}
          {addressSuggestions.length > 0 && (
            <ul className="bg-white border rounded-md mt-2 max-h-60 overflow-auto">
              {addressSuggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  onClick={() => handleAddressSelect(suggestion)}
                  className="cursor-pointer hover:bg-gray-100 p-2"
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}

          {/* Transmission */}
          <div className="space-y-1">
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Transmission Type:</label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div className="space-y-1">
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Fuel Type:</label>
            <select
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          {/* Features */}
          <div className="space-y-1">
            <label htmlFor="features" className="block text-sm font-medium text-gray-700">Features:</label>
            <textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.features && <span className="text-red-500 text-xs">{errors.features}</span>}
          </div>

          {/* Image */}
          <div className="space-y-1">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Car Image:</label>
            <input
              id="image"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Proof of Car */}
          <div className="space-y-1">
            <label htmlFor="proofOfCar" className="block text-sm font-medium text-gray-700">Proof of Car:</label>
            <input
              id="proofOfCar"
              type="file"
              name="proofOfCar"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Car'}
          </button>

          {/* Error Message */}
          {message && <p className="text-center text-red-500">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateCar;
