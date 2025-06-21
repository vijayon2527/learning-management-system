import React from 'react';
import './UpcomingTrainings.css';
import trainingData from '../../data/trainings.json'
import { useNavigate } from 'react-router-dom';

const UpcomingTrainings = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="upcoming-trainings">
                <h2 className="section-title">Upcoming Trainings</h2>
                <div className="training-cards">
                    {trainingData.slice(0, 4).map((item, index) => (
                        <div className="training-card" key={index} data-aos="fade-up" data-aos-delay={index * 150}>
                            <div className="image-wrapper">
                                <img src={item.img} alt={item.title} className="card-img" />
                                <img src={item.img_hover} alt={item.title} className="card-img hover-img" />
                            </div>
                            <div className="card-text">
                                <h5 className="card-title">{item.title}</h5>
                                <p className="card-price">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="view-all-container">
                    <button className="view-all-btn" onClick={() => navigate('/trainings')}>VIEW ALL TRAININGS</button>
                </div>
            </div>
        </>
    );
};

export default UpcomingTrainings;
