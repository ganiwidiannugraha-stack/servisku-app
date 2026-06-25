import React from 'react';

export type StatusOrder =
  | 'MASUK'
  | 'DIAGNOSA'
  | 'MENUNGGU_KONFIRMASI'
  | 'PROSES'
  | 'MENUNGGU_SPAREPART'
  | 'SELESAI'
  | 'SIAP_DIAMBIL'
  | 'BATAL'
  | 'BATAL_SIAP_DIAMBIL'
  | 'BATAL_DIAMBIL'
  | 'DIAMBIL';

interface StatusBadgeProps {
  status: StatusOrder;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles: Record<StatusOrder, string> = {
    MASUK: 'bg-status-masuk-bg text-status-masuk',
    DIAGNOSA: 'bg-status-diagnosa-bg text-status-diagnosa',
    MENUNGGU_KONFIRMASI: 'bg-orange-100 text-orange-700',
    PROSES: 'bg-status-proses-bg text-status-proses',
    MENUNGGU_SPAREPART: 'bg-status-tunggu-bg text-status-tunggu',
    SELESAI: 'bg-status-selesai-bg text-status-selesai',
    SIAP_DIAMBIL: 'bg-blue-100 text-blue-700',
    BATAL: 'bg-red-100 text-red-700',
    BATAL_SIAP_DIAMBIL: 'bg-red-100 text-red-700',
    BATAL_DIAMBIL: 'bg-gray-100 text-gray-600 border-gray-300',
    DIAMBIL: 'bg-status-diambil-bg text-status-diambil',
  };

  const labels: Record<StatusOrder, string> = {
    MASUK: 'Masuk',
    DIAGNOSA: 'Diagnosa',
    MENUNGGU_KONFIRMASI: 'Menunggu Konfirmasi',
    PROSES: 'Proses',
    MENUNGGU_SPAREPART: 'Menunggu Sparepart',
    SELESAI: 'Selesai',
    SIAP_DIAMBIL: 'Siap Diambil (Lunas)',
    BATAL: 'Batal Servis',
    BATAL_SIAP_DIAMBIL: 'Batal (Lunas / Siap Diambil)',
    BATAL_DIAMBIL: 'Batal (Diambil)',
    DIAMBIL: 'Diambil',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
};
