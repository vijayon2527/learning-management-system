import React, { Suspense, useEffect, useContext, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { CSpinner, useColorModes } from '@coreui/react'

import './scss/style.scss'
import './scss/examples.scss'
import "./styles/root.css";
import './style.css'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AuthContext, { AuthProvider } from './components/context/AuthContext'
import VerifyEmail from './components/users/VerifyEmail'
import PrivateRoute from './components/common/PrivateRoute'
import Courses from './components/Courses'

import PageRoutes from './routes/PageRoutes'
import CourseDetail from './pages/home/CourseDetails'
import CategoryCourses from './pages/home/CategoryCourses'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Lazy load pages
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./components/users/Register'))
const StudentRegister = React.lazy(() => import('./components/users/StudentRegister'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// AuthRoute to protect login/register routes
const AuthRoute = ({ children }) => {
  const { user } = useContext(AuthContext)
  return !user ? children : <Navigate to="/dashboard" />
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const [modalType, setModalType] = useState(null) // 'login' | 'register' | null

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }
    if (isColorModeSet()) return
  }, [isColorModeSet, setColorMode])

  useEffect(() => {
    AOS.init({ duration: 800, once: true })
  }, [])

  useEffect(() => {
    const handleShowLogin = () => setModalType('login')
    const handleShowRegister = () => setModalType('register')
    const handleCloseLogin = () => setModalType(null)

    window.addEventListener('show-login', handleShowLogin)
    window.addEventListener('show-register', handleShowRegister)
    window.addEventListener('close-login', handleCloseLogin)

    return () => {
      window.removeEventListener('show-login', handleShowLogin)
      window.removeEventListener('show-register', handleShowRegister)
      window.removeEventListener('close-login', handleCloseLogin)
    }
  }, [])

  const closeModal = () => setModalType(null)

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
          <Routes>
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/UserRegister" element={<AuthRoute><StudentRegister /></AuthRoute>} />
            <Route path="/Register" element={<StudentRegister />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/api/users/verify-email/:token/" element={<VerifyEmail />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/500" element={<Page500 />} />
            <Route path="/course" element={<Courses />} />
            <Route path="/categories/:slug" element={<CategoryCourses />} />
            {PageRoutes}
            <Route path="*" element={<PrivateRoute><DefaultLayout /></PrivateRoute>} />
          </Routes>

          {/* GLOBAL LOGIN/REGISTER MODAL */}
          {modalType && (
            <div
              className="login-modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={closeModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "500px", width: "100%" }}
              >
                <Suspense fallback={<div className="text-center"><CSpinner color="primary" /></div>}>
              {modalType === "login" ? (
                <Login onLoginSuccess={() => setModalType(null)} />
              ) : (
                <StudentRegister />
              )}
                </Suspense>
              </div>
            </div>
          )}
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
