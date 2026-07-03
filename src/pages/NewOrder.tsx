import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Modal } from '../components/ui/Modal';
import { sendWhatsAppMessage } from '../utils/whatsappLink';
import { CheckCircle2, MessageCircle, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { customers, technicians, addOrder, userRole } = useStore();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string, noServis: string, pelanggan: string, hp: string, perangkat: string, keluhan: string, biaya: number, estimasiSelesai: string } | null>(null);
  const [formData, setFormData] = useState({
    // Pelanggan
    namaPelanggan: '',
    noHpPelanggan: '',
    emailPelanggan: '',
    alamat: '',
    // Perangkat
    jenisPerangkat: '',
    merkModel: '',
    noSeri: '',
    kelengkapanCharger: false,
    kelengkapanMouse: false,
    kelengkapanTas: false,
    kelengkapanLainnya: false,
    // Keluhan
    keluhan: '',
    pemeriksaanAwal: '',
    estimasiBiaya: '',
    estimasiSelesai: '',
    teknisiId: '',
    // Internal
    catatanInternal: '',
    prioritas: 'NORMAL' as 'NORMAL' | 'HIGH' | 'URGENT',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isSubmitting]);

  if (userRole === 'TEKNISI') {
    return <Navigate to="/order" replace />;
  }

  const handleCancel = () => {
    if (formData.namaPelanggan || formData.noHpPelanggan || formData.keluhan) {
      setShowExitConfirm(true);
    } else {
      navigate('/order');
    }
  };

  const handleSubmit = async (e?: React.FormEvent | KeyboardEvent) => {
    e?.preventDefault();
    if (isSubmitting) return;

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.namaPelanggan.trim()) errors.namaPelanggan = 'Nama pelanggan wajib diisi';
    if (!formData.noHpPelanggan.trim()) errors.noHpPelanggan = 'No HP wajib diisi';
    if (!formData.jenisPerangkat.trim()) errors.jenisPerangkat = 'Jenis perangkat wajib diisi';
    if (!formData.keluhan.trim()) errors.keluhan = 'Keluhan wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);
    try {
      let pelangganId = '';
      const existingCustomer = customers.find(c => c.noHp === formData.noHpPelanggan);
      
      if (existingCustomer) {
        pelangganId = existingCustomer.id;
      } else {
        const { addCustomer } = useStore.getState();
        pelangganId = await addCustomer({
          nama: formData.namaPelanggan,
          noHp: formData.noHpPelanggan,
          email: formData.emailPelanggan || undefined,
          alamat: formData.alamat,
        });
      }

      const kelengkapanList: string[] = [];
      if (formData.kelengkapanCharger) kelengkapanList.push('Charger');
      if (formData.kelengkapanMouse) kelengkapanList.push('Mouse');
      if (formData.kelengkapanTas) kelengkapanList.push('Tas');
      if (formData.kelengkapanLainnya) kelengkapanList.push('Lainnya');

      addOrder({
        pelangganId: pelangganId,
        jenisPerangkat: formData.jenisPerangkat,
        merkModel: formData.merkModel,
        noSeri: formData.noSeri,
        kelengkapan: kelengkapanList,
        keluhan: formData.keluhan,
        pemeriksaanAwal: formData.pemeriksaanAwal,
        estimasiBiaya: Number(formData.estimasiBiaya) || 0,
        estimasiSelesai: formData.estimasiSelesai,
        prioritas: formData.prioritas,
        teknisiId: formData.teknisiId || undefined,
        catatanInternal: formData.catatanInternal,
        status: 'MASUK',
      });
      
      const updatedStore = useStore.getState();
      const createdOrder = updatedStore.orders[0]; 
      
      setIsSubmitting(false);
      setSuccessData({
        id: createdOrder.id,
        noServis: createdOrder.noServis,
        pelanggan: formData.namaPelanggan,
        hp: formData.noHpPelanggan,
        perangkat: `${formData.jenisPerangkat} ${formData.merkModel}`,
        keluhan: formData.keluhan,
        biaya: Number(formData.estimasiBiaya) || 0,
        estimasiSelesai: formData.estimasiSelesai
      });
    } catch (error) {
      setIsSubmitting(false);
      toast.error('Gagal menyimpan data. Mohon periksa koneksi internet Anda dan coba lagi.');
      console.error(error);
    }
  };

  const handleWA = () => {
    if (!successData) return;
    const msg = `Halo ${successData.pelanggan},\n\nPerangkat Anda telah kami terima. Berikut informasinya:\n\n📋 No. Servis  : ${successData.noServis}\n📱 Perangkat   : ${successData.perangkat}\n🔧 Keluhan     : ${successData.keluhan}\n💰 Est. Biaya  : Rp ${successData.biaya.toLocaleString('id-ID')}\n📅 Est. Selesai: ${successData.estimasiSelesai || '-'}\n\nKami akan menghubungi Anda kembali setelah pemeriksaan selesai.\nTerima kasih — ITC Computer 🛠️`;
    
    toast.success('WhatsApp dibuka di tab baru');
    sendWhatsAppMessage(successData.hp, msg);
  };

  return (
    <div className="p-8 w-full min-h-screen pb-24">
      <Breadcrumb items={[
        { label: 'Order Servis', href: '/order' },
        { label: 'Penerimaan Baru' }
      ]} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">+ Terima Perangkat Baru</h1>
          <p className="mt-1 text-gray-500">Isi formulir bertahap untuk mencatat penerimaan perangkat.</p>
        </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
          
          {/* Section 1: Pelanggan */}
          <div className="p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Data Pelanggan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Nama Pelanggan"
                  required
                  list="customer-names"
                  placeholder="Ketik untuk mencari pelanggan..."
                  value={formData.namaPelanggan}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, namaPelanggan: val });
                    if (val.length >= 3) {
                      const existing = customers.find(c => c.nama.toLowerCase() === val.toLowerCase());
                      if (existing) {
                        setFormData(prev => ({
                          ...prev,
                          namaPelanggan: val,
                          noHpPelanggan: prev.noHpPelanggan || existing.noHp,
                          emailPelanggan: prev.emailPelanggan || existing.email || '',
                          alamat: prev.alamat || existing.alamat || ''
                        }));
                      }
                    }
                  }}
                />
                <datalist id="customer-names">
                  {customers.map(c => (
                    <option key={c.id} value={c.nama}>{c.noHp}</option>
                  ))}
                </datalist>
              </div>
              <Input
                label="No. HP / WhatsApp"
                required
                type="tel"
                placeholder="Mis: 081234567890"
                value={formData.noHpPelanggan}
                className={formErrors.noHpPelanggan ? 'border-red-500 ring-1 ring-red-500' : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, noHpPelanggan: val });
                  if (val.length >= 10) {
                    const existing = customers.find(c => c.noHp === val);
                    if (existing) {
                      setFormData(prev => ({ 
                        ...prev, 
                        namaPelanggan: prev.namaPelanggan || existing.nama,
                        emailPelanggan: prev.emailPelanggan || existing.email || '',
                        alamat: prev.alamat || existing.alamat || ''
                      }));
                    }
                  }
                }}
              />
              <div className="md:col-span-2">
                <Input
                  label="Email Pelanggan"
                  type="email"
                  placeholder="Mis: user@email.com (Opsional)"
                  value={formData.emailPelanggan}
                  onChange={(e) => setFormData({ ...formData, emailPelanggan: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  rows={2}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Opsional"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Perangkat */}
          <div className="p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Data Perangkat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Jenis Perangkat <span className="text-red-500">*</span></label>
                <select
                  required
                  className={`w-full py-2 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white ${formErrors.jenisPerangkat ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                  value={formData.jenisPerangkat}
                  onChange={(e) => setFormData({ ...formData, jenisPerangkat: e.target.value })}
                >
                  <option value="">Pilih Jenis</option>
                  <option value="Laptop">Laptop</option>
                  <option value="PC Desktop">PC Desktop</option>
                  <option value="Printer">Printer</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <Input
                label="Merk & Model"
                placeholder="Mis: Asus ROG Strix"
                value={formData.merkModel}
                onChange={(e) => setFormData({ ...formData, merkModel: e.target.value })}
              />
              <Input
                label="Nomor Seri (S/N)"
                placeholder="Opsional"
                value={formData.noSeri}
                onChange={(e) => setFormData({ ...formData, noSeri: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Kelengkapan yang Dibawa</label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, kelengkapanCharger: !formData.kelengkapanCharger})}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${formData.kelengkapanCharger ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.kelengkapanCharger ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                    {formData.kelengkapanCharger && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  Charger
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, kelengkapanMouse: !formData.kelengkapanMouse})}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${formData.kelengkapanMouse ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.kelengkapanMouse ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                    {formData.kelengkapanMouse && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  Mouse
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, kelengkapanTas: !formData.kelengkapanTas})}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${formData.kelengkapanTas ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.kelengkapanTas ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                    {formData.kelengkapanTas && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  Tas
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, kelengkapanLainnya: !formData.kelengkapanLainnya})}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${formData.kelengkapanLainnya ? 'bg-primary/10 border-primary text-primary ring-1 ring-primary' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.kelengkapanLainnya ? 'border-primary bg-primary' : 'border-gray-400'}`}>
                    {formData.kelengkapanLainnya && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  Lainnya...
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Keluhan & Estimasi */}
          <div className="p-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Keluhan & Estimasi</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Keluhan Pelanggan <span className="text-red-500">*</span></label>
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  className={`w-full py-2 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${formErrors.keluhan ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
                  placeholder="Contoh: Laptop tidak bisa menyala, layar bergaris..."
                  value={formData.keluhan}
                  onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Hasil Pemeriksaan Awal</label>
                <textarea
                  rows={2}
                  className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Opsional (diisi oleh teknisi)"
                  value={formData.pemeriksaanAwal}
                  onChange={(e) => setFormData({ ...formData, pemeriksaanAwal: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Estimasi Biaya <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-500 font-medium">Rp</span>
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-gray-300 pl-12 pr-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white"
                      placeholder="0"
                      required
                      value={formData.estimasiBiaya ? Number(formData.estimasiBiaya).toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        let rawValue = e.target.value.replace(/\D/g, '');
                        if (rawValue.startsWith('0')) rawValue = rawValue.replace(/^0+/, '');
                        setFormData({ ...formData, estimasiBiaya: rawValue });
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Estimasi Selesai"
                    type="date"
                    className="rounded-xl border-gray-300 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white transition-colors"
                    value={formData.estimasiSelesai}
                    onChange={(e) => setFormData({ ...formData, estimasiSelesai: e.target.value })}
                  />
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Prioritas</label>
                    <select
                      className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 hover:bg-white focus:bg-white transition-colors"
                      value={formData.prioritas}
                      onChange={(e) => setFormData({ ...formData, prioritas: e.target.value as 'NORMAL' | 'HIGH' | 'URGENT' })}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">Tinggi</option>
                      <option value="URGENT">Mendesak</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Internal */}
          <div className="p-6 bg-gray-50 rounded-b-xl">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Catatan Internal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Teknisi Utama (Opsional)</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.teknisiId}
                    onChange={(e) => setFormData({ ...formData, teknisiId: e.target.value })}
                  >
                    <option value="">- Belum Ditentukan -</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
                  Catatan untuk Teknisi
                  <span className="text-xs text-gray-500 font-normal flex items-center"><AlertCircle size={12} className="mr-1"/> Tidak ditampilkan ke pelanggan</span>
                </label>
                <textarea
                rows={2}
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Catatan tambahan internal..."
                value={formData.catatanInternal}
                onChange={(e) => setFormData({ ...formData, catatanInternal: e.target.value })}
                />
              </div>
            </div>

          <div className="p-6 flex items-center justify-between border-t border-gray-200">
            <Button variant="secondary" type="button" onClick={handleCancel} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" loading={isSubmitting} className="min-w-[200px]">
              Simpan & Buat No. Servis &rarr;
            </Button>
          </div>
        </form>
      </div>
      </div>

      <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} title="Batalkan Pembuatan Order?" maxWidth="max-w-sm" footer={
        <div className="flex gap-2 w-full justify-end">
          <Button variant="secondary" onClick={() => setShowExitConfirm(false)}>Lanjut Mengisi</Button>
          <Button variant="danger" onClick={() => navigate('/order')}>Ya, Keluar</Button>
        </div>
      }>
        <p className="text-sm text-gray-600">Perubahan yang sudah diisi tidak akan disimpan. Yakin ingin keluar?</p>
      </Modal>

      {successData && (
        <Modal 
          isOpen={true} 
          onClose={() => navigate(`/order/${successData.id}`)}
          title={
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 size={24} />
              <span>Order Berhasil Dibuat!</span>
            </div>
          }
          footer={
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-end">
              <Button variant="secondary" onClick={() => navigate(`/order/${successData.id}`)} className="flex items-center gap-2 justify-center">
                <FileText size={16} /> Lihat Detail
              </Button>
              <Button variant="primary" onClick={handleWA} className="flex items-center gap-2 justify-center bg-[#25D366] hover:bg-[#128C7E] border-none text-white">
                <MessageCircle size={16} /> Kirim Info via WhatsApp
              </Button>
            </div>
          }
        >
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100 mt-2">
            <div className="grid grid-cols-3 text-sm">
              <span className="text-gray-500">No. Servis</span>
              <span className="col-span-2 font-medium text-gray-900">{successData.noServis}</span>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <span className="text-gray-500">Pelanggan</span>
              <span className="col-span-2 font-medium text-gray-900">{successData.pelanggan}</span>
            </div>
            <div className="grid grid-cols-3 text-sm">
              <span className="text-gray-500">Perangkat</span>
              <span className="col-span-2 font-medium text-gray-900">{successData.perangkat}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
