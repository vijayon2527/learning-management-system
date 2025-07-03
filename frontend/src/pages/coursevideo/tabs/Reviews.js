import React, { useState } from "react";
import { Dropdown, DropdownButton, InputGroup, FormControl, Card, Button } from "react-bootstrap";
import { FaSearch, FaStar, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import './Reviews.css';

const reviewsData = [
    { id: 1, name: "Lisa S.", rating: 5, date: "a week ago", text: "Very informative! Helped me understand prompt engineering." },
    { id: 2, name: "Thomas T.", rating: 4, date: "2 weeks ago", text: "Great course! Learned a lot." },
    { id: 3, name: "Emily R.", rating: 3, date: "3 weeks ago", text: "It was okay. Some concepts needed more explanation." },
    { id: 4, name: "John D.", rating: 2, date: "a month ago", text: "Not very useful for beginners." },
    { id: 5, name: "Sarah K.", rating: 1, date: "a month ago", text: "Disappointed. The content was outdated." },
    { id: 6, name: "Michael B.", rating: 5, date: "2 months ago", text: "Excellent course!" },
];

const ratingsData = [
    { stars: 5, count: 52 },
    { stars: 4, count: 35 },
    { stars: 3, count: 41 },
    { stars: 2, count: 21 },
    { stars: 1, count: 16 },
];
const totalReviews = ratingsData.reduce((sum, rating) => sum + rating.count, 0);
const overallRating = (
    ratingsData.reduce((sum, rating) => sum + rating.stars * rating.count, 0) / totalReviews
).toFixed(1); 

const Reviews = () => {
    const [selectedRating, setSelectedRating] = useState("All ratings");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleReviews, setVisibleReviews] = useState(3); // Show 3 reviews initially

    const handleFilterChange = (rating) => {
        if (rating === "All ratings") {
            setSelectedRating("All ratings");
        } else {
            setSelectedRating(`${rating} stars`); // Ensure full label is displayed
        }
    };


    const filteredReviews = reviewsData.filter((review) => {
        const selectedRatingNumber = selectedRating === "All ratings" ? null : parseInt(selectedRating);

        return (
            (selectedRatingNumber === null || review.rating === selectedRatingNumber) &&
            review.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });


    return (
        <div className="rating-container">
            <h2 className="student-feedback">Student Feedback</h2>
            <div className="rating-summary">                
                <div className="overall-rating">                
                    <h1 className="rating-score">{overallRating}</h1>
                    <div className="stars">
                        {Array.from({ length: 5 }, (_, i) => (
                            <FaStar key={i} color={i < Math.floor(overallRating) ? "orange" : "#ddd"} />
                        ))}
                    </div>
                    <p className="rating-label">Course Rating</p>
                </div>

                <div className="rating-bars">
                    {ratingsData.map(({ stars, count }) => {
                        const percentage = ((count / totalReviews) * 100).toFixed(0);
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
            <h5 className="fw-bold mt-4">Reviews</h5>
            <div className="search-filter">
                <InputGroup className="search-bar">
                    <FormControl
                        placeholder="Search reviews"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <InputGroup.Text><FaSearch className="search-icon"/></InputGroup.Text>
                </InputGroup>

                <DropdownButton title={selectedRating} className="filter-dropdown" variant="light">
                    <Dropdown.Item onClick={() => handleFilterChange("All ratings")}>All ratings</Dropdown.Item>
                    {[5, 4, 3, 2, 1].map((num) => (
                        <Dropdown.Item key={num} onClick={() => handleFilterChange(num)}>{num} stars</Dropdown.Item>
                    ))}
                </DropdownButton>
            </div>

            {filteredReviews.slice(0, visibleReviews).map(({ id, name, rating, date, text }) => (
                <div key={id} className="review-card">
                    <div className="review-header">
                        <div className="user-avatar">{name.charAt(0)}</div>
                        <div>
                            <strong>{name}</strong>
                            <div>
                                {Array(rating).fill().map((_, i) => <FaStar key={i} color="gold" />)}
                                <small className="text-muted ms-2">{date}</small>
                            </div>
                        </div>
                    </div>
                    <p className="review-text">{text}</p>
                    <div className="review-actions">
                        <span>Was this review helpful?</span>
                        <FaThumbsUp className="action-icon" />
                        <FaThumbsDown className="action-icon" />
                        <a href="#" className="report-link">Report</a>
                    </div>
                </div>
            ))}

            {visibleReviews < filteredReviews.length && (
                <Button variant="outline-danger" className="view-more-btn" onClick={() => setVisibleReviews(visibleReviews + 3)}>
                    View More
                </Button>
            )}
        </div>
    );
};

export default Reviews
