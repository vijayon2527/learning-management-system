import React from 'react'
import { Route } from 'react-router-dom'
import MyLearning from '../components/courses/MyLearning/MyLearning'
import UserProfile from '../components/users/StudentUser/UserProfile'
import ChangePassword from '../components/users/StudentUser/ChangePassword'
import PurchaseHistory from '../components/users/StudentUser/PurchaseHistory'
import ReferFriend from '../components/users/StudentUser/ReferFriend'
import MyCourses from '../components/users/StudentUser/MyCourses'
import CategoriesList from '../pages/home/CategoriesList'

const Home = React.lazy(() => import('../pages/Home'))
const Trainings = React.lazy(() => import('../pages/Trainings'))
const Blog = React.lazy(() => import('../pages/Blog'))
const CourseVideo = React.lazy(() => import('../pages/coursevideo/CourseVideo'))

const PageRoutes = [
  
  <Route key="home" path="/" element={<Home />} />,
  <Route key="trainings" path="/trainings" element={<Trainings />} />,
  <Route key="blog" path="/blog" element={<Blog />} />,
  <Route path="/course-video/:courseSlug/:trackSlug/:sectionSlug/:lectureSlug" element={<CourseVideo />} />,
  <Route key="my-learning" path="/my-learning" element={<MyLearning />} />,
  <Route key="User-Profile" path="/user-profile" element={<UserProfile />} />,

  <Route path="/user-password" element={<ChangePassword />} />,
  <Route path="/purchase-history" element={<PurchaseHistory />} />,
  <Route path="/refer-friend" element={<ReferFriend />} />,
  <Route path="/my-courses" element={<MyCourses />} />,
  <Route path="/Categories" element={<CategoriesList />} />



]

export default PageRoutes