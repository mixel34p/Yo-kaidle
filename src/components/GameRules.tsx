import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const GameRules: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showClarifications, setShowClarifications] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="game-rules mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-white rounded-lg px-4 py-2 w-full flex justify-between items-center shadow-md font-medium transition-all duration-300"
        style={{ background: 'linear-gradient(135deg, var(--secondary-color), var(--dark-blue))' }}
      >
        <div className="flex items-center">
          <img 
            src="/icons/rules/how-to-play.png" 
            alt="Reglas" 
            className="w-6 h-6 mr-2 object-contain" 
            onError={(e) => {
              // Fallback al emoji si la imagen no se encuentra
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span className="mr-2 text-xl">📋</span>' + e.currentTarget.parentElement!.innerHTML;
            }}
          />
          <span>{t.howToPlay}</span>
        </div>
        <span className="text-xl">{isOpen ? '▼' : '▶'}</span>
      </button>
      
      {isOpen && (
        <div className="p-4 rounded-lg mt-2 shadow-md border border-accent animate-fadeIn" 
             style={{ background: 'rgba(15, 82, 152, 0.75)', backdropFilter: 'blur(8px)', color: 'white' }}>
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--gold-accent)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>{t.gameRules}</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>{t.rule1}</li>
            <li>{t.rule2}</li>
            <li>{t.rule3}</li>
          </ul>
          <div className="grid grid-cols-1 gap-2 mt-3 p-3 rounded-lg" style={{ background: 'rgba(234, 242, 255, 0.15)' }}>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm mr-2" style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}></div>
              <span className="text-sm font-medium">{t.colorCorrect}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm mr-2" style={{ background: 'linear-gradient(135deg, #EAB308, #CA8A04)' }}></div>
              <span className="text-sm font-medium">{t.colorHigher} / {t.colorLower}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm mr-2" style={{ background: 'linear-gradient(135deg, #64748B, #475569)' }}></div>
              <span className="text-sm font-medium">{t.colorIncorrect}</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-center p-2 rounded-lg" style={{ background: 'rgba(66, 196, 255, 0.2)' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{t.dailyChallenge}</p>
          </div>
          
          <div className="mt-3 flex justify-center">
            <button 
              onClick={() => setShowClarifications(!showClarifications)}
              className="text-sm px-3 py-1 rounded-md transition-all duration-200 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
              style={{ 
                background: 'linear-gradient(135deg, var(--gold-accent), var(--gold-accent-dark))',
                color: '#1a365d',
                fontWeight: '500',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              {showClarifications ? 'Ocultar aclaraciones' : 'Ver aclaraciones'}
            </button>
          </div>
          
          {showClarifications && (
            <div className="mt-3 p-3 rounded-lg animate-fadeIn" 
                 style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--gold-accent)' }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--gold-accent)' }}>{t.clarificationsTitle}</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>{t.clarification1}</li>
                <li>{t.clarification2}</li>
                <li>{t.clarification3}</li>
                <li>{t.clarification4}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameRules;
