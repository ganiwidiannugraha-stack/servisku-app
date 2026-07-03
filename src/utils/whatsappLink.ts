/**
 * Utility: Menghasilkan link tautan langsung ke WhatsApp (wa.me API).
 * Secara otomatis memformat nomor telepon (mengganti 0 dengan kode negara 62)
 * dan melakukan URL encoding pada pesan agar aman dibaca browser.
 * 
 * @param noHp Nomor Handphone tujuan (misal: "08123456789")
 * @param pesan Isi pesan teks yang akan dikirim
 * @returns String URL wa.me yang valid
 */
export function generateWALink(noHp: string, pesan: string): string {
  // Pastikan noHp tidak ada karakter aneh
  const cleanHp = noHp.replace(/\D/g, '');
  // Jika dimulai dengan 0, ganti dengan 62
  const nomor = cleanHp.startsWith('0') ? '62' + cleanHp.slice(1) : cleanHp;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

/**
 * Service: Mengirim pesan WhatsApp.
 * Saat ini (Sistem #1) menggunakan wa.me link yang membuka WhatsApp Web/App.
 * Di masa depan (Sistem #4), ubah fungsi ini untuk melakukan HTTP Request (fetch/axios)
 * ke API WhatsApp Gateway Anda (misal: Wablas, Fonnte, atau Meta WA API), 
 * tanpa perlu mengubah kode di komponen UI (OrderNew, OrderDetail).
 */
export async function sendWhatsAppMessage(noHp: string, pesan: string): Promise<boolean> {
  try {
    // TODO (Sistem 4): Ganti logika di bawah ini dengan API Request ke WA Gateway.
    // const response = await fetch('https://api.wagateway.com/send', { ... });
    // return response.ok;
    
    // CURRENT (Sistem 1): Buka tab baru menggunakan wa.me
    const link = generateWALink(noHp, pesan);
    window.open(link, '_blank', 'noopener,noreferrer');
    
    return true; // Asumsikan sukses dibuka
  } catch (error) {
    console.error("Gagal mengirim pesan WA:", error);
    return false;
  }
}
