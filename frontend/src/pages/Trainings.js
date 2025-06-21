import React from 'react'
import Header from './layout/partials/Header'
import Footer from './layout/partials/Footer'
import '../pages/home/UpcomingTrainings.css'

import trainingData from '../data/trainings.json'
import RecentlyViewed from './Trainings/RecentlyViewed'
import CareerBlogs from './Trainings/CareerBlogs'

const Trainings = () => {
  return (
    <div>
      <Header />
      <>
        <div className="upcoming-trainings">
          <h2 className="section-title">Upcoming Trainings</h2>
          <div className="training-cards">
            {trainingData.map((item, index) => (
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
        </div>
        <RecentlyViewed />      
        <CareerBlogs /> 

      </>
      <Footer />
    </div>
  )
}

export default Trainings
