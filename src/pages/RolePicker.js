import { useNavigate } from 'react-router-dom'

const RolePicker = () => {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'employee',
      title: 'Employee',
      description: 'Create and track your goals',
      icon: '👤',
      color: '#4F46E5'
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Review and approve team goals',
      icon: '👥',
      color: '#0891B2'
    },
    {
      id: 'admin',
      title: 'Admin / HR',
      description: 'Manage cycles and oversee all goals',
      icon: '⚙️',
      color: '#059669'
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '3rem',
        marginBottom: '10px'
      }}>
        Goal Tracker
      </h1>
      <p style={{
        color: '#999',
        marginBottom: '60px',
        fontSize: '1.5rem'
      }}>
        The Smarter Way to Track Your Goals
      </p>

      <div style={{
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {roles.map(role => (
          <div
            key={role.id}
            onClick={() => navigate(`/login/${role.id}`)}
            style={{
              width: '200px',
              height: '240px',
              backgroundColor: '#1a1a1a',
              border: `2px solid ${role.color}`,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              padding: '20px'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{
              fontSize: '4rem',
              marginBottom: '15px'
            }}>
              {role.icon}
            </div>
            <h2 style={{
              color: 'white',
              margin: '0 0 10px 0',
              fontSize: '1.3rem'
            }}>
              {role.title}
            </h2>
            <p style={{
              color: '#999',
              textAlign: 'center',
              fontSize: '0.85rem',
              margin: 0
            }}>
              {role.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RolePicker