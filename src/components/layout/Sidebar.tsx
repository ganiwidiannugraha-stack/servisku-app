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
  const { orders, spareparts, userRole } = useStore();

  // Dynamic Badges
  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'MASUK' || o.status === 'PROSES' || o.status === 'MENUNGGU_SPAREPART').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return spareparts.filter(s => s.stok <= (s.minStok || 0)).length;
  }, [spareparts]);

  const menuUtama = useMemo(() => {
    const items = [
      { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, roles: ['OWNER', 'FRONTLINE', 'FINANCE', 'INVENTORY', 'TEKNISI'] },
      { name: 'Order Servis', path: '/order', icon: <ClipboardList size={20} />, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined, roles: ['OWNER', 'FRONTLINE', 'TEKNISI', 'FINANCE'] },
      { name: 'Pelanggan', path: '/pelanggan', icon: <Users size={20} />, roles: ['OWNER', 'FRONTLINE'] },
      { name: 'Spare Part', path: '/stok', icon: <Box size={20} />, badge: lowStockCount > 0 ? lowStockCount : undefined, danger: true, roles: ['OWNER', 'INVENTORY', 'TEKNISI', 'FRONTLINE'] },
      { name: 'Laporan', path: '/laporan', icon: <BarChart3 size={20} />, roles: ['OWNER', 'FINANCE'] },
    ];
    return items.filter(item => userRole && item.roles.includes(userRole));
  }, [activeOrdersCount, lowStockCount, userRole]);

  return (
    <div className="flex flex-col w-64 h-screen bg-white border-r border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="flex items-center px-6 h-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ServisKu Logo" className="h-10 w-auto object-contain drop-shadow-sm" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600">ServisKu</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 px-4 py-4 overflow-y-auto">
        <h2 className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Menu Utama</h2>
        <nav className="space-y-1.5 mb-8">
          {menuUtama.map((item) => (
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
        
        <div className="mt-auto pt-4 border-t border-gray-100 space-y-4">
          <NavLink
            to="/pengaturan"
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
                    <Settings size={20} />
                  </span>
                  Pengaturan
                </div>
              </>
            )}
          </NavLink>

          <button 
            onClick={() => {
              useStore.getState().logout();
            }}
            className="flex items-center w-full px-4 py-3 text-red-600 font-medium transition-colors rounded-xl hover:bg-red-50 mt-4"
          >
            <LogOut size={20} className="mr-3 text-red-400" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
