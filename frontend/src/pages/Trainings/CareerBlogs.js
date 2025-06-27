import React from 'react';
import '../Blogs/Blog2.css'

const blogs = [
    {
        image: "/assets/images/vue.jpg",
        title: "Unlock Global Accounting Skills with IFRS Certification",
        description: "Today, the financial world is deeply interconnected. It has now become a necessity to have a common accounting language...",
        link: "#"
    },
    {
        image: "/assets/images/vue.jpg",
        title: "Preparing for the CFA Exam: Strategies for Success in 2025",
        description: "The CFA exam is a globally recognized certification that forms a strong base in the career for any finance professional...",
        link: "#"
    },
    {
        image: "/assets/images/vue.jpg",
        title: "Unlock Your Career Potential with IFRS Certification and Courses",
        description: "The world economy is becoming a global village, and companies operate across boundaries. Accordingly, the requirement for a single standard financi...",
        link: "#"
    }
];

const CareerBlogs = () => {
    return (
        <section className="blog2-section pt-2">
          <h2 className="section-title mb-4">Career Blogs</h2>
            <div className="blog2-cards pt-2">
                {blogs.map((blog, index) => (
                    <div key={index} className="blog2-card" data-aos="fade-up" data-aos-delay={index * 150}>
                        <img src={blog.image} alt={blog.title} className="blog2-image" />
                        <div className="blog2-content">
                            <h2>{blog.title}</h2>
                            <p>{blog.description}</p>
                            <a href={blog.link} className="read-more">Read more</a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CareerBlogs;
