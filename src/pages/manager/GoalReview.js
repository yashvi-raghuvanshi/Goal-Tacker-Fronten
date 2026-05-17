import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../api/axios'

const GoalReview = () => {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [employee, setEmployee] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingGoal, setEditingGoal] = useState(null)
  const [editValues, setEditValues] = useState({})

  // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchData()
}, [])

  const fetchData = async () => {
    try {
      const [goalsRes, teamRes] = await Promise.all([
        API.get(`/manager/goals/${employeeId}`),
        API.get('/manager/team')
      ])
      setGoals(goalsRes.data)
      const emp = teamRes.data.find(m => m.id === employeeId)
      setEmployee(emp)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    setError('')
    try {
      await API.put(`/manager/approve/${employeeId}`)
      setSuccess('Goals approved and locked successfully!')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReturn = async () => {
    setActionLoading(true)
    setError('')
    try {
      await API.put(`/manager/return/${employeeId}`, { comment })
      setSuccess('Goals returned for rework')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Return failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal.id)
    setEditValues({ target: goal.target, weightage: goal.weightage })
  }

  const handleSaveEdit = async (goalId) => {
    try {
      await API.put(`/manager/edit-goal/${goalId}`, editValues)
      setEditingGoal(null)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Edit failed')
    }
  }

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)

  const inputStyle = {
    padding: '8px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    color: 'white',
    width: '80px'
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
        <h2 style={{ color: 'white', margin: 0 }}>
          👁️ Reviewing: {employee?.name}
        </h2>
      </div>

      {/* WEIGHTAGE SUMMARY */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '15px 20px',
        borderRadius: '10px',
        border: `1px solid ${totalWeightage === 100 ? '#059669' : '#f59e0b'}`,
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: 'white' }}>
          Total Weightage:
          <strong style={{
            color: totalWeightage === 100 ? '#059669' : '#f59e0b',
            marginLeft: '10px',
            fontSize: '1.2rem'
          }}>
            {totalWeightage}%
          </strong>
        </span>
        <span style={{ color: '#999', fontSize: '0.9rem' }}>
          {totalWeightage === 100 ? 'Ready to approve' : ` Need ${100 - totalWeightage}% more`}
        </span>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ff000022',
          border: '1px solid red',
          color: 'red',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
           {error}
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

      {/* GOALS TABLE */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #333',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {/* HEADER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          padding: '12px 20px',
          backgroundColor: '#222',
          color: '#999',
          fontSize: '0.85rem'
        }}>
          <span>Goal</span>
          <span>UoM</span>
          <span>Target</span>
          <span>Weightage</span>
          <span>Edit</span>
        </div>

        {/* ROWS */}
        {goals.map(goal => (
          <div
            key={goal.id}
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
                {goal.title}
              </div>
              <div style={{ color: '#999', fontSize: '0.8rem' }}>
                {goal.description?.substring(0, 50)}...
              </div>
            </div>

            <span style={{ color: '#0891B2', fontSize: '0.85rem' }}>
              {goal.uom_type?.replace(/_/g, ' ')}
            </span>

            {/* EDITABLE TARGET */}
            {editingGoal === goal.id ? (
              <input
                type='number'
                value={editValues.target}
                onChange={e => setEditValues({ ...editValues, target: e.target.value })}
                style={inputStyle}
              />
            ) : (
              <span style={{ color: 'white' }}>
                {goal.target || goal.target_date || '0'}
              </span>
            )}

            {/* EDITABLE WEIGHTAGE */}
            {editingGoal === goal.id ? (
              <input
                type='number'
                value={editValues.weightage}
                onChange={e => setEditValues({ ...editValues, weightage: parseFloat(e.target.value) })}
                style={inputStyle}
              />
            ) : (
              <span style={{ color: '#4F46E5' }}>
                {goal.weightage}%
              </span>
            )}

            {/* EDIT/SAVE BUTTON */}
            {goal.status !== 'approved' && (
              editingGoal === goal.id ? (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleSaveEdit(goal.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingGoal(null)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditGoal(goal)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✏️ Edit
                </button>
              )
            )}
          </div>
        ))}
      </div>

      {/* COMMENT BOX */}
      {goals.some(g => g.status === 'submitted') && (
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '20px'
        }}>
          <label style={{ color: '#999', display: 'block', marginBottom: '8px' }}>
            Comment to Employee (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder='Add feedback or instructions...'
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* ACTION BUTTONS */}
      {goals.some(g => g.status === 'submitted') && (
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={handleApprove}
            disabled={actionLoading || totalWeightage !== 100}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: totalWeightage === 100 ? '#059669' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: totalWeightage === 100 ? 'pointer' : 'not-allowed'
            }}
          >
            {actionLoading ? 'Processing...' : ' Approve All Goals'}
          </button>

          <button
            onClick={handleReturn}
            disabled={actionLoading}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
             Return for Rework
          </button>
        </div>
      )}
    </div>
  )
}

export default GoalReview