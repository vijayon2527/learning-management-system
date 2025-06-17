import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react';
import RoleWrapper from './common/RoleWrapper';

export const AppSidebarNav = ({ items }) => {
  const navLink = (name, icon, badge, indent = false) => (
    <>
      {icon ? (
        icon
      ) : (
        indent && (
          <span className="nav-icon">
            <span className="nav-icon-bullet"></span>
          </span>
        )
      )}
      {name}
      {badge && (
        <CBadge color={badge.color} className="ms-auto" size="sm">
          {badge.text}
        </CBadge>
      )}
    </>
  );

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, requiredRoles, ...rest } = item;
    const Component = component;

    return (
      <RoleWrapper requiredRole={requiredRoles} key={index}>
        <Component as="div">
          {rest.to || rest.href ? (
            <CNavLink
              {...(rest.to && { as: NavLink })}
              {...(rest.href && { target: '_blank', rel: 'noopener noreferrer' })}
              {...rest}
            >
              {navLink(name, icon, badge, indent)}
            </CNavLink>
          ) : (
            navLink(name, icon, badge, indent)
          )}
        </Component>
      </RoleWrapper>
    );
  };

  const navGroup = (item, index) => {
    const { component, name, icon, items, requiredRoles, ...rest } = item;
    const Component = component;

    return (
      <RoleWrapper requiredRoles={requiredRoles} key={index}>
        <Component compact as="div" toggler={navLink(name, icon)} {...rest}>
          {item.items?.map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index, true),
          )}
        </Component>
      </RoleWrapper>
    );
  };

  return (
    <CSidebarNav as={SimpleBar}>
      {items?.map((item, index) =>
        item.items ? navGroup(item, index) : navItem(item, index),
      )}
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
