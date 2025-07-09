'use client';

import React from 'react';
import { InfiniteConfig } from '@/utils/gameSourcePreferences';

interface InfiniteConfigPanelProps {
  config: InfiniteConfig;
  onConfigChange: (config: InfiniteConfig) => void;
}

const InfiniteConfigPanel: React.FC<InfiniteConfigPanelProps> = ({
  config,
  onConfigChange
}) => {
  const updateConfig = (updates: Partial<InfiniteConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="infinite-config-panel bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Configuración Avanzada</h3>
      
      <div className="space-y-6">
        {/* Configuración de Tiempo */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            ⏱️ Configuración de Tiempo
          </h4>
          
          {/* Límite de tiempo */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite de tiempo por yokai
            </label>
            <select
              value={config.timeLimit}
              onChange={(e) => updateConfig({ timeLimit: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Sin límite</option>
              <option value={30}>30 segundos</option>
              <option value={60}>1 minuto</option>
              <option value={120}>2 minutos</option>
              <option value={300}>5 minutos</option>
            </select>
          </div>

          {/* Mostrar timer */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Mostrar cronómetro</p>
              <p className="text-sm text-gray-600">Ver tiempo transcurrido durante el juego</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showTimer}
                onChange={(e) => updateConfig({ showTimer: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Configuración de Intentos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            🎯 Configuración de Intentos
          </h4>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de intentos
            </label>
            <select
              value={config.maxAttempts}
              onChange={(e) => updateConfig({ maxAttempts: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={4}>4 intentos (Difícil)</option>
              <option value={6}>6 intentos (Normal)</option>
              <option value={8}>8 intentos (Fácil)</option>
              <option value={0}>Ilimitados</option>
            </select>
          </div>
        </div>

        {/* Configuración de Pistas */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            💡 Configuración de Pistas
          </h4>
          
          {/* Habilitar pistas */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Habilitar pistas</p>
              <p className="text-sm text-gray-600">Mostrar pistas después de varios intentos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.hintsEnabled}
                onChange={(e) => updateConfig({ hintsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Pistas después de X intentos */}
          {config.hintsEnabled && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mostrar pistas después de {config.hintsAfterAttempts} intentos
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={config.hintsAfterAttempts}
                onChange={(e) => updateConfig({ hintsAfterAttempts: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
              </div>
            </div>
          )}
        </div>

        {/* Configuración de Interfaz */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            🖥️ Configuración de Interfaz
          </h4>

          {/* Mostrar dificultad */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Mostrar dificultad</p>
              <p className="text-sm text-gray-600">Ver nivel de dificultad del yokai</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showDifficulty}
                onChange={(e) => updateConfig({ showDifficulty: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Reset button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onConfigChange({
              timeLimit: 0,
              showTimer: false,
              maxAttempts: 6,
              hintsEnabled: true,
              hintsAfterAttempts: 3,
              autoAdvance: false,
              autoAdvanceDelay: 3,
              showDifficulty: true,
              soundEnabled: true,
              celebrationAnimations: true
            })}
            className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            🔄 Restaurar configuración por defecto
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfiniteConfigPanel;
