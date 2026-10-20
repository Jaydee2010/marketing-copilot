import React, { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Save,
  Lock,
  Globe,
  Key,
  Info,
} from 'lucide-react';
import { LinkedInCredentials, InstagramCredentials } from '../types/index';

interface IntegrationsViewProps {
  linkedin: LinkedInCredentials | null;
  instagram: InstagramCredentials | null;
  onUpdateLinkedIn: (creds: Partial<LinkedInCredentials>) => Promise<void>;
  onUpdateInstagram: (creds: Partial<InstagramCredentials>) => Promise<void>;
  loading: boolean;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  linkedin,
  instagram,
  onUpdateLinkedIn,
  onUpdateInstagram,
  loading,
}) => {
  const [localLI, setLocalLI] = useState<LinkedInCredentials | null>(linkedin);
  const [localIG, setLocalIG] = useState<InstagramCredentials | null>(instagram);
  const [savingLI, setSavingLI] = useState(false);
  const [savingIG, setSavingIG] = useState(false);

  React.useEffect(() => {
    setLocalLI(linkedin);
  }, [linkedin]);

  React.useEffect(() => {
    setLocalIG(instagram);
  }, [instagram]);

  if (!localLI || !localIG) return null;

  const handleSaveLinkedIn = async () => {
    try {
      setSavingLI(true);
      await onUpdateLinkedIn(localLI);
    } finally {
      setSavingLI(false);
    }
  };

  const handleSaveInstagram = async () => {
    try {
      setSavingIG(true);
      await onUpdateInstagram(localIG);
    } finally {
      setSavingIG(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      const res = await fetch('/api/auth/linkedin/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start LinkedIn OAuth');
      }
    } catch (e: any) {
      alert(`Error starting LinkedIn OAuth: ${e.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          <span>Official Platform Integrations (LinkedIn & Instagram Only)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          The Autopilot publishes multi-image carousels strictly through official developer APIs. No web scrapers, no unofficial browser hacks, and no fake publishing claims. Both platforms can be enabled or disabled independently.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LinkedIn Integration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-lg">
                  in
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">LinkedIn Official Posts API</h4>
                  <p className="text-xs text-slate-400">7-Slide Multi-Image Post Publishing</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {localLI.isConnected ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : localLI.isTestMode ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sandbox Mode
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                    Not Connected
                  </span>
                )}
              </div>
            </div>

            {/* Test Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Sandbox / Test Mode</span>
                <span className="text-[11px] text-slate-400">
                  Renders slides and validates payload without calling real LinkedIn endpoints.
                </span>
              </div>
              <input
                type="checkbox"
                checked={localLI.isTestMode}
                onChange={(e) => setLocalLI({ ...localLI, isTestMode: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
              />
            </div>

            {/* OAuth Credentials */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">LinkedIn Client ID</label>
                <input
                  type="text"
                  value={localLI.clientId}
                  onChange={(e) => setLocalLI({ ...localLI, clientId: e.target.value })}
                  placeholder="e.g. 78xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">LinkedIn Client Secret</label>
                <input
                  type="password"
                  value={localLI.clientSecret}
                  onChange={(e) => setLocalLI({ ...localLI, clientSecret: e.target.value })}
                  placeholder="Enter client secret"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">OAuth Redirect URI</label>
                <input
                  type="text"
                  value={localLI.redirectUri}
                  onChange={(e) => setLocalLI({ ...localLI, redirectUri: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-400 font-mono focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">
                  Add this URI in your LinkedIn Developer App &gt; Auth tab.
                </span>
              </div>

              {localLI.memberName && (
                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-blue-300">
                  Authorized as: <span className="font-bold text-white">{localLI.memberName}</span> ({localLI.memberUrn})
                </div>
              )}
            </div>

            {/* Official API Checklist */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Official API Checklist:
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Product: "Share on LinkedIn" or "Sign In with LinkedIn using OpenID Connect"</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Scopes: <code className="text-blue-300">openid</code>, <code className="text-blue-300">profile</code>, <code className="text-blue-300">w_member_social</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Multi-image endpoint: <code className="text-blue-300">rest/images?action=initializeUpload</code></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleConnectLinkedIn}
              disabled={!localLI.clientId || localLI.isTestMode}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Connect via OAuth</span>
            </button>

            <button
              onClick={handleSaveLinkedIn}
              disabled={savingLI || loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              {savingLI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save LinkedIn Settings</span>
            </button>
          </div>
        </div>

        {/* Instagram Integration Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
                  ig
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instagram Meta Graph API</h4>
                  <p className="text-xs text-slate-400">7-Slide Carousel Publishing</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {localIG.isConnected ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : localIG.isTestMode ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Sandbox Mode
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                    Not Connected
                  </span>
                )}
              </div>
            </div>

            {/* Test Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Sandbox / Test Mode</span>
                <span className="text-[11px] text-slate-400">
                  Validates carousel requirements without sending real Meta requests.
                </span>
              </div>
              <input
                type="checkbox"
                checked={localIG.isTestMode}
                onChange={(e) => setLocalIG({ ...localIG, isTestMode: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-pink-500 focus:ring-0"
              />
            </div>

            {/* Meta Graph API Credentials */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Public App / Host URL (Required by Meta)</label>
                <input
                  type="text"
                  value={localIG.publicHostUrl}
                  onChange={(e) => setLocalIG({ ...localIG, publicHostUrl: e.target.value })}
                  placeholder="https://your-public-app.run.app"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                />
                <span className="text-[10px] text-slate-500">
                  Meta's servers must download the 7 slide PNGs over public HTTPS.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Instagram Business Account ID</label>
                <input
                  type="text"
                  value={localIG.instagramBusinessId || ''}
                  onChange={(e) => setLocalIG({ ...localIG, instagramBusinessId: e.target.value })}
                  placeholder="e.g. 1784xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Meta User / Page Access Token</label>
                <input
                  type="password"
                  value={localIG.userAccessToken || ''}
                  onChange={(e) => setLocalIG({ ...localIG, userAccessToken: e.target.value })}
                  placeholder="EAAB..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Meta Graph API Requirements */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Meta Instagram Publishing Requirements:
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Instagram Professional (Business or Creator) account</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Connected to a Facebook Page managed by your Meta Developer account</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Permission: <code className="text-pink-300">instagram_content_publish</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Rate limit: 25 published posts per rolling 24 hours per account</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={handleSaveInstagram}
              disabled={savingIG || loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              {savingIG ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Instagram Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
