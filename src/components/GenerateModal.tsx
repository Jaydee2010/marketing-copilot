import React, { useState } from 'react';
import { Sparkles, X, Bot, Layers, Clock } from 'lucide-react';
import { ContentPillarId, SlideTheme, ContentPillar } from '../types/index';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    pillarId: ContentPillarId;
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
  const [customTopic, setCustomTopic] = useState('');
  const [theme, setTheme] = useState<SlideTheme>('garage-amber');
  const [targetSlot, setTargetSlot] = useState(dailySlots[0] || '08:15');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      pillarId: selectedPillar,
      customTopic: customTopic.trim() || undefined,
      theme,
      targetSlot,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate 7-Slide AI Campaign</h3>
              <p className="text-xs text-slate-400">Powered by Gemini 3.8 Flash (Server-Side)</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Content Pillar Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Marketing Content Pillar</label>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value as ContentPillarId)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.shortLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Optional Topic Customization */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Specific Angle / Scenario (Optional)</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Broken spring on Saturday morning while homeowner is trying to go to work"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-slate-400 block">
              Leave blank to use the pillar's proven default B2B contractor hook.
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
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
              <span>{loading ? 'Generating 7 Slides...' : 'Generate Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
