// src/components/HeroSection.jsx
import React, { useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const STATIC_BASE = process.env.REACT_APP_STATIC_URL || process.env.PUBLIC_URL || "";

/* Local image paths relative to STATIC_BASE */
const slides = [
  {
    img: `${STATIC_BASE}/assets/images/hero-3.avif`,
    title: "Empower Your Learning",
    subtitle: "Master new skills with interactive courses.",
  },
  {
    img: `${STATIC_BASE}/assets/images/hero-2.avif`,
    title: "Learn Anytime, Anywhere",
    subtitle: "Access your learning materials 24/7.",
  },
  {
    img: `${STATIC_BASE}/assets/images/hero-1.avif`,
    title: "Join Our Community",
    subtitle: "Collaborate with learners around the world.",
  },
];

const HeroSection = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  const styles = {
    outerWrapper: {
      backgroundColor: "#f9f9f9",
      padding: "20px 10px",
    },
    slideContainer: {
      width: "100%",
      height: "350px",
      position: "relative",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    slideImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
    textOverlay: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#ffffff",
      textAlign: "center",
      textShadow: "2px 2px 6px rgba(0,0,0,0.6)",
      padding: "0 20px",
      width: "100%",
      maxWidth: "90%",
    },
    title: {
      fontSize: "3rem",
      fontWeight: 800,
      marginBottom: "1rem",
    },
    subtitle: {
      fontSize: "1.3rem",
      fontWeight: 400,
      maxWidth: "700px",
      margin: "0 auto",
      lineHeight: 1.4,
    },
  };
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div style={styles.outerWrapper}>
      <Slider {...settings}>
        {slides.map(({ img, title, subtitle }, index) => (
          <div key={index}>
            <div style={styles.slideContainer}>
              <img src={img} alt={title} style={styles.slideImage} />
              <div style={styles.textOverlay}>
                <h1 style={styles.title}>{title}</h1>
                <p style={styles.subtitle}>{subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSection;
