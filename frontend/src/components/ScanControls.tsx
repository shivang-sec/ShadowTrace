import React, { useState } from 'react';
import { Target, Play, Loader2, AlertCircle, Zap, Layers, SearchCode, Shield } from 'lucide-react';
import { ScanProfile } from '../types/scan';

interface ScanControlsProps {
  onStartScan: (target: string, profile: ScanProfile) => void;
  isScanning: boolean;
  scanStage: string | null;
  errorMessage: string | null;
  onClearError: () => void;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  onStartScan,
  isScanning,
  scanStage,
  errorMessage,
  onClearError,
}) => {
  const [target, setTarget] = useState('127.0.0.1');
  const [profile, setProfile] = useState<ScanProfile>('standard');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClearError();
    const cleanTarget = target.trim();

    if (!cleanTarget) {
      setValidationError('Target IP address, hostname, or CIDR network is required.');
      return;
    }

    const forbidden = /[;&|`$><!]/;
    if (forbidden.test(cleanTarget)) {
      setValidationError('Disallowed characters detected in target input.');
      return;
    }

    setValidationError(null);
    onStartScan(cleanTarget, profile);
  };

  const profiles: {
    id: ScanProfile;
    name: string;
    flags: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'quick',
      name: 'Quick',
      flags: '-sS --open -T4',
      description: 'SYN discovery across common open ports',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      id: 'standard',
      name: 'Standard',
      flags: '-sS -sV --open -T4',
      description: 'SYN scan with software banner probing',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'deep',
      name: 'Deep',
      flags: '-sS -sV --version-all --open -T4',
      description: 'Exhaustive version probing for CVE correlation',
      icon: <SearchCode className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main form grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Target Input Section */}
          <div className="lg:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="target-input" className="block text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                TARGET / NETWORK
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                IP &bull; Hostname &bull; CIDR
              </span>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Target className="w-4 h-4" />
              </div>
              <input
                id="target-input"
                type="text"
                disabled={isScanning}
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="192.168.1.0/24"
                className="w-full pl-10 pr-4 py-2.5 bg-soc-surface border border-soc-border focus:border-cyan-500 rounded-lg text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
              />
            </div>
          </div>

          {/* Profile Selector */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              SCAN PROFILE
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-soc-surface border border-soc-border rounded-lg">
              {profiles.map((p) => {
                const isSelected = profile === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isScanning}
                    onClick={() => setProfile(p.id)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-mono transition-all disabled:opacity-60 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glowSm font-bold'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {p.icon}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Assessment Action */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={isScanning}
              className={`w-full h-[42px] flex items-center justify-center gap-2 px-5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-glow ${
                isScanning
                  ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-300 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold border border-cyan-300/40 hover:shadow-glow'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span className="truncate">{scanStage ? scanStage.toUpperCase() : 'SCANNING...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START ASSESSMENT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected profile Nmap argument details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2.5 border-t border-soc-borderDark text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Nmap Arguments:</span>
            <code className="text-cyan-300 bg-soc-surface px-1.5 py-0.5 rounded border border-slate-800">
              {profiles.find((p) => p.id === profile)?.flags}
            </code>
            <span className="text-slate-500 hidden sm:inline">&bull;</span>
            <span className="text-slate-300 hidden sm:inline">
              {profiles.find((p) => p.id === profile)?.description}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Shield className="w-3 h-3 text-cyan-500" />
            <span>Authorized Security Assessment Only</span>
          </div>
        </div>

        {/* Error Feedback */}
        {(validationError || errorMessage) && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-mono">
              <span className="font-bold text-red-300">Action Required: </span>
              {validationError || errorMessage}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
