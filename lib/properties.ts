// lib/properties.ts

export type Properti = {
  id: number;
  title: string;
  kategori: 'Rumah' | 'Apartemen' | 'Kosan';
  price: string;
  biayaHidup: string;
  lokasi: string;
  luas: string;
  lantai: string;
  kt: string;
  km: string;
  fasilitas: string[];
  images: string[];
};

export const properties: Properti[] = [
  {
    id: 1,
    title: 'Rumah keren nan megah',
    kategori: 'Rumah',
    price: 'Rp3.500.000.000',
    biayaHidup: 'Estimasi biaya hidup: 8 juta/bulan',
    lokasi: 'Kebayoran Baru, Jakarta Selatan',
    luas: '195m²', lantai: '2 Lantai', kt: '5KT', km: '7KM',
    fasilitas: ['Kolam Renang', 'Garasi 2 Mobil'],
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
    ],
  },
  {
    id: 2,
    title: 'Apartemen mewah tepi danau',
    kategori: 'Apartemen',
    price: 'Rp5.200.000.000',
    biayaHidup: 'Estimasi biaya hidup: 12 juta/bulan',
    lokasi: 'Depok, Jawa Barat',
    luas: '320m²', lantai: '3 Lantai', kt: '6KT', km: '5KM',
    fasilitas: ['Kolam Renang', 'Garasi 3 Mobil'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    ],
  },
  {
    id: 3,
    title: 'Rumah minimalis modern',
    kategori: 'Rumah',
    price: 'Rp1.800.000.000',
    biayaHidup: 'Estimasi biaya hidup: 5 juta/bulan',
    lokasi: 'Tangerang Selatan, Banten',
    luas: '120m²', lantai: '1 Lantai', kt: '3KT', km: '2KM',
    fasilitas: ['Taman', 'Garasi 1 Mobil'],
    images: [
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',
    ],
  },
  {
    id: 4,
    title: 'Townhouse eksklusif',
    kategori: 'Kosan',
    price: 'Rp2.900.000.000',
    biayaHidup: 'Estimasi biaya hidup: 7 juta/bulan',
    lokasi: 'BSD City, Tangerang',
    luas: '210m²', lantai: '2 Lantai', kt: '4KT', km: '3KM',
    fasilitas: ['Kolam Renang', 'Taman'],
    images: [
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    ],
  },
  {
    id: 5,
    title: 'Kosan sangat asri perumahan',
    kategori: 'Kosan',
    price: 'Rp980.000.000',
    biayaHidup: 'Estimasi biaya hidup: 3 juta/bulan',
    lokasi: 'Bekasi, Jawa Barat',
    luas: '90m²', lantai: '2 Lantai', kt: '3KT', km: '2KM',
    fasilitas: ['Carport', 'Taman kecil'],
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
      'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80',
    ],
  },
  {
    id: 6,
    title: 'Apartemen heritage art deco',
    kategori: 'Apartemen',
    price: 'Rp4.100.000.000',
    biayaHidup: 'Estimasi biaya hidup: 10 juta/bulan',
    lokasi: 'Menteng, Jakarta Pusat',
    luas: '450m²', lantai: '2 Lantai', kt: '7KT', km: '6KM',
    fasilitas: ['Kolam Renang', 'Gazebo'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
    ],
  },
];