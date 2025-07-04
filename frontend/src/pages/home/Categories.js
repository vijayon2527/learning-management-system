import React, { useEffect, useState } from "react";
import "./Categories.css";
import Slider from "react-slick";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import { FaImage, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const Categories = () => {
  const isMobile = useMediaQuery({ maxWidth: 640 });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/api/courses/categories/");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const CustomPrevArrow = ({ onClick }) => (
    <div className="custom-arrow prev-arrow" onClick={onClick} style={{ cursor: "pointer" }}>
      <FaChevronLeft size={20} />
    </div>
  );

  const CustomNextArrow = ({ onClick }) => (
    <div className="custom-arrow next-arrow" onClick={onClick} style={{ cursor: "pointer" }}>
      <FaChevronRight size={20} />
    </div>
  );

  const sliderSettings = isMobile
    ? {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
      }
    : {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 7,
        slidesToScroll: 3,
        arrows: true,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
          {
            breakpoint: 1200,
            settings: { slidesToShow: 5, slidesToScroll: 2 },
          },
          {
            breakpoint: 900,
            settings: { slidesToShow: 4, slidesToScroll: 2 },
          },
          {
            breakpoint: 700,
            settings: { slidesToShow: 3, slidesToScroll: 1 },
          },
        ],
      };

  const CategoryItem = ({ id, name, logo }) => (
    <Link
      to={`/categories/${id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        padding: "0 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt={name}
          style={{
            width: 120,
            height: 80,
            objectFit: "cover",
            marginBottom: "0.5rem",
            borderRadius: 4,
          }}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed #ccc",
            backgroundColor: "#f8f8f8",
            marginBottom: "0.5rem",
            borderRadius: 4,
          }}
        >
          <FaImage size={24} color="#bbb" />
        </div>
      )}
      <div
        style={{
          fontWeight: 500,
          fontSize: "0.9rem",
          color: "#333",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="categories-section text-center py-4">
        <div>Loading categories...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="categories-section text-center py-4 text-muted">
        No categories found.
      </div>
    );
  }

  return (
    <div className="categories-section">
      <h2 className="section-title">Explore Course Categories</h2>

      <Slider {...sliderSettings} className="categories-slider">
        {categories.map((cat) => (
          <CategoryItem key={cat.id} id={cat.id} name={cat.name} logo={cat.logo} />
        ))}
      </Slider>
    </div>
  );
};

export default Categories;
