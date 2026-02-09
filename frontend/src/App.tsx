import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
// We will create these pages next
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Recipes } from './pages/Recipes';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Profile } from './pages/Profile';
import { Contact } from './pages/Contact';

function App() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/shop" element={<Layout><Shop /></Layout>} />
      <Route path="/recipes" element={<Layout><Recipes /></Layout>} />
      <Route path="/cart" element={<Layout><Cart /></Layout>} />
      <Route path="/cart" element={<Layout><Cart /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
    </Routes>
  )
}

export default App
