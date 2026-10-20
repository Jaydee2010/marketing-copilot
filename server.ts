import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import JSZip from 'jszip';
import { db } from './server/db';
import { scheduler } from './server/scheduler';
import { generateSingleCampaign, generateDailyBatch } from './server/gemini';
import { renderCampaignSlides } from './server/renderer';
import { publishToLinkedIn, getLinkedInAuthUrl, exchangeLinkedInCode } from './server/linkedin';
import { publishToInstagram } from './server/instagram';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ASSETS_DIR = path.resolve(process.cwd(), 'data', 'assets');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));

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

app.put('/api/integrations/instagram', (req, res) => {
  const current = db.getInstagram();
  const updateData = { ...req.body };
  if (updateData.metaAppSecret === '••••••••••••') {
    updateData.metaAppSecret = current.metaAppSecret;
  }
  if (updateData.userAccessToken === '••••••••••••') {
    updateData.userAccessToken = current.userAccessToken;
  }
  const updated = db.saveInstagram(updateData);
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
  // Start the background scheduler
  scheduler.start();

  // If in development mode, hook up Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Autopilot Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Autopilot Server] Startup failed:', err);
});
