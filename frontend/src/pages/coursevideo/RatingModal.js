import React, { useState } from 'react';
import { BsStar, BsStarFill, BsX } from 'react-icons/bs';
import './RatingModal.css';

const RatingModal = ({ onClose, onSubmit }) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    const [selectedStar, setSelectedStar] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const ratingLabels = ["Awful", "Poor", "Average", "Good", "Amazing"];

    const handleSubmit = () => {
        setSubmitted(true);
        console.log("Rating submitted:", selectedStar);
        setTimeout(() => {
            if (onSubmit) onSubmit();
        }, 1000);
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}><BsX size={24} /></button>

                <h2>How would you rate this course?</h2>
                

                <div className="rating-label">
                    {hoveredStar > 0
                        ? ratingLabels[hoveredStar - 1]
                        : selectedStar > 0
                            ? ratingLabels[selectedStar - 1]
                            : "Select Rating"}
                </div>

                <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoveredStar || selectedStar);
                        const StarIcon = isFilled ? BsStarFill : BsStar;

                        return (
                            <StarIcon
                                key={star}
                                size={36}
                                className="star-icon"
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setSelectedStar(star)}
                            />
                        );
                    })}
                </div>

                {/* ✅ Show Submit button only if a star is selected and not submitted yet */}
                {selectedStar > 0 && !submitted && (
                    <button className="submit-button" onClick={handleSubmit}>
                        Submit Rating
                    </button>
                )}

                {/* ✅ Feedback after submission */}
                {submitted && (
                    <p className="submitted-text">Thanks for rating!</p>
                )}
            </div>
        </div>
    );
};

export default RatingModal;
