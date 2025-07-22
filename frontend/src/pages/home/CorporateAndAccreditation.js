import React from 'react';
import './CorporateAndAccreditation.css';

const STATIC_BASE = process.env.REACT_APP_STATIC_URL || process.env.PUBLIC_URL || "";


const CorporateAndAccreditation = () => {
    return (
        <div className="corporate-accreditation-wrapper">

            {/* Corporate Training Section */}
            <section className="section corporate-training">
                <div className="content">
                    <h2>Corporate Training Solutions</h2>
                    <p>
                        Unleash the full potential of your workforce with our top Corporate Training Solutions.
                        Our specialized programs provide your team with the know-how, abilities, and resources they need
                        to succeed in today’s cutthroat business environment. We provide a broad choice of courses taught
                        by professionals in the field, ranging from technical workshops and industry-specific certifications
                        to soft skill training and leadership development. Use MindCypress Corporate Training Solutions
                        to make an investment in the development and success of your team. Get in touch with us now to find out more!
                    </p>
                    <a href="#contact" className="get-in-touch-link">Get in touch</a>
                </div>
                <div className="image" data-aos="fade-left">
                    <img
                        src={`${STATIC_BASE}/assets/images/corporate_training.jpg`}
                        alt="Corporate Training"
                    />
                </div>
            </section>

            {/* Global Accreditations Section */}
            <section className="section global-accreditation">
                <div className="image" data-aos="fade-right">
                    <img
                        src={`${STATIC_BASE}/assets/images/global_accreditation.jpg`}
                        alt="Global Accreditations"
                    />
                </div>
                <div className="content">
                    <h2>Global Accreditations</h2>
                    <p>
                        We understand the importance of credibility and recognition when it comes to advancing your career.
                        Leading worldwide organizations have authorized and recognized our courses, guaranteeing that you
                        will obtain the best possible training and certification. Our globally accredited training programs
                        are designed to equip you with the knowledge, skills, and certifications you need to excel in today's
                        competitive job market. Join the thousands of learners around the globe who have relied on MindCypress
                        to help them progress their skills and careers. Take a look at our approved courses now to advance your profession!
                    </p>
                    <a href="#contact" className="get-in-touch-link">Get in touch</a>
                </div>
            </section>
        </div>
    );
};

export default CorporateAndAccreditation;
