'use client';

import React from 'react';
import type { EventConfiguration } from '@/types/events';

interface EventLayoutProps {
  event: EventConfiguration;
  children: React.ReactNode;
}

export default function EventLayout({ event, children }: EventLayoutProps) {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${event.theme_color}20 0%, ${event.theme_color}10 50%, transparent 100%), linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`
      }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 animate-pulse"
          style={{ 
            backgroundImage: `
              radial-gradient(circle at 20% 20%, ${event.theme_color}30 0%, transparent 50%), 
              radial-gradient(circle at 80% 80%, ${event.theme_color}20 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, ${event.theme_color}15 0%, transparent 50%)
            `,
            backgroundSize: '200px 200px, 300px 300px, 150px 150px',
            animation: 'float 20s ease-in-out infinite'
          }} 
        />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30 animate-bounce"
            style={{
              backgroundColor: event.theme_color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}

// Progress bar component for events
interface EventProgressBarProps {
  current: number;
  total: number;
  color: string;
  label?: string;
}

export function EventProgressBar({ current, total, color, label }: EventProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-white/80 text-sm mb-2">
          <span>{label}</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`
          }}
        >
          {/* Animated shine effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          
          {/* Progress indicator */}
          {percentage > 10 && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-bold">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Milestone card component
interface EventMilestoneCardProps {
  milestone: any;
  isCompleted: boolean;
  isCurrent: boolean;
  language: string;
  themeColor: string;
}

export function EventMilestoneCard({ 
  milestone, 
  isCompleted, 
  isCurrent, 
  language, 
  themeColor 
}: EventMilestoneCardProps) {
  return (
    <div
      className={`
        relative p-4 rounded-xl border transition-all duration-300 transform hover:scale-105
        ${isCompleted 
          ? 'bg-green-500/20 border-green-400/50 shadow-lg shadow-green-400/20' 
          : isCurrent
          ? 'bg-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-400/20 animate-pulse'
          : 'bg-white/10 border-white/20 hover:bg-white/15'
        }
      `}
    >
      {/* Completion indicator */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      
      {/* Current indicator */}
      {isCurrent && !isCompleted && (
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center animate-pulse"
          style={{ backgroundColor: themeColor }}
        >
          <span className="text-white text-xs">→</span>
        </div>
      )}

      {/* Milestone content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">
            {milestone.progress_required}
          </span>
          {isCompleted && (
            <div className="text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-1">
            {milestone.name[language] || milestone.name.es}
          </h4>
          <p className="text-white/70 text-sm">
            {milestone.description[language] || milestone.description.es}
          </p>
        </div>
        
        {/* Rewards */}
        <div className="space-y-1">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
            Recompensas:
          </p>
          {milestone.rewards.map((reward: any) => (
            <div key={reward.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{reward.icon}</span>
              <span className="text-white/80">
                {reward.amount && `${reward.amount} `}
                {reward.name[language] || reward.name.es}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Event header component
interface EventHeaderProps {
  event: EventConfiguration;
  language: string;
  onBack: () => void;
}

export function EventHeader({ event, language, onBack }: EventHeaderProps) {
  return (
    <div className="bg-black/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl md:text-4xl animate-bounce">{event.icon}</span>
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {event.name[language] || event.name.es}
              </span>
            </h1>
            <p className="text-white/70 mt-1 text-sm md:text-base">
              {event.description[language] || event.description.es}
            </p>
          </div>
          
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>
    </div>
  );
}
