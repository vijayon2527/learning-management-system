// import { element } from 'prop-types'
import React from 'react'
import Permissions from './components/common/Roles'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const DepartmentList =React.lazy(() => import('./components/users/DepartmentList'))
const RoleList =React.lazy(() => import('./components/users/RoleList'))
const UserList = React.lazy(() => import('./components/users/UserList'));

const CourseCategoryList = React.lazy(() => import('./components/courses/categories/CourseCategoryList'));
const CourseList = React.lazy(() => import('./components/courses/CourseList'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { 
    path: '/dashboard/users-list/', 
    name: 'UserList', 
    element: UserList ,
    requiredPermissions: [
      Permissions.VIEW_USER,
    ] 
  },
  { 
    path: '/dashboard/department-list', 
    name: 'deprtment list', 
    element: DepartmentList, 
    requiredPermissions: [
      Permissions.VIEW_DEPARTMENT,
    ] 
  },
  { 
    path: '/dashboard/roles-list', 
    name: 'roles list', 
    element: RoleList, 
    requiredPermissions: [
      Permissions.VIEW_ROLE,
    ] 
  },
  { 
    path: '/dashboard/course-category-list', 
    name: 'course category list', 
    element: CourseCategoryList, 
    requiredPermissions: [
      Permissions.VIEW_ROLE,
    ] 
  },
  { 
    path: '/dashboard/course-list', 
    name: 'course list', 
    element: CourseList, 
    requiredPermissions: [
      Permissions.VIEW_ROLE,
    ] 
  }
]

export default routes
