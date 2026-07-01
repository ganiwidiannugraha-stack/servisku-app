import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { 
  Download, 
  FileText, 
  Wallet, 
  ShoppingCart, 
  CheckCircle2, 
  Search,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Komponen Halaman Laporan & Analisis
 * Menampilkan rekapitulasi data bulanan (Omset, Modal, Laba Bersih), 
 * riwayat transaksi, sparepart terlaris, dan performa teknisi.
 * Menyediakan fungsi ekspor ke PDF dan Excel.
 */
export const Laporan: React.FC = () => {
  const { orders, customers, spareparts, technicians } = useStore();
  const navigate = useNavigate();

  // Generate available months from orders
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    orders.forEach(o => {
      const date = new Date(o.tanggalMasuk);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(key);
      }
    });
    // Add current month if empty
    if (months.size === 0) {
      const now = new Date();
      months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    }
    return Array.from(months).sort().reverse();
  }, [orders]);

  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || '');
  const [searchTx, setSearchTx] = useState('');

  const formatMonthName = (YYYYMM: string) => {
    if (!YYYYMM) return '';
    const [year, month] = YYYYMM.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Filter completed orders by selected month
  const currentMonthOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status !== 'SELESAI' && o.status !== 'DIAMBIL') return false;
      const date = new Date(o.tanggalMasuk);
      if (isNaN(date.getTime())) return false;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonth;
    });
  }, [orders, selectedMonth]);

  // Calculate metrics
  const metrics = useMemo(() => {
    let omset = 0;
    let modal = 0;

    const txDetails = currentMonthOrders.map(order => {
      const customer = customers.find(c => c.id === order.pelangganId);
      let orderOmset = order.biayaJasa || 0;
      let orderModal = 0;

      if (order.spareparts && order.spareparts.length > 0) {
        order.spareparts.forEach(sp => {
          const detail = spareparts.find(s => s.id === sp.id);
          if (detail) {
            orderOmset += (detail.harga * sp.qty);
            orderModal += (detail.hargaModal * sp.qty);
          }
        });
      }

      omset += orderOmset;
      modal += orderModal;

      return {
        ...order,
        customerName: customer?.nama || 'Unknown',
        omset: orderOmset,
        modal: orderModal,
        laba: orderOmset - orderModal
      };
    });

    return {
      totalOmset: omset,
      totalModal: modal,
      labaBersih: omset - modal,
      totalServis: currentMonthOrders.length,
      txDetails: txDetails.sort((a, b) => new Date(b.tanggalMasuk).getTime() - new Date(a.tanggalMasuk).getTime())
    };
  }, [currentMonthOrders, customers, spareparts]);

  // Calculate Top Spareparts
  const topSpareparts = useMemo(() => {
    const spCount: Record<string, number> = {};
    currentMonthOrders.forEach(order => {
      if (order.spareparts) {
        order.spareparts.forEach(sp => {
          spCount[sp.id] = (spCount[sp.id] || 0) + sp.qty;
        });
      }
    });

    const sorted = Object.keys(spCount)
      .map(id => {
        const detail = spareparts.find(s => s.id === id);
        return {
          id,
          nama: detail?.nama || 'Unknown',
          qty: spCount[id]
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4);
    
    const maxQty = sorted.length > 0 ? sorted[0].qty : 1;
    return { list: sorted, maxQty };
  }, [currentMonthOrders, spareparts]);

  // Filter TX by search
  const filteredTx = metrics.txDetails.filter(tx => 
    tx.noServis.toLowerCase().includes(searchTx.toLowerCase()) || 
    tx.customerName.toLowerCase().includes(searchTx.toLowerCase())
  );

  // Calculate actual Technicians
  const topTechnicians = useMemo(() => {
    const jobsCount: Record<string, number> = {};
    currentMonthOrders.forEach(o => {
      if (o.teknisiId) {
        jobsCount[o.teknisiId] = (jobsCount[o.teknisiId] || 0) + 1;
      }
    });

    return technicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      avatar: tech.avatar,
      rating: tech.rating,
      jobs: jobsCount[tech.id] || 0
    })).sort((a, b) => b.jobs - a.jobs).slice(0, 3);
  }, [currentMonthOrders, technicians]);

  const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  // === EXPORT PDF ===
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const monthLabel = formatMonthName(selectedMonth);
    const shopName = useStore.getState().settings.shopName || 'ServisKu';

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(shopName, 14, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Laporan Rekap Bulanan — ${monthLabel}`, 14, 28);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, 31, 196, 31);

    // Ringkasan card
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan Performa', 14, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
      ['Total Omset', formatCurrency(metrics.totalOmset)],
      ['HPP / Modal Part', formatCurrency(metrics.totalModal)],
      ['Keuntungan Bersih', formatCurrency(metrics.labaBersih)],
      ['Servis Selesai', `${metrics.totalServis} Unit`],
    ];
    autoTable(doc, {
      startY: 44,
      head: [['Metrik', 'Nilai']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    // Riwayat Transaksi table
    const txY = (doc as any).lastAutoTable?.finalY + 10 || 90;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Riwayat Transaksi (Selesai)', 14, txY);
    const txBody = metrics.txDetails.map(tx => [
      tx.noServis,
      tx.customerName,
      `${tx.jenisPerangkat} ${tx.merkModel || ''}`.trim(),
      formatCurrency(tx.omset),
      formatCurrency(tx.modal),
      formatCurrency(tx.laba),
    ]);
    autoTable(doc, {
      startY: txY + 4,
      head: [['No Servis', 'Pelanggan', 'Perangkat', 'Omset', 'Modal', 'Laba']],
      body: txBody,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    // Top spareparts
    if (topSpareparts.list.length > 0) {
      const spY = (doc as any).lastAutoTable?.finalY + 10 || 180;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Sparepart Terlaris', 14, spY);
      autoTable(doc, {
        startY: spY + 4,
        head: [['#', 'Nama Sparepart', 'Jumlah Terpakai']],
        body: topSpareparts.list.map((sp, i) => [i + 1, sp.nama, `${sp.qty}x`]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Dicetak pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — Halaman ${i}/${pageCount}`, 14, 290);
    }

    doc.save(`Laporan_${selectedMonth}_${shopName.replace(/\s+/g, '_')}.pdf`);
  };

  // === EXPORT EXCEL ===
  const handleExportExcel = () => {
    const monthLabel = formatMonthName(selectedMonth);
    const shopName = useStore.getState().settings.shopName || 'ServisKu';
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan
    const summaryRows = [
      [shopName],
      [`Laporan Rekap — ${monthLabel}`],
      [],
      ['Metrik', 'Nilai'],
      ['Total Omset', metrics.totalOmset],
      ['HPP / Modal Part', metrics.totalModal],
      ['Keuntungan Bersih', metrics.labaBersih],
      ['Servis Selesai', metrics.totalServis],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

    // Sheet 2: Riwayat Transaksi
    const txRows = [
      ['No Servis', 'Pelanggan', 'Perangkat', 'Tanggal', 'Omset (Rp)', 'Modal (Rp)', 'Laba (Rp)', 'Status'],
      ...metrics.txDetails.map(tx => [
        tx.noServis,
        tx.customerName,
        `${tx.jenisPerangkat} ${tx.merkModel || ''}`.trim(),
        new Date(tx.tanggalMasuk).toLocaleDateString('id-ID'),
        tx.omset,
        tx.modal,
        tx.laba,
        tx.status,
      ]),
    ];
    const wsTx = XLSX.utils.aoa_to_sheet(txRows);
    wsTx['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsTx, 'Transaksi');

    // Sheet 3: Sparepart Terlaris
    if (topSpareparts.list.length > 0) {
      const spRows = [
        ['#', 'Nama Sparepart', 'Jumlah Terpakai'],
        ...topSpareparts.list.map((sp, i) => [i + 1, sp.nama, sp.qty]),
      ];
      const wsSp = XLSX.utils.aoa_to_sheet(spRows);
      wsSp['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, wsSp, 'Sparepart Terlaris');
    }

    // Sheet 4: Performa Teknisi
    const techRows = [
      ['Nama Teknisi', 'Rating', 'Jumlah Pekerjaan'],
      ...topTechnicians.map(t => [t.name, t.rating, t.jobs]),
    ];
    const wsTech = XLSX.utils.aoa_to_sheet(techRows);
    wsTech['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsTech, 'Performa Teknisi');

    XLSX.writeFile(wb, `Laporan_${selectedMonth}_${shopName.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="p-4 md:p-8 w-full min-h-screen pb-24 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-700 tracking-tight">Rekap & Laporan Bulanan</h1>
          <div className="relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonthName(m)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ringkasan Performa */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ringkasan Performa</h2>
            <p className="text-sm text-gray-500 mt-1">Laporan aktivitas bengkel untuk periode {formatMonthName(selectedMonth)}.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" leftIcon={<FileText size={16} />} className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm text-sm font-semibold" onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button variant="primary" leftIcon={<Download size={16} />} className="bg-blue-700 hover:bg-blue-800 text-sm font-semibold shadow-sm" onClick={handleExportExcel}>
              Export Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText size={20} />
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                +12.5%
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Total Omset</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalOmset)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <ShoppingCart size={20} />
              </div>
              <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                +4.2%
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">HPP / Modal Part</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalModal)}</p>
          </div>

          <div className="bg-blue-600 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Wallet size={120} />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Wallet size={20} />
              </div>
              <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                Laba Bersih
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100 mb-1">Keuntungan Bersih</p>
              <p className="text-3xl font-bold">{formatCurrency(metrics.labaBersih)}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Servis Selesai</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{metrics.totalServis}</p>
              <p className="text-base font-bold text-gray-500 mb-1">Unit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Riwayat Transaksi */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">Riwayat Transaksi (Selesai)</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari ID Servis..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64 font-medium placeholder:font-normal"
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-50">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Service ID</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Perangkat</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Keuntungan</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTx.length > 0 ? filteredTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-700 cursor-pointer hover:underline" onClick={() => navigate(`/order/${tx.id}`)}>
                        {tx.noServis}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.customerName}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {tx.jenisPerangkat} {tx.merkModel}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {formatCurrency(tx.laba)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold">
                        Selesai
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada transaksi selesai di bulan ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-white text-sm">
            <span className="text-gray-500 font-medium">
              Menampilkan {filteredTx.length} dari {metrics.txDetails.length} transaksi
            </span>
            <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 shadow-sm bg-white">
              <button disabled className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                &larr;
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold bg-blue-600 text-white shadow-sm transition-colors">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Sparepart Terlaris */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sparepart Terlaris</h3>
          </div>

          <div className="flex-1 space-y-5">
            {topSpareparts.list.length > 0 ? topSpareparts.list.map((sp, idx) => (
              <div key={sp.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-gray-900 text-sm truncate">{sp.nama}</p>
                    <p className="font-bold text-gray-900 text-sm">{sp.qty}x</p>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-700 rounded-full" 
                      style={{ width: `${(sp.qty / topSpareparts.maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8 text-sm">Belum ada data sparepart.</div>
            )}
          </div>

          <button className="w-full mt-6 py-3 border border-gray-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm" onClick={() => navigate('/stok')}>
            Lihat Semua Stok
          </button>
        </div>
      </div>

      {/* Performa Teknisi */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Performa Teknisi</h3>
          <p className="text-sm text-gray-500 font-medium hidden md:block">Rata-rata rating bulan ini: <span className="font-bold text-gray-700">4.8/5.0</span></p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topTechnicians.map(tech => (
            <div key={tech.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {tech.avatar}
              </div>
              <div>
                <p className="font-bold text-gray-900">{tech.name}</p>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                    <Star size={14} className="fill-orange-500" />
                    {tech.rating}
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 font-medium">({tech.jobs} unit)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
