import React, { useState, useEffect } from 'react';
import {
  Campaign,
  AppServerStatus,
  MarketingStrategy,
  SchedulerConfig,
  LinkedInCredentials,
  InstagramCredentials,
  PublishingLog,
  QuotaAndUsage,
  SlideFormat,
  ContentPillarId,
  SlideTheme,
  BuyingMotivation,
  CtaType,
} from './types/index';
import { Navbar } from './components/Navbar';
import { CockpitView } from './components/CockpitView';
import { SlideStudioView } from './components/SlideStudioView';
import { CalendarView } from './components/CalendarView';
import { StrategyView } from './components/StrategyView';
import { IntegrationsView } from './components/IntegrationsView';
import { QuotasView } from './components/QuotasView';
import { GenerateModal } from './components/GenerateModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('cockpit');
  const [status, setStatus] = useState<AppServerStatus | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<MarketingStrategy | null>(null);
  const [schedule, setSchedule] = useState<SchedulerConfig | null>(null);
  const [linkedin, setLinkedIn] = useState<LinkedInCredentials | null>(null);
  const [instagram, setInstagram] = useState<InstagramCredentials | null>(null);
  const [logs, setLogs] = useState<PublishingLog[]>([]);
  const [usage, setUsage] = useState<QuotaAndUsage | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const fetchJson = async (url: string) => {
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Expected JSON from ${url} but received HTML/Text ("${text.slice(0, 50)}..."). The backend API server may not be running or the route is not configured.`);
        }
      };

      const [
        statusRes,
        campaignsRes,
        strategyRes,
        scheduleRes,
        liRes,
        igRes,
        logsRes,
        usageRes,
      ] = await Promise.all([
        fetchJson('/api/status'),
        fetchJson('/api/campaigns'),
        fetchJson('/api/strategy'),
        fetchJson('/api/schedule'),
        fetchJson('/api/integrations/linkedin'),
        fetchJson('/api/integrations/instagram'),
        fetchJson('/api/logs'),
        fetchJson('/api/usage'),
      ]);

      setStatus(statusRes);
      setCampaigns(campaignsRes);
      if (campaignsRes.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(campaignsRes[0].id);
      }
      setStrategy(strategyRes);
      setSchedule(scheduleRes);
      setLinkedIn(liRes);
      setInstagram(igRes);
      setLogs(logsRes);
      setUsage(usageRes);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      showNotification(`Failed to load applet data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // Poll status & logs periodically every 15 seconds
    const interval = setInterval(async () => {
      try {
        const [statusRes, logsRes, usageRes] = await Promise.all([
          fetch('/api/status').then((r) => r.json()),
          fetch('/api/logs').then((r) => r.json()),
          fetch('/api/usage').then((r) => r.json()),
        ]);
        setStatus(statusRes);
        setLogs(logsRes);
        setUsage(usageRes);
      } catch (e) {
        // quiet poll fail
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Emergency Pause Toggle
  const handleToggleEmergencyPause = async () => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/emergency-pause', { method: 'POST' });
      const data = await res.json();
      if (status) {
        setStatus({ ...status, globalPaused: data.globalPaused });
      }
      showNotification(
        data.globalPaused
          ? 'Emergency Pause ACTIVATED. All background publishing paused.'
          : 'Autopilot RESUMED. Scheduled jobs active.',
        data.globalPaused ? 'info' : 'success'
      );
    } catch (err: any) {
      showNotification(`Emergency pause failed: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Generate 4 Daily Campaigns (Batch)
  const handleGenerateBatch = async () => {
    try {
      setActionLoading(true);
      showNotification('Generating 4 scheduled campaigns with Gemini...', 'info');
      const res = await fetch('/api/campaigns/generate-batch', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Batch generation failed');
      }
      const updatedCampaigns = await res.json();
      setCampaigns(updatedCampaigns);
      if (updatedCampaigns.length > 0) {
        setSelectedCampaignId(updatedCampaigns[0].id);
      }
      showNotification('Generated 4 daily campaigns with all 7 slides rendered!', 'success');
      // Refresh status & usage
      const [uRes, sRes] = await Promise.all([
        fetch('/api/usage').then((r) => r.json()),
        fetch('/api/status').then((r) => r.json()),
      ]);
      setUsage(uRes);
      setStatus(sRes);
    } catch (err: any) {
      showNotification(`Generation error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Generate Single Campaign
  const handleGenerateSingle = async (params: {
    pillarId: ContentPillarId;
    buyingMotivation?: BuyingMotivation;
    ctaType?: CtaType;
    customTopic?: string;
    theme: SlideTheme;
    targetSlot: string;
  }) => {
    try {
      setActionLoading(true);
      showNotification('Drafting 7-slide B2B campaign with Gemini...', 'info');
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }
      const newCampaign = await res.json();
      setCampaigns((prev) => [newCampaign, ...prev]);
      setSelectedCampaignId(newCampaign.id);
      setActiveTab('campaigns');
      showNotification(`Created 7-slide campaign "${newCampaign.title}"!`, 'success');

      // Refresh usage
      const uRes = await fetch('/api/usage').then((r) => r.json());
      setUsage(uRes);
    } catch (err: any) {
      showNotification(`Generation error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Render PNGs
  const handleRenderCampaign = async (id: string, format: SlideFormat = 'portrait_4_5') => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/campaigns/${id}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Slide rendering failed');
      }
      const data = await res.json();
      setCampaigns((prev) => prev.map((c) => (c.id === id ? data.campaign : c)));
      showNotification(`Rendered all 7 slides as crystal-clear PNGs (${format})!`, 'success');
      // Refresh usage
      const uRes = await fetch('/api/usage').then((r) => r.json());
      setUsage(uRes);
    } catch (err: any) {
      showNotification(`Render error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Publish Campaign
  const handlePublishCampaign = async (id: string, platform: 'linkedin' | 'instagram' | 'both') => {
    try {
      setActionLoading(true);
      showNotification(`Publishing carousel to ${platform.toUpperCase()}...`, 'info');
      const res = await fetch(`/api/campaigns/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publish request failed');
      }

      setCampaigns((prev) => prev.map((c) => (c.id === id ? data.campaign : c)));
      const [statusRes, logsRes] = await Promise.all([
        fetch('/api/status').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json()),
      ]);
      setStatus(statusRes);
      setLogs(logsRes);

      const msg = data.result?.linkedin?.message || data.result?.instagram?.message || 'Publish executed.';
      showNotification(msg, 'success');
    } catch (err: any) {
      showNotification(`Publishing error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Campaign
  const handleUpdateCampaign = async (campaign: Campaign) => {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      if (!res.ok) throw new Error('Failed to update campaign');
      const updated = await res.json();
      setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? updated : c)));
      showNotification('Campaign slides and copy saved!', 'success');
    } catch (err: any) {
      showNotification(`Save error: ${err.message}`, 'error');
    }
  };

  // Update Strategy
  const handleUpdateStrategy = async (newStrategy: MarketingStrategy) => {
    try {
      const res = await fetch('/api/strategy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStrategy),
      });
      if (!res.ok) throw new Error('Failed to update strategy');
      const updated = await res.json();
      setStrategy(updated);
      showNotification('Marketing strategy updated in server database!', 'success');
    } catch (err: any) {
      showNotification(`Strategy save error: ${err.message}`, 'error');
    }
  };

  // Update Schedule & Autopilot rules
  const handleUpdateSchedule = async (newSchedule: SchedulerConfig) => {
    try {
      const res = await fetch('/api/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });
      if (!res.ok) throw new Error('Failed to update schedule');
      const updated = await res.json();
      setSchedule(updated);
      showNotification('Scheduler rules and timezone updated!', 'success');
    } catch (err: any) {
      showNotification(`Schedule save error: ${err.message}`, 'error');
    }
  };

  // Toggle Auto-publish switch
  const handleToggleSchedule = async (scheduleEnabled: boolean) => {
    if (!schedule) return;
    const updated = { ...schedule, autoPublishEnabled: scheduleEnabled };
    await handleUpdateSchedule(updated);
    if (status) {
      setStatus({ ...status, autoPublishEnabled: scheduleEnabled });
    }
  };

  // Enforce & Validate CTA Rotation Rules across daily batch
  const handleEnforceCtas = async () => {
    try {
      setActionLoading(true);
      showNotification('Auditing daily posts for 2x Calculator + 2x Alternative CTAs...', 'info');
      const res = await fetch('/api/campaigns/enforce-ctas', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to enforce CTA rotation');
      }
      const data = await res.json();
      setCampaigns(data.campaigns);
      showNotification(data.message, data.validation.valid ? 'success' : 'info');
    } catch (err: any) {
      showNotification(`Enforce CTA error: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Update LinkedIn Credentials
  const handleUpdateLinkedIn = async (creds: Partial<LinkedInCredentials>) => {
    try {
      const res = await fetch('/api/integrations/linkedin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!res.ok) throw new Error('Failed to update LinkedIn settings');
      const updated = await res.json();
      setLinkedIn(updated);
      showNotification('LinkedIn settings saved!', 'success');
    } catch (err: any) {
      showNotification(`LinkedIn error: ${err.message}`, 'error');
    }
  };

  // Update Instagram Credentials
  const handleUpdateInstagram = async (creds: Partial<InstagramCredentials>) => {
    try {
      const res = await fetch('/api/integrations/instagram', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!res.ok) throw new Error('Failed to update Instagram settings');
      const updated = await res.json();
      setInstagram(updated);
      showNotification('Instagram settings saved!', 'success');
    } catch (err: any) {
      showNotification(`Instagram error: ${err.message}`, 'error');
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        onToggleEmergencyPause={handleToggleEmergencyPause}
        loadingPause={actionLoading}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-semibold backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-950/95 border-red-800 text-red-200'
                : notification.type === 'info'
                ? 'bg-blue-950/95 border-blue-800 text-blue-200'
                : 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-spin text-amber-400">
              <div className="w-3 h-3 bg-amber-400 rounded-full" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Connecting to Autopilot Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'cockpit' && (
              <CockpitView
                status={status}
                campaigns={campaigns}
                logs={logs}
                onSelectCampaign={(id) => {
                  setSelectedCampaignId(id);
                  setActiveTab('campaigns');
                }}
                onGenerateBatch={handleGenerateBatch}
                onGenerateSingle={() => setIsGenerateModalOpen(true)}
                onPublishCampaign={handlePublishCampaign}
                onRenderCampaign={(id) => handleRenderCampaign(id, 'portrait_4_5')}
                onToggleSchedule={handleToggleSchedule}
                onEnforceCtas={handleEnforceCtas}
                loadingAction={actionLoading}
              />
            )}

            {activeTab === 'campaigns' && (
              <SlideStudioView
                campaign={selectedCampaign}
                allCampaigns={campaigns}
                onSelectCampaign={(id) => setSelectedCampaignId(id)}
                onUpdateCampaign={handleUpdateCampaign}
                onRenderCampaign={handleRenderCampaign}
                onPublishCampaign={handlePublishCampaign}
                loading={actionLoading}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                campaigns={campaigns}
                schedule={schedule}
                onUpdateSchedule={handleUpdateSchedule}
                onSelectCampaign={(id) => {
                  setSelectedCampaignId(id);
                  setActiveTab('campaigns');
                }}
                onPublishCampaign={handlePublishCampaign}
                loading={actionLoading}
              />
            )}

            {activeTab === 'strategy' && (
              <StrategyView
                strategy={strategy}
                onUpdateStrategy={handleUpdateStrategy}
                loading={actionLoading}
              />
            )}

            {activeTab === 'integrations' && (
              <IntegrationsView
                linkedin={linkedin}
                instagram={instagram}
                onUpdateLinkedIn={handleUpdateLinkedIn}
                onUpdateInstagram={handleUpdateInstagram}
                loading={actionLoading}
              />
            )}

            {activeTab === 'quotas' && (
              <QuotasView
                usage={usage}
                logs={logs}
                onRefreshLogs={async () => {
                  const res = await fetch('/api/logs');
                  setLogs(await res.json());
                }}
                loading={actionLoading}
              />
            )}
          </>
        )}
      </main>

      {/* Generate Custom Campaign Modal */}
      {strategy && schedule && (
        <GenerateModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onGenerate={handleGenerateSingle}
          pillars={strategy.customPillars}
          dailySlots={schedule.dailySlots}
          loading={actionLoading}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        Garage Door AI Marketing Autopilot // LinkedIn & Instagram Official APIs // 7-Slide B2B Image Carousels // No Video
      </footer>
    </div>
  );
}
