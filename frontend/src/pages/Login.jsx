import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../api/auth'
import useTitle from '../hooks/useTitle'
import { Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import taskComplete from '../assets/undraw_completed-tasks_1j9z.svg'
import multitasking from '../assets/undraw_multitasking_i2bv.svg'

const Login = () => {
  useTitle('Login')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!formData.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email'
    if (!formData.password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      const res = await loginUser(formData)
      login(res.data.data.user, res.data.data.token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password'
      toast.error(message)
      setErrors({ password: message })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)' }}>

      {/* Floating background blobs */}
      <div className="fixed top-[-10%] left-[-5%] w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.2)' }} />
      <div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.15)' }} />

      {/* Main Card */}
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex"
        style={{ minHeight: 560, background: 'white' }}>

        {/* LEFT — Form */}
        <div className="w-full lg:w-[52%] flex flex-col justify-center px-12 py-12">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm13 0h-3v3h3v3h3v-3h3v-3h-3v-3h-3z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight" style={{ color: '#4f46e5' }}>
              TASKFLOW
            </span>
          </div>

          <h1 className="text-3xl font-black mb-2" style={{ color: '#111827' }}>
            Welcome Back!
          </h1>
          <p className="text-sm mb-8" style={{ color: '#9ca3af' }}>
            Please enter your login details below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <label
                className="absolute -top-2.5 left-3 text-xs font-semibold px-1"
                style={{ color: errors.email ? '#ef4444' : '#6b7280', background: 'white' }}>
                Email
              </label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Enter the email"
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  border: `1.5px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                  color: '#111827',
                  background: 'white',
                }}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <label
                className="absolute -top-2.5 left-3 text-xs font-semibold px-1"
                style={{ color: errors.password ? '#ef4444' : '#6b7280', background: 'white' }}>
                Password
              </label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Enter the Password"
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  border: `1.5px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                  color: '#111827',
                  background: 'white',
                }}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            {/* Forgot */}
            <div className="flex justify-end -mt-2">
              <span className="text-xs font-semibold cursor-pointer hover:underline"
                style={{ color: '#6366f1' }}>
                Forgot Password?
              </span>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" /> Signing in...</>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: '#9ca3af' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-black hover:underline" style={{ color: '#6366f1' }}>
              Sign Up
            </Link>
          </p>
        </div>

        {/* RIGHT — Illustration */}
        <div className="hidden lg:flex lg:flex-1 flex-col items-center justify-between py-10 px-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)' }}>

          {/* Background circles */}
          <div className="absolute top-[-15%] right-[-15%] w-64 h-64 rounded-full opacity-20"
            style={{ background: 'rgba(255,255,255,0.4)' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 rounded-full opacity-15"
            style={{ background: 'rgba(255,255,255,0.3)' }} />

          {/* SVG Illustrations */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 w-full">
            <img
              src={multitasking}
              alt="Multitasking"
              className="w-56 h-56 object-contain drop-shadow-xl"
            />
            <img
              src={taskComplete}
              alt="Task Complete"
              className="w-44 h-44 object-contain drop-shadow-xl"
            />
          </div>

          {/* Bottom text */}
          <div className="relative z-10 text-center mt-4">
            <p className="text-sm italic font-medium leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.9)' }}>
              Manage your tasks in an easy and<br />more efficient way with TaskFlow...
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-full transition-all"
                  style={{
                    width: i === 0 ? 28 : 8,
                    height: 8,
                    background: i === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                  }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 