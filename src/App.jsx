import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckoutSuccess from './pages/CheckoutSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AtraccionForm from './pages/admin/AtraccionForm';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fdfaf5', color: '#1c1611' }}>
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/atracciones" element={<Catalog />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/checkout-success" element={<CheckoutSuccess />} />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/atracciones/new" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AtraccionForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/atracciones/edit/:id" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AtraccionForm />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
