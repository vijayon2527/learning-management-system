import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Container, Nav } from "react-bootstrap";
import { BsSearch, BsBag, BsList, BsX, BsBell } from "react-icons/bs";
import "./Header.css";

// STATIC BASE PATH
const STATIC_BASE = process.env.REACT_APP_STATIC_URL || process.env.PUBLIC_URL || "";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeKey, setActiveKey] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [showLearningDropdown, setShowLearningDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [learningCourses, setLearningCourses] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  window.addEventListener("close-login", handleLoginSuccess);

  return () => {
    window.removeEventListener("close-login", handleLoginSuccess);
  };
}, []);


  // Use STATIC_BASE for user avatar
  const user = { avatar: `${STATIC_BASE}/assets/images/avatars/1.jpg` };

  const handleLoginClick = () => {
    navigate('/login') // Correct way
  }

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authTokens");
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    if (showLearningDropdown) {
      const rw = localStorage.getItem("recentlyWatched");
      if (rw) setRecentlyWatched(JSON.parse(rw));

      const lc = localStorage.getItem("learningCourses");
      if (lc) setLearningCourses(JSON.parse(lc));
    }
  }, [showLearningDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("authTokens");
    setIsLoggedIn(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const profile = document.querySelector(".profile-wrapper");
      const learning = document.querySelector(".my-learning-dropdown-wrapper");
      if (profile && !profile.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (learning && !learning.contains(e.target)) {
        setShowLearningDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const shouldBlockScroll = showMobileMenu || showSearch || showCart;
    document.body.classList.toggle("no-scroll", shouldBlockScroll);
  }, [showMobileMenu, showSearch, showCart]);

  const toggleAccordion = (key) => setActiveKey((prev) => (prev === key ? "" : key));
  const closeMenu = () => setShowMobileMenu(false);
  const toggleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);
  const toggleSearch = () => setShowSearch((prev) => !prev);
  const toggleCart = () => setShowCart((prev) => !prev);

  const navItems = [
    {
      key: "categories",
      title: "Categories",
      path: "/categories",
      links: [
        { to: "/categories/aws", label: "AWS" },
        { to: "/categories/devops", label: "DevOps" },
      ],
    },
    {
      key: "trainings",
      title: "Upcoming Trainings",
      path: "/trainings",
      links: [
        { to: "/trainings/online", label: "Online" },
        { to: "/trainings/offline", label: "Offline" },
      ],
    },
    {
      key: "blogs",
      title: "Career Blogs",
      path: "/blog",
      links: [
        { to: "/blogs/interview", label: "Interview Tips" },
        { to: "/blogs/resume", label: "Resume Tips" },
      ],
    },
  ];

  return (
    <>
      <div className={`header-wrapper ${showSearch ? "search-active" : ""}`}>
        <div className="sticky-top">
          <Container className="my-2 py-2 d-flex justify-content-between align-items-center">
            <div className="mobile-toggler">
              <BsList className="menu-icon" onClick={() => setShowMobileMenu(true)} />
            </div>
            <div className={`backdrop ${showMobileMenu ? "show" : ""}`} onClick={closeMenu}></div>
            <div className={`mobile-menu-drawer ${showMobileMenu ? "open" : ""}`}>
              <div style={{ textAlign: "left" }}>
                <button
                  className="nav-item"
                  onClick={closeMenu}
                  style={{ border: "none", background: "none", fontSize: "2rem" }}
                >
                  <BsX />
                </button>
              </div>
              <NavLink to="/" className="nav-item" onClick={closeMenu}>
                Home
              </NavLink>
              <div className="accordion" id="mobileAccordion">
                {navItems.map(({ key, title, links }) => (
                  <div className="accordion-item" key={key}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeKey !== key ? "collapsed" : ""}`}
                        type="button"
                        onClick={() => toggleAccordion(key)}
                      >
                        {title}
                        <span className={`toggle-icon ${activeKey === key ? "rotated" : ""}`}>
                          {activeKey === key ? "−" : "+"}
                        </span>
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${activeKey === key ? "show" : ""}`}>
                      <div className="accordion-body d-flex flex-column">
                        {links.map(({ to, label }) => (
                          <NavLink key={label} to={to} className="accordion-button" onClick={closeMenu}>
                            {label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <NavLink to="/program" className="nav-item" onClick={closeMenu}>
                Affiliate Program
              </NavLink>
              <NavLink to="/webinar" className="nav-item" onClick={closeMenu}>
                Webinar
              </NavLink>
            </div>

            <div className="text-center w-100">
              {/* STATIC LOGO */}
              <img src={`${STATIC_BASE}/assets/images/AGP-LOGO.png`} alt="Logo" height="50" />
            </div>
            <div className="d-flex gap-3 align-items-center">
              <BsSearch role="button" className="nav-icon" onClick={toggleSearch} />
              <BsBag role="button" className="fs-4" onClick={toggleCart} />
              {!isLoggedIn && (
             <button
              className="btn btn-sm"
              style={{ backgroundColor: "#ff5722", color: "#fff", border: "none" }}
              onClick={() => window.dispatchEvent(new CustomEvent("show-login"))}
            >
              Login
            </button>

              )}
            </div>
          </Container>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center position-relative nav-desktop-wrapper">
            <Nav className="justify-content-center nav-link-container position-absolute start-50 translate-middle-x">
              <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Home
              </NavLink>
              {navItems.map(({ key, title, links, path }) => (
                <div
                  key={key}
                  className="nav-item nav-dropdown"
                  onMouseEnter={() => setHoveredDropdown(key)}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <NavLink to={path} className="dropdown-nav-link">
                    {title}
                  </NavLink>
                  <div className={`nav-dropdown-menu ${hoveredDropdown === key ? "hovered" : ""}`}>
                    {links.map(({ to, label }) => (
                      <NavLink to={to} className="dropdown-item" key={label}>
                        {label}
                      </NavLink>
                    ))}
                    <div className="dropdown-underline"></div>
                  </div>
                </div>
              ))}
              <NavLink to="/affiliate" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Affiliate Program
              </NavLink>
            </Nav>

            {/* Right-side user section */}
            <div className="ms-auto login-block">
              {isLoggedIn && (
                <>
                {/* My Learning */}
                  <div
                    className="my-learning-dropdown-wrapper"
                    onMouseEnter={() => setShowLearningDropdown(true)}
                    onMouseLeave={() => setShowLearningDropdown(false)}
                  >
                    <span className="ml-btn">My Learning</span>

                    {showLearningDropdown && (
                      <div className="learning-dropdown-menu">
                        <div className="learning-dropdown-content">
                          {/* Recently Watched */}
                          {recentlyWatched.length > 0 &&
                            recentlyWatched.map((item, idx) => (
                              <div
                                className="learning-course-item"
                                key={`rw-${idx}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  if (item.courseSlug && item.sectionId && item.lectureId) {
                                    navigate(`/course-video/${item.courseSlug}/${item.sectionId}/${item.lectureId}`);
                                  } else {
                                    alert("Invalid lecture data.");
                                  }
                                }}
                              >
                                <img src={item.thumbnail} alt={item.title} className="learning-thumbnail" />
                                <div className="learning-details">
                                  <div className="learning-course-title">{item.title}</div>
                                  <div className="text-muted small mb-1">
                                    Watched at: {new Date(item.watchedAt).toLocaleDateString()}
                                  </div>
                                  <div className="progress" style={{ height: "5px", backgroundColor: "#e9ecef" }}>
                                    <div
                                      className="progress-bar"
                                      role="progressbar"
                                      style={{
                                        width: `${Math.floor(item.progress || 0)}%`,
                                        backgroundColor: "#28a745",
                                      }}
                                      aria-valuenow={Math.floor(item.progress || 0)}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          <div className="go-to-learning-wrapper">
                            <button className="go-to-learning-btn" onClick={() => navigate("/my-learning")}>
                              Go to My Learning
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <BsBell className="nav-icon" role="button" title="Notifications" />

                  {/* Profile */}
                  <div className="position-relative profile-wrapper">
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="avatar-img"
                      onClick={toggleProfileDropdown}
                      style={{ cursor: "pointer" }}
                    />
                    {showProfileDropdown && (
                      <ul className="profile-dropdown">
                        <li>
                          <NavLink to="/wishlist" className="dropdown-item">
                            Wishlist
                          </NavLink>
                        </li>
                        <li>
                          <NavLink to="/edit-profile" className="dropdown-item">
                            Edit Profile
                          </NavLink>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>
                            Log Out
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
