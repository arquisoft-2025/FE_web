// src/components/SecureImage.jsx
import React, { useEffect, useState } from "react";

function SecureImage({ imageUrl, alt, className }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    const fetchImage = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${imageUrl}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Error al cargar la imagen");
        const blob = await response.blob();
        const imageObjectURL = URL.createObjectURL(blob);
        setSrc(imageObjectURL);
      } catch (error) {
        console.error("Error al obtener imagen:", error);
        setSrc(null);
      }
    };

    if (imageUrl) fetchImage();
  }, [imageUrl]);

  return src ? (
    <img src={src} alt={alt} className={className} />
  ) : (
    <div className="image-placeholder">Imagen no disponible</div>
  );
}

export default SecureImage;
