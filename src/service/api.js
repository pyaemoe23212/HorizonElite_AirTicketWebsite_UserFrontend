import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== FLIGHT SEARCH ====================

/**
 * Search for flights
 * @param {Object} searchData - Flight search parameters
 * @param {string} searchData.trip_type - ONE_WAY, ROUND_TRIP, or MULTI_CITY
 * @param {number} searchData.adult_passenger_count
 * @param {number} searchData.child_passenger_count
 * @param {number} searchData.infant_passenger_count
 * @param {string} searchData.cabin_class - e.g., 'economy'
 * @param {string} searchData.currency_code - e.g., 'USD'
 * @param {Array} searchData.segments - Array of flight segments
 * @returns {Promise}
 */
export const searchFlights = async (searchData) => {
  try {
    const response = await api.post('/api/flights/search', searchData);
    return response.data;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};

// ==================== FLIGHT RESULTS ====================

/**
 * Get saved flight results for a specific search
 * @param {string} flightSearchId - The flight search ID
 * @returns {Promise}
 */
export const getFlightResults = async (flightSearchId) => {
  try {
    const response = await api.get(`/api/results/${flightSearchId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting flight results:', error);
    throw error;
  }
};

// ==================== SELECTED FLIGHTS ====================

/**
 * Select and save a flight
 * @param {Object} flightData - Selected flight data
 * @returns {Promise}
 */
export const selectFlight = async (flightData) => {
  try {
    const response = await api.post('/api/selected-flights', flightData);
    return response.data;
  } catch (error) {
    console.error('Error selecting flight:', error);
    throw error;
  }
};

// ==================== PASSENGERS ====================

/**
 * Create a new passenger
 * @param {Object} passengerData - Passenger information
 * @returns {Promise}
 */
export const createPassenger = async (passengerData) => {
  try {
    const response = await api.post('/api/passengers', passengerData);
    return response.data;
  } catch (error) {
    console.error('Error creating passenger:', error);
    throw error;
  }
};

/**
 * Delete a passenger
 * @param {string} passengerId - The passenger ID to delete
 * @returns {Promise}
 */
export const deletePassenger = async (passengerId) => {
  try {
    const response = await api.delete(`/api/passengers/${passengerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting passenger:', error);
    throw error;
  }
};

// ==================== BOOKINGS ====================

/**
 * Create a booking with selected flight and passengers
 * @param {Object} bookingData - Booking information
 * @returns {Promise}
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export default api;
