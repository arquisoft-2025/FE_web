import { useState, useEffect } from 'react';

// Cache global para las imágenes
const imageCache = new Map();

const AuthImage = ({ filename, alt, ...props }) => {
  const [src, setSrc] = useState('/no_image_available.jpg');
  
  useEffect(() => {
    const loadImage = async () => {
      if (!filename) return;
      
      // Verificar si la imagen ya está en cache
      if (imageCache.has(filename)) {
        setSrc(imageCache.get(filename));
        return;
      }
      
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;
      
      try {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1/donations';
  const base = apiBase.replace('/api/v1/donations', '').replace('/api/donations', '');
        const response = await fetch(`${base}/api/v1/notification/proxy-image/${filename}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          // Almacenar en cache
          imageCache.set(filename, objectUrl);
          setSrc(objectUrl);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };
    
    loadImage();
    
    return () => {
      // No revocar la URL si está en cache
      if (src.startsWith('blob:') && !imageCache.has(filename)) {
        URL.revokeObjectURL(src);
      }
    };
  }, [filename, src]);
  
  return <img src={src} alt={alt} onError={() => setSrc('/no_image_available.jpg')} {...props} />;
};


export const clearImageCache = () => {
  imageCache.forEach(url => URL.revokeObjectURL(url));
  imageCache.clear();
};

export default AuthImage;