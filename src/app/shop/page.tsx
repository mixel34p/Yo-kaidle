'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useShop, usePromoCodes, formatRewards } from '@/hooks/useShop';
import {
  ShoppingBag,
  ArrowLeft,
  Star,
  Gift,
  Check,
  X,
  Loader2,
  Sparkles,
  Crown,
  Music,
  Image,
  Frame,
  Trophy,
  Zap,
  ShoppingCart
} from 'lucide-react';
import MusicPreview from '@/components/MusicPreview';
import BackgroundPreview from '@/components/BackgroundPreview';
import FramePreview from '@/components/FramePreview';
import { getFrameName, getFrameById } from '@/utils/framesManager';
import { getBackgroundName, getBackgroundById } from '@/utils/backgroundsManager';
import { getTrackName, getTrackById } from '@/utils/jukeboxManager';

type TabType = 'shop' | 'codes';

// Traducciones específicas de la tienda
const shopTexts = {
  es: {
    shop: 'Tienda',
    codes: 'Códigos',
    featuredItems: 'Artículos Destacados',
    allItems: 'Todos los Artículos',
    promoCodes: 'Códigos Promocionales',
    enterCode: 'Ingresa tu código:',
    redeemCode: 'Canjear Código',
    validCode: '¡Código válido!',
    rewards: 'Recompensas:',
    exampleCodes: 'Códigos de ejemplo para probar:',
    buy: 'Comprar',
    insufficientPoints: 'Puntos insuficientes',
    loginRequired: 'Inicia sesión',
    loginToBuy: 'Debes iniciar sesión para comprar',
    loginToRedeem: 'Debes iniciar sesión para canjear códigos',
    notAuthenticated: 'No has iniciado sesión',
    canViewOnly: 'Puedes ver la tienda, pero necesitas iniciar sesión para comprar artículos y canjear códigos.',
    goToLogin: 'Ir a Iniciar Sesión',
    backToGame: 'Volver al Juego',
    shopTitle: 'Tienda Yo-kaidle',
    loading: 'Cargando tienda...',
    validating: 'Validando código...',
    redeeming: 'Canjeando...'
  },
  en: {
    shop: 'Shop',
    codes: 'Codes',
    featuredItems: 'Featured Items',
    allItems: 'All Items',
    promoCodes: 'Promo Codes',
    enterCode: 'Enter your code:',
    redeemCode: 'Redeem Code',
    validCode: 'Valid code!',
    rewards: 'Rewards:',
    recentPurchases: 'Recent Purchases',
    redeemedCodes: 'Redeemed Codes',
    noPurchases: 'No purchases yet',
    noCodes: 'No codes redeemed yet',
    exampleCodes: 'Example codes to try:',
    buy: 'Buy',
    insufficientPoints: 'Insufficient points',
    loginRequired: 'Login',
    loginToBuy: 'You must login to purchase',
    loginToRedeem: 'You must login to redeem codes',
    notAuthenticated: 'Not logged in',
    canViewOnly: 'You can view the shop, but need to login to purchase items and redeem codes.',
    goToLogin: 'Go to Login',
    backToGame: 'Back to Game',
    shopTitle: 'Yo-kaidle Shop',
    loading: 'Loading shop...',
    validating: 'Validating code...',
    redeeming: 'Redeeming...'
  },
  it: {
    shop: 'Negozio',
    codes: 'Codici',
    featuredItems: 'Articoli in Evidenza',
    allItems: 'Tutti gli Articoli',
    promoCodes: 'Codici Promozionali',
    enterCode: 'Inserisci il tuo codice:',
    redeemCode: 'Riscatta Codice',
    validCode: 'Codice valido!',
    rewards: 'Ricompense:',
    recentPurchases: 'Acquisti Recenti',
    redeemedCodes: 'Codici Riscattati',
    noPurchases: 'Nessun acquisto ancora',
    noCodes: 'Nessun codice riscattato ancora',
    exampleCodes: 'Codici di esempio da provare:',
    buy: 'Acquista',
    insufficientPoints: 'Punti insufficienti',
    loginRequired: 'Accedi',
    loginToBuy: 'Devi accedere per acquistare',
    loginToRedeem: 'Devi accedere per riscattare codici',
    notAuthenticated: 'Non hai effettuato l\'accesso',
    canViewOnly: 'Puoi visualizzare il negozio, ma devi accedere per acquistare articoli e riscattare codici.',
    goToLogin: 'Vai al Login',
    backToGame: 'Torna al Gioco',
    shopTitle: 'Negozio Yo-kaidle',
    loading: 'Caricamento negozio...',
    validating: 'Validazione codice...',
    redeeming: 'Riscattando...'
  }
};

// Componente para las cards de artículos
interface ItemCardProps {
  item: any;
  onPurchase: (itemId: number, itemName: string) => void;
  canAfford: (price: number) => boolean;
  isAuthenticated: boolean;
  purchaseLoading: number | null;
  language: string;
}

function ItemCard({ item, onPurchase, canAfford, isAuthenticated, purchaseLoading, language }: ItemCardProps) {
  const st = shopTexts[language as keyof typeof shopTexts] || shopTexts.es;

  const getItemPreview = (itemType: string, itemId: string) => {
    switch (itemType) {
      case 'frame':
        return <FramePreview frameId={itemId} size="sm" />;
      case 'background':
        return <BackgroundPreview backgroundId={itemId} size="sm" />;
      case 'track':
        return (
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-blue-400" />
            <MusicPreview trackId={itemId} size="sm" />
          </div>
        );
      default:
        return <Gift className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getItemTypeName = (itemType: string) => {
    const names = {
      es: { frame: 'Marco', background: 'Fondo', track: 'Música' },
      en: { frame: 'Frame', background: 'Background', track: 'Music' },
      it: { frame: 'Cornice', background: 'Sfondo', track: 'Musica' }
    };
    return names[language as keyof typeof names]?.[itemType as keyof typeof names.es] || 'Artículo';
  };

  const getItemDisplayName = (itemType: string, itemId: string) => {
    switch (itemType) {
      case 'frame':
        const frame = getFrameById(itemId);
        return frame ? getFrameName(frame, language as 'es' | 'en' | 'it') : itemId;
      case 'background':
        const bg = getBackgroundById(itemId);
        return bg ? getBackgroundName(bg, language as 'es' | 'en' | 'it') : itemId;
      case 'track':
        const track = getTrackById(itemId);
        return track ? getTrackName(track, language as 'es' | 'en' | 'it') : itemId;
      default:
        return itemId;
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-3 sm:p-4 border border-slate-600/30 hover:border-slate-500/60 transition-all duration-300 transform hover:scale-105 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 rounded-xl"></div>

      {/* Discount badge */}
      {item.discount_percentage > 0 && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          -{item.discount_percentage}%
        </div>
      )}

      <div className="relative text-center">
        {/* Preview */}
        <div className="flex justify-center mb-3 p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300">
          <div className="text-slate-300 group-hover:text-white transition-colors duration-300">
            {getItemPreview(item.item_type, item.item_id)}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-white font-bold mb-1 text-xs sm:text-sm">{getItemTypeName(item.item_type)}</h3>
        <p className="text-slate-300 text-xs mb-3 font-medium leading-tight">{getItemDisplayName(item.item_type, item.item_id)}</p>

        {/* Price */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {item.discount_percentage > 0 && (
            <span className="text-white/50 line-through text-xs">
              {item.price.toLocaleString()}
            </span>
          )}
          <div className="flex items-center gap-1">
            <img src="/icons/points-icon.png" alt="Puntos" className="w-3 h-3" />
            <span className="text-yellow-400 font-bold text-xs sm:text-sm">
              {item.final_price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => onPurchase(item.id, getItemDisplayName(item.item_type, item.item_id))}
          disabled={!isAuthenticated || !canAfford(item.final_price) || purchaseLoading === item.id}
          className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${isAuthenticated && canAfford(item.final_price)
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105'
            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }`}
        >
          {purchaseLoading === item.id ? (
            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
          ) : !isAuthenticated ? (
            <>
              <span className="hidden sm:inline">{st.loginRequired}</span>
              <span className="sm:hidden">Login</span>
            </>
          ) : canAfford(item.final_price) ? (
            <ShoppingCart className="w-4 h-4" />
          ) : (
            <>
              <span className="hidden sm:inline">{st.insufficientPoints}</span>
              <span className="sm:hidden">Sin pts</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const st = shopTexts[language as keyof typeof shopTexts] || shopTexts.es;
  const { user } = useSocialAuth();
  const {
    shopItems,
    featuredItems,
    userPoints,
    loading,
    buyItem,
    canAfford
  } = useShop(user?.id);

  const {
    validationResult,
    isValidating,
    isRedeeming,
    validateCode,
    redeemCode,
    clearValidation
  } = usePromoCodes(user?.id);

  const [activeTab, setActiveTab] = useState<TabType>('shop');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Mostrar mensaje si no está autenticado, pero no redirigir inmediatamente
  const isAuthenticated = !!user;

  // Función para verificar si un artículo ya está desbloqueado
  const isItemUnlocked = useCallback((itemType: string, itemId: string): boolean => {
    try {
      switch (itemType) {
        case 'frame':
          const framesState = JSON.parse(localStorage.getItem('yokaidle-frames') || '{}');
          return !!framesState.unlockedFrames?.[itemId];
        case 'background':
          const backgroundsState = JSON.parse(localStorage.getItem('yokaidle_backgrounds_state') || '{}');
          return backgroundsState.unlockedBackgrounds?.includes(itemId) || false;
        case 'track':
          const jukeboxState = JSON.parse(localStorage.getItem('yokaidle_jukebox_state') || '{}');
          return jukeboxState.unlockedTracks?.includes(itemId) || false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking if item is unlocked:', error);
      return false;
    }
  }, []);

  // Filtrar artículos ya desbloqueados
  const availableShopItems = useMemo(() => {
    return shopItems.filter(item => !isItemUnlocked(item.item_type, item.item_id));
  }, [shopItems, isItemUnlocked]);

  const availableFeaturedItems = useMemo(() => {
    return featuredItems.filter(item => !isItemUnlocked(item.item_type, item.item_id));
  }, [featuredItems, isItemUnlocked]);

  // Organizar artículos por categorías
  const itemsByCategory = useMemo(() => {
    const categories = {
      frames: availableShopItems.filter(item => item.item_type === 'frame'),
      backgrounds: availableShopItems.filter(item => item.item_type === 'background'),
      tracks: availableShopItems.filter(item => item.item_type === 'track')
    };
    return categories;
  }, [availableShopItems]);

  const handleBackToGame = () => {
    router.push('/');
  };

  const handlePurchase = async (itemId: number, itemName: string) => {
    if (!isAuthenticated) {
      setNotification({ type: 'error', message: 'Debes iniciar sesión para comprar' });
      return;
    }
    setPurchaseLoading(itemId);
    try {
      const result = await buyItem(itemId);

      if (result.success) {
        setNotification({ type: 'success', message: `¡${itemName} comprado exitosamente!` });
      } else {
        setNotification({ type: 'error', message: result.error || 'Error al comprar' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error inesperado' });
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handlePromoCodeChange = (value: string) => {
    setPromoCodeInput(value.toUpperCase());
    if (value.trim()) {
      validateCode(value.trim());
    } else {
      clearValidation();
    }
  };

  const handleRedeemCode = async () => {
    if (!isAuthenticated) {
      setNotification({ type: 'error', message: 'Debes iniciar sesión para canjear códigos' });
      return;
    }
    if (!promoCodeInput.trim()) return;

    try {
      const result = await redeemCode(promoCodeInput.trim());

      if (result.success) {
        setNotification({
          type: 'success',
          message: `¡Código canjeado! ${formatRewards(result.rewards_applied || {}).join(', ')}`
        });
        setPromoCodeInput('');
      } else {
        setNotification({ type: 'error', message: result.error || 'Error al canjear código' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error inesperado' });
    }
  };

  // Auto-hide notifications
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getItemPreviewLarge = (itemType: string, itemId: string) => {
    switch (itemType) {
      case 'frame':
        return <FramePreview frameId={itemId} size="md" />;
      case 'background':
        return <BackgroundPreview backgroundId={itemId} size="md" />;
      case 'track':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <MusicPreview trackId={itemId} size="md" />
          </div>
        );
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getItemTypeName = (itemType: string) => {
    const names = {
      es: {
        frame: 'Marco',
        background: 'Fondo',
        track: 'Música'
      },
      en: {
        frame: 'Frame',
        background: 'Background',
        track: 'Music'
      },
      it: {
        frame: 'Cornice',
        background: 'Sfondo',
        track: 'Musica'
      }
    };
    return names[language as keyof typeof names]?.[itemType as keyof typeof names.es] || 'Artículo';
  };

  // Función para obtener nombres de items usando los managers
  const getItemDisplayName = (itemType: string, itemId: string) => {
    switch (itemType) {
      case 'frame':
        const frame = getFrameById(itemId);
        return frame ? getFrameName(frame, language as 'es' | 'en' | 'it') : itemId;
      case 'background':
        const bg = getBackgroundById(itemId);
        return bg ? getBackgroundName(bg, language as 'es' | 'en' | 'it') : itemId;
      case 'track':
        const track = getTrackById(itemId);
        return track ? getTrackName(track, language as 'es' | 'en' | 'it') : itemId;
      default:
        return itemId;
    }
  };

  if (loading) {
    return (
      <div className="app-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-6"></div>
            <ShoppingBag className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{st.loading}</h2>
          <p className="text-white/60">Preparando los mejores artículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen">
      {/* Authentication Banner - Mobile Optimized */}
      {!isAuthenticated && (
        <div className="mb-4 sm:mb-8 relative mx-2 sm:mx-0">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl sm:rounded-2xl blur"></div>
          <div className="relative bg-gradient-to-r from-yellow-900/60 to-orange-900/60 border border-yellow-400/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className="bg-yellow-400/20 rounded-full p-2 sm:p-3">
                  <Crown className="text-yellow-400" size={24} />
                </div>
              </div>
              <h3 className="text-yellow-400 font-bold text-lg sm:text-xl mb-2">{st.notAuthenticated}</h3>
              <p className="text-white/80 mb-3 sm:mb-4 max-w-md mx-auto text-sm sm:text-base">
                {st.canViewOnly}
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                {st.goToLogin}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notification.type === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'
          }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-8">
        <button
          onClick={handleBackToGame}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          {st.backToGame}
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl blur opacity-30"></div>
            <h1 className="relative text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-4 bg-gradient-to-r from-blue-900/80 to-purple-900/80 px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl border border-yellow-400/30">
              <div className="relative">
                <ShoppingBag size={24} className="sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-400" />
                <Sparkles size={12} className="sm:w-4 sm:h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
              </div>
              <span className="hidden sm:inline">{st.shopTitle}</span>
              <span className="sm:hidden">{st.shop}</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl border border-yellow-400/40 backdrop-blur-sm">
            <div className="relative">
              <img
                src="/icons/points-icon.png"
                alt="Puntos"
                className="w-6 h-6 sm:w-8 sm:h-8"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const nextElement = target.nextElementSibling as HTMLElement;
                  target.style.display = 'none';
                  if (nextElement) nextElement.style.display = 'block';
                }}
              />
              <Zap size={24} className="sm:w-8 sm:h-8 text-yellow-400 hidden" />
            </div>
            <div className="text-left">
              <div className="text-lg sm:text-2xl font-bold text-yellow-400">
                {isAuthenticated ? userPoints.toLocaleString() : '0'}
              </div>
              {!isAuthenticated && (
                <div className="text-xs text-white/60">{st.loginRequired}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Mobile Optimized */}
      <div className="flex justify-center mb-4 sm:mb-8 px-2">
        <div className="flex w-full max-w-md sm:max-w-none bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-blue-400/30 backdrop-blur-sm shadow-2xl">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center justify-center gap-1 sm:gap-3 px-3 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none ${activeTab === 'shop'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
              : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <ShoppingBag size={18} className="sm:w-[22px] sm:h-[22px]" />
            <span className="font-bold text-sm sm:text-base">{st.shop}</span>
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`flex items-center justify-center gap-1 sm:gap-3 px-3 py-2 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 flex-1 sm:flex-none ${activeTab === 'codes'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
              : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
          >
            <Gift size={18} className="sm:w-[22px] sm:h-[22px]" />
            <span className="font-bold text-sm sm:text-base">{st.codes}</span>
          </button>
        </div>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl sm:rounded-3xl border border-blue-400/30 backdrop-blur-lg shadow-2xl overflow-hidden mx-2 sm:mx-0">

        {/* Tab: Tienda */}
        {activeTab === 'shop' && (
          <div className="p-4 sm:p-8">
            {/* Featured Items */}
            {availableFeaturedItems.length > 0 && (
              <div className="mb-8 sm:mb-12">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="relative">
                    <Star className="text-yellow-400" size={24} />
                    <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur"></div>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {st.featuredItems}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {availableFeaturedItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/25"
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/15 via-orange-500/10 to-red-500/5"></div>

                      {/* Animated glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl sm:rounded-3xl blur-sm opacity-0 group-hover:opacity-30 transition-all duration-500"></div>

                      {/* Featured badge */}
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 sm:p-3 shadow-xl">
                            <Sparkles className="text-white" size={14} />
                          </div>
                        </div>
                      </div>

                      {/* Discount badge */}
                      {item.discount_percentage > 0 && (
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-bounce">
                          -{item.discount_percentage}% OFF
                        </div>
                      )}

                      <div className="relative p-6 sm:p-8 text-center">
                        {/* Preview container with enhanced design */}
                        <div className="relative mb-4 sm:mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl blur-lg"></div>
                          <div className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                            <div className="transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                              {getItemPreviewLarge(item.item_type, item.item_id)}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                          <div className="inline-block bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
                            <span className="text-yellow-300 font-semibold text-xs sm:text-sm">{getItemTypeName(item.item_type)}</span>
                          </div>
                          <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">{getItemDisplayName(item.item_type, item.item_id)}</h3>
                        </div>

                        {/* Price section */}
                        <div className="mb-6 sm:mb-8">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            {item.discount_percentage > 0 && (
                              <span className="text-white/50 line-through text-sm sm:text-base">
                                {item.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-xl blur"></div>
                            <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-4 py-2 rounded-xl border border-yellow-400/40 backdrop-blur-sm">
                              <img src="/icons/points-icon.png" alt="Puntos" className="w-5 h-5 sm:w-6 sm:h-6" />
                              <span className="text-yellow-400 font-black text-xl sm:text-2xl">
                                {item.final_price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Purchase button */}
                        <button
                          onClick={() => handlePurchase(item.id, getItemDisplayName(item.item_type, item.item_id))}
                          disabled={!isAuthenticated || !canAfford(item.final_price) || purchaseLoading === item.id}
                          className={`w-full py-3 px-6 sm:py-4 sm:px-8 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base relative overflow-hidden ${isAuthenticated && canAfford(item.final_price)
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                          {isAuthenticated && canAfford(item.final_price) && (
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          )}
                          <span className="relative">
                            {purchaseLoading === item.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                <span>Comprando...</span>
                              </div>
                            ) : !isAuthenticated ? (
                              st.loginRequired
                            ) : canAfford(item.final_price) ? (
                              <ShoppingCart className="w-5 h-5" />
                            ) : (
                              st.insufficientPoints
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Sections */}
            <div className="space-y-8 sm:space-y-12">
              {/* Marcos Section */}
              {itemsByCategory.frames.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="relative">
                      <Frame className="text-purple-400" size={24} />
                      <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {language === 'es' ? 'Marcos' : language === 'en' ? 'Frames' : 'Cornici'}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {itemsByCategory.frames.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onPurchase={handlePurchase}
                        canAfford={canAfford}
                        isAuthenticated={isAuthenticated}
                        purchaseLoading={purchaseLoading}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fondos Section */}
              {itemsByCategory.backgrounds.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="relative">
                      <Image className="text-green-400" size={24} />
                      <div className="absolute -inset-1 bg-green-400/20 rounded-full blur"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {language === 'es' ? 'Fondos' : language === 'en' ? 'Backgrounds' : 'Sfondi'}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-green-400/50 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {itemsByCategory.backgrounds.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onPurchase={handlePurchase}
                        canAfford={canAfford}
                        isAuthenticated={isAuthenticated}
                        purchaseLoading={purchaseLoading}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Música Section */}
              {itemsByCategory.tracks.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="relative">
                      <Music className="text-blue-400" size={24} />
                      <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur"></div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {language === 'es' ? 'Música' : language === 'en' ? 'Music' : 'Musica'}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-400/50 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {itemsByCategory.tracks.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onPurchase={handlePurchase}
                        canAfford={canAfford}
                        isAuthenticated={isAuthenticated}
                        purchaseLoading={purchaseLoading}
                        language={language}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {availableShopItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <Trophy className="text-yellow-400" size={64} />
                    <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {language === 'es' ? '¡Felicidades!' : language === 'en' ? 'Congratulations!' : 'Congratulazioni!'}
                  </h3>
                  <p className="text-white/60">
                    {language === 'es' ? 'Ya tienes todos los artículos disponibles' :
                      language === 'en' ? 'You already have all available items' :
                        'Hai già tutti gli articoli disponibili'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Códigos Promocionales - Mobile Optimized */}
        {activeTab === 'codes' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Gift className="text-green-400" size={20} />
              <h2 className="text-lg sm:text-2xl font-bold text-white">{st.promoCodes}</h2>
            </div>

            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <label className="block text-white mb-2 font-bold text-sm sm:text-base">{st.enterCode}</label>
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => handlePromoCodeChange(e.target.value)}
                  placeholder="Ej: YOKAIDLE"
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-blue-800/50 border border-blue-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 uppercase text-sm sm:text-base"
                  maxLength={20}
                />
              </div>

              {/* Validation Result */}
              {isValidating && (
                <div className="mb-4 p-3 bg-blue-800/30 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm sm:text-base">{st.validating}</span>
                  </div>
                </div>
              )}

              {validationResult && !isValidating && (
                <div className={`mb-4 p-3 rounded-lg border ${validationResult.is_valid
                  ? 'bg-green-900/30 border-green-500/30 text-green-400'
                  : 'bg-red-900/30 border-red-500/30 text-red-400'
                  }`}>
                  {validationResult.is_valid ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Check size={16} />
                        <span className="font-bold text-sm sm:text-base">{st.validCode}</span>
                      </div>
                      <div className="text-sm">
                        <p className="mb-1">{st.rewards}</p>
                        <div className="flex flex-wrap gap-1">
                          {formatRewards(validationResult.rewards || {}, language).map((reward, index) => (
                            <span key={index} className="inline-block bg-green-800/50 text-green-300 px-2 py-1 rounded text-xs">
                              {reward}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X size={16} />
                      <span className="text-sm sm:text-base">{validationResult.error_message}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleRedeemCode}
                disabled={!isAuthenticated || !validationResult?.is_valid || isRedeeming || !promoCodeInput.trim()}
                className={`w-full py-2 px-3 sm:py-3 sm:px-4 rounded-lg font-bold transition-all text-sm sm:text-base ${isAuthenticated && validationResult?.is_valid && !isRedeeming
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isRedeeming ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{st.redeeming}</span>
                  </div>
                ) : !isAuthenticated ? (
                  <>
                    <span className="hidden sm:inline">{st.loginToRedeem}</span>
                    <span className="sm:hidden">Inicia sesión</span>
                  </>
                ) : (
                  st.redeemCode
                )}
              </button>
            </div>


          </div>
        )}


      </div>
    </div>
  );
}
