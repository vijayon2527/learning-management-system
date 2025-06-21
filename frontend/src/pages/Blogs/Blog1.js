import React from 'react'
import './Blog1.css'

const Blog1 = ({ feature, blogs, buttonText, backgroundColor }) => {
    return (
        <div className="blog1-wrapper">
            <div className="blog1">
                <div className="feature-box"  style={{ backgroundColor: feature.backgroundColor || backgroundColor }}>
                    <h2>{feature.title}</h2>
                    <p>{feature.description}</p>
                </div>
                <div className="blogs-container">
                    {blogs.map((blog, index) => (
                        <div className="blog-card" key={index} data-aos="fade-up" data-aos-delay={index * 150}>
                            <img src={blog.image} alt={blog.title} className="blog-image" />
                            <h3 className="blog-title">{blog.title}</h3>
                            <p className="blog-description">{blog.description}</p>
                            <a href={blog.link} className="read-more">Read more</a>
                        </div>
                    ))}
                </div>
            </div>
            {buttonText && (
                <div className="blog1-btn-wrapper">
                    <button className="blog-btn">{buttonText}</button>
                </div>
            )}
        </div>
    )
}

export default Blog1
