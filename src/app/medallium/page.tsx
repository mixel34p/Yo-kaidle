'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Yokai, Tribe, Game, tribeTranslations, tribeIcons, gameLogos, rankIcons, foodIcons, elementTranslations } from '@/types/yokai';
import { 
  loadMedallium, 
  getUnlockedYokaiArray, 
  filterByTribe, 
  filterByGame, 
  sortByMedalNumber, 
  sortByName,
  sortByTribe,
  calculateMedalliumStats 
} from '@/utils/medalliumManager';
import MedalliumCard from '@/components/MedalliumCard';
import { getAllYokai } from '@/lib/supabase';

type SortOption = 'number' | 'name' | 'tribe';
type FilterOption = string | null;

export default function Medallium() {
  const [unlockedYokai, setUnlockedYokai] = useState<Yokai[]>([]);
  const [filteredYokai, setFilteredYokai] = useState<Yokai[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalYokai, setTotalYokai] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('number');
  const [tribeFilter, setTribeFilter] = useState<FilterOption>(null);
  const [gameFilter, setGameFilter] = useState<FilterOption>(null);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedYokai, setSelectedYokai] = useState<Yokai | null>(null);
  const [stats, setStats] = useState({ totalUnlocked: 0, totalYokai: 0, percentage: 0 });

  // Cargar datos del medallium al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Cargar todos los Yo-kai de la base de datos para obtener el total
        const allYokai = await getAllYokai();
        
        // Cargar los Yo-kai desbloqueados del medallium
        const medallium = loadMedallium();
        const unlocked = getUnlockedYokaiArray(medallium);
        
        // Extraer todas las tribus y juegos disponibles para los filtros
        const uniqueTribes = Array.from(new Set(allYokai.map(y => y.tribe))) as Tribe[];
        const uniqueGames = Array.from(new Set(allYokai.map(y => y.game))) as Game[];
        
        // Establecer los datos
        setTotalYokai(allYokai.length);
        setUnlockedYokai(unlocked);
        setFilteredYokai(sortByMedalNumber(unlocked));
        setTribes(uniqueTribes);
        setGames(uniqueGames);
        
        // Calcular estadísticas
        setStats(calculateMedalliumStats(medallium, allYokai.length));
      } catch (error) {
        console.error('Error cargando datos del medallium:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Aplicar filtros y ordenación cuando cambien los criterios
  useEffect(() => {
    // Primero aplicar los filtros
    let filtered = unlockedYokai;
    
    if (tribeFilter) {
      filtered = filterByTribe(filtered, tribeFilter);
    }
    
    if (gameFilter) {
      filtered = filterByGame(filtered, gameFilter);
    }
    
    // Luego aplicar la ordenación
    switch (sortBy) {
      case 'number':
        filtered = sortByMedalNumber(filtered);
        break;
      case 'name':
        filtered = sortByName(filtered);
        break;
      case 'tribe':
        filtered = sortByTribe(filtered);
        break;
    }
    
    setFilteredYokai(filtered);
  }, [unlockedYokai, sortBy, tribeFilter, gameFilter]);

  // Manejar la selección de un Yo-kai
  const handleYokaiClick = (yokai: Yokai) => {
    setSelectedYokai(yokai);
  };

  // Cerrar el detalle de un Yo-kai
  const closeDetail = () => {
    setSelectedYokai(null);
  };

  return (
    <div className="medallium-container pb-20">
      {/* Cabecera con título y botón de volver mejorado */}
      <header className="mb-6">
        <div className="relative flex items-center justify-center py-3">
          <Link 
            href="/" 
            className="absolute left-2 flex items-center justify-center h-10 w-10 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
            aria-label="Volver al juego"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Mi Medallium
            </h1>
            <p className="text-sm text-gray-500 mt-1">Colección de Yo-kai desbloqueados</p>
          </div>
        </div>
      </header>

      {/* Estadísticas del Medallium mejorado */}
      <div className="mb-6 p-5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl shadow-lg text-white overflow-hidden relative">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Progreso de Colección</h2>
            <div className="text-lg font-bold bg-white text-amber-600 rounded-full h-8 min-w-[3rem] flex items-center justify-center px-3 shadow-inner">
              {stats.percentage}%
            </div>
          </div>
          
          <div className="flex items-end mb-3">
            <div className="text-3xl font-bold mr-2">{stats.totalUnlocked}</div>
            <div className="text-lg mb-1">/ {stats.totalYokai}</div>
          </div>
          
          <div className="relative w-full bg-amber-700/50 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
              style={{ width: `${stats.percentage}%` }}
            >
              {stats.percentage > 10 && (
                <span className="text-[10px] font-bold text-amber-600">{stats.totalUnlocked}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y ordenación mejorados */}
      <div className="mb-6 px-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 shadow-md border border-blue-200">
          <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filtros y Ordenación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Ordenar por - con iconos */}
            <div className="">
              <label className="block text-sm font-medium text-blue-700 mb-1">Ordenar por</label>
              <div className="relative">
                <select 
                  className="w-full pl-10 py-2 rounded-lg border-blue-200 bg-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition-colors"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="number">Número</option>
                  <option value="name">Nombre</option>
                  <option value="tribe">Tribu</option>
                </select>
                <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Filtrar por tribu - con iconos */}
            <div className="">
              <label className="block text-sm font-medium text-blue-700 mb-1">Tribu</label>
              <div className="relative">
                <select 
                  className="w-full pl-10 py-2 rounded-lg border-blue-200 bg-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition-colors"
                  value={tribeFilter || ''}
                  onChange={(e) => setTribeFilter(e.target.value || null)}
                >
                  <option value="">Todas las tribus</option>
                  {tribes.map((tribe) => (
                    <option key={tribe} value={tribe}>
                      {tribeTranslations[tribe] || tribe}
                    </option>
                  ))}
                </select>
                <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Filtrar por juego - con iconos */}
            <div className="">
              <label className="block text-sm font-medium text-blue-700 mb-1">Juego</label>
              <div className="relative">
                <select 
                  className="w-full pl-10 py-2 rounded-lg border-blue-200 bg-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition-colors"
                  value={gameFilter || ''}
                  onChange={(e) => setGameFilter(e.target.value || null)}
                >
                  <option value="">Todos los juegos</option>
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game.replace('Yo-kai Watch ', 'YW ')}
                    </option>
                  ))}
                </select>
                <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Yo-kai mejorada */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-60">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-blue-600 font-medium">Cargando tu colección...</p>
        </div>
      ) : filteredYokai.length > 0 ? (
        <div className="px-4">
          <div className="flex justify-between items-center mb-3 text-sm text-gray-500 px-1">
            <div>
              Mostrando <span className="font-semibold text-blue-600">{filteredYokai.length}</span> Yo-kai
            </div>
            {filteredYokai.length < unlockedYokai.length && (
              <div>
                Filtrados de <span className="font-semibold text-blue-600">{unlockedYokai.length}</span> totales
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredYokai.map((yokai) => (
              <MedalliumCard 
                key={yokai.id} 
                yokai={yokai} 
                onClick={handleYokaiClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mx-4 shadow-inner border border-blue-100">
          <div className="mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-700 mb-2">¡Medallium vacío!</h3>
          <p className="text-gray-600 mb-4">
            Aún no has desbloqueado ningún Yo-kai que coincida con los filtros aplicados.
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a jugar
            </Link>
          </div>
        </div>
      )}

      {/* Modal de detalle de Yo-kai */}
      {selectedYokai && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeDetail}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-0 overflow-hidden animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            {/* Encabezado con imagen y gradiente */}
            <div className="relative h-52 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
              {/* Patrón de fondo */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '24px 24px' }}></div>
              </div>
              
              {/* Imagen del Yo-kai */}
              <img 
                src={selectedYokai.imageurl || selectedYokai.image_url || selectedYokai.img || selectedYokai.image || '/images/yokai-placeholder.png'} 
                alt={selectedYokai.name}
                className="w-full h-full object-contain drop-shadow-lg p-2"
              />
              
              {/* Botón de cerrar */}
              <button 
                className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/60 transition-all duration-200 shadow-lg"
                onClick={closeDetail}
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Medalla decorativa */}
              <div className="absolute left-3 top-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full py-1 px-3 shadow-lg">
                #{selectedYokai.medalNumber}
              </div>
            </div>
            
            <div className="p-5">
              {/* Nombre y tribu */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedYokai.name}</h2>
                  <div className="flex items-center">
                    <img src={tribeIcons[selectedYokai.tribe]} alt={selectedYokai.tribe} className="w-6 h-6 mr-2" />
                    <span className="text-gray-600 font-medium">{tribeTranslations[selectedYokai.tribe] || selectedYokai.tribe}</span>
                  </div>
                </div>
              </div>
              
              {/* Características del Yo-kai */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Rango */}
                <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <div className="text-xs text-blue-600 mb-2">Rango</div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img 
                      src={rankIcons[selectedYokai.rank]} 
                      alt={`Rango ${selectedYokai.rank}`}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>
                
                {/* Elemento */}
                <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <div className="text-xs text-blue-600 mb-2">Elemento</div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    {/* Como no hay iconos definidos para elementos, creamos un div decorativo con el nombre */}
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-700 text-white rounded-full shadow-md">
                      <span className="text-xs font-bold">{selectedYokai.element.charAt(0)}</span>
                    </div>
                    <span className="sr-only">{elementTranslations[selectedYokai.element] || selectedYokai.element}</span>
                  </div>
                </div>
                
                {/* Comida favorita */}
                <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <div className="text-xs text-blue-600 mb-2">Comida</div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img 
                      src={foodIcons[selectedYokai.favoriteFood]} 
                      alt={selectedYokai.favoriteFood}
                      className="w-full h-full object-contain drop-shadow-md"
                      onError={(e) => {
                        // Fallback a un icono genérico
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const span = document.createElement('span');
                          span.className = 'text-xs font-bold bg-blue-100 p-1 rounded';
                          span.textContent = selectedYokai.favoriteFood;
                          parent.appendChild(span);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Juego de origen */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <img src={gameLogos[selectedYokai.game]} alt={selectedYokai.game} className="w-10 h-10 mr-3 bg-white p-1 rounded-full shadow-inner" />
                  <div>
                    <div className="text-xs text-blue-600">Juego de origen</div>
                    <div className="font-medium text-blue-900">{selectedYokai.game}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
