import axios from 'axios';

const getAddressSuggestions = async (partialAddress) => {
  const apiKey = process.env.API_KEY; 
  console.log('API Key:', process.env.API_KEY);  // Make sure this is not empty
 // Assuming your OpenCage API key is stored in .env
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(partialAddress)}&key=${apiKey}&limit=5`;  // Limit to 5 suggestions

  try {
    const response = await axios.get(url);

    // Check if there are results
    if (response.status !== 200 || !response.data.results || response.data.results.length === 0) {
      throw new Error('No address suggestions found.');
    }

    // Return the top 5 suggestions
    const suggestions = response.data.results.map(result => ({
      formattedAddress: result.formatted,
      latitude: result.geometry.lat,
      longitude: result.geometry.lng,
    }));

    return suggestions;
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    throw new Error('Unable to fetch address suggestions');
  }
};

// Export it as needed
export { getAddressSuggestions };
