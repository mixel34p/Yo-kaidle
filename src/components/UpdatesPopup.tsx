'use client';

import React, { useState, useEffect } from 'react';
import versionData from '@/data/gameVersion.json';

interface UpdatesPopupProps {
  onClose: () => void;
  showPopup: boolean;
}

interface Feature {
  category: string;
  color: string;
  items: string[];
}

interface VersionInfo {
  version: string;
  releaseDate: string;
  title: string;
  features: Feature[];
}

const STORAGE_KEY = "yokaidle_last_version_seen";
const CURRENT_VERSION = versionData.version;

const UpdatesPopup: React.FC<UpdatesPopupProps> = ({ onClose, showPopup }) => {
  const [currentVersionInfo, setCurrentVersionInfo] = useState<VersionInfo | null>(null);
  
  useEffect(() => {
    // Encuentra la información de la versión actual desde el archivo JSON
    const versionInfo = versionData.previousVersions.find(
      (v: VersionInfo) => v.version === CURRENT_VERSION
    );
    
    if (versionInfo) {
      setCurrentVersionInfo(versionInfo);
    }
  }, []);

  if (!showPopup || !currentVersionInfo) return null;

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-400',
      indigo: 'border-indigo-400',
      purple: 'border-purple-400',
      yellow: 'border-yellow-400',
      green: 'border-green-400',
      pink: 'border-pink-400',
      red: 'border-red-400',
      orange: 'border-orange-400'
    };
    
    return colorMap[color] || 'border-blue-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div 
        className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-xl shadow-2xl p-6 max-w-md w-full mx-auto text-white border border-blue-400/30 animate-scaleIn relative no-scrollbar"
        style={{ maxHeight: '85vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Ocultar scrollbar para Chrome/Safari/Opera */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Efectos de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 -left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
        
        {/* Icono decorativo de Yo-kai Watch */}
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 opacity-50 blur-md"></div>
        <div className="absolute -right-2 -top-2 w-12 h-12 rounded-full border-4 border-white/30 bg-gradient-to-br from-red-400 to-red-600 opacity-80"></div>
        
        {/* Encabezado con efecto de medalla */}
        <div className="flex justify-between items-start mb-6 relative">
          <div className="relative z-10 bg-gradient-to-r from-yellow-500 to-amber-500 text-blue-900 px-4 py-2 rounded-lg shadow-lg transform -rotate-2">
            <h2 className="text-2xl font-bold">¡Yo-kaidle {currentVersionInfo.version}!</h2>
            <p className="text-sm font-medium text-blue-800">{formatDate(currentVersionInfo.releaseDate)}</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-blue-800/70 hover:bg-blue-700 rounded-full p-2 transition-colors relative z-10 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Subtítulo */}
        <div className="mb-5 text-center">
          <h3 className="text-xl font-semibold text-blue-100 mb-2">{currentVersionInfo.title}</h3>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto rounded-full"></div>
        </div>
        
        {/* Lista de actualizaciones con efectos visuales */}
        <div className="space-y-4 relative z-10">
          {currentVersionInfo.features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-blue-800/40 backdrop-blur-sm rounded-lg p-4 border-l-4 ${getColorClass(feature.color)} transform hover:scale-[1.01] transition-all duration-200 hover:shadow-lg`}
            >
              <h3 className="font-semibold text-lg mb-2 text-blue-100">{feature.category}</h3>
              <ul className="text-blue-100 space-y-2 text-sm ml-4">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start animate-fadeIn" style={{ animationDelay: `${i * 150}ms` }}>
                    <span className="text-blue-300 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Espaciado inferior */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

// Hook para controlar automáticamente cuando mostrar el popup
export const useUpdatesPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    // Comprobar si debemos mostrar el popup (si la versión ha cambiado)
    const lastVersionSeen = localStorage.getItem(STORAGE_KEY) || '';
    
    if (compareVersions(lastVersionSeen, CURRENT_VERSION)) {
      // Mostrar el popup después de un breve retraso para permitir que la página se cargue
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Función para comparar versiones y determinar si se debe mostrar el popup
  const compareVersions = (lastSeen: string, current: string): boolean => {
    if (!lastSeen) return true; // Si no hay versión previa, mostrar
    
    // Convertir strings a arrays de números
    const lastParts = lastSeen.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    
    // Comparar versiones
    for (let i = 0; i < Math.max(lastParts.length, currentParts.length); i++) {
      const lastPart = lastParts[i] || 0;
      const currentPart = currentParts[i] || 0;
      
      if (currentPart > lastPart) return true;
      if (currentPart < lastPart) return false;
    }
    
    return false; // Si son iguales, no mostrar
  };

  const closePopup = () => {
    // Guardar la versión actual como la última vista
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setShowPopup(false);
  };

  return { showPopup, closePopup };
};

export default UpdatesPopup;
