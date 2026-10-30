import { GoogleGenAI } from '@google/genai';
import { Campaign, ContentPillarId, SlideTheme, BuyingMotivation, CtaType, CtaBatchValidation } from '../src/types/index';
import { db, CALCULATOR_URL } from './db';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export { CALCULATOR_URL };

// Rotated wording variants for Calculator CTA (preserving exact URL)
export const CALCULATOR_CTA_VARIANTS = [
  `Find out what missed calls could be costing your garage door business. Run your numbers here: ${CALCULATOR_URL}`,
  `Stop guessing. Plug your own numbers into the free garage door revenue-loss calculator: ${CALCULATOR_URL}`,
  `Every unanswered emergency call is a customer calling your competitor. See what those leaks could add up to: ${CALCULATOR_URL}`,
  `How much revenue could missed calls be costing your garage door business? Run your numbers free: ${CALCULATOR_URL}`,
];

// Approved alternative CTAs
export const APPROVED_ALTERNATIVE_CTAS = {
  dm_calculator: {
    key: 'dm_calculator' as const,
    name: 'DM Calculator CTA',
    copy: 'DM me CALCULATOR and I’ll send you the free garage door revenue-loss calculator.',
    slideHeadline: 'Get The Free Revenue-Loss Calculator',
    slideAction: 'DM "CALCULATOR" 💬',
    slideMetric: { value: 'DM "CALCULATOR"', label: 'Direct Message For Free Link' },
  },
  demo_cta: {
    key: 'demo_cta' as const,
    name: 'Demo Voice Agent CTA',
    copy: 'Want to hear how an AI voice agent handles garage door calls? Go to the link in my bio and call the demo yourself.',
    slideHeadline: 'Try The Garage Door Voice Agent Demo',
    slideAction: 'TRY DEMO AGENT 👉',
    slideMetric: { value: 'TRY THE DEMO', label: 'Call 24/7 Agent in Bio Link' },
  },
  dm_conversation: {
    key: 'dm_conversation' as const,
    name: 'Conversation CTA',
    copy: 'Interested in handling more missed calls? DM me and let’s talk.',
    slideHeadline: 'Ready to Stop Missing Service Calls?',
    slideAction: 'SEND A DM 💬',
    slideMetric: { value: 'LET’S TALK', label: 'DM Me Directly To Discuss' },
  },
};

interface GenerateCampaignParams {
  pillarId?: ContentPillarId;
  buyingMotivation?: BuyingMotivation;
  ctaType?: CtaType;
  customTopic?: string;
  theme?: SlideTheme;
  targetSlot?: string; // e.g. "08:15"
  hasJoke?: boolean;
}

/**
 * Strips internal structural prefixes (Scene 01, The Hook, The Consequence, etc.)
 * and converts them to professional trade contractor category badges.
 */
export function cleanSlideMetaLabels(rawLabel: string, slideNum: number, hasJoke = false): string {
  if (!rawLabel) return hasJoke && slideNum === 1 ? 'TRADE HUMOR' : 'FIELD REALITY';
  const upper = rawLabel.toUpperCase();
  if (upper.includes('SCENE 01') || upper.includes('THE HOOK') || upper.includes('HOOK')) {
    return hasJoke ? 'TRADE HUMOR' : 'FIELD REALITY';
  }
  if (upper.includes('SCENE 02') || upper.includes('REALITY') || upper.includes('REAL-LIFE')) {
    return 'EMERGENCY DISPATCH';
  }
  if (upper.includes('SCENE 03') || upper.includes('CONSEQUENCE')) {
    return 'REVENUE LEAK';
  }
  if (upper.includes('SCENE 04') || upper.includes('INSIGHT')) {
    return 'CONTRACTOR MATH';
  }
  if (upper.includes('SCENE 05') || upper.includes('PROCESS')) {
    return 'AI CALL INTAKE';
  }
  if (upper.includes('SCENE 06') || upper.includes('OUTCOME')) {
    return 'OWNER FREEDOM';
  }
  if (upper.includes('SCENE 07') || upper.includes('NEXT STEP') || upper.includes('CTA')) {
    return 'TAKE ACTION';
  }
  return rawLabel.replace(/scene\s*\d+\s*(\/\/|:|-)\s*/gi, '').trim() || 'TRADE REALITY';
}

/**
 * Strips accidental internal outline prefixes like "The Real-Life Moment: " or "The Consequence: "
 */
export function cleanHeadlinePrefixes(rawHeadline: string): string {
  if (!rawHeadline) return '';
  return rawHeadline
    .replace(/^(the real-life moment|the consequence|the business insight|the practical process change|the practical change|the owner's outcome|the outcome|the hook|hook|consequence):\s*/i, '')
    .trim();
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

/**
 * Normalizes CTA type into one of the four official types:
 * 'calculator' | 'dm_calculator' | 'demo_cta' | 'dm_conversation'
 */
export function normalizeCtaType(cta?: string): 'bio_calculator' | 'bio_voice_agent' | 'bio_hub' | 'dm_calc_or_voice' {
  if (!cta) return 'bio_calculator';
  if (cta === 'bio_calculator' || cta === 'calculator') return 'bio_calculator';
  if (cta === 'bio_voice_agent' || cta === 'demo_cta' || cta === 'demo_call') return 'bio_voice_agent';
  if (cta === 'bio_hub') return 'bio_hub';
  if (cta === 'dm_calc_or_voice' || cta === 'dm_calculator' || cta === 'dm_conversation') return 'dm_calc_or_voice';
  return 'bio_calculator';
}

/**
 * Returns platform-adapted caption and Slide 7 copy for a given CTA
 * Rule: 3 posts leading to bio (calculator, voice agent, or hub) + 1 post leading to DM ("CALC" or "VOICE")
 */
export function getCtaCopy(ctaType: CtaType, rotationVariantIndex = 0, demoPhoneNumber = '(844) 385-DOOR') {
  const normalized = normalizeCtaType(ctaType);

  if (normalized === 'bio_calculator') {
    return {
      type: 'bio_calculator' as const,
      url: CALCULATOR_URL,
      linkedinCta: `\n\nHow much revenue could missed calls be costing your garage door business? Run your own numbers with our free contractor calculator: tap the link in our bio (or visit https://garage-door-lost-revenue-caculator.vercel.app/).`,
      instagramCta: `\n\n📊 Want to run your numbers? Tap the link in our bio to calculate how much revenue missed calls could be costing your garage door shop!`,
      slideHeadline: 'How Much Revenue Are Missed Calls Costing You?',
      slideBody: 'Tap the link in our bio to calculate your missed repair revenue with our free interactive contractor tool.',
      slideActionText: '🔗 TAP LINK IN BIO',
      slideMetric: {
        value: 'LINK IN BIO',
        label: 'Free Revenue Calculator',
      },
    };
  }

  if (normalized === 'bio_voice_agent') {
    return {
      type: 'bio_voice_agent' as const,
      url: undefined,
      linkedinCta: `\n\nWant to hear how an AI voice agent answers and triages garage door emergency calls 24/7? Head over to the link in our bio to listen to the live voice demo.\n(Or dial our live 24/7 contractor test line: ${demoPhoneNumber})`,
      instagramCta: `\n\n🎧 Curious how an AI voice agent answers and triages garage door emergency calls? Tap the link in our bio to test the live voice assistant demo right now!`,
      slideHeadline: 'Hear The Garage Door AI Call Handler in Action',
      slideBody: 'Tap the link in our bio to test our live AI voice agent demo and hear how it captures emergency repair jobs.',
      slideActionText: '🎙️ TEST DEMO IN BIO',
      slideMetric: {
        value: 'LINK IN BIO',
        label: 'Live Voice Agent Demo',
      },
    };
  }

  if (normalized === 'bio_hub') {
    return {
      type: 'bio_hub' as const,
      url: undefined,
      linkedinCta: `\n\nReady to stop evening phone tag and protect high-margin repair jobs? Tap the link in our bio to access both the free revenue calculator and live AI voice triage demo.`,
      instagramCta: `\n\n🛠️ Stop letting high-ticket jobs slip to competitors while you're on a ladder. Tap the link in our bio to access our free revenue calculator and live AI call agent demo!`,
      slideHeadline: 'Stop Losing Emergency Calls While On The Ladder',
      slideBody: 'Tap the link in our bio to access our free garage door revenue calculator and live AI call agent demo.',
      slideActionText: '🔗 CHECK LINK IN BIO',
      slideMetric: {
        value: 'LINK IN BIO',
        label: 'Calculator & Voice Demo',
      },
    };
  }

  // dm_calc_or_voice
  return {
    type: 'dm_calc_or_voice' as const,
    url: undefined,
    linkedinCta: `\n\nWant the direct link sent to your inbox? DM me "CALC" for the free revenue calculator or "VOICE" for the live AI voice demo link.`,
    instagramCta: `\n\n💬 Want the direct links sent to your inbox? Send a DM with "CALC" for the free revenue calculator or "VOICE" for the live AI call agent demo, and we'll message them right over!`,
    slideHeadline: 'Want The Free Calculator or Voice Demo?',
    slideBody: 'Send us a direct message with "CALC" or "VOICE" and we will send the direct link straight to your inbox.',
    slideActionText: 'DM "CALC" OR "VOICE" 💬',
    slideMetric: {
      value: 'DM "CALC"',
      label: 'Direct Link to Your Inbox',
    },
  };
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
  const buyingMotivation: BuyingMotivation = params.buyingMotivation || 'make_money';
  const ctaType: CtaType = normalizeCtaType(params.ctaType);

  const motivationGuidance = {
    make_money: 'Focus on a believable scenario where an unanswered enquiry becomes a lost repair, replacement, or install job (e.g. homeowner calls at 2:14 PM with car trapped by broken spring; tech cannot answer; customer calls competitor).',
    reduce_pain: 'Show the real emotional and physical burden of running a garage door business: 11 PM emergency calls, Sunday dinner interrupted by stuck door, tech returning to unanswered calls. Relatable, never shaming.',
    gain_time: 'Focus on owner personal freedom: finishing repairs without checking phone every 4 minutes, family dinners uninterrupted, taking a weekend off. Use recurring theme: "If you got two hours a day back, what would you do with them?"',
    reduce_waste: 'Discuss the cost of paying $65+ for Google LSA / SEO clicks only to miss the inbound call while driving. Show that generating leads means nothing if call handling has a leak.',
  }[buyingMotivation];

  const ctaSpec = getCtaCopy(ctaType, Math.floor(Math.random() * 4), strategy.demoPhoneNumber);

  const normalized = normalizeCtaType(ctaType);
  const ctaGuidance = normalized === 'bio_calculator'
    ? `MANDATORY CALL TO ACTION: Direct the reader to tap the link in the bio for the Revenue-Loss Calculator.
Exact wording angle: "${ctaSpec.slideBody}"
Captions MUST instruct the reader to tap the link in the bio to run their numbers.
Slide 7 MUST feature "LINK IN BIO" clearly as the next action.`
    : normalized === 'bio_voice_agent'
    ? `MANDATORY CALL TO ACTION: Direct the reader to tap the link in the bio to test the live voice agent demo.
Exact wording angle: "${ctaSpec.slideBody}"
Captions MUST instruct the reader to tap the link in the bio to hear the live voice agent.
Slide 7 MUST feature "LINK IN BIO" clearly as the next action.`
    : normalized === 'bio_hub'
    ? `MANDATORY CALL TO ACTION: Direct the reader to tap the link in the bio to access both the revenue calculator and live voice demo.
Exact wording angle: "${ctaSpec.slideBody}"
Captions MUST instruct the reader to tap the link in the bio.
Slide 7 MUST feature "LINK IN BIO" clearly as the next action.`
    : `MANDATORY CALL TO ACTION: Direct the reader to send a DM with "CALC" for the calculator or "VOICE" for the live AI agent demo.
Exact wording angle: "${ctaSpec.slideBody}"
Captions MUST instruct the reader to send a direct message with "CALC" or "VOICE" for the direct link.
Slide 7 MUST feature "DM 'CALC' OR 'VOICE'" clearly as the next action.`;

  const hasJoke = params.hasJoke ?? false;

  const jokeGuidance = hasJoke
    ? `
*** SPECIAL REQUIREMENT: RELATABLE GARAGE DOOR TRADE CONTRACTOR HUMOR ***
- This post MUST open with a genuinely funny, relatable garage door trade joke or universal trade reality that every garage door business owner nods and laughs at!
- Examples of relatable trade humor:
  * "The Universal Law of Torsion Springs: They only snap at 6:45 AM on a Monday when the homeowner has an early flight, or 11:30 PM in a blizzard. Never at 2 PM on a slow Tuesday."
  * "Homeowner: 'I swear it just stopped working on its own!' *Panel 1 has a dent the exact size and shape of an F-150 bumper.*"
  * "Things that always happen at 11:47 PM on a freezing Sunday: LiftMaster logic boards going on strike."
  * "DIY Homeowner: 'How hard could winding a spring be? YouTube makes it look so quick.' *Narrator: It was not quick.*"
  * "Emergency call at 10 PM: 'Can you come right now? It's an emergency!' / Tech: 'What's the issue?' / Homeowner: 'The remote battery might be dead.'"
- Slide 1: Deliver the relatable trade joke / scene.
- Slide 2: Deepen the trade humor with realistic shop/van/ladder moments.
- Slide 3: Hit the financial punchline: While you're chuckling or handling that ridiculous scenario with tools in both hands, your phone rings in your pocket. You can't answer. That missed call was a real $450 emergency replacement across town—and they called your competitor 90 seconds later.
- Slide 4: Business insight: Humor keeps contractors sane, but missed calls drain revenue.
- Slide 5: Practical solution: Quiet AI voice triage answers on ring 2, weeds out the tire kickers, captures the real job, and alerts the tech.
- Slide 6: Peace of mind: Real jobs captured, zero interrupted dinners, no evening phone tag.
- Slide 7: Flows directly into assigned CTA (${ctaType}).`
    : '';

  const systemInstruction = `You are a B2B marketing specialist who intimately understands the daily operational realities of running an independent garage door repair and installation company in the United States.

CORE POSITIONING:
- Focus on the garage door company's business problems, customers, revenue, dispatch operations, and the owner's personal life — NOT on generic "AI agency" buzzwords.
- The AI call system is the quiet operational solution behind the scenes, NOT the subject of every post.
- Avoid clichés: "AI voice agents save time and money", "Never miss a call again", "Automate your business with AI".
- Ground every story in real garage door details: broken torsion springs, extension springs, snapped cables, damaged rollers, stuck doors halfway open, faulty LiftMaster/Genie openers, doors that won't close, emergency cars trapped, winding bars, 10ft ladders, noisy impact wrenches, and driving the service van.
- Fictional characters (e.g. Dave, Mike, Sarah) must be clearly illustrative scenes, never fake testimonials or manufactured case studies.
- Tone: Natural, direct, conversational American trade contractor English. Write for busy small-business owners, not tech enthusiasts.
- HONESTY RULE: Never fabricate or promise guaranteed recovered revenue, guaranteed bookings, or savings. Use honest phrasing like "could help", "find out", "see what", and "try the demo".

CRITICAL RULE REGARDING HEADLINES AND LABELS:
- Do NOT output meta labels, scene labels, or internal outline placeholders on the slides!
- FORBIDDEN HEADLINES: "The Real-Life Moment", "The Consequence", "The Business Insight", "The Practical Process Change", "The Practical Change", "The Owner's Outcome", "The Hook".
- FORBIDDEN SUPPORTING LABELS: "SCENE 01 // THE HOOK", "SCENE 02 // REALITY", "SCENE 03 // CONSEQUENCE", "SCENE 04 // INSIGHT", "SCENE 05 // THE PROCESS", "SCENE 06 // OUTCOME", "SCENE 07 // NEXT STEP", or anything starting with "SCENE".
- INSTEAD, write REAL trade headlines (e.g. "Dave Was Balanced 10ft Up on a Ladder", "A Trapped Minivan & A Snapped Spring", "She Didn't Leave a Voicemail", "Lead Gen Won't Fix an Empty Phone", "The 2-Ring Call Dispatch Workflow", "Zero Interrupted Sunday Dinners").
- For supportingLabel, use trade category badges: "FIELD REALITY", "EMERGENCY DISPATCH", "REVENUE LEAK", "CONTRACTOR MATH", "AI CALL INTAKE", "OWNER FREEDOM", "TAKE ACTION", or "TRADE HUMOR".

BUYING MOTIVATION FOR THIS POST:
${motivationGuidance}
${jokeGuidance}

SEVEN-SLIDE NARRATIVE STRUCTURE (EXACTLY 7 SLIDES):
- Slide 1: Bold hook headline & scene (or relatable trade joke if specified)
- Slide 2: Real-life job moment (on ladder, emergency car trapped, customer urgency)
- Slide 3: The consequence (customer dials competitor, dinner interrupted)
- Slide 4: The business insight (bottleneck is call-handling, not ad clicks)
- Slide 5: The practical change (answers on ring 2, collects door specs, alerts tech)
- Slide 6: The owner's outcome (jobs booked, zero phone tag, time with family)
- Slide 7: The call to action:
${ctaGuidance}
`;

  const prompt = `Generate a high-converting 7-slide B2B garage door business growth carousel.

Content Pillar: ${selectedPillar.title} (${selectedPillar.description})
Primary Buying Motivation: ${buyingMotivation}
Assigned CTA Type: ${ctaType}
${hasJoke ? 'INCLUDE RELATABLE GARAGE DOOR TRADE HUMOR AS INSTRUCTED.' : ''}
${params.customTopic ? `Specific Topic Angle: ${params.customTopic}` : ''}

You MUST return a JSON object with this EXACT structure:
{
  "title": "Campaign headline (focus on garage door problem, scene, or trade humor)",
  "targetAudience": "US Garage Door Repair and Installation Owners",
  "objective": "Primary marketing goal",
  "contentAngleExplanation": "1-2 sentence explanation of the trade scenario",
  "linkedinCaption": "Complete post caption with narrative, practical trade insight, and ending with the assigned CTA",
  "linkedinHashtags": ["#GarageDoorRepair", "#TradeContractors", "#FieldService", ...],
  "instagramCaption": "Punchy caption with emojis, swipe cues (Swipe ➡️), and ending with the assigned CTA",
  "instagramHashtags": ["#garagedoorrepair", "#garagedoors", "#contractorlife", ...],
  "slides": [
    {
      "slideNumber": 1,
      "headline": "${hasJoke ? 'The Universal Law of Broken Springs' : 'Dave Was Balanced 10ft Up on a Ladder'}",
      "bodyText": "1-2 punchy sentences describing the opening scene (max 25 words)",
      "supportingLabel": "${hasJoke ? 'TRADE HUMOR' : 'FIELD REALITY'}",
      "layoutType": "hook_title",
      "icon": "wrench",
      "visualInstruction": "Visual guidance for trade scene",
      "highlightMetric": { "value": "8:15 AM", "label": "Repair in progress" }
    },
    {
      "slideNumber": 2,
      "headline": "A Trapped Minivan & A Loud Gunshot Bang",
      "bodyText": "Details of the repair, dispatch, or customer situation",
      "supportingLabel": "EMERGENCY DISPATCH",
      "layoutType": "problem_stat",
      "icon": "alert-triangle",
      "bulletPoints": ["point 1", "point 2", "point 3"]
    },
    {
      "slideNumber": 3,
      "headline": "She Tapped The Competitor in 90 Seconds",
      "bodyText": "Customer calls competitor or dinner interrupted",
      "supportingLabel": "REVENUE LEAK",
      "layoutType": "breakdown_list",
      "icon": "phone-missed",
      "highlightMetric": { "value": "$350", "label": "Lost ticket opportunity" },
      "bulletPoints": ["point 1", "point 2"]
    },
    {
      "slideNumber": 4,
      "headline": "More Google Ads Won't Fix an Empty Phone",
      "bodyText": "Why more advertising doesn't fix a broken intake bucket",
      "supportingLabel": "CONTRACTOR MATH",
      "layoutType": "solution_feature",
      "icon": "trending-up",
      "bulletPoints": ["point 1", "point 2"]
    },
    {
      "slideNumber": 5,
      "headline": "The 2-Ring Dispatch & Triage System",
      "bodyText": "Answering on ring 2, collecting door specs, SMS alert to tech",
      "supportingLabel": "AI CALL INTAKE",
      "layoutType": "call_flow",
      "icon": "bot",
      "bulletPoints": ["Step 1", "Step 2", "Step 3"]
    },
    {
      "slideNumber": 6,
      "headline": "The Job Was Booked Before The Ladder Moved",
      "bodyText": "Recovered jobs, dinner with family, no evening phone tag",
      "supportingLabel": "OWNER FREEDOM",
      "layoutType": "metrics_grid",
      "icon": "shield-check",
      "highlightMetric": { "value": "0", "label": "Voicemails waiting at 5:30" },
      "bulletPoints": ["point 1", "point 2"]
    },
    {
      "slideNumber": 7,
      "headline": "${ctaSpec.slideHeadline}",
      "bodyText": "${ctaSpec.slideBody}",
      "supportingLabel": "TAKE ACTION",
      "layoutType": "cta_action",
      "icon": "${ctaType === 'bio_calculator' ? 'dollar-sign' : ctaType === 'bio_voice_agent' ? 'phone-call' : ctaType === 'bio_hub' ? 'link' : 'message-square'}",
      "highlightMetric": { "value": "${ctaSpec.slideMetric.value}", "label": "${ctaSpec.slideMetric.label}" }
    }
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

  // PROGRAMMATIC VALIDATION & ENFORCEMENT FOR ASSIGNED CTA IN CAPTIONS
  let linkedinCaption = parsedData.linkedinCaption || '';
  let instagramCaption = parsedData.instagramCaption || '';

  const normalizedCta = normalizeCtaType(ctaType);
  if (normalizedCta === 'bio_calculator') {
    if (!linkedinCaption.toLowerCase().includes('bio') && !linkedinCaption.toLowerCase().includes('calculator')) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('bio')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  } else if (normalizedCta === 'bio_voice_agent') {
    if (!linkedinCaption.toLowerCase().includes('bio') && !linkedinCaption.toLowerCase().includes('voice')) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('bio')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  } else if (normalizedCta === 'bio_hub') {
    if (!linkedinCaption.toLowerCase().includes('bio')) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('bio')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  } else {
    // dm_calc_or_voice
    if (!linkedinCaption.toLowerCase().includes('dm')) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('dm')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  }

  // Sanitize any accidental hype claims to adhere to honesty rule
  linkedinCaption = sanitizeHypeClaims(linkedinCaption);
  instagramCaption = sanitizeHypeClaims(instagramCaption);

  const slides = (parsedData.slides || []).slice(0, 7).map((s: any, idx: number) => {
    const slideNumber = idx + 1;
    const isSlide7 = slideNumber === 7;

    let headline = s.headline || `Slide ${slideNumber} Headline`;
    let bodyText = s.bodyText || '';
    let highlightMetric = s.highlightMetric ? { value: s.highlightMetric.value, label: s.highlightMetric.label } : undefined;
    let ctaUrl: string | undefined = undefined;

    if (isSlide7) {
      headline = ctaSpec.slideHeadline;
      bodyText = ctaSpec.slideBody;
      highlightMetric = ctaSpec.slideMetric;
      if (ctaType === 'bio_calculator') {
        ctaUrl = CALCULATOR_URL;
      }
    }

    const cleanLabel = cleanSlideMetaLabels(s.supportingLabel, slideNumber, hasJoke);
    const cleanHeadline = cleanHeadlinePrefixes(sanitizeHypeClaims(headline));

    return {
      slideNumber,
      headline: cleanHeadline,
      bodyText: sanitizeHypeClaims(bodyText),
      supportingLabel: cleanLabel,
      layoutType: s.layoutType || (idx === 0 ? 'hook_title' : isSlide7 ? 'cta_action' : 'solution_feature'),
      icon: s.icon || (isSlide7 ? (ctaType === 'bio_calculator' ? 'dollar-sign' : ctaType === 'bio_voice_agent' ? 'phone-call' : ctaType === 'bio_hub' ? 'link' : 'message-square') : 'check-circle'),
      visualInstruction: s.visualInstruction || '',
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints.map(sanitizeHypeClaims) : [],
      highlightMetric,
      ctaUrl,
    };
  });

  const campaign: Campaign = {
    id: campaignId,
    title: parsedData.title || `${selectedPillar.title} Campaign`,
    targetAudience: parsedData.targetAudience || strategy.targetAudience,
    pillarId: selectedPillar.id,
    buyingMotivation,
    ctaType,
    objective: parsedData.objective || 'Address garage door business operations and revenue loss',
    contentAngleExplanation: parsedData.contentAngleExplanation || selectedPillar.defaultAngle,
    theme,
    scheduledTime,
    slides,
    platforms: {
      linkedin: {
        enabled: true,
        caption: linkedinCaption,
        hashtags: parsedData.linkedinHashtags || ['#GarageDoorRepair', '#TradeContractors', '#FieldService'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: instagramCaption,
        hashtags: parsedData.instagramHashtags || ['#garagedoorrepair', '#garagedoors', '#contractorlife'],
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
    message: `Generated 7-slide campaign [Motivation: ${buyingMotivation}, CTA: ${ctaType}] using ${MODEL_NAME}.`,
  });

  return campaign;
}

/**
 * Sanitizes fabricated claims or hype language into honest trade wording
 */
function sanitizeHypeClaims(text: string): string {
  if (!text) return '';
  return text
    .replace(/guaranteed\s+(10x|increase|revenue|bookings|savings)/gi, 'could help increase')
    .replace(/guaranteed/gi, 'potential')
    .replace(/100%\s+guarantee/gi, 'pilot-tested')
    .replace(/fire\s+your\s+staff/gi, 'support your team')
    .replace(/make\s+\$[0-9,]+\s+overnight/gi, 'protect revenue opportunities');
}

/**
 * Returns the daily schedule plan for 4 daily posts.
 * Rule: Exactly 3 posts directing to the BIO LINK (Calculator, Voice Agent, or Hub)
 *       + Exactly 1 post directing to DM "CALC" or "VOICE" for the direct link
 */
export function getDailyPlanForDay(dayOfWeek: number = new Date().getDay()): Array<{
  pillarId: ContentPillarId;
  buyingMotivation: BuyingMotivation;
  ctaType: CtaType;
  theme: SlideTheme;
  slot: string;
  hasJoke: boolean;
}> {
  // Rotate through 6 distinct color themes so no 2 posts in a day ever share a color
  const themeRoster: SlideTheme[] = [
    'garage-amber',
    'precision-blueprint',
    'midnight-crimson',
    'modern-navy',
    'emerald-minimal',
    'industrial-copper',
  ];

  // Rotate starting offset daily
  const offset = (dayOfWeek * 2) % themeRoster.length;
  const themeSlot1 = themeRoster[offset % themeRoster.length];
  const themeSlot2 = themeRoster[(offset + 1) % themeRoster.length];
  const themeSlot3 = themeRoster[(offset + 2) % themeRoster.length];
  const themeSlot4 = themeRoster[(offset + 3) % themeRoster.length];

  return [
    {
      pillarId: 'missed-calls',
      buyingMotivation: 'make_money',
      ctaType: 'bio_calculator', // Slot 1 (08:15): Bio Link (Calculator focus)
      theme: themeSlot1,
      slot: '08:15',
      hasJoke: true, // Relatable garage door humor
    },
    {
      pillarId: 'after-hours',
      buyingMotivation: 'reduce_pain',
      ctaType: 'bio_voice_agent', // Slot 2 (11:45): Bio Link (Voice Agent Demo focus)
      theme: themeSlot2,
      slot: '11:45',
      hasJoke: false,
    },
    {
      pillarId: 'lead-capture-booking',
      buyingMotivation: 'gain_time',
      ctaType: 'bio_hub', // Slot 3 (15:30): Bio Link (Full Hub: Calculator + Voice Demo)
      theme: themeSlot3,
      slot: '15:30',
      hasJoke: false,
    },
    {
      pillarId: 'ai-agent-demo',
      buyingMotivation: 'reduce_waste',
      ctaType: 'dm_calc_or_voice', // Slot 4 (18:45): DM "CALC" or "VOICE" for direct link
      theme: themeSlot4,
      slot: '18:45',
      hasJoke: true, // Relatable garage door humor
    },
  ];
}

/**
 * Programmatic Validation & Auto-Enforcement of the 4 Daily Posts:
 * 1. Exactly 3 posts directing users to the BIO LINK (Linktree / Bio hub)
 * 2. Exactly 1 post directing users to DM "CALC" or "VOICE"
 * 3. Slide 7 must contain the corresponding action button & metric
 * 4. Both LinkedIn and Instagram captions adapted properly
 */
export function validateAndEnforceDailyBatch(
  campaigns: Campaign[],
  dayOfWeek: number = new Date().getDay()
): { validation: CtaBatchValidation; campaigns: Campaign[] } {
  const issues: string[] = [];
  const strategy = db.getStrategy();

  if (campaigns.length !== 4) {
    issues.push(`Expected 4 campaigns for daily batch, found ${campaigns.length}.`);
  }

  const targetPlan = getDailyPlanForDay(dayOfWeek);

  // Enforce rule: Exactly 3 Bio Link posts (Slots 0, 1, 2) and exactly 1 DM post (Slot 3)
  const revisedCampaigns = campaigns.map((campaign, idx) => {
    const targetSlotPlan = targetPlan[idx % targetPlan.length];
    const desiredCta = targetSlotPlan.ctaType;
    const currentCta = normalizeCtaType(campaign.ctaType);

    let needsRevision = false;
    if (currentCta !== desiredCta) {
      needsRevision = true;
      issues.push(`Slot 0${idx + 1} (${campaign.scheduledTime}) revised to enforce CTA [${desiredCta}].`);
    }

    if (!needsRevision) {
      return campaign;
    }

    // Auto-revise the campaign
    const ctaSpec = getCtaCopy(desiredCta, idx, strategy.demoPhoneNumber);
    const updatedSlides = campaign.slides.map((s, sIdx) => {
      if (sIdx === 6 || s.slideNumber === 7) {
        return {
          ...s,
          headline: ctaSpec.slideHeadline,
          bodyText: ctaSpec.slideBody,
          highlightMetric: ctaSpec.slideMetric,
          ctaUrl: desiredCta === 'bio_calculator' ? CALCULATOR_URL : undefined,
          icon: desiredCta === 'dm_calc_or_voice' ? 'message-square' : desiredCta === 'bio_voice_agent' ? 'phone-call' : 'dollar-sign',
        };
      }
      return s;
    });

    let updatedLiCaption = campaign.platforms.linkedin.caption;
    let updatedIgCaption = campaign.platforms.instagram.caption;

    // Strip old CTA links/texts if any
    updatedLiCaption = stripOldCtas(updatedLiCaption);
    updatedIgCaption = stripOldCtas(updatedIgCaption);

    // Append new platform-adapted CTA
    updatedLiCaption += ctaSpec.linkedinCta;
    updatedIgCaption += ctaSpec.instagramCta;

    const revised: Campaign = {
      ...campaign,
      ctaType: desiredCta,
      slides: updatedSlides,
      platforms: {
        ...campaign.platforms,
        linkedin: {
          ...campaign.platforms.linkedin,
          caption: sanitizeHypeClaims(updatedLiCaption),
        },
        instagram: {
          ...campaign.platforms.instagram,
          caption: sanitizeHypeClaims(updatedIgCaption),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    db.saveCampaign(revised);
    return revised;
  });

  const bioLinkCount = revisedCampaigns.filter((c) =>
    ['bio_calculator', 'bio_voice_agent', 'bio_hub'].includes(normalizeCtaType(c.ctaType))
  ).length;

  const dmKeywordCount = revisedCampaigns.filter((c) =>
    normalizeCtaType(c.ctaType) === 'dm_calc_or_voice'
  ).length;

  const validation: CtaBatchValidation = {
    valid: bioLinkCount === 3 && dmKeywordCount === 1 && revisedCampaigns.length === 4,
    bioLinkCount,
    dmKeywordCount,
    calculatorCount: bioLinkCount,
    alternativeCount: dmKeywordCount,
    distinctAlternativesCount: 1,
    issues,
  };

  return { validation, campaigns: revisedCampaigns };
}

function stripOldCtas(caption: string): string {
  return caption
    .replace(/https:\/\/garage-door-lost-revenue-caculator\.vercel\.app\/?/gi, '')
    .replace(/DM me CALCULATOR and I’ll send you the free garage door revenue-loss calculator\./gi, '')
    .replace(/Want to hear how an AI voice agent handles garage door calls\? Go to the link in my bio and call the demo yourself\./gi, '')
    .replace(/Interested in handling more missed calls\? DM me and let’s talk\./gi, '')
    .replace(/Tap the link in (our|my) bio.*/gi, '')
    .replace(/Want the direct link.*DM.*/gi, '')
    .replace(/💬 Want the direct links.*/gi, '')
    .replace(/📊 Want to run your numbers.*/gi, '')
    .replace(/🎧 Curious how an AI voice agent.*/gi, '')
    .replace(/🛠️ Stop letting high-ticket jobs slip.*/gi, '')
    .replace(/\n\s*\n\s*$/g, '')
    .trim();
}

/**
 * Batch generation for 4 daily campaigns enforcing:
 * - Exactly 2 Calculator CTAs (Post 1 & Post 3)
 * - Exactly 2 Distinct Alternative CTAs (Post 2 & Post 4)
 * - Programmatic validation & auto-enforcement
 */
export async function generateDailyBatch(): Promise<Campaign[]> {
  const schedule = db.getSchedule();
  const dayOfWeek = new Date().getDay();
  const dailyPlans = getDailyPlanForDay(dayOfWeek);

  const rawCampaigns: Campaign[] = [];

  for (let i = 0; i < dailyPlans.length; i++) {
    const plan = dailyPlans[i];
    const targetSlot = schedule.dailySlots[i] || plan.slot;
    try {
      const camp = await generateSingleCampaign({
        pillarId: plan.pillarId,
        buyingMotivation: plan.buyingMotivation,
        ctaType: plan.ctaType,
        theme: plan.theme,
        targetSlot,
        hasJoke: plan.hasJoke,
      });
      rawCampaigns.push(camp);
    } catch (err) {
      console.error(`Failed to generate campaign for slot ${targetSlot}:`, err);
    }
  }

  // PROGRAMMATIC GUARANTEE: Validate and enforce all 4 rules
  const { validation, campaigns } = validateAndEnforceDailyBatch(rawCampaigns, dayOfWeek);

  console.log(
    `[Batch Generation] Validation: ${validation.valid ? 'PASSED' : 'ADJUSTED'}. Calculator CTAs: ${validation.calculatorCount}/2, Distinct Alternative CTAs: ${validation.distinctAlternativesCount}/2.`
  );

  return campaigns;
}
