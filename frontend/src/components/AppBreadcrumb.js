import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import routes from '../routes'

const AppBreadcrumb = () => {
  const location = useLocation()
  const currentPath = location.pathname

  // Match route path with dynamic support (e.g., :slug, :trackId)
  const getRouteName = (pathname, routes) => {
    const pathParts = pathname.split('/').filter(Boolean)

    return (
      routes.find((route) => {
        const routeParts = route.path.split('/').filter(Boolean)
        if (routeParts.length !== pathParts.length) return false

        return routeParts.every((part, i) => {
          return part.startsWith(':') || part === pathParts[i]
        })
      })?.name || null
    )
  }

 const getBreadcrumbs = (pathname) => {
  const breadcrumbs = []
  const pathArray = pathname.split('/').filter(Boolean)

  let currentPath = ''
  pathArray.forEach((part, idx) => {
    currentPath += `/${part}`
    const name = getRouteName(currentPath, routes)

    if (name) {
      breadcrumbs.push({
        name,
        pathname: currentPath,
        active: idx === pathArray.length - 1,
      })
    }
  })

  // Inject "Course List" breadcrumb manually if deeper paths match
  if (pathname.includes('/dashboard/course-details/') && !breadcrumbs.find(b => b.name === 'Course List')) {
    breadcrumbs.unshift({
      name: 'Course List',
      pathname: '/dashboard/course-list',
      active: false,
    })
  }

  return breadcrumbs
}


  const breadcrumbs = getBreadcrumbs(currentPath)

  return (
    <CBreadcrumb className="my-0">
      {/* <CBreadcrumbItem href="/">Home</CBreadcrumbItem> */}
      {breadcrumbs.map((item, idx) => (
        <CBreadcrumbItem
          key={idx}
          {...(item.active ? { active: true } : {})}
          {...(!item.active ? { href: item.pathname } : {})}
        >
          {item.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
