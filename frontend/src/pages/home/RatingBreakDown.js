import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TopRatingsSlider = ({ reviews }) => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 900,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 700,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const truncateText = (text, maxLength = 80) =>
    text.length > maxLength ? text.substring(0, maxLength) + "…" : text;

  const ReviewCard = ({ review }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        margin: "0 8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "default",
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* User Initial Circle */}
      <div
        style={{
          backgroundColor: "#8d0e69ff",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "1.4rem",
          marginBottom: 12,
          userSelect: "none",
        }}
      >
        {review.user_name ? review.user_name[0].toUpperCase() : "A"}
      </div>

      {/* Username */}
      <div
        style={{
          fontWeight: "600",
          fontSize: "1rem",
          marginBottom: 6,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",
        }}
        title={review.user_name || "Anonymous"}
      >
        {review.user_name || "Anonymous"}
      </div>

      {/* Star Rating */}
      <div style={{ color: "#f7b500", fontSize: "1.1rem", marginBottom: 12 }}>
        {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </div>

      {/* Review Text */}
      <p
        style={{
          fontSize: "0.9rem",
          color: "#333",
          lineHeight: 1.3,
          flexGrow: 1,
          marginBottom: 0,
          maxHeight: 72,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={review.comment}
      >
        {truncateText(review.comment || "No comment provided.")}
      </p>
    </div>
  );

  return (
    <div style={{ padding: "20px 10px", width: "100%" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.8rem",
          fontWeight: "600",
          fontSize: "1.8rem",
        }}
      >
        Top Ratings
      </h2>

      <Slider {...sliderSettings}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </Slider>
    </div>
  );
};

export default TopRatingsSlider;
