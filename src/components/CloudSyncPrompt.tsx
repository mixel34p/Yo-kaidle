'use client';

import React, { useState, useEffect } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Cloud, HardDrive, RefreshCw, Check, AlertCircle } from 'lucide-react';
import {
    getSyncStatus,
    fetchCloudData,
    getCloudDataStats,
    getLocalDataStats,
    uploadToCloud,
    downloadFromCloud,
    clearSyncStatus,
    CloudDataStats
} from '@/utils/cloudSyncManager';

interface CloudSyncPromptProps {
    isOpen: boolean;
    onClose: () => void;
    isResync?: boolean;
}

export default function CloudSyncPrompt({ isOpen, onClose, isResync = false }: CloudSyncPromptProps) {
    const { user } = useSocialAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncComplete, setSyncComplete] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [cloudStats, setCloudStats] = useState<CloudDataStats | null>(null);
    const [localStats, setLocalStats] = useState<CloudDataStats | null>(null);
    const [hasCloudData, setHasCloudData] = useState(false);
    const [lastSynced, setLastSynced] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            loadData();
        }
    }, [isOpen, user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        setSyncComplete(false);
        setSyncError(null);

        try {
            // Get local stats
            const local = getLocalDataStats();
            setLocalStats(local);

            // Get cloud stats
            const cloudResult = await fetchCloudData(user.id);
            setHasCloudData(cloudResult.hasCloudData);
            setLastSynced(cloudResult.lastSynced);

            if (cloudResult.data) {
                const cloud = getCloudDataStats(cloudResult.data);
                cloud.lastSyncedAt = cloudResult.lastSynced;
                setCloudStats(cloud);
            } else {
                setCloudStats(null);
            }
        } catch (error) {
            console.error('[CloudSyncPrompt] Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseLocal = async () => {
        if (!user) return;

        setSyncing(true);
        setSyncError(null);

        try {
            const success = await uploadToCloud(user.id);
            if (success) {
                setSyncComplete(true);
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            } else {
                setSyncError(t.syncError);
            }
        } catch (error) {
            console.error('[CloudSyncPrompt] Upload error:', error);
            setSyncError(t.syncError);
        } finally {
            setSyncing(false);
        }
    };

    const handleUseCloud = async () => {
        if (!user) return;

        setSyncing(true);
        setSyncError(null);

        try {
            const success = await downloadFromCloud(user.id);
            if (success) {
                setSyncComplete(true);
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 1500);
            } else {
                setSyncError(t.syncError);
            }
        } catch (error) {
            console.error('[CloudSyncPrompt] Download error:', error);
            setSyncError(t.syncError);
        } finally {
            setSyncing(false);
        }
    };

    const handleResync = () => {
        if (user) {
            clearSyncStatus();
            loadData();
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900/95 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

                <div className="p-6">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    {/* Title */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500/50">
                            <Cloud className="w-6 h-6 text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{t.cloudSyncTitle}</h2>
                            <p className="text-slate-400 text-sm">{t.cloudSyncDescription}</p>
                        </div>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    )}

                    {/* Sync complete state */}
                    {syncComplete && (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-green-400 font-medium">{t.syncComplete}</p>
                        </div>
                    )}

                    {/* Error state */}
                    {syncError && (
                        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-300 text-sm">{syncError}</p>
                        </div>
                    )}

                    {/* Main content */}
                    {!loading && !syncComplete && (
                        <div className="space-y-4">
                            {/* Local Data Card */}
                            <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <HardDrive className="w-5 h-5 text-amber-400" />
                                    <h3 className="font-semibold text-white">{t.localData}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t.yokaiUnlockedCount}:</span>
                                        <span className="text-white font-medium">{localStats?.yokaiUnlocked || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t.achievementsUnlockedCount}:</span>
                                        <span className="text-white font-medium">{localStats?.achievementsCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t.pointsEarned}:</span>
                                        <span className="text-white font-medium">{localStats?.totalPoints || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">{t.gamesPlayedCount}:</span>
                                        <span className="text-white font-medium">{localStats?.gamesPlayed || 0}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleUseLocal}
                                    disabled={syncing}
                                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {syncing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            {t.uploadingData}
                                        </>
                                    ) : (
                                        <>
                                            <HardDrive className="w-4 h-4" />
                                            {t.useLocalData}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Cloud Data Card */}
                            <div className={`bg-slate-800/50 border rounded-xl p-4 ${hasCloudData ? 'border-blue-500/50' : 'border-slate-600/30'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Cloud className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-semibold text-white">{t.cloudData}</h3>
                                    {lastSynced && (
                                        <span className="text-xs text-slate-400 ml-auto">
                                            {t.lastSynced}: {formatDate(lastSynced)}
                                        </span>
                                    )}
                                </div>

                                {hasCloudData && cloudStats ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">{t.yokaiUnlockedCount}:</span>
                                                <span className="text-white font-medium">{cloudStats.yokaiUnlocked}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">{t.achievementsUnlockedCount}:</span>
                                                <span className="text-white font-medium">{cloudStats.achievementsCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">{t.pointsEarned}:</span>
                                                <span className="text-white font-medium">{cloudStats.totalPoints}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">{t.gamesPlayedCount}:</span>
                                                <span className="text-white font-medium">{cloudStats.gamesPlayed}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUseCloud}
                                            disabled={syncing}
                                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            {syncing ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    {t.downloadingData}
                                                </>
                                            ) : (
                                                <>
                                                    <Cloud className="w-4 h-4" />
                                                    {t.useCloudData}
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-slate-400 text-sm">{t.noCloudData}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
