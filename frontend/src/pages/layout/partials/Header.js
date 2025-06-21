import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { Container, Nav } from "react-bootstrap";
import { BsSearch, BsBag, BsList, BsX } from "react-icons/bs";
import './Header.css';

const Header = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const [activeKey, setActiveKey] = useState('');

    const toggleAccordion = (key) => {
        setActiveKey(prev => (prev === key ? '' : key));
    };

    const closeMenu = () => setShowMobileMenu(false);

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

    const [hoveredDropdown, setHoveredDropdown] = useState(null);

    const [showSearch, setShowSearch] = useState(false);

    const toggleSearch = () => {
        setShowSearch(prev => !prev);
    };

    const [showCart, setShowCart] = useState(false);
    const toggleCart = () => setShowCart(prev => !prev);

    useEffect(() => {
        const shouldBlockScroll = showMobileMenu || showSearch || showCart;
        document.body.classList.toggle("no-scroll", shouldBlockScroll);
    }, [showMobileMenu, showSearch, showCart]);


    return (
        <>
            <div className={`header-wrapper ${showSearch ? 'search-active' : ''}`}>
                <div className="sticky-top bg-white shadow-sm border-bottom">
                    <Container className="my-2 py-2 d-flex justify-content-between align-items-center">
                        <>
                            <div className="mobile-toggler">
                                <BsList className="menu-icon" onClick={() => setShowMobileMenu(true)} />
                            </div>
                            <div
                                className={`backdrop ${showMobileMenu ? 'show' : ''}`}
                                onClick={() => setShowMobileMenu(false)}
                            ></div>

                            <div className={`mobile-menu-drawer ${showMobileMenu ? 'open' : ''}`}>
                                <div style={{ textAlign: 'left' }}>
                                    <button className="nav-item" onClick={() => setShowMobileMenu(false)} style={{ border: 'none', background: 'none', fontSize: '2rem' }}><BsX /></button>
                                </div>

                                <NavLink to="/" className="nav-item" onClick={() => setShowMobileMenu(false)}>Home</NavLink>


                                <div className="accordion" id="mobileAccordion">
                                    {navItems.map(({ key, title, links }) => (
                                        <div className="accordion-item" key={key}>
                                            <h2 className="accordion-header">
                                                <button
                                                    className={`accordion-button ${activeKey !== key ? 'collapsed' : ''}`}
                                                    type="button"
                                                    onClick={() => toggleAccordion(key)}
                                                >
                                                    {title}
                                                    <span className={`toggle-icon ${activeKey === key ? 'rotated' : ''}`}>
                                                        {activeKey === key ? '−' : '+'}
                                                    </span>
                                                </button>
                                            </h2>
                                            <div
                                                className={`accordion-collapse collapse ${activeKey === key ? 'show' : ''}`}
                                            >
                                                <div className="accordion-body d-flex flex-column">
                                                    {links.map(({ to, label }) => (
                                                        <NavLink
                                                            key={label}
                                                            to={to}
                                                            className="accordion-button"
                                                            onClick={closeMenu}
                                                        >
                                                            {label}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>


                                <NavLink to="/program" className="nav-item" onClick={() => setShowMobileMenu(false)}>Affiliate Program</NavLink>
                                <NavLink to="/webinar" className="nav-item" onClick={() => setShowMobileMenu(false)}>Webinar</NavLink>
                            </div>
                        </>


                        <div className="d-none d-md-block" style={{ width: "2rem" }}></div>

                        <div className="text-center w-100">
                            <img src="assets/images/AGP-LOGO.png" alt="Logo" height="50" />
                        </div>

                        <div className="d-flex gap-3 align-items-center">
                            <BsSearch role="button" className="nav-icon" onClick={toggleSearch} />
                            <BsBag role="button" className="fs-4" onClick={toggleCart} />
                        </div>

                    </Container>

                    <Container className="d-none d-lg-block">
                        <Nav className="justify-content-center nav-link-container">
                            <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                Home
                            </NavLink>

                            {/* Dropdowns from accordionItems */}
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
                                    <div className={`nav-dropdown-menu ${hoveredDropdown === key ? 'hovered' : ''}`}>
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
                            <NavLink to="/webinar" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                Webinar
                            </NavLink>
                        </Nav>
                    </Container>
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
