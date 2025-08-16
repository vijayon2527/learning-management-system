import React, { useEffect, useState } from "react";
import Header from "../layout/partials/Header";
import Footer from "../layout/partials/Footer";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import "./CategoriesList.css"; 
import { FaImage } from "react-icons/fa"; 

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/api/courses/categories/");
        setCategories(response.data);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <Header />
      <main>
        <div className="upcoming-trainings">
          <h2 className="section-title">Categories</h2>

          {loading && <p>Loading categories...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && categories.length === 0 && (
            <p>No categories available right now.</p>
          )}

          {!loading && !error && categories.length > 0 && (
           <div className="categories-grid">
        {categories.map((cat, index) => (
            <Link
            to={`/categories/${cat.slug}`}
            className="category-card"
            key={cat.id}
            data-aos="fade-up"
            data-aos-delay={index * 150}
            >


        <div className="category-image-wrapper">
        {cat.logo ? (
            <img
            src={cat.logo}
            alt={cat.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
        ) : (
            <div
            style={{
                width: "100%",
                height: "140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #ccc",
                backgroundColor: "#f8f8f8",
                borderRadius: "10px",
            }}
            >
            <FaImage size={24} color="#bbb" />
            </div>
        )}
        </div>

            <div className="category-card-text">
                <h5 className="category-card-title">{cat.name}</h5>
            </div>
            </Link>
        ))}
        </div>

          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesList;
