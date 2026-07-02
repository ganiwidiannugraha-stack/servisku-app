import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Store, Bell, Save, Users, UserCircle, Key, Activity, MessageSquare, Monitor, ShieldAlert, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

const tabVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.15 } }
};

export const Pengaturan: React.FC = () => {
  const { settings, updateSettings, userRole, userId, users, auditLogs, clearLogs, updateProfile, changePassword, logActivity, addUser, updateUser, deleteUser } = useStore();
  
  const [activeTab, setActiveTab] = useState<'profil' | 'toko' | 'notifikasi' | 'akun' | 'log'>('profil');
  const [isConfirmClearLogsOpen, setIsConfirmClearLogsOpen] = useState(false);
  
  const currentUser = users.find(u => u.id === userId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfile({ avatar: base64String });
        toast.success('Foto profil berhasil diperbarui');
      };
      reader.readAsDataURL(file);
    }
  };
  // Form Profile
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || ''
  });

  // Form Password
  const [passData, setPassData] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  const [tokoData, setTokoData] = useState({
    shopName: settings.shopName,
    ownerName: settings.ownerName,
    address: settings.address,
    phone: settings.phone,
    printerWidth: settings.printerWidth,
    enableWA: settings.enableWA,
    enableNotifications: settings.enableNotifications
  });

  // Manajemen Pengguna State
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'TEKNISI',
    position: '',
    email: '',
    phone: ''
  });

  const handleOpenAddUser = () => {
    setUserFormData({ name: '', username: '', password: '', role: 'TEKNISI', position: '', email: '', phone: '' });
    setEditingUserId(null);
    setShowUserForm(true);
  };
  
  const handleOpenEditUser = (u: any) => {
    setUserFormData({ name: u.name, username: u.username, password: u.passwordHash, role: u.role, position: u.position || '', email: u.email || '', phone: u.phone || '' });
    setEditingUserId(u.id);
    setShowUserForm(true);
  };
  
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      await updateUser(editingUserId, {
        name: userFormData.name,
        username: userFormData.username,
        passwordHash: userFormData.password,
        role: userFormData.role as any,
        position: userFormData.position,
        email: userFormData.email,
        phone: userFormData.phone
      });
      logActivity('EDIT_USER', `Memperbarui data pengguna ${userFormData.username}`);
      toast.success('Pengguna berhasil diperbarui');
    } else {
      await addUser({
        name: userFormData.name,
        username: userFormData.username,
        passwordHash: userFormData.password,
        role: userFormData.role as any,
        position: userFormData.position,
        email: userFormData.email,
        phone: userFormData.phone,
        avatar: '',
        isActive: true
      });
      logActivity('ADD_USER', `Menambahkan pengguna baru ${userFormData.username}`);
      toast.success('Pengguna berhasil ditambahkan');
    }
    setShowUserForm(false);
  };

  const handleToggleUserActive = async (u: any) => {
    await updateUser(u.id, { isActive: !u.isActive });
    logActivity('TOGGLE_USER', `Mengubah status aktif pengguna ${u.username} menjadi ${!u.isActive}`);
    toast.success(`Status ${u.username} berhasil diubah`);
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (confirm(`Yakin ingin menghapus pengguna ${username}?`)) {
      await deleteUser(id);
      logActivity('DELETE_USER', `Menghapus pengguna ${username}`);
      toast.success('Pengguna berhasil dihapus');
    }
  };

  if (!currentUser) return <Navigate to="/login" />;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileData);
    logActivity('UPDATE_PROFILE', 'Memperbarui profil pribadi');
    toast.success('Profil berhasil disimpan');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast.error('Konfirmasi kata sandi tidak cocok!');
      return;
    }
    const success = await changePassword(passData.old, passData.new);
    if (success) {
      toast.success('Kata sandi berhasil diubah');
      setPassData({ old: '', new: '', confirm: '' });
      logActivity('CHANGE_PASSWORD', 'Mengubah kata sandi akun');
    } else {
      toast.error('Kata sandi lama salah!');
    }
  };

  const handleSaveToko = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(tokoData);
    logActivity('UPDATE_SETTINGS', 'Memperbarui pengaturan bengkel');
    toast.success('Pengaturan toko berhasil disimpan');
  };

  return (
    <div className="p-8 w-full pb-24 bg-gray-50/30 min-h-screen">
      <Breadcrumb items={[{ label: 'Pengaturan & Profil' }]} />

      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem & Akun</h1>
        <p className="mt-1 text-gray-500">Kelola preferensi akun dan konfigurasi aplikasi.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'profil' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <UserCircle size={18} /> Profil Saya
            </button>

            {['OWNER', 'ADMIN'].includes(userRole || '') && (
              <>
                <button
                  onClick={() => setActiveTab('toko')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'toko' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Store size={18} /> Toko & Bisnis
                </button>
                <button
                  onClick={() => setActiveTab('notifikasi')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'notifikasi' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Bell size={18} /> Notifikasi
                </button>
                <div className="my-2 border-t border-gray-200"></div>
                <h3 className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Manajemen (Owner/Admin)</h3>
                <button
                  onClick={() => setActiveTab('akun')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'akun' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Users size={18} /> Manajemen Akun
                </button>
                <button
                  onClick={() => setActiveTab('log')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'log' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Activity size={18} /> Log Aktivitas
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'profil' && (
              <motion.div key="profil" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-8">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-[#1e3a8a]">Profil Pengguna</h2>
                <p className="text-sm text-gray-500 mt-1">Informasi dasar dan kredensial akun Anda.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-5xl font-bold shadow-inner overflow-hidden border-4 border-white ring-1 ring-gray-100 transition-transform duration-300 group-hover:scale-[1.02]">
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        currentUser?.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all border-2 border-white cursor-pointer z-10"
                      title="Ubah Foto Profil"
                    >
                      <Camera size={16} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handlePhotoChange} 
                    />
                  </div>
                  <div className="text-center mt-4">
                    <p className="font-bold text-gray-900 text-lg">{currentUser?.name}</p>
                    <p className="text-sm text-blue-600 font-semibold mb-1">{currentUser?.role}</p>
                    <p className="text-xs text-gray-500">{currentUser?.position}</p>
                  </div>
                </div>

                <div className="w-full md:w-2/3 space-y-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2"><UserCircle size={16} className="text-gray-400"/> Data Diri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Nama Lengkap" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} required/>
                      <Input label="Nomor HP / WA" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                      <div className="md:col-span-2">
                        <Input label="Alamat Email" type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Simpan Profil</Button>
                    </div>
                  </form>

                  <div className="border-t border-gray-100 my-6"></div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2"><Key size={16} className="text-gray-400"/> Ubah Kata Sandi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input label="Kata Sandi Saat Ini" type="password" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} required/>
                      </div>
                      <Input label="Kata Sandi Baru" type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required/>
                      <Input label="Konfirmasi Kata Sandi" type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required/>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" variant="secondary" className="border-gray-200 text-gray-700 hover:bg-gray-50">Perbarui Sandi</Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
            )}

            {activeTab === 'toko' && ['OWNER', 'ADMIN'].includes(userRole || '') && (
              <motion.form key="toko" onSubmit={handleSaveToko} variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-[#1e3a8a]">Informasi Bengkel</h2>
                <p className="text-sm text-gray-500 mt-1">Informasi ini akan tercetak di struk pelanggan.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nama Bengkel" value={tokoData.shopName} onChange={(e) => setTokoData({...tokoData, shopName: e.target.value})} required/>
                <Input label="Nama Pemilik" value={tokoData.ownerName} onChange={(e) => setTokoData({...tokoData, ownerName: e.target.value})} required/>
                <Input label="Nomor HP/Telepon" value={tokoData.phone} onChange={(e) => setTokoData({...tokoData, phone: e.target.value})} required/>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Ukuran Kertas Printer Thermal</label>
                  <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-medium"
                    value={tokoData.printerWidth}
                    onChange={(e) => setTokoData({...tokoData, printerWidth: e.target.value as '58mm' | '80mm'})}
                  >
                    <option value="58mm">58mm (Kecil)</option>
                    <option value="80mm">80mm (Besar)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-medium" value={tokoData.address} onChange={(e) => setTokoData({...tokoData, address: e.target.value})} required/>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-[#0f4cce] hover:bg-blue-800" leftIcon={<Save size={16}/>}>Simpan Pengaturan</Button>
              </div>
            </motion.form>
            )}

            {activeTab === 'notifikasi' && ['OWNER', 'ADMIN'].includes(userRole || '') && (
              <motion.div key="notifikasi" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-[#1e3a8a]">Notifikasi & Fitur Tambahan</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><MessageSquare size={22}/></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Integrasi WhatsApp</h3>
                      <p className="text-sm text-gray-500 mt-1">Tampilkan tombol WA untuk mengirim update status langsung ke pelanggan.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" checked={tokoData.enableWA} onChange={(e) => {
                      const val = e.target.checked;
                      setTokoData({...tokoData, enableWA: val});
                      updateSettings({...tokoData, enableWA: val});
                    }}/>
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Monitor size={22}/></div>
                    <div>
                      <h3 className="font-bold text-gray-900">Notifikasi Browser</h3>
                      <p className="text-sm text-gray-500 mt-1">Popup untuk peringatan stok rendah.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" className="sr-only peer" checked={tokoData.enableNotifications} onChange={(e) => {
                      const val = e.target.checked;
                      setTokoData({...tokoData, enableNotifications: val});
                      updateSettings({...tokoData, enableNotifications: val});
                    }}/>
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
            )}

            {activeTab === 'akun' && ['OWNER', 'ADMIN'].includes(userRole || '') && (
              <motion.div key="akun" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a8a]">Manajemen Pengguna</h2>
                  <p className="text-sm text-gray-500 mt-1">Kelola akses karyawan ke dalam sistem.</p>
                </div>
                <Button type="button" onClick={handleOpenAddUser} className="bg-blue-600 hover:bg-blue-700">
                  + Tambah Pengguna
                </Button>
              </div>

              {showUserForm && (
                <form onSubmit={handleSaveUser} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 space-y-4">
                  <h3 className="font-bold text-gray-900">{editingUserId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nama Lengkap" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} required />
                    <Input label="Username" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} required />
                    <Input label="Password" type="text" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} required />
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Peran (Role)</label>
                      <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 font-medium" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} required>
                        <option value="TEKNISI">TEKNISI</option>
                        <option value="FRONTLINE">FRONTLINE</option>
                        <option value="INVENTORY">INVENTORY</option>
                        <option value="FINANCE">FINANCE</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    </div>
                    <Input label="Posisi/Jabatan" value={userFormData.position} onChange={e => setUserFormData({...userFormData, position: e.target.value})} />
                    <Input label="Nomor HP" value={userFormData.phone} onChange={e => setUserFormData({...userFormData, phone: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={() => setShowUserForm(false)}>Batal</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                      <th className="py-3 px-4 rounded-tl-xl">Pengguna</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 rounded-tr-xl text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{u.role}</span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-700">{u.username}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleToggleUserActive(u)} 
                            disabled={u.id === currentUser.id}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${u.isActive ? 'bg-blue-600' : 'bg-gray-300'} ${u.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={u.id === currentUser.id ? "Anda tidak dapat menonaktifkan akun Anda sendiri" : ""}
                          >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${u.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleOpenEditUser(u)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold mx-2">Edit</button>
                          {u.id !== currentUser.id ? (
                            <button onClick={() => handleDeleteUser(u.id, u.username)} className="text-red-600 hover:text-red-800 text-sm font-semibold mx-2">Hapus</button>
                          ) : (
                            <span className="text-gray-400 text-sm font-semibold mx-2 cursor-not-allowed" title="Anda tidak dapat menghapus akun Anda sendiri">Hapus</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            )}

            {activeTab === 'log' && ['OWNER', 'ADMIN'].includes(userRole || '') && (
              <motion.div key="log" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1e3a8a]">Riwayat & Log Aktivitas</h2>
                  <p className="text-sm text-gray-500 mt-1">Lacak setiap tindakan yang dilakukan oleh pengguna (Dihapus otomatis tiap 30 hari).</p>
                </div>
                {auditLogs.length > 0 && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setIsConfirmClearLogsOpen(true);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                  >
                    Hapus Semua Log
                  </Button>
                )}
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {auditLogs.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">Belum ada aktivitas yang terekam.</p>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                      <div className="mt-1">
                        <ShieldAlert size={20} className="text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900">{log.userName} <span className="text-gray-400 font-normal">({log.role})</span></h4>
                          <span className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{log.details}</p>
                        <span className="inline-block mt-2 text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">{log.action}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
            )}
          </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={isConfirmClearLogsOpen}
        title="Hapus Log Aktivitas"
        description="Yakin ingin menghapus semua log aktivitas saat ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Semua"
        onConfirm={() => {
          clearLogs();
          toast.success('Log aktivitas berhasil dikosongkan');
          setIsConfirmClearLogsOpen(false);
        }}
        onCancel={() => setIsConfirmClearLogsOpen(false)}
      />
    </div>
    </div>
  );
};
