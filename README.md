# ALIP ENCRYPTOR - Public Web Platform

Platform web profesional untuk enkripsi file universal, dekripsi, obfuscation kode sumber, dan pemrosesan batch langsung di browser menggunakan Web Crypto API yang aman.

## Fitur Utama
1. **Universal File Encryption**: Mengamankan file apa pun (TXT, PDF, DOC, PNG, JPG, ZIP, kode sumber, dll.) menggunakan AES-256-GCM dan format kontainer `.alipenc`.
2. **File Decryption**: Mengembalikan file terenkripsi `.alipenc` ke bentuk asli dengan verifikasi integritas.
3. **Code Obfuscator**: Melindungi kode sumber (JavaScript, HTML, CSS, dll.) dengan engine yang andal.
4. **Batch Processor**: Memproses banyak file sekaligus dengan laporan sukses/gagal dan unduhan ZIP.
5. **Client-Side Security**: Data diproses secara lokal di browser Anda; password dan kunci tidak pernah dikirim ke server.

## Panduan Deployment Publik Tanpa Termux

Anda dapat mendeploy website ini secara instan dan gratis menggunakan Vercel, Netlify, atau Cloudflare Pages:

### A. Deploy ke Vercel / Netlify / Cloudflare Pages via GitHub
1. Buat repositori baru di GitHub (misal: `alip-encryptor`).
2. Unggah seluruh file proyek ke repositori tersebut.
3. Masuk ke dashboard [Vercel](https://vercel.com), [Netlify](https://www.netlify.com), atau [Cloudflare Pages](https://pages.cloudflare.com).
4. Pilih **Import Project** dan hubungkan repositori GitHub Anda.
5. Konfigurasi build (untuk situs statis murni, *Build Command* dikosongkan atau diisi `npm run build`, *Output Directory* diisi root `.` atau direktori publik).
6. Klik **Deploy**. Dapatkan URL HTTPS publik Anda secara instan.
