import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Layers,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
  Sliders,
  Send,
  ShieldCheck,
  Bot,
  Flame,
  ArrowRight,
  Calculator,
  MessageSquare,
  PhoneCall,
  CheckCheck,
} from 'lucide-react';
import { Campaign, AppServerStatus, PublishingLog } from '../types/index';

interface CockpitViewProps {
  status: AppServerStatus | null;
  campaigns: Campaign[];
  logs: PublishingLog[];
  onSelectCampaign: (id: string) => void;
  onGenerateBatch: () => Promise<void>;
  onGenerateSingle: () => void;
  onPublishCampaign: (id: string, platform: 'linkedin' | 'instagram' | 'both') => Promise<void>;
  onRenderCampaign: (id: string) => Promise<void>;
  onToggleSchedule: (scheduleEnabled: boolean) => Promise<void>;
  onEnforceCtas?: () => Promise<void>;
  loadingAction: boolean;
}

export const CockpitView: React.FC<CockpitViewProps> = ({
  status,
  campaigns,
  logs,
  onSelectCampaign,
  onGenerateBatch,
  onGenerateSingle,
  onPublishCampaign,
  onRenderCampaign,
  onToggleSchedule,
  onEnforceCtas,
  loadingAction,
}) => {
  const [activePublishingId, setActivePublishingId] = useState<string | null>(null);

  const isAutoEnabled = status?.autoPublishEnabled || false;
  const isGlobalPaused = status?.globalPaused || false;

  const handlePublish = async (id: string, platform: 'linkedin' | 'instagram' | 'both') => {
    try {
      setActivePublishingId(id);
      await onPublishCampaign(id, platform);
    } finally {
      setActivePublishingId(null);
    }
  };

  const getStatusBadge = (postStatus: string) => {
    switch (postStatus) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> PUBLISHED
          </span>
        );
      case 'publishing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" /> PUBLISHING
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> SCHEDULED
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" /> FAILED
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Publishing Target */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>DAILY POST TARGET</span>
            <span className="text-amber-400 font-mono font-bold">4 / 4 SLOTS</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>4 Posts</span>
            <span className="text-xs text-slate-400 font-normal">x 7 Slides each</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Targeting US garage door contractors across Morning, Midday, Afternoon, and Evening.
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Autopilot Mode */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>SERVER SCHEDULER</span>
            <span className={`font-mono text-xs font-bold ${isGlobalPaused ? 'text-red-400' : isAutoEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isGlobalPaused ? 'HALTED' : isAutoEnabled ? 'RUNNING' : 'STANDBY'}
            </span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {isAutoEnabled ? 'Automatic' : 'Draft First'}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {isAutoEnabled
              ? 'Scheduler automatically executes when slot arrives.'
              : 'Posts remain in review mode until manually approved or auto enabled.'}
          </p>
        </div>

        {/* Card 3: Connected Channels */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>PLATFORM HEALTH</span>
            <span className="text-blue-400 font-mono text-[11px]">OFFICIAL APIS</span>
          </div>
          <div className="space-y-1.5 mt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">LinkedIn API:</span>
              <span className={`font-mono font-semibold ${status?.linkedinConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status?.linkedinConnected ? 'Authorized' : 'Test Sandbox Mode'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Instagram Meta:</span>
              <span className={`font-mono font-semibold ${status?.instagramConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status?.instagramConnected ? 'Authorized' : 'Test Sandbox Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Gemini AI Usage */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>GEMINI ENGINE</span>
            <span className="text-purple-400 font-mono text-[11px] font-bold">gemini-3.8-flash</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>{status?.todayUsage?.todayGeminiRequests ?? 0}</span>
            <span className="text-xs text-slate-400 font-normal">/ 50 reqs today</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Batched carousel prompts keep API calls and costs minimal.
          </p>
        </div>
      </div>

      {/* Action Control Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Autonomous Campaign Generator
              <span className="text-xs font-normal text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                4 Posts Daily
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates 7-slide image carousels for US garage door contractors adapted for LinkedIn and Instagram.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
          {/* Toggle Auto Publish Switch */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium text-[11px]">Auto-Publish when due:</span>
            <button
              onClick={() => onToggleSchedule(!isAutoEnabled)}
              disabled={loadingAction}
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${
                isAutoEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isAutoEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* New Custom Campaign */}
          <button
            onClick={onGenerateSingle}
            disabled={loadingAction}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Generate 1 Post</span>
          </button>

          {/* Generate 4 Daily Campaigns Batch */}
          <button
            onClick={onGenerateBatch}
            disabled={loadingAction}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            {loadingAction ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Today's 4 Campaigns</span>
          </button>
        </div>
      </div>

      {/* CTA Rotation Compliance Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Daily CTA Rotation Rules</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                2x Calculator + 2x Alternative CTAs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strictly balances 2 revenue-loss calculator URLs with 2 distinct DM/Demo voice agent prompts daily.
            </p>
          </div>
        </div>

        {onEnforceCtas && (
          <button
            onClick={onEnforceCtas}
            disabled={loadingAction}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5 shrink-0"
            title="Validate every post adheres to the 2 Calculator + 2 Alternative CTA rule"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingAction ? 'animate-spin' : ''}`} />
            <span>Enforce Rules Now</span>
          </button>
        )}
      </div>

      {/* Today's Queue (4 Scheduled Slots) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Today's Target Queue (4 Posts)</h3>
            <span className="text-xs text-slate-400 font-mono">({campaigns.length} campaigns in database)</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Each post contains 7 verified slides with honest trade metrics.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {campaigns.slice(0, 4).map((campaign, idx) => {
            const isProcessing = activePublishingId === campaign.id;
            const li = campaign.platforms.linkedin;
            const ig = campaign.platforms.instagram;
            const hasRenderedAssets = campaign.renderedAssets && campaign.renderedAssets.length >= 7;

            const isCalc =
              campaign.ctaType === 'calculator' ||
              campaign.platforms.linkedin.caption.includes('caculator') ||
              campaign.slides.some((s) => s.ctaUrl?.includes('caculator'));

            const isDmCalc = campaign.ctaType === 'dm_calculator';
            const isDemo = campaign.ctaType === 'demo_cta' || campaign.ctaType === 'demo_call';
            const isConversation = campaign.ctaType === 'dm_conversation';

            return (
              <div
                key={campaign.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left Info: Slot, Title, Badges */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0 font-mono text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">SLOT 0{idx + 1}</span>
                    <span className="text-xs font-black text-amber-400">{campaign.scheduledTime || '08:15'}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm md:text-base font-bold text-white hover:text-amber-400 cursor-pointer transition-colors" onClick={() => onSelectCampaign(campaign.id)}>
                        {campaign.title}
                      </span>
                      {campaign.buyingMotivation && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                          {campaign.buyingMotivation.replace('_', ' ')}
                        </span>
                      )}

                      {/* Explicit CTA Badge */}
                      {isCalc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Calculator className="w-3 h-3" /> CALCULATOR CTA (URL)
                        </span>
                      ) : isDmCalc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <MessageSquare className="w-3 h-3" /> DM CALCULATOR
                        </span>
                      ) : isDemo ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          <PhoneCall className="w-3 h-3" /> DEMO AGENT CTA
                        </span>
                      ) : isConversation ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          <MessageSquare className="w-3 h-3" /> CONVERSATION CTA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          {campaign.ctaType}
                        </span>
                      )}

                      {campaign.isDemo && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          SAMPLE READY
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                      {campaign.contentAngleExplanation}
                    </p>

                    {/* Status & Format tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-400 font-semibold text-[11px]">LinkedIn:</span>
                      {getStatusBadge(li.status)}

                      <span className="text-slate-500 mx-1">|</span>

                      <span className="text-slate-400 font-semibold text-[11px]">Instagram:</span>
                      {getStatusBadge(ig.status)}

                      <span className="text-slate-500 mx-1">|</span>

                      <span className="text-slate-400 text-[11px]">7 Slides:</span>
                      {hasRenderedAssets ? (
                        <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> PNGs Ready
                        </span>
                      ) : (
                        <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                          Draft (Needs Render)
                        </span>
                      )}
                    </div>

                    {/* Platform Failure Diagnostics */}
                    {ig.status === 'failed' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 space-y-1 animate-in fade-in">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 font-bold text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Instagram Publish Error</span>
                          </div>
                          <button
                            onClick={() => handlePublish(campaign.id, 'instagram')}
                            disabled={isProcessing || loadingAction}
                            className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry Instagram</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-red-300 font-mono break-words leading-relaxed">
                          {ig.lastError || 'Meta Graph API rejected the carousel publishing request. Check your access token and permissions in Integrations.'}
                        </p>
                      </div>
                    )}

                    {li.status === 'failed' && (
                      <div className="mt-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 space-y-1 animate-in fade-in">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 font-bold text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>LinkedIn Publish Error</span>
                          </div>
                          <button
                            onClick={() => handlePublish(campaign.id, 'linkedin')}
                            disabled={isProcessing || loadingAction}
                            className="px-2.5 py-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry LinkedIn</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-red-300 font-mono break-words leading-relaxed">
                          {li.lastError || 'LinkedIn API upload rejected. Check your token in Integrations.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                  {/* Open in Editor */}
                  <button
                    onClick={() => onSelectCampaign(campaign.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View & Edit</span>
                  </button>

                  {/* Render PNGs */}
                  <button
                    onClick={() => onRenderCampaign(campaign.id)}
                    disabled={loadingAction}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Render crisp 1080x1350 PNG files on server"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Render PNGs</span>
                  </button>

                  {/* Download ZIP */}
                  <a
                    href={`/api/campaigns/${campaign.id}/download-zip`}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Download all 7 slides in a single ZIP file"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ZIP</span>
                  </a>

                  {/* Publish Now Button Dropdown/Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePublish(campaign.id, 'both')}
                      disabled={isProcessing || loadingAction}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Publish Both</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Publishing & Scheduler Activity Log */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white">Live Publishing Logs & Event Stream</h4>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs text-slate-400 font-mono">Showing recent actions</span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {logs.slice(0, 6).map((log) => {
            const isSuccess = log.status === 'success';
            const isFailed = log.status === 'failed';
            const isPaused = log.status === 'paused';
            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isFailed ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-800">
                        {log.platform}
                      </span>
                      <span className="text-slate-300 font-medium">{log.campaignTitle}</span>
                    </div>
                    <p className="text-slate-400 mt-1">{log.message}</p>
                    {log.externalPostId && (
                      <span className="font-mono text-[10px] text-slate-500 mt-0.5 block">
                        Post ID: {log.externalPostId}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
