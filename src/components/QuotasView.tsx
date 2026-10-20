import React, { useState } from 'react';
import {
  Activity,
  HardDrive,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { QuotaAndUsage, PublishingLog } from '../types/index';

interface QuotasViewProps {
  usage: QuotaAndUsage | null;
  logs: PublishingLog[];
  onRefreshLogs: () => Promise<void>;
  loading: boolean;
}

export const QuotasView: React.FC<QuotasViewProps> = ({
  usage,
  logs,
  onRefreshLogs,
  loading,
}) => {
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filterPlatform !== 'all' && log.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    return true;
  });

  const diskMb = usage ? (usage.totalAssetsDiskBytes / (1024 * 1024)).toFixed(2) : '0';

  return (
    <div className="space-y-8">
      {/* Resource & Quota Dashboard */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span>Free-First Quota & Resource Usage Monitor</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gemini AI API Requests */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>GEMINI REQUESTS</span>
              <span className="font-mono text-amber-400 font-bold">TODAY</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {usage?.todayGeminiRequests ?? 0}
              <span className="text-xs text-slate-400 font-normal"> / {usage?.maxDailyGeminiRequests ?? 50} limit</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((usage?.todayGeminiRequests ?? 0) / (usage?.maxDailyGeminiRequests ?? 50)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Est. Tokens: ~{usage?.todayGeminiEstimatedTokens.toLocaleString() ?? 0}
            </span>
          </div>

          {/* LinkedIn Posts Today */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>LINKEDIN POSTS</span>
              <span className="font-mono text-blue-400 font-bold">TODAY</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {usage?.todayPostsLinkedIn ?? 0}
              <span className="text-xs text-slate-400 font-normal"> / 4 target</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((usage?.todayPostsLinkedIn ?? 0) / 4) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              7 slides per carousel
            </span>
          </div>

          {/* Instagram Posts Today */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>INSTAGRAM POSTS</span>
              <span className="font-mono text-pink-400 font-bold">TODAY</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {usage?.todayPostsInstagram ?? 0}
              <span className="text-xs text-slate-400 font-normal"> / 4 target</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((usage?.todayPostsInstagram ?? 0) / 4) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Meta 24h rolling limit: 25 max
            </span>
          </div>

          {/* Rendered Assets on Disk */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>RENDERED ASSETS</span>
              <span className="font-mono text-emerald-400 font-bold">STORAGE</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {usage?.todayRenderedAssetsCount ?? 0}
              <span className="text-xs text-slate-400 font-normal"> PNG files</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-1/4" />
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              {diskMb} MB in <code className="text-slate-300">data/assets</code>
            </span>
          </div>
        </div>
      </div>

      {/* Free-First Architecture Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Cost-Optimized Free-First Architecture:</span>
          <p className="text-slate-400 leading-relaxed">
            Unlike apps that trigger 28 expensive AI image-generation API calls per day (which can cost $300+/month), this tool uses high-performance server-side HTML/SVG-to-PNG template rendering. The Gemini API is called once per campaign in batch mode to write structured JSON for all 7 slides and both platform captions, keeping you comfortably within free-tier quotas.
          </p>
        </div>
      </div>

      {/* Logs Table with Filters */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white">Publishing & Scheduler Audit Logs</h4>
            <span className="text-xs text-slate-400 font-mono">({filteredLogs.length} events)</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Filter by Platform */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Platforms</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="paused">Paused</option>
            </select>

            <button
              onClick={onRefreshLogs}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching logs found for the selected filters.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSuccess = log.status === 'success';
              const isFailed = log.status === 'failed';
              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-4 text-xs"
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
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-800">
                          {log.platform}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 uppercase">
                          {log.action}
                        </span>
                        <span className="text-slate-300 font-semibold">{log.campaignTitle}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{log.message}</p>
                      {log.externalPostId && (
                        <span className="text-[10px] font-mono text-slate-500 block">
                          External ID: {log.externalPostId}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
