import fs from 'fs';
import path from 'path';
import { Campaign, LinkedInCredentials } from '../src/types/index';
import { db } from './db';
import { renderCampaignSlides } from './renderer';

const ASSETS_DIR = path.resolve(process.cwd(), 'data', 'assets');

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  message: string;
  isTestMode: boolean;
  httpStatus?: number;
}

export function getLinkedInAuthUrl(creds: LinkedInCredentials): string {
  if (!creds.clientId || !creds.redirectUri) {
    throw new Error('LinkedIn Client ID and Redirect URI must be configured.');
  }

  const scopes = encodeURIComponent('openid profile email w_member_social');
  const state = Math.random().toString(36).substring(2, 15);
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
    creds.clientId
  )}&redirect_uri=${encodeURIComponent(creds.redirectUri)}&scope=${scopes}&state=${state}`;
}

export async function exchangeLinkedInCode(code: string, creds: LinkedInCredentials): Promise<{ accessToken: string; expiresIn: number; memberUrn: string; memberName: string }> {
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    redirect_uri: creds.redirectUri,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`LinkedIn OAuth Token Exchange Failed: ${data.error_description || data.error || res.statusText}`);
  }

  const accessToken = data.access_token;
  const expiresIn = data.expires_in;

  // Fetch Member Profile info using userinfo endpoint
  let memberUrn = '';
  let memberName = 'LinkedIn Member';

  try {
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      memberUrn = `urn:li:person:${profile.sub}`;
      memberName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn Member';
    }
  } catch (profileErr) {
    console.warn('Could not fetch LinkedIn profile details:', profileErr);
  }

  return { accessToken, expiresIn, memberUrn, memberName };
}

export async function publishToLinkedIn(campaignId: string, force = false): Promise<PublishResult> {
  const campaign = db.getCampaign(campaignId);
  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const creds = db.getLinkedIn();
  const schedule = db.getSchedule();

  if (schedule.globalPaused) {
    return {
      success: false,
      message: 'Global publishing is paused.',
      isTestMode: creds.isTestMode,
    };
  }

  if (schedule.linkedinPaused) {
    return {
      success: false,
      message: 'LinkedIn publishing is specifically paused.',
      isTestMode: creds.isTestMode,
    };
  }

  // Ensure assets are rendered
  if (!campaign.renderedAssets || campaign.renderedAssets.length < 7) {
    await renderCampaignSlides(campaign.id, campaign.platforms.linkedin.format || 'portrait_4_5');
  }

  const accessToken = (creds.accessToken || process.env.LINKEDIN_ACCESS_TOKEN || '').trim();
  const memberUrn = (creds.memberUrn || process.env.LINKEDIN_MEMBER_URN || '').trim();

  // If user explicitly enabled Sandbox / Test Mode in settings
  if (creds.isTestMode) {
    campaign.platforms.linkedin.status = 'draft';
    campaign.platforms.linkedin.lastError = 'Sandbox Mode is ON: Validated 7 slides and caption for LinkedIn, but did not send to LinkedIn API. Uncheck Sandbox Mode in Integrations to publish live.';
    db.saveCampaign(campaign);

    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'linkedin',
      action: 'publish_attempt',
      status: 'skipped',
      message: `[SANDBOX TEST MODE] Validated multi-image post with 7 PNG slides (${campaign.platforms.linkedin.format}). Real LinkedIn credentials not active.`,
    });

    return {
      success: false,
      message: 'Sandbox / Test Mode is active. Uncheck Sandbox Mode in Integrations to post live to LinkedIn.',
      isTestMode: true,
    };
  }

  // If credentials are not provided, FAIL visibly so user knows to connect
  if (!accessToken || !memberUrn) {
    const missingMsg = 'Cannot publish: Missing LinkedIn Access Token or Member URN. Please connect your LinkedIn account in Integrations.';
    campaign.platforms.linkedin.status = 'failed';
    campaign.platforms.linkedin.lastError = missingMsg;
    db.saveCampaign(campaign);

    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'linkedin',
      action: 'publish_attempt',
      status: 'failed',
      message: missingMsg,
    });

    return {
      success: false,
      message: missingMsg,
      isTestMode: false,
    };
  }

  // REAL Official LinkedIn Multi-Image Post API Workflow
  try {
    campaign.platforms.linkedin.status = 'publishing';
    db.saveCampaign(campaign);

    const imageUrns: string[] = [];

    // Step 1: Upload each of the 7 slide images
    for (const asset of campaign.renderedAssets) {
      const filePath = path.join(ASSETS_DIR, asset.filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Asset file missing: ${asset.filename}`);
      }
      const fileBytes = fs.readFileSync(filePath);

      // 1a. Initialize Image Upload
      const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'LinkedIn-Version': '202401',
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initializeUploadRequest: {
            owner: creds.organizationUrn || creds.memberUrn,
          },
        }),
      });

      if (!initRes.ok) {
        const errText = await initRes.text();
        throw new Error(`LinkedIn image upload init failed (${initRes.status}): ${errText}`);
      }

      const initData = await initRes.json();
      const uploadUrl = initData.value.uploadUrl;
      const imageUrn = initData.value.image;

      // 1b. Put raw image bytes
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/png',
        },
        body: fileBytes,
      });

      if (!uploadRes.ok) {
        throw new Error(`LinkedIn image binary upload failed: ${uploadRes.statusText}`);
      }

      imageUrns.push(imageUrn);
    }

    // Step 2: Create Multi-Image Post via official Posts API
    const postPayload = {
      author: creds.organizationUrn || creds.memberUrn,
      commentary: `${campaign.platforms.linkedin.caption}\n\n${campaign.platforms.linkedin.hashtags.join(' ')}`,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        multiImage: {
          images: imageUrns.map((urn, i) => ({
            id: urn,
            altText: `Slide ${i + 1}: ${campaign.slides[i]?.headline || 'Garage Door AI Dispatch'}`,
          })),
        },
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };

    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      throw new Error(`LinkedIn Post Creation Failed (${postRes.status}): ${errText}`);
    }

    const postId = postRes.headers.get('x-restli-id') || `urn:li:share:${Date.now()}`;
    const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

    campaign.platforms.linkedin.status = 'published';
    campaign.platforms.linkedin.publishedAt = new Date().toISOString();
    campaign.platforms.linkedin.externalPostId = postId;
    campaign.platforms.linkedin.externalPostUrl = postUrl;
    campaign.platforms.linkedin.lastError = undefined;
    db.saveCampaign(campaign);

    db.recordPostSuccess('linkedin');
    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'linkedin',
      action: 'publish_attempt',
      status: 'success',
      message: `Successfully published 7-slide carousel to LinkedIn!`,
      externalPostId: postId,
    });

    return {
      success: true,
      externalPostId: postId,
      externalPostUrl: postUrl,
      message: 'Published to LinkedIn successfully.',
      isTestMode: false,
      httpStatus: postRes.status,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    campaign.platforms.linkedin.status = 'failed';
    campaign.platforms.linkedin.lastError = errorMsg;
    campaign.platforms.linkedin.retryCount += 1;
    db.saveCampaign(campaign);

    db.addLog({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      platform: 'linkedin',
      action: 'publish_attempt',
      status: 'failed',
      message: `LinkedIn publishing failed: ${errorMsg}`,
    });

    return {
      success: false,
      message: errorMsg,
      isTestMode: false,
    };
  }
}
