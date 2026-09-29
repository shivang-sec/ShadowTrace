import React from 'react';
import { Shield, Activity, History, Wifi, WifiOff } from 'lucide-react';
import { HealthStatus } from '../types/api';

interface HeaderProps {
  health: HealthStatus | null;
  isHealthLoading: boolean;
  onRefreshHealth: () => void;
  onToggleHistory: () => void;
  historyCount: number;
  isScanning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  isHealthLoading,
  onRefreshHealth,
  onToggleHistory,
  historyCount,
  isScanning,
}) => {
  const isOnline = !!health && health.status === 'ok';

  return (
    <header className="border-b border-soc-border bg-soc-panel/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-soc-surface to-soc-panel border border-cyan-500/40 flex items-center justify-center text-soc-cyan shadow-glowSm">
              <Shield className="w-5 h-5 text-cyan-400 stroke-[2.2]" />
            </div>
            {isScanning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-widest text-slate-100 font-mono">
                SHADOWTRACE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-bold uppercase tracking-wider">
                CORE SOC v1.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>Network Exposure Intelligence Engine</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-500">Local-first Assessment</span>
            </p>
          </div>
        </div>

        {/* Operational Telemetry & Navigation */}
        <div className="flex items-center gap-3">
          {/* Active assessment indicator */}
          {isScanning && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-xs font-mono text-cyan-300 animate-pulse">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>SCAN RUNNING</span>
            </div>
          )}

          {/* Assessment Archive Toggle */}
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-soc-border hover:border-cyan-500/40 bg-soc-surface hover:bg-soc-surfaceHover text-slate-200 hover:text-white text-xs font-mono transition-all group"
            title="Open past assessment records"
          >
            <History className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold hidden md:inline">Archives</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-soc-panel border border-slate-700 text-cyan-300 font-bold text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          {/* Engine Health Heartbeat */}
          <button
            onClick={onRefreshHealth}
            disabled={isHealthLoading}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isOnline
                ? 'border-emerald-500/30 bg-soc-surface hover:bg-soc-surfaceHover text-slate-200'
                : 'border-red-500/40 bg-red-950/20 text-red-300'
            }`}
            title={isOnline ? 'FastAPI Backend Online — Click to re-ping' : 'Engine Disconnected — Click to retry connection'}
          >
            <div className="relative flex items-center justify-center">
              {isOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 hidden lg:inline">Backend:</span>
              <span className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                {isHealthLoading ? 'Pinging...' : isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-400 opacity-70 ml-0.5" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400 opacity-70 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
