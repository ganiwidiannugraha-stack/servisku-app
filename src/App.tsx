import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { PageWrapper } from './components/layout/PageWrapper';
import { Dashboard } from './pages/Dashboard';
import { OrderList } from './pages/OrderList';
import { NewOrder } from './pages/NewOrder';
import { OrderDetail } from './pages/OrderDetail';
import { Payment } from './pages/Payment';
import { Stok } from './pages/Stok';
import { Pelanggan } from './pages/Pelanggan';
import { Laporan } from './pages/Laporan';
import { Pengaturan } from './pages/Pengaturan';
import { Login } from './pages/Login';
import { useStore } from './store';

import { useEffect } from 'react';


// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  const loadInitialData = useStore(
    state => state.loadInitialData
  );
  useEffect(() => {

    loadInitialData()
      // testConnection()
      // seedCostumers()
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-center" containerStyle={{ top: 140 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/order" element={<OrderList />} />
            <Route path="/order/baru" element={<NewOrder />} />
            <Route path="/order/:id" element={<OrderDetail />} />
            <Route path="/order/:id/bayar" element={<Payment />} />
            <Route path="/stok" element={<Stok />} />
            <Route path="/pelanggan" element={<Pelanggan />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
