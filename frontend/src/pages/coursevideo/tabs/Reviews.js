import React, { useState, useEffect, useMemo } from "react";
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

/* --------------------------------------------------
 * Normalize API review object to safe shape
 * -------------------------------------------------- */
function normalizeReview(raw) {
  return {
    id: raw.id,
    user: raw.user ?? null, // numeric user id
    first_name: raw.first_name ?? "Anonymous",
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    // backend may send 'text' (serializer source=comment) OR 'comment' (older)
    text: (raw.text ?? raw.comment ?? "").trim(),
    created_at: raw.created_at ?? null,
  };
}

const Reviews = ({ courseId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState("All ratings");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingReviewId, setExistingReviewId] = useState(null);

  /* --------------------------------------------------
   * Fetch reviews whenever course/user/submit changes
   * -------------------------------------------------- */
 useEffect(() => {
  const fetchReviews = async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(
        `/api/courses/reviews/?course=${courseId}`
      );
        // API may return list or paginated {results:[]}
      const rawData = Array.isArray(res.data) 
      ? res.data 
      : res.data.results || [];
      const normalized = rawData.map(normalizeReview);
      setReviews(normalized);

        // detect user review
      const userReview = normalized.find(
        (r) => r.user === currentUser?.id
      );
      if (userReview) {
        setExistingReviewId(userReview.id);
        setRating(userReview.rating);
        setReviewText(userReview.text);
      } else {
        setExistingReviewId(null);
        setRating(0);
        setReviewText("");
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
      if (success) setSuccess(false); // ✅ reset success trigger
    }
  };

  fetchReviews();
}, [courseId, success, currentUser]);

  /* --------------------------------------------------
   * Submit review (create only; server rejects duplicates)
   * -------------------------------------------------- */
  const handleSubmit = async () => {
    if (!rating || !reviewText.trim()) {
      setError("Please provide both rating and review.");
      return;
    }

    setError("");
    setSuccess(false);

    try {
      const res = await axiosInstance.post("/api/courses/reviews/", {
        course: courseId,
        rating,
        text: reviewText, // serializer maps to comment
      });

      // success create (201)
      setExistingReviewId(res.data.id);
      setSuccess(true);
    } catch (err) {
      console.error("Review submit error:", err);

      // Did backend tell us we already reviewed?
      const data = err.response?.data;
      if (err.response?.status === 400 && data?.review) {
        const normalized = normalizeReview(data.review);
        setExistingReviewId(normalized.id);
        setRating(normalized.rating);
        setReviewText(normalized.text);
        setSuccess(true); // show thank-you
      } else {
        setError("Failed to submit review. Try again.");
      }
    }
  };

  /* --------------------------------------------------
   * Filtering + search
   * -------------------------------------------------- */
  const selectedRatingNumber =
    selectedRating === "All ratings" ? null : parseInt(selectedRating, 10);

  const filteredReviews = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return reviews.filter((review) => {
      const reviewTextLower = review.text.toLowerCase();
      const passesRating =
        !selectedRatingNumber || review.rating === selectedRatingNumber;
      const passesSearch = reviewTextLower.includes(q);
      return passesRating && passesSearch;
    });
  }, [reviews, selectedRatingNumber, searchQuery]);

  /* --------------------------------------------------
   * Ratings summary
   * -------------------------------------------------- */
  const ratingsData = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        stars: star,
        count: reviews.filter((r) => r.rating === star).length,
      })),
    [reviews]
  );

  const totalReviews = reviews.length;
  const overallRating = totalReviews
    ? (
        ratingsData.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews
      ).toFixed(1)
    : 0;

  /* --------------------------------------------------
   * Render
   * -------------------------------------------------- */
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
                color={i < Math.floor(overallRating) ? "#199fcc" : "#ddd"}
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
                    <FaStar key={i} color={i < stars ? "#199fcc" : "#ddd"} />
                  ))}
                </div>
                <span className="percentage">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review form: show ONLY if user hasn't reviewed */}
      {!existingReviewId && (
        <>
          <h5 className="fw-bold mt-4">Write a Review</h5>
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <span className="me-2">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  color={(hoverRating || rating) >= star ? "#199fcc" : "#ccc"}
                  style={{ cursor: "pointer", fontSize: "22px" }}
                />
              ))}
            </div>

            <FormControl
              as="textarea"
              rows={3}
              placeholder="Write your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="mb-2"
            />

            {error && <div className="text-danger mb-2">{error}</div>}
            {success && (
              <div className="text-success mb-2">✅ Review submitted!</div>
            )}

            <Button variant="success" onClick={handleSubmit}>
              Submit Review
            </Button>
          </div>
        </>
      )}

      {/* If user already submitted, show info */}
      {existingReviewId && (
        <div className="alert alert-info mt-4" role="alert">
          You’ve already reviewed this course. Thank you!
        </div>
      )}

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
          variant="#199fcc"
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
                      <FaStar key={i} color="#199fcc" />
                    ))}
                  <small className="text-muted ms-2">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : ""}
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
