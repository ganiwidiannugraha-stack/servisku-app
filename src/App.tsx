import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { lazy, Suspense, useEffect } from 'react';

import { PageWrapper } from './components/layout/PageWrapper';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useStore } from './store';
import {
  SplashLoader,
  RouteLoader,
  SkeletonDashboard,
  SkeletonTablePage,
  SkeletonLaporan,
} from './components/ui/SkeletonLoader';
import { supabase } from './lib/supabase';

// ─────────────────────────────────────────────────────────────
// Lazy loaded pages — Code splitting untuk performa optimal
// Browser hanya mengunduh halaman yang sedang dibuka saja.
// ─────────────────────────────────────────────────────────────
const Dashboard  = lazy(() => import('./pages/Dashboard').then(m  => ({ default: m.Dashboard })));
const OrderList  = lazy(() => import('./pages/OrderList').then(m  => ({ default: m.OrderList })));
const NewOrder   = lazy(() => import('./pages/NewOrder').then(m   => ({ default: m.NewOrder })));
const OrderDetail= lazy(() => import('./pages/OrderDetail').then(m=> ({ default: m.OrderDetail })));
const Payment    = lazy(() => import('./pages/Payment').then(m    => ({ default: m.Payment })));
const Stok       = lazy(() => import('./pages/Stok').then(m       => ({ default: m.Stok })));
const Pelanggan  = lazy(() => import('./pages/Pelanggan').then(m  => ({ default: m.Pelanggan })));
const Laporan    = lazy(() => import('./pages/Laporan').then(m    => ({ default: m.Laporan })));
const Pengaturan = lazy(() => import('./pages/Pengaturan').then(m => ({ default: m.Pengaturan })));
const Login      = lazy(() => import('./pages/Login').then(m      => ({ default: m.Login })));
const NotFound   = lazy(() => import('./pages/NotFound').then(m   => ({ default: m.NotFound })));

// ─────────────────────────────────────────────────────────────
// Skeleton fallbacks per jenis halaman
// Masing-masing menampilkan outline halaman yang tepat
// sehingga user tidak merasakan "lompatan layout" saat konten muncul.
// ─────────────────────────────────────────────────────────────
const DashboardSkeleton = () => <SkeletonDashboard />;
const TableSkeleton     = () => <SkeletonTablePage rows={8} cols={5} />;
const TableSkeleton4    = () => <SkeletonTablePage rows={8} cols={4} />;
const LaporanSkeleton   = () => <SkeletonLaporan />;
const GenericLoader     = () => <RouteLoader />;

// ─────────────────────────────────────────────────────────────
// Auth Guard — Redirect ke /login jika belum autentikasi
// ─────────────────────────────────────────────────────────────
const ProtectedRoute = () => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// ─────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────
function App() {
  const loadInitialData = useStore(state => state.loadInitialData);

  useEffect(() => {
    loadInitialData();
    
    // Subscribe to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        useStore.setState({
          isAuthenticated: false,
          userRole: null,
          userId: null,
          userName: null,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadInitialData]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" containerStyle={{ top: 140 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Halaman Login — splash screen saat chunk belum ter-cache */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<SplashLoader />}>
              <Login />
            </Suspense>
          }
        />

        {/* Protected Routes — semua halaman dalam layout utama */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageWrapper />}>
            <Route path="/dashboard"      element={<Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense>} />
            <Route path="/order"          element={<Suspense fallback={<TableSkeleton />}><OrderList /></Suspense>} />
            <Route path="/order/baru"     element={<Suspense fallback={<GenericLoader />}><NewOrder /></Suspense>} />
            <Route path="/order/:id"      element={<Suspense fallback={<GenericLoader />}><OrderDetail /></Suspense>} />
            <Route path="/order/:id/bayar"element={<Suspense fallback={<GenericLoader />}><Payment /></Suspense>} />
            <Route path="/stok"           element={<Suspense fallback={<TableSkeleton />}><Stok /></Suspense>} />
            <Route path="/pelanggan"      element={<Suspense fallback={<TableSkeleton />}><Pelanggan /></Suspense>} />
            <Route path="/laporan"        element={<Suspense fallback={<LaporanSkeleton />}><Laporan /></Suspense>} />
            <Route path="/pengaturan"     element={<Suspense fallback={<TableSkeleton4 />}><Pengaturan /></Suspense>} />
          </Route>
        </Route>

        {/* 404 — splash gelap saat chunk Not Found dimuat */}
        <Route
          path="*"
          element={
            <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center"><RouteLoader /></div>}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
