import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Settings2,
  Share2,
  Activity,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Clock,
  Sparkles,
  Bot,
} from 'lucide-react';
import { AppServerStatus } from '../types/index';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: AppServerStatus | null;
  onToggleEmergencyPause: () => void;
  loadingPause: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  status,
  onToggleEmergencyPause,
  loadingPause,
}) => {
  const isPaused = status?.globalPaused;
  const isAuto = status?.autoPublishEnabled;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Operational Bar */}
        <div className="flex items-center justify-between h-16 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-white">
                  Garage Door AI Marketing Autopilot
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  B2B DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous 7-Slide LinkedIn & Instagram Campaigns for US Garage Door Contractors
              </p>
            </div>
          </div>

          {/* Real-time Status Badges & Controls */}
          <div className="flex items-center gap-3">
            {/* Timezone Indicator */}
            {status && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{status.currentTzTime || '12:00'}</span>
                <span className="text-slate-500 text-[10px]">({status.timezone})</span>
              </div>
            )}

            {/* Quota Usage Counter */}
            {status && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">LI:</span>
                  <span className="text-blue-400 font-bold">{status.todayPostsCount?.linkedin ?? 0}/4</span>
                </div>
                <div className="w-px h-3 bg-slate-700" />
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400">IG:</span>
                  <span className="text-pink-400 font-bold">{status.todayPostsCount?.instagram ?? 0}/4</span>
                </div>
              </div>
            )}

            {/* Autopilot Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isPaused
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : isAuto
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPaused ? 'bg-red-500 animate-pulse' : isAuto ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span className="hidden sm:inline">
                {isPaused ? 'AUTOPILOT PAUSED' : isAuto ? 'AUTO-PUBLISHING ON' : 'DRAFT MODE (4/DAY)'}
              </span>
            </div>

            {/* Emergency Pause Button */}
            <button
              onClick={onToggleEmergencyPause}
              disabled={loadingPause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-200'
              }`}
              title={isPaused ? 'Resume scheduled publishing' : 'Emergency kill switch for all auto-publishing'}
            >
              {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume Autopilot' : 'Emergency Pause'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {[
            { id: 'cockpit', label: 'Cockpit & Queue', icon: LayoutDashboard },
            { id: 'campaigns', label: '7-Slide Studio', icon: Layers },
            { id: 'calendar', label: 'Calendar & Slots', icon: Calendar },
            { id: 'strategy', label: 'Marketing Strategy', icon: Settings2 },
            { id: 'integrations', label: 'LinkedIn & Instagram', icon: Share2 },
            { id: 'quotas', label: 'Quotas & Logs', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
