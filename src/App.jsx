import './App.css';
import ScrollAnimations from './components/ScrollAnimations';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Publish from './pages/Publish';
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
import ResetPassword from './pages/ResetPassword';
import MyAccount from './pages/MyAccount';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import MyQuotes from './pages/MyQuotes';
import QuoteDetails from './pages/QuoteDetails';
import MyRefunds from './pages/MyRefunds';
import RefundDetails from './pages/RefundDetails';
import RefundRequest from './pages/RefundRequest';
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
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { FeedbackProvider } from './components/common/Feedback';

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
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/publier" element={<Publish />} />
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/my-quotes" element={<MyQuotes />} />
          <Route path="/quote/:id" element={<QuoteDetails />} />
          <Route path="/refund-request" element={<RefundRequest />} />
          <Route path="/my-refunds" element={<MyRefunds />} />
          <Route path="/refund/:id" element={<RefundDetails />} />
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
          <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
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
      <FeedbackProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </FeedbackProvider>
    </Router>
  );
}

export default App;
