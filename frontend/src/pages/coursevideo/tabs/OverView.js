import React from 'react'
import { FaRegClock } from "react-icons/fa";
import { BsStarFill, BsGlobe, BsFillCalendarFill } from "react-icons/bs";
import './OverView.css'

const OverView = () => {
    return (
        <div className='course-tab-overview'>
            <div className="course-details">
                <h2 className="course-title">Future-Proof Your Career By Learning Transferrable Skills For Working Professionally With Generative AI</h2>

                <div className="course-stats">
                    <span className="rating">
                        <BsStarFill className="star-icon" /> <strong>4.4</strong> <span className="rating-count">508 ratings</span>
                    </span>
                    <span className="students"><strong>8,038</strong> Students</span>
                    <span className="total-time"><strong>2 hours</strong> Total</span>
                </div>

                <div className="course-meta">
                    <span><BsFillCalendarFill /> Last updated June 2024</span>
                    <span><BsGlobe /> English <span className="language-auto">English [Auto]</span></span>
                </div>

                <div className="reminder">
                    <div className="learning-remainder">
                        <div className="reminder-icon">
                            <FaRegClock size={24} />
                        </div>
                        <div className="reminder-text">
                            <h5>Schedule learning time</h5>
                            <p>Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.</p>
                        </div>
                    </div>

                    <div className="reminder-buttons">
                        <button className="btn btn-outline-warning">Get started</button>
                        <button className="btn btn-light">Dismiss</button>
                    </div>
                </div>

                <div className="course-info">
                    <div><h6>By the numbers</h6></div>
                    <div><strong>Skill level:</strong> All Levels</div>
                    <div><strong>Students:</strong> 8,038</div>
                    <div><strong>Languages:</strong> English</div>
                    <div><strong>Captions:</strong> Yes</div>
                    <div><strong>Lectures:</strong> 23</div>
                    <div><strong>Video:</strong> 2 total hours</div>
                </div>
            </div>
        </div>
    )
}

export default OverView
