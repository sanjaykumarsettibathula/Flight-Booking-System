const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");

  if (response.ok) {
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  // Handle error responses
  let errorMessage = "An error occurred";
  if (contentType && contentType.includes("application/json")) {
    const errorData = await response.json();
    errorMessage =
      errorData.message || errorData.error || JSON.stringify(errorData);
  } else {
    errorMessage = (await response.text()) || response.statusText;
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  throw error;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Flights
  getFlights: async () => {
    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  // Get single flight
  getFlight: async (id) => {
    const response = await fetch(`${API_BASE_URL}/flights/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  // Search flights
  searchFlights: async (departure, arrival, date) => {
    const query = new URLSearchParams({
      departure,
      arrival,
      date: new Date(date).toISOString().split("T")[0],
    });

    const response = await fetch(`${API_BASE_URL}/flights/search?${query}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  // Bookings
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(bookingData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Wallet
  getWallet: async () => {
    const response = await fetch(`${API_BASE_URL}/wallet`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });
    return handleResponse(response);
  },

  // Booking Attempts (for surge pricing)
  createBookingAttempt: async (attemptData) => {
    const response = await fetch(`${API_BASE_URL}/booking-attempts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(attemptData),
      credentials: "include",
    });
    return handleResponse(response);
  },
};

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}
