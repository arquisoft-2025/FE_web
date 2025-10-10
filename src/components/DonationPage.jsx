import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaHandsHelping, FaDonate, FaBoxOpen, FaMedkit, FaTshirt, FaHeart } from "react-icons/fa";
import { useRouter } from 'next/router'
// styles moved to pages/_app.jsx
import Header from "./header/Header";

function DonacionPage() {
  const router = useRouter();

  const handleDonarClick = () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      console.log("token:", token);
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  };

  return (
    <div className="donation-app">      
      <Header />

      <main className="donation-main">
        <DonationHero onDonarClick={handleDonarClick} />
      </main>

      <footer className="donation-footer">
        <div className="footer-content">
          <div className="footer-heart">
            <FaHeart />
          </div>
          <p>© {new Date().getFullYear()} Iniciativa Solidaria. Todos los derechos reservados.</p>
          <div className="footer-links">
            <a href="/privacidad">Política de Privacidad</a>
            <a href="/contacto">Contacto</a>
            <a href="/transparencia">Transparencia</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DonationHero = ({ onDonarClick }) => {
  const router = useRouter();
  
  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <FaHandsHelping className="hero-icon" />
          </div>
          <h2>Tu contribución <span>hace la diferencia</span></h2>
          <p className="lead-text">
            Únete a nuestra red de donantes y ayuda a construir una comunidad más fuerte y solidaria.
            Cada aporte, sin importar su tamaño, contribuye directamente al bienestar de quienes más lo necesitan.
          </p>
          <div className="donation-types">
            <div className="donation-item">
              <div className="donation-icon-container">
                <FaBoxOpen className="donation-icon" />
              </div>
              <div className="donation-info">
                <h4>Alimentos no perecederos</h4>
                <p>Arroz, frijoles, aceite, harina y más</p>
              </div>
            </div>
            <div className="donation-item">
              <div className="donation-icon-container">
                <FaTshirt className="donation-icon" />
              </div>
              <div className="donation-info">
                <h4>Vestimenta en buen estado</h4>
                <p>Ropa para todas las edades y tallas</p>
              </div>
            </div>
            <div className="donation-item">
              <div className="donation-icon-container">
                <FaMedkit className="donation-icon" />
              </div>
              <div className="donation-info">
                <h4>Medicamentos y suministros</h4>
                <p>Primeros auxilios y medicinas básicas</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-action">
          <div className="action-card">
            <button onClick={onDonarClick} className="donate-button">
              <FaDonate className="button-icon" />
              Realizar donación
            </button>

            <button 
              onClick={() => router.push('/donaciones')}
              className="donate-button secondary"
            >
              <FaBoxOpen className="button-icon" />
              Ver donaciones disponibles
            </button>
            
            <div className="impact-stats">
              <div className="stat-item">
                <span className="stat-number">1,240+</span>
                <span className="stat-label">Donaciones recibidas</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">560+</span>
                <span className="stat-label">Familias beneficiadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DonationHero.propTypes = {
  onDonarClick: PropTypes.func.isRequired
};

export default DonacionPage;