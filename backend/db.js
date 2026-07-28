const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'database.json');
const TMP_DB_FILE = path.join('/tmp', 'database.json');

let memoryDbCache = null;

// Ensure data directory exists if writable
try {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem on serverless lambda
}

// Default Seed Data
const defaultData = {
  products: [
    { 
      id: 1, 
      name: "Wireless Noise-Cancelling Headphones", 
      brand: "Sony",
      category: "Electronics > Audio",
      sku: "SON-WH1000XM5-BLK",
      price: 299.99, 
      originalPrice: 349.99, 
      discount: "14% Off",
      stockStatus: "In Stock (120 Units)",
      stockCount: 120,
      inStock: true,
      colors: ["Black", "Silver", "Midnight Blue"],
      sizes: ["One Size"],
      weight: "250 g",
      features: [
        "Industry-leading Noise Cancellation with dual processors",
        "Bluetooth 5.3 multi-point connectivity",
        "30-hour battery life with 3-min quick charging for 3 hours",
        "Crystal clear hands-free calling with 4 beamforming microphones"
      ],
      specifications: {
        "Bluetooth Version": "5.3",
        "Battery Life": "30 Hours",
        "Charging": "USB-C Fast Charging",
        "Driver Size": "30 mm",
        "Frequency Response": "4Hz - 40,000Hz",
        "Impedance": "48 Ohm"
      },
      packageIncludes: ["Sony Headphones", "USB-C Charging Cable", "3.5mm Audio Cable", "Carrying Case", "User Manual"],
      benefits: [
        "Unmatched comfort for long flights and work sessions",
        "Immersive audiophile-grade high-res audio playback",
        "Smart touch controls and wear detection",
        "Ultra-lightweight ergonomic headband design"
      ],
      warranty: "1-Year Manufacturer Warranty",
      rating: "4.8 (1,240 reviews)",
      ratingValue: 4.8,
      customerReviews: [
        { id: 101, username: "John Doe", rating: 5, date: "2026-07-20", comment: "Amazing sound quality and very comfortable! The active noise cancellation cuts out plane engine noise completely." },
        { id: 102, username: "Alice Smith", rating: 5, date: "2026-07-18", comment: "Battery lasts all week with daily commute usage. Very happy with this purchase." },
        { id: 103, username: "Marcus Vance", rating: 4, date: "2026-07-10", comment: "Sleek look and superb sound. Carrying case is top quality as well." }
      ],
      shippingInfo: "Free Express Shipping. Delivery in 3–5 Business Days.",
      returnPolicy: "30-Day Free Returns & Easy Exchanges",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Experience premium sound with advanced noise cancellation and long-lasting battery life, perfect for travel, work, and everyday listening."
    },
    { 
      id: 2, 
      name: "Smart Fitness Watch Ultra", 
      brand: "Apple",
      category: "Electronics > Wearables",
      sku: "APL-WATCH-U2-TIT",
      price: 199.99, 
      originalPrice: 249.99, 
      discount: "20% Off",
      stockStatus: "In Stock (85 Units)",
      stockCount: 85,
      inStock: true,
      colors: ["Titanium", "Midnight Black", "Starlight"],
      sizes: ["44mm", "49mm"],
      weight: "61.3 g",
      features: [
        "Always-On Retina OLED display with 3000 nits peak brightness",
        "Advanced health sensors (ECG, Blood Oxygen, Heart Rate)",
        "Precision Dual-Frequency GPS for accurate route tracking",
        "Water resistance to 100 meters with depth gauge"
      ],
      specifications: {
        "Display": "1.92-inch LTPO OLED",
        "Battery Life": "Up to 36 Hours (72 Hours Low Power)",
        "Water Resistance": "100m (10 ATM)",
        "Connectivity": "GPS + Cellular, Bluetooth 5.3, Wi-Fi",
        "Case Material": "Aerospace-grade Titanium"
      },
      packageIncludes: ["Smart Fitness Watch", "Magnetic Fast Charger to USB-C Cable", "Alpine Loop Strap", "Quick Start Guide"],
      benefits: [
        "Comprehensive daily health and sleep tracking insights",
        "Extreme durability in underwater and mountain environments",
        "Seamless iPhone notification and call synchronization"
      ],
      warranty: "2-Year Manufacturer Warranty",
      rating: "4.7 (890 reviews)",
      ratingValue: 4.7,
      customerReviews: [
        { id: 201, username: "David K.", rating: 5, date: "2026-07-22", comment: "The GPS accuracy is stellar when running marathons! Battery life easily covers 2 days." },
        { id: 202, username: "Sarah L.", rating: 5, date: "2026-07-15", comment: "Love the bright display, easy to read in full sunlight." }
      ],
      shippingInfo: "Free Express Shipping. Delivery in 2–4 Business Days.",
      returnPolicy: "30-Day Money Back Guarantee",
      tag: { text: "Flash Deal", type: "discount" },
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Track your fitness, health metrics, and outdoor adventures with state-of-the-art precision sensors and a rugged titanium enclosure."
    },
    { 
      id: 3, 
      name: "Professional DSLR Camera 4K", 
      brand: "Canon",
      category: "Electronics > Photography",
      sku: "CAN-EOS-R6M2-BODY",
      price: 899.99, 
      originalPrice: 999.99, 
      discount: "10% Off",
      stockStatus: "In Stock (45 Units)",
      stockCount: 45,
      inStock: true,
      colors: ["Matte Black"],
      sizes: ["Standard Body"],
      weight: "670 g",
      features: [
        "24.2 MP Full-Frame CMOS Sensor with DIGIC X Image Processor",
        "4K 60p Uncropped Video Recording",
        "Dual Pixel CMOS AF II with Deep Learning Subject Tracking",
        "In-Body 5-Axis Image Stabilization up to 8 stops"
      ],
      specifications: {
        "Sensor": "24.2MP Full-Frame CMOS",
        "Video": "4K60p 10-Bit 4:2:2",
        "ISO Range": "100 - 102,400",
        "Autofocus": "1053 AF Points",
        "Viewfinder": "0.5-inch 3.69m-Dot OLED EVF"
      },
      packageIncludes: ["Camera Body", "LP-E6NH Battery Pack", "Battery Charger LC-E6", "Neck Strap", "Eyecup ER-SC2"],
      benefits: [
        "Exceptional low-light performance with minimal noise",
        "Cinematic video quality with dual card slot reliability",
        "Ergonomic weather-sealed magnesium alloy chassis"
      ],
      warranty: "1-Year Official Canon Warranty",
      rating: "4.9 (850 reviews)",
      ratingValue: 4.9,
      customerReviews: [
        { id: 301, username: "Michael B.", rating: 5, date: "2026-07-24", comment: "Auto-focus eye tracking is mind-blowing. Perfect for portrait and sports photography!" }
      ],
      shippingInfo: "Free Insured Express Shipping. Delivery in 2–3 Business Days.",
      returnPolicy: "14-Day Hassle-Free Returns",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Capture stunning high-resolution stills and broadcast-quality 4K videos with cutting-edge sensor technology and rapid dual-pixel autofocus."
    },
    { 
      id: 4, 
      name: "Ultralight Laptop Pro 15", 
      brand: "Dell",
      category: "Electronics > Computers",
      sku: "DEL-XPS15-OLED-32G",
      price: 1299.99, 
      originalPrice: 1499.99, 
      discount: "13% Off",
      stockStatus: "In Stock (30 Units)",
      stockCount: 30,
      inStock: true,
      colors: ["Platinum Silver", "Graphite Gray"],
      sizes: ["15.6-inch"],
      weight: "1.86 kg",
      features: [
        "15.6-inch 3.5K OLED Touch Display (3456 x 2160)",
        "Intel Core i7-13700H 14-Core Processor",
        "32GB DDR5 RAM & 1TB NVMe Gen4 SSD",
        "NVIDIA GeForce RTX 4060 8GB GDDR6 Graphics"
      ],
      specifications: {
        "Processor": "Intel Core i7-13700H (up to 5.0 GHz)",
        "RAM": "32GB DDR5 5200MHz",
        "Storage": "1TB M.2 PCIe NVMe SSD",
        "Graphics": "NVIDIA GeForce RTX 4060 8GB",
        "OS": "Windows 11 Pro"
      },
      packageIncludes: ["Ultralight Laptop Pro", "130W USB-C Power Adapter", "USB-C to USB-A/HDMI Dongle", "Documentation"],
      benefits: [
        "Stunning OLED colors with 100% DCI-P3 color gamut",
        "Blazing fast multitasking for developers and content creators",
        "Precision CNC machined aluminum body"
      ],
      warranty: "1-Year Premium Support Onsite",
      rating: "4.9 (420 reviews)",
      ratingValue: 4.9,
      customerReviews: [
        { id: 401, username: "Elena R.", rating: 5, date: "2026-07-21", comment: "Screen is absolutely breathtaking! Compiles code and renders 4K video instantly." }
      ],
      shippingInfo: "Free Next-Day Air Shipping.",
      returnPolicy: "30-Day Free Returns",
      tag: { text: "New", type: "new" },
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Combines sleek ultralight design with extreme performance power, featuring an immersive OLED screen for professionals and creators."
    },
    { 
      id: 5, 
      name: "Minimalist Leather Backpack", 
      brand: "Herschel",
      category: "Fashion > Bags",
      sku: "HER-LEA-BP-TAN",
      price: 89.99, 
      originalPrice: 120.00, 
      discount: "25% Off",
      stockStatus: "In Stock (60 Units)",
      stockCount: 60,
      inStock: true,
      colors: ["Tan Brown", "Midnight Black", "Cognac"],
      sizes: ["20 Liters"],
      weight: "950 g",
      features: [
        "100% Genuine Full-Grain Top-Layer Italian Leather",
        "Dedicated padded sleeve fits up to 16-inch laptops",
        "Water-resistant interior lining with organizational pockets",
        "Ergonomic padded shoulder straps with breathable mesh"
      ],
      specifications: {
        "Material": "Full-Grain Italian Leather",
        "Capacity": "20 Liters",
        "Laptop Sleeve": "Fits up to 16-inch MacBook",
        "Dimensions": "42 cm x 30 cm x 15 cm",
        "Zippers": "YKK Weatherproof Zippers"
      },
      packageIncludes: ["Leather Backpack", "Dust Bag", "Leather Care Balm"],
      benefits: [
        "Timeless classic design that ages gracefully over time",
        "Protects laptop and electronics from rain and impacts",
        "Versatile usage for daily work commute or weekend trips"
      ],
      warranty: "Lifetime Limited Warranty",
      rating: "4.6 (310 reviews)",
      ratingValue: 4.6,
      customerReviews: [
        { id: 501, username: "Chris M.", rating: 5, date: "2026-07-19", comment: "High quality leather smell and craftsmanship! Fits my 15-inch laptop and notebook easily." }
      ],
      shippingInfo: "Free Standard Shipping in 3–5 Days.",
      returnPolicy: "30-Day Return Policy",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Crafted from premium full-grain leather, this backpack offers refined elegance, modern organization, and long-lasting durability for daily travel."
    },
    { 
      id: 6, 
      name: "Designer Polarized Sunglasses", 
      brand: "Ray-Ban",
      category: "Fashion > Eyewear",
      sku: "RAY-WAY-POL-GLD",
      price: 150.00, 
      originalPrice: 200.00, 
      discount: "25% Off",
      stockStatus: "In Stock (95 Units)",
      stockCount: 95,
      inStock: true,
      colors: ["Gold / G-15 Green", "Black / Dark Gray", "Tortoise Shell"],
      sizes: ["52mm Medium"],
      weight: "38 g",
      features: [
        "100% UV400 Protection polarized glass lenses",
        "Lightweight durable acetate and metal alloy frame",
        "Reduces glare from road, water, and outdoor surfaces",
        "Iconic classic Wayfarer shape suitable for all face types"
      ],
      specifications: {
        "Lens Material": "Polarized Crystal Glass",
        "UV Protection": "100% UV400",
        "Lens Width": "52 mm",
        "Bridge Width": "18 mm",
        "Temple Length": "145 mm"
      },
      packageIncludes: ["Designer Sunglasses", "Leather Protective Case", "Microfiber Cleaning Cloth", "Certificate of Authenticity"],
      benefits: [
        "Enhances visual contrast and reduces eye fatigue",
        "Scratch-resistant crystal glass optical clarity",
        "Elevates any casual or formal outfit instantly"
      ],
      warranty: "2-Year Manufacturer Warranty",
      rating: "4.8 (640 reviews)",
      ratingValue: 4.8,
      customerReviews: [
        { id: 601, username: "Hannah W.", rating: 5, date: "2026-07-23", comment: "Classic style! Polarized lenses make driving during sunny afternoons so comfortable." }
      ],
      shippingInfo: "Free Shipping. Delivery in 3–5 Business Days.",
      returnPolicy: "30-Day Free Returns",
      tag: { text: "Global", type: "global" },
      image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Elevate your style with iconic polarized sunglasses featuring 100% UV protection and crystal clear optical glass lenses."
    },
    { 
      id: 7, 
      name: "Classic Merino Wool Trench Coat", 
      brand: "Burberry Select",
      category: "Fashion > Men's Apparel",
      sku: "BUR-WOL-TRN-CAM",
      price: 249.99, 
      originalPrice: 320.00, 
      discount: "22% Off",
      stockStatus: "In Stock (40 Units)",
      stockCount: 40,
      inStock: true,
      colors: ["Camel Beige", "Charcoal Gray", "Midnight Black"],
      sizes: ["S", "M", "L", "XL"],
      weight: "1.2 kg",
      features: [
        "Premium 100% Australian Merino Wool blend for natural warmth",
        "Double-breasted front with classic horn buttons and waist belt",
        "Windproof & water-repellent exterior fabric treatment",
        "Silky satin lining with inner passport security pocket"
      ],
      specifications: {
        "Outer Fabric": "85% Merino Wool, 15% Cashmere",
        "Lining": "100% Viscose Satin",
        "Closure": "Double-breasted Horn Buttons & Belt",
        "Fit": "Tailored Slim Fit",
        "Care Instructions": "Dry Clean Only"
      },
      packageIncludes: ["Merino Wool Trench Coat", "Garment Travel Cover Bag", "Hanger"],
      benefits: [
        "Insulates against cold weather while remaining breathable",
        "Tailored silhouette provides an elegant sophisticated look",
        "Wrinkle-resistant fabric ideal for travel and business trips"
      ],
      warranty: "1-Year Quality Guarantee",
      rating: "4.9 (210 reviews)",
      ratingValue: 4.9,
      customerReviews: [
        { id: 701, username: "Oliver P.", rating: 5, date: "2026-07-21", comment: "Exquisite fabric texture and immaculate stitching. Worth every penny!" }
      ],
      shippingInfo: "Free Premium Express Shipping (2–4 Days).",
      returnPolicy: "30-Day Free Returns & Exchanges",
      tag: { text: "Trending", type: "new" },
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"
      ],
      description: "A timeless staple piece for cold-weather wardrobe elegance, tailored from ultra-soft Merino wool with a modern double-breasted cut."
    },
    { 
      id: 8, 
      name: "Silk Floral Summer Evening Dress", 
      brand: "ZARA Couture",
      category: "Fashion > Women's Apparel",
      sku: "ZAR-SLK-DRS-FLR",
      price: 129.99, 
      originalPrice: 169.99, 
      discount: "24% Off",
      stockStatus: "In Stock (75 Units)",
      stockCount: 75,
      inStock: true,
      colors: ["Floral Cream", "Rose Blush", "Emerald Garden"],
      sizes: ["XS", "S", "M", "L"],
      weight: "320 g",
      features: [
        "100% Pure Mulberry Silk with lightweight flowy drape",
        "Hand-printed botanical floral motif with subtle luster",
        "Adjustable spaghetti straps and concealed side zipper",
        "Breathable double layer lining prevents sheer transparency"
      ],
      specifications: {
        "Material": "100% Mulberry Silk",
        "Lining": "100% Breathable Rayon",
        "Neckline": "Cowl Neckline",
        "Length": "Midi Length (115 cm)",
        "Care": "Hand Wash Cold / Dry Clean"
      },
      packageIncludes: ["Silk Floral Dress", "Silk Care Instructions Guide"],
      benefits: [
        "Ultra-soft hypoallergenic feel on delicate skin",
        "Flattering midi length suitable for summer parties and formal events",
        "Vibrant long-lasting eco-friendly fabric dyes"
      ],
      warranty: "1-Year Fabric Quality Guarantee",
      rating: "4.8 (380 reviews)",
      ratingValue: 4.8,
      customerReviews: [
        { id: 801, username: "Sophia T.", rating: 5, date: "2026-07-25", comment: "Felt like a dream wearing this to a summer wedding! The silk quality is divine." }
      ],
      shippingInfo: "Free Standard Shipping (3–5 Days).",
      returnPolicy: "30-Day Free Returns",
      tag: { text: "Hot Pick", type: "discount" },
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Radiate effortless grace with this 100% Mulberry Silk floral midi dress, featuring a soft cowl neck and delicate hand-printed botanical pattern."
    },
    { 
      id: 9, 
      name: "Vintage Italian Leather Boots", 
      brand: "Gucci Style",
      category: "Fashion > Footwear",
      sku: "GUC-LEA-BOOT-BRN",
      price: 210.00, 
      originalPrice: 280.00, 
      discount: "25% Off",
      stockStatus: "In Stock (50 Units)",
      stockCount: 50,
      inStock: true,
      colors: ["Antique Cognac", "Espresso Black"],
      sizes: ["39", "40", "41", "42", "43", "44"],
      weight: "1.1 kg",
      features: [
        "Hand-burnished Italian calfskin leather upper",
        "Goodyear welted rubber outsole for maximum grip and resoleability",
        "Cushioned memory foam leather insole for all-day walkability",
        "Side YKK zip closure with speed hook lace loops"
      ],
      specifications: {
        "Upper Material": "Hand-burnished Italian Leather",
        "Sole Material": "Durable Anti-slip Goodyear Rubber",
        "Insole": "Memory Foam Leather Footbed",
        "Heel Height": "3.5 cm",
        "Construction": "Goodyear Welted"
      },
      packageIncludes: ["Pair of Italian Leather Boots", "Cotton Shoe Bags", "Extra Waxed Laces"],
      benefits: [
        "Provides supreme ankle support and shock absorption",
        "Weather-resistant leather protects feet in rain and winter",
        "Develops a unique rich patina with age"
      ],
      warranty: "2-Year Craftsmanship Warranty",
      rating: "4.9 (510 reviews)",
      ratingValue: 4.9,
      customerReviews: [
        { id: 901, username: "Daniel H.", rating: 5, date: "2026-07-22", comment: "Outstanding comfort right out of the box! Zero break-in pain." }
      ],
      shippingInfo: "Free Express Shipping (2–4 Days).",
      returnPolicy: "30-Day Free Returns",
      tag: { text: "Luxury", type: "global" },
      image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80",
      images: [
        "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=800&q=80"
      ],
      description: "Handcrafted in Italy from hand-burnished calfskin leather, these Goodyear-welted boots blend rugged durability with refined European luxury."
    }
  ],
  orders: [
    { id: '#ORD-003', customer: 'john_doe', product: 'Wireless Noise-Cancelling Headphones', amount: '$299.99', status: 'Shipped', date: '2026-07-27' },
    { id: '#ORD-002', customer: 'alice_smith', product: 'Smart Fitness Watch', amount: '$199.99', status: 'Processing', date: '2026-07-26' },
    { id: '#ORD-001', customer: 'admin', product: 'Minimalist Leather Backpack', amount: '$89.99', status: 'Delivered', date: '2026-07-25' }
  ],
  storeSettings: {
    storeName: 'GlobalJD',
    email: 'admin@globaljd.com',
    currency: 'USD',
    notifications: true
  },
  users: [
    { username: 'admin', password: 'password', role: 'admin' }
  ],
  wishlists: [],
  coupons: [
    { code: "GLOBAL20", discountPercent: 20, active: true },
    { code: "WELCOME10", discountPercent: 10, active: true }
  ],
  reviews: [
    { id: 1, productId: 1, username: "alice_smith", rating: 5, comment: "Exceptional sound quality and comfortable noise cancelling!", date: "2026-07-25" },
    { id: 2, productId: 2, username: "john_doe", rating: 4, comment: "Great battery life and sleek design.", date: "2026-07-26" }
  ],
  customItems: [
    { id: 1, title: "Summer Global Sale Promo Banner", category: "Marketing", status: "Active" },
    { id: 2, title: "VIP Loyalty Rewards Program", category: "Promotions", status: "Active" }
  ]
};

// Read database from file or memory cache
function readDb() {
  if (memoryDbCache) return memoryDbCache;

  try {
    let targetPath = DB_FILE;
    if (!fs.existsSync(targetPath) && fs.existsSync(TMP_DB_FILE)) {
      targetPath = TMP_DB_FILE;
    }

    if (!fs.existsSync(targetPath)) {
      memoryDbCache = defaultData;
      return defaultData;
    }

    const raw = fs.readFileSync(targetPath, 'utf8');
    const data = JSON.parse(raw);
    
    // Ensure all tables exist
    if (!data.wishlists) data.wishlists = [];
    if (!data.coupons) data.coupons = defaultData.coupons;
    if (!data.reviews) data.reviews = defaultData.reviews;
    if (!data.customItems) data.customItems = defaultData.customItems;

    // Enrich products with default specification fields if missing
    if (data.products && Array.isArray(data.products)) {
      data.products = data.products.map(p => {
        const defaultProd = defaultData.products.find(dp => dp.id === p.id) || defaultData.products[0];
        return {
          ...defaultProd,
          ...p,
          colors: (p.colors && p.colors.length > 0) ? p.colors : defaultProd.colors,
          sizes: (p.sizes && p.sizes.length > 0) ? p.sizes : defaultProd.sizes,
          features: (p.features && p.features.length > 0) ? p.features : defaultProd.features,
          specifications: (p.specifications && Object.keys(p.specifications).length > 0) ? p.specifications : defaultProd.specifications,
          packageIncludes: (p.packageIncludes && p.packageIncludes.length > 0) ? p.packageIncludes : defaultProd.packageIncludes,
          benefits: (p.benefits && p.benefits.length > 0) ? p.benefits : defaultProd.benefits,
          customerReviews: (p.customerReviews && p.customerReviews.length > 0) ? p.customerReviews : defaultProd.customerReviews,
          images: (p.images && p.images.length > 0) ? p.images : (p.image ? [p.image] : defaultProd.images)
        };
      });
    }

    memoryDbCache = data;
    return data;
  } catch (err) {
    console.error("Error reading database file, using fallback", err);
    memoryDbCache = defaultData;
    return defaultData;
  }
}

// Write database to file or memory cache
function saveDb(data) {
  memoryDbCache = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (tmpErr) {
      console.warn("Writing to /tmp failed, using memory cache", tmpErr);
    }
  }
}

module.exports = {
  readDb,
  saveDb
};
