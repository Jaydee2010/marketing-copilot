import React from 'react';
import { Slide, SlideFormat, SlideTheme } from '../types/index';
import {
  PhoneMissed,
  Clock,
  CalendarCheck,
  Bot,
  HelpCircle,
  TrendingUp,
  PhoneCall,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Settings,
  Car,
  Maximize2,
  Power,
  MapPin,
  Mic,
  Volume2,
  DollarSign,
  PhoneForwarded,
  RefreshCw,
  Moon,
  Sparkles,
} from 'lucide-react';

interface SlideCanvasPreviewProps {
  slide: Slide;
  theme: SlideTheme;
  format: SlideFormat;
  businessName?: string;
  demoPhone?: string;
}

export const SlideCanvasPreview: React.FC<SlideCanvasPreviewProps> = ({
  slide,
  theme,
  format,
  businessName = 'Stepstone AI Agency',
  demoPhone = '(844) 385-DOOR',
}) => {
  // Theme color maps
  const themeStyles = {
    'garage-amber': {
      bg: 'from-slate-950 via-slate-900 to-amber-950/30',
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      accentText: 'text-amber-400',
      accentBg: 'bg-amber-500',
      cardBg: 'bg-slate-900/80 border-slate-700/60',
      highlightBox: 'bg-amber-950/40 border-amber-500/50',
    },
    'precision-blueprint': {
      bg: 'from-slate-950 via-slate-900 to-sky-950/40',
      border: 'border-sky-500/30',
      badgeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-400',
      accentText: 'text-sky-400',
      accentBg: 'bg-sky-500',
      cardBg: 'bg-slate-900/80 border-slate-700/60',
      highlightBox: 'bg-sky-950/40 border-sky-500/50',
    },
    'emerald-minimal': {
      bg: 'from-slate-950 via-slate-900 to-emerald-950/30',
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      accentText: 'text-emerald-400',
      accentBg: 'bg-emerald-500',
      cardBg: 'bg-slate-900/80 border-slate-700/60',
      highlightBox: 'bg-emerald-950/40 border-emerald-500/50',
    },
    'modern-navy': {
      bg: 'from-slate-950 via-slate-900 to-blue-950/40',
      border: 'border-blue-500/30',
      badgeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
      accentText: 'text-blue-400',
      accentBg: 'bg-blue-500',
      cardBg: 'bg-slate-900/80 border-slate-700/60',
      highlightBox: 'bg-blue-950/40 border-blue-500/50',
      glowColor: 'bg-blue-500/10',
    },
    'midnight-crimson': {
      bg: 'from-black via-slate-950 to-red-950/40',
      border: 'border-red-500/40',
      badgeBg: 'bg-red-500/15 border-red-500/40 text-red-400',
      accentText: 'text-red-400',
      accentBg: 'bg-red-500',
      cardBg: 'bg-slate-950/80 border-red-900/40',
      highlightBox: 'bg-red-950/40 border-red-500/50',
      glowColor: 'bg-red-500/15',
    },
    'industrial-copper': {
      bg: 'from-stone-950 via-slate-950 to-orange-950/40',
      border: 'border-orange-500/40',
      badgeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
      accentText: 'text-orange-400',
      accentBg: 'bg-orange-500',
      cardBg: 'bg-stone-950/80 border-stone-800/60',
      highlightBox: 'bg-orange-950/40 border-orange-500/50',
      glowColor: 'bg-orange-500/12',
    },
  }[theme] || {
    bg: 'from-slate-950 via-slate-900 to-blue-950/40',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500',
    cardBg: 'bg-slate-900/80 border-slate-700/60',
    highlightBox: 'bg-blue-950/40 border-blue-500/50',
    glowColor: 'bg-blue-500/10',
  };

  const isPortrait = format === 'portrait_4_5';
  const isCalculatorCta =
    slide.ctaUrl?.includes('caculator') ||
    slide.bodyText?.includes('caculator') ||
    slide.headline?.toLowerCase().includes('calculator') ||
    slide.supportingLabel?.toLowerCase().includes('calculator') ||
    slide.highlightMetric?.label?.includes('caculator') ||
    slide.highlightMetric?.value?.includes('caculator');

  const isDmCalculator =
    !isCalculatorCta &&
    (slide.headline?.toLowerCase().includes('dm') ||
      slide.bodyText?.toLowerCase().includes('dm me calculator') ||
      slide.highlightMetric?.value?.toLowerCase().includes('calculator'));

  const isDemoCta =
    !isCalculatorCta &&
    !isDmCalculator &&
    (slide.bodyText?.toLowerCase().includes('bio') ||
      slide.bodyText?.toLowerCase().includes('demo') ||
      slide.headline?.toLowerCase().includes('demo') ||
      slide.highlightMetric?.value?.toLowerCase().includes('demo') ||
      slide.highlightMetric?.value?.includes('844'));

  let footerLabel = 'stepstoneai.agency';
  let buttonLabel = 'SWIPE';
  if (slide.slideNumber === 7) {
    if (isCalculatorCta) {
      footerLabel = 'Tap link in bio or DM "CALC" for direct link';
      buttonLabel = '🔗 LINK IN BIO';
    } else if (isDmCalculator) {
      footerLabel = 'DM "CALCULATOR" for the free revenue estimator';
      buttonLabel = 'DM "CALCULATOR"';
    } else if (isDemoCta) {
      footerLabel = 'Tap link in bio to test the 24/7 demo agent';
      buttonLabel = '🔗 LINK IN BIO';
    } else {
      footerLabel = 'DM me and let’s talk missed calls';
      buttonLabel = 'LET’S TALK 💬';
    }
  }

  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 ' + themeStyles.accentText };
    switch (iconName) {
      case 'phone-missed': return <PhoneMissed {...props} />;
      case 'clock': return <Clock {...props} />;
      case 'calendar-check': return <CalendarCheck {...props} />;
      case 'bot': return <Bot {...props} />;
      case 'help-circle': return <HelpCircle {...props} />;
      case 'trending-up': return <TrendingUp {...props} />;
      case 'phone-call': return <PhoneCall {...props} />;
      case 'wrench': return <Wrench {...props} />;
      case 'shield-check': return <ShieldCheck {...props} />;
      case 'check-circle-2': return <CheckCircle2 {...props} />;
      case 'alert-triangle': return <AlertTriangle {...props} />;
      case 'x-circle': return <XCircle {...props} />;
      case 'cpu': return <Cpu {...props} />;
      case 'settings': return <Settings {...props} />;
      case 'car': return <Car {...props} />;
      case 'maximize-2': return <Maximize2 {...props} />;
      case 'power': return <Power {...props} />;
      case 'map-pin': return <MapPin {...props} />;
      case 'mic': return <Mic {...props} />;
      case 'volume-2': return <Volume2 {...props} />;
      case 'dollar-sign': return <DollarSign {...props} />;
      case 'phone-forwarded': return <PhoneForwarded {...props} />;
      case 'refresh-cw': return <RefreshCw {...props} />;
      case 'moon': return <Moon {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const cleanLabel = (() => {
    const raw = (slide.supportingLabel || '').toUpperCase();
    if (raw.includes('SCENE 01') || raw.includes('HOOK')) return 'FIELD REALITY';
    if (raw.includes('SCENE 02') || raw.includes('REALITY')) return 'EMERGENCY DISPATCH';
    if (raw.includes('SCENE 03') || raw.includes('CONSEQUENCE')) return 'REVENUE LEAK';
    if (raw.includes('SCENE 04') || raw.includes('INSIGHT')) return 'CONTRACTOR MATH';
    if (raw.includes('SCENE 05') || raw.includes('PROCESS')) return 'AI CALL INTAKE';
    if (raw.includes('SCENE 06') || raw.includes('OUTCOME')) return 'OWNER FREEDOM';
    if (raw.includes('SCENE 07') || raw.includes('NEXT STEP') || raw.includes('CTA')) return 'TAKE ACTION';
    return (slide.supportingLabel || '').replace(/scene\s*\d+\s*(\/\/|:|-)\s*/gi, '').trim() || 'TRADE REALITY';
  })();

  const cleanHeadline = (slide.headline || '')
    .replace(/^(the real-life moment|the consequence|the business insight|the practical process change|the practical change|the outcome|the hook|hook|consequence):\s*/i, '')
    .trim();

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border ${themeStyles.border} bg-gradient-to-b ${themeStyles.bg} shadow-2xl transition-all duration-300 flex flex-col justify-between`}
      style={{
        aspectRatio: isPortrait ? '4 / 5' : '1 / 1',
      }}
    >
      {/* Background subtle technical grid / texture tailored per theme */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            theme === 'garage-amber'
              ? 'repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.25) 0, rgba(245, 158, 11, 0.25) 10px, transparent 0, transparent 20px)'
              : theme === 'midnight-crimson'
              ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: theme === 'garage-amber' ? '28px 28px' : '24px 24px',
        }}
      />

      {/* Decorative top ambient glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${themeStyles.glowColor || 'bg-blue-500/10'} blur-3xl pointer-events-none`} />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-slate-500/10 blur-3xl pointer-events-none" />

      {/* Slide Header */}
      <div className="relative z-10 p-6 md:p-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${themeStyles.accentBg} text-black font-extrabold flex items-center justify-center text-xs shadow-md`}>
            AI
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
              {businessName}
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wider">
              GARAGE DOOR DISPATCH AUTOMATION
            </div>
          </div>
        </div>

        {/* Slide Counter Badge */}
        <div className={`px-3 py-1 rounded-full border text-xs font-mono font-bold ${themeStyles.badgeBg}`}>
          0{slide.slideNumber} / 07
        </div>
      </div>

      {/* Slide Core Content */}
      <div className="relative z-10 px-6 md:px-8 py-4 flex-1 flex flex-col justify-center">
        {/* Supporting Label Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-[11px] font-bold tracking-wider uppercase ${themeStyles.badgeBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${themeStyles.accentBg}`} />
            {cleanLabel}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
          {cleanHeadline}
        </h2>

        {/* Subtitle / Body Copy */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4 max-w-xl">
          {slide.bodyText}
        </p>

        {/* Highlight Metric Card if available */}
        {slide.highlightMetric && (
          <div className={`mb-4 p-4 rounded-xl border ${themeStyles.highlightBox} relative overflow-hidden backdrop-blur-sm`}>
            <div className="flex items-center gap-4">
              <div className={`text-2xl md:text-3xl font-black font-mono ${themeStyles.accentText}`}>
                {slide.highlightMetric.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-slate-200">
                {slide.highlightMetric.label}
              </div>
            </div>
          </div>
        )}

        {/* Bullets / Steps / Workflow */}
        {slide.bulletPoints && slide.bulletPoints.length > 0 && (
          <div className="space-y-2 mt-1">
            {slide.bulletPoints.map((pt, i) => (
              <div
                key={i}
                className={`p-2.5 md:p-3 rounded-lg border ${themeStyles.cardBg} flex items-start gap-3 backdrop-blur-sm`}
              >
                <div className={`w-5 h-5 rounded-full ${themeStyles.badgeBg} flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5`}>
                  {i + 1}
                </div>
                <div className="text-xs md:text-sm font-medium text-slate-200">
                  {pt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide Footer */}
      <div className="relative z-10 px-6 md:px-8 py-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono text-[11px] truncate max-w-[280px]">
          {renderIcon(slide.icon)}
          <span className="text-slate-300 font-semibold truncate">
            {footerLabel}
          </span>
        </div>

        {slide.slideNumber === 7 ? (
          <div className={`px-3.5 py-1.5 rounded-full ${themeStyles.accentBg} text-black font-extrabold text-xs shadow-lg flex items-center gap-1.5 shrink-0`}>
            <span>{buttonLabel}</span>
            <span>👉</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 font-semibold text-[11px] text-slate-300 tracking-wide shrink-0">
            <span>SWIPE</span>
            <span className={themeStyles.accentText}>➡️</span>
          </div>
        )}
      </div>
    </div>
  );
};
