import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Calendar, RefreshCcw, PackageCheck, Banknote, Eye, Wrench, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const formatDateShort = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { orders, spareparts, customers, userRole, userId, users, technicians } = useStore();
  const currentUser = users.find(u => u.id === userId);
  const currentTech = currentUser ? technicians.find(t => t.name === currentUser.name) : undefined;
  const technicianId = currentTech?.id;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // ---------------------------------------------------------
  // TEKNISI DASHBOARD LOGIC
  // ---------------------------------------------------------
  if (userRole === 'TEKNISI') {
    const myTasks = orders.filter(o => o.teknisiId === technicianId && (o.status === 'PROSES' || o.status === 'DIAGNOSA'));
    const myDoneTasks = orders.filter(o => o.teknisiId === technicianId && o.status === 'SELESAI');
    const unassignedTasks = orders.filter(o => !o.teknisiId && !['SELESAI', 'SIAP_DIAMBIL', 'DIAMBIL', 'BATAL', 'BATAL_SIAP_DIAMBIL', 'BATAL_DIAMBIL'].includes(o.status));
    
    return (
      <motion.div 
        className="p-8 w-full min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Halo, {currentUser?.name || 'Teknisi'}! 👋</h1>
          <p className="text-gray-500">Selamat datang kembali. Berikut daftar tugas servis Anda hari ini.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 font-medium text-sm">Tugas Aktif</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{myTasks.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Wrench size={24} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 font-medium text-sm">Tugas Selesai (Bulan Ini)</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">{myDoneTasks.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={24} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-gray-500 font-medium text-sm">Tugas Urgent</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-1">{myTasks.filter(t => t.prioritas === 'URGENT').length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <AlertTriangle size={24} />
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Daftar Antrean Servis Anda</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">NO. SERVIS</th>
                  <th className="px-6 py-4 font-semibold">PERANGKAT</th>
                  <th className="px-6 py-4 font-semibold">KELUHAN</th>
                  <th className="px-6 py-4 font-semibold text-center">AKSI</th>
                </tr>
              </thead>
              <motion.tbody>
                {myTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Tidak ada tugas aktif saat ini. Bagus!</td>
                  </tr>
                ) : (
                  myTasks.map((order, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={order.id} 
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">{order.noServis}</td>
                      <td className="px-6 py-4">{order.jenisPerangkat} - {order.merkModel}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-gray-600">{order.keluhan}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2 text-xs"
                        >
                          <Wrench size={14} /> Kerjakan
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>
        </motion.div>

        {/* Tugas Belum Diambil */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-yellow-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-600" />
              Tugas Belum Diambil ({unassignedTasks.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">NO. SERVIS</th>
                  <th className="px-6 py-4 font-semibold">PERANGKAT</th>
                  <th className="px-6 py-4 font-semibold">KELUHAN</th>
                  <th className="px-6 py-4 font-semibold text-center">AKSI</th>
                </tr>
              </thead>
              <motion.tbody>
                {unassignedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Semua tugas sudah ada teknisinya.</td>
                  </tr>
                ) : (
                  unassignedTasks.map((order, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={order.id} 
                      className="border-b border-gray-50 hover:bg-yellow-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">{order.noServis}</td>
                      <td className="px-6 py-4">{order.jenisPerangkat} - {order.merkModel}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-gray-600">{order.keluhan}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors shadow-sm inline-flex items-center gap-2 text-xs"
                        >
                          <Eye size={14} /> Lihat Detail
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ---------------------------------------------------------
  // ADMIN DASHBOARD LOGIC
  // ---------------------------------------------------------
  const ordersMasuk = orders.filter(o => o.status === 'MASUK').length;
  const ordersProses = orders.filter(o => o.status === 'PROSES' || o.status === 'DIAGNOSA' || o.status === 'MENUNGGU_SPAREPART').length;
  const ordersSelesai = orders.filter(o => o.status === 'SELESAI').length;

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.nama || 'Unknown';
  
  const stokMenipis = spareparts.filter(s => s.stok <= (s.minStok || 0));
  const perangkatBelumDiambil = orders.filter(o => o.status === 'SELESAI');

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

  const pieData = useMemo(() => {
    if (orders.length === 0) return [{ name: 'Belum Ada Data', value: 1, color: '#e5e7eb' }];
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      const raw = o.jenisPerangkat?.trim() || 'Lainnya';
      const category = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      counts[category] = (counts[category] || 0) + 1;
    });
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#8b5cf6', '#a78bfa', '#c4b5fd'];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
  }, [orders]);

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
        if (orderDate === dateString) masuk++;
        if (o.status === 'SELESAI' || o.status === 'DIAMBIL') {
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
    <motion.div 
      className="p-8 w-full min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Halo, {currentUser?.name || (userRole === 'OWNER' ? 'Owner' : 'Admin')}! 👋</h1>
        <p className="text-gray-500">Selamat datang di Ringkasan {userRole === 'OWNER' ? 'Bisnis' : 'Operasional'} ServisKu hari ini.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Incoming Orders */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 cursor-pointer"
        >
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
        </motion.div>

        {/* Card 2: In Progress */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 cursor-pointer"
        >
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
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${orders.length > 0 ? (ordersProses / orders.length) * 100 : 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-blue-600 h-full rounded-full" 
            />
          </div>
        </motion.div>

        {/* Card 3: Ready for Pickup */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 cursor-pointer"
        >
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
        </motion.div>

        {/* Card 4: Revenue */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-40 cursor-pointer"
        >
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
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Spans 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Urgent Notifications */}
          <motion.div variants={itemVariants} className="bg-[#eef2ff] p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-orange-500" />
              <h2 className="font-bold text-gray-900">Notifikasi Mendesak</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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

              <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
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
          </motion.div>

          {/* Latest Orders Table */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
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
                    <th className="px-6 py-4 font-semibold text-center">STATUS</th>
                    <th className="px-6 py-4 font-semibold text-center">AKSI</th>
                  </tr>
                </thead>
                <motion.tbody>
                  {orders.slice(0, 5).map((order, index) => {
                    const statusColors: any = {
                      'MASUK': 'bg-blue-50 text-blue-600 border-blue-200',
                      'PROSES': 'bg-yellow-50 text-yellow-600 border-yellow-200',
                      'DIAGNOSA': 'bg-orange-50 text-orange-600 border-orange-200',
                      'SELESAI': 'bg-green-50 text-green-600 border-green-200',
                      'BATAL': 'bg-red-50 text-red-600 border-red-200',
                      'DIAMBIL': 'bg-gray-100 text-gray-600 border-gray-300',
                    };
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        key={order.id} 
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-900">{order.noServis}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{getCustomerName(order.pelangganId)}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{order.jenisPerangkat}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs transition-colors shadow-sm mx-auto"
                          >
                            <Eye size={14} /> Detail
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[280px] flex flex-col">
            <h2 className="font-bold text-gray-900 mb-4">Distribusi Servis</h2>
            <div className="flex-1 flex items-center relative">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Peringatan Inventaris</h2>
              <button onClick={() => navigate('/stok')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
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
        </motion.div>
      </div>
    </motion.div>
  );
};
