import fs from 'fs';
import path from 'path';
import { db } from './db';
import { publishToLinkedIn } from './linkedin';
import { publishToInstagram } from './instagram';
import { renderCampaignSlides } from './renderer';

const ASSETS_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data', 'assets')
  : path.resolve(process.cwd(), 'data', 'assets');

class AutopilotScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Scheduler] Background Marketing Autopilot Scheduler started.');

    // Run tick check every 30 seconds
    this.timer = setInterval(() => {
      this.tick().catch((err) => console.error('[Scheduler] Error in scheduler tick:', err));
    }, 30000);

    // Initial tick on start
    setTimeout(() => {
      this.tick().catch((err) => console.error('[Scheduler] Error in initial tick:', err));
    }, 5000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Scheduler] Background Scheduler stopped.');
  }

  getStatus() {
    const schedule = db.getSchedule();
    const campaigns = db.getCampaigns();
    const now = new Date();

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: schedule.timezone,
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(now);

    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const currentTzTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const pendingCount = campaigns.filter(
      (c) =>
        (c.platforms.linkedin.enabled && c.platforms.linkedin.status === 'scheduled') ||
        (c.platforms.instagram.enabled && c.platforms.instagram.status === 'scheduled')
    ).length;

    return {
      isRunning: this.isRunning,
      isProcessing: this.isProcessing,
      timezone: schedule.timezone,
      currentTzTime,
      globalPaused: schedule.globalPaused,
      autoPublishEnabled: schedule.autoPublishEnabled,
      pendingCount,
    };
  }

  async tick() {
    if (this.isProcessing) return;
    const schedule = db.getSchedule();
    if (schedule.globalPaused) return;

    this.isProcessing = true;
    try {
      const campaigns = db.getCampaigns();
      const now = new Date();

      // Extract current hour and minute in user's configured timezone
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: schedule.timezone,
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
      }).formatToParts(now);

      const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
      const currentTotalMinutes = hour * 60 + minute;
      const currentTimeSlot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      // Target active queue (the 4 daily target posts)
      const queueCampaigns = campaigns.slice(0, schedule.dailyTargetPosts || 4);

      for (let i = 0; i < queueCampaigns.length; i++) {
        const campaign = queueCampaigns[i];
        const assignedSlot =
          campaign.scheduledTime ||
          schedule.dailySlots[i % schedule.dailySlots.length] ||
          '08:15';
        const [slotH, slotM] = assignedSlot.split(':').map((v) => parseInt(v, 10) || 0);
        const slotTotalMinutes = slotH * 60 + slotM;

        // Is this slot due or overdue?
        // Slot is due if current timezone time is >= scheduled slot time
        const isSlotDue = currentTotalMinutes >= slotTotalMinutes;

        const liStatus = campaign.platforms?.linkedin?.status;
        const igStatus = campaign.platforms?.instagram?.status;

        // Check if already published
        const isIgPublished = igStatus === 'published';
        const isLiPublished = liStatus === 'published';

        if (schedule.autoPublishEnabled && isSlotDue) {
          // Instagram Auto-Publishing check
          const canPublishIg =
            campaign.platforms?.instagram?.enabled &&
            !schedule.instagramPaused &&
            !isIgPublished &&
            igStatus !== 'publishing' &&
            (campaign.platforms.instagram.retryCount || 0) < 3;

          // LinkedIn Auto-Publishing check
          const canPublishLi =
            campaign.platforms?.linkedin?.enabled &&
            !schedule.linkedinPaused &&
            !isLiPublished &&
            liStatus !== 'publishing' &&
            (campaign.platforms.linkedin.retryCount || 0) < 3;

          if (canPublishIg || canPublishLi) {
            console.log(
              `[Scheduler] Slot ${assignedSlot} is DUE (Current ${schedule.timezone} time: ${currentTimeSlot}). Auto-publishing campaign "${campaign.title}"...`
            );

            // Pre-render slides if needed
            if (!campaign.renderedAssets || campaign.renderedAssets.length < 7) {
              try {
                await renderCampaignSlides(campaign.id, 'portrait_4_5');
              } catch (renderErr) {
                console.error(`[Scheduler] Failed to pre-render slides for ${campaign.id}:`, renderErr);
                continue;
              }
            }

            // Publish to Instagram
            if (canPublishIg) {
              console.log(`[Scheduler] Auto-publishing to Instagram for slot ${assignedSlot}...`);
              await publishToInstagram(campaign.id);
            }

            // Publish to LinkedIn
            if (canPublishLi) {
              console.log(`[Scheduler] Auto-publishing to LinkedIn for slot ${assignedSlot}...`);
              await publishToLinkedIn(campaign.id);
            }

            // Brief pause between posts to respect platform rate limits
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async runImmediate(campaignId: string, targetPlatform?: 'linkedin' | 'instagram' | 'both') {
    const campaign = db.getCampaign(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    // Ensure slides are rendered AND exist physically on disk
    let needsRender = !campaign.renderedAssets || campaign.renderedAssets.length < 7;
    if (!needsRender && campaign.renderedAssets) {
      for (const asset of campaign.renderedAssets) {
        const filePath = path.join(ASSETS_DIR, asset.filename || path.basename(asset.url));
        if (!fs.existsSync(filePath)) {
          needsRender = true;
          break;
        }
      }
    }

    if (needsRender) {
      await renderCampaignSlides(campaign.id, 'portrait_4_5');
    }

    const results: Record<string, any> = {};

    if (targetPlatform === 'linkedin' || targetPlatform === 'both' || !targetPlatform) {
      if (campaign.platforms.linkedin.enabled) {
        results.linkedin = await publishToLinkedIn(campaign.id, true);
      }
    }

    if (targetPlatform === 'instagram' || targetPlatform === 'both' || !targetPlatform) {
      if (campaign.platforms.instagram.enabled) {
        results.instagram = await publishToInstagram(campaign.id);
      }
    }

    return results;
  }
}

export const scheduler = new AutopilotScheduler();
