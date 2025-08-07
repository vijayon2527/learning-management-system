import React from "react";

const TopRatingsSlider = ({ reviews }) => {
  const truncateText = (text, maxLength = 80) =>
    text.length > maxLength ? text.substring(0, maxLength) + "…" : text;

  const ReviewCard = ({ review }) => (
    <div
      style={{
        flex: "0 0 auto",
        width: 280,
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        marginRight: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "default",
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
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
        {review.first_name || "Anonymous"}
      </div>

      <div style={{ color: "#f7b500", fontSize: "1.1rem", marginBottom: 12 }}>
        {"★".repeat(review.rating)}
        {"☆".repeat(5 - review.rating)}
      </div>

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
        title={review.text}
      >
        {truncateText(review.text || "No comment provided.")}
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

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "thin",
        }}
      >
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default TopRatingsSlider;
