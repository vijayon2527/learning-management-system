import React from 'react'
import './RecentlyViewed.css'
import '../../pages/home/UpcomingTrainings.css'
import trainingData from '../../data/trainings.json'

const RecentlyViewed = () => {
    return (
        <div className="recently-viewed">
            <h2 className="section-title text-center">Recently viewed</h2>

            <div className="recent-cards-scroll">
                <div className="recent-cards-wrapper">
                    {trainingData.slice(0, 3).map((item, index) => (
                        <div className="training-card" key={index}>
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
            </div>
        </div>
    )
}

export default RecentlyViewed
