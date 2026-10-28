import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import { db } from './server/db';
import { scheduler } from './server/scheduler';
import { generateSingleCampaign, generateDailyBatch, validateAndEnforceDailyBatch } from './server/gemini';
import { renderCampaignSlides } from './server/renderer';
import { publishToLinkedIn, getLinkedInAuthUrl, exchangeLinkedInCode } from './server/linkedin';
import { publishToInstagram, verifyInstagramCredentials } from './server/instagram';

dotenv.config();

function getListenPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.RENDER && process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 3000;
}

function getListenHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

const app = express();
const PORT = getListenPort();
const HOST = getListenHost();
const ASSETS_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data', 'assets')
  : path.resolve(process.cwd(), 'data', 'assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));

// Healthcheck and keep-awake endpoints for Render & Uptime monitors
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});
app.get('/ping', (_req, res) => {
  res.status(200).send('pong');
});

// Dedicated Privacy Policy endpoint for Meta Graph API compliance and public verification
app.get(['/privacy', '/privacy-policy'], (_req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Stepstone AI Agency Marketing Autopilot</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #020617; color: #cbd5e1; line-height: 1.6; margin: 0; padding: 0; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    header { border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 20px; font-weight: 800; color: #ffffff; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); margin-bottom: 12px; }
    h1 { font-size: 28px; color: #ffffff; margin-top: 0; }
    h2 { font-size: 18px; color: #f8fafc; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-top: 28px; }
    p, li { font-size: 14px; color: #94a3b8; }
    ul { padding-left: 20px; }
    code { background: #0f172a; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #fbbf24; }
    .contact-box { background: #090d16; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; font-family: monospace; font-size: 13px; margin-top: 20px; }
    .back-btn { display: inline-block; padding: 8px 16px; border-radius: 8px; background: #1e293b; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; }
    .back-btn:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">Stepstone AI Agency</div>
      <a href="/" class="back-btn">&larr; Back to Dashboard</a>
    </header>

    <div class="badge">OFFICIAL PRIVACY POLICY</div>
    <h1>Privacy Policy</h1>
    <p><strong>Effective Date:</strong> October 28, 2026</p>
    <p>This Privacy Policy explains how Stepstone AI Agency ("we", "us", or "our") collects, uses, and safeguards information through our B2B Marketing Autopilot software and official integrations with the Meta Graph API (Instagram) and LinkedIn API.</p>

    <h2>1. Introduction & Purpose</h2>
    <p>Stepstone AI Agency provides autonomous B2B marketing software designed for independent trade contractors, specifically garage door repair and installation service companies in the United States. Our software enables authorized users to generate, schedule, and publish educational 7-slide image carousel posts to Instagram and LinkedIn.</p>

    <h2>2. Information We Collect</h2>
    <p>To deliver carousel publishing functionality, we collect only the minimal credentials and operational metadata necessary:</p>
    <ul>
      <li><strong>Meta / Instagram Platform Data:</strong> Instagram Professional/Business Account ID, Meta User/Page Access Token, and verified Instagram username.</li>
      <li><strong>LinkedIn Platform Data:</strong> OAuth 2.0 Access Token, Member URN / Organization URN.</li>
      <li><strong>Content Assets:</strong> Slide headlines, body text, rendered PNG slides, captions, hashtags, and scheduled time slots.</li>
      <li><strong>Delivery Logs:</strong> Meta container IDs, published post IDs, status codes, and timestamps required for delivery verification.</li>
    </ul>
    <p><em>Note: We do not collect, read, or store personal direct messages, personal feed photos, or followers' private data.</em></p>

    <h2>3. How We Use Data</h2>
    <p>Platform data is used strictly to:</p>
    <ul>
      <li>Authenticate with Meta Graph API and LinkedIn API.</li>
      <li>Upload 7-slide carousel containers via the official <code>instagram_content_publish</code> permission.</li>
      <li>Publish approved captions and carousels at scheduled times.</li>
      <li>Provide delivery verification links in the app dashboard.</li>
    </ul>
    <p><strong>We never sell, rent, monetize, or share user data or access tokens with any third parties or advertisers.</strong></p>

    <h2>4. Data Storage & Security</h2>
    <p>All tokens and configurations are stored securely on the application server. All communications with Meta (<code>graph.facebook.com</code>) and LinkedIn (<code>api.linkedin.com</code>) take place exclusively over encrypted HTTPS connections.</p>

    <h2>5. Data Deletion & Revocation</h2>
    <p>Users can revoke access or delete stored credentials at any time:</p>
    <ul>
      <li><strong>Revoke via Meta:</strong> Go to Facebook Settings &rarr; <em>Business Integrations</em> &rarr; select this app &rarr; click <em>Remove</em>.</li>
      <li><strong>Clear via Dashboard:</strong> In the app's <strong>Integrations</strong> tab, delete your Access Token and Account ID, then click <em>Save Settings</em>.</li>
      <li><strong>Direct Deletion Request:</strong> Email us at <a href="mailto:privacy@stepstoneai.agency" style="color:#f59e0b;">privacy@stepstoneai.agency</a> with your account details.</li>
    </ul>

    <h2>6. Contact Us</h2>
    <div class="contact-box">
      <strong>Stepstone AI Agency</strong><br>
      Website: https://stepstoneai.agency<br>
      Email: jd0878308@gmail.com / privacy@stepstoneai.agency<br>
      Jurisdiction: United States
    </div>
  </div>
</body>
</html>`);
});

// Static asset serving for rendered slide PNGs
app.use('/api/assets', express.static(ASSETS_DIR));

// Status & Cockpit Overview
app.get('/api/status', (req, res) => {
  const schedulerStatus = scheduler.getStatus();
  const schedule = db.getSchedule();
  const linkedin = db.getLinkedIn();
  const instagram = db.getInstagram();
  const usage = db.getUsage();
  const campaigns = db.getCampaigns();

  res.json({
    schedulerRunning: schedulerStatus.isRunning,
    currentServerTime: new Date().toISOString(),
    timezone: schedule.timezone,
    currentTzTime: schedulerStatus.currentTzTime,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    linkedinReady: linkedin.isConnected || linkedin.isTestMode,
    instagramReady: instagram.isConnected || instagram.isTestMode,
    linkedinConnected: linkedin.isConnected,
    instagramConnected: instagram.isConnected,
    isTestMode: linkedin.isTestMode && instagram.isTestMode,
    globalPaused: schedule.globalPaused,
    linkedinPaused: schedule.linkedinPaused,
    instagramPaused: schedule.instagramPaused,
    autoPublishEnabled: schedule.autoPublishEnabled,
    queueLength: campaigns.length,
    todayPostsCount: {
      linkedin: usage.todayPostsLinkedIn,
      instagram: usage.todayPostsInstagram,
    },
    todayUsage: usage,
  });
});

// Vercel Cron or External Webhook Trigger
app.all('/api/cron', async (req, res) => {
  try {
    await scheduler.tick();
    res.json({ ok: true, timestamp: new Date().toISOString(), message: 'Scheduler tick executed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Marketing Strategy
app.get('/api/strategy', (req, res) => {
  res.json(db.getStrategy());
});

app.put('/api/strategy', (req, res) => {
  const updated = db.saveStrategy(req.body);
  res.json(updated);
});

// Scheduling & Autopilot Rules
app.get('/api/schedule', (req, res) => {
  res.json(db.getSchedule());
});

app.put('/api/schedule', (req, res) => {
  const updated = db.saveSchedule(req.body);
  res.json(updated);
});

// Emergency Pause Switch
app.post('/api/emergency-pause', (req, res) => {
  const schedule = db.getSchedule();
  schedule.globalPaused = !schedule.globalPaused;
  db.saveSchedule(schedule);
  db.addLog({
    campaignId: 'system',
    campaignTitle: 'Emergency Pause Controller',
    platform: 'linkedin',
    action: 'scheduled_trigger',
    status: schedule.globalPaused ? 'paused' : 'success',
    message: schedule.globalPaused
      ? 'Emergency Pause ACTIVATED. All automated publishing stopped.'
      : 'Autopilot RESUMED. Scheduled jobs will resume processing.',
  });
  res.json({ globalPaused: schedule.globalPaused });
});

// Integrations: LinkedIn
app.get('/api/integrations/linkedin', (req, res) => {
  const creds = db.getLinkedIn();
  // Never expose raw clientSecret to frontend
  res.json({
    ...creds,
    clientSecret: creds.clientSecret ? '••••••••••••' : '',
  });
});

app.put('/api/integrations/linkedin', (req, res) => {
  const current = db.getLinkedIn();
  const updateData = { ...req.body };
  // Preserve secret if user didn't change masked string
  if (updateData.clientSecret === '••••••••••••') {
    updateData.clientSecret = current.clientSecret;
  }
  const updated = db.saveLinkedIn(updateData);
  res.json({
    ...updated,
    clientSecret: updated.clientSecret ? '••••••••••••' : '',
  });
});

// LinkedIn OAuth Redirect Flow
app.get('/api/auth/linkedin/url', (req, res) => {
  try {
    const creds = db.getLinkedIn();
    const url = getLinkedInAuthUrl(creds);
    res.json({ url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error) {
    return res.redirect(`/?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect('/?auth_error=No_code_provided');
  }

  try {
    const creds = db.getLinkedIn();
    const result = await exchangeLinkedInCode(code, creds);
    db.saveLinkedIn({
      accessToken: result.accessToken,
      memberUrn: result.memberUrn,
      memberName: result.memberName,
      isConnected: true,
      tokenExpiresAt: new Date(Date.now() + result.expiresIn * 1000).toISOString(),
      lastVerifiedAt: new Date().toISOString(),
    });
    res.redirect('/?auth_success=linkedin');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.redirect(`/?auth_error=${encodeURIComponent(msg)}`);
  }
});

// Integrations: Instagram
app.get('/api/integrations/instagram', (req, res) => {
  const creds = db.getInstagram();
  res.json({
    ...creds,
    metaAppSecret: creds.metaAppSecret ? '••••••••••••' : '',
    userAccessToken: creds.userAccessToken ? '••••••••••••' : '',
    publicHostUrl: creds.publicHostUrl || process.env.APP_URL || '',
  });
});

app.put('/api/integrations/instagram', async (req, res) => {
  const current = db.getInstagram();
  const updateData = { ...req.body };
  if (updateData.metaAppSecret === '••••••••••••') {
    updateData.metaAppSecret = current.metaAppSecret;
  }
  if (updateData.userAccessToken === '••••••••••••') {
    updateData.userAccessToken = current.userAccessToken;
  }

  // Normalize publicHostUrl
  if (updateData.publicHostUrl && !updateData.publicHostUrl.startsWith('http')) {
    updateData.publicHostUrl = `https://${updateData.publicHostUrl.replace(/^\/+/, '')}`;
  }

  let verificationWarning: string | undefined;

  // When unchecking sandbox mode with credentials present, verify live with Meta Graph API
  if (!updateData.isTestMode && updateData.userAccessToken && updateData.instagramBusinessId) {
    try {
      const verifyRes = await verifyInstagramCredentials(
        updateData.instagramBusinessId,
        updateData.userAccessToken
      );
      if (verifyRes.success) {
        updateData.isConnected = true;
        updateData.accountUsername = verifyRes.username;
        updateData.lastVerifiedAt = new Date().toISOString();
        db.addLog({
          campaignId: 'system',
          campaignTitle: 'Instagram Meta Graph API Integration',
          platform: 'instagram',
          action: 'scheduled_trigger',
          status: 'success',
          message: `Connected & verified Meta Instagram account @${verifyRes.username} (ID: ${updateData.instagramBusinessId}). Ready for live carousels.`,
        });
      } else {
        updateData.isConnected = false;
        verificationWarning = verifyRes.error;
        db.addLog({
          campaignId: 'system',
          campaignTitle: 'Instagram Meta Graph API Integration',
          platform: 'instagram',
          action: 'validation_fail',
          status: 'failed',
          message: `Instagram live verification warning: ${verifyRes.error}`,
        });
      }
    } catch (e: any) {
      verificationWarning = e.message;
      updateData.isConnected = false;
    }
  } else if (updateData.isTestMode) {
    updateData.isConnected = false;
  }

  const updated = db.saveInstagram(updateData);
  res.json({
    ...updated,
    metaAppSecret: updated.metaAppSecret ? '••••••••••••' : '',
    userAccessToken: updated.userAccessToken ? '••••••••••••' : '',
    verificationWarning,
  });
});

// Dedicated on-demand verification endpoint for Instagram Meta Graph API
app.post('/api/integrations/instagram/verify', async (req, res) => {
  try {
    const current = db.getInstagram();
    const businessId = (req.body.instagramBusinessId || current.instagramBusinessId || '').trim();
    let token = req.body.userAccessToken;
    if (!token || token === '••••••••••••') {
      token = current.userAccessToken;
    }
    token = (token || '').trim();
    const publicHostUrl = (req.body.publicHostUrl || current.publicHostUrl || '').trim();

    if (!businessId || !token) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both Instagram Business Account ID and Meta User/Page Access Token.',
      });
    }

    const result = await verifyInstagramCredentials(businessId, token);

    if (result.success) {
      const updated = db.saveInstagram({
        instagramBusinessId: businessId,
        userAccessToken: token,
        publicHostUrl: publicHostUrl || current.publicHostUrl,
        isConnected: true,
        isTestMode: false,
        accountUsername: result.username,
        lastVerifiedAt: new Date().toISOString(),
      });

      db.addLog({
        campaignId: 'system',
        campaignTitle: 'Instagram Meta Graph API Integration',
        platform: 'instagram',
        action: 'scheduled_trigger',
        status: 'success',
        message: `Verified Meta Instagram Business Account @${result.username} (ID: ${businessId}). Live 7-slide carousel publishing active.`,
      });

      return res.json({
        success: true,
        isConnected: true,
        accountUsername: result.username,
        name: result.name,
        message: `Verified successfully! Connected as @${result.username}.`,
        credentials: {
          ...updated,
          metaAppSecret: updated.metaAppSecret ? '••••••••••••' : '',
          userAccessToken: updated.userAccessToken ? '••••••••••••' : '',
        },
      });
    } else {
      // Save credentials but keep isConnected: false
      db.saveInstagram({
        instagramBusinessId: businessId,
        userAccessToken: token,
        publicHostUrl: publicHostUrl || current.publicHostUrl,
        isConnected: false,
      });

      db.addLog({
        campaignId: 'system',
        campaignTitle: 'Instagram Meta Graph API Integration',
        platform: 'instagram',
        action: 'validation_fail',
        status: 'failed',
        message: `Meta Instagram verification failed: ${result.error}`,
      });

      return res.status(400).json({
        success: false,
        isConnected: false,
        error: result.error,
        details: result.details,
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server error during verification' });
  }
});

// Disconnect Instagram
app.post('/api/integrations/instagram/disconnect', (req, res) => {
  const updated = db.saveInstagram({
    isConnected: false,
    isTestMode: true,
  });
  db.addLog({
    campaignId: 'system',
    campaignTitle: 'Instagram Integration',
    platform: 'instagram',
    action: 'scheduled_trigger',
    status: 'paused',
    message: 'Instagram integration disconnected. Returned to Sandbox Mode.',
  });
  res.json({
    ...updated,
    metaAppSecret: updated.metaAppSecret ? '••••••••••••' : '',
    userAccessToken: updated.userAccessToken ? '••••••••••••' : '',
  });
});

// Campaigns
app.get('/api/campaigns', (req, res) => {
  res.json(db.getCampaigns());
});

app.get('/api/campaigns/:id', (req, res) => {
  const camp = db.getCampaign(req.params.id);
  if (!camp) return res.status(404).json({ error: 'Campaign not found' });
  res.json(camp);
});

app.post('/api/campaigns', (req, res) => {
  const camp = db.saveCampaign(req.body);
  res.status(201).json(camp);
});

app.put('/api/campaigns/:id', (req, res) => {
  const existing = db.getCampaign(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Campaign not found' });
  const updated = db.saveCampaign({ ...existing, ...req.body, id: req.params.id });
  res.json(updated);
});

app.delete('/api/campaigns/:id', (req, res) => {
  const success = db.deleteCampaign(req.params.id);
  if (!success) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ success: true });
});

// AI Generation Endpoints
app.post('/api/campaigns/generate', async (req, res) => {
  try {
    const campaign = await generateSingleCampaign(req.body);
    // Pre-render PNG slides immediately
    try {
      await renderCampaignSlides(campaign.id, 'portrait_4_5');
    } catch (e) {
      console.warn('Initial slide pre-render warning:', e);
    }
    const fresh = db.getCampaign(campaign.id);
    res.json(fresh || campaign);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.post('/api/campaigns/generate-batch', async (req, res) => {
  try {
    const campaigns = await generateDailyBatch();
    // Pre-render slides for each
    for (const c of campaigns) {
      try {
        await renderCampaignSlides(c.id, 'portrait_4_5');
      } catch (e) {
        console.warn(`Batch slide render error on ${c.id}:`, e);
      }
    }
    res.json(db.getCampaigns());
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Enforce & Validate CTA Rotation Rules across the 4 daily posts
app.post('/api/campaigns/enforce-ctas', async (req, res) => {
  try {
    const all = db.getCampaigns();
    const targetSlice = all.slice(0, 4);
    const { validation, campaigns: revised } = validateAndEnforceDailyBatch(targetSlice);

    // Save revised campaigns back to db
    for (const c of revised) {
      db.saveCampaign(c);
      // Re-render slides to ensure Slide 7 displays the revised CTA
      try {
        await renderCampaignSlides(c.id, 'portrait_4_5');
      } catch (renderErr) {
        console.warn(`Could not auto-render revised campaign ${c.id}:`, renderErr);
      }
    }

    res.json({
      validation,
      campaigns: db.getCampaigns(),
      message: validation.valid
        ? 'All 4 posts adhere to the CTA rotation rules (2x Calculator, 2x Distinct Alternative CTAs).'
        : `CTA rules enforced and revised (${validation.issues.length} adjustments made).`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Slide Rendering
app.post('/api/campaigns/:id/render', async (req, res) => {
  try {
    const format = req.body.format || 'portrait_4_5';
    const assets = await renderCampaignSlides(req.params.id, format);
    const campaign = db.getCampaign(req.params.id);
    res.json({ assets, campaign });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Download All 7 Slides as ZIP
app.get('/api/campaigns/:id/download-zip', async (req, res) => {
  try {
    const campaign = db.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (!campaign.renderedAssets || campaign.renderedAssets.length < 7) {
      await renderCampaignSlides(campaign.id, 'portrait_4_5');
    }

    const zip = new JSZip();
    const assets = campaign.renderedAssets;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const filePath = path.join(ASSETS_DIR, asset.filename);
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        zip.file(`slide_${asset.slideIndex || i + 1}.png`, fileData);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${campaign.id}-7slides.zip"`);
    res.send(zipBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Publishing
app.post('/api/campaigns/:id/publish', async (req, res) => {
  try {
    const platform = req.body.platform as 'linkedin' | 'instagram' | 'both';
    const result = await scheduler.runImmediate(req.params.id, platform);
    const fresh = db.getCampaign(req.params.id);
    res.json({ result, campaign: fresh });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Logs and Quota
app.get('/api/logs', (req, res) => {
  res.json(db.getLogs(150));
});

app.get('/api/usage', (req, res) => {
  res.json(db.getUsage());
});

async function startServer() {
  // Start the background scheduler (tick checks every 30s)
  scheduler.start();

  const isProd =
    process.env.NODE_ENV === 'production' ||
    !!process.env.RENDER;

  // If in development mode and Vite can run, mount Vite middleware
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('[Server] Could not start Vite dev middleware, falling back to static dist:', viteErr);
      serveStaticDist();
    }
  } else {
    serveStaticDist();
  }

  function serveStaticDist() {
    let distPath = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (fs.existsSync(path.resolve(process.cwd(), 'index.html'))) {
        distPath = process.cwd();
      }
    }

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      const candidates = [
        path.join(distPath, 'index.html'),
        path.resolve(process.cwd(), 'dist', 'index.html'),
        path.resolve(process.cwd(), 'index.html'),
      ];

      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return res.sendFile(cand);
        }
      }

      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Stepstone AI Agency - Autopilot</title></head>
          <body style="font-family:sans-serif;padding:40px;background:#0f172a;color:#f8fafc;">
            <h2>Stepstone AI Agency Autopilot</h2>
            <p>Dist assets are initializing. Please refresh in a moment.</p>
          </body>
        </html>
      `);
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Autopilot Server] Running on http://${HOST}:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('[Autopilot Server] Startup failed:', err);
  });
}
