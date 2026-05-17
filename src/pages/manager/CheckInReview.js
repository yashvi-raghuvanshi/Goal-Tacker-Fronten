import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../api/axios'

const CheckInReview = () => {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [checkins, setCheckins] = useState({})
  const [employee, setEmployee] = useState(null)
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [activeWindow, setActiveWindow] = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchData()
}, [])

  const fetchData = async () => {
    try {
      const [goalsRes, teamRes, cyclesRes] = await Promise.all([
        API.get(`/manager/goals/${employeeId}`),
        API.get('/manager/team'),
        API.get('/admin/cycles')
      ])

      setGoals(goalsRes.data)
      const emp = teamRes.data.find(m => m.id === employeeId)
      setEmployee(emp)

      const active = cyclesRes.data.find(w => w.is_active)
      setActiveWindow(active)

      // Fetch checkins for each goal
      const checkinsMap = {}
      await Promise.all(goalsRes.data.map(async (goal) => {
        const res = await API.get(`/checkins/goal/${goal.id}`)
        checkinsMap[goal.id] = res.data
      }))
      setCheckins(checkinsMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveComment = async (goalId, quarter) => {
    try {
      await API.post(`/manager/checkin/${goalId}`, {
        quarter,
        manager_comment: comments[`${goalId}-${quarter}`]
      })
      setSuccess('Comment saved!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const getScoreColor = (score) => {
    if (!score) return '#999'
    if (score >= 100) return '#059669'
    if (score >= 70) return '#f59e0b'
    return '#dc2626'
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
          onClick={() => navigate('/manager/dashboard')}
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
        <div>
          <h2 style={{ color: 'white', margin: 0 }}>
            📝 Check-in Review: {employee?.name}
          </h2>
          <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
            {activeWindow ? `Active window: ${activeWindow.period}` : 'No active window'}
          </p>
        </div>
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

      {/* GOALS WITH CHECKINS */}
      {goals.map(goal => {
        const goalCheckins = checkins[goal.id] || []

        return (
          <div
            key={goal.id}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #333',
              marginBottom: '20px',
              overflow: 'hidden'
            }}
          >
            {/* GOAL HEADER */}
            <div style={{
              padding: '15px 20px',
              backgroundColor: '#222',
              borderBottom: '1px solid #333'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ color: 'white', margin: 0 }}>
                  🎯 {goal.title}
                </h3>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#0891B2' }}>
                    Target: {goal.target || goal.target_date}
                  </span>
                  <span style={{ color: '#4F46E5' }}>
                    Weight: {goal.weightage}%
                  </span>
                  <span style={{ color: '#999' }}>
                    {goal.uom_type?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* CHECKINS */}
            {goalCheckins.length === 0 ? (
              <div style={{
                padding: '20px',
                color: '#999',
                textAlign: 'center'
              }}>
                No check-ins logged yet
              </div>
            ) : (
              goalCheckins.map(checkin => (
                <div
                  key={checkin.id}
                  style={{
                    padding: '20px',
                    borderBottom: '1px solid #222'
                  }}
                >
                  {/* CHECKIN ROW */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    marginBottom: '15px',
                    gap: '10px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.8rem' }}>Quarter</div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>
                        {checkin.quarter}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.8rem' }}>Planned</div>
                      <div style={{ color: '#0891B2', fontWeight: 'bold' }}>
                        {goal.target || goal.target_date}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.8rem' }}>Actual</div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>
                        {checkin.actual || checkin.actual_date || '-'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999', fontSize: '0.8rem' }}>Score</div>
                      <div style={{
                        color: getScoreColor(checkin.score),
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        {checkin.score ? `${checkin.score.toFixed(1)}%` : '-'}
                      </div>
                    </div>
                  </div>

                  {/* STATUS BADGE */}
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      backgroundColor:
                        checkin.status === 'completed' ? '#d1fae5' :
                        checkin.status === 'on_track' ? '#dbeafe' : '#f3f4f6',
                      color:
                        checkin.status === 'completed' ? '#059669' :
                        checkin.status === 'on_track' ? '#0891B2' : '#6b7280'
                    }}>
                      {checkin.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* EXISTING COMMENT */}
                  {checkin.manager_comment && (
                    <div style={{
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '6px',
                      color: '#999',
                      fontSize: '0.85rem',
                      marginBottom: '10px'
                    }}>
                      💬 Previous comment: {checkin.manager_comment}
                    </div>
                  )}

                  {/* ADD COMMENT */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      value={comments[`${goal.id}-${checkin.quarter}`] || ''}
                      onChange={e => setComments({
                        ...comments,
                        [`${goal.id}-${checkin.quarter}`]: e.target.value
                      })}
                      placeholder='Add check-in comment...'
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      onClick={() => handleSaveComment(goal.id, checkin.quarter)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#0891B2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CheckInReview