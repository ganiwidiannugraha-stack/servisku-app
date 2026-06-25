import React, { useState } from 'react';
import { useStore } from '../store';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, Bell, Save } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Komponen Halaman Pengaturan
 * Mengelola konfigurasi dasar aplikasi seperti Nama Toko, Nama Pemilik, 
 * Alamat, Pengaturan Printer Kasir, dan Toggle Notifikasi.
 * Perubahan di sini akan memengaruhi kop surat di Struk dan PDF Laporan.
 */
export const Pengaturan: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'toko' | 'notifikasi'>('toko');
  
  const [formData, setFormData] = useState({
    shopName: settings.shopName,
    ownerName: settings.ownerName,
    address: settings.address,
    phone: settings.phone,
    printerWidth: settings.printerWidth,
    enableWA: settings.enableWA,
    enableNotifications: settings.enableNotifications
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast.success('Pengaturan berhasil disimpan');
  };

  return (
    <div className="p-8 w-full max-w-4xl mx-auto pb-24">
      <Breadcrumb items={[{ label: 'Pengaturan' }]} />

      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="mt-1 text-gray-500">Sesuaikan informasi toko dan preferensi aplikasi Anda.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('toko')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'toko' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Store size={18} /> Profil & Toko
            </button>
            <button
              onClick={() => setActiveTab('notifikasi')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'notifikasi' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Bell size={18} /> Preferensi & Notifikasi
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSave}>
            
            {activeTab === 'toko' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Informasi Bengkel/Toko</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Nama Toko/Bengkel" 
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  />
                  <Input 
                    label="Nama Pemilik" 
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  />
                  <Input 
                    label="Nomor Telepon/WA" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ukuran Kertas Printer Termal</label>
                    <select
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.printerWidth}
                      onChange={(e) => setFormData({...formData, printerWidth: e.target.value as '58mm' | '80mm'})}
                    >
                      <option value="58mm">58mm (Kecil)</option>
                      <option value="80mm">80mm (Besar)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifikasi' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Notifikasi & Fitur</h2>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                      checked={formData.enableWA}
                      onChange={(e) => setFormData({...formData, enableWA: e.target.checked})}
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">Integrasi WhatsApp (Tombol WA)</h3>
                      <p className="text-sm text-gray-500 mt-1">Tampilkan tombol WhatsApp untuk mengirim update status langsung ke pelanggan.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                      checked={formData.enableNotifications}
                      onChange={(e) => setFormData({...formData, enableNotifications: e.target.checked})}
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">Notifikasi Browser</h3>
                      <p className="text-sm text-gray-500 mt-1">Munculkan notifikasi popup jika ada aktivitas atau peringatan stok menipis.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" leftIcon={<Save size={18} />}>
                Simpan Perubahan
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
