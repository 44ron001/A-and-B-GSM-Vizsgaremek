import { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const categories = [
    { kID: 1, kategoriaNev: 'Processzor' },
    { kID: 2, kategoriaNev: 'Videokártya' },
    { kID: 3, kategoriaNev: 'Alaplap' },
    { kID: 4, kategoriaNev: 'RAM' },
    { kID: 5, kategoriaNev: 'Tápegység' }
  ];

  const products = [
    { pID: 1, kID: 1, nev: 'Intel Core i5 12400F', ar: 52000, leiras: '6 mag, 12 szál, LGA1700', kep: 'https://placehold.co/300x300/3b82f6/ffffff?text=i5' },
    { pID: 2, kID: 1, nev: 'AMD Ryzen 5 5600X', ar: 72000, leiras: '6 mag, 12 szál, AM4', kep: 'https://placehold.co/300x300/ef4444/ffffff?text=Ryzen' },
    { pID: 3, kID: 2, nev: 'NVIDIA RTX 3060 12GB', ar: 160000, leiras: '12GB GDDR6, PCIe 4.0', kep: 'https://placehold.co/300x300/10b981/ffffff?text=RTX' },
    { pID: 4, kID: 4, nev: 'Kingston Fury 16GB DDR4', ar: 18000, leiras: 'Gaming RAM 3200MHz', kep: 'https://placehold.co/300x300/8b5cf6/ffffff?text=RAM' },
    { pID: 5, kID: 5, nev: 'Cooler Master 650W', ar: 24000, leiras: 'Megbízható tápegység', kep: 'https://placehold.co/300x300/f59e0b/ffffff?text=PSU' }
  ];

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.pID === product.pID);
    if (existing) {
      setCart(cart.map(item => 
        item.pID === product.pID 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (pID) => {
    setCart(cart.filter(item => item.pID !== pID));
  };

  const updateQuantity = (pID, quantity) => {
    if (quantity <= 0) {
      removeFromCart(pID);
    } else {
      setCart(cart.map(item =>
        item.pID === pID ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.ar * item.quantity), 0);
  };

  const handleLogin = (email, password) => {
    const mockUser = { userID: 1, nev: 'Kiss Péter', email };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCart([]);
  };

  const Header = () => (
    <header class='header'>
      <div class='headerContent'>
        <div class='logo' onClick={() => setCurrentPage('home')}>
          A&B GSM
        </div>

        <nav class='nav'>
          {categories.map(cat => (
            <button
              key={cat.kID}
              class='navButton'
              onClick={() => {
                setSelectedCategory(cat.kID);
                setCurrentPage('category');
              }}
            >
              {cat.kategoriaNev}
            </button>
          ))}
        </nav>

        <div class='headerButtons'>
          <button
            onClick={() => setCurrentPage('cart')}
            class='cartButton'
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span class='cartBadge'>
                {cart.length}
              </span>
            )}
          </button>

          {user ? (
            <button onClick={handleLogout} class='navButton'>
              Kilépés
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} class='navButton'>
              <User size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const Footer = () => (
    <footer class='footer'>
      <div class='footerContent'>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>A&B GSM</h3>
          <p style={{ color: '#9ca3af' }}>Számítástechnikai alkatrészek szakértője</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Kapcsolat</h4>
          <p style={{ color: '#9ca3af' }}>Email: info@abgsm.hu</p>
          <p style={{ color: '#9ca3af' }}>Telefon: +36 1 234 5678</p>
        </div>
        <div>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Információ</h4>
          <p style={{ color: '#9ca3af' }}>ÁSZF</p>
          <p style={{ color: '#9ca3af' }}>Adatvédelem</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #374151', marginTop: '2rem', paddingTop: '1rem', textAlign: 'center', color: '#9ca3af' }}>
        <p>&copy; 2024 A&B GSM. Minden jog fenntartva.</p>
      </div>
    </footer>
  );

  const HomePage = () => (
    <div class='main'>
      <h1 class='title'>Üdvözöljük az A&B GSM webshopban!</h1>
      
      <div class='grid'>
        {categories.map(cat => (
          <div
            key={cat.kID}
            onClick={() => {
              setSelectedCategory(cat.kID);
              setCurrentPage('category');
            }}
            class='categoryCard'
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)';
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#2563eb' }}>
              {cat.kategoriaNev}
            </h3>
            <p style={{ color: '#6b7280' }}>Kattints a termékek megtekintéséhez</p>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Kiemelt termékek</h2>
        <div class='grid'>
          {products.slice(0, 3).map(product => (
            <div
              key={product.pID}
              onClick={() => {
                setSelectedProduct(product);
                setCurrentPage('product');
              }}
              class='productCard'
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <img src={product.kep} alt={product.nev} class='productImage' />
              <div class='productContent'>
                <h3 class='productTitle'>{product.nev}</h3>
                <p class='productDesc'>{product.leiras}</p>
                <p class='productPrice'>{product.ar.toLocaleString()} Ft</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CategoryPage = () => {
    const [sortBy, setSortBy] = useState('name');
    const categoryProducts = products.filter(p => p.kID === selectedCategory);
    const categoryName = categories.find(c => c.kID === selectedCategory)?.kategoriaNev;

    const sortedProducts = [...categoryProducts].sort((a, b) => {
      if (sortBy === 'name') return a.nev.localeCompare(b.nev);
      if (sortBy === 'price-asc') return a.ar - b.ar;
      if (sortBy === 'price-desc') return b.ar - a.ar;
      return 0;
    });

    return (
      <div class='main'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{categoryName}</h1>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            class='select'
          >
            <option value="name">Név szerint</option>
            <option value="price-asc">Ár szerint növekvő</option>
            <option value="price-desc">Ár szerint csökkenő</option>
          </select>
        </div>

        <div class='grid'>
          {sortedProducts.map(product => (
            <div key={product.pID} class='productCard'>
              <img 
                src={product.kep} 
                alt={product.nev} 
                class='productImage'
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentPage('product');
                }}
              />
              <div class='productContent'>
                <h3 class='productTitle'>{product.nev}</h3>
                <p class='productDesc'>{product.leiras}</p>
                <p class='productPrice'>{product.ar.toLocaleString()} Ft</p>
                <button
                  onClick={() => addToCart(product)}
                  class='button'
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  Kosárba
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ProductPage = () => {
    if (!selectedProduct) return null;

    return (
      <div class='main'>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
            <div>
              <img src={selectedProduct.kep} alt={selectedProduct.nev} style={{ width: '100%', borderRadius: '0.5rem' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{selectedProduct.nev}</h1>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '1.5rem' }}>
                {selectedProduct.ar.toLocaleString()} Ft
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Leírás</h2>
                <p style={{ color: '#374151' }}>{selectedProduct.leiras}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Specifikációk</h2>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#374151' }}>
                  <li>Kategória: {categories.find(c => c.kID === selectedProduct.kID)?.kategoriaNev}</li>
                  <li>Termék kód: #{selectedProduct.pID}</li>
                </ul>
              </div>

              <button
                onClick={() => addToCart(selectedProduct)}
				class='button'
                style={{ fontSize: '1.125rem', padding: '1rem' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Kosárba
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartPage = () => (
    <div class='main'>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Kosár</h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>A kosár üres</p>
          <button
            onClick={() => setCurrentPage('home')}
            class='button'
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Vissza a főoldalra
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            {cart.map(item => (
              <div key={item.pID} class='cartItem'>
                <img src={item.kep} alt={item.nev} class='cartImage' />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{item.nev}</h3>
                  <p style={{ color: '#2563eb', fontWeight: 'bold' }}>{item.ar.toLocaleString()} Ft</p>
                </div>
                <div class='quantityControl'>
                  <button
                    onClick={() => updateQuantity(item.pID, item.quantity - 1)}
                    class='quantityButton'
                  >
                    -
                  </button>
                  <span style={{ padding: '0 1rem' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.pID, item.quantity + 1)}
                    class='quantityButton'
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.pID)}
                    class='deleteButton'
                  >
                    Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Összesítő</h2>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Termékek:</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} db</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>Végösszeg:</span>
                <span style={{ color: '#2563eb' }}>{getTotalPrice().toLocaleString()} Ft</span>
              </div>
              <button 
				class='button'
                style={{ backgroundColor: '#16a34a' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              >
                Rendelés leadása
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const LoginModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div class='modal'>
        <div class='modalContent'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Belépés</h2>
            <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          <input
            type="email"
            placeholder="Email cím"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            class='input'
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            class='input'
          />
          <button
            onClick={() => handleLogin(email, password)}
            class='button'
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Belépés
          </button>
        </div>
      </div>
    );
  };

  return (
    <div class='container'>
      <Header />
      
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'category' && <CategoryPage />}
        {currentPage === 'product' && <ProductPage />}
        {currentPage === 'cart' && <CartPage />}
      </main>

      <Footer />

      {showLogin && <LoginModal />}
    </div>
  );
}

export default App;