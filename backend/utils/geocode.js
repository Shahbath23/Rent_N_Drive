import axios from 'axios';

export const geocodeAddress = async (address) => {
  const apiKey = process.env.API_KEY; // Replace with your OpenCage API key
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);

    // Check if the response status is OK and there are results
    if (response.status !== 200 || !response.data.results || response.data.results.length === 0) {
      throw new Error('No results found for the provided address.');
    }

    // Extract latitude and longitude from the first result
    const { lat, lng } = response.data.results[0].geometry;

    // Return the results as an array of objects
    return [{ latitude: lat, longitude: lng }];
  } catch (error) {
    console.error('Error geocoding address:', error.message);
    throw new Error('Unable to geocode address');
  }
};

// Export as default with alias
export default { geocode: geocodeAddress };
