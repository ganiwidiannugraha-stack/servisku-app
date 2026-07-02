/**
 * Komponen Skeleton Loader
 * 
 * Menampilkan animasi "tulang" halaman (skeleton) saat konten sedang dimuat.
 * Jauh lebih baik dari spinner biasa karena user dapat melihat struktur
 * halaman yang akan muncul, sehingga persepsi kecepatan meningkat drastis.
 * 
 * Teknik ini digunakan oleh: Facebook, YouTube, LinkedIn, Google.
 */

import React from 'react';

// ─────────────────────────────────────────────
// Primitive Skeleton Block
// ─────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => (
  <div
    className={`relative overflow-hidden rounded-lg bg-gray-200 ${className}`}
    style={style}
  >
    {/* Shimmer sweep animation */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

// ─────────────────────────────────────────────
// Skeleton: Baris teks generik
// ─────────────────────────────────────────────
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-3.5 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────
// Skeleton: Kartu KPI (Dashboard Stats Card)
// ─────────────────────────────────────────────
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
    <Skeleton className="h-3 w-28" />
  </div>
);

// ─────────────────────────────────────────────
// Skeleton: Baris tabel
// ─────────────────────────────────────────────
export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        {i === 0 ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ) : (
          <Skeleton className="h-3.5 w-20" />
        )}
      </td>
    ))}
  </tr>
);

// ─────────────────────────────────────────────
// Skeleton: Halaman Laporan (Tab + Filter + Cards + Chart)
// ─────────────────────────────────────────────
export const SkeletonLaporan: React.FC = () => (
  <div className="p-4 sm:p-8 space-y-6 w-full animate-in fade-in duration-300">
    {/* Header row */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>

    {/* Tab bar + filter bar card */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 px-4 pt-1 gap-6">
        {['Keuangan', 'Operasional', 'Inventory', 'Sdm', 'Crm'].map((_tab, i) => (
          <Skeleton key={i} className="h-8 rounded-none rounded-t-md" style={{ width: [80, 100, 80, 60, 60][i] }} />
        ))}
      </div>
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/60">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
        <div className="w-px h-5 bg-gray-200" />
        <Skeleton className="h-7 w-28 rounded-lg" />
        <Skeleton className="h-7 w-8 rounded" />
        <Skeleton className="h-7 w-28 rounded-lg" />
      </div>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Skeleton: Halaman Daftar (Tabel Penuh)
// ─────────────────────────────────────────────
export const SkeletonTablePage: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 8,
  cols = 5,
}) => (
  <div className="p-8 space-y-6 w-full animate-in fade-in duration-300">
    {/* Header Area */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>

    {/* Filter Bar */}
    <div className="flex gap-3">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-10 w-32 rounded-xl" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>

    {/* Table */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <Skeleton className="h-4 w-40" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Skeleton: Dashboard penuh
// ─────────────────────────────────────────────
export const SkeletonDashboard: React.FC = () => (
  <div className="p-8 space-y-8 w-full animate-in fade-in duration-300">
    {/* Greeting */}
    <div className="space-y-2">
      <Skeleton className="h-7 w-72" />
      <Skeleton className="h-4 w-52" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    {/* Chart + Sidebar */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Full Page Splash Loader (Saat pertama buka app)
// ─────────────────────────────────────────────
export const SplashLoader: React.FC = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1e3c] via-[#1a3a6e] to-[#0c2d6b]">
    {/* Animated orbs */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full bg-indigo-400/15 blur-3xl animate-pulse [animation-delay:700ms]" />

    {/* Logo & Branding */}
    <div className="relative flex flex-col items-center gap-6">
      {/* Animated icon ring */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl p-4">
          <img src="/logo.png" alt="ServisKu Logo" className="w-full h-full object-contain" />
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-blue-400 border-r-blue-400/50 animate-spin [animation-duration:2s]" />
        {/* Pulsing outer ring */}
        <div className="absolute -inset-2 rounded-3xl border border-white/10 animate-pulse" />
      </div>

      {/* App name */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-white tracking-tight">
          Servis<span className="text-blue-400">Ku</span>
        </h1>
        <p className="text-blue-200/70 text-sm font-medium mt-1 tracking-widest uppercase">
          Repair Management System
        </p>
      </div>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-[loadbar_2s_ease-in-out_infinite]" />
      </div>

      <p className="text-white/40 text-xs font-medium animate-pulse">
        Memuat sistem...
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Route-level Page Loader (antar halaman)
// ─────────────────────────────────────────────
export const RouteLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    {/* Animated wrench icon */}
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-2">
        <img src="/logo.png" alt="ServisKu Logo" className="w-full h-full object-contain animate-pulse" />
      </div>
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-blue-500 animate-spin" />
    </div>
    {/* Bouncing dots */}
    <div className="flex gap-1.5 items-center">
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
      <div className="w-2 h-2 rounded-full bg-blue-300 animate-bounce [animation-delay:300ms]" />
    </div>
  </div>
);
