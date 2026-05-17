import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../../api/axios'

const CheckIn = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const goal = location.state?.goal

  const [form, setForm] = useState({
    quarter: '',
    actual: '',
    actual_date: '',
    status: 'on_track'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [previousCheckins, setPreviousCheckins] = useState([])

  useEffect(() => {
    if (goal) fetchPreviousCheckins()
  }, [])

  const fetchPreviousCheckins = async () => {
    try {
      const res = await API.get(`/checkins/goal/${goal.id}`)
      setPreviousCheckins(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await API.post('/checkins', {
        goal_id: goal.id,
        ...form,
        actual: parseFloat(form.actual)
      })
      setSuccess('Achievement logged successfully!')
      fetchPreviousCheckins()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

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

  if (!goal) return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p>No goal selected</p>
        <button
          onClick={() => navigate('/employee/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      fontFamily: 'Arial, sans-serif',
      padding: '30px'
    }}>
      {/* BACK BUTTON */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <button
          onClick={() => navigate('/employee/dashboard')}
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
        <h2 style={{ color: 'white', margin: 0 }}>
          📝 Log Achievement
        </h2>
      </div>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* GOAL INFO CARD */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
            🎯 {goal.title}
          </h3>
          <p style={{ color: '#999', margin: '0 0 15px 0', fontSize: '0.9rem' }}>
            {goal.description}
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: '#4F46E5' }}>
              Target: {goal.target || goal.target_date}
            </span>
            <span style={{ color: '#0891B2' }}>
              UoM: {goal.uom_type?.replace(/_/g, ' ')}
            </span>
            <span style={{ color: '#059669' }}>
              Weight: {goal.weightage}%
            </span>
          </div>
        </div>

        {/* CHECK-IN FORM */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>
            Log Actual Achievement
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

          <form onSubmit={handleSubmit}>
            {/* QUARTER */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Quarter *</label>
              <select
                value={form.quarter}
                onChange={e => setForm({ ...form, quarter: e.target.value })}
                required
                style={inputStyle}
              >
                <option value=''>Select quarter...</option>
                <option value='Q1'>Q1 — July</option>
                <option value='Q2'>Q2 — October</option>
                <option value='Q3'>Q3 — January</option>
                <option value='Q4'>Q4 — March/April</option>
              </select>
            </div>

            {/* ACTUAL ACHIEVEMENT */}
            {goal.uom_type === 'timeline' ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Completion Date *</label>
                <input
                  type='date'
                  value={form.actual_date}
                  onChange={e => setForm({ ...form, actual_date: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
            ) : goal.uom_type === 'zero_based' ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Incidents *</label>
                <input
                  type='number'
                  value={form.actual}
                  onChange={e => setForm({ ...form, actual: e.target.value })}
                  required
                  min='0'
                  placeholder='Enter number of incidents (0 = 100% score)'
                  style={inputStyle}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Actual Achievement *</label>
                <input
                  type='number'
                  value={form.actual}
                  onChange={e => setForm({ ...form, actual: e.target.value })}
                  required
                  placeholder={`Target was ${goal.target}`}
                  style={inputStyle}
                />
              </div>
            )}

            {/* STATUS */}
            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Status *</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
              >
                <option value='not_started'>Not Started</option>
                <option value='on_track'>On Track</option>
                <option value='completed'>Completed</option>
              </select>
            </div>

            <button
              type='submit'
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Saving...' : '✅ Save Achievement'}
            </button>
          </form>
        </div>

        {/* PREVIOUS CHECK-INS */}
        {previousCheckins.length > 0 && (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>
              Previous Check-ins
            </h3>
            {previousCheckins.map(checkin => (
              <div
                key={checkin.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ color: 'white' }}>{checkin.quarter}</span>
                <span style={{ color: '#0891B2' }}>
                  Actual: {checkin.actual}
                </span>
                <span style={{ color: '#059669' }}>
                  Score: {checkin.score?.toFixed(1)}%
                </span>
                <span style={{ color: '#999' }}>
                  {checkin.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckIn