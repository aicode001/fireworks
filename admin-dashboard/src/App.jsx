import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [username, setUsername] = useState(localStorage.getItem('adminUsername'))

  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem('adminToken', newToken)
    localStorage.setItem('adminUsername', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    setToken(null)
    setUsername(null)
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return <Dashboard username={username} onLogout={handleLogout} token={token} />
}

export default App
