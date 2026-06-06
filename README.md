This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

## SETUP DATABASE

 - psql -U postgre
 - masukin password
 - CREATE DATABASE papan_db;
 - edit .env DATABASE_URL = "postgresql://postgres:UR_PSQL_PASSWORD@localhost:5432/papan_db?schema=public"
 
## install dan validasi
 1. npm install
 2. npx prisma generate
 3. npx prisma migrate dev --name init
 4. npm run prisma:seed
 5. npm run dev

dah


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub CI dan CS

Repository ini sudah disiapkan dengan 2 workflow GitHub Actions:

- CI: menjalankan install dependency, `prisma generate`, `lint`, dan `build` setiap push atau pull request ke `main` / `master`.
- Security: menjalankan dependency review saat pull request dan CodeQL scanning untuk JavaScript / TypeScript.

### Cara pakai

1. Push workflow ini ke branch utama repository.
2. Buka tab `Actions` di GitHub untuk melihat hasil CI.
3. Buka tab `Security` untuk melihat hasil CodeQL dan alert keamanan.
4. Saat membuat atau update pull request, pastikan status check CI dan Dependency Review hijau sebelum merge.

### Secret yang perlu disiapkan

Tambahkan nilai env production ke `Settings > Secrets and variables > Actions` di GitHub. Minimal yang dipakai project ini:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (opsional, fallback ke `ADMIN_EMAIL`)
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_IS_PRODUCTION` (`true` untuk production, selain itu sandbox)

### Midtrans webhook

Setelah checkout Midtrans aktif, arahkan notifikasi server ke endpoint ini:

- `POST /api/owner/boosts/webhook`

Endpoint tersebut akan memverifikasi signature Midtrans, menandai transaksi sebagai `PAID`, lalu membuat `PropertyBoost` hanya setelah pembayaran sukses.

### Catatan

File `.env` lokal jangan di-commit. Jika credential Google login atau secret lain sempat tersebar di luar lingkungan lokal, sebaiknya diganti dulu sebelum dipakai di production.

coba
