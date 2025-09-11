import { useEffect, useState } from 'react';
import { FaHeart, FaHome, FaShoppingCart, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import Cart from './shopping_cart/cart';
import useCart from './shopping_cart/useCart';
import ProductCard from './ProductCard';
import './ProductList.css';
import './DonationPage.css';

const categories = ['Todos', 'Comida', 'Ropa', 'Medicamentos', 'Útiles escolares', 'Otros'];
const cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Otra'];
const conditions = ['Nuevo', 'Usado'];

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [selectedCondition, setSelectedCondition] = useState('Todas');
  const [authChecked, setAuthChecked] = useState(false);
  const [addedProducts, setAddedProducts] = useState({});
  const [isClaiming, setIsClaiming] = useState(false);
  const [addingProducts, setAddingProducts] = useState({});
  const [userData, setUserData] = useState(null);

  const { 
    cart, 
    showCart, 
    setShowCart, 
    addToCart, 
    removeFromCart, 
    claimCartItems,
    fetchCart, 
    clearCart,
    isAddingToCart
  } = useCart();

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');

    if (token && storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        fetchCart().then(() => setAuthChecked(true));
      } catch (e) {
        console.error("Error parsing user data:", e);
        handleLogout();
      }
    } else {
      alert("Inicia sesión para ver los productos disponibles.");
      navigate("/");
    }
  }, []);

  useEffect(() => {
    const inCartProducts = {};
    cart.forEach(item => {
      if (item.status === 'pending' && item.donation_id) {
        inCartProducts[item.donation_id] = true;
      }
    });
    setAddedProducts(inCartProducts);
  }, [cart]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setUserData(null);
    setAuthChecked(false);
    navigate('/');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/filteredDonations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar productos');
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      alert('Por favor inicia sesión para añadir al carrito');
      navigate('/login');
      return;
    }
    
    try {
      setAddingProducts(prev => ({ ...prev, [product.id]: true }));
      await addToCart(product);
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
    } finally {
      setAddingProducts(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
    }
  };

  const handleClearCartSuccess = () => {
    setAddedProducts({});
  };

  const handleClaimSuccess = (claimedIds) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => !claimedIds.includes(product.id))
    );
    
    setAddedProducts(prev => {
      const newState = {...prev};
      claimedIds.forEach(id => delete newState[id]);
      return newState;
    });
  };

  const handleClaimItems = async () => {
    setIsClaiming(true);
    try {
      const claimedIds = await claimCartItems();
      handleClaimSuccess(claimedIds);
    } catch (error) {
      console.error('Error claiming items:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesCity = selectedCity === 'Todas' || p.city === selectedCity;
    const matchesCondition = selectedCondition === 'Todas' || p.condition === selectedCondition;
    return matchesCategory && matchesCity && matchesCondition;
  });

  if (loading || !authChecked) {
    return (
      <div className="pl-product-app">
        <div className="loading-container">
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pl-product-app">
      <header className="donation-header">
        <div className="header-overlay">
          <div className="header-content">
            <div className="header-top-bar">
              <div className="header-logo">
                <h1>Donaciones <span>Disponibles</span></h1>
              </div>

              <div className="header-auth">
                {userData ? (
                  <div className="user-profile">
                    <FaUserCircle className="user-icon" />
                    <Link to="/dashboard" className="user-profile-link">
                      <span>{userData.name || "Mi Cuenta"}</span>
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                      <FaSignOutAlt /> Salir
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => navigate('/login')} 
                    className="login-btn"
                  >
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>

            <p>Encuentra lo que necesitas o ayuda a quienes más lo necesitan.</p>

            <div className="header-wave">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
                <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
                <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="donation-main">
        <div className="hero-container">
          <div className="pl-product-layout">
            <div className="pl-category-panel">
              <div className="home-button-container">
                <button onClick={() => navigate('/')} className="home-button">
                  <FaHome className="home-icon" />
                  <span className="home-text">Inicio</span>
                </button>
              </div>

              <div className="cart-button-container">
                <button 
                  onClick={() => {
                    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    if (!token) {
                      alert('Por favor inicia sesión para ver tu carrito');
                      navigate('/login');
                      return;
                    }
                    setShowCart(!showCart);
                  }} 
                  className="cart-button"
                >
                  <FaShoppingCart className="cart-icon" />
                  <span className="cart-text">Carrito</span>
                  {cart.filter(item => item.status === 'pending').length > 0 && (
                    <span className="cart-badge">
                      {cart.filter(item => item.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>

              <div className="pl-filter-group">
                <h3>Categorías</h3>
                <div className="pl-filter-options">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={selectedCategory === cat ? 'active' : ''}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pl-filter-group">
                <h3>Ciudad</h3>
                <div className="pl-filter-options">
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                    <option value="Todas">Todas las ciudades</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pl-filter-group">
                <h3>Condición</h3>
                <div className="pl-filter-options">
                  <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
                    <option value="Todas">Todas las condiciones</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pl-product-panel">
              <div className="pl-product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAdded={addedProducts[product.id]}
                    isAdding={addingProducts[product.id]}
                    isAvailable={product.available}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="donation-footer">
        <div className="footer-content">
          <div className="footer-heart"><FaHeart /></div>
          <p>© {new Date().getFullYear()} Iniciativa Solidaria. Todos los derechos reservados.</p>
          <div className="footer-links">
            <a href="/privacidad">Política de Privacidad</a>
            <a href="/contacto">Contacto</a>
            <a href="/transparencia">Transparencia</a>
          </div>
        </div>
      </footer>

      {showCart && (
        <Cart
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onClaim={handleClaimItems}
          onClearCart={async () => {
            try {
              await clearCart();
              handleClearCartSuccess();
            } catch (error) {
              console.error('Error clearing cart:', error);
            }
          }}
          isClaiming={isClaiming}
        />
      )}
    </div>
  );
}

export default ProductList;