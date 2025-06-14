'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

interface GameState {
  gameState: any;
  dailyState: any;
  infiniteState: any;
  medallium: any;
  medalliumFavorites: string[];
  medalliumUnlockDates: Record<string, string>;
}

interface SyncDialogProps {
  localData: GameState;
  cloudData: GameState | null;
  onChoice: (useCloud: boolean) => void;
  onClose: () => void;
}

export default function SyncDialog({ localData, cloudData, onChoice, onClose }: SyncDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Sincronización de datos
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Datos locales</h3>              <ul className="space-y-2 text-sm">
                <li>Estado del juego: {localData.gameState ? '✅' : '❌'}</li>
                <li>Estado diario: {localData.dailyState ? '✅' : '❌'}</li>
                <li>Estado infinito: {localData.infiniteState ? '✅' : '❌'}</li>
                <li>Medallium: {localData.medallium ? '✅' : '❌'}</li>
                <li>Favoritos: {localData.medalliumFavorites.length} Yo-kai</li>
                <li>Fechas de desbloqueo: {Object.keys(localData.medalliumUnlockDates).length} registros</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">Datos en la nube</h3>
              {cloudData ? (                <ul className="space-y-2 text-sm">
                  <li>Estado del juego: {cloudData.gameState ? '✅' : '❌'}</li>
                  <li>Estado diario: {cloudData.dailyState ? '✅' : '❌'}</li>
                  <li>Estado infinito: {cloudData.infiniteState ? '✅' : '❌'}</li>
                  <li>Medallium: {cloudData.medallium ? '✅' : '❌'}</li>
                  <li>Favoritos: {cloudData.medalliumFavorites.length} Yo-kai</li>
                  <li>Fechas de desbloqueo: {Object.keys(cloudData.medalliumUnlockDates).length} registros</li>
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No hay datos en la nube</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => onChoice(false)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Usar datos locales
            </button>
            {cloudData && (
              <button
                onClick={() => onChoice(true)}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Usar datos de la nube
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
