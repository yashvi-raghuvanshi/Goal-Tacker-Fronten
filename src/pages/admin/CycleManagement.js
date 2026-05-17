import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

const CycleManagement = () => {
  const navigate = useNavigate()
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCycles()
  }, [])

  const fetchCycles = async () => {
    try {
      const res = await API.get('/admin/cycles')
      setCycles(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleWindow = async (cycle) => {
    try {
      // Close all windows first
      await Promise.all(cycles.map(c =>
        API.put(`/admin/cycles/${c.id}`, { ...c, is_active: false })
      ))

      // Open selected one if it was closed
      if (!cycle.is_active) {
        await API.put(`/admin/cycles/${cycle.id}`, { ...cycle, is_active: true })
      }

      setSuccess(`Window ${cycle.is_active ? 'closed' : 'opened'} successfully!`)
      setTimeout(() => setSuccess(''), 3000)
      fetchCycles()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (cycle) => {
    setEditingId(cycle.id)
    setEditValues({
      window_open: cycle.window_open,
      window_close: cycle.window_close,
      is_active: cycle.is_active
    })
  }

  const handleSave = async (cycleId) => {
    try {
      await API.put(`/admin/cycles/${cycleId}`, editValues)
      setEditingId(null)
      setSuccess('Cycle updated!')
      setTimeout(() => setSuccess(''), 3000)
      fetchCycles()
    } catch (err) {
      console.error(err)
    }
  }

  const inputStyle = {
    padding: '8px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.9rem'
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
        gap: '15px',
        marginBottom: '30px'
      }}>
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
        <h2 style={{ color: 'white', margin: 0 }}>
          ⚙️ Cycle Management
        </h2>
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

      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #333',
        overflow: 'hidden'
      }}>
        {/* HEADER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          padding: '12px 20px',
          backgroundColor: '#222',
          color: '#999',
          fontSize: '0.85rem'
        }}>
          <span>Period</span>
          <span>Opens</span>
          <span>Closes</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {cycles.map(cycle => (
          <div
            key={cycle.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              padding: '15px 20px',
              borderBottom: '1px solid #222',
              alignItems: 'center'
            }}
          >
            <span style={{
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {cycle.period}
            </span>

            {editingId === cycle.id ? (
              <input
                type='date'
                value={editValues.window_open}
                onChange={e => setEditValues({ ...editValues, window_open: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <span style={{ color: '#999' }}>{cycle.window_open}</span>
            )}

            {editingId === cycle.id ? (
              <input
                type='date'
                value={editValues.window_close}
                onChange={e => setEditValues({ ...editValues, window_close: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <span style={{ color: '#999' }}>{cycle.window_close}</span>
            )}

            <span style={{
              color: cycle.is_active ? '#059669' : '#6b7280',
              fontWeight: 'bold'
            }}>
              {cycle.is_active ? 'OPEN' : ' CLOSED'}
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              {editingId === cycle.id ? (
                <>
                  <button
                    onClick={() => handleSave(cycle.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(cycle)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleWindow(cycle)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: cycle.is_active ? '#dc2626' : '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {cycle.is_active ? 'Close' : 'Open'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CycleManagement