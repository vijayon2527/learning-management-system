import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilBuilding, cilShieldAlt,cilGroup, cilBook} from '@coreui/icons';
import { CNavItem } from '@coreui/react'
import Roles from './components/common/Roles';

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Users',
    to: 'dashboard/users-list',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    requiredRoles: [
      Roles.SUPER_ADMIN,
    ],
  },
  {
    component: CNavItem,
    name: 'Departments',
    to: '/dashboard/department-list',
    icon:<CIcon icon={cilBuilding} customClassName="nav-icon" />,
    requiredRoles: [
      Roles.SUPER_ADMIN,
    ]
  },
  {
    component: CNavItem,
    name: 'Roles',
    to: '/dashboard/roles-list',
    icon:<CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    requiredRoles: [
      Roles.SUPER_ADMIN,
    ],
  },
  {
    component: CNavItem,
    name: 'Course Categories',
    to: '/dashboard/course-category-list',
    icon:<CIcon icon={cilBook} customClassName="nav-icon" />,
    requiredRoles: [
      Roles.SUPER_ADMIN,
    ],
  },
  {
    component: CNavItem,
    name: 'Courses',
    to: '/dashboard/course-list',
    icon:<CIcon icon={cilBook} customClassName="nav-icon" />,
    requiredRoles: [
      Roles.SUPER_ADMIN,
    ],
  },
]

export default _nav
