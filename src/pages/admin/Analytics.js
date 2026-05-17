import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts'

const Analytics = () => {
  const navigate = useNavigate()
  const [completion, setCompletion] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [completionRes, goalsRes] = await Promise.all([
        API.get('/admin/completion'),
        API.get('/admin/all-goals')
      ])
      console.log('completion:', completionRes.data)
      console.log('goals:', goalsRes.data)
      setCompletion(completionRes.data)
      setGoals(goalsRes.data)
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Bar chart data — goals per employee
  const barData = completion.map(emp => ({
    name: emp.employee.split(' ')[0],
    Submitted: emp.goals_submitted,
    Approved: emp.goals_approved,
    CheckIns: emp.checkins_done
  }))

  // Pie chart data — goals by status
  const statusCounts = goals.reduce((acc, goal) => {
    acc[goal.status] = (acc[goal.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }))

  const PIE_COLORS = ['#4F46E5', '#0891B2', '#059669', '#f59e0b', '#dc2626']

  // UoM distribution
  const uomCounts = goals.reduce((acc, goal) => {
    const type = goal.uom_type?.replace(/_/g, ' ') || 'unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const uomData = Object.entries(uomCounts).map(([name, value]) => ({
    name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    value
  }))

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
          Analytics Dashboard
        </h2>
      </div>

      {/* SUMMARY STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Total Goals', value: goals.length, color: '#4F46E5' },
          { label: 'Approved', value: goals.filter(g => g.status === 'approved').length, color: '#059669' },
          { label: 'Submitted', value: goals.filter(g => g.status === 'submitted').length, color: '#0891B2' },
          { label: 'Draft', value: goals.filter(g => g.status === 'draft').length, color: '#f59e0b' }
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
            <div style={{ color: '#999' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* BAR CHART */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '25px',
        borderRadius: '12px',
        border: '1px solid #333',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>
          Goal Progress Per Employee
        </h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#333' />
            <XAxis dataKey='name' stroke='#999' />
            <YAxis stroke='#999' />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                color: 'white'
              }}
            />
            <Legend />
            <Bar dataKey='Submitted' fill='#0891B2' />
            <Bar dataKey='Approved' fill='#059669' />
            <Bar dataKey='CheckIns' fill='#4F46E5' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHARTS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* GOAL STATUS PIE */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>
            Goals by Status
          </h3>
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                outerRadius={80}
                dataKey='value'
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* UOM DISTRIBUTION PIE */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>
            Goals by UoM Type
          </h3>
          <ResponsiveContainer width='100%' height={250}>
            <PieChart>
              <Pie
                data={uomData}
                cx='50%'
                cy='50%'
                outerRadius={80}
                dataKey='value'
                label={false}
              >
                {uomData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  color: 'white'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
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
          borderBottom: '1px solid #333'
        }}>
          <h3 style={{ color: 'white', margin: 0 }}>
            Employee Completion Rates
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
          padding: '12px 20px',
          backgroundColor: '#222',
          color: '#999',
          fontSize: '0.85rem'
        }}>
          <span>Employee</span>
          <span>Goals</span>
          <span>Approved</span>
          <span>Check-ins</span>
          <span>Progress</span>
        </div>

        {completion.map((emp, i) => {
          const progressPct = emp.total_goals > 0
            ? Math.round((emp.goals_approved / emp.total_goals) * 100)
            : 0

          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
                padding: '15px 20px',
                borderBottom: '1px solid #222',
                alignItems: 'center'
              }}
            >
              <span style={{ color: 'white', fontWeight: 'bold' }}>
                {emp.employee}
              </span>
              <span style={{ color: '#999' }}>{emp.total_goals}</span>
              <span style={{ color: '#059669' }}>{emp.goals_approved}</span>
              <span style={{ color: '#0891B2' }}>{emp.checkins_done}</span>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px'
                  }}>
                    <div style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      backgroundColor: progressPct === 100 ? '#059669' :
                        progressPct > 50 ? '#0891B2' : '#f59e0b',
                      borderRadius: '4px',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <span style={{
                    color: 'white',
                    fontSize: '0.85rem',
                    minWidth: '35px'
                  }}>
                    {progressPct}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Analytics