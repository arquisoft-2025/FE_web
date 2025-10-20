import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaHandsHelping,
} from "react-icons/fa";
import Link from 'next/link'
import { useRouter } from 'next/router'
// styles moved to pages/_app.jsx
import SecureImage from "./SecureImage";

function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeleteDonation = async (donationId) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    
    if (!token) {
      alert("No estás autenticado. Por favor inicia sesión nuevamente.");
      router.push("/login");
      return;
    }

    setIsDeletingId(donationId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_VITE_API_BASE_URL}/graphql`,
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
            variables: { donationId }
          })
        }
      );

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0]?.message || "Error en la mutación GraphQL");

      if (result.data?.deleteDonation?.success) {
        setSuccessMessage("🎉 ¡Donación Eliminada exitosamente!");
        setTimeout(() => {
          setSuccessMessage("");
          setDonations((prev) => prev.filter((d) => d.id !== donationId));
        }, 2500);
      } else {
        throw new Error(result.data?.deleteDonation?.message || "Error al eliminar la donación");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert(err.message || "Error desconocido al eliminar la donación");
    } finally {
      setIsDeletingId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const storedUserData = localStorage.getItem("userData") || sessionStorage.getItem("userData");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      if (storedUserData) setUserData(JSON.parse(storedUserData));
      fetchUserDonations(token);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Error al cargar los datos del usuario");
      setIsLoading(false);
    }
  }, [router]);

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
      throw new Error("Tu sesión ha expirado. Por favor inicia sesión nuevamente");
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VITE_API_BASE_URL}/graphql`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: `query GetUserDonations { getUserDonations { id title description category condition city address imageUrl createdAt expirationDate available auth email name } }` })
      });

      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0]?.message || "Error en la consulta GraphQL");

      const data = result.data?.getUserDonations || [];
      setDonations(data);
    } catch (err) {
      console.error("Error fetching donations:", err);
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
    router.push("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("es-ES", options);
    } catch (err) {
      return "Fecha inválida";
    }
  };

  const getAvailabilityBadge = (available) => (
    <span className={`badge ${available ? "badge-success" : "badge-warning"}`}>{available ? "Disponible" : "No disponible"}</span>
  );

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
          <Link href="/" className="nav-item"><FaHome /> Inicio</Link>
          <Link href="/dashboard" className="nav-item active"><FaBoxOpen /> Mis Donaciones</Link>
          <Link href="/donar" className="nav-item"><FaHandsHelping /> Donar</Link>
          <Link href="/donation-history" className="nav-item"><FaHistory /> Historial</Link>
          <button onClick={handleLogout} className="nav-item logout-btn"><FaSignOutAlt /> Cerrar Sesión</button>
        </nav>
      </aside>

      <main className="dashboard-main">
        {successMessage && (
          <div className="modal-overlay"><div className="modal-content"><h2>✅ ¡Éxito!</h2><p>{successMessage}</p></div></div>
        )}

        <h1 className="dashboard-title">Mis Donaciones</h1>

        {isLoading ? (
          <div className="loading-spinner"><div className="spinner"></div><p>Cargando tus donaciones...</p></div>
        ) : error ? (
          <div className="error-message"><p>{error}</p><button onClick={() => window.location.reload()} className="retry-btn">Reintentar</button></div>
        ) : donations.length === 0 ? (
          <div className="empty-state"><FaBoxOpen className="empty-icon" /><h3>Aún no has realizado donaciones</h3><Link href="/donar" className="donate-btn">Realizar mi primera donación</Link></div>
        ) : (
          <div className="donations-list">
            {donations.map((donation) => (
              <div key={donation.id} className="donation-card">
                {donation.imageUrl && (
                  <div className="donation-image"><SecureImage imageUrl={`/api${donation.imageUrl}`} alt={donation.title} className="donation-thumbnail"/></div>
                )}

                <div className="donation-details">
                  <div className="detail-item"><span className="detail-label">Id de Donación:</span><span>{donation.id}</span></div>
                  <div className="detail-item"><span className="detail-label">Título:</span><span>{donation.title}</span></div>
                  <div className="detail-item"><span className="detail-label">Descripción:</span><span>{donation.description}</span></div>
                  <div className="detail-item"><span className="detail-label">Categoría:</span><span>{donation.category}</span></div>
                  <div className="detail-item"><span className="detail-label">Condición:</span><span>{donation.condition}</span></div>
                  <div className="detail-item"><span className="detail-label">Ciudad:</span><span>{donation.city}</span></div>
                  <div className="detail-item"><span className="detail-label">Dirección:</span><span>{donation.address || "No especificada"}</span></div>
                  <div className="detail-item"><span className="detail-label">Fecha:</span><span>{formatDate(donation.createdAt)}</span></div>
                  <div className="detail-item"><span className="detail-label">Estado:</span>{getAvailabilityBadge(donation.available)}</div>
                </div>

                <div className="donation-actions">
                  <Link href={`/donation/${donation.id}`} className="action-btn details-btn"><span>Ver detalles</span></Link>
                  <button onClick={() => handleDeleteDonation(donation.id)} className="action-btn delete-btn" disabled={isDeletingId === donation.id}>{isDeletingId === donation.id ? (<><span className="spinner"></span> Eliminando...</>) : (<span>Eliminar</span>)}</button>
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