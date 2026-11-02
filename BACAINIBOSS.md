# INSTALLATION GUIDE — WAREHOUSE MANAGEMENT SYSTEM

> **PENTING: MAU BACA DULU SEBELUM MENJALANKAN APLIKASI.**
>
> Panduan ini dibuat untuk pengguna yang baru pertama kali menjalankan aplikasi berbasis Next.js dan MySQL. Ikuti langkah-langkahnya secara berurutan. Jangan langsung loncat ke bagian menjalankan aplikasi, nanti malah aplikasinya yang ikut loncat. 

---

## 1. Persiapan

Sebelum menjalankan aplikasi, pastikan perangkat sudah memiliki beberapa software berikut.

| Software | Kegunaan |
|---|---|
| Node.js | Menjalankan aplikasi Next.js |
| MySQL Server | Menyimpan data aplikasi |
| Visual Studio Code | Membuka dan mengelola source code |
| Terminal | Menjalankan perintah instalasi dan database |

### A. Download Node.js

Node.js dibutuhkan agar aplikasi dapat dijalankan.

**Link download:** https://nodejs.org/en/download/

Langkah instalasi:

1. Buka link download Node.js di atas.
2. Pilih versi **LTS (Long Term Support)**.
3. Download installer sesuai sistem operasi perangkat.
4. Jalankan installer.
5. Ikuti proses instalasi sampai selesai.
6. Setelah selesai, buka Terminal atau Command Prompt.

Untuk memastikan Node.js berhasil dipasang, jalankan:

```bash
node -v
```

Kemudian:

```bash
npm -v
```

Jika keduanya menampilkan nomor versi, berarti instalasi berhasil.

### B. Download MySQL Server

MySQL digunakan sebagai database untuk menyimpan data pengguna, produk, kategori, supplier, dan riwayat transaksi.

**Link download MySQL:** https://dev.mysql.com/downloads/mysql/

Pilih installer sesuai sistem operasi.

**Untuk Windows:**
1. Download MySQL Installer dari halaman resmi MySQL.
2. Jalankan installer.
3. Pilih instalasi MySQL Server.
4. Ikuti proses instalasi.
5. Buat password untuk akun `root`.
6. Simpan password tersebut karena akan digunakan saat konfigurasi aplikasi.
7. Pastikan MySQL Server berhasil dijalankan.

**Untuk macOS:**
1. Download MySQL Community Server dari halaman resmi.
2. Pilih versi yang sesuai dengan perangkat.
3. Jalankan file installer `.dmg`.
4. Ikuti proses instalasi.
5. Atur password untuk akun `root`.
6. Pastikan MySQL Server dalam keadaan berjalan.

**Catatan:** Password MySQL yang dibuat pada tahap ini akan digunakan kembali pada file konfigurasi aplikasi.

### C. Download Visual Studio Code

Visual Studio Code digunakan untuk membuka folder source code.

**Link download:** https://code.visualstudio.com/download

1. Download sesuai sistem operasi.
2. Jalankan installer.
3. Selesaikan proses instalasi.
4. Buka Visual Studio Code.

### D. Download MySQL Workbench (Opsional)

MySQL Workbench merupakan aplikasi tambahan untuk melihat dan mengelola database melalui tampilan visual.

**Link download:** https://dev.mysql.com/downloads/workbench/

Workbench tidak wajib dipasang. Seluruh proses konfigurasi database dalam panduan ini dapat dilakukan melalui Terminal.

---

## 2. Menyiapkan Source Code

Setelah seluruh software terpasang, lanjutkan dengan menyiapkan source code aplikasi.

1. Cari file ZIP source code Warehouse Management System.
2. Klik kanan file ZIP.
3. Pilih **Extract** atau **Extract All**.
4. Pastikan folder hasil ekstraksi sudah tersedia.
5. Buka Visual Studio Code.
6. Pilih menu **File → Open Folder**.
7. Pilih folder hasil ekstraksi source code.
8. Tunggu sampai seluruh file project tampil di Visual Studio Code.

Pastikan folder yang dibuka merupakan folder utama project, yaitu folder yang memiliki file `package.json`.

Contoh struktur folder:

```text
warehouse-management-system/
├── app/
├── lib/
├── public/
├── _scripts/
├── package.json
├── package-lock.json
└── .gitignore
```

Struktur folder bisa sedikit berbeda tergantung versi source code.

---

## 3. Membuka Terminal

Terminal digunakan untuk menjalankan perintah instalasi dan konfigurasi.

Di Visual Studio Code:

1. Buka folder project.
2. Klik menu **Terminal**.
3. Pilih **New Terminal**.

Terminal akan muncul di bagian bawah Visual Studio Code.

Pastikan lokasi Terminal sudah berada di folder utama project.

Untuk memastikan lokasi folder, jalankan:

```bash
pwd
```

Pada Windows PowerShell, perintah tersebut juga dapat digunakan.

---

## 4. Menginstal Dependency Project

Dependency merupakan kumpulan library yang dibutuhkan aplikasi agar dapat berjalan.

Pada Terminal Visual Studio Code, jalankan:

```bash
npm install
```

Tunggu sampai proses instalasi selesai.

Proses ini membutuhkan koneksi internet karena Node.js akan mengunduh library yang digunakan project.

Jika instalasi berhasil, folder `node_modules` akan dibuat secara otomatis.

**Jangan menghapus folder `node_modules` selama aplikasi sedang digunakan.**

---

## 5. Menyiapkan MySQL Database

Sekarang kita masuk ke bagian database.

Pastikan MySQL Server sudah berjalan sebelum melanjutkan.

### A. Membuka MySQL melalui Terminal

Buka Terminal atau Command Prompt, kemudian jalankan:

```bash
mysql -u root -p
```

Tekan Enter.

Masukkan password MySQL yang dibuat saat instalasi.

**Catatan:** Saat mengetik password, karakter yang dimasukkan mungkin tidak terlihat. Itu normal. Ketik password seperti biasa, kemudian tekan Enter.

Jika berhasil, tampilan Terminal akan berubah menjadi prompt MySQL seperti:

```text
mysql>
```

Artinya, koneksi ke MySQL berhasil.

### B. Membuat Database

Setelah masuk ke MySQL, jalankan perintah berikut:

```sql
CREATE DATABASE warehouse_db;
```

Kemudian pilih database:

```sql
USE warehouse_db;
```

Untuk memastikan database sudah tersedia:

```sql
SHOW DATABASES;
```

Pastikan `warehouse_db` muncul pada daftar database.

Untuk keluar dari MySQL:

```sql
EXIT;
```

---

## 6. Mengatur Environment Variable

Environment variable digunakan untuk menyimpan konfigurasi database dan keamanan aplikasi.

Kembali ke Visual Studio Code.

Pada folder utama project, buat file baru dengan nama:

```text
.env.local
```

Isi file tersebut dengan konfigurasi berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD="MASUKKAN_PASSWORD_MYSQL"
DB_NAME=warehouse_db

JWT_SECRET="GANTI_DENGAN_SECRET_RANDOM_YANG_PANJANG"
```

### Penjelasan konfigurasi

| Konfigurasi | Keterangan |
|---|---|
| DB_HOST | Alamat MySQL Server |
| DB_PORT | Port MySQL, biasanya 3306 |
| DB_USER | Username MySQL |
| DB_PASSWORD | Password MySQL |
| DB_NAME | Nama database aplikasi |
| JWT_SECRET | Secret untuk keamanan autentikasi |

**PENTING:**

- Ganti `MASUKKAN_PASSWORD_MYSQL` dengan password MySQL milik masing-masing.
- Ganti `JWT_SECRET` dengan string acak yang panjang dan sulit ditebak.
- Jangan membagikan file `.env.local` kepada orang lain.
- Jangan mengunggah file `.env.local` ke GitHub atau membagikannya bersama source code.

Contoh nilai konfigurasi di atas hanya menunjukkan format. Jangan menggunakan password contoh secara langsung.

---

## 7. Membuat Tabel Database

Setelah database dan konfigurasi selesai, kembali ke Terminal Visual Studio Code.

Pastikan Terminal berada di folder utama project.

Jalankan perintah:

```bash
npm run insert:table-data
```

Perintah tersebut digunakan untuk membuat tabel-tabel yang dibutuhkan aplikasi.

Tunggu sampai proses selesai.

Jika berhasil, tabel database akan dibuat secara otomatis di dalam database `warehouse_db`.

### Tabel yang digunakan

Beberapa tabel utama aplikasi:

- `users` — menyimpan data akun pengguna.
- `categories` — menyimpan kategori produk.
- `suppliers` — menyimpan data supplier.
- `products` — menyimpan data produk dan stok.
- `stock_movements` — menyimpan riwayat transaksi stok masuk dan keluar.

---

## 8. Memasukkan Data Awal (Dummy Data)

Setelah tabel berhasil dibuat, jalankan:

```bash
npm run insert:data
```

Perintah ini digunakan untuk memasukkan data awal ke database.

Data awal dapat mencakup:

- Akun Admin.
- Akun Staff.
- Akun Manager.
- Data kategori.
- Data supplier.
- Data produk.

Data tersebut digunakan agar aplikasi dapat langsung dicoba tanpa harus mengisi seluruh database secara manual.

**Catatan:** Jalankan proses pembuatan tabel terlebih dahulu sebelum memasukkan data awal.

---

## 9. Menjalankan Aplikasi

Jika seluruh proses sebelumnya berhasil, sekarang aplikasi siap dijalankan.

Pada Terminal Visual Studio Code, jalankan:

```bash
npm run dev
```

Tunggu sampai muncul informasi bahwa server development sudah berjalan.

Biasanya akan muncul alamat:

```text
http://localhost:3000
```

Buka browser, kemudian akses:

**http://localhost:3000**

Jika halaman login muncul, berarti aplikasi berhasil dijalankan.

Selamat! Warehouse Management System sudah siap digunakan.

---

## 10. Akun Login Awal

Jika menggunakan data awal bawaan dari project, akun berikut dapat digunakan untuk mencoba aplikasi.

| Role | Email | Password |
|---|---|---|
| Admin | admin@warehouse.com | Password123! |
| Staff | staff@warehouse.com | Password123! |
| Manager | manager@warehouse.com | Password123! |

**PERHATIAN:** Akun di atas merupakan akun untuk pengujian awal. Ganti password dan konfigurasi keamanan sebelum aplikasi digunakan untuk menyimpan data operasional yang sebenarnya.

---

## 11. Menghentikan Aplikasi

Untuk menghentikan server aplikasi:

1. Kembali ke Terminal Visual Studio Code.
2. Tekan kombinasi tombol:

```text
CTRL + C
```

Server development akan berhenti.

Untuk menjalankan kembali aplikasi, cukup gunakan:

```bash
npm run dev
```

---

## 12. Troubleshooting (Jika Terjadi Masalah)

Berikut beberapa masalah yang mungkin muncul ketika proses instalasi.

### A. Perintah `node` tidak dikenali

Contoh error:

```text
node is not recognized
```

Solusi:
1. Pastikan Node.js sudah terinstal.
2. Tutup Terminal.
3. Buka Terminal baru.
4. Jalankan kembali `node -v`.

Jika masih bermasalah, periksa konfigurasi PATH Node.js.

### B. MySQL tidak dapat terhubung

Contoh error:

```text
Can't connect to local MySQL server
```

Solusi:
1. Pastikan MySQL Server sudah terinstal.
2. Pastikan service MySQL sedang berjalan.
3. Pastikan port MySQL menggunakan `3306`.
4. Pastikan konfigurasi `.env.local` sudah benar.

Pada macOS yang memasang MySQL melalui Homebrew, MySQL dapat dijalankan dengan:

```bash
brew services start mysql
```

### C. Error `Access denied for user 'root'`

Solusi:
1. Periksa kembali username MySQL.
2. Periksa password pada `.env.local`.
3. Pastikan password yang dimasukkan sama dengan password saat instalasi MySQL.

### D. Error `Unknown database 'warehouse_db'`

Solusi:

Masuk ke MySQL:

```bash
mysql -u root -p
```

Kemudian buat database:

```sql
CREATE DATABASE warehouse_db;
```

Setelah itu, jalankan kembali perintah pembuatan tabel.

### E. Error dependency atau module not found

Jalankan kembali:

```bash
npm install
```

Tunggu sampai selesai, kemudian jalankan:

```bash
npm run dev
```

### F. Port 3000 sudah digunakan

Jika port 3000 sedang digunakan aplikasi lain, Next.js biasanya menawarkan port alternatif, misalnya:

```text
http://localhost:3001
```

Gunakan alamat yang ditampilkan pada Terminal.

---

## 13. Ringkasan Perintah

Jika seluruh software dan konfigurasi sudah tersedia, berikut urutan perintah yang perlu dijalankan:

```bash
# 1. Instal dependency
npm install

# 2. Buat tabel database
npm run insert:table-data

# 3. Masukkan data awal
npm run insert:data

# 4. Jalankan aplikasi
npm run dev
```

**Ingat:** Database MySQL harus sudah berjalan, database `warehouse_db` harus tersedia, dan file `.env.local` harus sudah dikonfigurasi sebelum menjalankan perintah database.

---

## 14. Link Referensi Resmi

Seluruh link instalasi yang digunakan dalam panduan ini:

| Kebutuhan | Link |
|---|---|
| Node.js | https://nodejs.org/en/download/ |
| MySQL Server | https://dev.mysql.com/downloads/mysql/ |
| MySQL Workbench | https://dev.mysql.com/downloads/workbench/ |
| Visual Studio Code | https://code.visualstudio.com/download |
| Dokumentasi npm | https://docs.npmjs.com/ |
| Dokumentasi Next.js | https://nextjs.org/docs |

---

**TERIMA KASIH TELAH MENGGUNAKAN WAREHOUSE MANAGEMENT SYSTEM.**

Jika mengalami kendala selama proses instalasi, periksa kembali setiap langkah pada panduan ini. Sebagian besar masalah instalasi terjadi karena konfigurasi database, service MySQL yang belum berjalan, atau dependency yang belum terpasang.

**BACA DULU. IKUTI LANGKAHNYA. BARU JALANKAN APLIKASINYA.**
