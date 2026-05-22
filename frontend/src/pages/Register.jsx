import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { registerUser } from '../api/auth'
import useTitle from '../hooks/useTitle'
import { Mail, Lock, User, Loader, Layers, Sun, Moon } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  useTitle('Register')
  const navigate = useNavigate()
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email'
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 6) errs.password = 'Min 6 characters'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setLoading(true)
    try {
      const res = await registerUser(formData)
      login(res.data.data.user, res.data.data.token)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--app-bg)' }}>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-md transition-colors"
        style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', color: 'var(--app-muted)' }}
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--app-sidebar)', borderRight: '1px solid var(--app-border)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'var(--app-accent)' }} />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'var(--app-accent)' }} />
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--app-accent)' }}>
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--app-text)' }}>TaskFlow</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: 'var(--app-text)' }}>
            Start managing<br />your team today.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--app-muted)' }}>
            Join TaskFlow and bring clarity to your team's workflow with powerful project management tools.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { label: 'Role-based access', desc: 'Admin and Member roles' },
              { label: 'Task tracking', desc: 'TODO, In Progress, Done' },
              { label: 'Team management', desc: 'Add and remove members' },
              { label: 'Live dashboard', desc: 'Stats and overdue alerts' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg"
                style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--app-text)' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--app-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs relative z-10" style={{ color: 'var(--app-muted)' }}>
          Free to use. No credit card required.
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--app-accent)' }}>
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--app-text)' }}>TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--app-text)' }}>Create an account</h2>
            <p className="text-sm" style={{ color: 'var(--app-muted)' }}>Get started with TaskFlow for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Anubhav Sharma', icon: User },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com', icon: Mail },
              { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••', icon: Lock },
            ].map(({ label, name, type, placeholder, icon: Icon }) => (
              <div key={name}>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
                  style={{ color: 'var(--app-muted)' }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--app-muted)' }} />
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'var(--app-surface)',
                      border: `1px solid ${errors[name] ? '#ef4444' : 'var(--app-border)'}`,
                      color: 'var(--app-text)',
                    }}
                  />
                </div>
                {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--app-muted)' }}>I am joining as</label>
              <div className="grid grid-cols-2 gap-2">
                {['MEMBER', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className="py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: formData.role === r ? 'var(--app-accent)' : 'var(--app-surface)',
                      border: `1px solid ${formData.role === r ? 'var(--app-accent)' : 'var(--app-border)'}`,
                      color: formData.role === r ? '#ffffff' : 'var(--app-muted)',
                    }}
                  >
                    {r === 'ADMIN' ? '👑 Admin' : '👤 Member'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 mt-2"
              style={{ background: loading ? 'var(--app-muted)' : 'var(--app-accent)' }}
            >
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Creating...</> : 'Create account →'}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--app-border)' }}>
            <p className="text-center text-xs" style={{ color: 'var(--app-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--app-accent)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register