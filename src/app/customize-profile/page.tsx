'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useProfileCustomization } from '@/hooks/useProfileCustomization';
import { getBadgeName } from '@/utils/badgesManager';
import { getTitleName } from '@/hooks/useProfileCustomization';
import { getFrameName } from '@/utils/framesManager';
import { ArrowLeft, Save, Star, Crown, Frame, Check, Award, X, Image } from 'lucide-react';
import { tribeIcons, rankIcons, type Tribe, type Rank } from '@/types/yokai';
import AvatarWithFrame from '@/components/AvatarWithFrame';
import ProfileBanner from '@/components/ProfileBanner';
import { getBackgroundName } from '@/utils/backgroundsManager';

type TabType = 'yokai' | 'title' | 'badges' | 'frame' | 'banner';

export default function CustomizeProfilePage() {
  const router = useRouter();
  const { t, language, getYokaiName } = useLanguage();
  const { user } = useSocialAuth();
  const {
    customization,
    unlockedYokai,
    availableTitles,

    availableBadges,
    availableFrames,
    availableBackgrounds,
    loading,
    hasUnsavedChanges,
    updateCustomization,
    saveCustomization,
    getFavoriteYokaiDetails,
    getCurrentTitleDetails,
    getCurrentFrameDetails,
    getCurrentBannerDetails
  } = useProfileCustomization(user?.id);

  const [activeTab, setActiveTab] = useState<TabType>('yokai');
  const [saving, setSaving] = useState(false);

  // Redirigir si no está autenticado
  if (!user) {
    router.push('/');
    return null;
  }

  const handleBackToProfile = () => {
    const username = user.user_metadata?.username;
    if (!username) {
      // Si no hay username, ir al home
      router.push('/');
      return;
    }

    if (hasUnsavedChanges) {
      if (confirm(t.changesUnsaved + '. ¿Continuar sin guardar?')) {
        router.push(`/profile?u=${username}`);
      }
    } else {
      router.push(`/profile?u=${username}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveCustomization(customization);
      if (success) {
        // Mostrar mensaje de éxito (podrías usar un toast aquí)
        alert(t.changesSaved);
      } else {
        alert('Error guardando cambios');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      alert('Error guardando cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="app-container text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">{t.loadingProfile}</p>
        </div>
      </div>
    );
  }

  const favoriteYokai = getFavoriteYokaiDetails();
  const currentTitle = getCurrentTitleDetails();
  const currentFrame = getCurrentFrameDetails();
  const currentBanner = getCurrentBannerDetails();

  return (
    <div className="app-container min-h-screen">
      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBackToProfile}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          {t.goBack}
        </button>

        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save size={16} />
            )}
            {t.saveChanges}
          </button>
        )}
      </div>

      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <img
            src="/icons/social/personalization.png"
            alt="Personalization"
            className="w-8 h-8"
          />
          {t.profileCustomization}
        </h1>
        <p className="text-white/60">{t.customizeProfile}</p>
      </div>

      {/* Vista previa del perfil */}
      <div className="mb-8 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-6 border border-blue-500/30">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Frame size={20} />
          {t.previewProfile}
        </h2>

        {/* Banner del perfil */}
        <ProfileBanner
          backgroundId={currentBanner?.id}
          height="sm"
          className="mb-4"
        />

        <div className="flex items-center gap-4 p-4 bg-blue-800/30 rounded-lg">
          {/* Avatar con marco */}
          <AvatarWithFrame
            avatarUrl={user.user_metadata?.avatar_url || undefined}
            frameId={currentFrame?.id}
            size="md"
            alt={user.user_metadata?.username || 'User'}
          />

          {/* Info del usuario */}
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">
              {user.user_metadata?.username || 'Usuario'}
            </h3>
            {currentTitle && (
              <p className="text-purple-300 text-sm flex items-center gap-1">
                <Crown size={14} />
                {getTitleName(currentTitle, language)}
              </p>
            )}
            {favoriteYokai && (
              <p className="text-blue-300 text-sm flex items-center gap-1">
                <Star size={14} />
                {getYokaiName({ name: favoriteYokai.name } as any)}
              </p>
            )}
          </div>


        </div>
      </div>

      {/* Tabs de personalización */}
      <div className="flex justify-center mb-8">
        <div className="bg-blue-900/50 rounded-lg p-1 border border-blue-500/30 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('yokai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'yokai'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Star size={16} />
            {t.favoriteYokai}
          </button>
          <button
            onClick={() => setActiveTab('title')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'title'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Crown size={16} />
            {t.profileTitle}
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'badges'
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Award size={16} />
            {t.badges}
          </button>
          <button
            onClick={() => setActiveTab('frame')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'frame'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Frame size={16} />
            {t.avatarFrame}
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'banner'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-blue-800/50'
              }`}
          >
            <Image size={16} />
            Banner
          </button>
        </div>
      </div>

      {/* Contenido de personalización */}
      <div className="bg-blue-900/30 rounded-lg border border-blue-500/30 min-h-[400px] p-6">

        {/* Tab: Yo-kai Favorito */}
        {activeTab === 'yokai' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t.selectFavoriteYokai}</h2>

            {unlockedYokai.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Star size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-2">{t.noYokaiUnlocked}</p>
                <p className="text-sm">{t.unlockMoreYokai}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Opción "Sin favorito" */}
                <button
                  onClick={() => updateCustomization({ favoriteYokai: null })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${!customization.favoriteYokai
                      ? 'border-blue-400 bg-blue-600/30'
                      : 'border-blue-500/30 bg-blue-800/20 hover:border-blue-400/50'
                    }`}
                >
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-gray-600/50 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <p className="text-white text-xs text-center">Sin favorito</p>
                  {!customization.favoriteYokai && (
                    <Check size={16} className="text-green-400 mx-auto mt-1" />
                  )}
                </button>

                {/* Yo-kais desbloqueados */}
                {unlockedYokai.map((yokai) => (
                  <button
                    key={yokai.id}
                    onClick={() => updateCustomization({ favoriteYokai: yokai.id })}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${customization.favoriteYokai === yokai.id
                        ? 'border-purple-400 bg-purple-600/30'
                        : 'border-blue-500/30 bg-blue-800/20 hover:border-blue-400/50'
                      }`}
                  >
                    <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-blue-600/50 border border-blue-400/30">
                      <img
                        src={yokai.image}
                        alt={getYokaiName({ name: yokai.name } as any)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white text-xs text-center truncate font-medium mb-1">{getYokaiName({ name: yokai.name } as any)}</p>

                    {/* Tribu y Rango con iconos */}
                    <div className="flex items-center justify-center gap-2 text-xs">
                      {/* Icono de tribu */}
                      <img
                        src={tribeIcons[yokai.tribe as Tribe]}
                        alt={yokai.tribe}
                        className="w-3 h-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-3 h-3 rounded-full bg-white/20';
                          e.currentTarget.parentElement!.appendChild(fallback);
                        }}
                      />

                      {/* Icono de rango */}
                      <img
                        src={rankIcons[yokai.rank as Rank]}
                        alt={yokai.rank}
                        className="w-3 h-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = 'w-3 h-3 text-white/60 text-xs font-bold flex items-center justify-center';
                          fallback.textContent = yokai.rank;
                          e.currentTarget.parentElement!.appendChild(fallback);
                        }}
                      />
                    </div>

                    {customization.favoriteYokai === yokai.id && (
                      <Check size={16} className="text-green-400 mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Título */}
        {activeTab === 'title' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t.selectTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opción "Sin título" */}
              <button
                onClick={() => updateCustomization({ profileTitle: null })}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${!customization.profileTitle
                    ? 'border-purple-400 bg-purple-600/30'
                    : 'border-purple-500/30 bg-purple-800/20 hover:border-purple-400/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <X size={16} className="text-gray-400" />
                      {language === 'es' ? 'Sin título' : language === 'en' ? 'No title' : 'Nessun titolo'}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {language === 'es' ? 'No mostrar título en el perfil' :
                        language === 'en' ? 'Don\'t show title on profile' :
                          'Non mostrare titolo nel profilo'}
                    </p>
                  </div>
                  {!customization.profileTitle && (
                    <Check size={20} className="text-green-400" />
                  )}
                </div>
              </button>

              {/* Títulos disponibles */}
              {availableTitles.map((title) => (
                <button
                  key={title.id}
                  onClick={() => updateCustomization({ profileTitle: title.id })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${customization.profileTitle === title.id
                      ? 'border-purple-400 bg-purple-600/30'
                      : 'border-purple-500/30 bg-purple-800/20 hover:border-purple-400/50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Crown size={16} className="text-yellow-400" />
                        {getTitleName(title, language)}
                      </h3>
                    </div>
                    {customization.profileTitle === title.id && (
                      <Check size={20} className="text-green-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Insignias */}
        {activeTab === 'badges' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t.selectBadges}</h2>
            <p className="text-white/70 text-sm mb-6">Selecciona hasta 3 insignias para mostrar en tu perfil</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableBadges.map((badge) => {
                const isSelected = customization.selectedBadges.includes(badge.id);
                const canSelect = customization.selectedBadges.length <= 3 || isSelected;

                return (
                  <button
                    key={badge.id}
                    onClick={() => {
                      if (isSelected) {
                        // Quitar insignia
                        updateCustomization({
                          selectedBadges: customization.selectedBadges.filter(id => id !== badge.id)
                        });
                      } else if (canSelect) {
                        // Añadir insignia
                        updateCustomization({
                          selectedBadges: [...customization.selectedBadges, badge.id]
                        });
                      }
                    }}
                    disabled={!canSelect}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                        ? 'border-green-400 bg-green-600/30'
                        : canSelect
                          ? 'border-green-500/30 bg-green-800/20 hover:border-green-400/50'
                          : 'border-gray-500/30 bg-gray-800/20 opacity-50 cursor-not-allowed'
                      }`}
                    title={getBadgeName(badge, language)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-blue-600/50 flex items-center justify-center relative">
                        <img
                          src={badge.image}
                          alt={getBadgeName(badge, language)}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback a icono si la imagen no carga
                            e.currentTarget.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = 'w-8 h-8 flex items-center justify-center text-yellow-400';
                            fallback.innerHTML = '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                            e.currentTarget.parentElement!.appendChild(fallback);
                          }}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-white font-medium text-xs">{getBadgeName(badge, language)}</h3>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {customization.selectedBadges.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/60">{t.noBadgesSelected}</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Marco */}
        {activeTab === 'frame' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t.selectFrame}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableFrames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => updateCustomization({ avatarFrame: frame.id })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${customization.avatarFrame === frame.id
                      ? 'border-yellow-400 bg-yellow-600/30'
                      : 'border-yellow-500/30 bg-yellow-800/20 hover:border-yellow-400/50'
                    }`}
                >
                  <div className="mx-auto mb-2">
                    <AvatarWithFrame
                      frameId={frame.id}
                      size="md"
                      alt="Frame preview"
                    />
                  </div>
                  <p className="text-white text-xs text-center">{getFrameName(frame, language as 'es' | 'en' | 'it')}</p>
                  {customization.avatarFrame === frame.id && (
                    <Check size={16} className="text-green-400 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Banner */}
        {activeTab === 'banner' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Seleccionar Banner</h2>
            <p className="text-white/70 mb-6">Elige uno de tus fondos desbloqueados como banner de perfil</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableBackgrounds.map((background) => (
                <button
                  key={background.id}
                  onClick={() => updateCustomization({ profileBanner: background.id })}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${customization.profileBanner === background.id
                      ? 'border-cyan-400 bg-cyan-600/30'
                      : 'border-cyan-500/30 bg-cyan-800/20 hover:border-cyan-400/50'
                    }`}
                >
                  {/* Preview del fondo */}
                  <div
                    className="w-full h-20 rounded-lg mb-2 overflow-hidden"
                    style={{
                      backgroundImage: background.style.backgroundImage,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                  <p className="text-white text-xs text-center">{getBackgroundName(background, language)}</p>
                  {customization.profileBanner === background.id && (
                    <Check size={16} className="text-green-400 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botón de guardar fijo */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Save size={20} />
            )}
            {t.saveChanges}
          </button>
        </div>
      )}
    </div>
  );
}
