import React, { useState } from "react";
import { FaKey, FaArrowLeft, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./RecuperarPasswordPage.css"; 
import { ParticlesBackground } from "../loginPage/ParticlesBackground";

function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email no válido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('http://localhost:5002/recover', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setErrors({ submit: "El usuario no existe" });
          } else {
            setErrors({ submit: data.error || "Error al procesar la solicitud" });
          }
          return;
        }

        // Mostrar mensaje de éxito
        setEmailSent(true);
        setMessage(data.mensaje);
      } catch (error) {
        console.error("Error al recuperar contraseña:", error);
        setErrors({ submit: "Error de conexión. Inténtalo nuevamente." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (emailSent) {
    return (
      <div className="password-container">
        <ParticlesBackground />         
        <div className="password-card">
          <div className="password-success">
            <FaCheckCircle className="success-icon" />
            <h2>¡Correo enviado!</h2>
            <p>
              Hemos enviado una nueva contraseña a <strong>{email}</strong>.
              Por favor revisa tu bandeja de entrada.
            </p>
            <p className="success-note">
              {message} Si no encuentras el correo, revisa tu carpeta de spam.
            </p>
            <div className="success-actions">
              <Link to="/login" className="back-to-login">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-container">
        <ParticlesBackground /> 
      <div className="password-card">
        <Link to="/login" className="back-button">
          <FaArrowLeft /> Volver al login
        </Link>
        
        <div className="password-header">
          <div className="password-icon">
            <FaKey />
          </div>
          <h2>Recuperar contraseña</h2>
          <p>Ingresa tu email para recibir una nueva contraseña</p>
        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          
          <div className={`form-group ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">
              <FaEnvelope className="input-icon" /> Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email registrado"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <button 
            type="submit" 
            className="password-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar nueva contraseña"}
          </button>
        </form>
        
        <div className="password-footer">
          <p>¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPasswordPage;