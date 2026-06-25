import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Printer, Banknote, Cpu, QrCode, MoreHorizontal, ShieldCheck, MonitorSmartphone, User } from 'lucide-react';
import toast from 'react-hot-toast';

export const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, customers, spareparts, updateOrderStatus } = useStore();
  
  const [metodeBayar, setMetodeBayar] = useState<'TUNAI' | 'TRANSFER'>('TUNAI');
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [diskon] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const order = orders.find(o => o.id === id);
  const [isNotaVisible, setIsNotaVisible] = useState(order?.status === 'DIAMBIL');
  const customer = customers.find(c => c.id === order?.pelangganId);
  
  // Get all spareparts details for this order
  const orderSpareparts = (order?.spareparts || []).map(sp => {
    const detail = spareparts.find(s => s.id === sp.id);
    return { ...sp, detail };
  }).filter(sp => sp.detail);

  if (!order || !customer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl text-gray-700">Order tidak ditemukan</h2>
        <Button onClick={() => navigate('/order')} className="mt-4">Kembali ke Daftar Order</Button>
      </div>
    );
  }

  const numDiskon = Number(diskon) || 0;
  
  const totalSparepartCost = orderSpareparts.reduce((sum, sp) => sum + (sp.detail!.harga * sp.qty), 0);
  const totalPajak = orderSpareparts.reduce((sum, sp) => {
    const pajakPercent = sp.detail!.pajak || 0;
    const itemCost = sp.detail!.harga * sp.qty;
    return sum + (itemCost * (pajakPercent / 100));
  }, 0);
  
  const totalBiaya = (order.biayaJasa ?? 0) + totalSparepartCost + totalPajak - numDiskon;
  
  const jumlahDibayar = Number(jumlahBayar) || 0;
  const kembalian = jumlahDibayar - totalBiaya;
  const isValid = jumlahDibayar >= totalBiaya;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (order.status === 'BATAL') {
        updateOrderStatus(order.id, 'BATAL_SIAP_DIAMBIL');
      } else {
        updateOrderStatus(order.id, 'SIAP_DIAMBIL');
      }
      setIsNotaVisible(true);
      toast.success('Pembayaran berhasil diproses!');
      setIsSubmitting(false);
    }, 1000);
  };

  if (isNotaVisible) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-none border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-widest">ITC COMPUTER</h1>
            <p className="text-sm text-gray-500">Jl. Siliwangi No. 123, Tasikmalaya | Telp: 0812-3456-7890</p>
            <div className="border-b-2 border-dashed border-gray-300 my-4"></div>
          </div>
          
          <div className="grid grid-cols-2 text-sm mb-6">
            <div>
              <p>No. Servis: <span className="font-semibold">{order.noServis}</span></p>
              <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div className="text-right">
              <p>Pelanggan: <span className="font-semibold">{customer.nama}</span></p>
              <p>No. HP: {customer.noHp}</p>
            </div>
          </div>
          
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Detail Perbaikan</h3>
            <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Perangkat:</span> {order.jenisPerangkat} {order.merkModel}</p>
            <p className="text-sm"><span className="text-gray-500 w-24 inline-block">Keluhan:</span> {order.keluhan}</p>
          </div>

          <table className="w-full text-sm mb-6">
            <tbody>
              <tr>
                <td className="py-2">Biaya Jasa Servis</td>
                <td className="text-right py-2">Rp {(order.biayaJasa ?? 0).toLocaleString('id-ID')}</td>
              </tr>
              {orderSpareparts.map((sp, idx) => (
                <tr key={idx}>
                  <td className="py-2">Sparepart: {sp.detail!.nama} (x{sp.qty})</td>
                  <td className="text-right py-2">Rp {(sp.detail!.harga * sp.qty).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {totalPajak > 0 && (
                <tr>
                  <td className="py-2 text-gray-600">Pajak (PPN)</td>
                  <td className="text-right py-2">Rp {totalPajak.toLocaleString('id-ID')}</td>
                </tr>
              )}
              {numDiskon > 0 && (
                <tr>
                  <td className="py-2 text-red-600">Diskon</td>
                  <td className="text-right py-2 text-red-600">- Rp {numDiskon.toLocaleString('id-ID')}</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-800 font-bold text-lg">
                <td className="py-3">TOTAL</td>
                <td className="text-right py-3">Rp {totalBiaya.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-1">Dibayar ({metodeBayar})</td>
                <td className="text-right py-1">Rp {jumlahDibayar.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td className="py-1">Kembali</td>
                <td className="text-right py-1">Rp {kembalian > 0 ? kembalian.toLocaleString('id-ID') : '0'}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-center text-sm text-gray-500 mt-12 mb-8 print:mb-0">
            <p>Garansi servis 30 hari.</p>
            <p>Terima kasih atas kepercayaan Anda kepada kami!</p>
          </div>
        </div>
        
        <div className="mt-8 flex gap-3 justify-center print:hidden">
          <Button variant="secondary" onClick={() => navigate(`/order/${order.id}`)}>Kembali ke Order</Button>
          <Button onClick={() => window.print()} leftIcon={<Printer size={18}/>}>Cetak Nota</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full min-h-screen pb-24 bg-[#f8fafc]">
      <Breadcrumb items={[
        { label: 'Order Servis', href: '/order' },
        { label: order.noServis, href: `/order/${order.id}` },
        { label: 'Proses Pembayaran' }
      ]} />

      <div className="w-full mt-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proses Pembayaran</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate(`/order/${order.id}`)}>Batalkan Transaksi</Button>
            <Button variant="primary">Simpan Draft</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* KIRI - Rincian Tagihan */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Rincian Tagihan</h2>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wider">
                  SERVICE ID: {order.noServis.split('-').pop()}
                </div>
              </div>

              {/* Jasa Perbaikan */}
              <div className="bg-[#f0f7ff] rounded-2xl p-5 mb-6 flex justify-between items-center border border-blue-100/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Jasa Perbaikan<br/>Hardware</h3>
                  <p className="text-xs text-gray-500">Biaya Pemeriksaan & Perbaikan</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-700 text-xl">Rp {(order.biayaJasa ?? 0).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Suku Cadang */}
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Suku Cadang / Parts</p>
                <div className="space-y-4">
                  {orderSpareparts.length > 0 ? orderSpareparts.map((sp, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 transition-colors">
                          <Cpu size={20} className="text-gray-500 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{sp.detail!.nama}</p>
                          <p className="text-xs text-gray-500">{sp.qty} x Rp {sp.detail!.harga.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-sm">
                        Rp {(sp.detail!.harga * sp.qty).toLocaleString('id-ID')}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-400 italic">Tidak ada penggunaan sparepart</p>
                  )}
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 my-6"></div>

              {/* Subtotal & PPN */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-gray-500">Rp {((order.biayaJasa ?? 0) + totalSparepartCost).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">PPN (11%)</span>
                  <span className="text-gray-500">Rp {totalPajak.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Total Tagihan */}
              <div className="flex justify-between items-end">
                <h3 className="font-bold text-gray-900 text-xl">Total<br/>Tagihan</h3>
                <p className="font-bold text-blue-700 text-4xl tracking-tight">Rp {totalBiaya.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* KANAN - Proses Pembayaran */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Proses Pembayaran</h2>

              <p className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">Pilih Metode Pembayaran</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setMetodeBayar('TUNAI')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    metodeBayar === 'TUNAI' 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                    <Banknote size={24} className="text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-900">Tunai</span>
                  <span className="text-xs text-gray-500 mt-1">Bayar di kasir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetodeBayar('TRANSFER')}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                    metodeBayar === 'TRANSFER' 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                    <QrCode size={24} className="text-gray-600" />
                  </div>
                  <span className="font-bold text-gray-900">QRIS / Transfer</span>
                  <span className="text-xs text-gray-500 mt-1">Otomatis Terverifikasi</span>
                </button>
              </div>

              <p className="text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase">Jumlah Uang Diterima</p>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold text-2xl">Rp</span>
                </div>
                <input
                  type="text"
                  className="block w-full bg-gray-50 border-0 rounded-2xl pl-16 pr-6 py-6 text-4xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  placeholder="0"
                  value={jumlahBayar ? Number(jumlahBayar).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    setJumlahBayar(rawValue);
                  }}
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 tracking-wider mb-1 uppercase">Kembalian</p>
                  <p className="text-3xl font-bold text-gray-900">
                    Rp {kembalian > 0 ? kembalian.toLocaleString('id-ID') : '0'}
                  </p>
                </div>
                <button className="w-10 h-10 bg-gray-200/50 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <form onSubmit={handlePayment}>
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="w-full bg-[#0047b3] hover:bg-blue-800 text-white font-bold text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/20"
                >
                  <Printer size={22} /> Konfirmasi Pembayaran & Cetak Nota
                </button>
              </form>
              
              <div className="mt-4 flex justify-center items-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={14} />
                <span>Transaksi dienkripsi & aman dengan standar ISO 27001</span>
              </div>
            </div>

            {/* Info Cards Bottom */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MonitorSmartphone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Perangkat</p>
                  <p className="font-bold text-gray-900 text-sm truncate">{order.jenisPerangkat} {order.merkModel}</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">Pelanggan</p>
                  <p className="font-bold text-gray-900 text-sm truncate">{customer.nama}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
