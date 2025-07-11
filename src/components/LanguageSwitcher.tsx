'use client';

import React, { useState } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const languages = {
    es: { flag: '🇪🇸', name: 'Español' },
    en: { flag: '🇺🇸', name: 'English (Beta)' }
  };

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      <button
        onClick={toggleDropdown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <span style={{ fontSize: '16px' }}>{languages[language].flag}</span>
        <span>{languages[language].name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '4px',
            minWidth: '140px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}
        >
          {Object.entries(languages).map(([lang, info]) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang as Language)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: language === lang ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: 'none',
                color: language === lang ? '#1d4ed8' : '#374151',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: language === lang ? '600' : '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (language !== lang) {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== lang) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{info.flag}</span>
              <span>{info.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
