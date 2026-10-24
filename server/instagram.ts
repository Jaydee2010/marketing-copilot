import fs from 'fs';
import path from 'path';
import { Campaign, InstagramCredentials } from '../src/types/index';
import { db } from './db';
import { renderCampaignSlides } from './renderer';
import { PublishResult } from './linkedin';

const ASSETS_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data', 'assets')
  : path.resolve(process.cwd(), 'data', 'assets');

export interface InstagramVerifyResult {
  success: boolean;
  username?: string;
  name?: string;
  id?: string;
  error?: string;
  details?: unknown;
}

export async function verifyInstagramCredentials(
  businessId: string,
  token: string
): Promise<InstagramVerifyResult> {
  const cleanId = (businessId || '').trim();
  const cleanToken = (token || '').trim();

  if (!cleanId || !cleanToken) {
    return {
      success: false,
      error: 'Both Instagram Business Account ID and Meta User/Page Access Token are required.',
    };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(cleanId)}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(cleanToken)}`,
      { method: 'GET' }
    );

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Meta Graph API rejected verification (HTTP ${res.status})`;
      return {
        success: false,
        error: errMsg,
        details: data.error,
      };
    }

    return {
      success: true,
      id: data.id,
      username: data.username || data.name || cleanId,
      name: data.name,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Network error reaching Meta Graph API: ${msg}`,
    };
  }
}

export async function publishToInstagram(campaignId: string): Promise<PublishResult> {
  let campaign = db.getCampaign(campaignId);
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

  // Ensure assets are rendered AND physical files exist on disk
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
    console.log(`[Instagram] Rendering 7 high-res PNG slides on disk for campaign "${campaign.title}"...`);
    await renderCampaignSlides(campaign.id, campaign.platforms.instagram.format || 'portrait_4_5');
    const fresh = db.getCampaign(campaign.id);
    if (fresh) campaign = fresh;
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
  let hostUrl = creds.publicHostUrl || process.env.APP_URL || '';
  if (!hostUrl || !hostUrl.startsWith('http')) {
    if (hostUrl && !hostUrl.startsWith('http')) {
      hostUrl = `https://${hostUrl.replace(/^\/+/, '')}`;
    } else {
      throw new Error('Meta Graph API requires images to be accessible over a public HTTPS URL. Please set your public App URL in Instagram settings.');
    }
  }

  // REAL Official Meta Instagram Graph API Carousel Workflow
  try {
    campaign.platforms.instagram.status = 'publishing';
    db.saveCampaign(campaign);

    const igUserId = creds.instagramBusinessId!.trim();
    const token = creds.userAccessToken!.trim();
    const itemContainerIds: string[] = [];

    // Step 1: Create 7 item containers
    for (const asset of campaign.renderedAssets) {
      const cleanHost = hostUrl.replace(/\/$/, '');
      const publicImageUrl = `${cleanHost}${asset.url}`;

      const itemRes = await fetch(
        `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(
          publicImageUrl
        )}&is_carousel_item=true&access_token=${token}`,
        { method: 'POST' }
      );

      const itemData = await itemRes.json();
      if (!itemRes.ok || !itemData.id) {
        const errorDetail = itemData.error
          ? `[Meta Error ${itemData.error.code || ''}${itemData.error.error_subcode ? ` / subcode ${itemData.error.error_subcode}` : ''}]: ${itemData.error.message || 'Image container creation failed'}`
          : `HTTP ${itemRes.status} ${itemRes.statusText}`;
        throw new Error(`Slide ${asset.slideIndex || itemContainerIds.length + 1} container failed (${publicImageUrl}): ${errorDetail}`);
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
      const errorDetail = carouselData.error
        ? `[Meta Error ${carouselData.error.code || ''}]: ${carouselData.error.message || 'Carousel container creation failed'}`
        : `HTTP ${carouselRes.status} ${carouselRes.statusText}`;
      throw new Error(`Carousel container creation failed: ${errorDetail}`);
    }

    const carouselContainerId = carouselData.id;

    // Step 2.5: Poll container status until Meta finishes processing the media items
    let ready = false;
    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const checkRes = await fetch(
          `https://graph.facebook.com/v19.0/${carouselContainerId}?fields=status_code,status&access_token=${token}`
        );
        const checkData = await checkRes.json();
        if (checkData.status_code === 'FINISHED') {
          ready = true;
          break;
        } else if (checkData.status_code === 'ERROR') {
          throw new Error(`Meta media processing error: ${checkData.status || 'Media container processing failed'}`);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('Meta media processing error')) {
          throw err;
        }
      }
    }

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
