import { memo } from 'react';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import AuthImage from './AuthImage';

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  isAdded, 
  isAdding,
  isAvailable 
}) => {
  const extractFilename = (path) => path ? path.split('/').pop() : null;

  return (
    <div className="pl-product-card">
      <AuthImage 
        filename={extractFilename(product.image_url)}
        alt={product.title}
      />
      <h3>{product.title}</h3>
      <h5>{product.city}</h5>
      <p>{product.description}</p>
      <button 
        onClick={() => onAddToCart(product)}
        className={`add-to-cart-btn ${isAdded ? 'added' : isAdding ? 'adding' : ''}`}
        disabled={!isAvailable || isAdded || isAdding}
      >
        {isAdding ? (
          <>
            <FaShoppingCart /> Añadiendo...
          </>
        ) : isAdded ? (
          <>
            <FaCheck /> Añadido
          </>
        ) : (
          <>
            <FaShoppingCart /> 
            {isAvailable ? 'Añadir' : 'No disponible'}
          </>
        )}
      </button>
    </div>
  );
});

export default ProductCard;