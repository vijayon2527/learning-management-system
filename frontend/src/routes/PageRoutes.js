import React from 'react'
import { Route } from 'react-router-dom'

const Home = React.lazy(() => import('../pages/Home'))
const Trainings = React.lazy(() => import('../pages/Trainings'))
const Blog = React.lazy(() => import('../pages/Blog'))
const CourseVideo = React.lazy(() => import('../pages/coursevideo/CourseVideo'))

const PageRoutes = [
  
  <Route key="home" path="/" element={<Home />} />,
  <Route key="trainings" path="/trainings" element={<Trainings />} />,
  <Route key="blog" path="/blog" element={<Blog />} />,
  <Route key="coursevideo" path="/course-video" element={<CourseVideo />} />
]

export default PageRoutes