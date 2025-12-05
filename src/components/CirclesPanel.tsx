'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YokaiCircle, CircleProgress, CircleCategory, CircleDifficulty } from '@/types/circles';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getAllCircles,
  loadCirclesData,
  updateCirclesProgress,
  getCircleStats,
  getCirclesByCategory,
  getCirclesByDifficulty
} from '@/utils/circlesManager';
import { getCurrentPoints } from '@/utils/economyManager';
import { loadMedallium } from '@/utils/medalliumManager';
import CircleCard from './CircleCard';
import { Trophy, Target } from 'lucide-react';

type FilterType = 'all' | 'completed' | 'incomplete';

const CirclesPanel: React.FC = () => {
  const { t } = useLanguage();
  const [circles, setCircles] = useState<YokaiCircle[]>([]);
  const [circlesProgress, setCirclesProgress] = useState<Record<string, CircleProgress>>({});
  const [filteredCircles, setFilteredCircles] = useState<YokaiCircle[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState<number>(0);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar círculos y progreso
        const allCircles = getAllCircles();
        const medallium = loadMedallium();
        
        // Actualizar progreso de círculos
        updateCirclesProgress(medallium);
        
        // Cargar datos actualizados
        const circlesData = loadCirclesData();
        const circleStats = getCircleStats();
        
        setCircles(allCircles);
        setCirclesProgress(circlesData.circles);
        setStats(circleStats);
        setFilteredCircles(allCircles);
        setCurrentPoints(getCurrentPoints());
      } catch (error) {
        console.error('Error loading circles data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Escuchar eventos de recompensas reclamadas para refrescar
  useEffect(() => {
    const handleRewardClaimed = () => {
      // Recargar datos cuando se reclame una recompensa
      const loadData = async () => {
        try {
          const allCircles = getAllCircles();
          const medallium = loadMedallium();
          updateCirclesProgress(medallium);
          const circlesData = loadCirclesData();
          const circleStats = getCircleStats();

          setCircles(allCircles);
          setCirclesProgress(circlesData.circles);
          setStats(circleStats);
          setCurrentPoints(getCurrentPoints());
        } catch (error) {
          console.error('Error reloading circles data:', error);
        }
      };

      loadData();
    };

    window.addEventListener('circleRewardClaimed', handleRewardClaimed);
    return () => window.removeEventListener('circleRewardClaimed', handleRewardClaimed);
  }, []);

  // Aplicar filtros (EXACTAMENTE como los logros)
  useEffect(() => {
    let filtered = [...circles];

    // Separar círculos como los logros
    const completedCircles = circles.filter(circle => {
      const progress = circlesProgress[circle.id];
      return progress?.isCompleted && progress?.rewardClaimed;
    });

    const uncompletedCircles = circles.filter(circle => {
      const progress = circlesProgress[circle.id];
      return !progress?.isCompleted || !progress?.rewardClaimed;
    });

    // Filtro por tipo
    switch (selectedFilter) {
      case 'completed':
        filtered = completedCircles;
        break;
      case 'incomplete':
        filtered = uncompletedCircles;
        break;
      default:
        filtered = [...uncompletedCircles, ...completedCircles];
        break;
    }

    // Ordenar: completados con recompensa reclamada primero, luego por progreso
    filtered.sort((a, b) => {
      const progressA = circlesProgress[a.id];
      const progressB = circlesProgress[b.id];

      // Completados con recompensa reclamada van primero
      const aCompleted = progressA?.isCompleted && progressA?.rewardClaimed;
      const bCompleted = progressB?.isCompleted && progressB?.rewardClaimed;

      if (aCompleted && !bCompleted) return -1;
      if (!aCompleted && bCompleted) return 1;

      return (progressB?.progress || 0) - (progressA?.progress || 0);
    });

    setFilteredCircles(filtered);
  }, [circles, circlesProgress, selectedFilter]);



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t.loading}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      {stats && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{t.circlesProgress}</h2>
              <p className="text-sm text-gray-600">Tu progreso en los círculos Yo-kai</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.completedCircles}</div>
              <div className="text-sm text-gray-600 font-medium">Completados</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalCircles}</div>
              <div className="text-sm text-gray-600 font-medium">Total</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.completionPercentage}%</div>
              <div className="text-sm text-gray-600 font-medium">Progreso</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-1">{stats.totalCircles - stats.completedCircles}</div>
              <div className="text-sm text-gray-600 font-medium">Restantes</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-1 mb-1">
                <img
                  src="/icons/points-icon.png"
                  alt="Puntos"
                  className="w-6 h-6"
                />
                <div className="text-3xl font-bold text-yellow-600">{currentPoints}</div>
              </div>
              <div className="text-sm text-gray-600 font-medium">{t.points}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros simplificados */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedFilter === 'all'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todos los círculos
        </button>
        <button
          onClick={() => setSelectedFilter('incomplete')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedFilter === 'incomplete'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          En progreso
        </button>
        <button
          onClick={() => setSelectedFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedFilter === 'completed'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Completados
        </button>
      </div>

      {/* Lista de círculos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCircles.map((circle, index) => (
            <motion.div
              key={circle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CircleCard
                circle={circle}
                progress={circlesProgress[circle.id] || {
                  circleId: circle.id,
                  unlockedYokai: [],
                  isCompleted: false,
                  progress: 0
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mensaje si no hay círculos */}
      {filteredCircles.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se encontraron círculos con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
};

export default CirclesPanel;
