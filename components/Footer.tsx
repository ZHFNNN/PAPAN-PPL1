'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#0f1d33] w-full py-12 px-8">
      <div className="max-w-[1515px] mx-auto">
        <div className="flex flex-wrap justify-between gap-10">

          {/* Logo Section */}
          <div className="flex flex-col items-center min-w-[120px] gap-2">
            <div className="h-[70px] w-[120px] relative mix-blend-color-dodge overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="PAPAN Logo"
                fill
                sizes="(max-width: 768px) 120px, 172px"
                className="object-contain"
              />
            </div>
            <p className="font-['Poppins',sans-serif] font-bold text-[20px] text-white text-center tracking-[-2px]">
              PAPAN
            </p>
          </div>

          {/* Tentang Section */}
          <div className="text-white min-w-[120px]">
            <h3 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-center mb-4">
              Tentang
            </h3>
            <div className="flex flex-col gap-3 text-center">
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Tentang Kami
              </a>
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Cara Kerja DSS
              </a>
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Blog
              </a>
            </div>
          </div>

          {/* Bantuan Section */}
          <div className="text-white min-w-[120px]">
            <h3 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-center mb-4">
              Bantuan
            </h3>
            <div className="flex flex-col gap-3 text-center">
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                FAQ
              </a>
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Panduan
              </a>
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Kontak
              </a>
            </div>
          </div>

          {/* Legal Section */}
          <div className="text-white min-w-[120px]">
            <h3 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-center mb-4">
              Legal
            </h3>
            <div className="flex flex-col gap-3 text-center">
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Syarat dan Ketentuan
              </a>
              <a href="#" className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity">
                Kebijakan Privasi
              </a>
            </div>
          </div>

          {/* Kontak Section */}
          <div className="text-white min-w-[140px]">
            <h3 className="font-['Poppins',sans-serif] font-semibold text-[14px] text-center mb-4">
              Kontak
            </h3>
            <div className="flex flex-col gap-3 text-center">
              <a
                href="tel:+628175683642"
                className="font-['Poppins',sans-serif] text-[12px] opacity-70 hover:opacity-100 transition-opacity"
              >
                +62817 5683 6421
              </a>
              <p className="font-['Poppins',sans-serif] text-[12px] opacity-70">
                Jatinangor, Sumedang
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/10 mt-10 pt-6 text-center">
          <p className="font-['Poppins',sans-serif] text-[11px] text-white opacity-40">
            © {new Date().getFullYear()} PAPAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}