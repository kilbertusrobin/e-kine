import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BookingPage from './pages/BookingPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="sync">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
