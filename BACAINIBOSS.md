# Warehouse Management System

## Requirements

Pastikan perangkat sudah memiliki:

- Node.js
- MySQL Server
- npm

## Installation

Clone repository:

```bash
git clone <repository-url>
```

Masuk ke folder project:

```bash
cd warehouse-management
```

Install dependencies:

```bash
npm install
```

## Database Configuration

Buat database melalui MySQL:

```sql
CREATE DATABASE warehouse_db;
```

Buat file `.env.local` pada root project:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=warehouse_db

JWT_SECRET=your_random_secret
```

Sesuaikan konfigurasi dengan MySQL lokal masing-masing.

## Database Setup

Jalankan perintah berikut secara berurutan:

**1. Create Tables**

```bash
npm run insert:table-data
```

Perintah ini akan membuat seluruh tabel yang dibutuhkan aplikasi.

**2. Insert Dummy Data**

```bash
npm run insert:data
```

Perintah ini akan memasukkan akun pengguna dan data dummy untuk kebutuhan pengujian.

## Running Application

Jalankan development server:

```bash
npm run dev
```

Buka:

http://localhost:3000

## Default Accounts

Seluruh akun dummy menggunakan password:

`Password123!`

| Role | Email |
|---|---|
| Admin | admin@warehouse.com |
| Staff | staff@warehouse.com |
| Manager | manager@warehouse.com |

Ganti password default sebelum aplikasi digunakan secara operasional.

## Notes

- Jalankan database setup sebelum menggunakan aplikasi.
- Pastikan MySQL Server aktif.
- Jangan membagikan file `.env.local`.
- Data dummy hanya ditujukan untuk kebutuhan development dan testing.
