import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import OwnerNavbar from '../components/OwnerNavbar';

const EditCar = () => {
  const { id } = useParams(); // Get car ID from URL
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
    features: '', // Now a string
  });

  const [image, setImage] = useState(null);
  const [proofOfCar, setProofOfCar] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State to control the modal visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3020/car/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching car data:", error);
      }
    };

    fetchCar();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'image') {
      setImage(e.target.files[0]);
    } else if (e.target.name === 'proofOfCar') {
      setProofOfCar(e.target.files[0]);
    }
  };

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
    if (!formData.transmission) newErrors.transmission = 'Transmission type is required.';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required.';
    if (!formData.seats || isNaN(formData.seats) || formData.seats <= 0) {
      newErrors.seats = 'Enter a valid number of seats.';
    }
    if (!formData.mileage || isNaN(formData.mileage) || formData.mileage <= 0) {
      newErrors.mileage = 'Enter a valid mileage.';
    }
    if (!formData.features.trim()) newErrors.features = 'Features field is required.';

    if (image && !['image/jpeg', 'image/png'].includes(image.type)) {
      newErrors.image = 'Only JPEG and PNG images are allowed.';
    }

    if (proofOfCar && proofOfCar.type !== 'application/pdf') {
      newErrors.proofOfCar = 'Only PDF files are allowed for proof of car.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage('Please fix the highlighted errors.');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (image) data.append('image', image);
    if (proofOfCar) data.append('proofOfCar', proofOfCar);

    try {
      const response = await axios.put(`http://localhost:3020/car/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Car updated successfully!');
      setShowSuccessModal(true); // Show the success modal
      setTimeout(() => {
        setShowSuccessModal(false); // Hide the modal after 3 seconds
        navigate('/Odashboard');
      }, 3000);
    } catch (error) {
      console.error("Error updating car:", error);
      setMessage(error.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    
    <div className="w-full p-6 bg-white shadow-md rounded-lg">
    <OwnerNavbar />
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Edit Car</h1>
    </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[{ label: 'Name', name: 'name', type: 'text' },
        { label: 'Make', name: 'make', type: 'text' },
        { label: 'Model', name: 'model', type: 'text' },
        { label: 'Year', name: 'year', type: 'number' },
        { label: 'License Plate', name: 'licensePlate', type: 'text' },
        { label: 'Daily Rate', name: 'dailyRate', type: 'number' },
        { label: 'Address', name: 'address', type: 'text' },
        { label: 'Seats', name: 'seats', type: 'number' },
        { label: 'Mileage', name: 'mileage', type: 'number' }].map(({ label, name, type }) => (
          <div key={name} className="flex flex-col">
            <label className="font-medium text-gray-700">{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
            {errors[name] && <span className="text-red-500 text-sm">{errors[name]}</span>}
          </div>
        ))}

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Transmission:</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
          {errors.transmission && <span className="text-red-500 text-sm">{errors.transmission}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Fuel Type:</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {errors.fuelType && <span className="text-red-500 text-sm">{errors.fuelType}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Features:</label>
          <textarea
            name="features"
            value={formData.features}
            onChange={handleInputChange}
            placeholder="Enter car features, separated by commas"
            className="p-2 border border-gray-300 rounded-md"
            required
          />
          {errors.features && <span className="text-red-500 text-sm">{errors.features}</span>}
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Upload Image:</label>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded-md"
          />
          {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
        </div>

        {formData.image && (
          <div>
            <label className="font-medium text-gray-700">Current Image:</label>
            <img
              src={formData.image} // Now points to Cloudinary URL
              alt="Car Image"
              className="w-24 h-24 object-cover mt-2"
            />
          </div>
        )}

        <div className="flex flex-col">
          <label className="font-medium text-gray-700">Proof of Car:</label>
          <input
            type="file"
            name="proofOfCar"
            accept="application/pdf"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded-md"
          />
          {errors.proofOfCar && <span className="text-red-500 text-sm">{errors.proofOfCar}</span>}
        </div>

        {formData.proofOfCar && (
          <div>
            <label className="font-medium text-gray-700">Current Proof of Car:</label>
            <a 
              href={formData.proofOfCar} // Now points to Cloudinary URL
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              View Proof of Car
            </a>
          </div>
        )}

        <div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
            Update
          </button>
        </div>
      </form>

      {message && <p className="mt-4 text-center text-green-500">{message}</p>}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold">Car Updated Successfully!</h2>
            <button 
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md" 
              onClick={() => setShowSuccessModal(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCar;
