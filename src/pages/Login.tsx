import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Komponen Login Authentication (Split-Screen Modern)
 * 
 * Halaman pertama yang diakses pengguna untuk masuk ke dalam sistem.
 * Menggunakan arsitektur layout asimetris dengan form login di kiri dan
 * gambar ilustrasi (beserta color blending) di sebelah kanan.
 * 
 * Fitur:
 * - Autentikasi berbasis Role (Admin & Teknisi)
 * - Autentikasi berbasis Role (Admin & Teknisi)
 * - Rate limiting sederhana
 * - Validasi form client-side
 * 
 * @component
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // State dari Global Store Zustand
  const { isAuthenticated, login } = useStore();
  
  // Local States untuk pengelolaan Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Referensi ke input untuk melakukan auto-focus saat pertama render
  const usernameRef = useRef<HTMLInputElement>(null);

  /**
   * Effect Hook: Inisialisasi awal
   * Otomatis fokus kursor ke field Username agar user bisa langsung mengetik.
   * Mengatur timer jika terkena lockout.
   */
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    let timer: any;
    if (lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      setFailedAttempts(0); // Reset after lockout
    }
    return () => clearInterval(timer);
  }, [lockoutTimer, failedAttempts]);

  // Proteksi rute: Jika sudah login, langsung arahkan ke Dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * Menangani proses submit form login.
   * Melakukan pemanggilan ke fungsi `login` di global store.
   * Jika sukses, menyimpan/menghapus memori kredenisal berdasarkan status checkbox "Ingat Saya".
   * 
   * @param {React.FormEvent} e - Event submit dari HTML Form
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    if (!username || !password) return;

    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    
    if (success) {
      setFailedAttempts(0);
      navigate('/dashboard', { replace: true });
    } else {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      if (attempts >= 5) {
        setLockoutTimer(30);
        setError('Terlalu banyak percobaan. Silakan coba lagi dalam 30 detik.');
      } else {
        setError(`Username atau kata sandi tidak sesuai. (Percobaan ${attempts}/5)`);
      }
      setIsLoading(false);
    }
  };

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  return (
    <div className="min-h-screen relative flex">
      {/* FULL SCREEN BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0 bg-blue-950">
        <img
          className="w-full h-full object-cover mix-blend-overlay opacity-80"
          src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2000&auto=format&fit=crop"
          alt="Motherboard hardware"
        />
        {/* Soft blue tint overlay to match system theme */}
        <div className="absolute inset-0 bg-primary/30 mix-blend-multiply"></div>
      </div>

      {/* LEFT PANEL (WHITE TRANSLUCENT OVERLAY) */}
      <div className="w-full lg:w-1/2 relative z-10 flex flex-col justify-center items-center bg-gradient-to-br from-white via-white/90 to-white/20 backdrop-blur-md px-8 sm:px-16">
        
        <div className="w-full max-w-sm">
          
          {/* LOGO */}
          <div className="mb-14 flex items-center justify-center lg:justify-start gap-3">
            <img src="/logo.png" alt="ServisKu Logo" className="h-16 w-auto object-contain drop-shadow-sm" />
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600 tracking-tight">ServisKu</span>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Minimalist Username Input */}
            <div className="relative">
              <label htmlFor="username-input" className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-wide">
                Username atau Email
              </label>
              <div className="relative">
                <input
                  id="username-input"
                  ref={usernameRef}
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="Ketik username Anda"
                  className="w-full bg-gray-100/70 border-0 focus:ring-0 focus:bg-primary-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors rounded-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              </div>
            </div>

            {/* Minimalist Password Input */}
            <div className="relative">
              <label htmlFor="password-input" className="block text-xs font-bold text-gray-500 mb-1.5 ml-1 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Ketik password Anda"
                  className="w-full bg-gray-100/70 border-0 focus:ring-0 focus:bg-primary-50 px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 transition-colors rounded-lg"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-primary focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded">
                {error}
              </p>
            )}



            {/* Solid Primary Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid || isLoading || lockoutTimer > 0}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs tracking-widest uppercase py-4 rounded-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-primary/20"
              >
                {isLoading ? 'Memproses...' : lockoutTimer > 0 ? `Terkunci (${lockoutTimer}s)` : 'MASUK'}
              </button>
            </div>
            
          </form>
        </div>
      </div>

      {/* RIGHT PANEL (TEXT OVERLAY) */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-center items-center px-12 xl:px-24 text-center pointer-events-none">
        <div className="bg-black/10 backdrop-blur-[1px] p-10 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight tracking-tight">
            Solusi Cerdas<br/>Manajemen Bengkel.
          </h2>
          <p className="text-blue-50/90 text-lg font-medium drop-shadow-md leading-relaxed">
            Sistem Point of Sales & Antrean Servis Terpadu.<br/>
            Tingkatkan efisiensi layanan perangkat elektronik Anda.
          </p>
        </div>
      </div>

    </div>
  );
};
