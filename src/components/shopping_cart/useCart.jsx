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

  const baseGateway = (import.meta.env.VITE_API_BASE_URL?.replace('/api/v1/donations','') || import.meta.env.VITE_API_BASE_URL?.replace('/api/donations','') || 'http://localhost:8080');

  const fetchCart = async () => {
    try {
      const response = await fetch(`${baseGateway}/api/v1/cart/cart`, {
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
    const response = await fetch(`${baseGateway}/api/v1/cart/cart`, {
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
      const response = await fetch(`${baseGateway}/api/v1/cart/cart/${cartItemId}`, {
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
    const response = await fetch(`${baseGateway}/api/v1/cart/cart/clear-all`, {
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
          `${baseGateway}/api/v1/cart/cart/${item._id}/claim`, 
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