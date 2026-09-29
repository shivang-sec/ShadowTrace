import React, { useState } from 'react';
import { Target, Play, Loader2, AlertCircle, Info } from 'lucide-react';
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
      setValidationError('Target IP address, hostname, or network range is required.');
      return;
    }

    const forbidden = /[;&|`$><!]/;
    if (forbidden.test(cleanTarget)) {
      setValidationError('Target contains illegal shell characters (;&|`$><!).');
      return;
    }

    setValidationError(null);
    onStartScan(cleanTarget, profile);
  };

  const profiles: { id: ScanProfile; name: string; flags: string; desc: string }[] = [
    {
      id: 'quick',
      name: 'Quick',
      flags: '-sS --open -T4',
      desc: 'Rapid SYN port discovery without banner probing',
    },
    {
      id: 'standard',
      name: 'Standard',
      flags: '-sS -sV --open -T4',
      desc: 'SYN scan with software version fingerprinting',
    },
    {
      id: 'deep',
      name: 'Deep',
      flags: '-sS -sV --version-all --open -T4',
      desc: 'Exhaustive version detection for thorough CVE correlation',
    },
  ];

  return (
    <div className="rounded-xl border border-soc-border bg-soc-panel/95 p-5 shadow-soc mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
          {/* Target Input */}
          <div className="flex-1 space-y-1.5">
            <label htmlFor="target-input" className="block text-xs font-mono font-medium text-slate-300">
              TARGET SPECIFICATION
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Target className="w-4 h-4 text-cyan-400" />
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
                placeholder="e.g. 192.168.1.1 or 10.0.0.0/24 or target.corp"
                className="w-full pl-9 pr-3 py-2 bg-soc-surface border border-slate-700/80 rounded-lg text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Scan Profiles */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-300">
              SCAN PROFILE
            </label>
            <div className="inline-flex rounded-lg border border-slate-700/80 bg-soc-surface p-1">
              {profiles.map((p) => {
                const isSelected = profile === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isScanning}
                    onClick={() => setProfile(p.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all disabled:opacity-60 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`${p.name} profile (${p.flags}): ${p.desc}`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Assessment Button */}
          <div>
            <button
              type="submit"
              disabled={isScanning}
              className={`w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all shadow-md ${
                isScanning
                  ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-400 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30'
              }`}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{scanStage ? `Scanning (${scanStage})...` : 'Executing Nmap...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected profile helper note */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            Profile flags: <code className="text-cyan-300">{profiles.find((p) => p.id === profile)?.flags}</code>
            {' — '}{profiles.find((p) => p.id === profile)?.desc}.
            <span className="text-slate-500 ml-1">Requires authorized permission on target.</span>
          </span>
        </div>

        {/* Validation or API error alert */}
        {(validationError || errorMessage) && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-mono">
              <span className="font-semibold text-red-200">Assessment Error: </span>
              {validationError || errorMessage}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
