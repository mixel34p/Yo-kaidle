'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Image, Frame, Music, Tag, LogIn, Gift } from 'lucide-react';
import { submitSuggestion, SuggestionType } from '@/utils/suggestionManager';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface SuggestionFormData {
    suggestionType: SuggestionType;
    name: string;
    description: string;
    imageUrl: string;
    referenceUrl: string;
}

export default function SuggestionPanel() {
    const { t } = useLanguage();
    const { user, profile, signInWithDiscord, loading: authLoading } = useSocialAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<SuggestionFormData>({
        suggestionType: 'frame',
        name: '',
        description: '',
        imageUrl: '',
        referenceUrl: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Configuración de tipos con traducciones
    const suggestionTypeConfig = {
        frame: {
            icon: Frame,
            label: t.suggestionTypeFrame || 'Marco',
            color: 'from-yellow-400 to-amber-500',
            bgColor: 'bg-yellow-500/20',
            borderColor: 'border-yellow-400/40',
            emoji: '🖼️',
            showImageUrl: true,
            showReferenceUrl: false,
        },
        background: {
            icon: Image,
            label: t.suggestionTypeBackground || 'Fondo',
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-500/20',
            borderColor: 'border-green-400/40',
            emoji: '🌄',
            showImageUrl: true,
            showReferenceUrl: false,
        },
        music: {
            icon: Music,
            label: t.suggestionTypeMusic || 'Música',
            color: 'from-purple-400 to-violet-500',
            bgColor: 'bg-purple-500/20',
            borderColor: 'border-purple-400/40',
            emoji: '🎵',
            showImageUrl: false,
            showReferenceUrl: true,
        },
        title: {
            icon: Tag,
            label: t.suggestionTypeTitle || 'Título',
            color: 'from-blue-400 to-cyan-500',
            bgColor: 'bg-blue-500/20',
            borderColor: 'border-blue-400/40',
            emoji: '🏷️',
            showImageUrl: false,
            showReferenceUrl: false,
        },
    };

    // Deshabilitar scroll cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalOverflow || '';
            };
        }
    }, [isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTypeSelect = (type: SuggestionType) => {
        setFormData((prev) => ({ ...prev, suggestionType: type }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !profile) {
            toast.error(t.suggestionLoginRequired || 'Debes iniciar sesión para enviar sugerencias');
            return;
        }

        if (!formData.name.trim()) {
            toast.error(t.suggestionAddName || 'Por favor, añade un nombre');
            return;
        }
        if (!formData.description.trim()) {
            toast.error(t.suggestionAddDescription || 'Por favor, añade una descripción');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitSuggestion({
                suggestionType: formData.suggestionType,
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl || undefined,
                referenceUrl: formData.referenceUrl || undefined,
                username: profile.username,
                userId: user.id,
                avatarUrl: profile.avatar_url || undefined,
            });

            if (result.success) {
                toast.success(t.suggestionSuccess || '¡Sugerencia enviada correctamente!');
                setFormData({
                    suggestionType: 'frame',
                    name: '',
                    description: '',
                    imageUrl: '',
                    referenceUrl: '',
                });
                setIsOpen(false);
            } else {
                toast.error(result.error || t.suggestionError || 'Error al enviar la sugerencia');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(t.suggestionError || 'Error al enviar la sugerencia');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentType = suggestionTypeConfig[formData.suggestionType];
    const TypeIcon = currentType.icon;
    const isAuthenticated = user && profile && !authLoading;

    if (!mounted) return null;

    return (
        <>
            {/* Botón en el footer */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 border border-purple-400/30 hover:border-purple-300/50 text-sm font-bold shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                title={t.suggestionTitle || "Sugerir contenido"}
            >
                <Sparkles size={16} className="text-pink-100" />
                <span className="hidden sm:inline">{t.suggestionButton || 'Sugerir'}</span>
            </motion.button>

            {createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999]">
                            {/* Overlay oscuro */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
                            />

                            {/* Modal centrado */}
                            <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="w-full max-w-lg max-h-[90vh] overflow-hidden pointer-events-auto"
                                >
                                    {/* Panel con estilo Yo-kai Watch */}
                                    <div className="bg-gradient-to-b from-purple-800/95 via-purple-900/95 to-violet-950/95 rounded-2xl shadow-2xl border-2 border-purple-500/40 backdrop-blur-md overflow-hidden">

                                        {/* Cabecera decorativa */}
                                        <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-4 border-b-2 border-purple-400/50">
                                            {/* Patrón decorativo */}
                                            <div className="absolute inset-0 opacity-20">
                                                <div className="absolute top-0 left-4 w-8 h-8 border-2 border-white rounded-full" />
                                                <div className="absolute top-1 right-8 w-6 h-6 border-2 border-white rounded-full" />
                                                <div className="absolute bottom-1 left-1/3 w-4 h-4 border-2 border-white rounded-full" />
                                            </div>

                                            <div className="flex items-center justify-between relative">
                                                <h3 className="font-bold text-lg text-white flex items-center gap-2 drop-shadow-sm">
                                                    <div className="p-1.5 bg-white/30 rounded-lg">
                                                        <Sparkles size={20} className="text-white" />
                                                    </div>
                                                    <span>{t.suggestionTitle || '✨ Sugerir Contenido'}</span>
                                                </h3>
                                                <motion.button
                                                    onClick={() => setIsOpen(false)}
                                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 text-white"
                                                    whileHover={{ rotate: 90 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <X size={20} />
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Contenido */}
                                        <div className="p-5 space-y-4 max-h-[calc(90vh-80px)] overflow-y-auto custom-scrollbar">

                                            {/* Banner de recompensa */}
                                            <motion.div
                                                className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 rounded-xl p-3 flex items-center gap-3"
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
                                            >
                                                <Gift className="text-amber-300 flex-shrink-0" size={24} />
                                                <p className="text-sm text-amber-100 font-medium">
                                                    {t.suggestionRewardBanner || '¡Puedes ganar tu sugerencia como recompensa si es implementada! 🎁'}
                                                </p>
                                            </motion.div>

                                            {/* Verificar autenticación */}
                                            {!isAuthenticated ? (
                                                <div className="py-8 text-center space-y-4">
                                                    <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                                                        <LogIn size={32} className="text-purple-300" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-2">
                                                            {t.suggestionLoginRequired || 'Inicia sesión para sugerir'}
                                                        </h4>
                                                        <p className="text-purple-200/70 text-sm mb-4">
                                                            {t.suggestionLoginDescription || 'Necesitas iniciar sesión con Discord para enviar sugerencias'}
                                                        </p>
                                                        <motion.button
                                                            onClick={() => signInWithDiscord()}
                                                            className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition-colors duration-200 flex items-center gap-2 mx-auto"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                                            </svg>
                                                            {t.connect || 'Conectar con Discord'}
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleSubmit} className="space-y-4">

                                                    {/* Selector de tipo */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-purple-100 mb-2">
                                                            {t.suggestionType || '¿Qué quieres sugerir?'}
                                                        </label>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {(['frame', 'background', 'music', 'title'] as SuggestionType[]).map((type) => {
                                                                const config = suggestionTypeConfig[type];
                                                                const Icon = config.icon;
                                                                const isSelected = formData.suggestionType === type;

                                                                return (
                                                                    <motion.button
                                                                        key={type}
                                                                        type="button"
                                                                        onClick={() => handleTypeSelect(type)}
                                                                        className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                                            ? `${config.bgColor} ${config.borderColor} shadow-lg`
                                                                            : 'bg-purple-900/30 border-purple-700/30 hover:border-purple-600/50'
                                                                            }`}
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                    >
                                                                        <div className="flex flex-col items-center gap-1.5">
                                                                            <div className={`p-2 rounded-lg ${isSelected ? config.bgColor : 'bg-purple-800/50'}`}>
                                                                                <Icon size={18} className={isSelected ? 'text-white' : 'text-purple-300'} />
                                                                            </div>
                                                                            <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-purple-200'}`}>
                                                                                {config.label}
                                                                            </span>
                                                                        </div>
                                                                        {isSelected && (
                                                                            <motion.div
                                                                                layoutId="selectedSuggestionType"
                                                                                className="absolute inset-0 border-2 border-white/30 rounded-xl"
                                                                                initial={false}
                                                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                                            />
                                                                        )}
                                                                    </motion.button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Nombre de la sugerencia */}
                                                    <div>
                                                        <label htmlFor="name" className="block text-sm font-bold text-purple-100 mb-2">
                                                            {t.suggestionName || 'Nombre'} <span className="text-red-400">*</span>
                                                        </label>
                                                        <input
                                                            id="name"
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            placeholder={t.suggestionNamePlaceholder || "Ej: Marco de Jibanyan dorado"}
                                                            className="w-full px-4 py-2.5 bg-purple-950/50 border-2 border-purple-600/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-500/50 transition-all duration-200"
                                                        />
                                                    </div>

                                                    {/* Descripción */}
                                                    <div>
                                                        <label htmlFor="description" className="block text-sm font-bold text-purple-100 mb-2">
                                                            {t.suggestionDescription || 'Descripción / Razón'} <span className="text-red-400">*</span>
                                                        </label>
                                                        <textarea
                                                            id="description"
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            placeholder={t.suggestionDescriptionPlaceholder || '¿Por qué debería añadirse? ¿Qué lo hace especial?'}
                                                            rows={3}
                                                            className="w-full px-4 py-2.5 bg-purple-950/50 border-2 border-purple-600/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                                                        />
                                                    </div>

                                                    {/* URL de imagen (para marcos y fondos) */}
                                                    <AnimatePresence>
                                                        {currentType.showImageUrl && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <label htmlFor="imageUrl" className="block text-sm font-bold text-purple-100 mb-2 flex items-center gap-2">
                                                                    <Image size={14} />
                                                                    {t.suggestionImageUrl || 'URL de imagen'} <span className="text-purple-400/60 font-normal">(opcional)</span>
                                                                </label>
                                                                <input
                                                                    id="imageUrl"
                                                                    type="url"
                                                                    name="imageUrl"
                                                                    value={formData.imageUrl}
                                                                    onChange={handleInputChange}
                                                                    placeholder={t.suggestionImageUrlPlaceholder || "https://imgur.com/... o enlace directo"}
                                                                    className="w-full px-4 py-2.5 bg-purple-950/50 border-2 border-purple-600/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-500/50 transition-all duration-200"
                                                                />
                                                                <p className="text-xs text-purple-300/50 mt-1">
                                                                    {t.suggestionImageUrlHint || 'Sube tu imagen a Imgur o Discord y pega el enlace'}
                                                                </p>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* URL de referencia (para música) */}
                                                    <AnimatePresence>
                                                        {currentType.showReferenceUrl && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <label htmlFor="referenceUrl" className="block text-sm font-bold text-purple-100 mb-2 flex items-center gap-2">
                                                                    <Music size={14} />
                                                                    {t.suggestionReferenceUrl || 'URL de referencia'} <span className="text-purple-400/60 font-normal">(opcional)</span>
                                                                </label>
                                                                <input
                                                                    id="referenceUrl"
                                                                    type="url"
                                                                    name="referenceUrl"
                                                                    value={formData.referenceUrl}
                                                                    onChange={handleInputChange}
                                                                    placeholder={t.suggestionReferenceUrlPlaceholder || "https://youtube.com/... o enlace de la canción"}
                                                                    className="w-full px-4 py-2.5 bg-purple-950/50 border-2 border-purple-600/30 rounded-xl text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-500/50 transition-all duration-200"
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Botón enviar */}
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className={`w-full bg-gradient-to-r ${currentType.color} hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg`}
                                                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <motion.div
                                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                                />
                                                                <span>{t.suggestionSending || 'Enviando...'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send size={18} />
                                                                <span>{t.suggestionSend || 'Enviar Sugerencia'} {currentType.emoji}</span>
                                                            </>
                                                        )}
                                                    </motion.button>

                                                    {/* Usuario actual */}
                                                    <p className="text-xs text-purple-300/60 text-center">
                                                        {t.suggestionSendingAs || 'Enviando como'}: <span className="font-semibold text-purple-200">{profile?.username}</span>
                                                    </p>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
