import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

function SignIn() {
  const navigate = useNavigate()
  const { login, loading, error: authError } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.email || !formData.password) {
      setFormError('Please enter email address and password.')
      return
    }

    try {
      await login(formData.email, formData.password)
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberEmail', formData.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }

      // Redirect to flight search
      navigate('/')
    } catch (err) {
      // Error is already set in context
      console.error('Login error:', err)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0b4778] text-white px-16 py-16 relative overflow-hidden">
        {/* Background style */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#063761] via-[#0b4778] to-[#144f7d]"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-white hover:text-blue-100"
          >
            ← BACK TO WEBSITE
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold leading-tight">
            Welcome back to <br /> the skies.
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-blue-100">
            Experience the pinnacle of aviation with Horizon Elite. Access your
            exclusive benefits and manage your journey with effortless
            precision.
          </p>
        </div>

        <div className="relative z-10">
          <div className="border-t border-white/20 pt-10">
            <h2 className="text-2xl font-bold text-amber-300">
              Horizon Elite
            </h2>
            <p className="mt-2 text-xs tracking-[4px] text-blue-100">
              GLOBAL EXCELLENCE IN AVIATION
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-[#073b70]">
            Sign In
          </h1>

          <p className="mt-3 text-gray-500">
            Continue your journey with your Horizon Elite account.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Error Message */}
            {(formError || authError) && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-semibold">Error:</p>
                <p>{formError || authError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                EMAIL ADDRESS<span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                name="email"
                placeholder="e.g. jane.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#073b70]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-[#073b70]">
                PASSWORD<span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full border border-gray-300 rounded-md px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#073b70]"
              />
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4"
              />
              Remember me for future travels
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#073b70] text-white py-4 rounded-md font-bold hover:bg-[#052f59] transition disabled:bg-gray-400"
            >
              {loading ? 'Signing In...' : 'Sign In to My Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="h-px bg-gray-200 flex-1"></div>
            <p className="text-xs text-gray-500 font-bold text-center leading-tight">
              OR <br /> CONNECT <br /> WITH
            </p>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            <button className="w-full border border-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 transition">
              🟢 Continue with Line
            </button>

            <button className="w-full border border-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 transition">
              <span className="font-bold text-red-500">G</span> Continue with Google
            </button>

            <button className="w-full border border-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 transition">
              🔵 Continue with Facebook
            </button>

            <button className="w-full border border-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 transition">
               Continue with Apple
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-500 mt-10">
            New to Horizon Elite?{' '}
            <Link to="/signup" className="font-bold text-[#073b70] underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn