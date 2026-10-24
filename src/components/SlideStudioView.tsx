import React, { useState } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Send,
  Save,
  RefreshCw,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Maximize2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { Campaign, Slide, SlideFormat, SlideTheme, SlideLayoutType } from '../types/index';
import { SlideCanvasPreview } from './SlideCanvasPreview';

interface SlideStudioViewProps {
  campaign: Campaign | null;
  allCampaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
  onUpdateCampaign: (campaign: Campaign) => Promise<void>;
  onRenderCampaign: (id: string, format: SlideFormat) => Promise<void>;
  onPublishCampaign: (id: string, platform: 'linkedin' | 'instagram' | 'both') => Promise<void>;
  loading: boolean;
}

export const SlideStudioView: React.FC<SlideStudioViewProps> = ({
  campaign,
  allCampaigns,
  onSelectCampaign,
  onUpdateCampaign,
  onRenderCampaign,
  onPublishCampaign,
  loading,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [previewFormat, setPreviewFormat] = useState<SlideFormat>('portrait_4_5');
  const [activePlatformTab, setActivePlatformTab] = useState<'linkedin' | 'instagram'>('linkedin');
  const [saving, setSaving] = useState(false);
  const [localCampaign, setLocalCampaign] = useState<Campaign | null>(campaign);

  // Sync state when campaign changes
  React.useEffect(() => {
    setLocalCampaign(campaign);
    setActiveSlideIndex(0);
  }, [campaign]);

  if (!localCampaign) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
        <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No Campaign Selected</h3>
        <p className="text-sm text-slate-400 mt-1 mb-4">Select a campaign from the dropdown or generate a new one.</p>
        {allCampaigns.length > 0 && (
          <button
            onClick={() => onSelectCampaign(allCampaigns[0].id)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Open First Campaign
          </button>
        )}
      </div>
    );
  }

  const currentSlide: Slide = localCampaign.slides[activeSlideIndex] || localCampaign.slides[0];

  const handleSlideChange = (field: keyof Slide, val: any) => {
    const updatedSlides = [...localCampaign.slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      [field]: val,
    };
    setLocalCampaign({
      ...localCampaign,
      slides: updatedSlides,
    });
  };

  const handleMetricChange = (field: 'value' | 'label', val: string) => {
    const updatedSlides = [...localCampaign.slides];
    const existingMetric = updatedSlides[activeSlideIndex].highlightMetric || { value: '', label: '' };
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      highlightMetric: {
        ...existingMetric,
        [field]: val,
      },
    };
    setLocalCampaign({
      ...localCampaign,
      slides: updatedSlides,
    });
  };

  const handleBulletChange = (idx: number, text: string) => {
    const bullets = [...(currentSlide.bulletPoints || [])];
    bullets[idx] = text;
    handleSlideChange('bulletPoints', bullets);
  };

  const addBullet = () => {
    const bullets = [...(currentSlide.bulletPoints || []), 'New key point'];
    handleSlideChange('bulletPoints', bullets);
  };

  const removeBullet = (idx: number) => {
    const bullets = (currentSlide.bulletPoints || []).filter((_, i) => i !== idx);
    handleSlideChange('bulletPoints', bullets);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdateCampaign(localCampaign);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: SlideTheme) => {
    setLocalCampaign({
      ...localCampaign,
      theme,
    });
  };

  const slideTypeLabels: Record<SlideLayoutType, string> = {
    hook_title: '01 Hook & Title',
    problem_stat: '02 Lost Revenue Math',
    breakdown_list: '03 Root Cause Breakdown',
    call_flow: '04 Dispatch Workflow',
    solution_feature: '05 AI Solution Feature',
    metrics_grid: '06 Contractor Checklist',
    cta_action: '07 Live Demo Call Line',
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Campaign Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-400 shrink-0">Campaign:</label>
          <select
            value={localCampaign.id}
            onChange={(e) => onSelectCampaign(e.target.value)}
            className="w-full md:w-80 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
          >
            {allCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.scheduledTime})
              </option>
            ))}
          </select>
        </div>

        {/* Global Slide Actions */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Format Toggle */}
          <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
              onClick={() => setPreviewFormat('portrait_4_5')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewFormat === 'portrait_4_5'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              4:5 Portrait
            </button>
            <button
              onClick={() => setPreviewFormat('square_1_1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewFormat === 'square_1_1'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1 Square
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Theme:</span>
            {(['garage-amber', 'precision-blueprint', 'midnight-crimson', 'modern-navy', 'emerald-minimal', 'industrial-copper'] as SlideTheme[]).map((th) => (
              <button
                key={th}
                onClick={() => handleThemeChange(th)}
                className={`w-4 h-4 rounded-full border transition-all ${
                  localCampaign.theme === th ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                } ${
                  th === 'garage-amber'
                    ? 'bg-amber-500 border-amber-400'
                    : th === 'precision-blueprint'
                    ? 'bg-sky-400 border-sky-300'
                    : th === 'midnight-crimson'
                    ? 'bg-red-600 border-red-400'
                    : th === 'modern-navy'
                    ? 'bg-blue-600 border-blue-400'
                    : th === 'emerald-minimal'
                    ? 'bg-emerald-500 border-emerald-400'
                    : 'bg-orange-500 border-orange-400'
                }`}
                title={th}
              />
            ))}
          </div>

          {/* Render PNGs */}
          <button
            onClick={() => onRenderCampaign(localCampaign.id, previewFormat)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Render PNGs</span>
          </button>

          {/* Download ZIP */}
          <a
            href={`/api/campaigns/${localCampaign.id}/download-zip`}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download ZIP</span>
          </a>

          {/* Save Changes */}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Tabs (1 to 7) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {localCampaign.slides.map((s, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <button
              key={idx}
              onClick={() => setActiveSlideIndex(idx)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                0{s.slideNumber}
              </span>
              <span className="truncate max-w-[130px]">{s.supportingLabel || `Slide ${s.slideNumber}`}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid: Left Carousel Preview, Right Slide Field Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive 7-Slide Canvas Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <SlideCanvasPreview
              slide={currentSlide}
              theme={localCampaign.theme}
              format={previewFormat}
            />

            {/* Prev / Next Slide Overlays */}
            <button
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSlideIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveSlideIndex((prev) => Math.min(6, prev + 1))}
              disabled={activeSlideIndex === 6}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Slide Pager Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Slide {activeSlideIndex + 1} of 7</span>
            <div className="flex items-center gap-1">
              {localCampaign.slides.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setActiveSlideIndex(i)}
                  className={`cursor-pointer rounded-full transition-all ${
                    i === activeSlideIndex ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-amber-400">
              {slideTypeLabels[currentSlide.layoutType] || 'Standard'}
            </span>
          </div>
        </div>

        {/* Right Column: Slide Editor & Platform Captions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Individual Slide Field Editor */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Slide 0{currentSlide.slideNumber} Content Controls</span>
                {localCampaign.buyingMotivation && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                    {localCampaign.buyingMotivation.replace('_', ' ')}
                  </span>
                )}
              </h4>
              <span className="text-xs font-mono text-slate-400">
                Pillar: {localCampaign.pillarId}
              </span>
            </div>

            {currentSlide.slideNumber === 7 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Slide 7 Assigned Call to Action (CTA)</span>
                  </span>
                  {localCampaign.ctaType === 'calculator' && (
                    <a
                      href="https://garage-door-lost-revenue-caculator.vercel.app/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Open Calculator</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">CTA Strategy Type</label>
                  <select
                    value={localCampaign.ctaType || 'calculator'}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      let newHeadline = currentSlide.headline;
                      let newBody = currentSlide.bodyText;
                      let newMetric = currentSlide.highlightMetric;
                      let newUrl: string | undefined = undefined;

                      if (newType === 'calculator') {
                        newHeadline = 'How Much Revenue Could Missed Calls Be Costing You?';
                        newBody = 'Stop guessing. Plug your own numbers into the garage door revenue-loss calculator: https://garage-door-lost-revenue-caculator.vercel.app/';
                        newMetric = { value: 'RUN YOUR NUMBERS', label: 'https://garage-door-lost-revenue-caculator.vercel.app/' };
                        newUrl = 'https://garage-door-lost-revenue-caculator.vercel.app/';
                      } else if (newType === 'dm_calculator') {
                        newHeadline = 'Get The Free Garage Door Revenue-Loss Calculator';
                        newBody = 'DM me CALCULATOR and I’ll send you the free garage door revenue-loss calculator.';
                        newMetric = { value: 'DM "CALCULATOR"', label: 'Direct Message For Free Estimator' };
                      } else if (newType === 'demo_cta' || newType === 'demo_call') {
                        newHeadline = 'Hear How An AI Voice Agent Handles Calls';
                        newBody = 'Want to hear how an AI voice agent handles garage door calls? Go to the link in my bio and call the demo yourself.';
                        newMetric = { value: 'TRY THE DEMO', label: 'Call 24/7 Agent in Bio Link' };
                      } else {
                        newHeadline = 'Ready to Stop Missing High-Margin Repair Jobs?';
                        newBody = 'Interested in handling more missed calls? DM me and let’s talk.';
                        newMetric = { value: 'LET’S TALK', label: 'DM Me Directly To Discuss' };
                      }

                      const updatedSlides = [...localCampaign.slides];
                      updatedSlides[6] = {
                        ...updatedSlides[6],
                        headline: newHeadline,
                        bodyText: newBody,
                        highlightMetric: newMetric,
                        ctaUrl: newUrl,
                      };

                      setLocalCampaign({
                        ...localCampaign,
                        ctaType: newType,
                        slides: updatedSlides,
                      });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="calculator">1. Calculator CTA (Direct URL)</option>
                    <option value="dm_calculator">2. DM CTA ("DM me CALCULATOR")</option>
                    <option value="demo_cta">3. Demo Voice Agent CTA ("Call demo in bio")</option>
                    <option value="dm_conversation">4. Conversation CTA ("DM me and let's talk")</option>
                  </select>
                </div>

                {localCampaign.ctaType === 'calculator' && (
                  <div className="text-[11px] font-mono text-emerald-300 break-all p-2 rounded bg-emerald-950/20 border border-emerald-500/30">
                    URL: https://garage-door-lost-revenue-caculator.vercel.app/
                  </div>
                )}
                {localCampaign.ctaType === 'dm_calculator' && (
                  <div className="text-[11px] text-amber-300 p-2 rounded bg-amber-950/20 border border-amber-500/30">
                    Prompt: "DM me CALCULATOR and I’ll send you the free garage door revenue-loss calculator."
                  </div>
                )}
                {(localCampaign.ctaType === 'demo_cta' || localCampaign.ctaType === 'demo_call') && (
                  <div className="text-[11px] text-blue-300 p-2 rounded bg-blue-950/20 border border-blue-500/30">
                    Prompt: "Want to hear how an AI voice agent handles garage door calls? Go to the link in my bio and call the demo yourself."
                  </div>
                )}
                {localCampaign.ctaType === 'dm_conversation' && (
                  <div className="text-[11px] text-purple-300 p-2 rounded bg-purple-950/20 border border-purple-500/30">
                    Prompt: "Interested in handling more missed calls? DM me and let’s talk."
                  </div>
                )}
              </div>
            )}

            {/* Supporting Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Supporting Badge Label</label>
              <input
                type="text"
                value={currentSlide.supportingLabel || ''}
                onChange={(e) => handleSlideChange('supportingLabel', e.target.value)}
                placeholder="e.g. SCENE 01 // THE HOOK"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Slide Headline</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(currentSlide.headline || '').length} characters
                </span>
              </div>
              <input
                type="text"
                value={currentSlide.headline || ''}
                onChange={(e) => handleSlideChange('headline', e.target.value)}
                placeholder="Hook or main concept"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Body Text */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Body Copy / Subtitle</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(currentSlide.bodyText || '').length} characters
                </span>
              </div>
              <textarea
                rows={2}
                value={currentSlide.bodyText || ''}
                onChange={(e) => handleSlideChange('bodyText', e.target.value)}
                placeholder="Explain the trade reality or customer impact..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Highlight Metric Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Metric Value</label>
                <input
                  type="text"
                  value={currentSlide.highlightMetric?.value || ''}
                  onChange={(e) => handleMetricChange('value', e.target.value)}
                  placeholder="e.g. 74% or (844) 385-DOOR"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Metric Label</label>
                <input
                  type="text"
                  value={currentSlide.highlightMetric?.label || ''}
                  onChange={(e) => handleMetricChange('label', e.target.value)}
                  placeholder="e.g. Hang up on voicemail"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Bullet Points / Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Key Points / Steps</label>
                <button
                  onClick={addBullet}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Point</span>
                </button>
              </div>

              <div className="space-y-2">
                {(currentSlide.bulletPoints || []).map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => handleBulletChange(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => removeBullet(i)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Adaptations: LinkedIn vs Instagram Copy */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePlatformTab('linkedin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlatformTab === 'linkedin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  LinkedIn Post
                </button>
                <button
                  onClick={() => setActivePlatformTab('instagram')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlatformTab === 'instagram'
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Instagram Post
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPublishCampaign(localCampaign.id, activePlatformTab)}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to {activePlatformTab === 'linkedin' ? 'LinkedIn' : 'Instagram'}</span>
                </button>
              </div>
            </div>

            {/* LinkedIn Tab Content */}
            {activePlatformTab === 'linkedin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">LinkedIn Caption</span>
                  <span className="font-mono">{localCampaign.platforms.linkedin.caption.length} chars</span>
                </div>
                <textarea
                  rows={6}
                  value={localCampaign.platforms.linkedin.caption}
                  onChange={(e) => {
                    const updated = { ...localCampaign };
                    updated.platforms.linkedin.caption = e.target.value;
                    setLocalCampaign(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">LinkedIn Hashtags (Space separated)</label>
                  <input
                    type="text"
                    value={localCampaign.platforms.linkedin.hashtags.join(' ')}
                    onChange={(e) => {
                      const updated = { ...localCampaign };
                      updated.platforms.linkedin.hashtags = e.target.value.split(' ').filter(Boolean);
                      setLocalCampaign(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {localCampaign.platforms.linkedin.externalPostUrl && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between text-xs">
                    <span className="text-blue-300 font-medium">Published on LinkedIn</span>
                    <a
                      href={localCampaign.platforms.linkedin.externalPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>View Live Post</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Instagram Tab Content */}
            {activePlatformTab === 'instagram' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Instagram Caption</span>
                  <span className={`font-mono ${localCampaign.platforms.instagram.caption.length > 2200 ? 'text-red-400' : ''}`}>
                    {localCampaign.platforms.instagram.caption.length} / 2,200 chars
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={localCampaign.platforms.instagram.caption}
                  onChange={(e) => {
                    const updated = { ...localCampaign };
                    updated.platforms.instagram.caption = e.target.value;
                    setLocalCampaign(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <label className="font-semibold text-slate-300">Instagram Hashtags</label>
                    <span className="font-mono">{localCampaign.platforms.instagram.hashtags.length} / 30 tags</span>
                  </div>
                  <input
                    type="text"
                    value={localCampaign.platforms.instagram.hashtags.join(' ')}
                    onChange={(e) => {
                      const updated = { ...localCampaign };
                      updated.platforms.instagram.hashtags = e.target.value.split(' ').filter(Boolean);
                      setLocalCampaign(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-pink-400 font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                {localCampaign.platforms.instagram.lastError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-red-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Instagram Publishing Failed</span>
                    </div>
                    <p className="text-[11px] text-red-300 font-mono break-words leading-relaxed pl-5">
                      {localCampaign.platforms.instagram.lastError}
                    </p>
                    <div className="pl-5 pt-1 text-[11px] text-slate-400">
                      Verify your Instagram Business Account ID and Meta token permissions (<code className="text-pink-300">instagram_content_publish</code>) in Integrations.
                    </div>
                  </div>
                )}

                {localCampaign.platforms.instagram.externalPostUrl && (
                  <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 flex items-center justify-between text-xs">
                    <span className="text-pink-300 font-medium">Published on Instagram</span>
                    <a
                      href={localCampaign.platforms.instagram.externalPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
                    >
                      <span>View Live Carousel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
