# Git Push Rule
- **NEVER** automatically push code to GitHub (`git push`).
- You may run `git add` and `git commit` automatically after making changes.
- **ONLY** run `git push origin main` if the user explicitly types the command word **"meriga"** or specifically asks you to "push ke github".
- If you have committed code, just tell the user that the code is committed locally and they can type "meriga" to push it to the live Vercel site.

# Discussion Rule
- **NEVER** write or execute code modifying files when the user is discussing design, concepts, or ideas, unless the user explicitly tells you to code or says "Proceed" / "Gass".
- If the user is asking "how should this look" or "what should this contain", only output text or update the `implementation_plan.md` artifact. Do not touch `src/` or run `npm`.

# Project Roles & Permissions Matrix
The roles in this project are: OWNER, FRONTLINE, FINANCE, INVENTORY, TEKNISI. (ADMIN role is REMOVED/DELETED).
Strict Permissions:
- Sidebar: Order Servis (OWNER, FRONTLINE, TEKNISI, FINANCE), Stok (OWNER, INVENTORY, TEKNISI, FRONTLINE).
- OrderDetail - Ganti Teknisi: ONLY OWNER and FRONTLINE.
- OrderDetail - Cetak Label: ONLY OWNER and FRONTLINE. TEKNISI CANNOT print label.
- Stok - Tambah/Mutasi: ONLY OWNER and INVENTORY. (FRONTLINE and TEKNISI are read-only).
- Status Order Flow: SELESAI CANNOT go back to MASUK/DIAGNOSA/PROSES. PROSES, MENUNGGU_KONFIRMASI, MENUNGGU_SPAREPART can go back and forth.