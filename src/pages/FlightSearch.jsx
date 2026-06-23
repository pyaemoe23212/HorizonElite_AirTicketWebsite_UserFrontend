import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchFlights, selectFlight } from '../service/api';

function FlightSearch() {
  const { token, isAuthenticated, user } = useAuth();
  const [localToken, setLocalToken] = useState(token || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Selection modal states
  const [selectedFlightModal, setSelectedFlightModal] = useState(null);
  const [selectingLoading, setSelectingLoading] = useState(false);
  const [selectionError, setSelectionError] = useState(null);
  const [selectionSuccess, setSelectionSuccess] = useState(null);
  
  const [selectionData, setSelectionData] = useState({
    selected_trip_type: 'OUTBOUND',
    baggage_allowance: '20kg',
    refundable_status: false,
  });

  useEffect(() => {
    if (token) {
      setLocalToken(token);
    }
  }, [token]);

  const handleTokenChange = (e) => {
    const newToken = e.target.value;
    setLocalToken(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    }
  };

  const [formData, setFormData] = useState({
    trip_type: 'ONE_WAY',
    adult_passenger_count: 1,
    child_passenger_count: 0,
    infant_passenger_count: 0,
    cabin_class: 'economy',
    currency_code: 'USD',
    origin_airport_code: 'BKK',
    destination_airport_code: 'SIN',
    departure_date: '2026-07-10',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : Number(value),
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!localToken.trim()) {
      setError('Please enter a valid JWT token');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const searchPayload = {
        trip_type: formData.trip_type,
        adult_passenger_count: formData.adult_passenger_count,
        child_passenger_count: formData.child_passenger_count,
        infant_passenger_count: formData.infant_passenger_count,
        cabin_class: formData.cabin_class,
        currency_code: formData.currency_code,
        segments: [
          {
            origin_airport_code: formData.origin_airport_code,
            destination_airport_code: formData.destination_airport_code,
            departure_date: formData.departure_date,
          },
        ],
      };

      console.log('Searching flights with payload:', searchPayload);
      const response = await searchFlights(searchPayload);
      console.log('Search response:', response);
      setResults(response);
    } catch (err) {
      console.error('Search error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to search flights'
      );
    } finally {
      setLoading(false);
    }
  };

  const openSelectionModal = (flight) => {
    setSelectedFlightModal(flight);
    setSelectionError(null);
    setSelectionSuccess(null);
    setSelectionData({
      selected_trip_type: 'OUTBOUND',
      baggage_allowance: '20kg',
      refundable_status: false,
    });
  };

  const closeSelectionModal = () => {
    setSelectedFlightModal(null);
  };

  const handleSelectionDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectionData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectFlight = async () => {
    if (!selectedFlightModal || !results) {
      setSelectionError('Flight or search data missing');
      return;
    }

    setSelectingLoading(true);
    setSelectionError(null);
    setSelectionSuccess(null);

    try {
      const payload = {
        flight_search_id: results.flight_search_id,
        flight_result_id: selectedFlightModal.flight_result_id,
        flight_offer_id: selectedFlightModal.flight_offer_id,
        selected_trip_type: selectionData.selected_trip_type,
        airline_name: selectedFlightModal.airline_name,
        flight_number: selectedFlightModal.airline_code || 'N/A',
        origin_airport_code: selectedFlightModal.departure_airport,
        destination_airport_code: selectedFlightModal.arrival_airport,
        departure_datetime: selectedFlightModal.departure_datetime,
        arrival_datetime: selectedFlightModal.arrival_datetime,
        cabin_class: selectedFlightModal.cabin_class,
        selected_fare_price: parseFloat(selectedFlightModal.total_price),
        currency_code: selectedFlightModal.currency_code,
        baggage_allowance: selectionData.baggage_allowance,
        refundable_status: selectionData.refundable_status,
      };

      console.log('Selecting flight with payload:', payload);
      const response = await selectFlight(payload);
      console.log('Selection response:', response);
      setSelectionSuccess(`Flight selected successfully! Selection ID: ${response.selectedFlight.selected_flight_id}`);
      
      setTimeout(() => {
        closeSelectionModal();
        setSelectionSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Selection error:', err);
      setSelectionError(
        err.response?.data?.message ||
        err.message ||
        'Failed to select flight'
      );
    } finally {
      setSelectingLoading(false);
    }
  };

  return (
    <div className="flight-search p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Flight Search</h1>

      <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <label className="block text-sm font-semibold mb-2">
          JWT Token {isAuthenticated && <span className="text-green-600">(Auto-populated from login)</span>}:
        </label>
        <textarea
          value={localToken}
          onChange={handleTokenChange}
          placeholder="Paste your JWT token here"
          className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
          rows={3}
        />
        <p className="text-xs text-gray-600 mt-2">
          {isAuthenticated 
            ? `Logged in as: ${user?.email_address || 'User'}` 
            : 'Get a token by logging in first, or register and login to receive a token.'}
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Origin Airport:</label>
            <input
              type="text"
              name="origin_airport_code"
              value={formData.origin_airport_code}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., BKK"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Destination Airport:</label>
            <input
              type="text"
              name="destination_airport_code"
              value={formData.destination_airport_code}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="e.g., SIN"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Departure Date:</label>
            <input
              type="date"
              name="departure_date"
              value={formData.departure_date}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Trip Type:</label>
            <select
              name="trip_type"
              value={formData.trip_type}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="ONE_WAY">One Way</option>
              <option value="ROUND_TRIP">Round Trip</option>
              <option value="MULTI_CITY">Multi City</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Cabin Class:</label>
            <select
              name="cabin_class"
              value={formData.cabin_class}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Adult Passengers:</label>
            <input
              type="number"
              name="adult_passenger_count"
              value={formData.adult_passenger_count}
              onChange={handleFormChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Child Passengers:</label>
            <input
              type="number"
              name="child_passenger_count"
              value={formData.child_passenger_count}
              onChange={handleFormChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Infant Passengers:</label>
            <input
              type="number"
              name="infant_passenger_count"
              value={formData.infant_passenger_count}
              onChange={handleFormChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Currency:</label>
            <input
              type="text"
              name="currency_code"
              value={formData.currency_code}
              onChange={handleFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="USD"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          <p className="mb-4">
            <strong>Flight Search ID:</strong> <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{results.flight_search_id}</span>
          </p>

          {results.results && results.results.length > 0 ? (
            <div className="space-y-4">
              {results.results.map((flight, index) => (
                <div key={index} className="border border-gray-300 p-4 rounded bg-gray-50 hover:bg-gray-100 transition">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <p><strong>Airline:</strong> {flight.airline_name}</p>
                    <p><strong>Code:</strong> {flight.airline_code}</p>
                    <p><strong>Price:</strong> <span className="text-green-600 font-bold text-lg">{flight.total_price} {flight.currency_code}</span></p>
                    <p><strong>Stops:</strong> {flight.total_stop_count}</p>
                    <p><strong>Route:</strong> {flight.departure_airport} → {flight.arrival_airport}</p>
                    <p><strong>Cabin:</strong> {flight.cabin_class}</p>
                    <p><strong>Departure:</strong> {new Date(flight.departure_datetime).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> {new Date(flight.arrival_datetime).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => openSelectionModal(flight)}
                    className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
                  >
                    Select Flight
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No flights found for this search.</p>
          )}
        </div>
      )}

      {selectedFlightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Confirm Selection</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedFlightModal.airline_name}
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectionError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {selectionError}
                </div>
              )}

              {selectionSuccess && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                  ✓ {selectionSuccess}
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
                <p><strong>Price:</strong> {selectedFlightModal.total_price} {selectedFlightModal.currency_code}</p>
                <p><strong>Departure:</strong> {new Date(selectedFlightModal.departure_datetime).toLocaleString()}</p>
                <p><strong>Arrival:</strong> {new Date(selectedFlightModal.arrival_datetime).toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Trip Type <span className="text-red-500">*</span></label>
                <select
                  name="selected_trip_type"
                  value={selectionData.selected_trip_type}
                  onChange={handleSelectionDataChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="OUTBOUND">Outbound</option>
                  <option value="RETURN">Return</option>
                  <option value="MULTI_CITY">Multi City</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Baggage Allowance</label>
                <input
                  type="text"
                  name="baggage_allowance"
                  value={selectionData.baggage_allowance}
                  onChange={handleSelectionDataChange}
                  placeholder="e.g., 20kg"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="refundable_status"
                    checked={selectionData.refundable_status}
                    onChange={handleSelectionDataChange}
                  />
                  <span className="text-sm font-semibold">Refundable</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeSelectionModal}
                disabled={selectingLoading}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded font-semibold hover:bg-gray-500 disabled:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSelectFlight}
                disabled={selectingLoading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400"
              >
                {selectingLoading ? 'Selecting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
