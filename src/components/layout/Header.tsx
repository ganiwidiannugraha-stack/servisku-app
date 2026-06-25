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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { orders, customers, spareparts, settings } = useStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <header className="relative z-20 flex items-center justify-between h-20 px-8 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
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
        <button className="relative p-2.5 text-gray-500 rounded-full hover:bg-gray-50 transition-colors">
          <Bell size={20} />
          {settings.enableNotifications && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/pengaturan')}>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm group-hover:shadow transition-shadow">
            {settings.ownerName ? settings.ownerName.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="hidden md:flex flex-col items-start justify-center">
            <p className="text-sm font-bold text-gray-900 leading-tight">{settings.ownerName || 'Admin'}</p>
            <p className="text-xs text-gray-500 font-medium leading-tight">{settings.shopName || 'Toko'}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400 ml-1 hidden md:block group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
};
