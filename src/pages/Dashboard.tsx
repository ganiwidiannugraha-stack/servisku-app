import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Calendar, RefreshCcw, PackageCheck, Banknote, Eye } from 'lucide-react';

// Helper to format date "DD MMM"
const formatDateShort = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

/**
 * Komponen Halaman Dashboard
 * Menampilkan ringkasan metrik bengkel, antrean servis yang aktif, dan stok barang menipis.
 * Terdiri dari Kartu Statistik (Omset, Job Aktif, dll), Visualisasi Grafik, dan Live Queue.
 */
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // Mengambil state global menggunakan custom hook Zustand
  const { orders, spareparts, customers } = useStore();

  // Menghitung jumlah order berdasarkan klasifikasi status
  const ordersMasuk = orders.filter(o => o.status === 'MASUK').length;
  const ordersProses = orders.filter(o => o.status === 'PROSES' || o.status === 'DIAGNOSA' || o.status === 'MENUNGGU_SPAREPART').length;
  const ordersSelesai = orders.filter(o => o.status === 'SELESAI').length;

  /** Helper untuk mencari nama pelanggan dari ID pelanggan */
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.nama || 'Unknown';
  
  // Mencari sparepart yang jumlah stoknya di bawah batas aman minimum
  const stokMenipis = spareparts.filter(s => s.stok <= (s.minStok || 0));
  const perangkatBelumDiambil = orders.filter(o => o.status === 'SELESAI');

  // Calculate Today's Revenue dynamically
  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    let rev = 0;
    orders.filter(o => o.status === 'DIAMBIL' && new Date(o.tanggalMasuk).toDateString() === today).forEach(o => {
      rev += o.estimasiBiaya;
      if (o.spareparts) {
        o.spareparts.forEach(sp => {
          const detail = spareparts.find(s => s.id === sp.id);
          if (detail) rev += detail.harga * sp.qty;
        });
      }
      if (o.jasa) {
        o.jasa.forEach(j => {
          rev += j.harga;
        });
      }
    });
    return rev;
  }, [orders, spareparts]);

  // Pie chart data based on devices
  const pieData = useMemo(() => {
    let laptop = 0, hp = 0, printer = 0;
    orders.forEach(o => {
      const j = o.jenisPerangkat.toLowerCase();
      if (j.includes('laptop') || j.includes('komputer')) laptop++;
      else if (j.includes('hp') || j.includes('handphone')) hp++;
      else if (j.includes('printer')) printer++;
    });
    if (laptop === 0 && hp === 0 && printer === 0) {
      return [{ name: 'Belum Ada Data', value: 1, color: '#e5e7eb' }];
    }
    return [
      { name: 'Laptop', value: laptop, color: '#2563eb' },
      { name: 'HP', value: hp, color: '#60a5fa' },
      { name: 'Printer', value: printer, color: '#bfdbfe' }
    ];
  }, [orders]);

  // Generate 7-day activity and revenue data
  const { lineData, barData } = useMemo(() => {
    const lData = [];
    const bData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toDateString();
      const label = formatDateShort(d);

      let masuk = 0;
      let selesai = 0;
      let revenue = 0;

      orders.forEach(o => {
        const orderDate = new Date(o.tanggalMasuk).toDateString();
        // Cek pesanan masuk
        if (orderDate === dateString) masuk++;
        
        // Cek pesanan selesai/diambil dan hitung pendapatan
        if (o.status === 'SELESAI' || o.status === 'DIAMBIL') {
          // Asumsikan tanggal update/selesai sama dengan tanggal masuk untuk simplifikasi (karena belum ada field updatedAt)
          // Idealnya kita menggunakan updatedAt/tanggalSelesai jika ada di database
          if (orderDate === dateString) {
            selesai++;
            revenue += o.biayaJasa || 0;
            if (o.spareparts) {
              o.spareparts.forEach(sp => {
                const detail = spareparts.find(s => s.id === sp.id);
                if (detail) revenue += (detail.harga * sp.qty);
              });
            }
          }
        }
      });

      lData.push({ name: label, masuk, selesai, value: masuk });
      bData.push({ name: label, value: revenue });
    }
    return { lineData: lData, barData: bData };
  }, [orders, spareparts]);

  return (
    <div className="p-8 w-full min-h-screen">
      
      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Incoming Orders */}
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Pesanan Masuk</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{ordersMasuk}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
          </div>
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Sedang Diproses</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{ordersProses}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <RefreshCcw size={20} />
            </div>
          </div>
          <div className="w-full mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${orders.length > 0 ? (ordersProses / orders.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Card 3: Ready for Pickup */}
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Siap Diambil</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{ordersSelesai}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <PackageCheck size={20} />
            </div>
          </div>
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineData.map(d => ({ value: d.selesai }))} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <Bar dataKey="value" fill="#93c5fd" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium text-sm">Pendapatan Hari Ini</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">Rp {todayRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Banknote size={20} />
            </div>
          </div>
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Spans 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Urgent Notifications */}
          <div className="bg-[#eef2ff] p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-orange-500" />
              <h2 className="font-bold text-gray-900">Notifikasi Mendesak</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">
                    {perangkatBelumDiambil.length} Perangkat Selesai Belum Diambil
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mb-3">
                    {perangkatBelumDiambil.slice(0,2).map(o => (
                      <li key={o.id}>• Order {o.noServis} ({getCustomerName(o.pelangganId)})</li>
                    ))}
                    {perangkatBelumDiambil.length === 0 && <li>Tidak ada order tertunda</li>}
                  </ul>
                </div>
                <button 
                  onClick={() => navigate('/order')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors self-start flex items-center gap-1"
                >
                  Tindak Lanjut &rsaquo;
                </button>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-red-900 text-sm mb-3">
                    Peringatan Stok Tipis
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1 mb-3">
                    {stokMenipis.slice(0,2).map(s => (
                      <li key={s.id}>• {s.nama} (sisa {s.stok})</li>
                    ))}
                    {stokMenipis.length === 0 && <li>Stok aman</li>}
                  </ul>
                </div>
                <button 
                  onClick={() => navigate('/stok')}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors self-start flex items-center gap-1"
                >
                  Isi Ulang Stok &rsaquo;
                </button>
              </div>
            </div>
          </div>

          {/* Latest Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Pesanan Terbaru</h2>
              <button 
                onClick={() => navigate('/order')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                Lihat Semua &rsaquo;
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">NO. SERVIS</th>
                    <th className="px-6 py-4 font-semibold">PELANGGAN</th>
                    <th className="px-6 py-4 font-semibold">PERANGKAT</th>
                    <th className="px-6 py-4 font-semibold">KELUHAN</th>
                    <th className="px-6 py-4 font-semibold text-center">STATUS</th>
                    <th className="px-6 py-4 font-semibold text-center">MASUK</th>
                    <th className="px-6 py-4 font-semibold text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 4).map((order) => {
                    const statusColors: any = {
                      'MASUK': 'bg-blue-50 text-blue-600 border-blue-200',
                      'PROSES': 'bg-yellow-50 text-yellow-600 border-yellow-200',
                      'DIAGNOSA': 'bg-orange-50 text-orange-600 border-orange-200',
                      'SELESAI': 'bg-green-50 text-green-600 border-green-200',
                      'BATAL': 'bg-red-50 text-red-600 border-red-200',
                      'DIAMBIL': 'bg-gray-100 text-gray-600 border-gray-300',
                      'MENUNGGU_SPAREPART': 'bg-orange-50 text-orange-600 border-orange-200',
                      'MENUNGGU_KONFIRMASI': 'bg-orange-50 text-orange-600 border-orange-200'
                    };
                    const getStatusLabel = (status: string) => {
                      switch(status) {
                        case 'MENUNGGU_SPAREPART': return 'Menunggu Sparepart';
                        case 'MENUNGGU_KONFIRMASI': return 'Menunggu Konfirmasi';
                        default: return status.charAt(0) + status.slice(1).toLowerCase();
                      }
                    };
                    const getRelativeTime = (dateString: string) => {
                      const diffDays = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
                      if (diffDays <= 0) return 'Hari ini';
                      if (diffDays === 1) return 'Kemarin';
                      return `${diffDays} hari lalu`;
                    };
                    const customer = getCustomerName(order.pelangganId);
                    
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <span className="font-bold text-gray-900">{order.noServis}</span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-gray-900">{customer}</p>
                        </td>
                        <td className="px-6 py-5 text-gray-700 font-medium">
                          {order.jenisPerangkat} - {order.merkModel}
                        </td>
                        <td className="px-6 py-5 text-gray-600 max-w-[200px] truncate">
                          {order.keluhan}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-gray-900 font-medium">{getRelativeTime(order.tanggalMasuk)}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{new Date(order.tanggalMasuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <button 
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors shadow-sm mx-auto"
                          >
                            <Eye size={14} /> Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Spans 1 column) */}
        <div className="flex flex-col gap-6">
          
          {/* Service Distribution Pie */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[280px] flex flex-col">
            <h2 className="font-bold text-gray-900 mb-4">Distribusi Servis</h2>
            <div className="flex-1 flex items-center relative">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Pie chart */}
                <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-xl font-bold text-gray-900">{orders.length}</span>
                </div>
              </div>
              <div className="w-1/2 pl-4 flex flex-col justify-center gap-3">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory Alerts List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Peringatan Inventaris</h2>
              <button 
                onClick={() => navigate('/stok')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                Lihat Semua &rsaquo;
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              {spareparts.slice(0, 5).map(sp => (
                <div key={sp.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{sp.nama} (sisa {sp.stok})</span>
                  <span className={`font-bold ${sp.stok <= (sp.minStok || 0) ? 'text-red-500' : 'text-gray-900'}`}>
                    {sp.stok}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
