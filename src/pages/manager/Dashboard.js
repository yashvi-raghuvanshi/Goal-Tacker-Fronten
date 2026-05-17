import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [team, setTeam] = useState([])
  const [teamGoals, setTeamGoals] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeWindow, setActiveWindow] = useState(null)

  useEffect(() => {
    fetchTeam()
    checkWindow()
  }, [])

  const fetchTeam = async () => {
    try {
      const res = await API.get('/manager/team')
      setTeam(res.data)

      // Fetch goals for each team member
      const goalsMap = {}
      await Promise.all(res.data.map(async (member) => {
        const goalsRes = await API.get(`/manager/goals/${member.id}`)
        goalsMap[member.id] = goalsRes.data
      }))
      setTeamGoals(goalsMap)
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
      setActiveWindow(active)
    } catch (err) {
      console.error(err)
    }
  }

  const getEmployeeStatus = (employeeId) => {
    const goals = teamGoals[employeeId] || []
    if (goals.length === 0) return { label: 'No Goals', color: '#9ca3af', dot: '⚪' }
    if (goals.some(g => g.status === 'submitted')) return { label: 'Pending Approval', color: '#f59e0b', dot: '🔴' }
    if (goals.every(g => g.status === 'approved')) return { label: 'Approved', color: '#059669', dot: '🟢' }
    if (goals.some(g => g.status === 'returned')) return { label: 'Returned', color: '#dc2626', dot: '🟡' }
    return { label: 'Draft', color: '#6b7280', dot: '⚪' }
  }

  const getPendingCount = () => {
    return team.filter(member => {
      const goals = teamGoals[member.id] || []
      return goals.some(g => g.status === 'submitted')
    }).length
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0f0f0f',
      color: 'white',
      fontSize: '1.2rem'
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
        backgroundColor: '#0891B2',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '1.3rem' }}>
          Goal Tracker - Manager
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white' }}>👥 {user?.name}</span>
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
        {/* STATS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'Team Members', value: team.length, color: '#0891B2' },
            { label: 'Pending Approval', value: getPendingCount(), color: '#f59e0b' },
            { label: 'Active Window', value: activeWindow?.period || 'None', color: '#059669' }
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#1a1a1a',
              padding: '20px',
              borderRadius: '12px',
              border: `1px solid ${stat.color}`,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
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

        {/* TEAM TABLE */}
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
            <h2 style={{ color: 'white', margin: 0 }}>My Team</h2>
            <span style={{ color: '#999', fontSize: '0.9rem' }}>
              {activeWindow ? `📅 ${activeWindow.period} window open` : ' No active window'}
            </span>
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
            <span>Goals</span>
            <span>Status</span>
            <span>Weightage</span>
            <span>Action</span>
          </div>

          {/* TABLE ROWS */}
          {team.map(member => {
            const goals = teamGoals[member.id] || []
            const status = getEmployeeStatus(member.id)
            const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)

            return (
              <div
                key={member.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  padding: '15px 20px',
                  borderBottom: '1px solid #222',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>
                    {member.name}
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem' }}>
                    {member.department}
                  </div>
                </div>

                <span style={{ color: '#999' }}>
                  {goals.length}/8
                </span>

                <span style={{
                  color: status.color,
                  fontSize: status.label === 'Pending Approval' || status.label === 'Returned' ? '0.85rem' : '0.85rem',
                  fontWeight: status.label === 'Pending Approval' || status.label === 'Returned' ? '900' : 'bold',
                  textTransform: status.label === 'Pending Approval' || status.label === 'Returned' ? 'none' : 'none',
                  letterSpacing: status.label === 'Pending Approval' || status.label === 'Returned' ? '0.normal' : 'normal'
                  }}>
                {status.label}
                </span>

                <span style={{
                  color: totalWeightage === 100 ? '#059669' : '#f59e0b'
                }}>
                  {totalWeightage}%
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/manager/review/${member.id}`)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: status.label === 'Pending Approval' ? '#0891B2' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {status.label === 'Pending Approval' ? ' Review' : ' View'}
                  </button>

                  {activeWindow?.period !== 'goal_setting' && goals.some(g => g.status === 'approved') && (
                    <button
                      onClick={() => navigate(`/manager/checkin/${member.id}`)}
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
                       Check-in
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {team.length === 0 && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999'
            }}>
              No team members found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard