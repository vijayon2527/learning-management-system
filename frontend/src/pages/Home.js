import React, { useEffect, useState } from "react";
import Header from "./layout/partials/Header";
import HeroSection from "./home/HeroSection";
import Categories from "./home/Categories";
import UpcomingTrainings from "./home/UpcomingTrainings";
import ExploreblogsCompanies from "./home/ExploreblogsCompanies";
import CorporateAndAccreditation from "./home/CorporateAndAccreditation";
import Footer from "./layout/partials/Footer";
import Login from "../views/pages/login/Login";
import StudentRegister from "../components/users/StudentRegister";

function Home() {
  const [modalType, setModalType] = useState(null); // 'login' | 'register' | null
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check token on initial load
    const tokens = localStorage.getItem("authTokens");
    if (tokens) {
      setIsLoggedIn(true);
    }

    const handleShowLogin = () => setModalType("login");
    const handleShowRegister = () => setModalType("register");
    const handleCloseLogin = () => {
      setModalType(null);
      setIsLoggedIn(true); // mark as logged in
    };

    window.addEventListener("show-login", handleShowLogin);
    window.addEventListener("show-register", handleShowRegister);
    window.addEventListener("close-login", handleCloseLogin);

    return () => {
      window.removeEventListener("show-login", handleShowLogin);
      window.removeEventListener("show-register", handleShowRegister);
      window.removeEventListener("close-login", handleCloseLogin);
    };
  }, []);

useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const closeModal = () => setModalType(null);

  return (
    <div>
      {/* Pass login state to Header */}
      <Header isLoggedIn={isLoggedIn} />
      <HeroSection />
      <Categories />
      <UpcomingTrainings />
      <ExploreblogsCompanies />
      <CorporateAndAccreditation />
      <Footer />

      {modalType && (
        <div
          className="login-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px", width: "100%" }}
          >
            {modalType === "login" ? <Login /> : <StudentRegister />}
          </div>
        </div>
      )}
    </div>
  );
}


export default Home;
