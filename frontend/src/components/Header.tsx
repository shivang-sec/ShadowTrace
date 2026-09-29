import React from 'react';
import { Shield, Activity, History } from 'lucide-react';
import { HealthStatus } from '../types/api';

interface HeaderProps {
  health: HealthStatus | null;
  isHealthLoading: boolean;
  onRefreshHealth: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  isHealthLoading,
  onRefreshHealth,
  onToggleHistory,
  historyCount,
}) => {
  const isOnline = !!health && health.status === 'ok';

  return (
    <header className="border-b border-soc-borderDark bg-soc-panel/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-soc-surface border border-cyan-500/30 flex items-center justify-center text-soc-cyan glow-cyan">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-slate-100 uppercase font-mono">
                ShadowTrace
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/40 text-cyan-400">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-tight">
              Network Exposure Intelligence Engine
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* History Button */}
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700/60 bg-soc-surface hover:bg-soc-hover text-slate-300 hover:text-white text-xs font-mono transition-colors"
            title="Toggle Scan History"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-cyan-300 font-bold border border-slate-700">
                {historyCount}
              </span>
            )}
          </button>

          {/* Backend Health Status */}
          <div
            onClick={onRefreshHealth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800/80 bg-soc-surface text-xs font-mono cursor-pointer hover:border-slate-700 transition-colors"
            title="Click to re-check backend connection"
          >
            <div className="relative flex items-center justify-center">
              {isOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 hidden sm:inline">Engine:</span>
              <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {isHealthLoading ? 'Checking...' : isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <Activity className={`w-3.5 h-3.5 text-slate-500 ml-1 ${isHealthLoading ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </div>
    </header>
  );
};
