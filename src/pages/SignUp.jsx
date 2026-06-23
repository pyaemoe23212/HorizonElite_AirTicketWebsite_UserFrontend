import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import heroImage from '../assets/hero.png'
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  AsYouType,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js'

function SignUp() {
  const navigate = useNavigate()
  const { register, loading, error: authError } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState('TH')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [parsedPhone, setParsedPhone] = useState(null)
  const [isCountryListOpen, setIsCountryListOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAgree: false,
    promoAgree: false,
  })

  const countryOptions = useMemo(() => {
    const countryNames =
      typeof Intl !== 'undefined' && Intl.DisplayNames
        ? new Intl.DisplayNames(['en'], { type: 'region' })
        : null

    return getCountries()
      .map((iso) => {
        const dialCode = `+${getCountryCallingCode(iso)}`
        const name = countryNames?.of(iso) ?? iso

        return {
          flagUrl: `https://flagcdn.com/w40/${iso.toLowerCase()}.png`,
          label: `${name} (${dialCode})`,
          name,
          dialCode,
          iso,
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [])

  const selectedCountry =
    countryOptions.find(country => country.iso === phoneCountry) ?? null
  const validatePhone = (number, iso) => {
    if (!number) {
      setPhoneError('Phone number is required.')
      setParsedPhone(null)
      return false
    }
    const dialCode = countryOptions.find(c => c.iso === iso)?.dialCode ?? ''
    if (!isValidPhoneNumber(dialCode + number, iso)) {
      setPhoneError('Please enter a valid phone number for the selected country.')
      setParsedPhone(null)
      return false
    }
    try {
      const parsed = parsePhoneNumber(number, iso)
      setParsedPhone(parsed)
    } catch {
      setParsedPhone(null)
    }
    setPhoneError('')
    return true
  }

  const handlePhoneChange = (e) => {
    const formatted = new AsYouType(phoneCountry).input(e.target.value)
    setPhoneNumber(formatted)
    setPhoneError('')
    setParsedPhone(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    // Validate all fields
    if (!formData.title) {
      setFormError('Please select a title')
      return
    }
    if (!formData.firstName.trim()) {
      setFormError('First name is required')
      return
    }
    if (!formData.lastName.trim()) {
      setFormError('Last name is required')
      return
    }
    if (!formData.email.trim()) {
      setFormError('Email is required')
      return
    }
    if (!formData.password) {
      setFormError('Password is required')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    if (!formData.termsAgree) {
      setFormError('You must agree to the Terms of Use and Privacy Policy')
      return
    }
    if (!phoneNumber.trim()) {
      setFormError('Phone number is required')
      return
    }
    if (!validatePhone(phoneNumber, phoneCountry)) {
      return
    }

    try {
      await register({
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: parsedPhone?.formatInternational() || phoneNumber,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      setSuccessMessage('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/signin')
      }, 2000)
    } catch (err) {
      // Error is already set in context
      console.error('Registration error:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setFormError('')
  }

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* Left Brand Section */}
      <div className="hidden lg:flex bg-[#073b70] text-white px-16 py-14 flex-col justify-between">
        <div>
          <div className="border-t border-white/20 pt-6">
            <h1 className="text-xl font-bold text-amber-300">Horizon Elite</h1>
            <p className="text-[10px] tracking-[4px] text-blue-100 mt-1">
              GLOBAL EXCELLENCE IN AVIATION
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <h2 className="text-5xl font-bold mb-8">Join the Elite</h2>
          <p className="text-blue-100 leading-relaxed">
            Elevate your journey with personalized services, priority access,
            and rewards that transcend ordinary travel. Experience the horizon
            like never before.
          </p>
        </div>

        <div>
          <img
            src={heroImage}
            alt="Luxury airline cabin"
            className="w-full max-w-lg h-52 object-cover rounded-lg shadow-xl"
          />
          <p className="text-[10px] tracking-[4px] text-white mt-8">
            DEFINING THE FUTURE OF LUXURY AVIATION.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-[#073b70]">
            Create your account
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Please provide your details to join our membership program.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Error Message */}
            {(formError || authError) && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-semibold">Error:</p>
                <p>{formError || authError}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p className="font-semibold">Success!</p>
                <p>{successMessage}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                TITLE <span className="text-red-500">*</span>
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
              >
                <option value="">Select Title</option>
                <option value="Mr">Mr.</option>
                <option value="Ms">Ms.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Dr">Dr.</option>
              </select>
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#073b70]">
                  FIRST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#073b70]">
                  MIDDLE NAME <span className="text-gray-400">(OPTIONAL)</span>
                </label>
                <input
                  type="text"
                  name="middleName"
                  placeholder="Marie"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                LAST NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="jane.doe@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                PHONE NUMBER <span className="text-red-500">*</span>
              </label>

              <div className="mt-2 flex gap-3">
                <div className="relative w-48">
                  <button
                    type="button"
                    onClick={() => setIsCountryListOpen(open => !open)}
                    className="flex h-full min-h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-3 text-left text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#073b70]"
                    aria-haspopup="listbox"
                    aria-expanded={isCountryListOpen}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {selectedCountry && (
                        <img
                          src={selectedCountry.flagUrl}
                          alt={selectedCountry.iso}
                          className="h-3 w-5 shrink-0 object-cover"
                        />
                      )}
                      <span className="truncate">
                        {selectedCountry
                          ? `${selectedCountry.name} (${selectedCountry.dialCode})`
                          : 'Select country'}
                      </span>
                    </span>
                    <span className="ml-2 text-gray-500">v</span>
                  </button>

                  {isCountryListOpen && (
                    <div
                      className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-72 overflow-y-auto rounded-md border border-gray-300 bg-white p-2 shadow-2xl"
                      role="listbox"
                    >
                      {countryOptions.map(country => (
                        <button
                          key={country.iso}
                          type="button"
                          role="option"
                          aria-selected={country.iso === phoneCountry}
                          onClick={() => {
                            setPhoneCountry(country.iso)
                            setPhoneError('')
                            setParsedPhone(null)
                            setPhoneNumber('')
                            setIsCountryListOpen(false)
                          }}
                          className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-semibold text-gray-800 hover:bg-gray-100 ${
                            country.iso === phoneCountry ? 'bg-gray-100' : ''
                          }`}
                        >
                          <img
                            src={country.flagUrl}
                            alt={country.iso}
                            className="h-3 w-5 shrink-0 object-cover"
                          />
                          <span className="truncate">
                            {country.name} <span className="text-gray-400">({country.dialCode})</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={() => validatePhone(phoneNumber, phoneCountry)}
                  placeholder="(555) 000-0000"
                  className={`flex-1 border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70] ${
                    phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              {phoneError && (
                <p className="mt-1 text-xs text-red-500">{phoneError}</p>
              )}
              {parsedPhone && !phoneError && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ {parsedPhone.formatInternational()}
                </p>
              )}
            </div>
            {/* Password */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                PASSWORD <span className="text-red-500">*</span>
              </label>

              <div className="mt-2 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-500 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password Strength Box */}
              <div className="mt-3 border border-gray-300 rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-full bg-gray-200 rounded"></div>
                  <div className="h-1 w-full bg-gray-200 rounded"></div>
                  <div className="h-1 w-full bg-gray-200 rounded"></div>
                  <div className="h-1 w-full bg-gray-200 rounded"></div>
                  <span className="text-[10px] font-bold text-gray-500 ml-2">
                    WEAK
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-gray-500">
                  <li>○ 12 to 16 characters</li>
                  <li>○ Contains only letters, numbers, and symbols</li>
                  <li>○ At least three: uppercase, lowercase, numbers, symbols</li>
                </ul>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                CONFIRM PASSWORD <span className="text-red-500">*</span>
              </label>

              <div className="mt-2 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#073b70]"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 text-gray-500 text-sm"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Agreement */}
            <div className="space-y-3 text-xs text-gray-600">
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="termsAgree"
                  checked={formData.termsAgree}
                  onChange={handleInputChange}
                  className="mt-0.5"
                />
                <span>
                  I agree to the{' '}
                  <a href="#" className="text-[#073b70] font-semibold underline">
                    Terms of Use
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-[#073b70] font-semibold underline">
                    Privacy Policy
                  </a>.
                </span>
              </label>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="promoAgree"
                  checked={formData.promoAgree}
                  onChange={handleInputChange}
                  className="mt-0.5"
                />
                <span>
                  Receive promotional campaigns from Horizon Elite or partners.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#073b70] text-white py-3 rounded-md font-semibold hover:bg-[#052f59] transition disabled:bg-gray-400"
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-xs text-gray-400 font-semibold">
              OR CONNECT WITH
            </span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <button className="w-full border border-gray-300 rounded-md py-3 text-sm hover:bg-gray-50">
              🟢 Continue with Line
            </button>

            <button className="w-full border border-gray-300 rounded-md py-3 text-sm hover:bg-gray-50">
              G Continue with Google
            </button>

            <button className="w-full border border-gray-300 rounded-md py-3 text-sm hover:bg-gray-50">
              🔵 Continue with Facebook
            </button>

            <button className="w-full border border-gray-300 rounded-md py-3 text-sm hover:bg-gray-50">
               Continue with Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#073b70] font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp;



