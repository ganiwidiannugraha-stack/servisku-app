import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Box, Users, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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
  const { orders, spareparts, userRole, userName, isSidebarCollapsed, toggleSidebar, logout } = useStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

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
      { name: 'Pengaturan', path: '/pengaturan', icon: <Settings size={20} />, roles: ['OWNER'] },
    ];
    return items.filter(item => userRole && item.roles.includes(userRole));
  }, [activeOrdersCount, lowStockCount, userRole]);

  return (
    <aside className={`relative flex flex-col h-screen bg-white border-r border-gray-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Tombol Toggle Sidebar (Desktop only) */}
      <button 
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-5 top-7 items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md text-gray-400 hover:text-blue-600 hover:border-blue-500 transition-all z-50 hover:scale-110 cursor-pointer"
        title={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
      >
        {isSidebarCollapsed ? <ChevronRight size={20} strokeWidth={3} /> : <ChevronLeft size={20} strokeWidth={3} />}
      </button>

      <div 
        className={`flex items-center border-b border-gray-100 transition-all duration-300 ${isSidebarCollapsed ? 'px-4 justify-center py-5 cursor-pointer hover:bg-gray-50' : 'px-5 py-5'}`}
        onClick={() => isSidebarCollapsed && toggleSidebar()}
        title={isSidebarCollapsed ? "Perbesar Sidebar" : ""}
      >
        <div className="flex items-center overflow-hidden whitespace-nowrap w-full">
          <img src="/logo.png" alt="ServisKu Logo" className="h-10 w-auto object-contain flex-shrink-0 drop-shadow-sm" />
          <div className={`transition-all duration-300 overflow-hidden flex flex-col justify-center ${isSidebarCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
            <div className="text-gray-900 text-base font-bold leading-tight">
              ServisKu
            </div>
            <div className="text-gray-400 text-[0.7rem] leading-tight">
              Workshop Management
            </div>
          </div>
        </div>
      </div>
      
      <div className={`flex flex-col flex-1 py-4 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
        <h2 className={`px-4 text-xs font-bold text-slate-400 tracking-wider uppercase overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-10 opacity-100 mb-2'}`}>
          Menu Utama
        </h2>
        <nav className="space-y-1 mb-8">
          {menuUtama.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              title={isSidebarCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `relative w-full flex items-center transition-all duration-200 overflow-hidden ${
                  isSidebarCollapsed ? 'justify-center p-3 rounded-lg mb-0.5' : 'px-3 py-2.5 rounded-lg mb-0.5'
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-600 rounded-r-full shadow-[1px_0_4px_rgba(37,99,235,0.4)]" />
                  )}
                  <span className={`shrink-0 transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400'} ${isSidebarCollapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  
                  <span 
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 flex-1 flex items-center justify-between ${
                      isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
                    }`}
                  >
                    <span className={`text-[0.875rem] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span
                        className={`inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold rounded-full ml-2 ${
                          item.danger
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>

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
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className={`px-2 text-gray-400 uppercase text-[0.65rem] font-semibold tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-10 opacity-100 mb-2'}`}>
            Akun
          </p>

          <button 
            onClick={() => {
              if (onNavigate) onNavigate();
              setIsLogoutModalOpen(true);
            }}
            title={isSidebarCollapsed ? 'Keluar' : undefined}
            className={`relative w-full flex items-center transition-all duration-200 text-red-600 hover:bg-red-50 overflow-hidden ${
              isSidebarCollapsed ? 'justify-center p-3 rounded-lg mt-1' : 'px-3 py-2.5 rounded-lg mt-1 text-left'
            }`}
          >
            <span className={`shrink-0 transition-all duration-300 ${isSidebarCollapsed ? '' : 'mr-3'}`}>
              <LogOut size={20} />
            </span>
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 flex-1 ${isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
              <span className="text-[0.875rem] font-semibold">
                Keluar
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* User Info */}
      <div 
        className={`py-4 border-t border-gray-100 transition-all duration-300 cursor-pointer hover:bg-gray-50 flex items-center justify-center ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}
        onClick={() => {
          if (onNavigate) onNavigate();
          navigate('/pengaturan');
        }}
      >
        <div className="flex items-center w-full overflow-hidden">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6 text-gray-400" />
          </div>
          <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex flex-col justify-center ${isSidebarCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {userRole?.toLowerCase() || 'admin'}
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Keluar"
      >
        <p className="text-gray-600 mb-6 text-sm">
          Apakah Anda yakin ingin keluar dari aplikasi? Anda harus masuk kembali untuk mengakses data.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={() => {
            setIsLogoutModalOpen(false);
            logout();
          }}>
            Ya, Keluar
          </Button>
        </div>
      </Modal>
    </aside>
  );
};
