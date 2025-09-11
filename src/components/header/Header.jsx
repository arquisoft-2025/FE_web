import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
const API_URL = import.meta.env.VITE_API_TOKEN;
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null); // Nuevo estado para datos de usuario

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const storedUserData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (token && storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setIsLoggedIn(true);
        setUserData(parsedUserData);
      } catch (e) {
        console.error("Error parsing user data:", e);
        handleLogout(); // Limpia datos inválidos
      }
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error en la autenticación");
      }

      // Guardar datos de autenticación
      localStorage.setItem("authToken", data.access_token);
      const userData = {
        name: data.name,
        email: data.email,
        admin: data.admin,
      };
      localStorage.setItem("userData", JSON.stringify(userData));

      // Actualizar estado
      setIsLoggedIn(true);
      setUserData(userData);
      setShowLoginForm(false);
      setCredentials({ email: "", password: "" });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(
        error.message || "Credenciales incorrectas o error del servidor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Limpiar localStorage y sessionStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData"); // por si guardaste allí también

    setIsLoggedIn(false);
    setUserData(null);

    // Opcional: recargar o redireccionar
    window.location.href = "/"; // Redirige al home
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <header className="donation-header">
      <div className="header-overlay">
        <div className="header-content">
          <div className="header-top-bar">
            <div className="header-logo">
              <h1>
                Programa de <span>Solidaridad Comunitaria</span>
              </h1>
            </div>

            <div className="header-auth">
              {isLoggedIn ? (
                <div className="user-profile">
                  <FaUserCircle className="user-icon" />
                  <Link to="/dashboard" className="user-profile-link">                   
                    <span>{userData?.name || "Mi Cuenta"}</span>
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="login-btn"
                >
                  <FaSignInAlt /> Iniciar sesión
                </button>
              )}
            </div>
          </div>

          <p>Transformando vidas a través de la generosidad colectiva</p>

          {showLoginForm && (
            <div
              className="login-modal"
              onClick={() => setShowLoginForm(false)}
            >
              <div
                className="login-form-container"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-login"
                  onClick={() => setShowLoginForm(false)}
                >
                  &times;
                </button>
                <h3>
                  <FaUser /> Iniciar sesión
                </h3>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="submit-login"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Cargando..."
                    ) : (
                      <>
                        <FaSignInAlt /> Ingresar
                      </>
                    )}
                  </button>
                </form>
                <div className="login-links">
                  <a href="/registro">Crear cuenta</a>
                  <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
                </div>
              </div>
            </div>
          )}

          <div className="header-wave">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                fill="currentColor"
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                fill="currentColor"
              ></path>
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
