import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import RolePicker from './pages/RolePicker'
import Login from './pages/Login'

import EmployeeDashboard from './pages/employee/Dashboard'
import GoalForm from './pages/employee/GoalForm'
import CheckIn from './pages/employee/CheckIn'

import ManagerDashboard from './pages/manager/Dashboard'
import GoalReview from './pages/manager/GoalReview'
import CheckInReview from './pages/manager/CheckInReview'

import AdminDashboard from './pages/admin/Dashboard'
import CycleManagement from './pages/admin/CycleManagement'
import AuditLog from './pages/admin/AuditLog'
import UserManagement from './pages/admin/UserManagement'
import Analytics from './pages/admin/Analytics'


const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to='/' />
  if (role && user.role !== role) return <Navigate to='/' />
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<RolePicker />} />
      <Route path='/login/:role' element={<Login />} />

      <Route path='/employee/dashboard' element={
        <ProtectedRoute role='employee'><EmployeeDashboard /></ProtectedRoute>
      } />
      <Route path='/employee/goals/new' element={
        <ProtectedRoute role='employee'><GoalForm /></ProtectedRoute>
      } />
      <Route path='/employee/checkin' element={
        <ProtectedRoute role='employee'><CheckIn /></ProtectedRoute>
      } />

      <Route path='/manager/dashboard' element={
        <ProtectedRoute role='manager'><ManagerDashboard /></ProtectedRoute>
      } />
      <Route path='/manager/review/:employeeId' element={
        <ProtectedRoute role='manager'><GoalReview /></ProtectedRoute>
      } />
      <Route path='/manager/checkin/:employeeId' element={
        <ProtectedRoute role='manager'><CheckInReview /></ProtectedRoute>
      } />

      <Route path='/admin/dashboard' element={
        <ProtectedRoute role='admin'><AdminDashboard /></ProtectedRoute>
      } />
      <Route path='/admin/cycles' element={
        <ProtectedRoute role='admin'><CycleManagement /></ProtectedRoute>
      } />
      <Route path='/admin/audit' element={
        <ProtectedRoute role='admin'><AuditLog /></ProtectedRoute>
      } />
      <Route path='/admin/users' element={
        <ProtectedRoute role='admin'><UserManagement /></ProtectedRoute>
      } />
      <Route path='/admin/analytics' element={
        <ProtectedRoute role='admin'><Analytics /></ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App