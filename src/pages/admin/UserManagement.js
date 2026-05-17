import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

const UserManagement = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    manager_id: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post('/admin/users', form)
      setSuccess('User created successfully!')
      setShowForm(false)
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        manager_id: ''
      })
      setTimeout(() => setSuccess(''), 3000)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user')
    }
  }

  const managers = users.filter(u => u.role === 'manager')

  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginTop: '6px'
  }

  const labelStyle = {
    color: '#999',
    fontSize: '0.9rem',
    display: 'block'
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0f0f0f',
      color: 'white'
    }}>
      Loading...
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      fontFamily: 'Arial, sans-serif',
      padding: '30px'
    }}>
      {/* BACK */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #444',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h2 style={{ color: 'white', margin: 0 }}>👤 User Management</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add User'}
        </button>
      </div>

      {success && (
        <div style={{
          backgroundColor: '#00ff0022',
          border: '1px solid #059669',
          color: '#059669',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          ✅ {success}
        </div>
      )}

      {/* ADD USER FORM */}
      {showForm && (
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>
            Add New User
          </h3>

          {error && (
            <div style={{
              backgroundColor: '#ff000022',
              border: '1px solid red',
              color: 'red',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder='John Doe'
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type='email'
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder='john@company.com'
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input
                  type='password'
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder='Set password'
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Department *</label>
                <input
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  required
                  placeholder='Sales, HR, Operations...'
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value='employee'>Employee</option>
                  <option value='manager'>Manager</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
              {form.role === 'employee' && (
                <div>
                  <label style={labelStyle}>Manager *</label>
                  <select
                    value={form.manager_id}
                    onChange={e => setForm({ ...form, manager_id: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value=''>Select manager...</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type='submit'
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Create User
            </button>
          </form>
        </div>
      )}

      {/* USERS TABLE */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #333',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
          padding: '12px 20px',
          backgroundColor: '#222',
          color: '#999',
          fontSize: '0.85rem'
        }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Department</span>
          <span>Manager</span>
        </div>

        {users.map(user => (
          <div
            key={user.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
              padding: '15px 20px',
              borderBottom: '1px solid #222',
              alignItems: 'center'
            }}
          >
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              {user.name}
            </span>
            <span style={{ color: '#999', fontSize: '0.9rem' }}>
              {user.email}
            </span>
            <span style={{
              color:
                user.role === 'admin' ? '#059669' :
                user.role === 'manager' ? '#0891B2' : '#4F46E5',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              textTransform: 'uppercase'
            }}>
              {user.role}
            </span>
            <span style={{ color: '#999' }}>
              {user.department}
            </span>
            <span style={{ color: '#999', fontSize: '0.85rem' }}>
              {users.find(u => u.id === user.manager_id)?.name || '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserManagement