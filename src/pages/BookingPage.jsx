import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../service/api';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedFlight,
    returnFlight = null,
    flightSearchId,
    selectedFlightId,
    selectedReturnFlightId = null,
    passengers,
    passengerIds,
    tripType = 'ONE_WAY',
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Calculate total price
  const totalPrice = selectedFlight
    ? (parseFloat(selectedFlight.selected_fare_price) * passengers.length).toFixed(2)
    : '0.00';

  const currencyCode = selectedFlight?.currency_code || 'USD';
  const cabinClass = selectedFlight?.cabin_class || 'ECONOMY';

  // Determine correct trip_type
  // If returnFlight exists, it's ROUND_TRIP. Otherwise ONE_WAY
  const correctTripType = returnFlight ? 'ROUND_TRIP' : 'ONE_WAY';

  // Submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!selectedFlight || !selectedFlightId || !passengers || passengers.length === 0 || !user?.email_address) {
      setError('Missing required booking information');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        user_email_address: user.email_address,
        selected_flight_id: selectedFlightId,
        passenger_ids: passengerIds,
        total_payment_amount: parseFloat(totalPrice),
        currency_code: currencyCode,
        trip_type: correctTripType,
        cabin_class: cabinClass,
        fare_brand_id: null,
      };

      const response = await createBooking(bookingData);
      setBookingSuccess(response.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating booking');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle new search
  const handleNewSearch = () => {
    navigate('/', { replace: true });
  };

  // Handle payment navigation
  const handleProceedToPayment = () => {
    if (bookingSuccess) {
      navigate('/payment', {
        state: {
          booking: bookingSuccess,
          selectedFlight,
        },
      });
    }
  };

  if (!selectedFlight || !selectedFlightId || !passengers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Booking Data</h1>
          <p className="text-gray-600 mb-6">Please complete the passenger information first.</p>
          <button
            onClick={() => navigate('/passengers')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Passengers
          </button>
        </div>
      </div>
    );
  }

  // Success screen
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">Your booking has been created successfully.</p>

            {/* PNR Reference - Prominently Displayed */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 mb-8 text-white">
              <p className="text-sm font-semibold mb-2 opacity-90">Your Booking Reference</p>
              <p className="text-5xl font-bold tracking-widest">{bookingSuccess.pnr_reference}</p>
              <p className="text-sm mt-4 opacity-90">Keep this reference for check-in and inquiries</p>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-lg font-semibold text-gray-800">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                      {bookingSuccess.booking_status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ticketing Status</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {bookingSuccess.ticketing_status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {bookingSuccess.currency_code} {bookingSuccess.total_payment_amount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Number of Passengers</p>
                  <p className="text-lg font-semibold text-gray-800">{bookingSuccess.passengers?.length || passengers.length}</p>
                </div>
              </div>

              {/* Passengers List */}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-4">Passengers</h3>
                <div className="space-y-3">
                  {(bookingSuccess.passengers || passengers).map((passenger, index) => (
                    <div key={passenger.passenger_id || index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {passenger.pi_first_name} {passenger.pi_last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {passenger.pi_passenger_type_code === 'ADT'
                            ? 'Adult'
                            : passenger.pi_passenger_type_code === 'CHD'
                            ? 'Child'
                            : 'Infant'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flight Info */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-800 mb-4">Flight Information</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {selectedFlight.origin_airport_code}
                      </p>
                    </div>
                    <div className="text-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {selectedFlight.destination_airport_code}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Airline</p>
                      <p className="font-semibold text-gray-800">{selectedFlight.airline_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Flight Number</p>
                      <p className="font-semibold text-gray-800">{selectedFlight.flight_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(selectedFlight.departure_datetime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Class</p>
                      <p className="font-semibold text-gray-800">{selectedFlight.cabin_class}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Proceed to Payment
              </button>
              <button
                onClick={handleNewSearch}
                className="w-full bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition"
              >
                New Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review & Confirm Booking Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Review & Confirm Booking</h1>
          <p className="text-gray-600">Please verify all details before confirming your booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
                  {error}
                </div>
              )}

              {/* Flight Details */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">✈️ Flight Details</h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Airline</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedFlight?.airline_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Flight Number</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedFlight?.flight_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Route</p>
                      <p className="text-lg font-bold text-gray-800">
                        {selectedFlight?.origin_airport_code} → {selectedFlight?.destination_airport_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Trip Type</p>
                      <p className="text-lg font-bold text-gray-800 capitalize">
                        {correctTripType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Departure</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(selectedFlight?.departure_datetime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Arrival</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(selectedFlight?.arrival_datetime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cabin Class</p>
                      <p className="text-lg font-semibold text-gray-800 capitalize">
                        {cabinClass.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Flight for Round Trip */}
                {returnFlight && (
                  <div className="mt-6 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                    <h3 className="font-bold text-gray-800 mb-4">Return Flight</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Airline</p>
                        <p className="text-lg font-bold text-gray-800">
                          {returnFlight?.airline_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Flight Number</p>
                        <p className="text-lg font-bold text-gray-800">
                          {returnFlight?.flight_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Departure</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(returnFlight?.departure_datetime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Arrival</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(returnFlight?.arrival_datetime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">👥 Passengers ({passengers.length})</h2>
                <div className="space-y-3">
                  {passengers.map((passenger, index) => (
                    <div
                      key={passenger.passenger_id || index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-800">
                            {passenger.pi_title} {passenger.pi_first_name} {passenger.pi_last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {passenger.pi_passenger_type_code === 'ADT'
                              ? 'Adult'
                              : passenger.pi_passenger_type_code === 'CHD'
                              ? 'Child'
                              : 'Infant'}{' '}
                            • DOB: {new Date(passenger.pi_date_of_birth).toLocaleDateString()}
                          </p>
                          {passenger.pi_passport_number && (
                            <p className="text-sm text-gray-600">
                              Passport: {passenger.pi_passport_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Price Summary</h2>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-600">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Price per Passenger:</span>
                      <span className="font-semibold text-gray-800">
                        {currencyCode} {selectedFlight?.selected_fare_price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Number of Passengers:</span>
                      <span className="font-semibold text-gray-800">{passengers.length}</span>
                    </div>
                    <div className="border-t border-green-200 pt-3 flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-lg">Total Amount:</span>
                      <span className="text-3xl font-bold text-green-600">
                        {currencyCode} {totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Email */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                <p className="text-sm text-gray-600 mb-1">Confirmation will be sent to:</p>
                <p className="font-semibold text-gray-800">{user?.email_address}</p>
              </div>

              {/* Confirm Button */}
              <form onSubmit={handleBookingSubmit}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 text-lg"
                >
                  {loading ? '⏳ Creating Booking...' : '✓ Confirm & Create Booking'}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Summary</h2>

              {/* Quick Info */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trip Type</p>
                  <p className="font-bold text-gray-800 capitalize">
                    {correctTripType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Passengers</p>
                  <p className="font-bold text-gray-800">{passengers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cabin Class</p>
                  <p className="font-bold text-gray-800 capitalize">
                    {cabinClass.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Total Price Highlight */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-6">
                <p className="text-xs text-gray-600 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">
                  {currencyCode} {totalPrice}
                </p>
              </div>

              {/* Airline Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Airline</p>
                <p className="font-bold text-gray-800 text-lg mb-1">
                  {selectedFlight?.airline_name}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedFlight?.origin_airport_code} → {selectedFlight?.destination_airport_code}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}