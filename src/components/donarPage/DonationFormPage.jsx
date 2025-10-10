import React, { useState, useEffect } from "react";
import {
  FaUpload,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTshirt,
  FaUtensils,
  FaChair,
  FaGamepad,
  FaPlug,
  FaExclamationCircle,
} from "react-icons/fa";
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ParticlesBackground = dynamic(() => import('../loginPage/ParticlesBackground'), { ssr: false });

export default function DonationFormPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Ropa",
    condition: "Usado",
    expiration_date: "",
    city: "",
    address: "",
    image: null,
    name: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const categories = [
    { value: "Ropa", label: "Ropa", icon: <FaTshirt /> },
    { value: "Alimentos", label: "Alimentos", icon: <FaUtensils /> },
    { value: "Muebles", label: "Muebles", icon: <FaChair /> },
    { value: "Juguetes", label: "Juguetes", icon: <FaGamepad /> },
    { value: "Electrodomesticos", label: "Electrodomésticos", icon: <FaPlug /> },
  ];

  const conditions = [
    { value: "Usado", label: "Usado" },
    { value: "En perfecto estado", label: "En perfecto estado" },
    { value: "Usado una vez", label: "Usado una vez" },
    { value: "Nuevo", label: "Nuevo" },
    { value: "Perecedero", label: "Perecedero" },
    { value: "No perecedero", label: "No perecedero" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      router.push('/login');
      return;
    }

    const storedUserData = localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        setFormData((prev) => ({ ...prev, name: parsedUser.name || "", email: parsedUser.email || "" }));
      } catch (e) {
        console.error("Error al parsear userData", e);
      }
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (!formData.image) newErrors.image = 'La imagen es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createDonation = async (donationData) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const form = new FormData();
    form.append('title', donationData.title);
    form.append('description', donationData.description);
    form.append('category', donationData.category);
    form.append('condition', donationData.condition);
    form.append('city', donationData.city);
    form.append('image', donationData.image);
    if (donationData.address) form.append('address', donationData.address);
    if (donationData.expiration_date) form.append('expiration_date', donationData.expiration_date);
    form.append('name', donationData.name);
    form.append('email', donationData.email);

    const apiUrl = process.env.NEXT_PUBLIC_VITE_API_BASE_URL?.replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/api/donations`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Error al procesar la donación');
    }
    return res.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error('Debes iniciar sesión para donar');
      await createDonation(formData);
      setSuccessMessage('🎉 ¡Donación publicada exitosamente!');
      setTimeout(() => { setSuccessMessage(''); router.push('/dashboard'); }, 2500);
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || 'Error al enviar la donación' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="password-container">
      <ParticlesBackground />
      <div className="donation-form-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="donation-form-card">
          <h1 className="form-title">Publicar Donación</h1>

          {successMessage && (
            <div className="modal-overlay"><div className="modal-content"><h2>✅ ¡Éxito!</h2><p>{successMessage}</p></div></div>
          )}

          {errors.submit && (
            <div className="error-message"><FaExclamationCircle /> {errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="donation-form" encType="multipart/form-data">
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="title">Título *</label>
              <input id="title" name="title" value={formData.title} onChange={handleChange} />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
              <label htmlFor="description">Descripción *</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange}>
                  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="condition">Estado *</label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleChange}>
                  {conditions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {formData.category === 'Alimentos' && (
              <div className="form-group">
                <label htmlFor="expiration_date"><FaCalendarAlt /> Fecha de Caducidad</label>
                <input type="date" id="expiration_date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} />
              </div>
            )}

            <div className="form-row">
              <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
                <label htmlFor="city"><FaMapMarkerAlt /> Ciudad *</label>
                <input id="city" name="city" value={formData.city} onChange={handleChange} />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="address">Dirección (opcional)</label>
                <input id="address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>

            <div className={`form-group ${errors.image ? 'has-error' : ''}`}>
              <label htmlFor="image"><FaUpload /> Imagen *</label>
              <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} />
              {previewImage && <img src={previewImage} alt="Vista previa" className="image-preview" />}
              {errors.image && <span className="error-text">{errors.image}</span>}
            </div>

            <button type="submit" className="submit-button" disabled={isSubmitting}>{isSubmitting ? 'Publicando...' : 'Publicar Donación'}</button>
            <button type="button" className="back-button" onClick={() => router.back()}>⬅️ Volver</button>
          </form>
        </div>
      </div>
    </div>
  );
}