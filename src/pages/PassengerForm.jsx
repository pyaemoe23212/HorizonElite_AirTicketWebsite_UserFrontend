import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPassenger, deletePassenger } from '../service/api';

export default function PassengerForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedFlight, 
    flightSearchId, 
    selectedFlightId,
    returnFlight = null,
    selectedReturnFlightId = null,
    tripType = 'ONE_WAY'
  } = location.state || {};

  const [passengers, setPassengers] = useState([]);
  const [formData, setFormData] = useState({
    pi_title: 'Mr',
    pi_first_name: '',
    pi_middle_name: '',
    pi_last_name: '',
    pi_gender: 'M',
    pi_date_of_birth: '',
    pi_nationality: '',
    pi_passenger_type_code: 'ADT',
    pi_passport_number: '',
    pi_passport_issuing_country: '',
    pi_passport_expiry_date: '',
    pi_contact_email: '',
    pi_contact_phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add passenger
  const handleAddPassenger = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate required fields
    if (
      !formData.pi_first_name ||
      !formData.pi_last_name ||
      !formData.pi_date_of_birth ||
      !formData.pi_nationality ||
      !formData.pi_contact_email ||
      !formData.pi_contact_phone
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await createPassenger({
        ...formData,
        selected_flight_id: selectedFlightId,
      });
      const newPassenger = response.passenger;

      setPassengers((prev) => [...prev, newPassenger]);
      setSuccessMessage(`${formData.pi_first_name} ${formData.pi_last_name} added successfully`);

      // Reset form
      setFormData({
        pi_title: 'Mr',
        pi_first_name: '',
        pi_middle_name: '',
        pi_last_name: '',
        pi_gender: 'M',
        pi_date_of_birth: '',
        pi_nationality: '',
        pi_passenger_type_code: 'ADT',
        pi_passport_number: '',
        pi_passport_issuing_country: '',
        pi_passport_expiry_date: '',
        pi_contact_email: '',
        pi_contact_phone: '',
      });

      // Clear success message after 2 seconds
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding passenger');
    } finally {
      setLoading(false);
    }
  };

  // Remove passenger
  const handleRemovePassenger = async (passengerId) => {
    setLoading(true);
    try {
      await deletePassenger(passengerId);
      setPassengers((prev) => prev.filter((p) => p.passenger_id !== passengerId));
      setSuccessMessage('Passenger removed');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError('Error removing passenger');
    } finally {
      setLoading(false);
    }
  };

  // Continue to booking
  const handleContinueToBooking = () => {
    if (passengers.length === 0) {
      setError('Please add at least one passenger');
      return;
    }

    navigate('/booking', {
      state: {
        selectedFlight,
        returnFlight,
        flightSearchId,
        selectedFlightId,
        selectedReturnFlightId,
        passengers,
        passengerIds: passengers.map((p) => p.passenger_id),
        tripType,
      },
    });
  };

  if (!selectedFlight || !selectedFlightId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Flight Selected</h1>
          <p className="text-gray-600 mb-6">Please select a flight first.</p>
          <button
            onClick={() => navigate('/flight-results')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Flight Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Passengers</h1>
          <p className="text-gray-600">
            Add passenger information for your flight from {selectedFlight.origin_airport_code} to{' '}
            {selectedFlight.destination_airport_code}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Passenger Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleAddPassenger}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Passenger Information</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
                  {successMessage}
                </div>
              )}

              {/* Title and Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title*</label>
                  <select
                    name="pi_title"
                    value={formData.pi_title}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="pi_first_name"
                    value={formData.pi_first_name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="pi_middle_name"
                    value={formData.pi_middle_name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Michael"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    name="pi_last_name"
                    value={formData.pi_last_name}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Gender and DOB Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender*</label>
                  <select
                    name="pi_gender"
                    value={formData.pi_gender}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="X">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    name="pi_date_of_birth"
                    value={formData.pi_date_of_birth}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Nationality and Passenger Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nationality*
                  </label>
                  <input
                    type="text"
                    name="pi_nationality"
                    value={formData.pi_nationality}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Thai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passenger Type*
                  </label>
                  <select
                    name="pi_passenger_type_code"
                    value={formData.pi_passenger_type_code}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ADT">Adult (ADT)</option>
                    <option value="CHD">Child (CHD)</option>
                    <option value="INF">Infant (INF)</option>
                  </select>
                </div>
              </div>

              {/* Passport Information */}
              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Passport Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      name="pi_passport_number"
                      value={formData.pi_passport_number}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., A12345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issuing Country
                    </label>
                    <input
                      type="text"
                      name="pi_passport_issuing_country"
                      value={formData.pi_passport_issuing_country}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Thailand"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    name="pi_passport_expiry_date"
                    value={formData.pi_passport_expiry_date}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="pi_contact_email"
                      value={formData.pi_contact_email}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone*
                    </label>
                    <input
                      type="tel"
                      name="pi_contact_phone"
                      value={formData.pi_contact_phone}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="+66812345678"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Adding Passenger...' : 'Add Passenger'}
              </button>
            </form>
          </div>

          {/* Passengers Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Passengers ({passengers.length})
              </h2>

              {passengers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No passengers added yet</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {passengers.map((passenger) => (
                    <div key={passenger.passenger_id} className="border-l-4 border-blue-500 pl-4 pb-4 border-b">
                      <p className="font-bold text-gray-800">
                        {passenger.pi_title} {passenger.pi_first_name} {passenger.pi_last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {passenger.pi_passenger_type_code === 'ADT'
                          ? 'Adult'
                          : passenger.pi_passenger_type_code === 'CHD'
                          ? 'Child'
                          : 'Infant'}
                      </p>
                      <button
                        onClick={() => handleRemovePassenger(passenger.passenger_id)}
                        className="text-red-500 text-sm font-semibold hover:text-red-700 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Flight Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-800 mb-3">Flight Summary</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>From:</strong> {selectedFlight.origin_airport_code}
                  </p>
                  <p>
                    <strong>To:</strong> {selectedFlight.destination_airport_code}
                  </p>
                  <p>
                    <strong>Airline:</strong> {selectedFlight.airline_name}
                  </p>
                  <p>
                    <strong>Flight:</strong> {selectedFlight.flight_number}
                  </p>
                  <p>
                    <strong>Price:</strong> {selectedFlight.currency_code}{' '}
                    {selectedFlight.selected_fare_price}
                  </p>
                </div>
              </div>

              <button
                onClick={handleContinueToBooking}
                disabled={passengers.length === 0}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                Continue to Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}