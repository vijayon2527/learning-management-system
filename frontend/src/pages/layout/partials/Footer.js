import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaGlobe, FaChevronDown, FaChevronUp, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {

    const [isVisible, setIsVisible] = useState(false);

    // Show button when scrolling down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="footer py-5">
            <div className="container">
                <div className="row">
                    <div className="col-12 col-md-12 text-center text-md-start mb-4">
                        <div className="img-wrapper">
                            <img src="/assets/images/AGP-LOGO.png" alt="AgpLms"/>
                        </div>
                        <p>
                            Agplms education theme, built specifically for the education centers which is dedicated to teaching and involve learners.
                        </p>
                        <div className="social-icons">
                            <Link to="/"> <FaFacebookF size={20} /> </Link>
                            <Link to="/"> <FaTwitter size={20} /> </Link>
                            <Link to="/"> <FaInstagram size={20} /> </Link>
                            <Link to="/"> <FaLinkedinIn size={20} /> </Link>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <h3>Site Links</h3>
                        <ul className="list-unstyled">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/contact">Contact us</Link></li>
                            <li><Link to="/careers">Career</Link></li>
                            <li><Link to="/refund">Refund Policy</Link></li>
                            <li><Link to="/blog">Blogs</Link></li>
                        </ul>
                    </div>
                    <div className="col-6 col-md-3">
                        <h3>Community</h3>
                        <ul className="list-unstyled">
                            <li><Link to="/docs">Documentation</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/forum">Forum</Link></li>
                            <li><Link to="/sitemap">Sitemap</Link></li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-3 mt-3 mt-md-0">
                        <h3>Teaching</h3>
                        <ul className="list-unstyled">
                            <li><Link to="/become-teacher">Become a teacher</Link></li>
                            <li><Link to="/how-to-guide">How to guide</Link></li>
                            <li><Link to="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    <div className="col-6 col-md-3 mt-3 mt-md-0">
                        <h3>Contact</h3>
                        <p className="text-muted"> #2032, 2nd Floor, 18th B Main, 9th Cross, 2nd Phase, J.P Nagar, Bengaluru, Karnataka - 560078</p>
                        <p className="text-muted mb-1">Toll free: +1234 568 963</p>
                        <p className="text-muted small">(9:AM to 8:PM IST)</p>
                        <p className="text-muted">Email: example@gmail.com</p>
                    </div>
                </div>
                
                <hr />
                <div className="row align-items-center text-center text-md-start">
                    <div className="col-md-6 text-muted copy-rights">&copy; 2025 Aadi Guru Prodigy.</div>
                    <div className="col-md-6 bottom-terms-privacy">
                        <Link to="#" className="text-muted ms-3 me-3">Terms of use</Link>
                        <Link to="#" className="text-muted">Privacy policy</Link>
                        {isVisible && (
                            <button className="scroll-to-top" onClick={scrollToTop}>
                                <FaArrowUp size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
