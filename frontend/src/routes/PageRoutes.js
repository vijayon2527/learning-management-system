import React from 'react'
import { Route } from 'react-router-dom'

const Home = React.lazy(() => import('../pages/Home'))
const Trainings = React.lazy(() => import('../pages/Trainings'))
const Blog = React.lazy(() => import('../pages/Blog'))

const PageRoutes = [
  
  <Route key="home" path="/" element={<Home />} />,
  <Route key="trainings" path="/trainings" element={<Trainings />} />,
  <Route key="blog" path="/blog" element={<Blog />} />,
]

export default PageRoutes