import { db } from './db';
import { publishToLinkedIn } from './linkedin';
import { publishToInstagram } from './instagram';
import { renderCampaignSlides } from './renderer';

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

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: schedule.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const currentTzTime = formatter.format(now);

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

      // Format current time in user's configured timezone: e.g. "08:15"
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: schedule.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const currentTimeSlot = formatter.format(now);

      for (const campaign of campaigns) {
        // If autoPublish is enabled and this campaign matches the scheduled time slot or is due
        const liStatus = campaign.platforms.linkedin.status;
        const igStatus = campaign.platforms.instagram.status;

        const isDueTime = campaign.scheduledTime === currentTimeSlot;

        // If campaign is scheduled and due, or user triggered autoPublish
        if (schedule.autoPublishEnabled && isDueTime) {
          // Pre-render slides if needed
          if (!campaign.renderedAssets || campaign.renderedAssets.length < 7) {
            try {
              await renderCampaignSlides(campaign.id, 'portrait_4_5');
            } catch (renderErr) {
              console.error(`Failed to render slides for ${campaign.id}:`, renderErr);
              continue;
            }
          }

          // Publish to LinkedIn
          if (
            campaign.platforms.linkedin.enabled &&
            !schedule.linkedinPaused &&
            (liStatus === 'scheduled' || liStatus === 'draft')
          ) {
            console.log(`[Scheduler] Auto-publishing campaign "${campaign.title}" to LinkedIn...`);
            await publishToLinkedIn(campaign.id);
          }

          // Publish to Instagram
          if (
            campaign.platforms.instagram.enabled &&
            !schedule.instagramPaused &&
            (igStatus === 'scheduled' || igStatus === 'draft')
          ) {
            console.log(`[Scheduler] Auto-publishing campaign "${campaign.title}" to Instagram...`);
            await publishToInstagram(campaign.id);
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

    // Ensure slides are rendered
    if (!campaign.renderedAssets || campaign.renderedAssets.length < 7) {
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
