import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './StudentSidebar.css';

const StudentSidebar = ({ initials, fullName }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="student-sidebar">
      <div className="avatar">{initials}</div>
      <h3>{fullName}</h3>
      <ul className="menu">

      <li className={isActive('/user-profile') ? 'active' : ''}>
        <Link to="/user-profile">My Profile</Link>
      </li>

      <li className={isActive('/my-courses') ? 'active' : ''}>
        <Link to="/my-courses">My Courses</Link>
      </li>
      
      <li className={isActive('/purchase-history') ? 'active' : ''}>
        <Link to="/purchase-history">Purchase History</Link>
      </li>

      <li className={isActive('/user-password') ? 'active' : ''}>
        <Link to="/user-password">Change Password</Link>
      </li>


      <li className={isActive('/refer-friend') ? 'active' : ''}>
        <Link to="/refer-friend">Refer a Friend</Link>
      </li>
    </ul>

    </aside>
  );
};

export default StudentSidebar;
