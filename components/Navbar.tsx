import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import svgPaths from "../../imports/svg-qk0eujio3d";
import imgImage10 from "figma:asset/726209b3f7f2b334a007deda37ec52ea60a64b9f.png";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[1265px] px-4">
      <div className="relative h-[53px] w-full">
        {/* Left Section - Navigation Menu */}
        <div className="absolute left-0 top-0">
          <div className="bg-[rgba(255,255,255,0.53)] backdrop-blur-sm border border-[#9a9a9a] h-[53px] rounded-[40px] px-8 flex items-center gap-8">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="h-[29px] w-[50px] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <div className="relative h-full w-full overflow-hidden">
                <img
                  alt="Logo"
                  className="absolute h-[334.58%] left-[-95.96%] max-w-none top-[-151.08%] w-[291.92%]"
                  src={imgImage10}
                />
              </div>
            </button>

            {/* Navigation Items */}
            <button
              onClick={() => navigate('/')}
              className={`font-['Poppins:Medium',sans-serif] text-[16px] px-4 py-2 rounded-lg transition-all hover:bg-white/30 ${
                isActive('/') ? 'text-[#1f1f1f] font-semibold' : 'text-[#1f1f1f]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => console.log('Bookmark clicked')}
              className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#1f1f1f] px-4 py-2 rounded-lg transition-all hover:bg-white/30"
            >
              Bookmark
            </button>

            <button
              onClick={() => console.log('History clicked')}
              className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#1f1f1f] px-4 py-2 rounded-lg transition-all hover:bg-white/30"
            >
              History
            </button>

            <button
              onClick={() => console.log('Notification clicked')}
              className="font-['Poppins:Medium',sans-serif] text-[16px] text-[#1f1f1f] px-4 py-2 rounded-lg transition-all hover:bg-white/30"
            >
              Notification
            </button>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="absolute left-[767px] top-0">
          <form onSubmit={handleSearch} className="relative">
            <div className="bg-[rgba(255,255,255,0.53)] backdrop-blur-sm border border-[#9a9a9a] h-[53px] rounded-[40px] w-[351px] flex items-center px-4">
              <div className="size-[22px] mr-3 flex-shrink-0">
                <div className="relative size-full">
                  <svg className="absolute inset-[12.5%] block w-[75%] h-[75%]" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5 16.5">
                    <path d={svgPaths.p27fb68f0} fill="black" />
                  </svg>
                </div>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari properti berdasarkan lokasi..."
                className="flex-1 bg-transparent font-['Poppins:Medium',sans-serif] text-[16px] text-[#1f1f1f] placeholder:text-[#1f1f1f] placeholder:opacity-50 outline-none"
              />
            </div>
          </form>
        </div>

        {/* Right Section - Login Button */}
        <div className="absolute left-[1133px] top-0">
          <button
            onClick={() => navigate('/login')}
            className="bg-[rgba(255,255,255,0.53)] backdrop-blur-sm border border-[#9a9a9a] h-[53px] rounded-[40px] w-[132px] flex items-center justify-center font-['Poppins:Medium',sans-serif] text-[16px] text-[#1f1f1f] hover:bg-white/70 transition-all"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
