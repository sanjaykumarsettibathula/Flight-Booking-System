const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Flights
  getFlights: async () => {
    const response = await fetch(`${API_BASE_URL}/flights`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  getFlight: async (id) => {
    const response = await fetch(`${API_BASE_URL}/flights/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  searchFlights: async (departure, arrival, date) => {
    const query = new URLSearchParams({
      departure,
      arrival,
      date: new Date(date).toISOString().split("T")[0],
    });

    const response = await fetch(`${API_BASE_URL}/flights/search?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  // Booking Attempts (surge)
  createBookingAttempt: async (flightId) => {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}/attempt`, {
      method: "POST",
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  trackPrice: async (flightId) => {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}/price`, {
      method: "GET",
    });
    return handleResponse(response);
  },

  // Bookings
  createBooking: async (bookingData) => {
    const payload = {
      ...bookingData,
      flightId: bookingData.flightId || bookingData.flight,
    };
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  downloadTicket: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/ticket`, {
      method: "GET",
      headers: authHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to download ticket");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  // Wallet
  getWallet: async () => {
    const response = await fetch(`${API_BASE_URL}/wallet`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message =
      (isJson && (data.message || data.error)) ||
      (typeof data === "string" ? data : "Something went wrong");
    throw new Error(message);
  }
  return data;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
