import { GoogleGenAI } from '@google/genai';
import { Campaign, ContentPillarId, SlideTheme } from '../src/types/index';
import { db } from './db';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

interface GenerateCampaignParams {
  pillarId?: ContentPillarId;
  customTopic?: string;
  theme?: SlideTheme;
  targetSlot?: string; // e.g. "08:15"
}

// Bounded exponential backoff retry helper
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, initialDelayMs = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isQuotaError = errorMessage.toLowerCase().includes('quota') || errorMessage.includes('429');
      if (isQuotaError) {
        console.error('Gemini quota error encountered, stopping retries to preserve state:', errorMessage);
        throw new Error(`Gemini API Quota Exceeded: ${errorMessage}`);
      }
      if (attempt >= maxRetries) {
        throw err;
      }
      const delay = initialDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Gemini API transient failure (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry exhausted');
}

export async function generateSingleCampaign(params: GenerateCampaignParams = {}): Promise<Campaign> {
  const strategy = db.getStrategy();
  const usage = db.getUsage();

  if (usage.todayGeminiRequests >= usage.maxDailyGeminiRequests) {
    throw new Error(`Daily Gemini generation limit reached (${usage.todayGeminiRequests}/${usage.maxDailyGeminiRequests} requests). You can adjust this limit in Quota settings.`);
  }

  const selectedPillar = strategy.customPillars.find((p) => p.id === params.pillarId) || strategy.customPillars[0];
  const theme: SlideTheme = params.theme || (['modern-navy', 'garage-amber', 'precision-blueprint', 'emerald-minimal'][Math.floor(Math.random() * 4)] as SlideTheme);
  const scheduledTime = params.targetSlot || '11:45';

  const systemInstruction = `You are a senior B2B marketing director specializing in trade contractor dispatch automation, specifically garage door repair and installation companies in the United States.

Your product: ${strategy.businessName} - ${strategy.coreService}.
Demo phone number to test live: ${strategy.demoPhoneNumber}.
Brand voice: ${strategy.toneOfVoice}.

STRICT CONTENT SAFETY RULES:
- Never fabricate customer names, fake reviews, or invent unverified statistics.
- Avoid hyperbole (do NOT say "guaranteed $50k profit this week" or "fire all your staff").
- Focus on real contractor operational realities: technicians on 12ft ladders with impact drivers, emergency broken torsion springs at 9 PM with vehicles trapped inside, answering the phone in under 1 second, and avoiding Google LSA wasted spend.
- You must generate EXACTLY seven (7) slides for a LinkedIn and Instagram carousel.
- Platform adaptations:
  * LinkedIn: Professional, authoritative, dispatch-focused, respectful of technicians, includes relevant B2B hashtags.
  * Instagram: Punchy opening hook, clear carousel cues (Swipe ➡️), high visual interest, concise caption, relevant contractor hashtags.
`;

  const prompt = `Generate a complete high-converting 7-slide marketing carousel campaign for garage door repair business owners.

Selected Content Pillar: ${selectedPillar.title} (${selectedPillar.description})
Content Angle: ${selectedPillar.defaultAngle}
${params.customTopic ? `Specific Topic Angle: ${params.customTopic}` : ''}

You MUST return a JSON object with this EXACT structure:
{
  "title": "Campaign headline",
  "targetAudience": "Target audience description",
  "objective": "Primary marketing goal",
  "contentAngleExplanation": "Brief 1-2 sentence explanation of why this angle connects with garage door contractors",
  "linkedinCaption": "Complete post caption with paragraphs and hashtags",
  "linkedinHashtags": ["#GarageDoorRepair", "#FieldService", ...],
  "instagramCaption": "Complete post caption with emojis, swipe cues, and hashtags",
  "instagramHashtags": ["#garagedoors", "#contractor", ...],
  "slides": [
    {
      "slideNumber": 1,
      "headline": "Bold Hook Headline (max 8 words)",
      "bodyText": "1-2 punchy sentences addressing the problem (max 25 words)",
      "supportingLabel": "BADGE LABEL (max 4 words)",
      "layoutType": "hook_title",
      "icon": "phone-missed",
      "visualInstruction": "Layout and visual guide",
      "highlightMetric": { "value": "74%", "label": "Hang up on voicemail" }
    },
    ... (MUST HAVE EXACTLY 7 SLIDES numbered 1 to 7)
    Slide 2 layoutType: "problem_stat" (with bulletPoints and math/economics)
    Slide 3 layoutType: "breakdown_list" (root causes of missed calls)
    Slide 4 layoutType: "call_flow" (step 1 to 4 how the voice AI answers on ring 2)
    Slide 5 layoutType: "solution_feature" (what the caller experiences)
    Slide 6 layoutType: "metrics_grid" (contractor operational checklist)
    Slide 7 layoutType: "cta_action" (highlightMetric with demo phone ${strategy.demoPhoneNumber})
  ]
}`;

  const response = await retryWithBackoff(async () => {
    return await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });
  });

  const jsonText = response.text?.trim() || '{}';
  let parsedData: any;
  try {
    parsedData = JSON.parse(jsonText);
  } catch (parseErr) {
    console.error('Failed to parse Gemini response as JSON:', jsonText);
    throw new Error('Gemini returned an invalid JSON response structure.');
  }

  db.recordGeminiCall(1400);

  const campaignId = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const campaign: Campaign = {
    id: campaignId,
    title: parsedData.title || `${selectedPillar.title} Campaign`,
    targetAudience: parsedData.targetAudience || strategy.targetAudience,
    pillarId: selectedPillar.id,
    objective: parsedData.objective || 'Educate garage door contractors on voice AI dispatch capture',
    contentAngleExplanation: parsedData.contentAngleExplanation || selectedPillar.defaultAngle,
    theme,
    scheduledTime,
    slides: (parsedData.slides || []).slice(0, 7).map((s: any, idx: number) => ({
      slideNumber: idx + 1,
      headline: s.headline || `Slide ${idx + 1} Headline`,
      bodyText: s.bodyText || '',
      supportingLabel: s.supportingLabel || `PILLAR 0${idx + 1}`,
      layoutType: s.layoutType || (idx === 0 ? 'hook_title' : idx === 6 ? 'cta_action' : 'solution_feature'),
      icon: s.icon || 'check-circle',
      visualInstruction: s.visualInstruction || '',
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
      highlightMetric: s.highlightMetric ? { value: s.highlightMetric.value, label: s.highlightMetric.label } : undefined,
    })),
    platforms: {
      linkedin: {
        enabled: true,
        caption: parsedData.linkedinCaption || '',
        hashtags: parsedData.linkedinHashtags || ['#GarageDoorRepair', '#TradeContractor'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: parsedData.instagramCaption || '',
        hashtags: parsedData.instagramHashtags || ['#garagedoorrepair', '#tradesman'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    renderedAssets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.saveCampaign(campaign);

  db.addLog({
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    platform: 'linkedin',
    action: 'scheduled_trigger',
    status: 'success',
    message: `Generated 7-slide marketing campaign for pillar "${selectedPillar.title}" using ${MODEL_NAME}.`,
  });

  return campaign;
}

// Batch generation for 4 daily campaigns
export async function generateDailyBatch(): Promise<Campaign[]> {
  const schedule = db.getSchedule();
  const pillars: ContentPillarId[] = [
    'missed-calls',
    'after-hours',
    'lead-capture-booking',
    'objections-faqs',
  ];

  const campaigns: Campaign[] = [];

  for (let i = 0; i < schedule.dailySlots.length; i++) {
    const slot = schedule.dailySlots[i];
    const pillarId = pillars[i % pillars.length];
    try {
      const camp = await generateSingleCampaign({
        pillarId,
        targetSlot: slot,
      });
      campaigns.push(camp);
    } catch (err) {
      console.error(`Failed to generate campaign for slot ${slot}:`, err);
      // Don't abort entire batch if one fails, continue and log
    }
  }

  return campaigns;
}
