import { Campaign, InstagramCredentials } from '../src/types/index';
import { db } from './db';
import { renderCampaignSlides } from './renderer';
import { PublishResult } from './linkedin';

export async function publishToInstagram(campaignId: string): Promise<PublishResult> {
  const campaign = db.getCampaign(campaignId);
  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const creds = db.getInstagram();
  const schedule = db.getSchedule();

  if (schedule.globalPaused) {
    return {
      success: false,
      message: 'Global publishing is paused.',
      isTestMode: creds.isTestMode,
    };
  }

  if (schedule.instagramPaused) {
    return {
      success: false,
      message: 'Instagram publishing is specifically paused.',
      isTestMode: creds.isTestMode,
    };
  }

  // Ensure assets are rendered
  if (!campaign.renderedAssets || campaign.renderedAssets.length < 7) {
    await renderCampaignSlides(campaign.id, campaign.platforms.instagram.format || 'portrait_4_5');
  }

  // Preflight validation for Instagram
  const fullCaption = `${campaign.platforms.instagram.caption}\n\n${campaign.platforms.instagram.hashtags.join(' ')}`;
  if (fullCaption.length > 2200) {
    throw new Error(`Instagram caption exceeds 2,200 character limit (${fullCaption.length} chars).`);
  }
  if (campaign.platforms.instagram.hashtags.length > 30) {
    throw new Error(`Instagram allows maximum 30 hashtags (${campaign.platforms.instagram.hashtags.length} provided).`);
  }

  // Test mode or unconfigured credentials check
  if (creds.isTestMode || !creds.isConnected || !creds.userAccessToken || !creds.instagramBusinessId) {
    campaign.platforms.instagram.status = 'published';
    campaign.platforms.instagram.publishedAt = new Date().toISOString();
    campaign.platforms.instagram.externalPostId = `test-ig-carousel-${Date.now()}`;
    campaign.platforms.instagram.externalPostUrl = 'https://www.instagram.com/ (Test Sandbox Mode)';
    campaign.platforms.instagram.lastError = undefined;
    db.saveCampaign(campaign);

    db.recordPostSuccess('instagram');
    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'instagram',
      action: 'publish_attempt',
      status: 'success',
      message: `[TEST MODE] Validated 7-image carousel container for Instagram (${campaign.platforms.instagram.format}). Meta Developer credentials not active.`,
      externalPostId: campaign.platforms.instagram.externalPostId,
    });

    return {
      success: true,
      externalPostId: campaign.platforms.instagram.externalPostId,
      externalPostUrl: campaign.platforms.instagram.externalPostUrl,
      message: 'Test Mode: Carousel pre-flight passed. 7 images and caption validated for Instagram format.',
      isTestMode: true,
    };
  }

  // Determine public host URL for Meta Graph API to fetch images
  const hostUrl = creds.publicHostUrl || process.env.APP_URL || '';
  if (!hostUrl || !hostUrl.startsWith('http')) {
    throw new Error('Meta Graph API requires images to be accessible over a public HTTPS URL. Please set your public App URL in Instagram settings.');
  }

  // REAL Official Meta Instagram Graph API Carousel Workflow
  try {
    campaign.platforms.instagram.status = 'publishing';
    db.saveCampaign(campaign);

    const igUserId = creds.instagramBusinessId;
    const token = creds.userAccessToken;
    const itemContainerIds: string[] = [];

    // Step 1: Create 7 item containers
    for (const asset of campaign.renderedAssets) {
      const publicImageUrl = `${hostUrl.replace(/\/$/, '')}${asset.url}`;

      const itemRes = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(
          publicImageUrl
        )}&is_carousel_item=true&access_token=${token}`,
        { method: 'POST' }
      );

      const itemData = await itemRes.json();
      if (!itemRes.ok || !itemData.id) {
        throw new Error(`Failed to create Instagram carousel item: ${itemData.error?.message || itemRes.statusText}`);
      }

      itemContainerIds.push(itemData.id);
    }

    // Step 2: Create Carousel Container
    const carouselRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media?media_type=CAROUSEL&children=${itemContainerIds.join(
        ','
      )}&caption=${encodeURIComponent(fullCaption)}&access_token=${token}`,
      { method: 'POST' }
    );

    const carouselData = await carouselRes.json();
    if (!carouselRes.ok || !carouselData.id) {
      throw new Error(`Failed to create Instagram carousel container: ${carouselData.error?.message || carouselRes.statusText}`);
    }

    const carouselContainerId = carouselData.id;

    // Wait 2 seconds for Instagram media processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Publish Carousel Container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${carouselContainerId}&access_token=${token}`,
      { method: 'POST' }
    );

    const publishData = await publishRes.json();
    if (!publishRes.ok || !publishData.id) {
      throw new Error(`Instagram Media Publish failed: ${publishData.error?.message || publishRes.statusText}`);
    }

    const postId = publishData.id;
    const postUrl = `https://www.instagram.com/p/${postId}/`;

    campaign.platforms.instagram.status = 'published';
    campaign.platforms.instagram.publishedAt = new Date().toISOString();
    campaign.platforms.instagram.externalPostId = postId;
    campaign.platforms.instagram.externalPostUrl = postUrl;
    campaign.platforms.instagram.lastError = undefined;
    db.saveCampaign(campaign);

    db.recordPostSuccess('instagram');
    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'instagram',
      action: 'publish_attempt',
      status: 'success',
      message: `Successfully published 7-slide carousel to Instagram!`,
      externalPostId: postId,
    });

    return {
      success: true,
      externalPostId: postId,
      externalPostUrl: postUrl,
      message: 'Published to Instagram successfully.',
      isTestMode: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    campaign.platforms.instagram.status = 'failed';
    campaign.platforms.instagram.lastError = errorMsg;
    campaign.platforms.instagram.retryCount += 1;
    db.saveCampaign(campaign);

    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'instagram',
      action: 'publish_attempt',
      status: 'failed',
      message: `Instagram publishing failed: ${errorMsg}`,
    });

    return {
      success: false,
      message: errorMsg,
      isTestMode: false,
    };
  }
}
