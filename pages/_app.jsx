// Global styles (moved from component files)
import '../src/index.css'
import '../src/App.css'
import '../src/components/DonationPage.css'
import '../src/components/ProductList.css'
import '../src/components/header/Header.css'
import '../src/components/loginPage/LoginPage.css'
import '../src/components/registroPage/RegistroPage.css'
import '../src/components/donarPage/DonationFormPage.css'
import '../src/components/dashboardPage/DashboardPage.css'
import '../src/components/shopping_cart/cart.css'
import '../src/components/ProductRequestModal.css'
// PopUp.css removed - file not present in repository

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
