const config = {
  // API Base URL - Update this based on your environment
  API_BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",

  // Default pagination settings
  PAGINATION: {
    pageSize: 10,
    pageNumber: 1,
  },

  // Default date format
  DATE_FORMAT: "yyyy-MM-dd",

  // Default currency
  CURRENCY: "₹",

  // Default wallet balance
  DEFAULT_WALLET_BALANCE: 50000,

  // JWT token expiration time (in days)
  JWT_EXPIRE: "30d",

  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Google Maps API Key (if needed)
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
};

// Make sure to set environment variables in your .env file
// Example .env file content:
// REACT_APP_API_URL=http://localhost:5000/api
// REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

export default config;

// Export as module.exports for Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = config;
}
