import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { selectFlight } from '../service/api';

export default function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    searchResults = [],
    flightSearchId,
    searchParams,
    flightType = 'OUTBOUND',
    outboundFlight = null,
    selectedOutboundFlightId = null,
  } = location.state || {};

  const [sortBy, setSortBy] = useState('price');
  const [selectedFlightModal, setSelectedFlightModal] = useState(null);
  const [selectingLoading, setSelectingLoading] = useState(false);
  const [selectionError, setSelectionError] = useState(null);
  const [selectionSuccess, setSelectionSuccess] = useState(null);
  const [selectionData, setSelectionData] = useState({
    cabin_class: 'economy',
    baggage_allowance: '20kg',
    refundable_status: false,
  });

  const isReturnFlight = flightType === 'RETURN';

  // Sort results
  const getSortedResults = () => {
    let sorted = [...searchResults];
    if (sortBy === 'price') {
      sorted.sort((a, b) => parseFloat(a.total_price) - parseFloat(b.total_price));
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => a.total_stop_count - b.total_stop_count);
    } else if (sortBy === 'departure') {
      sorted.sort(
        (a, b) =>
          new Date(a.departure_datetime) - new Date(b.departure_datetime)
      );
    }
    return sorted;
  };

  const sortedResults = getSortedResults();

  const openSelectionModal = (flight) => {
    setSelectedFlightModal(flight);
    setSelectionError(null);
    setSelectionSuccess(null);
    setSelectionData({
      cabin_class: 'economy',
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
    if (!selectedFlightModal) {
      setSelectionError('Flight data missing');
      return;
    }

    setSelectingLoading(true);
    setSelectionError(null);
    setSelectionSuccess(null);

    try {
      const flight = selectedFlightModal;
      const tripType = isReturnFlight ? 'RETURN' : 'OUTBOUND';

      const payload = {
        flight_search_id: flightSearchId,
        flight_result_id: flight.flight_result_id,
        flight_offer_id: flight.flight_offer_id,
        selected_trip_type: tripType,
        airline_name: flight.airline_name,
        flight_number: flight.airline_code || flight.flight_number || 'N/A',
        origin_airport_code: flight.departure_airport,
        destination_airport_code: flight.arrival_airport,
        departure_datetime: flight.departure_datetime,
        arrival_datetime: flight.arrival_datetime,
        cabin_class: selectionData.cabin_class || flight.cabin_class || 'economy',
        selected_fare_price: parseFloat(flight.total_price),
        currency_code: flight.currency_code,
        baggage_allowance: selectionData.baggage_allowance,
        refundable_status: selectionData.refundable_status,
      };

      console.log(`Selecting ${tripType} flight:`, payload);
      const response = await selectFlight(payload);
      setSelectionSuccess(`✓ ${tripType} flight selected!`);

      setTimeout(() => {
        closeSelectionModal();

        if (isReturnFlight) {
          // Return flight selected - go to passengers
          navigate('/passengers', {
            state: {
              selectedFlight: outboundFlight,
              selectedFlightId: selectedOutboundFlightId,
              returnFlight: flight,
              selectedReturnFlightId: response.selectedFlight.selected_flight_id,
              flightSearchId: flightSearchId,
              tripType: 'ROUND_TRIP',
            },
          });
        } else {
          // Outbound flight selected
          if (searchParams?.tripType === 'ROUND_TRIP') {
            // For round trip, show return flights
            navigate('/flight-results', {
              state: {
                searchResults: searchResults.slice(Math.ceil(searchResults.length / 2)),
                flightSearchId: flightSearchId,
                searchParams: searchParams,
                flightType: 'RETURN',
                outboundFlight: flight,
                selectedOutboundFlightId: response.selectedFlight.selected_flight_id,
              },
            });
          } else {
            // For one-way, go directly to passengers
            navigate('/passengers', {
              state: {
                selectedFlight: flight,
                selectedFlightId: response.selectedFlight.selected_flight_id,
                flightSearchId: flightSearchId,
                tripType: 'ONE_WAY',
              },
            });
          }
        }
      }, 1500);
    } catch (err) {
      console.error('Selection error:', err);
      setSelectionError(
        err.response?.data?.error ||
        err.message ||
        'Failed to select flight'
      );
    } finally {
      setSelectingLoading(false);
    }
  };


  if (!flightSearchId || searchResults.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">No Flights Found</h1>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or travel dates
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => isReturnFlight ? navigate(-1) : navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4 flex items-center gap-2"
          >
            ← {isReturnFlight ? 'Back to Outbound' : 'New Search'}
          </button>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ✈️ Select {isReturnFlight ? 'Return' : 'Outbound'} Flight
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Route</p>
                <p className="font-bold text-gray-800">
                  {isReturnFlight
                    ? `${searchParams?.destination} → ${searchParams?.origin}`
                    : `${searchParams?.origin} → ${searchParams?.destination}`}
                </p>
              </div>
              <div>
                <p className="text-gray-600">{isReturnFlight ? 'Return Date' : 'Departure Date'}</p>
                <p className="font-bold text-gray-800">
                  {isReturnFlight
                    ? new Date(searchParams?.return).toLocaleDateString()
                    : new Date(searchParams?.departure).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Passengers</p>
                <p className="font-bold text-gray-800">{searchParams?.passengers}</p>
              </div>
              <div>
                <p className="text-gray-600">Trip Type</p>
                <p className="font-bold text-gray-800 capitalize">
                  {searchParams?.tripType?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Outbound Summary for Return Flight Selection */}
          {isReturnFlight && outboundFlight && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Outbound Flight Selected ✓</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{outboundFlight?.airline_name}</p>
                  <p className="text-sm text-gray-600">
                    {outboundFlight?.departure_airport} → {outboundFlight?.arrival_airport}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {outboundFlight?.currency_code}
                    {outboundFlight?.selected_fare_price}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {selectionError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {selectionError}
            </div>
          )}

          {/* Sort Options */}
          <div className="flex gap-3 flex-wrap">
            <label className="text-sm font-semibold text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Lowest Price</option>
              <option value="duration">Shortest Duration</option>
              <option value="departure">Earliest Departure</option>
            </select>
          </div>
        </div>

        {/* Flights List */}
        <div className="space-y-4">
          {sortedResults.map((flight, index) => (
            <FlightCard
              key={index}
              flight={flight}
              onSelect={() => openSelectionModal(flight)}
            />
          ))}
        </div>

        {/* Selection Modal */}
        {selectedFlightModal && (
          <FlightSelectionModal
            selectedFlightModal={selectedFlightModal}
            selectionData={selectionData}
            selectionError={selectionError}
            selectionSuccess={selectionSuccess}
            selectingLoading={selectingLoading}
            onClose={closeSelectionModal}
            onDataChange={handleSelectionDataChange}
            onConfirm={handleSelectFlight}
          />
        )}
      </div>
    </div>
  );
}

// Flight Card Component
function FlightCard({ flight, onSelect }) {
  return (
    <div
      className={`rounded-lg shadow-md hover:shadow-lg transition-all p-6 border-2 border-gray-200 bg-white hover:border-blue-300 cursor-pointer`}
      onClick={onSelect}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Airline & Price */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Airline</p>
          <p className="font-bold text-lg text-gray-800">
            {flight.airline_name}
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {flight.currency_code}
            {parseFloat(flight.total_price).toFixed(2)}
          </p>
        </div>

        {/* Departure */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Departure</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Date(flight.departure_datetime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-gray-600">
            {flight.departure_airport}
          </p>
        </div>

        {/* Duration & Stops */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Duration</p>
          <p className="font-bold text-gray-800 mb-1">
            {flight.total_stop_count === 0
              ? '✓ Direct'
              : `${flight.total_stop_count} stop${
                  flight.total_stop_count > 1 ? 's' : ''
                }`}
          </p>
          <div className="flex items-center justify-center gap-2 my-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1 border-t-2 border-blue-300"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* Arrival */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Arrival</p>
          <p className="text-2xl font-bold text-gray-800">
            {new Date(flight.arrival_datetime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-gray-600">
            {flight.arrival_airport}
          </p>
        </div>

        {/* Select Button */}
        <div className="text-right">
          <button
            className={`w-full md:w-auto font-bold py-2 px-6 rounded-lg transition-all bg-blue-600 hover:bg-blue-700 text-white`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

// Flight Selection Modal Component
function FlightSelectionModal({
  selectedFlightModal,
  selectionData,
  selectionError,
  selectionSuccess,
  selectingLoading,
  onClose,
  onDataChange,
  onConfirm,
}) {
  const flight = selectedFlightModal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold">
            Confirm Flight Selection
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            {flight?.airline_name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {selectionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              ❌ {selectionError}
            </div>
          )}

          {selectionSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              ✓ {selectionSuccess}
            </div>
          )}

          {/* Flight Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {new Date(flight?.departure_datetime).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </p>
                <p className="text-xs text-gray-600">
                  {flight?.departure_airport}
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">
                    {flight?.total_stop_count === 0 ? 'Direct' : `${flight?.total_stop_count} stop`}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1 border-t-2 border-blue-600"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {new Date(flight?.arrival_datetime).toLocaleTimeString(
                    [],
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </p>
                <p className="text-xs text-gray-600">
                  {flight?.arrival_airport}
                </p>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-3">
              <p className="text-center text-gray-700">
                <strong>Price:</strong>{' '}
                <span className="text-green-600 font-bold">
                  {flight?.currency_code}
                  {parseFloat(flight?.total_price).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Baggage Allowance
            </label>
            <input
              type="text"
              name="baggage_allowance"
              value={selectionData.baggage_allowance}
              onChange={onDataChange}
              placeholder="e.g., 20kg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="refundable_status"
                checked={selectionData.refundable_status}
                onChange={onDataChange}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-semibold text-gray-700">
                Refundable Ticket
              </span>
            </label>
          </div>

          {/* Cabin Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cabin Class <span className="text-red-500">*</span>
            </label>
            <select
              name="cabin_class"
              value={selectionData.cabin_class}
              onChange={onDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First Class</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={selectingLoading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={selectingLoading}
            className={`flex-1 text-white px-4 py-2 rounded-lg font-semibold transition-all ${
              selectingLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
          >
            {selectingLoading ? '⏳ Selecting...' : '✓ Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}