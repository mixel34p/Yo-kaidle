'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Yokai, Tribe, Game, tribeTranslations } from '@/types/yokai';
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
      {/* Cabecera con título y botón de volver */}
      <header className="mb-6 text-center">
        <div className="flex justify-between items-center px-4 py-2">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-center">Mi Medallium</h1>
          <div className="w-20"></div> {/* Espaciador para centrar el título */}
        </div>
      </header>

      {/* Estadísticas del Medallium */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Progreso</h2>
          <div className="flex justify-center items-center space-x-2">
            <div className="text-2xl font-bold">{stats.totalUnlocked}</div>
            <div className="text-sm text-gray-200">de</div>
            <div className="text-lg">{stats.totalYokai}</div>
          </div>
          <div className="mt-2 w-full bg-blue-900 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <div className="mt-1 text-sm">{stats.percentage}% completado</div>
        </div>
      </div>

      {/* Filtros y ordenación */}
      <div className="mb-6 px-4">
        <div className="bg-gray-100 rounded-lg p-3 shadow">
          <div className="flex flex-wrap justify-between gap-2">
            {/* Ordenar por */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="number">Número</option>
                <option value="name">Nombre</option>
                <option value="tribe">Tribu</option>
              </select>
            </div>
            
            {/* Filtrar por tribu */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tribu</label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                value={tribeFilter || ''}
                onChange={(e) => setTribeFilter(e.target.value || null)}
              >
                <option value="">Todas</option>
                {tribes.map((tribe) => (
                  <option key={tribe} value={tribe}>
                    {tribeTranslations[tribe] || tribe}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtrar por juego */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Juego</label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                value={gameFilter || ''}
                onChange={(e) => setGameFilter(e.target.value || null)}
              >
                <option value="">Todos</option>
                {games.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Yo-kai */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredYokai.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-4">
          {filteredYokai.map((yokai) => (
            <MedalliumCard 
              key={yokai.id} 
              yokai={yokai} 
              onClick={handleYokaiClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-100 rounded-lg mx-4">
          <h3 className="text-xl font-bold text-gray-500 mb-2">¡Medallium vacío!</h3>
          <p className="text-gray-600">
            Aún no has desbloqueado ningún Yo-kai que coincida con los filtros.
          </p>
          <p className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Volver a jugar para desbloquear Yo-kai
            </Link>
          </p>
        </div>
      )}

      {/* Modal de detalle de Yo-kai */}
      {selectedYokai && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeDetail}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-700">
              <img 
                src={selectedYokai.imageurl || selectedYokai.image_url || selectedYokai.img || selectedYokai.image || '/images/yokai-placeholder.png'} 
                alt={selectedYokai.name}
                className="w-full h-full object-contain"
              />
              <button 
                className="absolute top-2 right-2 bg-white bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 transition"
                onClick={closeDetail}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedYokai.name}</h2>
                  <div className="flex items-center mt-1">
                    <img src={tribeIcons[selectedYokai.tribe]} alt={selectedYokai.tribe} className="w-6 h-6 mr-2" />
                    <span className="text-gray-600">{tribeTranslations[selectedYokai.tribe] || selectedYokai.tribe}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Medalla #</div>
                  <div className="text-xl font-bold">{selectedYokai.medalNumber}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-sm text-gray-500">Rango</div>
                  <div className="font-medium">{selectedYokai.rank}</div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-sm text-gray-500">Elemento</div>
                  <div className="font-medium">{selectedYokai.element}</div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-sm text-gray-500">Peso</div>
                  <div className="font-medium">{selectedYokai.weight} kg</div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-sm text-gray-500">Comida favorita</div>
                  <div className="font-medium">{selectedYokai.favoriteFood}</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <img src={gameLogos[selectedYokai.game]} alt={selectedYokai.game} className="w-8 h-8 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Juego de origen</div>
                    <div className="font-medium text-blue-700">{selectedYokai.game}</div>
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
