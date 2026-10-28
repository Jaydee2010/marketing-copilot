import React from 'react';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2, Globe, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack?: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  const lastUpdated = 'October 28, 2026';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                Stepstone AI Agency
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-mono">
                // Marketing Autopilot
              </span>
            </div>
          </div>

          {onBack ? (
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          ) : (
            <a
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to App</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Title Card */}
        <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              OFFICIAL POLICY
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Effective Date: {lastUpdated}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            This Privacy Policy describes how Stepstone AI Agency ("we", "us", or "our") collects, uses, and safeguards information through our B2B Marketing Autopilot software and integrations with the Meta Graph API (Instagram) and LinkedIn API.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          {/* Section 1: Overview */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <FileText className="w-4 h-4 text-amber-400" />
              <h2>1. Introduction and Scope</h2>
            </div>
            <p>
              Stepstone AI Agency operates autonomous B2B marketing tools designed for independent trade contractors, specifically garage door repair and installation service companies in the United States. Our software enables authorized users to design, schedule, and publish 7-slide informational image carousel posts to Instagram and LinkedIn.
            </p>
            <p>
              We respect your privacy and are committed to protecting any credentials and operational data entrusted to our application.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h2>2. Information We Collect</h2>
            </div>
            <p>To provide carousel publishing functionality, our service collects only the minimal credentials and data necessary:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>
                <strong className="text-white">Meta / Instagram Platform Data:</strong> Instagram Professional/Business Account ID, Meta User/Page Access Token, and verified Instagram handle (e.g., @username).
              </li>
              <li>
                <strong className="text-white">LinkedIn Platform Data:</strong> OAuth 2.0 Access Token, Member URN / Organization URN, and client credentials.
              </li>
              <li>
                <strong className="text-white">Content Assets:</strong> Slide headlines, educational copy, image PNG renders, caption text, and scheduling time slots.
              </li>
              <li>
                <strong className="text-white">Publishing Logs:</strong> Meta container IDs, published post IDs, status codes, and timestamps required for delivery audit.
              </li>
            </ul>
            <p className="text-xs text-slate-400 italic">
              Note: We do not collect, read, or store personal direct messages, personal feed photos, or followers’ private personal data.
            </p>
          </section>

          {/* Section 3: How We Use Information */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <h2>3. How We Use Your Information</h2>
            </div>
            <p>Platform data is used exclusively to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Authenticate your account with Meta Graph API and LinkedIn API.</li>
              <li>Upload 7-slide image carousel containers to Instagram via the official <code className="text-amber-300 font-mono bg-slate-950 px-1 py-0.5 rounded">instagram_content_publish</code> permission.</li>
              <li>Publish approved captions, hashtags, and carousel slides on your scheduled time slots.</li>
              <li>Display verified fulfillment links and post IDs in the dashboard audit log.</li>
            </ul>
            <p className="text-white font-semibold">
              We never sell, rent, monetize, or share your access tokens or business data with third-party data brokers or advertisers.
            </p>
          </section>

          {/* Section 4: Data Storage & Security */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-4 h-4 text-purple-400" />
              <h2>4. Data Storage and Security</h2>
            </div>
            <p>
              All tokens and configuration settings are stored securely on the application server. Access tokens are used strictly to communicate over encrypted HTTPS connections directly to Meta’s official servers (<code className="text-slate-200 font-mono">graph.facebook.com</code>) and LinkedIn’s official servers (<code className="text-slate-200 font-mono">api.linkedin.com</code>).
            </p>
          </section>

          {/* Section 5: Third-Party Service Providers */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Globe className="w-4 h-4 text-amber-400" />
              <h2>5. Third-Party API Platforms</h2>
            </div>
            <p>Our application integrates with the following third-party APIs:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>
                <strong className="text-white">Meta Platforms, Inc. (Instagram Graph API):</strong> Subject to the <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Meta Privacy Policy</a>.
              </li>
              <li>
                <strong className="text-white">LinkedIn Corporation:</strong> Subject to the <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">LinkedIn Privacy Policy</a>.
              </li>
              <li>
                <strong className="text-white">Google Gemini API:</strong> Used solely to assist in drafting trade marketing copy.
              </li>
            </ul>
          </section>

          {/* Section 6: Data Deletion & User Rights */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Lock className="w-4 h-4 text-red-400" />
              <h2>6. Data Deletion and Revocation of Access</h2>
            </div>
            <p>
              You maintain full control over your social media accounts. You can revoke access or request data deletion at any time:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
              <li>
                <strong className="text-white">Revoke via Meta:</strong> Go to your Facebook Settings ➔ <em>Business Integrations</em> ➔ locate this app ➔ click <em>Remove</em>.
              </li>
              <li>
                <strong className="text-white">Delete via App Dashboard:</strong> Go to the <strong>Integrations</strong> tab in this app, clear your Access Token and Business ID, and click <em>Save Settings</em>.
              </li>
              <li>
                <strong className="text-white">Direct Deletion Request:</strong> To request complete removal of all logs and stored records, email us at <a href="mailto:privacy@stepstoneai.agency" className="text-amber-400 hover:underline">privacy@stepstoneai.agency</a> with your account ID.
              </li>
            </ul>
          </section>

          {/* Section 7: Contact Us */}
          <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Mail className="w-4 h-4 text-amber-400" />
              <h2>7. Contact Information</h2>
            </div>
            <p>
              If you have questions regarding this Privacy Policy or our data handling practices, please contact:
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
              <div className="text-white font-bold">Stepstone AI Agency</div>
              <div className="text-slate-400">Website: https://stepstoneai.agency</div>
              <div className="text-slate-400">Email: jd0878308@gmail.com / privacy@stepstoneai.agency</div>
              <div className="text-slate-400">Jurisdiction: United States</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 font-mono">
        <div>Stepstone AI Agency // Marketing Autopilot // All Rights Reserved</div>
        <div className="mt-1">
          <a href="/" className="text-amber-400 hover:underline">App Dashboard</a> • <span className="text-slate-400">Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
};
