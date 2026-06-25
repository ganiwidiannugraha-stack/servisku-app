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
