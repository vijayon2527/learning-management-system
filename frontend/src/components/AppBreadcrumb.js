import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import routes from '../routes'
import axiosInstance from '../utils/axiosInstance'

const AppBreadcrumb = () => {
  const location = useLocation()
  const currentPath = location.pathname
  const [courseName, setCourseName] = useState(null)

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

    let accumulatedPath = ''
    pathArray.forEach((part, idx) => {
      accumulatedPath += `/${part}`
      let name = getRouteName(accumulatedPath, routes)

      // Only replace for the main Course Details page
      if (accumulatedPath.match(/\/dashboard\/course-details\/[^/]+$/) && courseName) {
        name = courseName
      }

      if (name) {
        breadcrumbs.push({
          name,
          pathname: accumulatedPath,
          active: idx === pathArray.length - 1,
        })
      }
    })

    // Insert "Course List" manually at the beginning
    if (
      pathname.includes('/dashboard/course-details/') &&
      !breadcrumbs.find((b) => b.name === 'Course List')
    ) {
      breadcrumbs.unshift({
        name: 'Course List',
        pathname: '/dashboard/course-list',
        active: false,
      })
    }

    return breadcrumbs
  }

  // Fetch course name once on route match
  useEffect(() => {
    const match = currentPath.match(/\/dashboard\/course-details\/([^/]+)/)
    if (match && match[1]) {
      const slug = match[1]
      axiosInstance
        .get(`/api/courses/courses/${slug}/`)
        .then((res) => {
          setCourseName(res.data.name)
        })
        .catch((err) => {
          console.error('Failed to fetch course', err)
        })
    }
  }, [currentPath])

  const breadcrumbs = getBreadcrumbs(currentPath)

  return (
    <CBreadcrumb className="my-0">
      {breadcrumbs.map((item, idx) => (
        <CBreadcrumbItem
          key={idx}
          active={item.active}
          href={!item.active ? item.pathname : undefined}
        >
          {item.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
