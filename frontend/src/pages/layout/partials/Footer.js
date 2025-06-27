import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaPinterest, FaYoutube, FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-top">
                <div className="row">
                    <div className="col-md-3">
                        <div className="footer-section about">
                            <h4>About AadiGuru Prodigy</h4>
                            <p>
                                AadiGuru Prodigy is a leading skills and knowledge provider for professionals across the globe.
                                Hundreds of professionals have driven their career to success with MindCypress and its
                                competently structured upskilling training programs and courses.
                            </p>
                            <div className="social-icons">
                                <FaFacebookF />
                                <FaInstagram />
                                <FaPinterest />
                                <FaYoutube />
                                <FaLinkedin />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="footer-section">
                            <h4>Blogs</h4>
                            <ul>
                                <li>Information Technology</li>
                                <li>Finance & Accounting</li>
                                <li>Digital Marketing</li>
                                <li>Corporate Training</li>
                                <li>Project Management</li>
                                <li>Quality Management</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="footer-section">
                            <h4>Popular Domains</h4>
                            <ul>
                                <li>Finance & Accounting</li>
                                <li>Information Technology</li>
                                <li>Project Management</li>
                                <li>Quality Management</li>
                                <li>Marketing</li>
                                <li>Business</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="footer-section address">
                            <h4>Address</h4>
                            <p><strong>USA:</strong> 19 Walker Ave STE 201 Pikesville MD 21208</p>
                            <p>Call: <a href="tel:+12069222417">+1-206-922-2417</a></p>
                            <p>For any queries, write to <a href="mailto:support@mindcypress.com">support@agp.com</a></p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-body">
                <div className="footer-middle">
                    <div className="footer-section address">
                        <h4>Address</h4>
                        <p><strong>UAE:</strong> Mindcypress Marketing Management Services LLC<br />
                            Empire Height A, 9th Floor, Business Bay, Dubai</p>
                        <p>Call: <a href="tel:+971501427401">+987654321</a></p>
                        <p>For any queries, write to <a href="mailto:support@mindcypress.com">support@agp.com</a></p>
                    </div>

                    <div className="footer-section site-links">
                        <h4>Site links</h4>
                        <ul>
                            <li>Home</li>
                            <li>Contact Us</li>
                            <li>Refund Policy</li>
                            <li>Terms & Conditions</li>
                            <li>Privacy Policy</li>
                            <li>News</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="d-flex flex-column gap-3">
                        <div className="currency">INDIA (USD $)</div>
                        <div className="copyright">
                            © 2025 AadiGuru Prodigy | All rights reserved.
                        </div>
                    </div>

                    <div className="payment-methods">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                            <path fill="#3F51B5" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"></path><path fill="#FFC107" d="M30 14A10 10 0 1 0 30 34A10 10 0 1 0 30 14Z"></path><path fill="#FF3D00" d="M22.014,30c-0.464-0.617-0.863-1.284-1.176-2h5.325c0.278-0.636,0.496-1.304,0.637-2h-6.598C20.07,25.354,20,24.686,20,24h7c0-0.686-0.07-1.354-0.201-2h-6.598c0.142-0.696,0.359-1.364,0.637-2h5.325c-0.313-0.716-0.711-1.383-1.176-2h-2.973c0.437-0.58,0.93-1.122,1.481-1.595C21.747,14.909,19.481,14,17,14c-5.523,0-10,4.477-10,10s4.477,10,10,10c3.269,0,6.162-1.575,7.986-4H22.014z"></path>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="48" height="48" viewBox="0 0 48 48">
                            <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"></path><path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"></path><path fill="#FFC107" d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
