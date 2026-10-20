import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  Sliders,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Campaign, SchedulerConfig } from '../types/index';

interface CalendarViewProps {
  campaigns: Campaign[];
  schedule: SchedulerConfig | null;
  onUpdateSchedule: (schedule: SchedulerConfig) => Promise<void>;
  onSelectCampaign: (id: string) => void;
  onPublishCampaign: (id: string, platform: 'linkedin' | 'instagram' | 'both') => Promise<void>;
  loading: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  campaigns,
  schedule,
  onUpdateSchedule,
  onSelectCampaign,
  onPublishCampaign,
  loading,
}) => {
  const [localSchedule, setLocalSchedule] = useState<SchedulerConfig | null>(schedule);
  const [savingSchedule, setSavingSchedule] = useState(false);

  React.useEffect(() => {
    setLocalSchedule(schedule);
  }, [schedule]);

  if (!localSchedule) return null;

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      await onUpdateSchedule(localSchedule);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSlotChange = (index: number, val: string) => {
    const updated = [...localSchedule.dailySlots];
    updated[index] = val;
    setLocalSchedule({ ...localSchedule, dailySlots: updated });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-8">
      {/* Schedule Configuration Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Target 4 Daily Posting Slots & Timezone</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              The persistent server scheduler matches these times in your selected US timezone and handles publishing autonomously.
            </p>
          </div>

          <button
            onClick={handleSaveSchedule}
            disabled={savingSchedule || loading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            {savingSchedule ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Save Schedule Rules</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Timezone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target US Timezone</label>
            <select
              value={localSchedule.timezone}
              onChange={(e) => setLocalSchedule({ ...localSchedule, timezone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="America/Phoenix">Arizona (MST)</option>
            </select>
          </div>

          {/* Slot 1 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Slot 1 (Morning Peak)</label>
            <input
              type="time"
              value={localSchedule.dailySlots[0] || '08:15'}
              onChange={(e) => handleSlotChange(0, e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Slot 2 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Slot 2 (Midday Ladders)</label>
            <input
              type="time"
              value={localSchedule.dailySlots[1] || '11:45'}
              onChange={(e) => handleSlotChange(1, e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Slot 3 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Slot 3 (Afternoon Dispatch)</label>
            <input
              type="time"
              value={localSchedule.dailySlots[2] || '15:30'}
              onChange={(e) => handleSlotChange(2, e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Slot 4 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Slot 4 (Evening Emergencies)</label>
            <input
              type="time"
              value={localSchedule.dailySlots[3] || '18:45'}
              onChange={(e) => handleSlotChange(3, e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Platform Pauses & Safety Switches */}
        <div className="pt-2 flex flex-wrap items-center gap-6 border-t border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={!localSchedule.linkedinPaused}
              onChange={(e) => setLocalSchedule({ ...localSchedule, linkedinPaused: !e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-0"
            />
            <span>LinkedIn Publishing Enabled</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={!localSchedule.instagramPaused}
              onChange={(e) => setLocalSchedule({ ...localSchedule, instagramPaused: !e.target.checked })}
              className="rounded bg-slate-950 border-slate-700 text-pink-500 focus:ring-0"
            />
            <span>Instagram Publishing Enabled</span>
          </label>

          <div className="ml-auto text-slate-400 font-mono text-[11px]">
            Daily Limit: <span className="text-amber-400 font-bold">{localSchedule.dailyPostLimitPerPlatform} posts</span> per platform
          </div>
        </div>
      </div>

      {/* Visual Content Slots Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <span>Scheduled Campaign Distribution</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Timezone: {localSchedule.timezone}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {localSchedule.dailySlots.map((slotTime, idx) => {
            const matchedCampaign = campaigns[idx];
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      SLOT 0{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {slotTime}
                    </span>
                  </div>

                  {matchedCampaign ? (
                    <div className="mt-3 space-y-2">
                      <h4
                        onClick={() => onSelectCampaign(matchedCampaign.id)}
                        className="text-sm font-bold text-white hover:text-amber-400 cursor-pointer line-clamp-2 transition-colors"
                      >
                        {matchedCampaign.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {matchedCampaign.contentAngleExplanation}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                          {matchedCampaign.pillarId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          LI: {matchedCampaign.platforms.linkedin.status}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800">
                          IG: {matchedCampaign.platforms.instagram.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-center text-xs text-slate-500 py-4">
                      No campaign assigned yet.
                    </div>
                  )}
                </div>

                {matchedCampaign && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectCampaign(matchedCampaign.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Review</span>
                    </button>

                    <button
                      onClick={() => onPublishCampaign(matchedCampaign.id, 'both')}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Publish</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
