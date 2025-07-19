import React from 'react';
import Slider from "react-slick";
import './ExploreblogsCompanies.css';

const STATIC_BASE = process.env.REACT_APP_STATIC_URL || process.env.PUBLIC_URL || "";


// Dynamically create logos with correct static base path
const logos = Array.from({ length: 24 }, (_, i) => ({
    src: `${STATIC_BASE}/assets/images/clients/logo${i + 1}.jpg`,
    alt: `Client Logo ${i + 1}`
}));

const ExploreblogsCompanies = () => {
    const settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 6,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            }
        ]
    };

    return (
        <>
            <div className="explore-blogs-banner" data-aos="fade">
                <picture>
                    <source
                        media="(max-width: 639px)"
                        srcSet={`${STATIC_BASE}/assets/images/explore_blogs2.jpg`}
                    />
                    <img
                        src={`${STATIC_BASE}/assets/images/explore_blogs1.jpg`}
                        alt="Explore Blogs"
                        className="explore-banner-img"
                    />
                </picture>
            </div>

            <div className="explore-blogs-companies">
                <h2 className="text-center">Valued Industry Leaders We Have Trained For</h2>
                <Slider {...settings}>
                    {logos.map((logo, index) => (
                        <div key={index} className="company-logo-slide">
                            <img src={logo.src} alt={logo.alt} />
                        </div>
                    ))}
                </Slider>
            </div>
        </>
    );
};

export default ExploreblogsCompanies;
