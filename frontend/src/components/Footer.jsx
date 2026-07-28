import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
        <div className="container">
            <div className="footer-grid">
                <div className="footer-col">
                    <h3>Shopping Guide</h3>
                    <ul>
                        <li><a href="#">Registration</a></li>
                        <li><a href="#">How to Make a Purchase</a></li>
                        <li><a href="#">Payment Methods</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h3>Delivery</h3>
                    <ul>
                        <li><a href="#">Dispatch & Delivery</a></li>
                        <li><a href="#">Customs & Duties</a></li>
                        <li><a href="#">Track Your Order</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h3>Customer Service</h3>
                    <ul>
                        <li><a href="#">Return Policy</a></li>
                        <li><a href="#">Refunds</a></li>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Feedback</a></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h3>About JD Global</h3>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Use</a></li>
                        <li><a href="#">Affiliate Program</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>Copyright © 2026 JD.com All Rights Reserved. Premium Shopping Experience.</p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
