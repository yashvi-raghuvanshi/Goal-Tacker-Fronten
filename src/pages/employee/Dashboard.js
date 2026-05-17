import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalWeightage, setTotalWeightage] = useState(0)
  const [windowStatus, setWindowStatus] = useState(null)

  useEffect(() => {
    fetchGoals()
    checkWindow()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await API.get('/goals')
      setGoals(res.data)
      const total = res.data.reduce((sum, g) => sum + g.weightage, 0)
      setTotalWeightage(total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkWindow = async () => {
    try {
      const res = await API.get('/admin/cycles')
      const active = res.data.find(w => w.is_active)
      setWindowStatus(active)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async () => {
    try {
      await API.post('/goals/submit')
      alert('Goals submitted successfully!')
      fetchGoals()
    } catch (err) {
      alert(err.response?.data?.error || 'Submit failed')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const emptySlots = 8 - goals.length

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666'
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
        backgroundColor: '#4F46E5',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.3rem' }}>
          Goal Tracker - Employee
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white' }}>👤 {user?.name}</span>
          <button
            onClick={handleLogout}
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
        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ margin: 0, color: 'white' }}>My Goals</h2>
            <p style={{ color: '#999', margin: '5px 0 0 0' }}>
              {windowStatus 
                ? `📅 ${windowStatus.period} window is open`
                : ' No active window'}
            </p>
          </div>

          {/* WEIGHTAGE TRACKER */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '15px 25px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: totalWeightage === 100 ? '#059669' : 
                     totalWeightage > 100 ? '#dc2626' : '#4F46E5'
            }}>
              {totalWeightage}%
            </div>
            <div style={{ color: '#666', fontSize: '0.85rem' }}>
              Total Weightage
            </div>
            <div style={{ 
              width: '120px', 
              height: '6px', 
              backgroundColor: '#333',
              borderRadius: '3px',
              marginTop: '8px'
            }}>
              <div style={{
                width: `${Math.min(totalWeightage, 100)}%`,
                height: '100%',
                backgroundColor: totalWeightage === 100 ? '#059669' : '#4F46E5',
                borderRadius: '3px',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        {totalWeightage === 100 && goals.some(g => g.status === 'draft') && (
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: '12px 30px',
                backgroundColor: 'transparent',
                color: '#059669',
                border: '2px solid #059669',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
               Submit All Goals for Approval
            </button>
          </div>
        )}

        {/* GOAL CARDS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px'
        }}>
          {/* EXISTING GOALS */}
          {goals.map(goal => (
            <div
              key={goal.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `3px solid ${
                  goal.status === 'approved' ? '#059669' :
                  goal.status === 'submitted' ? '#0891B2' :
                  goal.status === 'returned' ? '#dc2626' : '#4F46E5'
                }`
              }}
            >
              {/* STATUS BADGE */}
              <div style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                marginBottom: '10px',
                backgroundColor:
                  goal.status === 'approved' ? '#d1fae5' :
                  goal.status === 'submitted' ? '#dbeafe' :
                  goal.status === 'returned' ? '#fee2e2' : '#ede9fe',
                color:
                  goal.status === 'approved' ? '#059669' :
                  goal.status === 'submitted' ? '#0891B2' :
                  goal.status === 'returned' ? '#dc2626' : '#4F46E5'
              }}>
                {goal.status.toUpperCase()}
              </div>

              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '1rem',
                color: 'white'
              }}>
                {goal.title}
              </h3>

              <p style={{ 
                color: '#999', 
                fontSize: '0.85rem',
                margin: '0 0 15px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {goal.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: 'white',
                marginBottom: '10px'
              }}>
                <span> Target: {goal.target}</span>
                <span> {goal.weightage}%</span>
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: '#666',
                marginBottom: '10px'
              }}>
                 {goal.uom_type?.replace('_', ' ')}
              </div>

              {/* EDIT BUTTON — only for draft goals */}
              {goal.status === 'draft' && (
                <button
                  onClick={() => navigate(`/employee/goals/new`, { state: { goal } })}
                  style={{
                    width: '100%',
                    color:'white',
                    padding: '8px',
                    backgroundColor: '#222',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Edit
                </button>
              )}

              {/* LOG ACTUAL — for approved goals during check-in window */}
              {goal.status === 'approved' && windowStatus?.period !== 'goal_setting' && (
                <button
                  onClick={() => navigate('/employee/checkin', { state: { goal } })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#059669',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'white'
                  }}
                >
                   Log Achievement
                </button>
              )}
            </div>
          ))}

          {/* EMPTY SLOTS */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              onClick={() => {
                if (goals.some(g => g.status === 'submitted' || g.status === 'approved')) {
                  alert('Goals are locked — cannot add new goals')
                  return
                }
                navigate('/employee/goals/new')
              }}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '20px',
                border: '2px dashed #444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: '200px',
                color: '#666',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>+</div>
              <div style={{ fontSize: '0.9rem' }}>Add Goal</div>
              <div style={{ fontSize: '0.75rem', marginTop: '5px' }}>
                {8 - goals.length} slots remaining
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard