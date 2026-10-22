import React, { useState } from 'react';
import { Sparkles, X, Bot, Layers, Clock, DollarSign, Calculator, Moon, TrendingUp } from 'lucide-react';
import { ContentPillarId, SlideTheme, ContentPillar, BuyingMotivation, CtaType } from '../types/index';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    pillarId: ContentPillarId;
    buyingMotivation?: BuyingMotivation;
    ctaType?: CtaType;
    customTopic?: string;
    theme: SlideTheme;
    targetSlot: string;
  }) => Promise<void>;
  pillars: ContentPillar[];
  dailySlots: string[];
  loading: boolean;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  pillars,
  dailySlots,
  loading,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<ContentPillarId>('missed-calls');
  const [buyingMotivation, setBuyingMotivation] = useState<BuyingMotivation>('make_money');
  const [ctaType, setCtaType] = useState<CtaType>('calculator');
  const [customTopic, setCustomTopic] = useState('');
  const [theme, setTheme] = useState<SlideTheme>('garage-amber');
  const [targetSlot, setTargetSlot] = useState(dailySlots[0] || '08:15');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      pillarId: selectedPillar,
      buyingMotivation,
      ctaType,
      customTopic: customTopic.trim() || undefined,
      theme,
      targetSlot,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate 7-Slide Contractor Campaign</h3>
              <p className="text-xs text-slate-400">Focus on garage door operations, revenue & owner freedom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Buying Motivation Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Primary Buying Motivation (Contractor Psychology)
            </label>
            <select
              value={buyingMotivation}
              onChange={(e) => setBuyingMotivation(e.target.value as BuyingMotivation)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="make_money">1. Make More Money (Missed repair jobs, trapped cars)</option>
              <option value="reduce_pain">2. Reduce Pain & Frustration (11 PM calls, Sunday dinner interrupted)</option>
              <option value="gain_time">3. Gain Time & Personal Freedom ("If you got 2 hours a day back...")</option>
              <option value="reduce_waste">4. Reduce Operating Costs & Waste ($65 Google LSA clicks missed)</option>
            </select>
          </div>

          {/* CTA Type Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Call to Action (Slide 7)</label>
              {ctaType === 'calculator' && (
                <span className="text-[10px] font-mono font-bold text-amber-400">REQUIRED 2x / DAY</span>
              )}
            </div>
            <select
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value as CtaType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="calculator">1. Calculator CTA (https://garage-door-lost-revenue-caculator.vercel.app/)</option>
              <option value="dm_calculator">2. DM CTA ("DM me CALCULATOR and I’ll send you the free calculator")</option>
              <option value="demo_cta">3. Demo CTA ("Go to the link in my bio and call the demo yourself")</option>
              <option value="dm_conversation">4. Conversation CTA ("Interested in handling missed calls? DM me and let’s talk")</option>
            </select>
            {ctaType === 'calculator' && (
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                Exact URL: https://garage-door-lost-revenue-caculator.vercel.app/ (Mandatory 2x / day)
              </div>
            )}
            {ctaType === 'dm_calculator' && (
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 font-sans">
                Prompt: "DM me CALCULATOR and I’ll send you the free garage door revenue-loss calculator."
              </div>
            )}
            {ctaType === 'demo_cta' && (
              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-[11px] text-blue-300 font-sans">
                Prompt: "Want to hear how an AI voice agent handles garage door calls? Go to the link in my bio and call the demo yourself."
              </div>
            )}
            {ctaType === 'dm_conversation' && (
              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-300 font-sans">
                Prompt: "Interested in handling more missed calls? DM me and let’s talk."
              </div>
            )}
          </div>

          {/* Content Pillar Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Marketing Angle</label>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value as ContentPillarId)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.shortLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Specific Trade Scenario Angle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Specific Trade Scene / Character (Optional)</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Dave holding winding bars on a 10ft ladder when phone rings"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[10px] text-slate-400 block">
              Leave blank to use the motivation's authentic default contractor scenario.
            </span>
          </div>

          {/* Theme & Slot Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Slide Visual Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as SlideTheme)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="garage-amber">High-Visibility Garage Amber</option>
                <option value="modern-navy">Modern Tech Navy</option>
                <option value="precision-blueprint">Precision Blueprint</option>
                <option value="emerald-minimal">Clean Emerald Minimal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Scheduled Target Slot</label>
              <select
                value={targetSlot}
                onChange={(e) => setTargetSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              >
                {dailySlots.map((slot, i) => (
                  <option key={i} value={slot}>
                    Slot 0{i + 1} ({slot})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Writing 7 Slides...' : 'Generate 7 Slides'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
