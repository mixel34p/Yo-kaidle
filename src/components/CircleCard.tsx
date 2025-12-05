'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { YokaiCircle, CircleProgress } from '@/types/circles';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCircleName, getCircleDescription, claimCircleReward, hasClaimableCircleReward, isCircleRewardClaimed } from '@/utils/circlesManager';
import { CheckCircle, Circle } from 'lucide-react';
import { getAllYokai } from '@/lib/supabase';
import { Yokai } from '@/types/yokai';
import YokaiSilhouette from './YokaiSilhouette';
import { AVAILABLE_BACKGROUNDS, getBackgroundName } from '@/utils/backgroundsManager';
import { AVAILABLE_TRACKS, getTrackName } from '@/utils/jukeboxManager';
import { AVAILABLE_BADGES, getBadgeName } from '@/utils/badgesManager';
import { AVAILABLE_FRAMES, getFrameName } from '@/utils/framesManager';
import { AVAILABLE_TITLES, getTitleName } from '@/utils/titlesManager';

interface CircleCardProps {
  circle: YokaiCircle;
  progress: CircleProgress;
  onClick?: () => void;
}

// Función para obtener nombre de título traducido usando el manager
const getTitleNameLocal = (titleId: string, language: 'es' | 'en' | 'it'): string => {
  const title = AVAILABLE_TITLES.find(t => t.id === titleId);
  return title ? getTitleName(title, language) : titleId;
};

// Función para obtener nombre de marco usando el manager
const getFrameNameLocal = (frameId: string, language: 'es' | 'en' | 'it'): string => {
  const frame = AVAILABLE_FRAMES.find(f => f.id === frameId);
  return frame ? getFrameName(frame, language) : frameId;
};

const CircleCard: React.FC<CircleCardProps> = ({ circle, progress, onClick }) => {
  const { t, language } = useLanguage();
  const [yokaiData, setYokaiData] = useState<Yokai[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Cargar datos de Yo-kai
  useEffect(() => {
    const loadYokaiData = async () => {
      try {
        const allYokai = await getAllYokai();
        const circleYokai = allYokai.filter(yokai =>
          circle.yokaiNames.includes(yokai.name)
        );
        setYokaiData(circleYokai);
      } catch (error) {
        console.error('Error loading Yo-kai data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadYokaiData();
  }, [circle.yokaiNames]);

  // Sincronizar estado local con el estado real
  useEffect(() => {
    setRewardClaimed(isCircleRewardClaimed(circle.id));
  }, [circle.id, refreshKey]);

  // Obtener textos traducidos
  const circleName = getCircleName(circle, language);
  const circleDescription = getCircleDescription(circle, language);

  // Función para reclamar recompensa (EXACTAMENTE igual que los logros)
  const handleClaimReward = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el onClick del card

    // Prevenir doble clic
    if (rewardClaimed) return;

    const success = claimCircleReward(circle.id);
    if (success) {
      setRewardClaimed(true); // Actualizar estado local INMEDIATAMENTE
      setRefreshKey(prev => prev + 1); // Forzar re-render
      // Disparar evento para que el panel padre se actualice
      window.dispatchEvent(new CustomEvent('circleRewardClaimed'));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`relative bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        progress.isCompleted
          ? 'border-green-400 shadow-green-100'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header con título y estado */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">
            {circleName}
          </h3>
          <div className="flex items-center gap-1">
            {progress.isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          {circleDescription}
        </p>

        {/* Barra de progreso */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {progress.unlockedYokai.length}/{circle.yokaiNames.length} {t.circles}
            </span>
            <span className={`text-sm font-medium ${
              progress.isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}>
              {progress.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full transition-all duration-500 ${
                progress.isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Sección de recompensa - EXACTAMENTE como los logros */}
        {(circle.reward?.points || circle.reward?.background || circle.reward?.track || circle.reward?.frame || circle.reward?.title || circle.reward?.badge) && (
          <div className="mt-3">
            {progress.isCompleted && !rewardClaimed ? (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 px-2 py-1 rounded-lg text-center">
                      <div className="text-xs text-yellow-700 mb-1">{t.reward}</div>
                      {circle.reward.points && (
                        <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                          <img
                            src="/icons/points-icon.png"
                            alt="Puntos"
                            className="w-4 h-4"
                          />
                          {circle.reward.points}
                        </div>
                      )}
                      {circle.reward.background && (
                        <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                          <span className="text-sm">🖼️</span>
                          <span className="text-xs">
                            {(() => {
                              const bg = AVAILABLE_BACKGROUNDS.find(b => b.id === circle.reward?.background);
                              return bg ? getBackgroundName(bg, language) : 'Fondo';
                            })()}
                          </span>
                        </div>
                      )}
                      {circle.reward.track && (
                        <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                          <span className="text-sm">🎵</span>
                          <span className="text-xs">
                            {(() => {
                              const track = AVAILABLE_TRACKS.find(t => t.id === circle.reward?.track);
                              return track ? getTrackName(track, language) : 'Canción';
                            })()}
                          </span>
                        </div>
                      )}
                      {circle.reward.frame && (
                        <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                          <span className="text-sm">🔳</span>
                          <span className="text-xs">{getFrameNameLocal(circle.reward.frame, language)}</span>
                        </div>
                      )}
                      {circle.reward.title && (
                        <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                          <span className="text-sm">👑</span>
                          <span className="text-xs">{getTitleNameLocal(circle.reward.title, language)}</span>
                        </div>
                      )}
                      {circle.reward.badge && (
                        <div className="flex items-center justify-center gap-1 text-yellow-800 font-bold">
                          <span className="text-sm">🏆</span>
                          <span className="text-xs">
                            {(() => {
                              const badge = AVAILABLE_BADGES.find(b => b.id === circle.reward?.badge);
                              return badge ? getBadgeName(badge, language) : 'Insignia';
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-yellow-700 font-medium">¡Círculo completado!</span>
                  </div>
                  <button
                    onClick={handleClaimReward}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-full font-medium flex items-center gap-1 transition-colors"
                  >
                    {circle.reward.points ? (
                      <>
                        <img
                          src="/icons/points-icon.png"
                          alt="Puntos"
                          className="w-3 h-3"
                        />
                        {t.claimReward} {circle.reward.points}
                      </>
                    ) : circle.reward.background ? (
                      <>
                        <span className="text-xs">🖼️</span>
                        {t.claimReward}
                      </>
                    ) : circle.reward.track ? (
                      <>
                        <span className="text-xs">🎵</span>
                        {t.claimReward}
                      </>
                    ) : circle.reward.frame ? (
                      <>
                        <span className="text-xs">🔳</span>
                        {t.claimReward}
                      </>
                    ) : circle.reward.title ? (
                      <>
                        <span className="text-xs">👑</span>
                        {t.claimReward}
                      </>
                    ) : circle.reward.badge ? (
                      <>
                        <span className="text-xs">🏆</span>
                        {t.claimReward}
                      </>
                    ) : (
                      t.claimReward
                    )}
                  </button>
                </div>
              ) : rewardClaimed ? (
                <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg p-3">
                  <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                    {t.claimed}
                  </span>
                </div>
              ) : !progress.isCompleted ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <div className="bg-gray-100 px-2 py-1 rounded-lg inline-block">
                  <div className="text-xs text-gray-500 mb-1">{t.reward}</div>
                  {circle.reward.points && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                      <img
                        src="/icons/points-icon.png"
                        alt="Puntos"
                        className="w-4 h-4"
                      />
                      {circle.reward.points}
                    </div>
                  )}
                  {circle.reward.background && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                      <span className="text-sm">🖼️</span>
                      <span className="text-xs">
                        {(() => {
                          const bg = AVAILABLE_BACKGROUNDS.find(b => b.id === circle.reward?.background);
                          return bg ? getBackgroundName(bg, language) : 'Fondo';
                        })()}
                      </span>
                    </div>
                  )}
                  {circle.reward.track && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                      <span className="text-sm">🎵</span>
                      <span className="text-xs">
                        {(() => {
                          const track = AVAILABLE_TRACKS.find(t => t.id === circle.reward?.track);
                          return track ? getTrackName(track, language) : 'Canción';
                        })()}
                      </span>
                    </div>
                  )}
                  {circle.reward.frame && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                      <span className="text-sm">🔳</span>
                      <span className="text-xs">{getFrameNameLocal(circle.reward.frame, language)}</span>
                    </div>
                  )}
                  {circle.reward.title && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                      <span className="text-sm">👑</span>
                      <span className="text-xs">{getTitleNameLocal(circle.reward.title, language)}</span>
                    </div>
                  )}
                  {circle.reward.badge && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-bold">
                      <span className="text-sm">🏆</span>
                      <span className="text-xs">
                        {(() => {
                          const badge = AVAILABLE_BADGES.find(b => b.id === circle.reward?.badge);
                          return badge ? getBadgeName(badge, language) : 'Insignia';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Grid de Yo-kai */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {circle.yokaiNames.map((yokaiName, index) => {
            const yokai = yokaiData.find(y => y.name === yokaiName);
            const isUnlocked = progress.unlockedYokai.includes(yokaiName);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <YokaiSilhouette
                  yokai={yokai || null}
                  isUnlocked={isUnlocked}
                  size="small"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer con fecha de completado */}
      {progress.isCompleted && progress.completedAt && (
        <div className="px-4 pb-4 pt-2 border-t border-green-200 bg-green-50">
          <p className="text-xs text-green-600 font-medium text-center">
            ✅ {t.circleCompleted} {new Date(progress.completedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CircleCard;
