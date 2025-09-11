 import { useState } from 'react';

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken'); 
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5003/cart', {
        method: 'GET',
        headers: getAuthHeader()
      });

      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product) => {
  try {
    const response = await fetch('http://localhost:5003/cart', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        donation_id: product.id,
        notes: ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al añadir al carrito');
    }

    await fetchCart(); // Esto actualizará el estado del carrito
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await fetch(`http://localhost:5003/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };
  const clearCart = async () => {
  try {
    const response = await fetch('http://localhost:5003/cart/clear-all', {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    if (response.ok) {
      setCart([]); // Vaciar el carrito localmente
      return true;
    }
    throw new Error('Error al vaciar el carrito');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

  const claimCartItems = async () => {
    try {
      const claimedIds = [];
      
      for (const item of cart) {
        const response = await fetch(
          `http://localhost:5003/cart/${item._id}/claim`, 
          {
            method: 'POST',
            headers: getAuthHeader()
          }
        );
        
        if (response.ok) {
          claimedIds.push(item.donation_id);
        }
      }
      
      await fetchCart(); // Actualizar el carrito
      alert('El donador ha sido notificado sobre tu interés en el producto');
      return claimedIds; // Devolver los IDs de los productos reclamados
    } catch (error) {
      console.error('Error claiming items:', error);
      throw error;
    }
  };

  return {
    cart,
    showCart,
    setShowCart,
    fetchCart,
    addToCart,
    removeFromCart,
    claimCartItems,
    clearCart,
    isAddingToCart
  };
};

export default useCart;