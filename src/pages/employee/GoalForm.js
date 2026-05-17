import { useState} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API from '../../api/axios'

const GoalForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const existingGoal = location.state?.goal

  const [form, setForm] = useState({
    title: existingGoal?.title || '',
    description: existingGoal?.description || '',
    thrust_area_name: existingGoal?.thrust_area_name || '',
    uom_type: existingGoal?.uom_type || '',
    target: existingGoal?.target || '',
    target_date: existingGoal?.target_date || '',
    weightage: existingGoal?.weightage || ''
  })

  const [thrustAreas, setThrustAreas] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   fetchThrustAreas()
  // }, [])


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    // Find thrust area id from name, or create new one
    let thrustAreaId = null
    const existing = thrustAreas.find(
      a => a.name.toLowerCase() === form.thrust_area_name.toLowerCase()
    )

    if (existing) {
      thrustAreaId = existing.id
    } else {
      // Create new thrust area
      const res = await API.post('/goals/thrust-areas', { 
        name: form.thrust_area_name 
      })
      thrustAreaId = res.data.id
    }

    const payload = {
      ...form,
      thrust_area_id: thrustAreaId
    }

    if (existingGoal) {
      await API.put(`/goals/${existingGoal.id}`, payload)
    } else {
      await API.post('/goals', payload)
    }
    navigate('/employee/dashboard')
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong')
  } finally {
    setLoading(false)
  }
}

  const uomOptions = [
    { value: 'numeric_higher', label: 'Numeric — Higher is better (e.g. Sales)' },
    { value: 'numeric_lower', label: 'Numeric — Lower is better (e.g. Costs)' },
    { value: 'percentage_higher', label: '% — Higher is better (e.g. Satisfaction)' },
    { value: 'percentage_lower', label: '% — Lower is better (e.g. Error rate)' },
    { value: 'timeline', label: 'Timeline — Date based completion' },
    { value: 'zero_based', label: 'Zero Based — Zero = Success (e.g. Accidents)' }
  ]

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      fontFamily: 'Arial, sans-serif',
      padding: '30px'
    }}>
      {/* NAVBAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        gap: '15px'
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
          {existingGoal ? '✏️ Edit Goal' : '➕ Create New Goal'}
        </h2>
      </div>

      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
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
          {/* TITLE */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Goal Title *</label>
            <input
              name='title'
              value={form.title}
              onChange={handleChange}
              required
              placeholder='e.g. Increase Sales Revenue'
              style={inputStyle}
            />
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              name='description'
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder='Describe your goal in detail...'
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* THRUST AREA */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Thrust Area *</label>
            <input
            name='thrust_area_name'
            value={form.thrust_area_name}
            onChange={handleChange}
            placeholder='e.g. Revenue Growth, Safety...'
            required
            style={inputStyle}
            // list='thrust-suggestions'
            autoComplete='off'
            />
            {/* <datalist id='thrust-suggestions'>
              {thrustAreas.map(area => (
                <option key={area.id} value={area.name} />
            ))}
            </datalist> */}
          </div>

          {/* UOM TYPE */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Unit of Measurement *</label>
            <select
              name='uom_type'
              value={form.uom_type}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value=''>Select measurement type...</option>
              {uomOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* TARGET — changes based on UoM */}
          {form.uom_type === 'timeline' ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Target Date *</label>
              <input
                type='date'
                name='target_date'
                value={form.target_date}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          ) : form.uom_type === 'zero_based' ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Target</label>
              <input
                value='0 — Zero incidents = 100% success'
                disabled
                style={{ ...inputStyle, color: '#666' }}
              />
            </div>
          ) : form.uom_type ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>
                Target {form.uom_type?.includes('percentage') ? '(%)' : '(number)'} *
              </label>
              <input
                type='number'
                name='target'
                value={form.target}
                onChange={handleChange}
                required
                placeholder='Enter target value'
                style={inputStyle}
              />
            </div>
          ) : null}

          {/* WEIGHTAGE */}
          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>
              Weightage (%) * — minimum 10%
            </label>
            <input
              type='number'
              name='weightage'
              value={form.weightage}
              onChange={handleChange}
              required
              min='10'
              max='100'
              placeholder='e.g. 30'
              style={inputStyle}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Saving...' : existingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default GoalForm