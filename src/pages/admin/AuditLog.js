import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'

const AuditLog = () => {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await API.get('/admin/audit')
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(filter.toLowerCase()) ||
    log.users?.name?.toLowerCase().includes(filter.toLowerCase())
  )

  const getActionColor = (action) => {
    if (action?.includes('approved')) return '#059669'
    if (action?.includes('returned')) return '#f59e0b'
    if (action?.includes('unlocked')) return '#dc2626'
    if (action?.includes('edited')) return '#0891B2'
    return '#6b7280'
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
        <h2 style={{ color: 'white', margin: 0 }}>📋 Audit Log</h2>
      </div>

      {/* FILTER */}
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder='Filter by action or user...'
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          color: 'white',
          fontSize: '1rem',
          marginBottom: '20px',
          boxSizing: 'border-box'
        }}
      />

      {/* LOGS */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #333',
        overflow: 'hidden'
      }}>
        {/* HEADER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 2fr 2fr',
          padding: '12px 20px',
          backgroundColor: '#222',
          color: '#999',
          fontSize: '0.85rem'
        }}>
          <span>Time</span>
          <span>Who</span>
          <span>Action</span>
          <span>Details</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999'
          }}>
            No audit logs found
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr 2fr',
                padding: '15px 20px',
                borderBottom: '1px solid #222',
                alignItems: 'center'
              }}
            >
              <span style={{ color: '#999', fontSize: '0.8rem' }}>
                {new Date(log.created_at).toLocaleString()}
              </span>
              <span style={{ color: 'white' }}>
                {log.users?.name || 'System'}
              </span>
              <span style={{
                color: getActionColor(log.action),
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}>
                {log.action?.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span style={{ color: '#999', fontSize: '0.8rem' }}>
                {log.new_value ? JSON.stringify(log.new_value).substring(0, 50) : '-'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AuditLog