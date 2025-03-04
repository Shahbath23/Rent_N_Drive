import { useState } from "react";
import axios from "axios"

 const MapSelector = ({ onLocationSelect }) => {
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: searchValue,
          key: "96f5b1d8362c4fb79820b03ed866ca47", // Replace with your OpenCage API key
        },
        headers: {
            Authorization: `${localStorage.getItem('token')}`,
        },
      });

      if (!response.data.results || response.data.results.length === 0) {
        setError("No results found. Try another location.");
        return;
      }

      const location = response.data.results[0];
      const coordinates = {
        lat: location.geometry.lat,
        lng: location.geometry.lng,
        address: {
          street: location.components.road || "",
          city: location.components.city || location.components.town || "",
          state: location.components.state || "",
          zipCode: location.components.postcode || "",
          country: location.components.country || "",
        },
      };
      onLocationSelect(coordinates);
      setSearchValue("");
    } catch (err) {
      setError("Error fetching location. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for a location..."
          required
        />
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>Map placeholder</div>
    </div>
  );
};
export default MapSelector