import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaHandsHelping,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import SecureImage from "./SecureImage";

function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeleteDonation = async (donationId) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!token) {
      alert("No estás autenticado. Por favor inicia sesión nuevamente.");
      navigate("/login");
      return;
    }

    setIsDeletingId(donationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation DeleteDonation($donationId: String!) {
                deleteDonation(donationId: $donationId) {
                  success
                  message
                }
              }
            `,
            variables: {
              donationId: donationId
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        const errorMessage = result.errors[0]?.message || "Error en la mutación GraphQL";
        throw new Error(errorMessage);
      }

      if (result.data?.deleteDonation?.success) {
        setSuccessMessage("🎉 ¡Donación Eliminada exitosamente!");
        setTimeout(() => {
          setSuccessMessage("");
          setDonations((prev) => prev.filter((d) => d.id !== donationId));
        }, 2500);
      } else {
        throw new Error(result.data?.deleteDonation?.message || "Error al eliminar la donación");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert(error.message || "Error desconocido al eliminar la donación");
    } finally {
      setIsDeletingId(null);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const storedUserData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

    console.log("Token:", token);
    console.log("Stored User Data:", storedUserData);

    if (!token) {
      navigate("/login", { state: { from: "/dashboard" } });
      return;
    }

    try {
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      fetchUserDonations(token);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Error al cargar los datos del usuario");
      setIsLoading(false);
    }
  }, [navigate]);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  const fetchUserDonations = async (token) => {
    if (isTokenExpired(token)) {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      throw new Error(
        "Tu sesión ha expirado. Por favor inicia sesión nuevamente"
      );
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // ✅ CORREGIDO: Usar getUserDonations para obtener solo las del usuario
            query: `
              query GetUserDonations {
                getUserDonations {
                  id
                  title
                  description
                  category
                  condition
                  city
                  address
                  imageUrl
                  createdAt
                  expirationDate
                  available
                  auth
                  email
                  name
                }
              }
            `
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        const errorMessage = result.errors[0]?.message || "Error en la consulta GraphQL";
        throw new Error(errorMessage);
      }

      // ✅ CORREGIDO: Usar getUserDonations en lugar de getDonations
      const data = result.data?.getUserDonations || [];
      console.log("User donations fetched via GraphQL:", data);
      
      setDonations(data);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("No se pudieron cargar las donaciones");
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("es-ES", options);
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // ✅ CORREGIDO: Función para manejar el campo available en lugar de status
  const getAvailabilityBadge = (available) => {
    return (
      <span className={`badge ${available ? "badge-success" : "badge-warning"}`}>
        {available ? "Disponible" : "No disponible"}
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="user-profile">
          <div className="profile-header">
            <FaUserCircle className="user-avatar" />
            <div className="user-info">
              <h3 className="user-name">{userData?.name || "Usuario"}</h3>
              <p className="user-email">{userData?.email || ""}</p>
            </div>
          </div>
          <hr className="divider" />
        </div>

        <nav className="dashboard-nav">
          <Link to="/" className="nav-item">
            <FaHome /> Inicio
          </Link>
          <Link to="/dashboard" className="nav-item active">
            <FaBoxOpen /> Mis Donaciones
          </Link>
          <Link to="/donar" className="nav-item">
            <FaHandsHelping /> Donar
          </Link>
          <Link to="/donation-history" className="nav-item">
            <FaHistory /> Historial
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        {successMessage && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>✅ ¡Éxito!</h2>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
        
        <h1 className="dashboard-title">Mis Donaciones</h1>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando tus donaciones...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Reintentar
            </button>
          </div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <FaBoxOpen className="empty-icon" />
            <h3>Aún no has realizado donaciones</h3>
            <Link to="/donar" className="donate-btn">
              Realizar mi primera donación
            </Link>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation.id} className="donation-card">
                {/* ✅ CORREGIDO: Usar imageUrl en lugar de image_url */}
                {donation.imageUrl && (
                  <div className="donation-image">
                    <SecureImage
                      imageUrl={`/api${donation.imageUrl}`}
                      alt={donation.title}
                      className="donation-thumbnail"
                    />
                  </div>
                )}

                <div className="donation-details">
                  <div className="detail-item">
                    <span className="detail-label">Id de Donación:</span>
                    <span>{donation.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Título:</span>
                    <span>{donation.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Descripción:</span>
                    <span>{donation.description}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Categoría:</span>
                    <span>{donation.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Condición:</span>
                    <span>{donation.condition}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ciudad:</span>
                    <span>{donation.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dirección:</span>
                    <span>{donation.address || "No especificada"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha:</span>
                    {/* ✅ CORREGIDO: Usar createdAt en lugar de created_at */}
                    <span>{formatDate(donation.createdAt)}</span>
                  </div>
                  {/* ✅ CORREGIDO: Mostrar disponibilidad en lugar de status */}
                  <div className="detail-item">
                    <span className="detail-label">Estado:</span>
                    {getAvailabilityBadge(donation.available)}
                  </div>
                </div>

                <div className="donation-actions">
                  <Link
                    to={`/donation/${donation.id}`}
                    className="action-btn details-btn"
                  >
                    <span>Ver detalles</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteDonation(donation.id)}
                    className="action-btn delete-btn"
                    disabled={isDeletingId === donation.id}
                  >
                    {isDeletingId === donation.id ? (
                      <>
                        <span className="spinner"></span> Eliminando...
                      </>
                    ) : (
                      <span>Eliminar</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
/* import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaHandsHelping,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import SecureImage from "./SecureImage";

function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

const handleDeleteDonation = async (donationId) => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  
  if (!token) {
    alert("No estás autenticado. Por favor inicia sesión nuevamente.");
    navigate("/login");
    return;
  }

  // Set loading state for this specific donation
  setIsDeletingId(donationId);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/donations/${donationId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 
        `Error al eliminar la donación (${response.status})`
      );
    }

    setSuccessMessage("🎉 ¡Donación Eliminada exitosamente!");
     setTimeout(() => {
        setSuccessMessage("");
        window.location.reload();
      }, 2500);

    // Success - remove from state
    setDonations((prev) => prev.filter((d) => d.id !== donationId));
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert(error.message || "Error desconocido al eliminar la donación");
  } finally {
    // Reset loading state
    setIsDeletingId(null);
  }
};


  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const storedUserData =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");

      console.log("Token:", token);
      console.log("Stored User Data:", storedUserData);

    if (!token) {
      navigate("/login", { state: { from: "/dashboard" } });
      return;
    }

    try {
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
      fetchUserDonations(token);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("Error al cargar los datos del usuario");
      setIsLoading(false);
    }
  }, [navigate]);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  const fetchUserDonations = async (token) => {
    if (isTokenExpired(token)) {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      throw new Error(
        "Tu sesión ha expirado. Por favor inicia sesión nuevamente"
      );
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/donations/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener las donaciones");
      }

      const data = await response.json();
      console.log("Donations fetched:", data);
      setDonations(data || []);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setError("No se pudieron cargar las donaciones");
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pendiente: "badge-warning",
      completado: "badge-success",
      cancelado: "badge-danger",
      en_proceso: "badge-info",
    };

    const statusText = {
      pendiente: "Pendiente",
      completado: "Completado",
      cancelado: "Cancelado",
      en_proceso: "En proceso",
    };

    return (
      <span className={`badge ${statusClasses[status] || "badge-secondary"}`}>
        {statusText[status] || status}
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="user-profile">
          <div className="profile-header">
            <FaUserCircle className="user-avatar" />
            <div className="user-info">
              <h3 className="user-name">{userData?.name || "Usuario"}</h3>
              <p className="user-email">{userData?.email || ""}</p>
            </div>
          </div>
          <hr className="divider" />
        </div>

        <nav className="dashboard-nav">
          <Link to="/" className="nav-item">
            <FaHome /> Inicio
          </Link>
          <Link to="/dashboard" className="nav-item active">
            <FaBoxOpen /> Mis Donaciones
          </Link>
          <Link to="/donar" className="nav-item">
            <FaHandsHelping /> Donar
          </Link>
          <Link to="/donation-history" className="nav-item">
            <FaHistory /> Historial
          </Link>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        
          {successMessage && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>✅ ¡Éxito!</h2>
                <p>{successMessage}</p>
              </div>
            </div>
          )}
        <h1 className="dashboard-title">Mis Donaciones</h1>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando tus donaciones...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Reintentar
            </button>
          </div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <FaBoxOpen className="empty-icon" />
            <h3>Aún no has realizado donaciones</h3>
            <Link to="/donar" className="donate-btn">
              Realizar mi primera donación
            </Link>
          </div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation.id} className="donation-card">
                {donation.image_url && (
                  <div className="donation-image">
                    <SecureImage
                      imageUrl={`/api${donation.image_url}`}
                      alt={donation.title}
                      className="donation-thumbnail"
                    />
                  </div>
                )}

                <div className="donation-details">
                  <div className="detail-item">
                    <span className="detail-label">Id de Donación:</span>
                    <span>{donation.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Título:</span>
                    <span>{donation.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Descripción:</span>
                    <span>{donation.description}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Categoría:</span>
                    <span>{donation.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Condición:</span>
                    <span>{donation.condition}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ciudad:</span>
                    <span>{donation.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Dirección:</span>
                    <span>{donation.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha:</span>
                    <span>{formatDate(donation.created_at)}</span>
                  </div>
                </div>

                <div className="donation-actions">
                  <Link
                    to={`/donation/${donation.id}`}
                    className="action-btn details-btn"
                  >
                    <span>Ver detalles</span>
                  </Link>
                  <button
                    onClick={() => handleDeleteDonation(donation.id)}
                    className="action-btn delete-btn"
                    disabled={isDeletingId === donation.id}
                  >
                    {isDeletingId === donation.id ? (
                      <>
                        <span className="spinner"></span> Eliminando...
                      </>
                    ) : (
                      <span>Eliminar</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
 */