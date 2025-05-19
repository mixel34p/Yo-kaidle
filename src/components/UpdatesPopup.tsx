'use client';

import React, { useState, useEffect } from 'react';

interface UpdatesPopupProps {
  onClose: () => void;
  showPopup: boolean;
}

const CURRENT_VERSION = "1.2.0";
const STORAGE_KEY = "yokaidle_last_version_seen";

const UpdatesPopup: React.FC<UpdatesPopupProps> = ({ onClose, showPopup }) => {
  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-auto text-white border border-blue-400/30 animate-scaleIn overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-xl"></div>
        
        {/* Encabezado */}
        <div className="flex justify-between items-start mb-4 relative">
          <div>
            <h2 className="text-2xl font-bold text-blue-100">¡Novedades!</h2>
            <p className="text-blue-200 text-sm">Versión {CURRENT_VERSION}</p>
          </div>
          <button 
            onClick={onClose}
            className="bg-blue-800/50 hover:bg-blue-700 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Lista de actualizaciones */}
        <div className="space-y-4 relative">
          <div className="bg-blue-800/50 rounded-lg p-4 border-l-4 border-blue-400">
            <h3 className="font-semibold text-lg mb-2">Animaciones mejoradas</h3>
            <ul className="text-blue-100 space-y-2 text-sm ml-4">
              <li className="flex items-start">
                <span className="text-blue-300 mr-2">•</span>
                <span>Ahora las celdas aparecen secuencialmente con un efecto de revelación</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-300 mr-2">•</span>
                <span>Animaciones más fluidas y visualmente atractivas</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-800/50 rounded-lg p-4 border-l-4 border-indigo-400">
            <h3 className="font-semibold text-lg mb-2">Temporizador diario</h3>
            <ul className="text-blue-100 space-y-2 text-sm ml-4">
              <li className="flex items-start">
                <span className="text-blue-300 mr-2">•</span>
                <span>Nuevo contador que muestra el tiempo restante para el próximo Yo-kai diario</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-300 mr-2">•</span>
                <span>Mejor algoritmo para la selección del Yo-kai diario</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-800/50 rounded-lg p-4 border-l-4 border-purple-400">
            <h3 className="font-semibold text-lg mb-2">Nuevo diseño</h3>
            <ul className="text-blue-100 space-y-2 text-sm ml-4">
              <li className="flex items-start">
                <span className="text-blue-300 mr-2">•</span>
                <span>Interfaz actualizada con colores y estilos temáticos de Yo-kai Watch</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-300 mr-2">•</span>
                <span>Pie de página con créditos y enlaces</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Sin botón adicional, solo la X en la esquina superior derecha */}
      </div>
    </div>
  );
};

// Hook para controlar automáticamente cuando mostrar el popup
export const useUpdatesPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Comprobar si debemos mostrar el popup (si la versión ha cambiado)
    const lastVersionSeen = localStorage.getItem(STORAGE_KEY);
    
    if (lastVersionSeen !== CURRENT_VERSION) {
      // Mostrar el popup después de un breve retraso para permitir que la página se cargue
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    // Guardar la versión actual como la última vista
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setShowPopup(false);
  };

  return { showPopup, closePopup };
};

export default UpdatesPopup;
