import React, { useState, useEffect } from "react";
import { FaSignInAlt, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import { ParticlesBackground } from "./ParticlesBackground";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar sesión existente al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }

    // Autocompletar email si viene del registro
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [navigate, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no válido";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({});
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_TOKEN}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error en la autenticación');
        }

        const data = await response.json();
       

        // Guardar token y datos de usuario
        if (formData.rememberMe) {
          localStorage.setItem('authToken', data.access_token);
        } else {
          sessionStorage.setItem('authToken', data.access_token);
        }

        // Guardar datos básicos del usuario
        if (data) {
        const userData = {
        name: data.name,
        email: data.email,
        admin: data.admin
      };         
          sessionStorage.setItem('userData', JSON.stringify(userData));

        }

        // Redirigir al dashboard
        navigate('/dashboard', { replace: true });

      } catch (error) {
        console.error("Error en el login:", error);
        
        let errorMessage = "Error al iniciar sesión";
        if (error.message.includes('credentials') || error.message.includes('Credenciales')) {
          errorMessage = "Email o contraseña incorrectos";
        } else if (error.message.includes('NetworkError')) {
          errorMessage = "Problema de conexión. Verifica tu internet.";
        }

        setErrors({ submit: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Mostrar mensaje de éxito si viene del registro
  const registrationSuccess = location.state?.registrationSuccess;
  const registeredEmail = location.state?.email;

  return (
    <div className="login-container">
      <ParticlesBackground />
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <FaSignInAlt />
          </div>
          <h2>Iniciar sesión</h2>
          <p>Accede a tu cuenta para continuar</p>
          
          {registrationSuccess && (
            <div className="success-message">
              ¡Registro exitoso! Por favor inicia sesión.
              {registeredEmail && <p>Tu email registrado: {registeredEmail}</p>}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          
          <div className={`form-group ${errors.email ? "has-error" : ""}`}>
            <label htmlFor="email">
              <FaEnvelope className="input-icon" /> Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu email"
              autoComplete="username"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className={`form-group ${errors.password ? "has-error" : ""}`}>
            <label htmlFor="password">
              <FaLock className="input-icon" /> Contraseña
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Recordar mi sesión</span>
            </label>
            
            <Link to="/recuperar-contrasena" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
        
        <div className="register-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </div>
        
        <div className="social-login">
          <p>O inicia sesión con:</p>
          <div className="social-buttons">
            <button type="button" className="social-button google">
              Google
            </button>
            <button type="button" className="social-button facebook">
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
