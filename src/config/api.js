// API Configuration
export const API_BASE_URL = "https://edunoble-backend.vercel.app/apis";
// export const API_BASE_URL = "http://localhost:8001/apis";

// Helper function to build full API endpoint URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

