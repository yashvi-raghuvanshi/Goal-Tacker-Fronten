import axios from 'axios'

const API = axios.create({
  baseURL: 'https://goal-tracker-backend-8n2p.onrender.com/api/auth/login'
})

// Automatically add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default API