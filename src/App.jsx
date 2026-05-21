import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Public pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import AttractionDetail from './pages/AttractionDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CustomerPortal from './pages/CustomerPortal';

// Auth guard
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EditAttraction from './pages/admin/EditAttraction';
import ManageSchedule from './pages/admin/ManageSchedule';
import POSTerminal from './pages/admin/POSTerminal';
import ManageBookings from './pages/admin/ManageBookings';

// Admin layout wraps pages that need header/footer hidden
const AdminLayout = ({ children }) => <>{children}</>;

// Public layout
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fdfaf5', color: '#1c1611' }}>
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ── Public routes (with Header/Footer) ──────────── */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/atracciones" element={<PublicLayout><Catalog /></PublicLayout>} />
            <Route path="/atraccion/:id" element={<PublicLayout><AttractionDetail /></PublicLayout>} />
            <Route path="/carrito" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/registro" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/checkout-success" element={<PublicLayout><CheckoutSuccess /></PublicLayout>} />

            {/* ── Protected public routes ──────────────────────── */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <PublicLayout><CheckoutPage /></PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mi-cuenta"
              element={
                <ProtectedRoute>
                  <PublicLayout><CustomerPortal /></PublicLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Admin routes (no Header/Footer) ─────────────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/atracciones/new"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><EditAttraction /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/atracciones/edit/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><EditAttraction /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/horarios/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><ManageSchedule /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pos"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><POSTerminal /></AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservas"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout><ManageBookings /></AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
