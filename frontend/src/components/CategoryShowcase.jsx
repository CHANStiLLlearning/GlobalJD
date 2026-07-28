import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Laptop, Shirt, Flame, Sparkles, Globe, Headphones, Watch, 
  Camera, Smartphone, ShoppingBag, Eye, Footprints, ArrowRight 
} from 'lucide-react';

const categories = [
  {
    id: 'electronics',
    title: 'Electronics Central',
    subtitle: 'Headphones, Laptops, Cameras & Phones',
    icon: <Laptop size={32} color="#0284c7" />,
    link: '/electronics',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    borderColor: '#38bdf8',
    itemCount: '12+ Devices',
    tags: ['Audio', 'Laptops', 'Cameras', 'Smartphones']
  },
  {
    id: 'fashion',
    title: 'Fashion & Apparel',
    subtitle: 'Men, Women, Leather Bags, Boots & Sunglasses',
    icon: <Shirt size={32} color="#d946ef" />,
    link: '/fashion',
    gradient: 'linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)',
    borderColor: '#e879f9',
    itemCount: '15+ Collections',
    tags: ['Apparel', 'Bags', 'Footwear', 'Eyewear']
  },
  {
    id: 'flash-deals',
    title: 'Super Flash Deals',
    subtitle: 'Up to 25% Off Limited Time Price Cuts',
    icon: <Flame size={32} color="#dc2626" />,
    link: '/flash-deals',
    gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
    borderColor: '#f87171',
    itemCount: 'Limited Stock',
    tags: ['Price Cuts', 'Hot Deals', 'Daily Promos']
  },
  {
    id: 'new-arrivals',
    title: 'Fresh New Arrivals',
    subtitle: 'Brand New Drops & Latest Releases',
    icon: <Sparkles size={32} color="#059669" />,
    link: '/new-arrivals',
    gradient: 'linear-gradient(135deg, #dcfce7 0%, #6ee7b7 100%)',
    borderColor: '#34d399',
    itemCount: 'Just Added',
    tags: ['New Release', 'Trending', 'Hot Pick']
  },
  {
    id: 'global-brands',
    title: 'Global Brand Store',
    subtitle: '100% Authentic Sony, Apple, Ray-Ban, Burberry',
    icon: <Globe size={32} color="#d4af37" />,
    link: '/global-brands',
    gradient: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
    borderColor: '#eab308',
    itemCount: 'Official Brands',
    tags: ['Sony', 'Apple', 'Canon', 'Gucci']
  }
];

const subCategoryGrid = [
  { name: "Audio & Headphones", icon: <Headphones size={20} color="#0284c7" />, link: "/electronics", count: "4 Items" },
  { name: "Computers & Laptops", icon: <Laptop size={20} color="#2563eb" />, link: "/electronics", count: "3 Items" },
  { name: "Smart Wearables", icon: <Watch size={20} color="#0d9488" />, link: "/electronics", count: "2 Items" },
  { name: "Cameras & 4K Photo", icon: <Camera size={20} color="#7c3aed" />, link: "/electronics", count: "2 Items" },
  { name: "Smartphones", icon: <Smartphone size={20} color="#4338ca" />, link: "/electronics", count: "3 Items" },
  { name: "Men's Apparel", icon: <Shirt size={20} color="#059669" />, link: "/fashion", count: "5 Items" },
  { name: "Women's Dresses", icon: <Sparkles size={20} color="#db2777" />, link: "/fashion", count: "4 Items" },
  { name: "Bags & Leather", icon: <ShoppingBag size={20} color="#ea580c" />, link: "/fashion", count: "4 Items" },
  { name: "Sunglasses & Glasses", icon: <Eye size={20} color="#ca8a04" />, link: "/fashion", count: "3 Items" },
  { name: "Footwear & Boots", icon: <Footprints size={20} color="#9333ea" />, link: "/fashion", count: "3 Items" }
];

const CategoryShowcase = () => {
  return (
    <section className="category-showcase-section" style={{ padding: '40px 0 20px', background: '#f8fafc' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            EXPLORE CATALOG DEPARTMENTS
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginTop: '8px', marginBottom: '8px' }}>
            Shop By Main Categories
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Browse our full range of authentic consumer electronics, luxury fashion, limited flash deals, and new arrivals.
          </p>
        </div>

        {/* Main Category Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {categories.map(cat => (
            <Link
              to={cat.link}
              key={cat.id}
              style={{
                background: cat.gradient, borderRadius: '16px', border: `1px solid ${cat.borderColor}`,
                padding: '24px', textDecoration: 'none', color: '#0f172a', display: 'flex', flexDirection: 'column',
                justifySpace: 'space-between', minHeight: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.06)' }}>
                    {cat.icon}
                  </div>
                  <span style={{ background: '#ffffff', color: '#334155', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    {cat.itemCount}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  {cat.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', marginBottom: '16px' }}>
                  {cat.subtitle}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: 'auto' }}>
                <span>Explore Category</span> <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>

        {/* Sub-Categories Quick Grid */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--jd-red)" /> All Sub-Category Departments
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {subCategoryGrid.map((sub, idx) => (
              <Link
                key={idx}
                to={sub.link}
                style={{
                  display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '12px',
                  padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9',
                  textDecoration: 'none', color: '#1e293b', transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {sub.icon}
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{sub.name}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>{sub.count}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategoryShowcase;
