import React from 'react';

import './HeroSection.css';

import Slider from 'react-slick';


const HeroSection = () => {
  const banners = [
    'assets/images/angular.jpg',
    'assets/images/react.jpg',
    'assets/images/vue.jpg',
  ];

   const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    dots: false,
    fade: true,
    pauseOnHover: false
  };

  return (
    <div className="hero-section" data-aos="fade">
      <Slider {...settings}>
        {banners.map((src, idx) => (
          <div key={idx}>
            <img src={src} alt={`Slide ${idx}`} className="hero-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSection;
