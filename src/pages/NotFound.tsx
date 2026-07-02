import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Terminal, ArrowLeft, RefreshCw, HardDrive, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [glitchText, setGlitchText] = useState('ERROR 404: HALAMAN_TIDAK_DITEMUKAN');

  // Efek tulisan nge-glitch (rusak-rusak ala komputer rusak)
  useEffect(() => {
    const interval = setInterval(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
      if (Math.random() > 0.8) {
        let text = 'ERROR 404: HALAMAN_TIDAK_DITEMUKAN'.split('');
        for (let i = 0; i < 4; i++) {
          const idx = Math.floor(Math.random() * text.length);
          text[idx] = chars[Math.floor(Math.random() * chars.length)];
        }
        setGlitchText(text.join(''));
        setTimeout(() => setGlitchText('ERROR 404: HALAMAN_TIDAK_DITEMUKAN'), 150);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#002b80] text-blue-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative font-mono select-none">
      
      {/* Background Grid & Scanline ala layar CRT/Terminal jadul */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      <motion.div 
        animate={{ y: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent pointer-events-none"
      />

      <div className="max-w-3xl w-full relative z-10">
        
        {/* Header ala BIOS/Terminal */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">
            <Terminal className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-widest text-white">SISTEM DIAGNOSTIK ServisKu</h2>
            <p className="text-sm text-blue-300">V.1.0.4 - KERNEL PANIC</p>
          </div>
        </motion.div>

        {/* Kotak Pesan Error */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 p-6 sm:p-10 rounded-2xl backdrop-blur-sm shadow-2xl relative overflow-hidden"
        >
          {/* Aksen Motherboard/CPU Background */}
          <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
             <Cpu size={250} className="transform translate-x-1/4 -translate-y-1/4" />
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter break-words">
              {glitchText}
            </h1>

            <div className="space-y-4 mb-8 text-base md:text-lg text-blue-200">
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <HardDrive className="w-6 h-6 text-red-400 shrink-0" /> 
                <span><strong className="text-white">Bad Sector detected:</strong> URL atau path routing rusak.</span>
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <WifiOff className="w-6 h-6 text-yellow-400 shrink-0" />
                <span><strong className="text-white">Connection Error:</strong> Modul halaman tidak dapat dimuat.</span>
              </motion.p>
            </div>

            {/* Terminal Log */}
            <div className="bg-black/40 p-5 rounded-xl font-mono text-xs sm:text-sm mb-10 text-green-400 border border-black/50 shadow-inner">
              <p>{">"} Mengeksekusi diagnostik mandiri...</p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-2"
              >
                {">"} Kemungkinan penyebab: URL typo, halaman sedang diperbaiki teknisi, atau bug sistem fatal.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="mt-2 text-blue-300"
              >
                {">"} STATUS: Menunggu tindakan pengguna...
              </motion.p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate(-1)} 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-4 h-auto text-base font-medium flex items-center justify-center gap-3 rounded-xl transition-all w-full sm:w-auto"
              >
                <ArrowLeft size={18} /> CTRL+Z (Kembali)
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 px-6 py-4 h-auto text-base font-bold flex items-center justify-center gap-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] w-full sm:w-auto"
              >
                <RefreshCw size={18} /> Reboot ke Dashboard
              </Button>
            </div>
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
          className="text-center mt-8 text-xs sm:text-sm text-blue-400/50"
        >
          Pilih tindakan di atas untuk melanjutkan. Harap jangan menekan tombol reset pada CPU Anda.
        </motion.p>
      </div>
    </div>
  );
};
