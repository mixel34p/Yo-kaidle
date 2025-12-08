'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bug, Lightbulb, FileText, AlertTriangle } from 'lucide-react';
import { submitFeedback } from '@/utils/feedbackManager';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { createPortal } from 'react-dom';

type FeedbackType = 'bug' | 'suggestion' | 'other';
type Priority = 'low' | 'medium' | 'high';

interface FeedbackFormData {
  feedbackType: FeedbackType;
  title: string;
  description: string;
  username: string;
  priority: Priority;
}

export default function FeedbackPanel() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    feedbackType: 'suggestion',
    title: '',
    description: '',
    username: '',
    priority: 'medium',
  });

  // Configuración de tipos con traducciones
  const feedbackTypeConfig = {
    bug: {
      icon: Bug,
      label: t.feedbackTypeBug || 'Bug / Error',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-400/40',
      emoji: '🐛'
    },
    suggestion: {
      icon: Lightbulb,
      label: t.feedbackTypeSuggestion || 'Sugerencia',
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-400/40',
      emoji: '💡'
    },
    other: {
      icon: FileText,
      label: t.feedbackTypeOther || 'Otro',
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-400/40',
      emoji: '📝'
    }
  };

  const priorityConfig = {
    low: { label: t.priorityLow || 'Baja', emoji: '🟢' },
    medium: { label: t.priorityMedium || 'Media', emoji: '🟡' },
    high: { label: t.priorityHigh || 'Alta', emoji: '🔴' }
  };

  // Deshabilitar scroll cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setFormData((prev) => ({ ...prev, feedbackType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error(t.feedbackAddTitle || 'Por favor, añade un título');
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t.feedbackAddDescription || 'Por favor, añade una descripción');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        feedbackType: formData.feedbackType,
        title: formData.title,
        description: formData.description,
        username: formData.username || 'Anónimo',
        priority: formData.priority,
        pageUrl: window.location.href,
      });

      if (result.success) {
        toast.success(t.feedbackSuccess || '¡Feedback enviado correctamente!');
        setFormData({
          feedbackType: 'suggestion',
          title: '',
          description: '',
          username: '',
          priority: 'medium',
        });
        setIsOpen(false);
      } else {
        toast.error(result.error || t.feedbackError || 'Error al enviar el feedback');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t.feedbackError || 'Error al enviar el feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentType = feedbackTypeConfig[formData.feedbackType];
  const TypeIcon = currentType.icon;

  return (
    <>
      {/* Botón en el footer - Estilo Yo-kai Watch */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-600/80 to-yellow-600/80 hover:from-amber-500 hover:to-yellow-500 text-white rounded-lg transition-all duration-300 border border-amber-400/30 hover:border-amber-300/50 text-sm font-bold shadow-lg hover:shadow-amber-500/25 whitespace-nowrap"
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        title={t.feedbackTitle || "Buzón de sugerencias y errores"}
      >
        <MessageSquare size={16} className="text-amber-100" />
        <span className="hidden sm:inline">{t.feedbackButton || 'Feedback'}</span>
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
                  <div className="bg-gradient-to-b from-amber-800/95 via-amber-900/95 to-yellow-950/95 rounded-2xl shadow-2xl border-2 border-amber-500/40 backdrop-blur-md overflow-hidden">

                    {/* Cabecera decorativa */}
                    <div className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-4 border-b-2 border-amber-400/50">
                      {/* Patrón decorativo */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-4 w-8 h-8 border-2 border-white rounded-full" />
                        <div className="absolute top-1 right-8 w-6 h-6 border-2 border-white rounded-full" />
                        <div className="absolute bottom-1 left-1/3 w-4 h-4 border-2 border-white rounded-full" />
                      </div>

                      <div className="flex items-center justify-between relative">
                        <h3 className="font-bold text-lg text-amber-950 flex items-center gap-2 drop-shadow-sm">
                          <div className="p-1.5 bg-white/30 rounded-lg">
                            <MessageSquare size={20} className="text-amber-900" />
                          </div>
                          <span>{t.feedbackTitle || '📬 Buzón de Feedback'}</span>
                        </h3>
                        <motion.button
                          onClick={() => setIsOpen(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200 text-amber-900"
                          whileHover={{ rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X size={20} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="p-5 space-y-4 max-h-[calc(90vh-80px)] overflow-y-auto custom-scrollbar">
                      <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Selector de tipo - Botones visuales */}
                        <div>
                          <label className="block text-sm font-bold text-amber-100 mb-2">
                            {t.feedbackType || '¿Qué quieres reportar?'}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['bug', 'suggestion', 'other'] as FeedbackType[]).map((type) => {
                              const config = feedbackTypeConfig[type];
                              const Icon = config.icon;
                              const isSelected = formData.feedbackType === type;

                              return (
                                <motion.button
                                  key={type}
                                  type="button"
                                  onClick={() => handleTypeSelect(type)}
                                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                    ? `${config.bgColor} ${config.borderColor} shadow-lg`
                                    : 'bg-amber-900/30 border-amber-700/30 hover:border-amber-600/50'
                                    }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex flex-col items-center gap-1.5">
                                    <div className={`p-2 rounded-lg ${isSelected ? config.bgColor : 'bg-amber-800/50'}`}>
                                      <Icon size={20} className={isSelected ? 'text-white' : 'text-amber-300'} />
                                    </div>
                                    <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-amber-200'}`}>
                                      {config.label}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      layoutId="selectedType"
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

                        {/* Prioridad (solo para bugs) */}
                        <AnimatePresence>
                          {formData.feedbackType === 'bug' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <label className="block text-sm font-bold text-amber-100 mb-2 flex items-center gap-2">
                                <AlertTriangle size={14} />
                                Prioridad del bug
                              </label>
                              <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as Priority[]).map((priority) => {
                                  const config = priorityConfig[priority];
                                  const isSelected = formData.priority === priority;

                                  return (
                                    <motion.button
                                      key={priority}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, priority }))}
                                      className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${isSelected
                                        ? 'bg-amber-600/40 border-amber-400/60 text-white'
                                        : 'bg-amber-900/30 border-amber-700/30 text-amber-300 hover:border-amber-600/40'
                                        }`}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <span>{config.emoji}</span>
                                      <span className="text-sm font-medium">{config.label}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Nombre de usuario */}
                        <div>
                          <label htmlFor="username" className="block text-sm font-bold text-amber-100 mb-2">
                            {t.feedbackUsername || 'Tu nombre'} <span className="text-amber-400/60 font-normal">(opcional)</span>
                          </label>
                          <input
                            id="username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder={t.feedbackUsernamePlaceholder || "Ej: Jibanyan"}
                            className="w-full px-4 py-2.5 bg-amber-950/50 border-2 border-amber-600/30 rounded-xl text-white placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-all duration-200"
                          />
                        </div>

                        {/* Título */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-bold text-amber-100 mb-2">
                            {t.feedbackReportTitle || 'Título'} <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={t.feedbackReportTitlePlaceholder || (formData.feedbackType === 'bug'
                              ? 'Ej: El botón de compartir no funciona'
                              : 'Ej: Añadir modo oscuro'
                            )}
                            className="w-full px-4 py-2.5 bg-amber-950/50 border-2 border-amber-600/30 rounded-xl text-white placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-all duration-200"
                          />
                        </div>

                        {/* Descripción */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-bold text-amber-100 mb-2">
                            {t.feedbackDescription || 'Descripción'} <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t.feedbackDescriptionPlaceholder || (formData.feedbackType === 'bug'
                              ? 'Describe el error: ¿Qué pasó? ¿Qué esperabas que pasara? ¿Cómo reproducirlo?'
                              : '¿Qué te gustaría ver en Yo-kaidle? Cuéntanos tu idea...'
                            )}
                            rows={4}
                            className="w-full px-4 py-2.5 bg-amber-950/50 border-2 border-amber-600/30 rounded-xl text-white placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-all duration-200 resize-none"
                          />
                        </div>

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
                              <span>{t.feedbackSending || 'Enviando...'}</span>
                            </>
                          ) : (
                            <>
                              <Send size={18} />
                              <span>{t.feedbackSend || 'Enviar'} {currentType.emoji}</span>
                            </>
                          )}
                        </motion.button>

                        {/* Info de privacidad */}
                        <p className="text-xs text-amber-300/60 text-center">
                          {t.feedbackPrivacy || '🔒 Tu feedback se enviará de forma anónima si no proporcionas tu nombre.'}
                        </p>
                      </form>
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
