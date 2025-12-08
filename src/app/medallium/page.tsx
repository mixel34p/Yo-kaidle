'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Yokai, Tribe, Game, Element, Rank, tribeTranslations, tribeIcons, gameLogos, rankIcons, foodIcons, elementIcons, elementTranslations } from '@/types/yokai';
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
import MedalliumDetail from '@/components/MedalliumDetail';
import { getAllYokai } from '@/lib/supabase';
import { Search, Grid, List, Heart, Filter, SlidersHorizontal, ArrowDownAZ, Hash, ChevronDown, X, RefreshCw } from 'lucide-react';
import { checkAchievements } from '@/utils/achievementSystem';
import { calculateAdvancedStats } from '@/utils/advancedStats';
import AchievementsPanel from '@/components/AchievementsPanel';
import AdvancedStatsPanel from '@/components/AdvancedStatsPanel';
import CirclesPanel from '@/components/CirclesPanel';
import { useLanguage } from '@/contexts/LanguageContext';

// Tipos para la ordenación y filtros
type SortOption = 'number' | 'name' | 'tribe';
type FilterOption = string | null;
type ViewMode = 'grid' | 'list';
type UnlockDates = Record<string, string>; // Mapeo de ID de Yo-kai a fecha de desbloqueo

// Importamos MedalliumData desde medalliumManager
import { MedalliumData } from '@/utils/medalliumManager';

export default function Medallium() {
  // Estados para Yo-kai y filtrado
  const [unlockedYokai, setUnlockedYokai] = useState<Yokai[]>([]);
  const [filteredYokai, setFilteredYokai] = useState<Yokai[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalYokai, setTotalYokai] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('number');
  const [tribeFilter, setTribeFilter] = useState<FilterOption>(null);
  const [gameFilter, setGameFilter] = useState<FilterOption>(null);
  const [rankFilter, setRankFilter] = useState<FilterOption>(null);
  const [elementFilter, setElementFilter] = useState<FilterOption>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedYokai, setSelectedYokai] = useState<Yokai | null>(null);
  const [stats, setStats] = useState({ totalUnlocked: 0, totalYokai: 0, percentage: 0 });

  // Estados para UI y preferencias de usuario
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [unlockDates, setUnlockDates] = useState<UnlockDates>({});
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Estados para nuevos paneles
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showCircles, setShowCircles] = useState(false);
  const [allYokai, setAllYokai] = useState<Yokai[]>([]);
  const [advancedStats, setAdvancedStats] = useState<any>(null);

  // Hook para traducciones
  const { t, getYokaiName, getTribeTranslation, getElementTranslation, getFoodTranslation } = useLanguage();

  // Cargar preferencias del usuario desde localStorage
  useEffect(() => {
    const loadUserPreferences = () => {
      try {
        // Acceder al localStorage para obtener favoritos y modo de vista
        const storedFavorites = localStorage.getItem('medalliumFavorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }

        const storedViewMode = localStorage.getItem('medalliumViewMode') as ViewMode | null;
        if (storedViewMode && (storedViewMode === 'grid' || storedViewMode === 'list')) {
          setViewMode(storedViewMode);
        }

        const storedUnlockDates = localStorage.getItem('medalliumUnlockDates');
        if (storedUnlockDates) {
          setUnlockDates(JSON.parse(storedUnlockDates));
        }
      } catch (error) {
        console.error('Error cargando preferencias del usuario:', error);
      }
    };

    loadUserPreferences();
  }, []);

  // Cargar datos del medallium al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Cargar todos los Yo-kai de la base de datos para obtener el total
        const allYokaiData = await getAllYokai();
        setAllYokai(allYokaiData);

        // Cargar los Yo-kai desbloqueados del medallium
        const medallium = loadMedallium();

        // FILTRADO IMPORTANTE:
        // Usamos solo los IDs para filtrar la lista fresca de la base de datos
        const unlockedIds = Object.keys(medallium.unlockedYokai).map(Number);
        const unlocked = allYokaiData.filter(y => unlockedIds.includes(y.id));

        // Verificar logros nuevos
        const newAchievements = checkAchievements(medallium, allYokaiData);
        if (newAchievements.length > 0) {
          console.log('Nuevos logros desbloqueados:', newAchievements);
        }

        // Calcular estadísticas avanzadas
        const advancedStatsData = calculateAdvancedStats(medallium, allYokaiData);
        setAdvancedStats(advancedStatsData);

        // Guardar fechas de desbloqueo si no existen ya
        const dates: UnlockDates = { ...unlockDates };
        unlocked.forEach(yokai => {
          const yokaiIdStr = yokai.id.toString();
          if (!dates[yokaiIdStr] && medallium.unlockedYokai[yokai.id]) {
            dates[yokaiIdStr] = new Date().toLocaleDateString();
          }
        });
        setUnlockDates(dates);
        localStorage.setItem('medalliumUnlockDates', JSON.stringify(dates));

        // Extraer todas las tribus y juegos disponibles para los filtros
        const uniqueTribes = Array.from(new Set(allYokaiData.map(y => y.tribe))) as Tribe[];
        const uniqueGames = Array.from(new Set(allYokaiData.map(y => y.game))) as Game[];

        setTotalYokai(allYokaiData.length);
        setUnlockedYokai(unlocked);
        setFilteredYokai(sortByMedalNumber(unlocked));
        setTribes(uniqueTribes);
        setGames(uniqueGames);

        // Calcular estadísticas
        setStats(calculateMedalliumStats(medallium, allYokaiData.length));
      } catch (error) {
        console.error('Error cargando datos del medallium:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Solo ejecutar al montar el componente

  // Aplicar filtros y ordenación cuando cambien los criterios
  useEffect(() => {
    // Primero aplicar los filtros
    let filtered = unlockedYokai;

    // Filtrar por favoritos si está activado
    if (showFavoritesOnly) {
      filtered = filtered.filter(yokai => favorites.includes(yokai.id));
    }

    // Aplicar filtros de categoría
    if (tribeFilter) {
      filtered = filterByTribe(filtered, tribeFilter);
    }

    if (gameFilter) {
      filtered = filterByGame(filtered, gameFilter);
    }

    if (rankFilter) {
      filtered = filtered.filter(yokai => yokai.rank === rankFilter);
    }

    if (elementFilter) {
      filtered = filtered.filter(yokai => yokai.element === elementFilter);
    }

    // Aplicar búsqueda por texto (usando nombres traducidos)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(yokai =>
        getYokaiName(yokai).toLowerCase().includes(query) ||
        getTribeTranslation(yokai.tribe).toLowerCase().includes(query) ||
        getElementTranslation(yokai.element).toLowerCase().includes(query) ||
        yokai.rank.toLowerCase().includes(query) ||
        getFoodTranslation(yokai.favoriteFood).toLowerCase().includes(query) ||
        (yokai.game && yokai.game.toLowerCase().includes(query))
      );
    }

    // Aplicar ordenación
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
  }, [
    unlockedYokai,
    sortBy,
    tribeFilter,
    gameFilter,
    rankFilter,
    elementFilter,
    searchQuery,
    showFavoritesOnly,
    favorites
  ]);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('medalliumFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Guardar preferencia de vista en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('medalliumViewMode', viewMode);
  }, [viewMode]);

  // Manejar la selección de un Yo-kai
  const handleYokaiClick = (yokai: Yokai) => {
    setSelectedYokai(yokai);
  };

  // Cerrar el detalle de un Yo-kai
  const closeDetail = () => {
    setSelectedYokai(null);
  };

  // Alternar favorito
  const toggleFavorite = (yokaiId: number) => {
    setFavorites((prev: number[]) => {
      if (prev.includes(yokaiId)) {
        return prev.filter((id: number) => id !== yokaiId);
      } else {
        return [...prev, yokaiId];
      }
    });
  };

  // Cambiar modo de vista
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setTribeFilter(null);
    setGameFilter(null);
    setRankFilter(null);
    setElementFilter(null);
    setSearchQuery('');
    setShowFavoritesOnly(false);
    setSortBy('number');
  };

  // Comprobar si hay algún filtro activo
  const hasActiveFilters = () => {
    return tribeFilter !== null ||
      gameFilter !== null ||
      rankFilter !== null ||
      elementFilter !== null ||
      searchQuery.trim() !== '' ||
      showFavoritesOnly ||
      sortBy !== 'number';
  };

  // Función para obtener la fecha de desbloqueo formateada
  const getUnlockDate = (yokaiNumber: number): string | undefined => {
    const unlockDateObj = unlockDates ? unlockDates[yokaiNumber.toString()] : undefined;
    if (!unlockDateObj) return undefined;

    return new Date(unlockDateObj).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div
      className="medallium-container pb-20 px-4 md:px-6 max-w-7xl mx-auto min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%)'
      }}
    >
      {/* Cabecera con título y botón de volver mejorado */}
      <header className="mb-8">
        <div className="relative flex items-center justify-center py-4">
          <Link
            href="/"
            className="absolute left-0 flex items-center justify-center h-11 w-11 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all shadow-lg hover:shadow-xl"
            aria-label={t.backToGame}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>

          <div className="text-center">
            <div className="relative inline-block">
              <h1 className="text-5xl font-black text-white relative z-10 drop-shadow-lg">
                {t.medallium}
              </h1>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-white/40 rounded-full blur-sm"></div>
            </div>
            <p className="mt-3 text-sm font-semibold text-white/90">
              <span className="inline-flex items-center bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t.unlockedYokaiCollection}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* Estadísticas del Medallium mejorado */}
      <div className="mb-8 p-6 bg-amber-50/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative border-2 border-amber-300/50">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%238B4513\' fill-opacity=\'1\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM27.03 0L15.272 11.757l1.414 1.414L30 0h-2.97zm5.657 0L19.03 13.657 20.444 15.07 35.657 0h-2.97zm5.657 0L23.687 14.657 25.1 16.07 41.314 0h-2.97zm5.657 0L29.344 14.657 30.758 16.07 46.97 0h-2.97zM49.8 0L34.03 15.778 35.444 17.192 51.656 1H49.8zM0 0v24.314L24.314 0H0zm60 0v24.314L35.686 0H60z\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }}></div>
        </div>

        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">{t.collectionProgress}</h2>
            <div className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full h-10 min-w-[3.5rem] flex items-center justify-center px-4 shadow-lg">
              {stats.percentage}%
            </div>
          </div>

          <div className="flex items-end mb-4">
            <div className="text-4xl font-black bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mr-2">{stats.totalUnlocked}</div>
            <div className="text-2xl mb-1 font-semibold text-amber-800/70">/ {stats.totalYokai}</div>
          </div>

          <div className="relative w-full bg-amber-200 rounded-full h-5 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2 shadow-lg"
              style={{ width: `${stats.percentage}%` }}
            >
              {stats.percentage > 15 && (
                <span className="text-xs font-bold text-white drop-shadow">{stats.totalUnlocked}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y herramientas */}
      <div className="mb-6 sticky top-0 z-30 bg-white/95 backdrop-blur-md py-4 px-3 rounded-2xl border border-white/30 shadow-xl">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Barra de búsqueda */}
          <div className="flex-grow min-w-[200px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Botones de acciones */}
          <div className="flex gap-1 sm:gap-2">
            {/* Botón de vista (grid/lista) */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={toggleViewMode}
              title={viewMode === 'grid' ? t.switchToListView : t.switchToGridView}
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>

            {/* Botón de favoritos */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${showFavoritesOnly ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              title={showFavoritesOnly ? t.showAll : t.showFavoritesOnly}
            >
              <Heart size={18} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            </button>

            {/* Botón de filtros */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setShowFilters(!showFilters)}
              title={t.advancedFilters}
            >
              <Filter size={18} />
            </button>

            {/* Botón de logros */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${showAchievements ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setShowAchievements(!showAchievements)}
              title={t.viewAchievements}
            >
              <span className="text-lg">🏆</span>
            </button>

            {/* Botón de estadísticas avanzadas */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${showAdvancedStats ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
              title={t.advancedStatistics}
            >
              <span className="text-lg">📊</span>
            </button>

            {/* Botón de círculos */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${showCircles ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setShowCircles(!showCircles)}
              title={t.viewCircles}
            >
              <span className="text-lg">⭕</span>
            </button>

            {/* Menú desplegable de ordenación */}
            <div className="relative">
              <button
                className="flex items-center justify-center gap-1 p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                title={t.sortBy}
              >
                {sortBy === 'number' ? <Hash size={18} /> : <ArrowDownAZ size={18} />}
                <ChevronDown size={14} />
              </button>

              {/* Menú desplegable de ordenación */}
              {isSortMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className={`${sortBy === 'number' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100`}
                      onClick={() => { setSortBy('number'); setIsSortMenuOpen(false); }}
                    >
                      <Hash size={16} className="mr-2" />
                      {t.number}
                    </button>
                    <button
                      className={`${sortBy === 'name' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100`}
                      onClick={() => { setSortBy('name'); setIsSortMenuOpen(false); }}
                    >
                      <ArrowDownAZ size={16} className="mr-2" />
                      {t.name}
                    </button>
                    <button
                      className={`${sortBy === 'tribe' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'} flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100`}
                      onClick={() => { setSortBy('tribe'); setIsSortMenuOpen(false); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t.tribe}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón para limpiar filtros, visible solo si hay filtros activos */}
            {hasActiveFilters() && (
              <button
                className="flex items-center justify-center p-2 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                onClick={clearAllFilters}
                title={t.clearFilters}
              >
                <RefreshCw size={18} />
              </button>
            )}


          </div>
        </div>

        {/* Panel de filtros avanzados (desplegable) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-3"
            >
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 shadow-sm border-2 border-amber-300/50">
                <h3 className="text-base font-semibold text-amber-800 mb-3 flex items-center">
                  <SlidersHorizontal size={18} className="mr-2" />
                  {t.advancedFilters}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Filtrar por tribu */}
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">{t.tribe}</label>
                    <div className="relative">
                      <select
                        className="w-full pl-10 py-2 rounded-lg border-amber-300 bg-white shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 transition-colors appearance-none"
                        value={tribeFilter || ''}
                        onChange={(e) => setTribeFilter(e.target.value || null)}
                      >
                        <option value="">{t.allTribes}</option>
                        {tribes.map((tribe) => (
                          <option key={tribe} value={tribe}>
                            {getTribeTranslation(tribe)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 pointer-events-none">
                        {tribeFilter && tribeIcons[tribeFilter as Tribe] ? (
                          <img src={tribeIcons[tribeFilter as Tribe]} alt="" className="w-6 h-6" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filtrar por elemento */}
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">{t.element}</label>
                    <div className="relative">
                      <select
                        className="w-full pl-10 py-2 rounded-lg border-amber-300 bg-white shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 transition-colors appearance-none"
                        value={elementFilter || ''}
                        onChange={(e) => setElementFilter(e.target.value || null)}
                      >
                        <option value="">{t.allElements}</option>
                        {Object.keys(elementIcons).map((element) => (
                          <option key={element} value={element}>
                            {getElementTranslation(element as any)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 pointer-events-none">
                        {elementFilter && elementIcons[elementFilter as Element] ? (
                          <img src={elementIcons[elementFilter as Element]} alt="" className="w-6 h-6" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filtrar por rango */}
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">{t.rank}</label>
                    <div className="relative">
                      <select
                        className="w-full pl-10 py-2 rounded-lg border-amber-300 bg-white shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 transition-colors appearance-none"
                        value={rankFilter || ''}
                        onChange={(e) => setRankFilter(e.target.value || null)}
                      >
                        <option value="">{t.allRanks}</option>
                        {Object.keys(rankIcons)
                          .filter(rank => rank !== 'SS' && rank !== 'SSS') // Excluir SS y SSS
                          .map((rank) => (
                            <option key={rank} value={rank}>
                              {rank.toUpperCase()}
                            </option>
                          ))}
                      </select>
                      <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 pointer-events-none">
                        {rankFilter && rankIcons[rankFilter as Rank] ? (
                          <img src={rankIcons[rankFilter as Rank]} alt="" className="w-6 h-6" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filtrar por juego */}
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-1">{t.game}</label>
                    <div className="relative">
                      <select
                        className="w-full pl-10 py-2 rounded-lg border-amber-300 bg-white shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 transition-colors appearance-none"
                        value={gameFilter || ''}
                        onChange={(e) => setGameFilter(e.target.value || null)}
                      >
                        <option value="">{t.allGames}</option>
                        {games.map((game) => (
                          <option key={game} value={game}>
                            {game.replace('Yo-kai Watch ', 'YW ')}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-0 top-0 h-full flex items-center justify-center w-10 pointer-events-none">
                        {gameFilter && gameLogos[gameFilter as Game] ? (
                          <img src={gameLogos[gameFilter as Game]} alt="" className="w-6 h-6" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cuadrícula o lista de Yo-kai */}
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

          {/* Modo cuadrícula */}
          {viewMode === 'grid' && (
            <div
              className="grid gap-2 sm:gap-4 md:gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))'
              }}
            >
              {filteredYokai.map((yokai) => (
                <div key={yokai.id} className="aspect-[3/4]">
                  <MedalliumCard
                    yokai={yokai}
                    view={viewMode}
                    onClick={handleYokaiClick}
                    isFavorite={favorites?.includes(yokai.id)}
                    onToggleFavorite={toggleFavorite}
                    unlockedDate={getUnlockDate(yokai.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Modo lista */}
          {viewMode === 'list' && (
            <div className="flex flex-col space-y-2">
              {filteredYokai.map((yokai) => (
                <MedalliumCard
                  key={yokai.id}
                  yokai={yokai}
                  view={viewMode}
                  onClick={handleYokaiClick}
                  isFavorite={favorites?.includes(yokai.id)}
                  onToggleFavorite={toggleFavorite}
                  unlockedDate={getUnlockDate(yokai.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mx-4 shadow-inner border border-blue-100">
          <div className="mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-blue-700 mb-2">{t.emptyMedallium}</h3>
          <p className="text-gray-600 mb-4">
            {t.noUnlockedYokai}
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t.backToPlay}
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
                alt={getYokaiName(selectedYokai)}
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
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{getYokaiName(selectedYokai)}</h2>
                  <div className="flex items-center">
                    <img src={tribeIcons[selectedYokai.tribe]} alt={selectedYokai.tribe} className="w-6 h-6 mr-2" />
                    <span className="text-gray-600 font-medium">{getTribeTranslation(selectedYokai.tribe)}</span>
                  </div>
                </div>
              </div>

              {/* Características del Yo-kai */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Rango */}
                <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <div className="text-xs text-blue-600 mb-2">{t.rank}</div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img
                      src={rankIcons[selectedYokai.rank]}
                      alt={`${t.rank} ${selectedYokai.rank}`}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Elemento */}
                <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <div className="text-xs text-blue-600 mb-2">{t.element}</div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img
                      src={elementIcons[selectedYokai.element]}
                      alt={getElementTranslation(selectedYokai.element)}
                      className="w-full h-full object-contain drop-shadow-md"
                      onError={(e) => {
                        // Fallback a un icono genérico
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const div = document.createElement('div');
                          div.className = 'w-8 h-8 flex items-center justify-center bg-blue-700 text-white rounded-full shadow-md';
                          const span = document.createElement('span');
                          span.className = 'text-xs font-bold';
                          span.textContent = selectedYokai.element.charAt(0);
                          div.appendChild(span);
                          parent.appendChild(div);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Comida favorita */}
                <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <div className="text-xs text-blue-600 mb-2">{t.food}</div>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img
                      src={foodIcons[selectedYokai.favoriteFood]}
                      alt={getFoodTranslation(selectedYokai.favoriteFood)}
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
                          span.textContent = getFoodTranslation(selectedYokai.favoriteFood);
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
                    <div className="text-xs text-blue-600">{t.game}</div>
                    <div className="font-medium text-blue-900">{selectedYokai.game}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Logros */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">🏆 {t.achievements}</h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <AchievementsPanel />
            </div>
          </div>
        </div>
      )}

      {/* Panel de Estadísticas Avanzadas */}
      {showAdvancedStats && advancedStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">📊 {t.advancedStatistics}</h2>
              <button
                onClick={() => setShowAdvancedStats(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <AdvancedStatsPanel stats={advancedStats} />
            </div>
          </div>
        </div>
      )}

      {/* Panel de Círculos */}
      {showCircles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{t.circles}</h2>
              <button
                onClick={() => setShowCircles(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <CirclesPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
