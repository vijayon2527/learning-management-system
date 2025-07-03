import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { Container, Nav } from "react-bootstrap";
import { BsSearch, BsBag, BsList, BsX, BsBell } from "react-icons/bs";
import './Header.css';

const Header = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [activeKey, setActiveKey] = useState('');
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [hoveredDropdown, setHoveredDropdown] = useState(null);
    const [showLearningDropdown, setShowLearningDropdown] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showCart, setShowCart] = useState(false);

    const toggleAccordion = (key) => setActiveKey(prev => (prev === key ? '' : key));
    const closeMenu = () => setShowMobileMenu(false);
    const toggleProfileDropdown = () => setShowProfileDropdown(prev => !prev);
    const toggleSearch = () => setShowSearch(prev => !prev);
    const toggleCart = () => setShowCart(prev => !prev);

    const isLoggedIn = true;
    const user = { avatar: '/assets/images/avatars/1.jpg' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            const profile = document.querySelector('.profile-wrapper');
            const learning = document.querySelector('.my-learning-dropdown-wrapper');
            if (profile && !profile.contains(e.target)) {
                setShowProfileDropdown(false);
            }
            if (learning && !learning.contains(e.target)) {
                setShowLearningDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const shouldBlockScroll = showMobileMenu || showSearch || showCart;
        document.body.classList.toggle("no-scroll", shouldBlockScroll);
    }, [showMobileMenu, showSearch, showCart]);

    const navItems = [
        {
            key: 'categories',
            title: 'Categories',
            path: '/categories',
            links: [
                { to: '/categories/aws', label: 'AWS' },
                { to: '/categories/devops', label: 'DevOps' },
            ],
        },
        {
            key: 'trainings',
            title: 'Upcoming Trainings',
            path: '/trainings',
            links: [
                { to: '/trainings/online', label: 'Online' },
                { to: '/trainings/offline', label: 'Offline' },
            ],
        },
        {
            key: 'blogs',
            title: 'Career Blogs',
            path: '/blog',
            links: [
                { to: '/blogs/interview', label: 'Interview Tips' },
                { to: '/blogs/resume', label: 'Resume Tips' },
            ],
        },
    ];

    const learningCourses = [
        {
            title: "Beginner Full Stack Web Development: HTML, CSS, React & Node",
            img: "/assets/images/courses/fullstack.jpg",
            progress: 80
        },
        {
            title: "Penetration Testing Fundamentals: A Beginner's Guide",
            img: "/assets/images/courses/pentest.jpg",
            progress: 10
        },
        {
            title: "Prompt Engineering Principles: ChatGPT & DALL·E",
            img: "/assets/images/courses/prompt.jpg",
            progress: 30
        },
        {
            title: "XR UX Foundations: Immersion and Presence",
            img: "/assets/images/courses/xr.jpg",
            progress: 5
        }
    ];

    return (
        <>
            <div className={`header-wrapper ${showSearch ? 'search-active' : ''}`}>
                <div className="sticky-top">
                    <Container className="my-2 py-2 d-flex justify-content-between align-items-center">
                        <>
                            <div className="mobile-toggler">
                                <BsList className="menu-icon" onClick={() => setShowMobileMenu(true)} />
                            </div>
                            <div className={`backdrop ${showMobileMenu ? 'show' : ''}`} onClick={closeMenu}></div>
                            <div className={`mobile-menu-drawer ${showMobileMenu ? 'open' : ''}`}>
                                <div style={{ textAlign: 'left' }}>
                                    <button className="nav-item" onClick={closeMenu} style={{ border: 'none', background: 'none', fontSize: '2rem' }}><BsX /></button>
                                </div>
                                <NavLink to="/" className="nav-item" onClick={closeMenu}>Home</NavLink>
                                <div className="accordion" id="mobileAccordion">
                                    {navItems.map(({ key, title, links }) => (
                                        <div className="accordion-item" key={key}>
                                            <h2 className="accordion-header">
                                                <button className={`accordion-button ${activeKey !== key ? 'collapsed' : ''}`} type="button" onClick={() => toggleAccordion(key)}>
                                                    {title}<span className={`toggle-icon ${activeKey === key ? 'rotated' : ''}`}>{activeKey === key ? '−' : '+'}</span>
                                                </button>
                                            </h2>
                                            <div className={`accordion-collapse collapse ${activeKey === key ? 'show' : ''}`}>
                                                <div className="accordion-body d-flex flex-column">
                                                    {links.map(({ to, label }) => (
                                                        <NavLink key={label} to={to} className="accordion-button" onClick={closeMenu}>{label}</NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <NavLink to="/program" className="nav-item" onClick={closeMenu}>Affiliate Program</NavLink>
                                <NavLink to="/webinar" className="nav-item" onClick={closeMenu}>Webinar</NavLink>
                            </div>
                        </>
                        <div className="d-none d-md-block" style={{ width: "2rem" }}></div>
                        <div className="text-center w-100">
                            <img src="assets/images/AGP-LOGO.png" alt="Logo" height="50" />
                        </div>
                        <div className="d-flex gap-3 align-items-center">
                            <BsSearch role="button" className="nav-icon" title="Search" onClick={toggleSearch} />
                            <BsBag role="button" className="fs-4" title="Cart" onClick={toggleCart} />
                        </div>
                    </Container>

                    <div className="d-none d-lg-flex align-items-center position-relative nav-desktop-wrapper">
                        <Nav className="justify-content-center nav-link-container position-absolute start-50 translate-middle-x">
                            <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>
                            {navItems.map(({ key, title, links, path }) => (
                                <div key={key} className="nav-item nav-dropdown" onMouseEnter={() => setHoveredDropdown(key)} onMouseLeave={() => setHoveredDropdown(null)}>
                                    <NavLink to={path} className="dropdown-nav-link">{title}</NavLink>
                                    <div className={`nav-dropdown-menu ${hoveredDropdown === key ? 'hovered' : ''}`}>{links.map(({ to, label }) => (<NavLink to={to} className="dropdown-item" key={label}>{label}</NavLink>))}<div className="dropdown-underline"></div></div>
                                </div>
                            ))}
                            <NavLink to="/affiliate" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Affiliate Program</NavLink>
                            <NavLink to="/course-video" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Webinar</NavLink>
                        </Nav>

                        <div className="ms-auto login-block">
                            {isLoggedIn ? (
                                <>
                                    <div className="my-learning-dropdown-wrapper">
                                        <span className="ml-btn" onClick={() => setShowLearningDropdown(prev => !prev)}>My Learning</span>
                                        {showLearningDropdown && (
                                            <div className="learning-dropdown-menu">
                                                <div className="learning-dropdown-content">
                                                    {learningCourses.map((course, idx) => (
                                                        <div className="learning-course-item" key={idx}>
                                                            <img src={course.img} alt={course.title} className="learning-thumbnail" />
                                                            <div className="learning-details">
                                                                <div className="learning-course-title">{course.title}</div>
                                                                <div className="progress-bar-bg">
                                                                    <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="go-to-learning-wrapper">
                                                        <button className="go-to-learning-btn">Go to My Learning</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <BsBell className="nav-icon" role="button" title="Notifications" />
                                    <div className="position-relative profile-wrapper">
                                        <img src={user.avatar || "/assets/images/avatars/1.jpg"} alt="Avatar" title="profile" className="avatar-img" onClick={toggleProfileDropdown} style={{ cursor: "pointer" }} />
                                        {showProfileDropdown && (
                                            <ul className="profile-dropdown">
                                                <li><NavLink to="/profile" className="dropdown-item">My Learning</NavLink></li>
                                                <li><NavLink to="/cart" className="dropdown-item">My Cart</NavLink></li>
                                                <li><NavLink to="/wishlist" className="dropdown-item">Wishlist</NavLink></li>
                                                <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                            </ul>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <NavLink to="/login" className="login-button">Login</NavLink>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showSearch && (
                <div className="search-overlay">
                    <div className="search-container">
                        <BsSearch className="search-icon nav-icon" />
                        <input type="text" placeholder="Search..." className="search-input" autoFocus />
                        <BsX className="close-btn nav-icon" onClick={toggleSearch} />
                    </div>
                </div>
            )}
            {showCart && (
                <>
                    <div className="cart-backdrop" onClick={toggleCart}></div>
                    <div className="cart-drawer">
                        <div className="cart-header">
                            <h3>My Cart</h3>
                            <BsX className="close-btn" onClick={toggleCart} />
                        </div>
                        <div className="cart-content">
                            <p>This cart is empty</p>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Header;
