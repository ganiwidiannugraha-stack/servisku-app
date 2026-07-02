import React, { useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion, AnimatePresence } from 'framer-motion';

export const PageWrapper: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f8faff] via-[#f0f4f9] to-[#eef2ff]">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar for mobile & desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 flex-shrink-0 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="relative flex-1 overflow-y-auto focus:outline-none bg-gray-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-full"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
