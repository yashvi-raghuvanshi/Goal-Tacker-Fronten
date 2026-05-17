import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    goalsSubmitted: 0,
    goalsApproved: 0,
    pendingApproval: 0
  })
  const [completion, setCompletion] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [completionRes, cyclesRes] = await Promise.all([
        API.get('/admin/completion'),
        API.get('/admin/cycles')
      ])

      setCompletion(completionRes.data)
      setCycles(cyclesRes.data)

      // Calculate stats
      const total = completionRes.data.length
      const submitted = completionRes.data.filter(e => e.goals_submitted > 0).length
      const approved = completionRes.data.filter(e => e.goals_approved > 0).length
      const pending = completionRes.data.filter(e =>
        e.goals_submitted > e.goals_approved
      ).length

      setStats({
        totalEmployees: total,
        goalsSubmitted: submitted,
        goalsApproved: approved,
        pendingApproval: pending
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/export', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'achievement-report.csv'
      a.click()
    } catch (err) {
      console.error(err)
    }
  }

  const activeWindow = cycles.find(c => c.is_active)

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
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* NAVBAR */}
      <div style={{
        backgroundColor: '#059669',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.3rem' }}>
           Goal Tracker - Admin
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white' }}> {user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/') }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '30px' }}>
        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'Total Employees', value: stats.totalEmployees, color: '#4F46E5' },
            { label: 'Goals Submitted', value: stats.goalsSubmitted, color: '#0891B2' },
            { label: 'Goals Approved', value: stats.goalsApproved, color: '#059669' },
            { label: 'Pending Approval', value: stats.pendingApproval, color: '#f59e0b' }
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#1a1a1a',
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${stat.color}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: stat.color
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          {[
            { label: ' Manage Cycles', path: '/admin/cycles', color: '#4F46E5' },
            { label: ' Manage Users', path: '/admin/users', color: '#0891B2' },
            { label: ' Audit Logs', path: '/admin/audit', color: '#f59e0b' },
            { label: 'Analytics', path: '/admin/analytics', color: '#4F46E5' },
            { label: ' Export CSV', action: handleExport, color: '#059669' }
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => action.path ? navigate(action.path) : action.action()}
              style={{
                padding: '15px',
                backgroundColor: '#1a1a1a',
                border: `1px solid ${action.color}`,
                borderRadius: '10px',
                color: action.color,
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* ACTIVE WINDOW */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '15px 20px',
          borderRadius: '10px',
          border: `1px solid ${activeWindow ? '#059669' : '#333'}`,
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: 'white' }}>
            Active Window:
            <strong style={{
              color: activeWindow ? '#059669' : '#999',
              marginLeft: '10px'
            }}>
              {activeWindow ? activeWindow.period : 'None'}
            </strong>
          </span>
          <button
            onClick={() => navigate('/admin/cycles')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Manage Windows
          </button>
        </div>

        {/* COMPLETION TABLE */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ color: 'white', margin: 0 }}>
              Completion Dashboard
            </h2>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
               Export CSV
            </button>
          </div>

          {/* TABLE HEADER */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            padding: '12px 20px',
            backgroundColor: '#222',
            color: '#999',
            fontSize: '0.85rem'
          }}>
            <span>Employee</span>
            <span>Department</span>
            <span>Submitted</span>
            <span>Approved</span>
            <span>Check-ins</span>
          </div>

          {completion.map((emp, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                padding: '15px 20px',
                borderBottom: '1px solid #222',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'white', fontWeight: 'bold' }}>
                {emp.employee}
              </span>
              <span style={{ color: '#999' }}>
                {emp.department}
              </span>
              <span style={{
                color: emp.goals_submitted > 0 ? '#059669' : '#dc2626'
              }}>
                {emp.goals_submitted > 0 ? '✅' : '❌'}
              </span>
              <span style={{
                color: emp.goals_approved > 0 ? '#059669' : '#dc2626'
              }}>
                {emp.goals_approved > 0 ? '✅' : '❌'}
              </span>
              <span style={{
                color: emp.checkins_done > 0 ? '#059669' : '#dc2626'
              }}>
                {emp.checkins_done > 0 ? `✅ ${emp.checkins_done}` : '❌'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard