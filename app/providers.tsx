'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2600,
          style: {
            background: 'rgba(255,255,255,0.72)',
            color: '#171717',
            border: '1px solid #9a9a9a',
            borderRadius: '999px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 5px 14px rgba(0,0,0,0.06)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'inherit',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#171717',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#B42318',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </SessionProvider>
  );
}
