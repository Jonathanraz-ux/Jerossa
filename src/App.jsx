import './App.css';
import ScrollAnimations from './components/ScrollAnimations';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Account from './pages/Account';
import ProductQuickView from './components/ProductQuickView';
import Catalogue from './pages/Catalogue';
import Search from './pages/Search';
import Category from './pages/Category';
import Producer from './pages/Producer';
import ProducerShop from './pages/ProducerShop';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MyAccount from './pages/MyAccount';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import MyAddresses from './pages/MyAddresses';
import MyFavorites from './pages/MyFavorites';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import About from './pages/About';
import Blog from './pages/Blog';
import Article from './pages/Article';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import LegalNotice from './pages/LegalNotice';
import OrderTracking from './pages/OrderTracking';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollAnimations />
      {!isAdmin && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boutique" element={<Catalogue />} />
          <Route path="/search" element={<Search />} />
          <Route path="/categories/:slug" element={<Category />} />
          <Route path="/producteurs" element={<Producer />} />
          <Route path="/producteur/:id" element={<ProducerShop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/my-addresses" element={<MyAddresses />} />
          <Route path="/my-favorites" element={<MyFavorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Article />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cgv" element={<TermsConditions />} />
          <Route path="/legal" element={<LegalNotice />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      <ProductQuickView />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
