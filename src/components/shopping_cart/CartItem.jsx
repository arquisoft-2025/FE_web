import { memo } from 'react';
import AuthImage from '../AuthImage';

const CartItem = memo(({ item, onRemove }) => {
  const extractFilename = (path) => path ? path.split('/').pop() : null;

  return (
    <div className="cart-item">
      <AuthImage 
        filename={extractFilename(item.donation_details?.image_url)}
        alt={item.donation_details?.title || 'Donación'}
      />
      <div className="cart-item-info">
        <h4>{item.donation_details?.title || 'Sin título'}</h4>
        <p>{item.donation_details?.description || 'Sin descripción'}</p>
        <span className="cart-item-status">
          Estado: {item.status === 'pending' ? 'Pendiente' : 'Reclamado'}
        </span>
      </div>
      <button 
        onClick={() => onRemove(item._id)}
        className="remove-item"
      >
        Eliminar
      </button>
    </div>
  );
});

export default CartItem;