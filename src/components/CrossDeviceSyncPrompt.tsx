'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Cloud, RefreshCw, Check, Smartphone } from 'lucide-react';
import { downloadFromCloud, startPeriodicSync } from '@/utils/cloudSyncManager';

interface CrossDeviceSyncPromptProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    lastSynced: string | null;
}

export default function CrossDeviceSyncPrompt({
    isOpen,
    onClose,
    userId,
    lastSynced
}: CrossDeviceSyncPromptProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleLoadCloudData = async () => {
        setLoading(true);
        try {
            const result = await downloadFromCloud(userId);
            if (result) {
                setSuccess(true);
                // Start periodic sync after successful download
                startPeriodicSync(userId);
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.error('[CrossDeviceSync] Error loading cloud data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeepLocal = () => {
        // User chooses to keep local data, just start periodic sync
        startPeriodicSync(userId);
        onClose();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header gradient */}
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

                <div className="p-6">
                    {/* Close button */}
                    <button
                        onClick={handleKeepLocal}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    {/* Success state */}
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-green-400 font-medium">{t.syncComplete}</p>
                        </div>
                    ) : (
                        <>
                            {/* Icon and title */}
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center border border-purple-500/50 mb-4">
                                    <Smartphone className="w-8 h-8 text-purple-300" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {t.crossDeviceDetected || '¡Jugaste en otro dispositivo!'}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {t.crossDeviceDescription || 'Se detectó progreso reciente desde otro navegador o dispositivo.'}
                                </p>
                                {lastSynced && (
                                    <p className="text-purple-300 text-xs mt-2">
                                        {t.lastSynced}: {formatDate(lastSynced)}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleLoadCloudData}
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            {t.downloadingData}
                                        </>
                                    ) : (
                                        <>
                                            <Cloud className="w-5 h-5" />
                                            {t.loadRecentData || 'Cargar datos recientes'}
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleKeepLocal}
                                    disabled={loading}
                                    className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                                >
                                    {t.keepLocalData || 'Mantener datos actuales'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
