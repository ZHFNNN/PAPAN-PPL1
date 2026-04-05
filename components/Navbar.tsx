"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [highlightStyle, setHighlightStyle] = useState({
    left: "0px",
    width: "0px",
    opacity: 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/bookmark", label: "Bookmark" },
    { href: "/history", label: "History" },
    { href: "/notification", label: "Notification" },
  ];

  useEffect(() => {
    const activeItem = navItems.find((item) => pathname === item.href);
    if (!activeItem) {
      setHighlightStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const activeEl = linkRefs.current[activeItem.href];
    if (!activeEl) return;

    setHighlightStyle({
      left: `${activeEl.offsetLeft}px`,
      width: `${activeEl.offsetWidth}px`,
      opacity: 1,
    });
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const activeItem = navItems.find((item) => pathname === item.href);
      if (!activeItem) return;

      const activeEl = linkRefs.current[activeItem.href];
      if (!activeEl) return;

      setHighlightStyle({
        left: `${activeEl.offsetLeft}px`,
        width: `${activeEl.offsetWidth}px`,
        opacity: 1,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  return (
    <div className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[980px] px-2.5 sm:px-3 ml-12">
      <div className="h-[38px] sm:h-[42px] md:h-[46px] w-full flex items-center gap-1.5 sm:gap-2">
        {/* Left Section - Navigation Menu */}
        <div className="bg-[rgba(255,255,255,0.62)] backdrop-blur-md border border-[#9a9a9a] h-[38px] sm:h-[42px] md:h-[46px] rounded-[999px] px-2 sm:px-2.5 md:px-3 flex items-center gap-1 sm:gap-1.5 shadow-[0_5px_14px_rgba(0,0,0,0.06)]">
          {/* Logo */}
          <Link
            href="/"
            className="h-[24px] sm:h-[28px] md:h-[30px] px-1.5 sm:px-2 md:px-2.5 rounded-full flex items-center justify-center hover:bg-black/5 transition-all font-semibold text-[10px] sm:text-[11px] md:text-[12px] tracking-[0.2px] text-[#171717]"
          >
            PAPAN
          </Link>

          {/* Navigation Items */}
          <div className="relative flex items-center gap-1 sm:gap-1.5">
            {/* Sliding highlight — floats behind the links */}
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ease-in-out pointer-events-none"
              style={{
                left: highlightStyle.left,
                width: highlightStyle.width,
                height: "clamp(20px, 2.2vw, 28px)",
                background: "rgba(0, 0, 0, 0.07)",
                opacity: highlightStyle.opacity,
              }}
            />

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => {
                  linkRefs.current[item.href] = el;
                }}
                className={`relative z-10 h-5 sm:h-6 md:h-7 px-1.5 sm:px-2.5 md:px-3 rounded-full flex items-center whitespace-nowrap text-[10px] sm:text-[11px] md:text-[12px] transition-all ${
                  isActive(item.href)
                    ? "font-semibold text-[#111111]"
                    : "font-medium text-[#303030] hover:text-[#111111]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-[220px] sm:max-w-[280px] md:max-w-[360px]">
          <div className="bg-[rgba(255,255,255,0.62)] backdrop-blur-md border border-[#9a9a9a] h-[38px] sm:h-[42px] md:h-[46px] rounded-[999px] w-full flex items-center px-2 sm:px-2.5 md:px-3 shadow-[0_5px_14px_rgba(0,0,0,0.06)]">
            <div className="size-[14px] sm:size-[16px] md:size-[18px] mr-1 sm:mr-1.5 flex-shrink-0 flex items-center justify-center text-[10px] sm:text-[11px] md:text-[12px]">
              <span aria-hidden="true">🔍</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari properti berdasarkan lokasi..."
              className="flex-1 min-w-0 bg-transparent text-[10px] sm:text-[11px] md:text-[12px] font-medium text-[#1f1f1f] placeholder:text-[#5f5f5f] outline-none"
            />
          </div>
        </form>

        {/* Right Section - Login Button */}
        <Link
          href="/login"
          className="shrink-0 bg-[rgba(255,255,255,0.62)] backdrop-blur-md border border-[#9a9a9a] h-[38px] sm:h-[42px] md:h-[46px] rounded-[999px] w-[74px] sm:w-[90px] md:w-[108px] flex items-center justify-center text-[10px] sm:text-[11px] md:text-[12px] font-semibold text-[#171717] hover:bg-white/80 transition-all shadow-[0_5px_14px_rgba(0,0,0,0.06)]"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
