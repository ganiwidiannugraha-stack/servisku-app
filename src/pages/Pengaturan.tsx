import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Store, Bell, Save, Users, Star, Briefcase, MessageSquare, Monitor, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Komponen Halaman Pengaturan
 * Mengelola konfigurasi dasar aplikasi seperti Nama Toko, Nama Pemilik, 
 * Alamat, Pengaturan Printer Kasir, dan Toggle Notifikasi.
 * Perubahan di sini akan memengaruhi kop surat di Struk dan PDF Laporan.
 */
export const Pengaturan: React.FC = () => {
  const { settings, updateSettings, technicians, orders, userRole } = useStore();
  const [activeTab, setActiveTab] = useState<'toko' | 'notifikasi' | 'teknisi'>('toko');

  if (userRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
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
    <div className="p-8 w-full pb-24">
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
            <button
              onClick={() => setActiveTab('teknisi')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'teknisi' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users size={18} /> Manajemen Teknisi
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSave}>
            
            {activeTab === 'toko' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#1e3a8a]">Workshop/Store Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your shop's identity and operational details.</p>
                  </div>
                  <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-200 transition-colors">
                    <Store size={24} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <Input 
                    label="Store Name" 
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  />
                  <Input 
                    label="Owner Name" 
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  />
                  <Input 
                    label="Phone/WhatsApp Number" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Thermal Printer Paper Size</label>
                    <select
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-medium"
                      value={formData.printerWidth}
                      onChange={(e) => setFormData({...formData, printerWidth: e.target.value as '58mm' | '80mm'})}
                    >
                      <option value="58mm">58mm (Standard/Small)</option>
                      <option value="80mm">80mm (Standard/Large)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-medium"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifikasi' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">Notifications & Features</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure how you receive alerts and interact with customers.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-blue-100 transition-colors bg-white">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                        <MessageSquare size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">WhatsApp Integration (WA Button)</h3>
                        <p className="text-sm text-gray-500 mt-1">Display WA button for sending status updates directly to customers from the order dashboard.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.enableWA}
                        onChange={(e) => setFormData({...formData, enableWA: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-blue-100 transition-colors bg-white">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Monitor size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Browser Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">Pop-up for low stock alerts and urgent service request reminders.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.enableNotifications}
                        onChange={(e) => setFormData({...formData, enableNotifications: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-blue-100 transition-colors bg-white">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                        <Clock size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Daily Recap Emails</h3>
                        <p className="text-sm text-gray-500 mt-1">Receive a summary of all pending and completed services at the end of each business day.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={true}
                        onChange={() => {}}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'teknisi' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#1e3a8a]">Technician Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your service fleet, track performance, and assign roles.</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="bg-[#0f4cce] hover:bg-blue-800"
                    onClick={() => toast('Fitur tambah akun teknisi akan tersedia di versi Beta.', { icon: '🚧' })}
                  >
                    + Add Technician
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Team Efficiency */}
                  <div className="col-span-1 border border-gray-100 rounded-2xl p-6 bg-gradient-to-b from-white to-blue-50/30 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TEAM EFFICIENCY</p>
                      <h3 className="text-4xl font-bold text-[#0f4cce]">94.8%</h3>
                      <p className="text-sm text-[#0f4cce] mt-2 font-medium">Average service rating this month</p>
                    </div>
                    
                    <div className="mt-16">
                      <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                        <span>Active Technicians</span>
                        <span>{technicians.filter(t => t.active).length}/{technicians.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0f4cce] h-2 rounded-full" style={{ width: `${(technicians.filter(t => t.active).length / technicians.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Technician List */}
                  <div className="col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900">Technician Performance</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {technicians.map(teknisi => {
                        const completedJobs = orders.filter(o => o.teknisiId === teknisi.id && o.status === 'SELESAI').length;
                        return (
                          <div key={teknisi.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors bg-white">
                            <div className="flex items-center gap-4">
                              <img src={teknisi.avatar} alt={teknisi.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                              <div>
                                <h3 className="font-bold text-gray-900">{teknisi.name}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1 text-[#0f4cce] font-medium"><Star size={14} className="fill-current text-blue-500" /> {teknisi.rating} Rating</span>
                                  <span className="flex items-center gap-1 text-gray-600 font-medium text-xs"><Briefcase size={14} /> {completedJobs} units completed</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <button 
                                 type="button"
                                 onClick={() => toast('Fitur non-aktifkan teknisi akan tersedia di versi Beta.', { icon: '🚧' })}
                                 className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 ${teknisi.active ? 'bg-blue-50 text-[#0f4cce]' : 'bg-gray-100 text-gray-500'}`}
                               >
                                 <span className={`w-1.5 h-1.5 rounded-full ${teknisi.active ? 'bg-[#0f4cce]' : 'bg-gray-400'}`}></span>
                                 {teknisi.active ? 'Active' : 'Inactive'}
                               </button>
                               <button type="button" className="text-gray-400 hover:text-gray-600 font-bold">⋮</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'teknisi' && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock size={14}/> Last updated 2 days ago</span>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" className="border border-gray-200 text-[#0f4cce] font-bold hover:bg-gray-50">
                    Discard
                  </Button>
                  <Button type="submit" variant="primary" className="bg-[#0f4cce] hover:bg-blue-800 font-bold" leftIcon={<Save size={16} />}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}


          </form>
        </div>
      </div>
    </div>
  );
};
