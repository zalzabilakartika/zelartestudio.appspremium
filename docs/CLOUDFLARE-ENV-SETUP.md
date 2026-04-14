# Setup Environment Variables di Cloudflare Dashboard

Dokumentasi ini menjelaskan semua environment variable yang perlu di-set di **Cloudflare Workers > Settings > Variables and Secrets** untuk project **zelarte-appspremium**.

---

## Cara Set di Cloudflare Dashboard

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pilih menu **Workers & Pages** di sidebar kiri
3. Klik worker/project **zelarte-appspremium**
4. Masuk ke tab **Settings**
5. Scroll ke bagian **Variables and Secrets**
6. Klik **Add** untuk menambahkan variable baru

> **Penting:** Untuk variable yang bersifat rahasia (ditandai 🔒), pilih type **Secret** agar nilainya terenkripsi dan tidak bisa dilihat lagi setelah disimpan. Untuk yang bersifat konfigurasi biasa, boleh pakai type **Text**.

---

## Daftar Environment Variables

### 1. `PAYMENT_PROVIDER`

| | |
|---|---|
| **Tipe** | Text |
| **Wajib?** | Tidak (opsional) |
| **Default** | `sayabayar` |
| **Contoh nilai** | `sayabayar` atau `qrispy` |

**Penjelasan:**
Menentukan payment gateway yang dipakai. Kalau tidak di-set atau diisi selain `qrispy`, otomatis pakai **Sayabayar**. Isi `qrispy` kalau mau pakai **Qrispy (QRIS)**.

---

### 2. `SAYABAYAR_API_KEY` 🔒

| | |
|---|---|
| **Tipe** | Secret |
| **Wajib?** | **Ya** (kalau pakai Sayabayar) |
| **Default** | — (tidak ada) |
| **Contoh nilai** | `sb_live_xxxxxxxxxxxxxxxxxxxx` |

**Penjelasan:**
API key dari dashboard [Sayabayar](https://sayabayar.com). Dipakai untuk membuat invoice dan mengecek status pembayaran. **Tanpa ini, checkout tidak akan jalan kalau provider-nya Sayabayar.**

**Cara dapat:**
Login ke dashboard Sayabayar → Settings / API Keys → Copy API key.

---

### 3. `SAYABAYAR_CHANNEL_PREFERENCE`

| | |
|---|---|
| **Tipe** | Text |
| **Wajib?** | Tidak (opsional) |
| **Default** | `platform` |
| **Contoh nilai** | `platform` |

**Penjelasan:**
Preferensi channel pembayaran di Sayabayar. Biasanya biarkan default `platform` saja, kecuali ada instruksi khusus dari tim Sayabayar.

---

### 4. `QRISPY_API_TOKEN` 🔒

| | |
|---|---|
| **Tipe** | Secret |
| **Wajib?** | **Ya** (kalau pakai Qrispy) |
| **Default** | — (tidak ada) |
| **Contoh nilai** | `qr_token_xxxxxxxxxxxxxxxxxxxx` |

**Penjelasan:**
API token dari [Qrispy](https://qrispy.id). Dipakai untuk generate QRIS dan cek status pembayaran. **Tanpa ini, checkout tidak akan jalan kalau provider-nya Qrispy.**

**Cara dapat:**
Login ke dashboard Qrispy → ambil API token.

---

### 5. `QRISPY_API_BASE_URL`

| | |
|---|---|
| **Tipe** | Text |
| **Wajib?** | Tidak (opsional) |
| **Default** | `https://api.qrispy.id` |
| **Contoh nilai** | `https://api.qrispy.id` |

**Penjelasan:**
Base URL untuk API Qrispy. Tidak perlu di-set kecuali Qrispy punya URL khusus (misalnya staging/sandbox).

---

### 6. `QRISPY_RETURN_URL`

| | |
|---|---|
| **Tipe** | Text |
| **Wajib?** | Tidak (opsional) |
| **Default** | — (tidak dikirim ke Qrispy kalau kosong) |
| **Contoh nilai** | `https://zelartestudio.com/thankyou` |

**Penjelasan:**
URL yang akan dikunjungi pembeli setelah selesai bayar QRIS. Kalau tidak di-set, Qrispy tidak akan redirect pembeli ke mana-mana.

---

### 7. `GOOGLE_SHEETS_WEB_APP_URL`

| | |
|---|---|
| **Tipe** | Text |
| **Wajib?** | **Ya** |
| **Default** | — (tidak ada) |
| **Contoh nilai** | `https://script.google.com/macros/s/AKfyc.../exec` |

**Penjelasan:**
URL Google Apps Script Web App untuk mencatat data pembayaran yang sukses ke Google Sheets. **Tanpa ini, logging pembayaran akan gagal (error 500).**

**Cara dapat:**
1. Buka Google Sheets → Extensions → Apps Script
2. Buat script untuk menerima POST data (lihat contoh di bawah)
3. Deploy as Web App (Execute as: Me, Who has access: Anyone)
4. Copy URL yang digenerate

---

## Ringkasan Cepat

Tabel ini merangkum semua variable berdasarkan skenario:

### Kalau pakai **Sayabayar** (default):

| Variable | Wajib | Tipe |
|---|---|---|
| `PAYMENT_PROVIDER` | Tidak (kosongkan saja) | Text |
| `SAYABAYAR_API_KEY` | **Ya** | Secret |
| `SAYABAYAR_CHANNEL_PREFERENCE` | Tidak | Text |
| `GOOGLE_SHEETS_WEB_APP_URL` | **Ya** | Text |

### Kalau pakai **Qrispy**:

| Variable | Wajib | Tipe |
|---|---|---|
| `PAYMENT_PROVIDER` | **Ya** (isi: `qrispy`) | Text |
| `QRISPY_API_TOKEN` | **Ya** | Secret |
| `QRISPY_API_BASE_URL` | Tidak | Text |
| `QRISPY_RETURN_URL` | Tidak | Text |
| `GOOGLE_SHEETS_WEB_APP_URL` | **Ya** | Text |

---

## Checklist Sebelum Deploy

- [ ] Tentukan provider: Sayabayar atau Qrispy?
- [ ] Set `PAYMENT_PROVIDER` kalau pakai Qrispy
- [ ] Set API key/token sesuai provider yang dipilih
- [ ] Set `GOOGLE_SHEETS_WEB_APP_URL` (wajib — URL Apps Script Web App)
- [ ] (Opsional) Set `QRISPY_RETURN_URL` kalau pakai Qrispy
- [ ] Deploy: `npm run deploy`
- [ ] Test checkout di production

---

## Catatan

- Semua variable ini **hanya dipakai di server** (API routes). Tidak ada yang terekspos ke browser.
- Kalau ada variable Secret yang salah, checkout akan return error 500 — cek logs di Cloudflare dashboard.
- Untuk melihat logs: Workers & Pages → zelarte-appspremium → Logs → Real-time.