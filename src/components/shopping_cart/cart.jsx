import { useState } from 'react';
import { FaTimes, FaSpinner, FaTrash } from 'react-icons/fa';
import CartItem from './CartItem'; 
import './cart.css';

const Cart = ({ cart, onClose, onRemove, onClaim, onClearCart, isClaiming }) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClaim = async () => {
    try {
      await onClaim();
    } catch (error) {
      console.error('Error claiming items:', error);
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await onClearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert(error.message);
    } finally {
      setIsClearing(false);
    }
  };

  const pendingItems = cart.filter(item => item.status === 'pending');
  const hasItems = cart.length > 0;

  return (
    <div className="cart-modal-overlay">
      <div className="cart-modal">
        <button className="close-cart" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h3>Tu Carrito de Donaciones</h3>
        
        {!hasItems ? (
          <p className="empty-cart">No hay artículos en tu carrito</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <CartItem 
                  key={item._id} 
                  item={item}
                  onRemove={onRemove}
                />
              ))}
            </div>
            
            <div className="cart-actions">
              {hasItems && (
                <button 
                  onClick={handleClearCart}
                  className="clear-cart-button"
                  disabled={isClearing || isClaiming}
                >
                  {isClearing ? (
                    <>
                      <FaSpinner className="spinner" /> Vaciando...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Vaciar Carrito
                    </>
                  )}
                </button>
              )}
              
              {pendingItems.length > 0 && (
                <button 
                  onClick={handleClaim}
                  className="claim-button"
                  disabled={isClaiming || isClearing}
                >
                  {isClaiming ? (
                    <>
                      <FaSpinner className="spinner" /> Reclamando...
                    </>
                  ) : (
                    `Reclamar Donaciones (${pendingItems.length})`
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;