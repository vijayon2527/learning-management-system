import React, { Suspense, useEffect, useContext } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { CSpinner, useColorModes } from '@coreui/react'

import './scss/style.scss'
import './scss/examples.scss'
import "./styles/root.css";

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AuthContext, { AuthProvider } from './components/context/AuthContext'
import VerifyEmail from './components/users/VerifyEmail'
import PrivateRoute from './components/common/PrivateRoute'
import Courses from './components/Courses'

import PageRoutes from './routes/PageRoutes'

import 'aos/dist/aos.css';
import AOS from 'aos';
import CourseDetail from './pages/home/CourseDetails'
import CategoryCourses from './pages/home/CategoryCourses'

import './style.css'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./components/users/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
// AuthRoute Component (For Login and Register)
const AuthRoute = ({ children }) => {
  const { user } = useContext(AuthContext); // Get user from AuthContext
  return !user ? children : <Navigate to="/dashboard" />; // Redirect to dashboard if logged in
};

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }
  }, [isColorModeSet, setColorMode])

   useEffect(() => {
    AOS.init({
      duration: 800, // animation duration
      once: true     // whether animation should happen only once
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            {/* Auth-protected routes */}
            <Route exact path="/login" name="Login Page" element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } />
            <Route exact path="/register" name="Register Page" element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            } />
            <Route exact path="/courses/:slug" name="Page 404" element={<CourseDetail />} />
            <Route exact path="/api/users/verify-email/:token/" name="Page 404" element={<VerifyEmail />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route exact path="/course" name="Courses" element={<Courses />} />
            <Route exact path="/categories/:slug" name="Courses" element={<CategoryCourses />} />
        
            {PageRoutes}

            <Route
              path="*"
              name="Home"
              element={
                <PrivateRoute>
                  <DefaultLayout />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>

      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
