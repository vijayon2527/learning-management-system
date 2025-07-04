import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilBuilding, cilLibrary,cilGroup, cilFolderOpen} from '@coreui/icons';
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
  name: 'Categories',
  to: '/dashboard/course-category-list',
  icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />, 
  requiredRoles: [Roles.SUPER_ADMIN],
},
{
  component: CNavItem,
  name: 'Courses',
  to: '/dashboard/course-list',
  icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
  requiredRoles: [Roles.SUPER_ADMIN],
},

]

export default _nav
