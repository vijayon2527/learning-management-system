import React from 'react'
import { Route } from 'react-router-dom'
import MyLearning from '../components/courses/MyLearning/MyLearning'

const Home = React.lazy(() => import('../pages/Home'))
const Trainings = React.lazy(() => import('../pages/Trainings'))
const Blog = React.lazy(() => import('../pages/Blog'))
const CourseVideo = React.lazy(() => import('../pages/coursevideo/CourseVideo'))

const PageRoutes = [
  
  <Route key="home" path="/" element={<Home />} />,
  <Route key="trainings" path="/trainings" element={<Trainings />} />,
  <Route key="blog" path="/blog" element={<Blog />} />,
  <Route path="/course-video/:courseSlug/:sectionSlug/:lectureSlug" element={<CourseVideo />} />,
  <Route key="my-learning" path="/my-learning" element={<MyLearning />} />,

]

export default PageRoutes