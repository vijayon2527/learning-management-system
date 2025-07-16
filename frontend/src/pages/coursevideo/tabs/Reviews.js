import React, { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownButton,
  InputGroup,
  FormControl,
  Button,
  Spinner,
} from "react-bootstrap";
import {
  FaSearch,
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import axiosInstance from "../../../utils/axiosInstance";
import "./Reviews.css";

const Reviews = ({ courseId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [selectedRating, setSelectedRating] = useState("All ratings");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState(null);

 useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await axiosInstance.get(`/api/courses/reviews/?course=${courseId}`);
      setReviews(res.data);
      console.log("Reviews:", res.data);
      console.log("Current User:", currentUser);

      const userReview = res.data.find((r) => r.user === currentUser?.id);
      if (userReview) {
        setRating(userReview.rating);
        setText(userReview.text);
        setExistingReviewId(userReview.id);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  fetchReviews();
}, [courseId, success, currentUser]);


  const handleSubmit = async () => {
    if (!rating || !text.trim()) {
      setError("Please provide both rating and review.");
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      if (existingReviewId) {
        // Update
        await axiosInstance.put(`/api/courses/reviews/${existingReviewId}/`, {
          course: courseId,
          rating,
          text,
        });
      } else {
        // Create
        const res = await axiosInstance.post("/api/courses/reviews/", {
          course: courseId,
          rating,
          text,
        });
        setExistingReviewId(res.data.id);
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Try again.");
    }
  };

  const selectedRatingNumber =
    selectedRating === "All ratings" ? null : parseInt(selectedRating);
  const filteredReviews = reviews.filter((review) =>
    (!selectedRatingNumber || review.rating === selectedRatingNumber) &&
    review.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ratingsData = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const totalReviews = reviews.length;
  const overallRating = totalReviews
    ? (
        ratingsData.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews
      ).toFixed(1)
    : 0;

  return (
    <div className="rating-container">
      <h2 className="student-feedback">Student Feedback</h2>

      <div className="rating-summary">
        <div className="overall-rating">
          <h1 className="rating-score">{overallRating}</h1>
          <div className="stars">
            {Array.from({ length: 5 }, (_, i) => (
              <FaStar
                key={i}
                color={i < Math.floor(overallRating) ? "orange" : "#ddd"}
              />
            ))}
          </div>
          <p className="rating-label">Course Rating</p>
        </div>

        <div className="rating-bars">
          {ratingsData.map(({ stars, count }) => {
            const percentage = totalReviews
              ? ((count / totalReviews) * 100).toFixed(0)
              : 0;
            return (
              <div key={stars} className="rating-row">
                <div className="bar-container">
                  <div className="bar" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} color={i < stars ? "orange" : "#ddd"} />
                  ))}
                </div>
                <span className="percentage">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <h5 className="fw-bold mt-4">{existingReviewId ? "Update Your Review" : "Write a Review"}</h5>

      <div className="mb-3">
        <div className="d-flex align-items-center mb-2">
          <span className="me-2">Your Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              color={(hoverRating || rating) >= star ? "orange" : "#ccc"}
              style={{ cursor: "pointer", fontSize: "22px" }}
            />
          ))}
        </div>

        <FormControl
          as="textarea"
          rows={3}
          placeholder="Write your review..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mb-2"
        />

        {error && <div className="text-danger mb-2">{error}</div>}
        {success && (
          <div className="text-success mb-2">
            ✅ {existingReviewId ? "Review updated!" : "Review submitted!"}
          </div>
        )}

        <Button variant="success" onClick={handleSubmit}>
          {existingReviewId ? "Update Review" : "Submit Review"}
        </Button>
      </div>

      <h5 className="fw-bold mt-4">Reviews</h5>

      <div className="search-filter">
        <InputGroup className="search-bar">
          <FormControl
            placeholder="Search reviews"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroup.Text>
            <FaSearch className="search-icon" />
          </InputGroup.Text>
        </InputGroup>

        <DropdownButton
          title={selectedRating}
          className="filter-dropdown"
          variant="light"
        >
          <Dropdown.Item onClick={() => setSelectedRating("All ratings")}>
            All ratings
          </Dropdown.Item>
          {[5, 4, 3, 2, 1].map((num) => (
            <Dropdown.Item key={num} onClick={() => setSelectedRating(num)}>
              {num} stars
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>

      {loading ? (
        <Spinner animation="border" className="my-4" />
      ) : filteredReviews.length === 0 ? (
        <p className="text-muted mt-3">No reviews found.</p>
      ) : (
        filteredReviews.slice(0, visibleReviews).map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="user-avatar">
                {review.first_name?.charAt(0) || "U"}
              </div>
              <div>
                <strong>{review.first_name || "Anonymous"}</strong>
                <div>
                  {Array(review.rating)
                    .fill()
                    .map((_, i) => (
                      <FaStar key={i} color="gold" />
                    ))}
                  <small className="text-muted ms-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
            <p className="review-text">{review.text}</p>
            <div className="review-actions">
              <span>Was this helpful?</span>
              <FaThumbsUp className="action-icon" />
              <FaThumbsDown className="action-icon" />
              <a href="#" className="report-link">
                Report
              </a>
            </div>
          </div>
        ))
      )}

      {visibleReviews < filteredReviews.length && (
        <Button
          variant="outline-danger"
          className="view-more-btn"
          onClick={() => setVisibleReviews(visibleReviews + 3)}
        >
          View More
        </Button>
      )}
    </div>
  );
};

export default Reviews;
