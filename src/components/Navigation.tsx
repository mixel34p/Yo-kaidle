'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg" style={{ marginBottom: '56px' }}>
      <div className="container mx-auto max-w-md">
        <div className="flex justify-around">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center py-2 px-4 transition-colors ${
              pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Jugar</span>
          </Link>
          
          <Link 
            href="/medallium" 
            className={`flex flex-col items-center justify-center py-2 px-4 transition-colors ${
              pathname === '/medallium' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="text-xs">Mi Medallium</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
