import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import { FaImage } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Categories = () => {
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: isMobile ? 3 : 7,
    slidesToScroll: isMobile ? 1 : 3,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    arrows: false,  // <-- arrows removed here
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

  const CategoryItem = ({ slug, name, logo }) => (
    <Link
      to={`/categories/${slug}`}
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
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        Loading categories...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0", color: "#888" }}>
        No categories found.
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 10px" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.8rem",
          fontWeight: "600",
          fontSize: "1.8rem",
        }}
      >
        Explore Course Categories
      </h2>

      <Slider {...sliderSettings}>
        {categories.map((cat) => (
          <CategoryItem key={cat.id} slug={cat.slug} name={cat.name} logo={cat.logo} />
        ))}
      </Slider>
    </div>
  );
};

export default Categories;
