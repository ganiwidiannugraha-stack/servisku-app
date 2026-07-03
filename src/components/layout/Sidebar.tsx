import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Box, Users, BarChart3, Settings, LogOut, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const { orders, spareparts, userRole, isSidebarCollapsed } = useStore();

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
    <div className={`flex flex-col h-screen bg-white border-r border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-20 border-b border-gray-100 transition-all duration-300 relative ${isSidebarCollapsed ? 'px-0 justify-center' : 'px-6'}`}>
        <div 
          onClick={useStore.getState().toggleSidebar}
          className="flex items-center gap-3 overflow-hidden cursor-pointer group w-full h-full"
          title={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
        >
          <div className={`flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl shadow-md transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10 mx-auto' : 'w-9 h-9 flex-shrink-0'}`}>
            <Cpu size={isSidebarCollapsed ? 22 : 18} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          
          {!isSidebarCollapsed && (
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600 truncate">
              ServisKu
            </span>
          )}
        </div>

        {/* Toggle Button explicitly visible on hover or when expanded */}
        <button
          onClick={useStore.getState().toggleSidebar}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all z-10 opacity-0 group-hover:opacity-100 hidden md:flex ${!isSidebarCollapsed ? 'opacity-100' : ''}`}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
      
      <div className={`flex flex-col flex-1 py-4 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
        {!isSidebarCollapsed && (
          <h2 className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-2 uppercase">Menu Utama</h2>
        )}
        <nav className="space-y-1.5 mb-8">
          {menuUtama.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={isSidebarCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `relative flex items-center justify-between transition-all duration-200 ${
                  isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'px-4 py-3 rounded-xl'
                } ${
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
                    <span className={`${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && item.name}
                  </div>
                  {!isSidebarCollapsed && item.badge && (
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
                  {isSidebarCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.danger ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${item.danger ? 'bg-red-500' : 'bg-blue-500'}`}></span>
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
            title={isSidebarCollapsed ? 'Pengaturan' : undefined}
            className={({ isActive }) =>
              `relative flex items-center justify-between transition-all duration-200 ${
                isSidebarCollapsed ? 'justify-center p-3 rounded-xl' : 'px-4 py-3 rounded-xl'
              } ${
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
                  <span className={`${isSidebarCollapsed ? '' : 'mr-3'} ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    <Settings size={20} />
                  </span>
                  {!isSidebarCollapsed && 'Pengaturan'}
                </div>
              </>
            )}
          </NavLink>

          <button 
            onClick={() => {
              useStore.getState().logout();
            }}
            title={isSidebarCollapsed ? 'Keluar' : undefined}
            className={`flex items-center text-red-600 font-medium transition-all duration-200 rounded-xl hover:bg-red-50 mt-4 ${
              isSidebarCollapsed ? 'justify-center p-3' : 'w-full px-4 py-3'
            }`}
          >
            <LogOut size={20} className={`${isSidebarCollapsed ? '' : 'mr-3'} text-red-400`} />
            {!isSidebarCollapsed && 'Keluar'}
          </button>
        </div>
      </div>
    </div>
  );
};
