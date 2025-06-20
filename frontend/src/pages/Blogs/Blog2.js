import React from 'react';
import './Blog2.css';

const Blog2 = ({ title, description, blogs, buttonText, backgroundColor }) => {
  return (
    <section
     className="blog2-section"
     style={{
        backgroundColor: backgroundColor
      }}>
      <div className="blog2-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="blog2-cards" >
        {blogs.map((blog, index) => (
          <div key={index} className="blog2-card" style={{ backgroundColor: backgroundColor }} data-aos="fade-up" data-aos-delay={index * 150} >
            <img src={blog.image} alt={blog.title} className="blog2-image" />
            <div className="blog2-content">
              <h2>{blog.title}</h2>
              <p>{blog.description}</p>
              <a href={blog.link} className="read-more">Read more</a>
            </div>
          </div>
        ))}
      </div>

      {buttonText && (
        <div className="blog2-btn-wrapper">
          <button className="blog-btn">{buttonText}</button>
        </div>
      )}
    </section>
  );
};

export default Blog2;
