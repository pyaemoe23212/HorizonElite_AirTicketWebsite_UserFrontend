import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { searchFlights } from '../service/api';

const heroImageUrl =
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=85';

const benefits = [
  {
    title: 'Best Price Guarantee',
    description: 'We match the lowest fares',
    icon: 'badge',
  },
  {
    title: 'Secure Booking',
    description: 'Your data is 100% protected',
    icon: 'shield',
  },
  {
    title: '24/7 Customer Support',
    description: "We're here to help anytime",
    icon: 'headset',
  },
  {
    title: 'Fly With Confidence',
    description: 'Trusted by millions worldwide',
    icon: 'plane',
  },
];

function FieldIcon({ type, className = 'h-5 w-5' }) {
  if (type === 'calendar') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 3v3M17 3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M8 13h2M12 13h2M16 13h1M8 16h2M12 16h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === 'shield') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s7-3.5 7-10V5.5L12 3 5 5.5V11c0 6.5 7 10 7 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'headset') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-2v-6h4M4 13h4v6H6a2 2 0 0 1-2-2v-4ZM15 21h-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'badge') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m12 3 2.1 2.2 3-.5.6 3 2.7 1.5-1.4 2.8 1.4 2.8-2.7 1.5-.6 3-3-.5L12 21l-2.1-2.2-3 .5-.6-3-2.7-1.5L5 12 3.6 9.2l2.7-1.5.6-3 3 .5L12 3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'plane') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.5c.7 0 1.25.55 1.25 1.25v5.1l6.5 3.85c.31.18.5.51.5.87v.68c0 .36-.34.62-.69.52l-6.31-1.8v3.58l2.04 1.53c.22.17.34.42.34.69v.36c0 .31-.3.54-.6.45L12 19.75l-3.03.83c-.3.09-.6-.14-.6-.45v-.36c0-.27.12-.52.34-.69l2.04-1.53v-3.58l-6.31 1.8c-.35.1-.69-.16-.69-.52v-.68c0-.36.19-.69.5-.87l6.5-3.85v-5.1c0-.7.55-1.25 1.25-1.25Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-5.1 7-11.5a7 7 0 1 0-14 0C5 15.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SearchField({ field, value, onChange, disabled = false }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {field.label}
      </span>
      <input
        type={field.type || 'text'}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={field.placeholder || field.title}
        className="flex h-16 w-full items-center gap-3 rounded-lg bg-slate-100 px-4 text-left outline-none disabled:bg-slate-200 disabled:cursor-not-allowed"
      />
    </label>
  );
}

function Home() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate default dates
  const today = new Date();
  const returnDate = new Date(today);
  returnDate.setDate(returnDate.getDate() + 7);

  const [searchData, setSearchData] = useState({
    origin_airport_code: 'BKK',
    destination_airport_code: 'SIN',
    departure_date: today.toISOString().split('T')[0],
    return_date: returnDate.toISOString().split('T')[0],
    trip_type: 'ROUND_TRIP',
    adult_passenger_count: 1,
    child_passenger_count: 0,
    cabin_class: 'economy',
    currency_code: 'USD',
  });

  const handleSearchFieldChange = (field, value) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);

    // Check authentication
    if (!isAuthenticated || !token) {
      setError('Please sign in to search flights');
      navigate('/signin');
      return;
    }

    setLoading(true);

    try {
      // Build search payload
      const searchPayload = {
        trip_type: searchData.trip_type,
        adult_passenger_count: searchData.adult_passenger_count,
        child_passenger_count: searchData.child_passenger_count,
        infant_passenger_count: 0,
        cabin_class: searchData.cabin_class,
        currency_code: searchData.currency_code,
        segments: [
          {
            origin_airport_code: searchData.origin_airport_code,
            destination_airport_code: searchData.destination_airport_code,
            departure_date: searchData.departure_date,
          },
        ],
      };

      console.log('Searching flights:', searchPayload);
      const response = await searchFlights(searchPayload);
      console.log('Search response:', response);

      // Navigate to flight results page with data
      navigate('/flight-results', {
        state: {
          searchResults: response.results || [],
          flightSearchId: response.flight_search_id,
          searchParams: {
            origin: searchData.origin_airport_code,
            destination: searchData.destination_airport_code,
            departure: searchData.departure_date,
            passengers: searchData.adult_passenger_count + searchData.child_passenger_count,
            tripType: searchData.trip_type,
            currency: searchData.currency_code,
          },
        },
      });
    } catch (err) {
      console.error('Search error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to search flights. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-900">
      <section
        className="relative min-h-[760px] overflow-hidden bg-sky-100 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(232, 244, 255, 0.98) 0%, rgba(232, 244, 255, 0.82) 29%, rgba(232, 244, 255, 0.2) 61%, rgba(232, 244, 255, 0.08) 100%), url(${heroImageUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/20 via-transparent to-white/70" />

        <div className="relative mx-auto flex min-h-[760px] max-w-7xl flex-col justify-between px-5 pt-24 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black leading-[0.98] tracking-normal text-blue-950 sm:text-6xl lg:text-7xl">
              Fly Smarter,
              <span className="block">Travel Better</span>
            </h1>
            <p className="mt-7 max-w-lg text-base font-medium leading-7 text-blue-900/80 sm:text-lg">
              Search flights, compare fares, and book your next adventure with ease.
            </p>
          </div>

          <div className="pb-20">
            <div className="rounded-2xl border border-white/70 bg-white/95 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur md:p-6">
              {/* Trip Type Tabs */}
              <div className="mb-5 flex flex-wrap items-center gap-6 text-sm font-bold">
                <button
                  onClick={() => handleSearchFieldChange('trip_type', 'ROUND_TRIP')}
                  className={`flex items-center gap-2 pb-2 transition ${
                    searchData.trip_type === 'ROUND_TRIP'
                      ? 'border-b-2 border-blue-600 text-blue-700'
                      : 'text-slate-500 hover:text-blue-700'
                  }`}
                >
                  <FieldIcon type="plane" className="h-4 w-4" />
                  Round Trip
                </button>
                <button
                  onClick={() => handleSearchFieldChange('trip_type', 'ONE_WAY')}
                  className={`pb-2 transition ${
                    searchData.trip_type === 'ONE_WAY'
                      ? 'border-b-2 border-blue-600 text-blue-700'
                      : 'text-slate-500 hover:text-blue-700'
                  }`}
                >
                  One-way
                </button>
                <button
                  onClick={() => handleSearchFieldChange('trip_type', 'MULTI_CITY')}
                  className={`pb-2 transition ${
                    searchData.trip_type === 'MULTI_CITY'
                      ? 'border-b-2 border-blue-600 text-blue-700'
                      : 'text-slate-500 hover:text-blue-700'
                  }`}
                >
                  Multi-city
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Search Form */}
              <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1.2fr_auto_1.2fr_1.2fr_1.2fr_1.2fr_auto]">
                {/* Origin */}
                <SearchField
                  field={{ label: 'From', placeholder: 'e.g., BKK' }}
                  value={searchData.origin_airport_code}
                  onChange={(e) => handleSearchFieldChange('origin_airport_code', e.target.value)}
                  disabled={loading}
                />

                {/* Swap Button */}
                <button
                  type="button"
                  onClick={() => {
                    const temp = searchData.origin_airport_code;
                    setSearchData((prev) => ({
                      ...prev,
                      origin_airport_code: prev.destination_airport_code,
                      destination_airport_code: temp,
                    }));
                  }}
                  disabled={loading}
                  className="hidden h-12 w-12 self-end rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 lg:flex lg:items-center lg:justify-center"
                  aria-label="Swap origin and destination"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 7h11m0 0-3-3m3 3-3 3M16 17H5m0 0 3 3m-3-3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Destination */}
                <SearchField
                  field={{ label: 'To', placeholder: 'e.g., SIN' }}
                  value={searchData.destination_airport_code}
                  onChange={(e) => handleSearchFieldChange('destination_airport_code', e.target.value)}
                  disabled={loading}
                />

                {/* Departure Date */}
                <SearchField
                  field={{ label: 'Departure', type: 'date' }}
                  value={searchData.departure_date}
                  onChange={(e) => handleSearchFieldChange('departure_date', e.target.value)}
                  disabled={loading}
                />

                {/* Return Date (show only if round trip) */}
                {searchData.trip_type === 'ROUND_TRIP' && (
                  <SearchField
                    field={{ label: 'Return', type: 'date' }}
                    value={searchData.return_date}
                    onChange={(e) => handleSearchFieldChange('return_date', e.target.value)}
                    disabled={loading}
                  />
                )}

                {/* Passengers & Class */}
                <SearchField
                  field={{ label: 'Passengers', placeholder: '1 Adult' }}
                  value={`${searchData.adult_passenger_count} Adult`}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 1;
                    handleSearchFieldChange('adult_passenger_count', Math.max(1, num));
                  }}
                  disabled={loading}
                />

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-16 items-center justify-center rounded-lg bg-blue-600 px-7 text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed lg:self-end font-bold"
                  aria-label="Search flights"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m20 20-4.5-4.5M18 10.75a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="relative border-t border-white/35 bg-sky-100/70 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <FieldIcon type={benefit.icon} className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-blue-950">{benefit.title}</h3>
                  <p className="mt-1 text-xs font-medium text-slate-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Destinations */}
      <section className="bg-black px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-400">Popular Routes</p>
            <h2 className="mt-3 text-xl font-bold text-blue-400">Trending Destinations</h2>
          </div>
          <button
            onClick={() => navigate('/flight-search')}
            className="flex items-center gap-2 text-sm font-bold text-blue-400 transition hover:text-cyan-300"
          >
            View More Flights
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    </main>
  );
}

export default Home;
