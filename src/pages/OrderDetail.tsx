import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { StatusBadge, type StatusOrder } from '../components/ui/StatusBadge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Printer, Wallet, MessageCircle, Plus, Edit2, Package, Trash2, User, MonitorSmartphone, Wrench, Phone, BookOpen, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../components/ui/Modal';
import { sendWhatsAppMessage } from '../utils/whatsappLink';

/**
 * Helper: Memformat string angka mentah menjadi format uang dengan titik pemisah ribuan.
 * @param val String angka mentah
 * @returns String yang diformat (misal: "1.000.000")
 */
const formatRibuan = (val: string) => {
  let num = val.replace(/\D/g, '');
  if (num.startsWith('0')) num = num.replace(/^0+/, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const getStepIndex = (status: StatusOrder): number => {
  if (['BATAL', 'BATAL_SIAP_DIAMBIL', 'BATAL_DIAMBIL'].includes(status)) return -1;
  if (status === 'MASUK') return 0;
  if (['DIAGNOSA', 'MENUNGGU_KONFIRMASI'].includes(status)) return 1;
  if (status === 'MENUNGGU_SPAREPART') return 2;
  if (status === 'PROSES') return 3;
  if (['SELESAI', 'SIAP_DIAMBIL'].includes(status)) return 4;
  if (status === 'DIAMBIL') return 5;
  return 0;
};

const OrderStepper: React.FC<{ currentStatus: StatusOrder; orderDate: string }> = ({ currentStatus, orderDate }) => {
  const steps = [
    { label: 'Diterima' },
    { label: 'Diagnosa' },
    { label: 'Tunggu Part' },
    { label: 'Perbaikan' },
    { label: 'Selesai' },
    { label: 'Diambil' }
  ];
  
  const currentIndex = getStepIndex(currentStatus);
  const isCanceled = currentIndex === -1;
  
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-full flex flex-col justify-center overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-900 mb-6">Riwayat Perbaikan</h2>
      
      {isCanceled ? (
        <div className="text-center py-4 bg-red-50 text-red-700 rounded-lg font-medium border border-red-100">
          Pesanan Dibatalkan
        </div>
      ) : (
        <div className="flex w-full max-w-4xl mx-auto pb-10 px-0 sm:px-6">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isLast = index === steps.length - 1;
            
            const d = new Date(orderDate);
            d.setDate(d.getDate() + index);
            const stepDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            
            return (
              <React.Fragment key={index}>
                {/* Step Node */}
                <div className="relative flex flex-col items-center flex-shrink-0" style={{ width: '80px' }}>
                  <div className="h-10 w-full flex justify-center relative">
                    {isCurrent && (
                      <div className="absolute w-10 h-10 rounded-full bg-blue-400 animate-ping opacity-75" />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                      isCompleted 
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-50 border-2 border-gray-100'
                    }`}>
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full border-[1.5px] border-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute top-12 w-24 text-center left-1/2 -translate-x-1/2">
                    <p className={`text-[11px] sm:text-xs font-semibold ${isCompleted ? (isCurrent ? 'text-blue-600' : 'text-gray-700') : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {isCompleted && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{stepDate}</p>
                    )}
                  </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="flex-1 h-10 flex items-center -mx-4 z-0">
                    <div className={`h-[2px] w-full transition-colors duration-500 ${index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Helper: Mengembalikan format ribuan kembali ke string angka mentah yang bisa di-parse.
 * @param val String terformat (misal: "1.000.000")
 * @returns String angka murni (misal: "1000000")
 */
const parseRibuan = (val: string) => val.replace(/\./g, '');

/**
 * Helper: Menentukan dropdown status yang tersedia berdasarkan status order saat ini.
 * Mencegah pengguna mengubah status secara tidak logis (misal: dari DIAMBIL kembali ke PROSES).
 * 
 * @param currentStatus - Status order saat ini
 * @returns Array dari status yang diperbolehkan
 */
const getAvailableStatusOptions = (currentStatus: StatusOrder | undefined): StatusOrder[] => {
  if (currentStatus === 'DIAMBIL') return ['DIAMBIL'];
  if (currentStatus === 'BATAL_DIAMBIL') return ['BATAL_DIAMBIL'];
  if (currentStatus === 'SIAP_DIAMBIL') return ['SIAP_DIAMBIL', 'DIAMBIL'];
  if (currentStatus === 'BATAL_SIAP_DIAMBIL') return ['BATAL_SIAP_DIAMBIL', 'BATAL_DIAMBIL'];
  
  if (currentStatus === 'SELESAI') return ['SELESAI', 'SIAP_DIAMBIL'];
  if (currentStatus === 'BATAL') return ['BATAL', 'BATAL_SIAP_DIAMBIL'];

  if (currentStatus === 'MENUNGGU_KONFIRMASI' || currentStatus === 'PROSES' || currentStatus === 'MENUNGGU_SPAREPART') {
    return ['MENUNGGU_KONFIRMASI', 'PROSES', 'MENUNGGU_SPAREPART', 'SELESAI', 'BATAL'];
  }

  if (currentStatus === 'DIAGNOSA') {
    return ['DIAGNOSA', 'MENUNGGU_KONFIRMASI', 'PROSES', 'MENUNGGU_SPAREPART', 'SELESAI', 'BATAL'];
  }

  if (currentStatus === 'MASUK') {
    return ['MASUK', 'DIAGNOSA', 'MENUNGGU_KONFIRMASI', 'PROSES', 'MENUNGGU_SPAREPART', 'SELESAI', 'BATAL'];
  }
  
  return ['MASUK', 'DIAGNOSA', 'MENUNGGU_KONFIRMASI', 'PROSES', 'MENUNGGU_SPAREPART', 'SELESAI', 'BATAL'];
};

/**
 * Komponen Detail Order Servis
 * Berfungsi sebagai POS (Point of Sales) dan pusat kontrol pengerjaan satu perangkat.
 * Mencakup penambahan sparepart, pengubahan biaya jasa, pencetakan struk, dan update status.
 */
export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, customers, spareparts, technicians, updateOrderStatus, updateOrder, userRole, userId, users } = useStore();
  
  const currentUser = users.find(u => u.id === userId);
  const currentTech = currentUser ? technicians.find(t => t.name === currentUser.name) : undefined;
  const technicianId = currentTech?.id;
  
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<StatusOrder | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [sendWA, setSendWA] = useState(true);
  
  const [isEditBiayaOpen, setIsEditBiayaOpen] = useState(false);
  const [editBiayaValue, setEditBiayaValue] = useState('');

  const [isEditJasaOpen, setIsEditJasaOpen] = useState(false);
  const [editJasaValue, setEditJasaValue] = useState('');

  const [isAddJasaOpen, setIsAddJasaOpen] = useState(false);
  const [jasaName, setJasaName] = useState('');
  const [jasaPrice, setJasaPrice] = useState('');

  const [isEditDiagnosaOpen, setIsEditDiagnosaOpen] = useState(false);
  const [editDiagnosaValue, setEditDiagnosaValue] = useState('');

  const [isAddSparepartOpen, setIsAddSparepartOpen] = useState(false);
  const [selectedSparepartId, setSelectedSparepartId] = useState('');
  const [selectedSparepartQty, setSelectedSparepartQty] = useState('1');

  const [isEditTeknisiOpen, setIsEditTeknisiOpen] = useState(false);
  const [editTeknisiValue, setEditTeknisiValue] = useState('');

  const [isPrintVisible, setIsPrintVisible] = useState(false);
  
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');

  const order = orders.find(o => o.id === id);
  const customer = customers.find(c => c.id === order?.pelangganId);
  
  const orderSpareparts = (order?.spareparts || []).map(sp => {
    const detail = spareparts.find(s => s.id === sp.id);
    return { ...sp, detail };
  }).filter(sp => sp.detail);

  const assignedTechnician = technicians.find(t => t.id === order?.teknisiId);

  // Jika yang login teknisi, dia hanya bisa melihat (read-only) jika order ini sudah diambil teknisi LAIN
  const isReadOnly = userRole === 'TEKNISI' && !!order?.teknisiId && order.teknisiId !== technicianId;

  const handleClaimJob = () => {
    if (order && technicianId) {
      updateOrder(order.id, { teknisiId: technicianId });
      toast.success('Pekerjaan berhasil diambil. Selamat bekerja!');
    }
  };

  const handleReleaseJob = () => {
    setIsReleaseModalOpen(true);
    setReleaseReason('');
  };

  const confirmReleaseJob = () => {
    if (releaseReason && releaseReason.trim() !== '') {
      if (order) {
        updateOrder(order.id, { 
          teknisiId: '', // kosongkan
          catatanInternal: order.catatanInternal ? `${order.catatanInternal}\n[LEPAS TUGAS]: ${releaseReason}` : `[LEPAS TUGAS]: ${releaseReason}` 
        });
        toast.success('Pekerjaan berhasil dilepas.');
        setIsReleaseModalOpen(false);
      }
    } else {
      toast.error('Alasan wajib diisi untuk melepas pekerjaan!');
    }
  };

  // Auto-generate WA text based on selected status
  useEffect(() => {
    if (newStatus === 'MENUNGGU_KONFIRMASI' && order) {
      setStatusNote(`Berdasarkan hasil diagnosa, kerusakan pada perangkat adalah: ${order.hasilDiagnosa || '... (isi detail kerusakan di sini)'}. Total biaya perbaikan menjadi Rp${order.estimasiBiaya.toLocaleString('id-ID')}. Mohon konfirmasinya apakah ingin dilanjut ke proses perbaikan?`);
    } else if (newStatus === 'BATAL' && order) {
      setStatusNote(`Halo, menginformasikan bahwa servis untuk perangkat ${order.jenisPerangkat} ${order.merkModel} dibatalkan sesuai konfirmasi. Perangkat sudah bisa diambil kembali di toko. Total biaya administrasi/pengecekan: Rp${order.estimasiBiaya.toLocaleString('id-ID')}.`);
    } else {
      setStatusNote('');
    }
  }, [newStatus, order]);

  if (!order || !customer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl text-gray-700">Order tidak ditemukan</h2>
        <Button onClick={() => navigate('/order')} className="mt-4">Kembali ke Daftar Order</Button>
      </div>
    );
  }

  if (isPrintVisible) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        {/* Print Content */}
        <div className="bg-white p-8 rounded-none border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
          
          {/* Tanda Terima (Untuk Pelanggan) */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold tracking-widest">ITC COMPUTER</h1>
              <p className="text-sm text-gray-500">Jl. Siliwangi No. 123, Tasikmalaya | Telp: 0812-3456-7890</p>
              <h2 className="text-lg font-bold mt-4 border-y py-2 uppercase">Tanda Terima Servis</h2>
            </div>
            
            <div className="grid grid-cols-2 text-sm mb-6">
              <div>
                <p>No. Servis: <span className="font-semibold">{order.noServis}</span></p>
                <p>Tanggal: {new Date(order.tanggalMasuk).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="text-right">
                <p>Pelanggan: <span className="font-semibold">{customer.nama}</span></p>
                <p>No. HP: {customer.noHp}</p>
                {customer.email && <p>Email: {customer.email}</p>}
              </div>
            </div>
            
            <table className="w-full text-sm mb-6 border-collapse border border-gray-300">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-50 font-semibold w-1/3 border-r border-gray-300">Perangkat</td>
                  <td className="py-2 px-3">{order.jenisPerangkat} - {order.merkModel}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-3 bg-gray-50 font-semibold border-r border-gray-300">Kelengkapan</td>
                  <td className="py-2 px-3">{order.kelengkapan?.join(', ') || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 bg-gray-50 font-semibold border-r border-gray-300">Keluhan</td>
                  <td className="py-2 px-3 text-red-700">{order.keluhan}</td>
                </tr>
              </tbody>
            </table>
            <div className="text-xs text-gray-500 text-justify mb-4 space-y-1">
              <p>* Harap bawa tanda terima ini saat mengambil perangkat.</p>
              <p>* Perangkat yang tidak diambil dalam waktu 3 bulan di luar tanggung jawab kami.</p>
              <p>* Biaya dapat berubah setelah dilakukan diagnosa lebih lanjut oleh teknisi.</p>
            </div>
            <div className="flex justify-between text-sm mt-8 text-center px-8">
              <div>
                <p className="mb-12">Penerima (Frontline)</p>
                <p className="font-semibold border-t border-gray-400 pt-1">Admin Servis</p>
              </div>
              <div>
                <p className="mb-12">Pelanggan</p>
                <p className="font-semibold border-t border-gray-400 pt-1">{customer.nama}</p>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-gray-400 my-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-gray-400 text-xs">✂️ Potong di sini ✂️</span>
          </div>

          {/* Label Teknisi (Ditempel di Perangkat) */}
          <div className="border-2 border-gray-800 p-4 w-2/3 mx-auto mt-12 bg-yellow-50">
            <h2 className="text-center font-black text-xl mb-2 border-b-2 border-gray-800 pb-2">LABEL TEKNISI</h2>
            <div className="space-y-2 text-sm font-bold">
              <p className="text-2xl text-center text-primary mb-4">{order.noServis}</p>
              <p className="flex justify-between border-b border-gray-300 pb-1"><span>Nama:</span> <span>{customer.nama}</span></p>
              <p className="flex justify-between border-b border-gray-300 pb-1"><span>Tgl Masuk:</span> <span>{new Date(order.tanggalMasuk).toLocaleDateString('id-ID')}</span></p>
              <p className="flex justify-between border-b border-gray-300 pb-1"><span>Unit:</span> <span>{order.jenisPerangkat} {order.merkModel}</span></p>
              <div>
                <p className="mt-2 text-gray-600">Keluhan:</p>
                <p className="text-red-700 bg-white p-2 border border-gray-200 mt-1">{order.keluhan}</p>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="mt-8 flex gap-3 justify-center print:hidden">
          <Button variant="secondary" onClick={() => setIsPrintVisible(false)}>Kembali ke Detail</Button>
          <Button onClick={() => window.print()} leftIcon={<Printer size={18}/>}>Cetak Sekarang</Button>
        </div>
      </div>
    );
  }

  const handleOpenUpdate = () => {
    setNewStatus(order.status);
    setStatusNote('');
    setSendWA(true);
    setIsUpdateStatusOpen(true);
  };

  /**
   * Menangani penyimpanan perubahan status pesanan.
   * Termasuk mengirimkan notifikasi WA dan melakukan pengembalian stok jika dibatalkan.
   */
  const handleSaveStatus = () => {
    if (!newStatus) return;
    
    if (newStatus === 'DIAMBIL') {
       toast('Jangan lupa mencatat pembayaran sebelum status final diambil.', { icon: '⚠️' });
    }

    // LOGIC FLAW FIX: Kembalikan stok jika pesanan dibatalkan dan ada sparepart yang sudah dialokasikan
    if ((newStatus === 'BATAL' || newStatus === 'BATAL_SIAP_DIAMBIL' || newStatus === 'BATAL_DIAMBIL') && order.status !== 'BATAL' && order.status !== 'BATAL_SIAP_DIAMBIL' && order.status !== 'BATAL_DIAMBIL') {
      const currentSp = order.spareparts || [];
      if (currentSp.length > 0) {
        currentSp.forEach(sp => {
          useStore.getState().tambahMutasiStok({
            sparepartId: sp.id,
            tipe: 'IN',
            qty: sp.qty,
            keterangan: `Pengembalian otomatis karena order #${order.noServis} dibatalkan`
          });
        });
        // Kosongkan sparepart dari order yang dibatalkan
        if (updateOrder) {
          updateOrder(order.id, { spareparts: [] });
        }
        toast.success('Sparepart yang terpakai telah dikembalikan ke stok gudang.');
      }
    }

    updateOrderStatus(order.id, newStatus);
    
    if (statusNote) {
      if (updateOrder) {
        updateOrder(order.id, { catatanInternal: order.catatanInternal ? `${order.catatanInternal}\n[${newStatus}]: ${statusNote}` : `[${newStatus}]: ${statusNote}` });
      }
    }

    toast.success(`Status berhasil diperbarui ke ${newStatus}`);
    
    if (sendWA) {
      const msg = `Halo ${customer.nama}, status servis Anda (${order.noServis}) saat ini adalah: *${newStatus}*.\n\nCatatan:\n${statusNote || '-'}\n\nTerima kasih — ITC Computer.`;
      setTimeout(() => {
        toast.success('WhatsApp dibuka di tab baru');
        sendWhatsAppMessage(customer.noHp, msg);
      }, 500);
    }
    
    setIsUpdateStatusOpen(false);
  };

  const handleWA = () => {
    sendWhatsAppMessage(customer.noHp, `Halo ${customer.nama}, `);
  };

  const handleSaveBiaya = (e: React.FormEvent) => {
    e.preventDefault();
    if (order) {
      updateOrder(order.id, { estimasiBiaya: Number(editBiayaValue) });
      toast.success('Estimasi perkiraan berhasil diperbarui');
      setIsEditBiayaOpen(false);
    }
  };

  const handleSaveJasa = (e: React.FormEvent) => {
    e.preventDefault();
    if (order) {
      updateOrder(order.id, { biayaJasa: Number(editJasaValue) });
      toast.success('Biaya jasa servis berhasil diperbarui');
      setIsEditJasaOpen(false);
    }
  };

  const handleSaveDiagnosa = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrder(order.id, { hasilDiagnosa: editDiagnosaValue });
    toast.success('Hasil diagnosa berhasil diperbarui');
    setIsEditDiagnosaOpen(false);
  };

  const handleSaveTeknisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (order) {
      updateOrder(order.id, { teknisiId: editTeknisiValue || undefined });
      toast.success('Teknisi berhasil diperbarui');
      setIsEditTeknisiOpen(false);
    }
  };

  const handleAddSparepartToOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSparepartId !== '' && Number(selectedSparepartQty) > 0) {
      const qty = Number(selectedSparepartQty);
      
      // Cek stok apakah cukup
      const sp = spareparts.find(s => s.id === selectedSparepartId);
      if (!sp || sp.stok < qty) {
        toast.error('Stok tidak mencukupi!');
        return;
      }

      const currentSp = order.spareparts || [];
      const existingIdx = currentSp.findIndex(sp => sp.id === selectedSparepartId);
      
      let newSp = [...currentSp];
      if (existingIdx >= 0) {
        newSp[existingIdx].qty += qty;
      } else {
        newSp.push({ id: selectedSparepartId, qty: qty });
      }

      updateOrder(order.id, { spareparts: newSp });
      
      // Catat Mutasi Keluar & Kurangi Stok
      useStore.getState().tambahMutasiStok({
        sparepartId: selectedSparepartId,
        tipe: 'OUT',
        qty: qty,
        keterangan: `Dipakai untuk Servis #${order.noServis}`
      });

      toast.success('Sparepart berhasil ditambahkan ke order');
      setIsAddSparepartOpen(false);
      setSelectedSparepartId('');
      setSelectedSparepartQty('1');
    }
  };

  const handleRemoveSparepart = (idToRemove: string) => {
    const currentSp = order.spareparts || [];
    const spToRemove = currentSp.find(sp => sp.id === idToRemove);
    
    if (spToRemove) {
      updateOrder(order.id, { spareparts: currentSp.filter(sp => sp.id !== idToRemove) });
      
      // Kembalikan Stok (Mutasi Masuk)
      useStore.getState().tambahMutasiStok({
        sparepartId: idToRemove,
        tipe: 'IN',
        qty: spToRemove.qty,
        keterangan: `Batal dipakai untuk Servis #${order.noServis}`
      });
      
      toast.success('Sparepart dihapus dari order (Stok dikembalikan)');
    }
  };

  const handleAddJasa = (e: React.FormEvent) => {
    e.preventDefault();
    if (jasaName && jasaPrice && order) {
      const newJasa = {
        id: 'JASA-' + Date.now(),
        nama: jasaName,
        harga: parseInt(parseRibuan(jasaPrice)) || 0
      };
      const currentJasa = order.jasa || [];
      updateOrder(order.id, { jasa: [...currentJasa, newJasa] });
      toast.success('Jasa berhasil ditambahkan');
      setIsAddJasaOpen(false);
      setJasaName('');
      setJasaPrice('');
    }
  };

  const handleRemoveJasa = (idToRemove: string) => {
    if (order) {
      const currentJasa = order.jasa || [];
      updateOrder(order.id, { jasa: currentJasa.filter(j => j.id !== idToRemove) });
      toast.success('Jasa dihapus');
    }
  };

  const pastOrders = orders.filter(o => o.pelangganId === customer.id && o.id !== order.id);

  const totalSparepartCost = orderSpareparts.reduce((sum, sp) => sum + (sp.detail!.harga * sp.qty), 0);
  const totalPajak = orderSpareparts.reduce((sum, sp) => sum + ((sp.detail!.harga * sp.qty) * ((sp.detail!.pajak || 0) / 100)), 0);
  const totalCustomJasa = (order.jasa || []).reduce((sum, j) => sum + j.harga, 0);
  const totalBiaya = (order.biayaJasa ?? 0) + totalSparepartCost + totalPajak + totalCustomJasa;

  return (
    <div className="p-8 w-full min-h-screen pb-24 bg-gray-50/30">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Order Servis', href: '/order' },
        { label: order.noServis }
      ]} />

      <div className="w-full mt-4">
        {/* Header Title & Actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Order #{order.noServis}</h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              {order.prioritas === 'URGENT' ? (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Mendesak</span>
              ) : order.prioritas === 'HIGH' ? (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Tinggi</span>
              ) : (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">Normal</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['OWNER', 'FRONTLINE'].includes(userRole || '') && (
              <Button variant="secondary" onClick={() => setIsPrintVisible(true)} leftIcon={<Printer size={16} />} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
                Cetak Label
              </Button>
            )}
            <Button variant="primary" onClick={handleWA} leftIcon={<MessageCircle size={16} />} className="!bg-green-500 hover:!bg-green-600 text-white border-transparent">
              Kirim WA
            </Button>
            {!['DIAMBIL', 'BATAL_DIAMBIL'].includes(order.status) && (
              <Button variant="primary" onClick={handleOpenUpdate} className="bg-blue-600 hover:bg-blue-700">Update Status</Button>
            )}
            {['OWNER', 'FINANCE', 'FRONTLINE'].includes(userRole || '') && ['SELESAI', 'BATAL'].includes(order.status) && (
              <Button variant="primary" onClick={() => navigate(`/order/${order.id}/bayar`)} leftIcon={<Wallet size={16} />} className="bg-emerald-600 hover:bg-emerald-700 border-none">
                Pembayaran
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <OrderStepper currentStatus={order.status} orderDate={order.tanggalMasuk} />
          </div>
          <div className="xl:col-span-1">
            {/* Timeline Status */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 h-full flex flex-col justify-center">
              <h2 className="text-sm font-semibold text-gray-900 mb-6">Status Timeline</h2>
              <div className="relative border-l-2 border-gray-100 ml-2.5 space-y-7">
                
                {/* Current Status & History */}
                {(order.history || []).length > 0 ? (
                  [...(order.history || [])].reverse().map((h, i) => (
                    <div key={i} className="relative pl-6">
                      <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1 ring-4 ring-white shadow-sm ${i === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                      <h3 className={`text-sm font-bold ${i === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{h.status}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(h.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        <br/><span className="text-[10px] text-gray-400">Oleh: {h.by}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-[7px] top-1 ring-4 ring-white shadow-sm"></div>
                    <h3 className="text-sm font-bold text-gray-900">{order.status}</h3>
                    <p className="text-xs text-gray-500 mt-1">Status Saat Ini</p>
                  </div>
                )}

                {/* Status Masuk (Bottom) */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1 ring-4 ring-white"></div>
                  <h3 className="text-sm font-bold text-gray-500">MASUK</h3>
                  <p className="text-xs text-gray-400 mt-1">{new Date(order.tanggalMasuk).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Kolom Kiri (Utama) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Top Row: Info Perangkat & Info Pelanggan (Separate Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card Info Perangkat */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <MonitorSmartphone size={18} className="text-blue-500" /> Info Perangkat
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Jenis</span>
                    <span className="text-sm font-medium text-gray-900">{order.jenisPerangkat}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Merek & Model</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{order.merkModel || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">No. Seri</span>
                    <span className="text-sm font-medium text-gray-900 uppercase">{order.noSeri || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Card Info Pelanggan */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <User size={18} className="text-blue-500" /> Info Pelanggan
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Nama</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{customer.nama}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">No. HP</span>
                    <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 text-right" onClick={handleWA}>{customer.noHp}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{customer.email || '-'}</span>
                  </div>

                  <div className="flex justify-between items-start py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Alamat</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{customer.alamat || '-'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Card Keluhan Pelanggan */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-500" /> Keluhan Pelanggan
              </h2>
              <p className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">{order.keluhan}</p>
            </div>

            {/* Card Kelengkapan & Biaya */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">KELENGKAPAN PERANGKAT</p>
                  <div className="flex flex-wrap gap-2">
                    {order.kelengkapan && order.kelengkapan.length > 0 ? (
                      order.kelengkapan.map((item, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">-</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 relative group min-w-[150px] text-right shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PERKIRAAN BIAYA</p>
                  <p className="text-base font-bold text-gray-900">Rp {order.estimasiBiaya.toLocaleString('id-ID')}</p>
                  {order.status !== 'DIAMBIL' && (
                    <button onClick={() => { setEditBiayaValue(order.estimasiBiaya.toString()); setIsEditBiayaOpen(true); }} className="absolute -top-2 -right-2 bg-white text-gray-500 hover:text-blue-600 p-2 rounded-full shadow-md border border-gray-200 transition-all opacity-40 hover:opacity-100 group-hover:opacity-100">
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Card Penggunaan Sparepart & Jasa */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Wrench size={18} className="text-blue-500" /> Penggunaan Sparepart & Jasa
                </h2>
                {order.status !== 'DIAMBIL' && !isReadOnly && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setIsAddJasaOpen(true)} leftIcon={<Plus size={16}/>} className="bg-amber-50 text-amber-700 border-none hover:bg-amber-100 rounded-full px-4">
                      Tambah Jasa
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsAddSparepartOpen(true)} leftIcon={<Plus size={16}/>} className="bg-blue-50 text-blue-700 border-none hover:bg-blue-100 rounded-full px-4">
                      Tambah Sparepart
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">NAMA ITEM</th>
                      <th className="px-6 py-4 text-center font-bold">QTY</th>
                      <th className="px-6 py-4 text-right font-bold">HARGA SATUAN</th>
                      <th className="px-6 py-4 text-right font-bold">TOTAL</th>
                      <th className="px-4 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orderSpareparts.map((sp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{sp.detail!.nama}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{sp.detail!.kategori}</p>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-700">{sp.qty}</td>
                        <td className="px-6 py-4 text-right text-gray-600">Rp {sp.detail!.harga.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">Rp {(sp.detail!.harga * sp.qty).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-4 text-right">
                          {order.status !== 'DIAMBIL' && !isReadOnly && (
                            <button onClick={() => handleRemoveSparepart(sp.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all p-2.5 rounded-lg opacity-40 hover:opacity-100 group-hover:opacity-100" title="Hapus">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {(order.jasa || []).map((j, idx) => (
                      <tr key={`jasa-${idx}`} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{j.nama}</p>
                          <p className="text-xs text-amber-600 mt-0.5">Jasa Tambahan</p>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-700">1</td>
                        <td className="px-6 py-4 text-right text-gray-600">Rp {j.harga.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">Rp {j.harga.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-4 text-right">
                          {order.status !== 'DIAMBIL' && !isReadOnly && (
                            <button onClick={() => handleRemoveJasa(j.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all p-2.5 rounded-lg opacity-40 hover:opacity-100 group-hover:opacity-100" title="Hapus">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Baris Biaya Jasa */}
                    <tr className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">Biaya Jasa Servis</p>
                        <p className="text-xs text-gray-400 mt-0.5">Jasa Perbaikan / Pemasangan</p>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">1</td>
                      <td className="px-6 py-4 text-right text-gray-600">Rp {(order.biayaJasa ?? 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">Rp {(order.biayaJasa ?? 0).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-4 text-right">
                        {order.status !== 'DIAMBIL' && !isReadOnly && (
                           <button onClick={() => { setEditJasaValue((order.biayaJasa ?? 0).toString()); setIsEditJasaOpen(true); }} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all p-2.5 rounded-lg opacity-40 hover:opacity-100 group-hover:opacity-100" title="Edit Biaya Jasa">
                             <Edit2 size={18} />
                           </button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="border-t border-gray-100 flex justify-end px-6 py-5">
                <div className="w-full max-w-sm space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-700">Rp {((order.biayaJasa ?? 0) + totalSparepartCost + totalCustomJasa).toLocaleString('id-ID')}</span>
                  </div>
                  {totalPajak > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pajak (PPN)</span>
                      <span className="font-medium text-gray-700">Rp {totalPajak.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                    <span className="font-bold text-blue-600">Total Biaya</span>
                    <span className="text-xl font-bold text-blue-600">Rp {totalBiaya.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Catatan Teknisi */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Hasil Diagnosa & Catatan
                </h2>
                {order.status !== 'DIAMBIL' && !isReadOnly && (
                  <button onClick={() => {
                    setEditDiagnosaValue(order.hasilDiagnosa || '');
                    setIsEditDiagnosaOpen(true);
                  }} className="text-blue-600 text-sm font-semibold hover:underline">
                    Edit Catatan
                  </button>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-4 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                 <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                    "{order.hasilDiagnosa || order.catatanInternal || 'Belum ada catatan teknisi.'}"
                 </p>
              </div>
              <p className="text-xs text-gray-400">Terakhir diupdate otomatis pada sistem • {new Date().toLocaleDateString('id-ID')}</p>
            </div>

          </div>

          {/* Kolom Kanan (Sidebar) */}
          <div className="space-y-6">
            
            {/* Penugasan Teknisi */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-900">Teknisi Utama</h2>
                {['OWNER', 'FRONTLINE'].includes(userRole || '') && order.status !== 'DIAMBIL' && (
                  <button onClick={() => {
                    setEditTeknisiValue(order.teknisiId || '');
                    setIsEditTeknisiOpen(true);
                  }} className="text-blue-600 text-sm font-semibold hover:underline">
                    Ganti
                  </button>
                )}
              </div>
              <div className="p-6 flex items-center gap-4">
                {assignedTechnician ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {assignedTechnician.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{assignedTechnician.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-orange-500 font-bold">★ {assignedTechnician.rating}</span> • {assignedTechnician.jobs} Pekerjaan diselesaikan
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic w-full text-center">Belum ada teknisi yang ditugaskan.</div>
                )}
              </div>
              
              {/* Claim / Release logic for TEKNISI */}
              {userRole === 'TEKNISI' && !order.teknisiId && order.status !== 'DIAMBIL' && (
                <div className="px-6 pb-6 pt-2">
                  <Button onClick={handleClaimJob} variant="primary" className="w-full bg-green-600 hover:bg-green-700">
                    Ambil Pekerjaan Ini
                  </Button>
                </div>
              )}
              {userRole === 'TEKNISI' && order.teknisiId === technicianId && order.status !== 'DIAMBIL' && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                  <Button onClick={handleReleaseJob} variant="danger" className="w-full">
                    Lepas Pekerjaan
                  </Button>
                </div>
              )}
            </div>



            {/* Riwayat Servis Pelanggan */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-900">Riwayat Servis Pelanggan</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {pastOrders.length > 0 ? (
                  pastOrders.map(po => (
                    <div key={po.id} className="p-5 hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => navigate(`/order/${po.id}`)}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{po.noServis}</span>
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
                          {new Date(po.tanggalMasuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900">{po.jenisPerangkat}</h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">{po.keluhan}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">Belum ada riwayat servis.</div>
                )}
              </div>
              {pastOrders.length > 0 && (
                <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
                  <button className="text-blue-600 text-sm font-bold hover:underline">Lihat Semua Riwayat</button>
                </div>
              )}
            </div>

            {/* Banner Bantuan Part */}
            <div className="bg-blue-600 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Butuh Bantuan Part?</h3>
                <p className="text-sm text-blue-100 mb-5 leading-relaxed">Stok part tidak ditemukan di sistem? Hubungi Procurement segera.</p>
                <button className="bg-white text-blue-600 font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
                  <Phone size={16} /> Hubungi Tim Stok
                </button>
              </div>
              <Package size={120} className="absolute -bottom-6 -right-6 text-blue-500 opacity-30" />
            </div>

            {/* Banner Service Manual */}
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
                <BookOpen size={20} className="text-slate-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Service Manual</h4>
                <p className="text-xs text-slate-500">{order.jenisPerangkat} {order.merkModel || 'General'}</p>
              </div>
            </div>

          </div>

        </div>
      </div>


      {/* Edit Biaya Modal (Perkiraan) */}
      <Modal
        isOpen={isEditBiayaOpen}
        onClose={() => setIsEditBiayaOpen(false)}
        title="Edit Perkiraan Biaya"
      >
        <form onSubmit={handleSaveBiaya} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perkiraan Biaya (Rp) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                value={formatRibuan(editBiayaValue)}
                onChange={(e) => setEditBiayaValue(parseRibuan(e.target.value))}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Ubah perkiraan atau estimasi awal biaya yang disetujui pelanggan.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsEditBiayaOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Jasa Modal */}
      <Modal
        isOpen={isEditJasaOpen}
        onClose={() => setIsEditJasaOpen(false)}
        title="Edit Biaya Jasa Servis"
      >
        <form onSubmit={handleSaveJasa} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Jasa Servis Akhir (Rp) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                value={formatRibuan(editJasaValue)}
                onChange={(e) => setEditJasaValue(parseRibuan(e.target.value))}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Sesuaikan biaya jasa teknisi untuk tagihan akhir.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsEditJasaOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Diagnosa Modal */}
      <Modal
        isOpen={isEditDiagnosaOpen}
        onClose={() => setIsEditDiagnosaOpen(false)}
        title="Edit Catatan Internal"
      >
        <form onSubmit={handleSaveDiagnosa} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={4}
              value={editDiagnosaValue}
              onChange={(e) => setEditDiagnosaValue(e.target.value)}
              placeholder="Contoh: Harus ganti IC power, sedang tunggu barang"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsEditDiagnosaOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">Simpan Catatan</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Teknisi */}
      <Modal
        isOpen={isEditTeknisiOpen}
        onClose={() => setIsEditTeknisiOpen(false)}
        title="Pilih Teknisi Utama"
      >
        <form onSubmit={handleSaveTeknisi} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Teknisi</label>
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={editTeknisiValue}
              onChange={(e) => setEditTeknisiValue(e.target.value)}
            >
              <option value="">- Kosongkan Teknisi -</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">Teknisi utama bertanggung jawab atas keseluruhan progres perbaikan perangkat ini.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsEditTeknisiOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">Simpan Teknisi</Button>
          </div>
        </form>
      </Modal>

      {/* Tambah Sparepart Modal */}
      <Modal
        isOpen={isAddSparepartOpen}
        onClose={() => setIsAddSparepartOpen(false)}
        title="Tambah Sparepart"
      >
        <form onSubmit={handleAddSparepartToOrder} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Sparepart dari Stok</label>
            <select
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              value={selectedSparepartId}
              onChange={(e) => setSelectedSparepartId(e.target.value)}
              required
            >
              <option value="" disabled>-- Pilih Sparepart --</option>
              {spareparts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} - Rp {s.harga.toLocaleString('id-ID')} (Stok: {s.stok})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
              value={selectedSparepartQty}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedSparepartQty(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsAddSparepartOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit">Tambahkan</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddJasaOpen}
        onClose={() => setIsAddJasaOpen(false)}
        title="➕ Tambah Jasa Tambahan"
      >
        <form onSubmit={handleAddJasa} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pekerjaan Jasa <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              placeholder="Contoh: Instal Ulang Windows 11, Ganti Thermal Paste..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium placeholder:font-normal"
              value={jasaName}
              onChange={(e) => setJasaName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Jasa (Rp) <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">Rp</span>
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold text-gray-900"
                value={jasaPrice}
                onChange={(e) => setJasaPrice(formatRibuan(e.target.value))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsAddJasaOpen(false)}>Batal</Button>
            <Button variant="primary" type="submit" className="bg-amber-500 hover:bg-amber-600 border-none">Tambahkan</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isUpdateStatusOpen}
        onClose={() => setIsUpdateStatusOpen(false)}
        title="⚡ Perbarui Status Order"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Baru</label>
            <select
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              value={newStatus || ''}
              onChange={(e) => setNewStatus(e.target.value as StatusOrder)}
            >
              {getAvailableStatusOptions(order?.status).map(s => <option key={s} value={s}>{s === 'MENUNGGU_KONFIRMASI' ? 'MENUNGGU KONFIRMASI' : s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Pesan WA</label>
            <textarea
              className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Contoh: Menunggu sparepart baterai datang besok."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
            {newStatus === 'MENUNGGU_KONFIRMASI' && (
              <p className="text-xs text-amber-600 mt-1">Pesan ini akan menjadi format konfirmasi biaya ke pelanggan. Silakan edit pesannya agar sesuai.</p>
            )}
          </div>
          <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
            <input 
              type="checkbox" 
              className="mt-1 rounded text-green-600 focus:ring-green-500" 
              checked={sendWA}
              onChange={(e) => setSendWA(e.target.checked)}
              id="waCheck"
            />
            <label htmlFor="waCheck" className="text-sm text-green-900 cursor-pointer">
              Kirim notifikasi WhatsApp ke pelanggan <br/>
              <span className="text-xs text-green-700 opacity-80">({customer.nama} - {customer.noHp})</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsUpdateStatusOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSaveStatus}>Simpan Perubahan</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        title="Lepas Pekerjaan"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin melepas tugas ini? Teknisi lain atau admin dapat mengambil alih pekerjaan ini setelah Anda melepasnya.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Melepas Pekerjaan <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full py-2.5 px-3.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              rows={3}
              placeholder="Contoh: Sedang mengerjakan order lain, sparepart tidak tersedia, dll"
              value={releaseReason}
              onChange={(e) => setReleaseReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <Button variant="secondary" onClick={() => setIsReleaseModalOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={confirmReleaseJob} className="bg-red-600 hover:bg-red-700 text-white">
              Lepas Pekerjaan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
