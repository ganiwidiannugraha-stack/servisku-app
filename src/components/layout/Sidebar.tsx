import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Box, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useStore } from '../../store';

interface SidebarProps {
  /** Callback opsional yang dipanggil saat navigasi terjadi (berguna untuk menutup sidebar di versi mobile) */
  onNavigate?: () => void;
}

/**
 * Komponen Sidebar Navigasi Utama
 * Berisi link navigasi ke halaman-halaman utama aplikasi (Dashboard, Order, Stok, dll).
 * Dilengkapi dengan badge dinamis (Notifikasi jumlah order aktif & stok menipis).
 */
export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { orders, spareparts } = useStore();

  // Dynamic Badges
  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'MASUK' || o.status === 'PROSES' || o.status === 'MENUNGGU_SPAREPART').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return spareparts.filter(s => s.stok <= (s.minStok || 0)).length;
  }, [spareparts]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Order Servis', path: '/order', icon: <ClipboardList size={20} />, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
    { name: 'Stok Sparepart', path: '/stok', icon: <Box size={20} />, badge: lowStockCount > 0 ? lowStockCount : undefined, danger: true },
    { name: 'Pelanggan', path: '/pelanggan', icon: <Users size={20} /> },
    { name: 'Laporan', path: '/laporan', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex flex-col w-64 h-screen bg-white border-r border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center px-6 h-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.01l-9.15 9.15a2 2 0 0 1-2.82-2.82l9.15-9.15a6 6 0 0 1 9.01-7.94l-3.77 3.77z"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">ServisKu</h1>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#eef2ff] text-blue-700 font-bold overflow-hidden'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full"></div>}
                  <div className="flex items-center">
                    <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </div>
                  {item.badge && (
                    <span
                      className={`inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold rounded-full ${
                        item.danger
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 space-y-1">
        <NavLink 
          to="/pengaturan" 
          onClick={onNavigate}
          className={({ isActive }) => 
            `flex items-center w-full px-4 py-2.5 font-medium transition-colors rounded-xl ${
              isActive ? 'bg-[#eef2ff] text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings size={20} className={`mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              Pengaturan
            </>
          )}
        </NavLink>
        <button 
          onClick={() => {
            useStore.getState().logout();
          }}
          className="flex items-center w-full px-4 py-2.5 text-red-600 font-medium transition-colors rounded-xl hover:bg-red-50"
        >
          <LogOut size={20} className="mr-3 text-red-400" />
          Keluar
        </button>
      </div>
    </div>
  );
};
