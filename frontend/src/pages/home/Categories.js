import React from 'react';
import './Categories.css';
import Slider from 'react-slick';
import { useMediaQuery } from 'react-responsive';
import {
    FaLaptopCode, FaBullhorn, FaProjectDiagram,
    FaSearch, FaCalculator, FaBriefcase, FaChartBar, FaBrain,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const categories = [
    { icon: <FaLaptopCode />, label: "Information Technology", color: "#3e4f75" },
    { icon: <FaBullhorn />, label: "Digital Marketing", color: "#009aa7" },
    { icon: <FaProjectDiagram />, label: "Project Management", color: "#993366" },
    { icon: <FaSearch />, label: "Quality Management", color: "#2b7a1b" },
    { icon: <FaCalculator />, label: "Finance & Accounting", color: "#0a8080" },
    { icon: <FaBriefcase />, label: "Business (Misc.)", color: "#15416e" },
    { icon: <FaChartBar />, label: "Agile & Scrum", color: "#b38c00" },
    { icon: <FaBrain />, label: "Business Intelligence", color: "#990000" }
];

const Categories = () => {
    const isMobile = useMediaQuery({ maxWidth: 640 });

    const CustomPrevArrow = ({ onClick }) => (
        <div className="custom-arrow prev-arrow" onClick={onClick}>
            <FaChevronLeft />
        </div>
    );

    const CustomNextArrow = ({ onClick }) => (
        <div className="custom-arrow next-arrow" onClick={onClick}>
            <FaChevronRight />
        </div>
    );

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
    };

    const CategoryItem = ({ icon, label, color }) => (
        <div className="category-wrapper">
            <div className="category-card">
                <div className="icon-wrapper">
                    <div className="icon" style={{ color }}>
                        {React.cloneElement(icon, { className: '' })}
                    </div>
                </div>
            </div>
            <div className="label">{label}</div>
        </div>
    );



    return (
        <div className="categories-section">
            <h2 className="section-title">Explore Course Categories</h2>

            {isMobile ? (
                <Slider {...sliderSettings} className="categories-slider">
                    {categories.map((cat, index) => (
                        <CategoryItem key={index} {...cat} />
                    ))}
                </Slider>
            ) : (
                <div className="categories-grid">
                    {categories.map((cat, index) => (
                        <CategoryItem key={index} {...cat} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Categories;
