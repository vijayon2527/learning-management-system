import React from 'react'
import Header from './layout/partials/Header'
import Footer from './layout/partials/Footer'
import Banner from './Blogs/Banner'
import Blog1 from './Blogs/Blog1'
import Blog2 from './Blogs/Blog2'
import blogData from '../data/blogs.json'

const STATIC_URL = process.env.REACT_APP_STATIC_URL || process.env.PUBLIC_URL;

const Blog = () => {
  return (
    <div>
      <Header />
      <Banner />
      <div>
        {blogData.map((section, index) =>
          index % 2 === 0 ? (
            <Blog1
              key={index}
              feature={{ 
                ...section.feature, 
                img: `${STATIC_URL}/${section.feature.img}` 
              }}
              blogs={section.blogs.map(blog => ({
                ...blog,
                img: `${STATIC_URL}/${blog.img}`
              }))}
              buttonText={section.buttonText}
            />
          ) : (
            <Blog2
              key={index}
              title={section.feature.title}
              description={section.feature.description}
              blogs={section.blogs.map(blog => ({
                ...blog,
                img: `${STATIC_URL}/${blog.img}`
              }))}
              buttonText={section.buttonText}
              backgroundColor={section.feature.backgroundColor}
            />
          )
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Blog
