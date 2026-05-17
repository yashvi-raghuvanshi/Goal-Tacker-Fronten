import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'

const Login = () => {
  const { role } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const roleConfig = {
    employee: { title: 'Employee Login', icon: '👤', color: '#4F46E5', email: 'employee@company.com', password: 'apple' },
    manager: { title: 'Manager Login', icon: '👥', color: '#0891B2', email: 'manager@company.com', password: 'banana' },
    admin: { title: 'Admin Login', icon: '⚙️', color: '#059669', email: 'admin@company.com', password: 'mango' }
  }

  const config = roleConfig[role]

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await API.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)

      if (res.data.user.role === 'employee') navigate('/employee/dashboard')
      else if (res.data.user.role === 'manager') navigate('/manager/dashboard')
      else if (res.data.user.role === 'admin') navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = () => {
    setEmail(config.email)
    setPassword(config.password)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '50px',
        borderRadius: '12px',
        width: '400px',
        border: `2px solid ${config.color}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '3rem' }}>{config.icon}</div>
          <h2 style={{ color: 'white', margin: '10px 0' }}>{config.title}</h2>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ff000022',
            border: '1px solid red',
            color: 'red',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#999', display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder='Enter your email'
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#999', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder='Enter your password'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: config.color,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type='button'
            onClick={fillCredentials}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#999',
              border: '1px solid #444',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Fill Demo Credentials
          </button>
        </form>

        <p
          onClick={() => navigate('/')}
          style={{
            color: '#999',
            textAlign: 'center',
            marginTop: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          ← Back to role selection
        </p>
      </div>
    </div>
  )
}

export default Login