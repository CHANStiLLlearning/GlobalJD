import React from 'react';

const categories = [
  {
    name: "Mobile & Accessories",
    subcategories: ["Smartphones", "Cases & Covers", "Power Banks", "Cables & Chargers", "Screen Protectors", "Holders & Stands"]
  },
  {
    name: "Computers & Office",
    subcategories: ["Laptops", "Desktops", "Monitors", "Keyboards & Mice", "Printers", "Storage Devices"]
  },
  {
    name: "Consumer Electronics",
    subcategories: ["Headphones", "Speakers", "Cameras", "Smartwatches", "Gaming Consoles", "VR Headsets"]
  },
  {
    name: "Home Appliances",
    subcategories: ["Refrigerators", "Washing Machines", "Air Conditioners", "Microwaves", "Vacuum Cleaners"]
  },
  {
    name: "Fashion & Apparel",
    subcategories: ["Men's Clothing", "Women's Clothing", "Dresses", "T-Shirts", "Jeans", "Jackets", "Activewear"]
  },
  {
    name: "Shoes & Bags",
    subcategories: ["Sneakers", "Running Shoes", "Formal Shoes", "Backpacks", "Handbags", "Luggage"]
  },
  {
    name: "Beauty & Health",
    subcategories: ["Makeup", "Skincare", "Haircare", "Fragrances", "Personal Care", "Vitamins & Supplements"]
  },
  {
    name: "Sports & Outdoors",
    subcategories: ["Fitness Equipment", "Cycling", "Camping & Hiking", "Fishing", "Team Sports", "Yoga"]
  },
  {
    name: "Toys & Kids",
    subcategories: ["Action Figures", "Building Blocks", "Dolls", "Remote Control Toys", "Baby Clothing", "Strollers"]
  },
  {
    name: "Automotive",
    subcategories: ["Car Electronics", "Interior Accessories", "Exterior Accessories", "Tools & Equipment", "Motorcycle Parts"]
  }
];

const Hero = () => {
  return (
    <section className="hero-section">
        <div className="container hero-grid">
            <ul className="hero-menu">
                {categories.map((cat, index) => (
                  <li key={index}>
                    <a href="#">{cat.name} <i className="fas fa-chevron-right"></i></a>
                    <div className="hero-submenu">
                      <div className="hero-submenu-item">
                        <h4>Top Categories in {cat.name}</h4>
                        <div className="hero-submenu-links">
                          {cat.subcategories.map((sub, i) => (
                            <a href="#" key={i}>{sub}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>

            <div className="hero-banner">
                <img src="/assets/hero.png" alt="Hero Banner" />
                <div className="hero-overlay">
                    <h2>Global Shopping Festival</h2>
                    <p>Discover premium deals across top international brands.</p>
                </div>
            </div>

            <div className="hero-user">
                <div className="user-avatar">
                    <img src="https://ui-avatars.com/api/?name=Guest+User&background=random" alt="Avatar" style={{width: '100%'}} />
                </div>
                <h3>Welcome to JD Global</h3>
                <p style={{fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px'}}>Enjoy exclusive benefits and authentic products.</p>
                <div className="user-actions">
                    <button className="btn btn-primary">Sign In</button>
                    <button className="btn btn-outline">Join Free</button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Hero;
