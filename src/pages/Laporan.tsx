import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { 
  Download, FileText, Star, ChevronDown,
  AlertTriangle, Users, Wrench, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../components/ui/Modal';
import type { Variants } from 'framer-motion';
import { 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';


type TabName = 'KEUANGAN' | 'OPERASIONAL' | 'INVENTORY' | 'SDM' | 'CRM';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Laporan: React.FC = () => {
  const { orders, customers, spareparts, technicians, mutasiStok } = useStore();

  // Default to first day of current month to today
  const defaultStartDate = new Date();
  defaultStartDate.setDate(1);
  const [startDate, setStartDate] = useState<string>(defaultStartDate.toISOString().split('T')[0]);
  
  const defaultEndDate = new Date();
  const [endDate, setEndDate] = useState<string>(defaultEndDate.toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<TabName>('KEUANGAN');
  const [activePreset, setActivePreset] = useState<string>('bulan');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    keuangan: true,
    operasional: true,
    inventory: true,
    sdm: true,
    crm: true
  });

  // Quick date preset handlers
  const setPreset = (preset: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setActivePreset(preset);
    if (preset === 'hari') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'minggu') {
      const d = new Date(today);
      d.setDate(today.getDate() - 6);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'bulan') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'tahun') {
      const d = new Date(today.getFullYear(), 0, 1);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  // Animation variants
  const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };
  const tabVariants: Variants = { 
    hidden: { opacity: 0, y: 20 }, 
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }, 
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } } 
  };

  const formatDateShort = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  // Date Filtering Logic
  const filteredOrders = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return orders.filter(o => {
      const oDate = new Date(o.tanggalMasuk);
      if (isNaN(oDate.getTime())) return false;
      return oDate >= start && oDate <= end;
    });
  }, [orders, startDate, endDate]);

  // 1. KEUANGAN METRICS & CHART
  const financeData = useMemo(() => {
    let omset = 0;
    let modal = 0;
    let piutang = 0;
    const piutangDetails: any[] = [];
    const currentOrders = filteredOrders.filter(o => o.status === 'SELESAI' || o.status === 'DIAMBIL');
    
    const dailyData: Record<string, { omset: number, laba: number }> = {};
    const categoryData: Record<string, number> = {};

    currentOrders.forEach(order => {
      let orderOmset = order.biayaJasa || 0;
      let orderModal = 0;
      if (order.spareparts) {
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
      if (order.status === 'SELESAI') {
         piutang += orderOmset;
         piutangDetails.push({ ...order, totalBiaya: orderOmset });
      } 

      const cat = order.jenisPerangkat || 'Lainnya';
      categoryData[cat] = (categoryData[cat] || 0) + orderOmset;

      const dateStr = formatDateShort(new Date(order.tanggalMasuk));
      if (!dailyData[dateStr]) dailyData[dateStr] = { omset: 0, laba: 0 };
      dailyData[dateStr].omset += orderOmset;
      dailyData[dateStr].laba += (orderOmset - orderModal);
    });

    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({ name: date, Omset: data.omset, Laba: data.laba }));

    const pieCategoryData = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

    const recentTransactions = [...currentOrders]
      .sort((a, b) => new Date(b.tanggalMasuk).getTime() - new Date(a.tanggalMasuk).getTime())
      .slice(0, 5);

    const orderMengendap = filteredOrders.filter(o => o.status === 'SIAP_DIAMBIL').length;

    const aov = currentOrders.length > 0 ? (omset / currentOrders.length) : 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) diffDays = 1;
    const avgDailyOmset = omset / diffDays;
    const proyeksi = avgDailyOmset * 30; // 30 days projection

    return { 
      totalOmset: omset, 
      totalModal: modal, 
      labaBersih: omset - modal, 
      piutang, 
      chartData, 
      recentTransactions, 
      pieCategoryData, 
      orderMengendap,
      aov,
      proyeksiBulanDepan: proyeksi,
      piutangDetails: piutangDetails.sort((a, b) => new Date(a.tanggalMasuk).getTime() - new Date(b.tanggalMasuk).getTime())
    };
  }, [filteredOrders, spareparts, startDate, endDate]);

  // 2. OPERASIONAL METRICS & CHART
  const opsData = useMemo(() => {
    const masuk = filteredOrders.length;
    const selesaiOrders = filteredOrders.filter(o => o.status === 'SELESAI' || o.status === 'DIAMBIL');
    const selesai = selesaiOrders.length;
    const batal = filteredOrders.filter(o => o.status === 'BATAL').length;
    
    let totalDays = 0;
    let countDays = 0;
    selesaiOrders.forEach(o => {
       const start = new Date(o.tanggalMasuk).getTime();
       const end = o.estimasiSelesai ? new Date(o.estimasiSelesai).getTime() : start + (2 * 24 * 60 * 60 * 1000);
       let days = (end - start) / (1000 * 3600 * 24);
       if (days < 0.1) days = 0.5; // at least half day
       totalDays += days;
       countDays++;
    });
    const avgDays = countDays > 0 ? (totalDays / countDays).toFixed(1) : '0';

    const statusCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));

    const problematicOrders = filteredOrders.filter(o => o.status === 'BATAL' || o.status === 'DIAGNOSA');

    const bottleneckCounts = {
      DIAGNOSA: 0,
      MENUNGGU_SPAREPART: 0,
      PROSES: 0,
      SIAP_DIAMBIL: 0,
    };
    filteredOrders.forEach(o => {
      if (o.status === 'DIAGNOSA') bottleneckCounts.DIAGNOSA++;
      if (o.status === 'MENUNGGU_SPAREPART') bottleneckCounts.MENUNGGU_SPAREPART++;
      if (o.status === 'PROSES') bottleneckCounts.PROSES++;
      if (o.status === 'SIAP_DIAMBIL') bottleneckCounts.SIAP_DIAMBIL++;
    });

    const jamSibukCounts: Record<string, number> = {
      '08:00-11:59': 0,
      '12:00-14:59': 0,
      '15:00-17:59': 0,
      '18:00+': 0
    };
    filteredOrders.forEach(o => {
      const date = new Date(o.tanggalMasuk);
      if (!isNaN(date.getTime())) {
        const hour = date.getHours();
        if (hour >= 8 && hour < 12) jamSibukCounts['08:00-11:59']++;
        else if (hour >= 12 && hour < 15) jamSibukCounts['12:00-14:59']++;
        else if (hour >= 15 && hour < 18) jamSibukCounts['15:00-17:59']++;
        else jamSibukCounts['18:00+']++;
      }
    });
    
    const chartJamSibuk = Object.entries(jamSibukCounts).map(([jam, count]) => ({
      name: jam,
      Order: count
    }));

    const deviceFailures: Record<string, { total: number, batal: number }> = {};
    filteredOrders.forEach(o => {
      const type = o.jenisPerangkat || 'Lainnya';
      if (!deviceFailures[type]) deviceFailures[type] = { total: 0, batal: 0 };
      deviceFailures[type].total++;
      if (o.status === 'BATAL' || o.status === 'BATAL_DIAMBIL' || o.status === 'BATAL_SIAP_DIAMBIL') {
        deviceFailures[type].batal++;
      }
    });

    const failureRateByDevice = Object.entries(deviceFailures)
      .map(([device, data]) => ({
        device,
        total: data.total,
        batal: data.batal,
        rate: data.total > 0 ? (data.batal / data.total) * 100 : 0
      }))
      .filter(x => x.total > 0)
      .sort((a, b) => b.rate - a.rate);

    return { 
      masuk, 
      selesai, 
      batal, 
      tingkatKeberhasilan: masuk > 0 ? ((selesai / masuk) * 100).toFixed(1) : 0, 
      pieData, 
      problematicOrders, 
      avgDays,
      bottleneckCounts,
      chartJamSibuk,
      failureRateByDevice
    };
  }, [filteredOrders]);

  // 3. INVENTORY METRICS & CHART
  const invData = useMemo(() => {
    const terjual: Record<string, number> = {};
    filteredOrders.filter(o => o.status === 'SELESAI' || o.status === 'DIAMBIL').forEach(o => {
      if (o.spareparts) {
        o.spareparts.forEach(sp => {
          terjual[sp.id] = (terjual[sp.id] || 0) + sp.qty;
        });
      }
    });
    
    const topSpareparts = Object.entries(terjual)
      .sort((a, b) => b[1] - a[1])
      .map(([id, qty]) => ({ detail: spareparts.find(s => s.id === id), qty }))
      .filter(x => x.detail);

    const chartData = topSpareparts.slice(0, 5).map(item => ({
      name: item.detail?.nama || 'Unknown',
      Terjual: item.qty
    }));

    const valuasiStok = spareparts.reduce((sum, sp) => sum + (sp.stok * sp.hargaModal), 0);
    const stokKritis = spareparts.filter(sp => sp.stok <= 5).sort((a,b) => a.stok - b.stok);

    const mutasiTerakhir = [...mutasiStok]
      .filter(m => {
        const mDate = new Date(m.tanggal);
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        return mDate >= start && mDate <= end;
      })
      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
      .slice(0, 5)
      .map(m => ({ ...m, detail: spareparts.find(s => s.id === m.sparepartId) }));

    const deadStock = spareparts.filter(sp => !terjual[sp.id] && sp.stok > 0);

    const startD = new Date(startDate);
    const endD = new Date(endDate);
    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) diffDays = 1;

    const prediksiRestock = spareparts.map(sp => {
      const sold = terjual[sp.id] || 0;
      const avgDailySold = sold / diffDays;
      const projected30Days = Math.ceil(avgDailySold * 30);
      // Asumsikan safety stock = 10% dari projected atau minStok
      const safetyStock = Math.max(sp.minStok, Math.ceil(projected30Days * 0.1));
      const restockSuggestion = Math.max(0, (projected30Days + safetyStock) - sp.stok);
      return { detail: sp, avgDailySold, projected30Days, restockSuggestion };
    }).filter(p => p.restockSuggestion > 0).sort((a,b) => b.restockSuggestion - a.restockSuggestion);

    const topProfitSpareparts = Object.entries(terjual)
      .map(([id, qty]) => {
        const detail = spareparts.find(s => s.id === id);
        const profitPerItem = detail ? (detail.harga - detail.hargaModal) : 0;
        const totalProfit = profitPerItem * qty;
        return { detail, qty, totalProfit };
      })
      .filter(x => x.detail && x.totalProfit > 0)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);

    return { topSpareparts, valuasiStok, chartData, stokKritis, mutasiTerakhir, deadStock, prediksiRestock, topProfitSpareparts };
  }, [filteredOrders, spareparts, mutasiStok, startDate, endDate]);

  // 4. SDM / TEKNISI METRICS & CHART
  const techData = useMemo(() => {
    const techStats = technicians.map(t => {
      const tOrders = filteredOrders.filter(o => o.teknisiId === t.id);
      const finishedOrders = tOrders.filter(o => o.status === 'SELESAI' || o.status === 'DIAMBIL');
      const batalOrders = tOrders.filter(o => o.status === 'BATAL');
      const finished = finishedOrders.length;
      const batalCount = batalOrders.length;
      
      let totalDays = 0;
      finishedOrders.forEach(o => {
        // Karena tidak ada timestamp SELESAI asli, kita pakai estimasiSelesai (atau fallback 2 hari)
        const start = new Date(o.tanggalMasuk).getTime();
        const end = o.estimasiSelesai ? new Date(o.estimasiSelesai).getTime() : start + (2 * 24 * 60 * 60 * 1000);
        let days = (end - start) / (1000 * 3600 * 24);
        if (days < 0.1) days = 0.5;
        totalDays += days;
      });
      const avgDays = finished > 0 ? (totalDays / finished) : 0;
      
      // Quality Rate: Persentase servis berhasil (Selesai dibagi Total yg di-assign yg bukan batal krn teknisi, tp utk simpel (Selesai / Assign)*100)
      const qualityRate = tOrders.length > 0 ? ((finished / tOrders.length) * 100) : 0;

      const pendapatanJasa = finishedOrders.reduce((sum, o) => sum + (o.biayaJasa || 0) + (o.jasa || []).reduce((jsum, j) => jsum + j.harga, 0), 0);
      return { ...t, assigned: tOrders.length, finished, batalCount, avgDays, qualityRate, pendapatanJasa };
    }).sort((a, b) => b.finished - a.finished);

    const chartData = techStats.map(t => ({
      name: t.name.split(' ')[0],
      Assigned: t.assigned,
      Selesai: t.finished,
      'Quality Rate': parseFloat(t.qualityRate.toFixed(1))
    }));

    return { techStats, chartData };
  }, [filteredOrders, technicians]);

  // 5. CRM / PELANGGAN METRICS & TABLE
  const crmData = useMemo(() => {
    const spending: Record<string, { total: number, count: number }> = {};
    filteredOrders.filter(o => o.status === 'DIAMBIL' || o.status === 'SELESAI').forEach(o => {
      let orderOmset = o.biayaJasa || 0;
      if (o.spareparts) {
        o.spareparts.forEach(sp => {
          const detail = spareparts.find(s => s.id === sp.id);
          if (detail) orderOmset += (detail.harga * sp.qty);
        });
      }
      if (!spending[o.pelangganId]) {
        spending[o.pelangganId] = { total: 0, count: 0 };
      }
      spending[o.pelangganId].total += orderOmset;
      spending[o.pelangganId].count += 1;
    });

    const allCustomers = Object.entries(spending)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([id, data]) => ({ detail: customers.find(c => c.id === id), total: data.total, count: data.count }))
      .filter(x => x.detail);

    // Advanced CRM Metrics
    const activeCustomerIds = new Set(orders.filter(o => !['SELESAI', 'DIAMBIL', 'BATAL', 'BATAL_DIAMBIL', 'BATAL_SIAP_DIAMBIL'].includes(o.status)).map(o => o.pelangganId));
    const totalPelanggan = customers.length;
    const pelangganAktif = activeCustomerIds.size;
    
    const customerFirstOrder = new Map<string, Date>();
    [...orders].sort((a, b) => new Date(a.tanggalMasuk).getTime() - new Date(b.tanggalMasuk).getTime()).forEach(o => {
      if (!customerFirstOrder.has(o.pelangganId)) {
        customerFirstOrder.set(o.pelangganId, new Date(o.tanggalMasuk));
      }
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let pelangganBaru = 0;
    
    customers.forEach(c => {
      let date = customerFirstOrder.get(c.id);
      if (!date && c.id.startsWith('c') && !isNaN(Number(c.id.substring(1)))) {
        date = new Date(Number(c.id.substring(1)));
      }
      if (!date) date = now;
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        pelangganBaru++;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const growthData = months.map(m => ({ name: m, total: 0 }));
    let cumulative = 0;
    
    const customerDates = customers.map(c => {
      let date = customerFirstOrder.get(c.id);
      if (!date && c.id.startsWith('c') && !isNaN(Number(c.id.substring(1)))) {
        date = new Date(Number(c.id.substring(1)));
      }
      return date || new Date(currentYear, 0, 1);
    }).sort((a, b) => a.getTime() - b.getTime());

    customerDates.forEach(d => {
      if (d.getFullYear() < currentYear) {
        cumulative++;
      }
    });

    for (let month = 0; month < 12; month++) {
      const addedThisMonth = customerDates.filter(d => d.getFullYear() === currentYear && d.getMonth() === month).length;
      cumulative += addedThisMonth;
      growthData[month].total = cumulative;
    }

    const totalServisAll = customers.reduce((sum, c) => sum + (c.totalServis || 0), 0);
    const rataRataServis = totalPelanggan > 0 ? (totalServisAll / totalPelanggan).toFixed(1) : '0';

    const repeatCustomersCount = Object.values(spending).filter(s => s.count > 1).length;
    const totalWithOrders = Object.keys(spending).length;
    const retentionRate = totalWithOrders > 0 ? ((repeatCustomersCount / totalWithOrders) * 100).toFixed(1) : '0.0';

    const customerLastOrder = new Map<string, Date>();
    orders.forEach(o => {
      const oDate = new Date(o.tanggalMasuk);
      const existing = customerLastOrder.get(o.pelangganId);
      if (!existing || oDate > existing) {
        customerLastOrder.set(o.pelangganId, oDate);
      }
    });

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    let pelangganTidur = 0;
    customerLastOrder.forEach((lastDate) => {
      if (lastDate < ninetyDaysAgo) {
        pelangganTidur++;
      }
    });

    return { allCustomers, totalPelanggan, pelangganAktif, pelangganBaru, rataRataServis, growthData, retentionRate, repeatCustomersCount, pelangganTidur };
  }, [filteredOrders, customers, spareparts, orders]);

  const exportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;

    const checkPage = (needed: number = 40) => {
      if (yPos > 270 - needed) { doc.addPage(); yPos = 20; }
    };

    // --- Header Document ---
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('Laporan Eksekutif ServisKu', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, yPos);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 140, yPos);
    yPos += 4;
    doc.setDrawColor(200);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // ═══════════════════════════════════════════
    // 1. KEUANGAN
    // ═══════════════════════════════════════════
    if (exportOptions.keuangan) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('1. Ringkasan Keuangan', 14, yPos);
      
      const margin = financeData.totalOmset > 0
        ? ((financeData.labaBersih / financeData.totalOmset) * 100).toFixed(1)
        : '0';

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Indikator', 'Nilai (Rp)']],
        body: [
          ['Total Omset',        `Rp ${financeData.totalOmset.toLocaleString('id-ID')}`],
          ['Total Modal (HPP)',  `Rp ${financeData.totalModal.toLocaleString('id-ID')}`],
          ['Laba Bersih',        `Rp ${financeData.labaBersih.toLocaleString('id-ID')}`],
          ['Margin Laba',        `${margin}%`],
          ['Piutang / Kasbon',   `Rp ${financeData.piutang.toLocaleString('id-ID')}`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;

      // Sub-tabel: Tren Harian
      if (financeData.chartData.length > 0) {
        checkPage(30);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text('Tren Omset & Laba Harian:', 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Tanggal', 'Omset (Rp)', 'Laba (Rp)']],
          body: financeData.chartData.map(d => [
            d.name,
            `Rp ${d.Omset.toLocaleString('id-ID')}`,
            `Rp ${d.Laba.toLocaleString('id-ID')}`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
          styles: { fontSize: 9 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 8;
      }

      // Sub-tabel: 5 Transaksi Terakhir
      if (financeData.recentTransactions.length > 0) {
        checkPage(30);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text('5 Transaksi Terbaru:', 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['No. Servis', 'Perangkat', 'Biaya Jasa', 'Tanggal']],
          body: financeData.recentTransactions.map(o => {
            return [
              o.noServis,
              `${o.jenisPerangkat}${o.merkModel ? ` - ${o.merkModel}` : ''}`,
              `Rp ${(o.biayaJasa || 0).toLocaleString('id-ID')}`,
              new Date(o.tanggalMasuk).toLocaleDateString('id-ID'),
            ];
          }),
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
          styles: { fontSize: 9 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // ═══════════════════════════════════════════
    // 2. OPERASIONAL
    // ═══════════════════════════════════════════
    if (exportOptions.operasional) {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('2. Performa Operasional', 14, yPos);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Total Masuk', 'Selesai', 'Batal', 'Tingkat Keberhasilan']],
        body: [[
          opsData.masuk, opsData.selesai, opsData.batal, `${opsData.tingkatKeberhasilan}%`
        ]],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;

      // Sub-tabel: Breakdown per Status
      if (opsData.pieData.length > 0) {
        checkPage(30);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text('Distribusi Status Order:', 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Status', 'Jumlah']],
          body: opsData.pieData.map(d => [d.name, d.value]),
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
          styles: { fontSize: 9 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 8;
      }

      // Sub-tabel: Order Bermasalah (BATAL/DIAGNOSA)
      if (opsData.problematicOrders.length > 0) {
        checkPage(30);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text('Order Bermasalah (Batal / Diagnosa):', 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['No. Servis', 'Perangkat', 'Status', 'Keluhan']],
          body: opsData.problematicOrders.slice(0, 10).map(o => [
            o.noServis,
            `${o.jenisPerangkat}${o.merkModel ? ` ${o.merkModel}` : ''}`,
            o.status,
            (o.keluhan || '').substring(0, 50) + ((o.keluhan || '').length > 50 ? '...' : ''),
          ]),
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], fontSize: 9 },
          styles: { fontSize: 9 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        yPos += 10;
      }
    }

    // ═══════════════════════════════════════════
    // 3. INVENTORY
    // ═══════════════════════════════════════════
    if (exportOptions.inventory) {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('3. Status Inventory', 14, yPos);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Indikator', 'Nilai']],
        body: [
          ['Total Valuasi Stok (Modal)', `Rp ${invData.valuasiStok.toLocaleString('id-ID')}`],
          ['Jumlah Jenis Item', spareparts.length.toString()],
          ['Item Stok Menipis (<= 5)', invData.stokKritis.length.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 10 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;

      // Sub-tabel: Top Sparepart Terjual
      if (invData.topSpareparts.length > 0) {
        checkPage(30);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text('Top Sparepart Terlaris:', 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Nama Sparepart', 'Kategori', 'Qty Terjual']],
          body: invData.topSpareparts.slice(0, 10).map(item => [
            item.detail?.nama || '-',
            item.detail?.kategori || '-',
            item.qty,
          ]),
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11], fontSize: 9 },
          styles: { fontSize: 9 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 8;
      }

      // Sub-tabel: Daftar Stok Kritis
      if (invData.stokKritis.length > 0) {
        checkPage(30);
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text('Daftar Stok Kritis (Perlu Restock):', 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Nama', 'Kategori', 'Sisa Stok', 'Min Stok']],
          body: invData.stokKritis.map(sp => [
            sp.nama,
            sp.kategori,
            sp.stok,
            sp.minStok,
          ]),
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], fontSize: 9 },
          styles: { fontSize: 9 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      } else {
        yPos += 10;
      }
    }

    // ═══════════════════════════════════════════
    // 4. SDM (Kinerja Teknisi)
    // ═══════════════════════════════════════════
    if (exportOptions.sdm) {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('4. Kinerja Teknisi', 14, yPos);
      
      const sdmBody = techData.techStats.map(t => {
        const rasio = t.assigned > 0 ? ((t.finished / t.assigned) * 100).toFixed(0) : '0';
        const techInfo = technicians.find(tc => tc.id === t.id);
        return [
          t.name,
          t.assigned,
          t.finished,
          `${rasio}%`,
          techInfo ? `${techInfo.rating.toFixed(1)} / 5.0` : '-',
        ];
      });
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Nama Teknisi', 'Ditugaskan', 'Selesai', 'Rasio Selesai', 'Rating']],
        body: sdmBody.length > 0 ? sdmBody : [['-', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 10 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // ═══════════════════════════════════════════
    // 5. CRM (Top Pelanggan)
    // ═══════════════════════════════════════════
    if (exportOptions.crm) {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('5. Analisis Loyalitas Pelanggan (CRM)', 14, yPos);
      
      const crmBody = crmData.allCustomers.slice(0, 15).map((c, i) => [
        i + 1,
        c.detail?.nama || '-',
        c.detail?.noHp || '-',
        c.count,
        `Rp ${c.total.toLocaleString('id-ID')}`,
      ]);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['#', 'Nama Pelanggan', 'Kontak', 'Freq Servis', 'Total Pengeluaran (CLV)']],
        body: crmBody.length > 0 ? crmBody : [['-', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] },
        styles: { fontSize: 10 },
      });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180);
      doc.text(`ServisKu — Hal ${i}/${pageCount}`, 14, 290);
      doc.text('Dokumen ini di-generate otomatis', 130, 290);
    }

    doc.save(`Laporan_ServisKu_${startDate}_to_${endDate}.pdf`);
    setIsExportModalOpen(false);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([{ Omset: financeData.totalOmset, Laba: financeData.labaBersih }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <motion.div className="p-4 sm:p-8 w-full min-h-screen" variants={containerVariants} initial="hidden" animate="show">
      {/* PAGE HEADER */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan & Analisis</h1>
            <p className="text-gray-500 text-sm mt-0.5">Pantau performa bisnis secara komprehensif.</p>
          </div>
          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportExcel} className="flex items-center gap-2 text-sm">
              <FileText size={15} /> Excel
            </Button>
            <Button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm shadow-sm">
              <Download size={15} /> PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* TABS + FILTER TOOLBAR — satu baris rapi */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {(['KEUANGAN', 'OPERASIONAL', 'INVENTORY', 'SDM', 'CRM'] as TabName[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3.5 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="laporan-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Filter bar — di bawah tabs */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gray-50/60 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Rentang Waktu:</span>
            <div className="relative">
              <select
                value={activePreset === 'custom' ? 'custom' : activePreset}
                onChange={(e) => setPreset(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 text-sm font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700 cursor-pointer shadow-sm hover:border-blue-300 transition-colors"
              >
                <option value="hari">Hari Ini</option>
                <option value="minggu">7 Hari Terakhir</option>
                <option value="bulan">Bulan Ini</option>
                <option value="tahun">Tahun Ini</option>
                <option value="custom">Periode Kustom...</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block" />

          {/* Custom date range */}
          <div className={`flex items-center gap-2 transition-all ${activePreset === 'custom' ? 'opacity-100' : 'opacity-50 grayscale'}`}>
            <span className="text-xs text-gray-400 font-medium">Mulai</span>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setActivePreset('custom'); }}
              className="h-9 px-3 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700 shadow-sm transition-colors cursor-pointer"
            />
            <span className="text-xs text-gray-400 font-medium">Akhir</span>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setActivePreset('custom'); }}
              className="h-9 px-3 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-gray-700 shadow-sm transition-colors cursor-pointer"
            />
          </div>
        </div>
      </motion.div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-6">
          
          {activeTab === 'KEUANGAN' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                  <p className="text-gray-500 font-medium text-sm">Omset Total</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">Rp {financeData.totalOmset.toLocaleString('id-ID')}</h3>
                  <p className="text-xs text-gray-400 mt-2">HPP: Rp {financeData.totalModal.toLocaleString('id-ID')}</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                  <p className="text-gray-500 font-medium text-sm">Laba Bersih</p>
                  <h3 className="text-3xl font-bold text-emerald-600 mt-2">Rp {financeData.labaBersih.toLocaleString('id-ID')}</h3>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl shadow-sm border border-blue-100 flex flex-col justify-center">
                  <p className="text-blue-700 font-medium text-sm">Margin Laba</p>
                  <h3 className="text-3xl font-bold text-blue-700 mt-2">
                    {financeData.totalOmset > 0 ? ((financeData.labaBersih / financeData.totalOmset) * 100).toFixed(1) : 0}%
                  </h3>
                  <p className="text-xs text-blue-500 mt-1">Laba ÷ Omset</p>
                </div>
                <div className="p-6 bg-purple-50 rounded-2xl shadow-sm border border-purple-100 flex flex-col justify-center">
                  <p className="text-purple-700 font-medium text-sm">Avg. Order Value (AOV)</p>
                  <h3 className="text-3xl font-bold text-purple-700 mt-2">Rp {financeData.aov.toLocaleString('id-ID', {maximumFractionDigits: 0})}</h3>
                  <p className="text-xs text-purple-500 mt-1">Rata-rata nilai per servis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-red-50 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-center">
                  <p className="text-red-700 font-medium text-sm">Piutang / Kasbon</p>
                  <h3 className="text-3xl font-bold text-red-700 mt-2">Rp {financeData.piutang.toLocaleString('id-ID')}</h3>
                  <p className="text-xs text-red-500 mt-1">Terdapat {financeData.piutangDetails.length} nota belum dibayar</p>
                </div>
                <div className="p-6 bg-cyan-50 rounded-2xl shadow-sm border border-cyan-100 flex flex-col justify-center">
                  <p className="text-cyan-700 font-medium text-sm">Proyeksi Omset 30 Hari</p>
                  <h3 className="text-3xl font-bold text-cyan-700 mt-2">Rp {financeData.proyeksiBulanDepan.toLocaleString('id-ID', {maximumFractionDigits: 0})}</h3>
                  <p className="text-xs text-cyan-500 mt-1">Berdasarkan tren saat ini</p>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-center">
                  <p className="text-amber-700 font-medium text-sm">Order Mengendap</p>
                  <h3 className="text-3xl font-bold text-amber-700 mt-2">{financeData.orderMengendap}</h3>
                  <p className="text-xs text-amber-600 mt-1">Order Siap Diambil</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="font-bold text-gray-900 mb-6">Tren Laba & Omset</h3>
                  <div className="h-64">
                    {financeData.chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={financeData.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value/1000}k`} />
                          <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString('id-ID')}`} />
                          <Legend />
                          <Bar dataKey="Omset" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Laba" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">Belum ada data pendapatan</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6">Revenue per Kategori</h3>
                  <div className="h-64">
                    {financeData.pieCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={financeData.pieCategoryData}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                            paddingAngle={5} dataKey="value"
                            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                          >
                            {financeData.pieCategoryData.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `Rp ${value.toLocaleString('id-ID')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex justify-center items-center text-gray-400 text-sm">Tidak ada data kategori</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">5 Transaksi Terakhir (Selesai/Diambil)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">No. Servis</th>
                            <th className="px-4 py-3">Pelanggan</th>
                            <th className="px-4 py-3 text-right rounded-tr-lg">Total Omset</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.recentTransactions.map((t) => {
                            const customer = customers.find(c => c.id === t.pelangganId);
                            let omset = t.biayaJasa || 0;
                            if (t.spareparts) {
                              t.spareparts.forEach(sp => {
                                const detail = spareparts.find(s => s.id === sp.id);
                                if (detail) omset += (detail.harga * sp.qty);
                              });
                            }
                            return (
                              <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{t.noServis}</td>
                                <td className="px-4 py-3 text-gray-500">{customer?.nama || 'Unknown'}</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">Rp {omset.toLocaleString('id-ID')}</td>
                              </tr>
                            );
                          })}
                          {financeData.recentTransactions.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Belum ada transaksi.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                    <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-500" /> Daftar Piutang Mengendap (Belum Diambil)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-red-700 uppercase bg-red-50">
                          <tr>
                            <th className="px-4 py-3 rounded-tl-lg">No. Servis / Tgl Selesai</th>
                            <th className="px-4 py-3">Pelanggan</th>
                            <th className="px-4 py-3 text-right rounded-tr-lg">Nominal Tagihan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financeData.piutangDetails.slice(0, 5).map((t) => {
                            const customer = customers.find(c => c.id === t.pelangganId);
                            const tglMasuk = new Date(t.tanggalMasuk);
                            // Asumsikan selesai beberapa hari setelah masuk (mockup aging)
                            const daysAging = Math.floor((new Date().getTime() - tglMasuk.getTime()) / (1000 * 3600 * 24));
                            return (
                              <tr key={t.id} className="border-b border-red-50 hover:bg-red-50/50">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">{t.noServis}</div>
                                  <div className="text-xs text-red-500 mt-1">{daysAging} hari yang lalu</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-gray-700 font-medium">{customer?.nama}</div>
                                  <div className="text-xs text-gray-500 mt-1">{customer?.noHp}</div>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-red-700">Rp {t.totalBiaya.toLocaleString('id-ID')}</td>
                              </tr>
                            );
                          })}
                          {financeData.piutangDetails.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Tidak ada piutang mengendap.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </div>
            </>
          )}

          {activeTab === 'OPERASIONAL' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 font-medium text-sm">Total Masuk</p>
                  <h3 className="text-3xl font-bold text-blue-600 mt-2">{opsData.masuk}</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 font-medium text-sm">Berhasil Selesai</p>
                  <h3 className="text-3xl font-bold text-emerald-600 mt-2">{opsData.selesai}</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 font-medium text-sm">Batal</p>
                  <h3 className="text-3xl font-bold text-red-600 mt-2">{opsData.batal}</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 font-medium text-sm">Success Rate</p>
                  <h3 className="text-3xl font-bold text-indigo-600 mt-2">{opsData.tingkatKeberhasilan}%</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 font-medium text-sm">Rata-rata Waktu</p>
                  <h3 className="text-3xl font-bold text-orange-600 mt-2">{opsData.avgDays} <span className="text-sm font-medium text-gray-500">Hari</span></h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6">Distribusi Status Pesanan</h3>
                  <div className="h-64">
                    {opsData.pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={opsData.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {opsData.pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">Belum ada pesanan masuk</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-500" /> Servis Terkendala (Batal/Diagnosa)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">ID</th>
                          <th className="px-4 py-3">Perangkat</th>
                          <th className="px-4 py-3 text-right rounded-tr-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {opsData.problematicOrders.slice(0, 6).map((t) => (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">#{t.id.slice(0,5)}</td>
                            <td className="px-4 py-3 text-gray-500">{t.jenisPerangkat}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'BATAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {opsData.problematicOrders.length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Tidak ada servis terkendala.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Bottleneck Analysis */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" /> Analisis Titik Macet (Bottleneck)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Diagnosa', count: opsData.bottleneckCounts.DIAGNOSA },
                        { name: 'Menunggu Part', count: opsData.bottleneckCounts.MENUNGGU_SPAREPART },
                        { name: 'Proses', count: opsData.bottleneckCounts.PROSES },
                        { name: 'Siap Diambil', count: opsData.bottleneckCounts.SIAP_DIAMBIL },
                      ]} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Heatmap / Jam Sibuk */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" /> Analisis Jam Sibuk Masuk
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={opsData.chartJamSibuk} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Order" stroke="#3b82f6" fill="#bfdbfe" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 mt-6">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" /> Kategori Perangkat Sering Gagal (Failure Rate)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-red-700 uppercase bg-red-50">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Kategori Perangkat</th>
                        <th className="px-4 py-3 text-center">Total Servis</th>
                        <th className="px-4 py-3 text-center">Gagal / Batal</th>
                        <th className="px-4 py-3 text-right rounded-tr-lg">Tingkat Kegagalan (Failure Rate)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opsData.failureRateByDevice.map((d, i) => (
                        <tr key={d.device} className="border-b border-red-50 hover:bg-red-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">{d.device}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{d.total}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-600">{d.batal}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${d.rate > 30 ? 'bg-red-100 text-red-700' : (d.rate > 10 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700')}`}>
                              {d.rate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {opsData.failureRateByDevice.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">Belum ada data servis.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'INVENTORY' && (
            <>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <p className="text-gray-500 font-medium text-sm mb-1">Valuasi Aset Gudang (Modal)</p>
                  <h3 className="text-4xl font-bold text-gray-900">Rp {invData.valuasiStok.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center gap-3">
                  <Wrench size={24} />
                  <div>
                    <p className="text-sm font-bold">{spareparts.length} Jenis Sparepart</p>
                    <p className="text-xs opacity-80">Tersedia di Gudang</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6">5 Sparepart Terlaris</h3>
                  <div className="h-64">
                    {invData.chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={invData.chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 140 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" width={130} fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="Terjual" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">Belum ada data penjualan.</div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-500" /> Stok Kritis (Restock)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Nama Sparepart</th>
                          <th className="px-4 py-3 text-right">Sisa Stok</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invData.stokKritis.map((t) => (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{t.nama}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${t.stok === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {t.stok} unit
                              </span>
                            </td>
                          </tr>
                        ))}
                        {invData.stokKritis.length === 0 && (
                          <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-500">Stok aman, tidak ada stok kritis.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-gray-400" /> Dead Stock / Slow Moving
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Nama Sparepart</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3 text-right rounded-tr-lg">Stok Menganggur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invData.deadStock.slice(0, 5).map((t) => (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{t.nama}</td>
                            <td className="px-4 py-3 text-gray-500">{t.kategori}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-500">
                              {t.stok} unit
                            </td>
                          </tr>
                        ))}
                        {invData.deadStock.length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Bagus! Tidak ada dead stock.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Wrench size={18} className="text-blue-500" /> Prediksi Restock (30 Hari)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-blue-700 uppercase bg-blue-50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Nama Sparepart</th>
                          <th className="px-4 py-3 text-right">Rata-rata/Hari</th>
                          <th className="px-4 py-3 text-right rounded-tr-lg">Saran Beli</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invData.prediksiRestock.slice(0, 5).map((p) => (
                          <tr key={p.detail.id} className="border-b border-blue-50 hover:bg-blue-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900">{p.detail.nama}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{p.avgDailySold.toFixed(1)} unit</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-700">
                              +{p.restockSuggestion} unit
                            </td>
                          </tr>
                        ))}
                        {invData.prediksiRestock.length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Stok saat ini sudah mencukupi prediksi.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                  <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <span className="text-emerald-500">💰</span> Top 5 Sparepart Paling Cuan (Highest Margin)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-emerald-700 uppercase bg-emerald-50">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Nama Sparepart</th>
                          <th className="px-4 py-3 text-center">Terjual</th>
                          <th className="px-4 py-3 text-right rounded-tr-lg">Total Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invData.topProfitSpareparts.map((p, i) => (
                          <tr key={p.detail.id} className="border-b border-emerald-50 hover:bg-emerald-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                              {i === 0 && <span className="text-yellow-500">🏆</span>}
                              {p.detail.nama}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">{p.qty}x</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-700">
                              Rp {p.totalProfit.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                        {invData.topProfitSpareparts.length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Belum ada data profit sparepart.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">Mutasi Stok Terakhir</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Tanggal</th>
                        <th className="px-4 py-3">Tipe</th>
                        <th className="px-4 py-3">Barang</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 rounded-tr-lg">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invData.mutasiTerakhir.map((m) => (
                        <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {new Date(m.tanggal).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${m.tipe === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {m.tipe}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{m.detail?.nama || 'Unknown'}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">{m.qty}</td>
                          <td className="px-4 py-3 text-gray-500">{m.keterangan || '-'}</td>
                        </tr>
                      ))}
                      {invData.mutasiTerakhir.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Belum ada aktivitas mutasi stok.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'SDM' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Beban Kerja Teknisi</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={techData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Legend />
                      <Bar dataKey="Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Leaderboard & Kinerja Teknisi</h3>
                <div className="space-y-4">
                  {techData.techStats.map((t, i) => (
                    <div key={t.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">Aktif: {t.jobs} | Batal: {t.batalCount}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-center text-sm justify-start xl:justify-end">
                        <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100 flex-1 xl:flex-none">
                          <p className={`font-bold ${t.qualityRate >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>{t.qualityRate.toFixed(0)}%</p>
                          <p className="text-gray-400 text-[10px] uppercase">Quality</p>
                        </div>
                        <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100 flex-1 xl:flex-none">
                          <p className="font-bold text-gray-900">{t.avgDays.toFixed(1)} hr</p>
                          <p className="text-gray-400 text-[10px] uppercase">SLA/Rata</p>
                        </div>
                        <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100 flex-1 xl:flex-none text-right">
                          <p className="font-bold text-gray-900">{t.finished}</p>
                          <p className="text-gray-400 text-[10px] uppercase">Selesai</p>
                        </div>
                        <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100 flex-1 xl:flex-none text-right">
                          <p className="font-bold text-blue-600">Rp {(t as any).pendapatanJasa?.toLocaleString('id-ID') || 0}</p>
                          <p className="text-gray-400 text-[10px] uppercase">Jasa</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'CRM' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Left Stats */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Total Pelanggan</p>
                    <p className="text-2xl font-bold text-gray-900">{crmData.totalPelanggan}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Pelanggan Aktif</p>
                    <p className="text-2xl font-bold text-gray-900">{crmData.pelangganAktif}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Baru (Bulan Ini)</p>
                    <p className="text-2xl font-bold text-emerald-500">+{crmData.pelangganBaru}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Pelanggan Tidur</p>
                    <p className="text-2xl font-bold text-amber-500">{crmData.pelangganTidur}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center sm:col-span-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">Retention Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{crmData.retentionRate}%</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Repeat Cust</p>
                    <p className="text-2xl font-bold text-gray-900">{crmData.repeatCustomersCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 mb-1">Rata Servis</p>
                    <p className="text-2xl font-bold text-gray-900">{crmData.rataRataServis}</p>
                  </div>
                </div>

                {/* Right Chart */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 mb-6">Pertumbuhan Pelanggan <span className="text-gray-500 font-normal">(Tahun Ini)</span></p>
                  <div className="flex-1 w-full h-full min-h-[140px] relative mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={crmData.growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-blue-500" /> Analisis Loyalitas Pelanggan (CLV)
                  </h3>
                </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Peringkat</th>
                      <th className="px-4 py-3">Nama Pelanggan</th>
                      <th className="px-4 py-3">Kontak</th>
                      <th className="px-4 py-3 text-center">Frekuensi Servis</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">Total Pengeluaran (CLV)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crmData.allCustomers.map((c, i) => (
                      <tr key={c.detail?.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-4 font-bold text-gray-500">#{i + 1}</td>
                        <td className="px-4 py-4 font-bold text-gray-900 flex items-center gap-2">
                          {c.detail?.nama} {i < 3 && <Star size={14} className="text-yellow-500 fill-current" />}
                        </td>
                        <td className="px-4 py-4 text-gray-500">{c.detail?.noHp}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                            {c.count}x Servis
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-600">
                          Rp {c.total.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    {crmData.allCustomers.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Belum ada pelanggan yang menyelesaikan pesanan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>

      {/* EXPORT MODAL */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Pengaturan Cetak PDF"
      >
        <div className="space-y-4 py-2">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900 font-bold mb-3">Pilih Periode Cetak:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-blue-600/80 font-bold uppercase tracking-wider mb-1.5">Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setActivePreset('custom'); }}
                  className="w-full h-10 px-3 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 shadow-sm transition-all cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-600/80 font-bold uppercase tracking-wider mb-1.5">Akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setActivePreset('custom'); }}
                  className="w-full h-10 px-3 text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 shadow-sm transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4 pt-2">
            Pilih modul data yang ingin disertakan dalam laporan:
          </p>
          
          <div className="space-y-3">
            {[
              { id: 'keuangan', label: '1. Ringkasan Keuangan (Omset & Laba)' },
              { id: 'operasional', label: '2. Performa Operasional (Tingkat Keberhasilan)' },
              { id: 'inventory', label: '3. Status Inventory & Stok' },
              { id: 'sdm', label: '4. Kinerja Teknisi (SDM)' },
              { id: 'crm', label: '5. Analisis Loyalitas Pelanggan (CRM)' },
            ].map((option) => (
              <label key={option.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={exportOptions[option.id as keyof typeof exportOptions]}
                  onChange={(e) => setExportOptions({ ...exportOptions, [option.id]: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium text-sm">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={exportPDF} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              disabled={!Object.values(exportOptions).some(Boolean)}
            >
              <Download size={18} /> Buat PDF
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
