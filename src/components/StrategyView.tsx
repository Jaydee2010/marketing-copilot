import React, { useState } from 'react';
import {
  Settings2,
  Save,
  RefreshCw,
  PhoneCall,
  ShieldAlert,
  Layers,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { MarketingStrategy, ContentPillar } from '../types/index';

interface StrategyViewProps {
  strategy: MarketingStrategy | null;
  onUpdateStrategy: (strategy: MarketingStrategy) => Promise<void>;
  loading: boolean;
}

export const StrategyView: React.FC<StrategyViewProps> = ({
  strategy,
  onUpdateStrategy,
  loading,
}) => {
  const [localStrategy, setLocalStrategy] = useState<MarketingStrategy | null>(strategy);
  const [saving, setSaving] = useState(false);
  const [newBannedClaim, setNewBannedClaim] = useState('');

  React.useEffect(() => {
    setLocalStrategy(strategy);
  }, [strategy]);

  if (!localStrategy) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdateStrategy(localStrategy);
    } finally {
      setSaving(false);
    }
  };

  const handlePillarChange = (index: number, field: keyof ContentPillar, val: string) => {
    const updated = [...localStrategy.customPillars];
    updated[index] = { ...updated[index], [field]: val };
    setLocalStrategy({ ...localStrategy, customPillars: updated });
  };

  const addBannedClaim = () => {
    if (!newBannedClaim.trim()) return;
    setLocalStrategy({
      ...localStrategy,
      bannedClaims: [...localStrategy.bannedClaims, newBannedClaim.trim()],
    });
    setNewBannedClaim('');
  };

  const removeBannedClaim = (idx: number) => {
    setLocalStrategy({
      ...localStrategy,
      bannedClaims: localStrategy.bannedClaims.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Save Toolbar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <span>US Garage Door Marketing Strategy & Positioning</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Persisted in server database. Guides every Gemini campaign generation to use authentic garage door contractor terminology and honest metrics.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Strategy</span>
        </button>
      </div>

      {/* Brand & Service Fundamentals */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
          1. Brand & Value Proposition
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Voice AI Business Name</label>
            <input
              type="text"
              value={localStrategy.businessName}
              onChange={(e) => setLocalStrategy({ ...localStrategy, businessName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Brand Tagline</label>
            <input
              type="text"
              value={localStrategy.brandTagline}
              onChange={(e) => setLocalStrategy({ ...localStrategy, brandTagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Live Demo Phone Number</label>
            <input
              type="text"
              value={localStrategy.demoPhoneNumber}
              onChange={(e) => setLocalStrategy({ ...localStrategy, demoPhoneNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-xs font-semibold text-slate-300">
              Required Revenue-Loss Calculator URL (Used in at least 2 daily posts)
            </label>
            <input
              type="text"
              value={localStrategy.calculatorUrl || 'https://garage-door-lost-revenue-caculator.vercel.app/'}
              onChange={(e) => setLocalStrategy({ ...localStrategy, calculatorUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 font-mono">
              Rendered on Slide 7 and injected into captions for high-converting lead capture.
            </span>
          </div>
        </div>

        {/* 4 Buying Motivations Info */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-white block">
            The 4 Buying Motivations (Applied to Every Campaign):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs text-slate-400">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">1. Make More Money</span>
              <p className="text-[11px]">Unanswered emergency calls losing $280 - $600 repairs to competitors.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-blue-400 block mb-1">2. Reduce Pain</span>
              <p className="text-[11px]">11 PM calls, Sunday dinner interruptions, tech phone burnout.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">3. Gain Time</span>
              <p className="text-[11px]">"If you got two hours a day back, what would you do with them?"</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">4. Reduce Waste</span>
              <p className="text-[11px]">Paying $65+ for Google LSA leads that ring through to voicemail.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Audience Description</label>
            <textarea
              rows={2}
              value={localStrategy.targetAudience}
              onChange={(e) => setLocalStrategy({ ...localStrategy, targetAudience: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Core Value Proposition</label>
            <textarea
              rows={2}
              value={localStrategy.coreService}
              onChange={(e) => setLocalStrategy({ ...localStrategy, coreService: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* The 7 Content Pillars */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>2. The 7 Marketing Content Pillars</span>
          </h4>
          <span className="text-xs font-mono text-slate-400">7 Core Themes</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {localStrategy.customPillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                    0{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                    className="font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Short Badge:</span>
                  <input
                    type="text"
                    value={pillar.shortLabel}
                    onChange={(e) => handlePillarChange(idx, 'shortLabel', e.target.value)}
                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-amber-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Problem / Topic Description</label>
                  <textarea
                    rows={2}
                    value={pillar.description}
                    onChange={(e) => handlePillarChange(idx, 'description', e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Default Marketing Angle & Hook</label>
                  <textarea
                    rows={2}
                    value={pillar.defaultAngle}
                    onChange={(e) => handlePillarChange(idx, 'defaultAngle', e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strict Banned Claims & Safety Guardrails */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>3. Content Guardrails & Banned AI Hype</span>
        </h4>
        <p className="text-xs text-slate-400">
          The Gemini generator strictly avoids these phrases and hyperbolic tropes, maintaining credible B2B tone.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newBannedClaim}
            onChange={(e) => setNewBannedClaim(e.target.value)}
            placeholder="Add new banned claim or phrase..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
          />
          <button
            onClick={addBannedClaim}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {localStrategy.bannedClaims.map((claim, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/40 flex items-center justify-between text-xs text-red-200"
            >
              <span>{claim}</span>
              <button
                onClick={() => removeBannedClaim(idx)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
