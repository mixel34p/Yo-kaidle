'use client';

import React, { useState, useEffect } from 'react';
import { useSocialAuth } from '@/contexts/SocialAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, LogIn } from 'lucide-react';

export default function ConnectAccountPrompt() {
    const [isVisible, setIsVisible] = useState(false);
    const { user, signInWithDiscord, loading } = useSocialAuth();
    const { language } = useLanguage();

    useEffect(() => {
        // Wait for auth to finish loading
        if (loading) return;

        // If user is already logged in, don't show prompt
        if (user) return;

        // Check if prompt has been seen before
        const hasSeenPrompt = localStorage.getItem('yokaidle_connect_prompt_seen');
        if (!hasSeenPrompt) {
            // Delay showing to not be intrusive immediately on load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user, loading]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('yokaidle_connect_prompt_seen', 'true');
    };

    const handleConnect = () => {
        // Mark as seen so it doesn't pop up again if they cancel login or return later
        localStorage.setItem('yokaidle_connect_prompt_seen', 'true');
        signInWithDiscord();
    };

    if (!isVisible) return null;

    const content = {
        es: {
            title: '¡Conecta tu cuenta!',
            message: 'Conecta tu cuenta para estadísticas y jugar con amigos.',
            button: 'Conectar con Discord',
        },
        en: {
            title: 'Connect your account!',
            message: 'Connect your account to stats and play with friends.',
            button: 'Connect with Discord',
        },
        it: {
            title: 'Collega il tuo account!',
            message: 'Collega il tuo account per statistiche e giocare con gli amici.',
            button: 'Connetti con Discord',
        }
    };

    const t = content[language] || content.es;

    return (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm w-full animate-fade-in-up px-4 sm:px-0">
            <div className="bg-slate-800/95 backdrop-blur-md border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden">
                {/* Header decoration */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

                <div className="p-5 relative">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center border border-blue-500/50 text-blue-300">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1 leading-tight">
                                {t.title}
                            </h3>
                            <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                                {t.message}
                            </p>

                            <button
                                onClick={handleConnect}
                                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 group"
                            >
                                <img src="/icons/discord-white.svg" alt="Discord" className="w-5 h-5 group-hover:scale-110 transition-transform" onError={(e) => {
                                    // Fallback icon if svg fails (though we used LogIn icon above, this is for the button)
                                    e.currentTarget.style.display = 'none';
                                }} />
                                {t.button}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
