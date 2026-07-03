import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, ChevronDown, Package, User, Wrench, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

interface HeaderProps {
  /** Callback untuk membuka/menutup sidebar di tampilan mobile */
  onNavigate?: () => void;
  onMenuClick?: () => void;
}

/**
 * Komponen Header Aplikasi
 * Menampilkan Global Search (pencarian universal untuk Order, Pelanggan, dan Sparepart),
 * tombol notifikasi, profil pengguna, dan menu hamburger (mobile).
 */
export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { orders, customers, spareparts, settings, userName, userRole, isSidebarCollapsed, toggleSidebar } = useStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unpaidOrdersCount = orders.filter(o => o.status === 'SIAP_DIAMBIL' || o.status === 'SELESAI').length;
  const lowStockCount = spareparts.filter(s => s.stok <= (s.minStok || 5)).length;
  const totalNotifications = unpaidOrdersCount + lowStockCount;

  const searchResults = () => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase();

    const matchedOrders = orders.filter(o => {
      const cust = customers.find(c => c.id === o.pelangganId);
      const searchStr = `${o.noServis} ${cust?.nama || ''} ${o.jenisPerangkat} ${o.merkModel || ''}`.toLowerCase();
      return searchStr.includes(lowerQuery);
    }).slice(0, 3);

    const matchedCustomers = customers.filter(c => 
      c.nama.toLowerCase().includes(lowerQuery) ||
      c.noHp.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    const matchedSpareparts = spareparts.filter(s => 
      s.nama.toLowerCase().includes(lowerQuery) ||
      s.kategori.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    return { matchedOrders, matchedCustomers, matchedSpareparts };
  };

  const results = searchResults();
  const hasResults = results && (results.matchedOrders.length > 0 || results.matchedCustomers.length > 0 || results.matchedSpareparts.length > 0);

  return (
    <header className="relative z-50 flex items-center justify-between h-20 px-8 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        {/* Toggle Sidebar Desktop */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 mr-4 text-gray-500 rounded-xl hover:bg-gray-50 border border-gray-100 hover:text-gray-900 transition-colors"
          title={isSidebarCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
        >
          <Menu size={20} />
        </button>
        <div className="w-full max-w-xl relative" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              onFocus={() => query && setIsOpen(true)}
              placeholder="Cari order, pelanggan, atau sparepart..."
              className="w-full py-2.5 pl-10 pr-10 text-sm font-medium bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 shadow-sm transition-all placeholder:font-normal placeholder:text-gray-400"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); setIsOpen(false); }}
                className="absolute right-3 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isOpen && query && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-[400px] overflow-y-auto p-2">
                {!hasResults ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Tidak ada hasil ditemukan untuk "{query}"
                  </div>
                ) : (
                  <>
                    {results.matchedOrders.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Order Servis</div>
                        {results.matchedOrders.map(order => (
                          <div 
                            key={order.id}
                            onClick={() => { navigate(`/order/${order.id}`); setIsOpen(false); setQuery(''); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wrench size={16} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{order.noServis}</p>
                              <p className="text-xs text-gray-500 truncate">{customers.find(c => c.id === order.pelangganId)?.nama || 'Pelanggan'} - {order.jenisPerangkat} {order.merkModel}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {results.matchedCustomers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Pelanggan</div>
                        {results.matchedCustomers.map(customer => (
                          <div 
                            key={customer.id}
                            onClick={() => { navigate(`/pelanggan`); setIsOpen(false); setQuery(''); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><User size={16} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{customer.nama}</p>
                              <p className="text-xs text-gray-500 truncate">{customer.noHp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {results.matchedSpareparts.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Sparepart</div>
                        {results.matchedSpareparts.map(part => (
                          <div 
                            key={part.id}
                            onClick={() => { navigate(`/stok`); setIsOpen(false); setQuery(''); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Package size={16} /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{part.nama}</p>
                              <p className="text-xs text-gray-500 truncate">{part.kategori} • Stok: {part.stok}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 text-gray-500 rounded-full hover:bg-gray-50 transition-colors"
          >
            <Bell size={20} />
            {settings.enableNotifications && totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white">
                {totalNotifications}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Notifikasi</h3>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {unpaidOrdersCount > 0 && (
                  <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { navigate('/order'); setIsNotifOpen(false); }}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{unpaidOrdersCount} order selesai belum dibayar</p>
                        <p className="text-xs text-gray-500 mt-0.5">Perlu konfirmasi pembayaran</p>
                      </div>
                    </div>
                  </div>
                )}
                {lowStockCount > 0 && (
                  <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { navigate('/stok'); setIsNotifOpen(false); }}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-500 shrink-0"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lowStockCount} spare part stok rendah</p>
                        <p className="text-xs text-gray-500 mt-0.5">Segera lakukan restock</p>
                      </div>
                    </div>
                  </div>
                )}
                {totalNotifications === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Belum ada notifikasi baru
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div 
          className="flex items-center space-x-3 group cursor-pointer" 
          onClick={() => navigate('/pengaturan')}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm group-hover:shadow transition-shadow bg-blue-100 text-blue-700">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:flex flex-col items-start justify-center">
            <p className="text-sm font-bold text-gray-900 leading-tight">{userName || 'User'}</p>
            <p className="text-xs text-gray-500 font-medium leading-tight capitalize">{userRole?.toLowerCase() || 'Teknisi Servis'}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 ml-1 hidden md:block group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
};
