import './App.css'
import DonationPage from './components/DonationPage'
import ProductList from './components/ProductList'
//import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom'
import RegistroPage from './components/registroPage/RegistroPage'
import LoginPage from './components/loginPage/LoginPage'
import RecuperarPasswordPage from './components/recuperarPasswordPage/RecuperarPasswordPage'
import DashboardPage from './components/dashboardPage/DashboardPage'
import DonacionPage from './components/DonationPage'
import DonationFormPage from './components/donarPage/DonationFormPage'




function App() {
  return (
    <Routes>
      <Route path="/" element={<DonationPage />} />
      <Route path="/donaciones" element={<ProductList />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-contrasena" element={<RecuperarPasswordPage />} />
      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      <Route path="/dashboard/*" element={<DashboardPage />} />
      <Route path="/donar" element={<DonationFormPage />} />
    </Routes>
  )
}

export default App
