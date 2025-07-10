// import React from "react";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const HeroSection = () => {
//   const slides = [
//   {
//     img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1500&q=80",
//     title: "Empower Your Learning",
//     subtitle: "Master new skills with interactive courses.",
//   },
//   {
//     img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1500&q=80",
//     title: "Learn Anytime, Anywhere",
//     subtitle: "Access your learning materials 24/7.",
//   },
//   {
//     img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1500&q=80",
//     title: "Join Our Community",
//     subtitle: "Collaborate with learners around the world.",
//   },
// ];


//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 200,
//     fade: true,
//     autoplay: true,
//     autoplaySpeed: 2000,
//     arrows: false,
//     pauseOnHover: true,
//   };

//   const styles = {
//     heroSection: {
//       position: "relative",
//       width: "100%",
//       height: "500px",
//       overflow: "hidden",
//       fontFamily: "Arial, sans-serif",
//     },
//     slide: {
//       position: "relative",
//       width: "100%",
//       height: "500px",
//     },
//     slideImage: {
//       width: "100%",
//       height: "100%",
//       objectFit: "cover",
//       filter: "brightness(0.5)",
//     },
//     overlay: {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "space-between", // NEW
//       alignItems: "center",
//       textAlign: "center",
//       padding: "40px 20px", // top/bottom padding
//       color: "#fff",
//     },
//     textContent: {
//       marginTop: "40px", // push text down from top
//     },
//     title: {
//       fontSize: "2.8rem",
//       fontWeight: "700",
//       marginBottom: "20px",
//       textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
//     },
//     subtitle: {
//       fontSize: "1.2rem",
//       maxWidth: "700px",
//       textShadow: "1px 1px 6px rgba(9, 9, 9, 0.9)",
//       color: "#fff",
//     },
//     buttonContainer: {
//       marginBottom: "40px", // push button up from bottom
//     },
//     button: {
//       backgroundColor: "#ff7f50",
//       border: "none",
//       color: "#fff",
//       padding: "14px 30px",
//       fontSize: "1.1rem",
//       borderRadius: "6px",
//       cursor: "pointer",
//       transition: "all 0.3s ease",
//       boxShadow: "0 6px 12px rgba(255,127,80,0.6)",
//     },
//   };

//   return (
//     <div style={styles.heroSection}>
//       <Slider {...settings}>
//         {slides.map(({ img, title, subtitle }, index) => (
//           <div key={index} style={styles.slide}>
//             <img src={img} alt={title} style={styles.slideImage} />
//             <div style={styles.overlay}>
//               <div style={styles.textContent}>
//                 <h1 style={styles.title}>{title}</h1>
//                 <p style={styles.subtitle}>{subtitle}</p>
//               </div>
//               <div style={styles.buttonContainer}>
//                 <button
//                   style={styles.button}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = "#ff5722";
//                     e.target.style.boxShadow = "0 8px 16px rgba(255,87,34,0.8)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = "#ff7f50";
//                     e.target.style.boxShadow = "0 6px 12px rgba(255,127,80,0.6)";
//                   }}
//                 >
//                   Explore Courses
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </Slider>
//     </div>
//   );
// };

// export default HeroSection;


import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HeroSection = () => {
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
      title: "Empower Your Learning",
      subtitle: "Master new skills with interactive courses.",
    },
    {
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      title: "Learn Anytime, Anywhere",
      subtitle: "Access your learning materials 24/7.",
    },
    {
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      title: "Join Our Community",
      subtitle: "Collaborate with learners around the world.",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    pauseOnHover: true,
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
    },
    title: {
      fontSize: "3rem",
      fontWeight: "800",
      marginBottom: "1rem",
    },
    subtitle: {
      fontSize: "1.3rem",
      fontWeight: "400",
      maxWidth: "700px",
      margin: "0 auto",
      lineHeight: 1.4,
    },
  };

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



