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
export function normalizeCtaType(cta?: string): 'calculator' | 'dm_calculator' | 'demo_cta' | 'dm_conversation' {
  if (!cta) return 'calculator';
  if (cta === 'calculator') return 'calculator';
  if (cta === 'dm_calculator') return 'dm_calculator';
  if (cta === 'demo_cta' || cta === 'demo_call') return 'demo_cta';
  if (cta === 'dm_conversation') return 'dm_conversation';
  return 'calculator';
}

/**
 * Returns platform-adapted caption and Slide 7 copy for a given CTA
 */
export function getCtaCopy(ctaType: CtaType, rotationVariantIndex = 0, demoPhoneNumber = '(844) 385-DOOR') {
  const normalized = normalizeCtaType(ctaType);

  if (normalized === 'calculator') {
    const variantText = CALCULATOR_CTA_VARIANTS[rotationVariantIndex % CALCULATOR_CTA_VARIANTS.length];
    return {
      type: 'calculator' as const,
      url: CALCULATOR_URL,
      linkedinCta: `\n\n${variantText}`,
      instagramCta: `\n\n📊 Want to run your numbers? Tap the link in our bio to open the free Garage Door Revenue-Loss Calculator! Or drop a comment with "CALC" / DM us "CALC" and we'll send the direct interactive link straight to your inbox!`,
      slideHeadline: 'How Much Revenue Could Missed Calls Be Costing You?',
      slideBody: 'Tap the link in our bio to calculate your missed call revenue, or DM "CALC" for the interactive tool.',
      slideActionText: '🔗 LINK IN BIO',
      slideMetric: {
        value: '🔗 LINK IN BIO',
        label: 'Or DM "CALC" for direct link',
      },
    };
  }

  if (normalized === 'dm_calculator') {
    const copy = APPROVED_ALTERNATIVE_CTAS.dm_calculator.copy;
    return {
      type: 'dm_calculator' as const,
      url: undefined,
      linkedinCta: `\n\n${copy}`,
      instagramCta: `\n\n💬 ${copy}`,
      slideHeadline: 'Want to Run Your Garage Door Business Numbers?',
      slideBody: copy,
      slideActionText: 'DM "CALCULATOR" 💬',
      slideMetric: APPROVED_ALTERNATIVE_CTAS.dm_calculator.slideMetric,
    };
  }

  if (normalized === 'demo_cta') {
    const copy = APPROVED_ALTERNATIVE_CTAS.demo_cta.copy;
    return {
      type: 'demo_cta' as const,
      url: undefined,
      linkedinCta: `\n\n${copy}\n(Or dial our live 24/7 test line: ${demoPhoneNumber})`,
      instagramCta: `\n\n🎧 ${copy}`,
      slideHeadline: 'Hear The Garage Door AI Call Handler in Action',
      slideBody: copy,
      slideActionText: 'TRY THE DEMO 👉',
      slideMetric: APPROVED_ALTERNATIVE_CTAS.demo_cta.slideMetric,
    };
  }

  // dm_conversation
  const copy = APPROVED_ALTERNATIVE_CTAS.dm_conversation.copy;
  return {
    type: 'dm_conversation' as const,
    url: undefined,
    linkedinCta: `\n\n${copy}`,
    instagramCta: `\n\n🤝 ${copy}`,
    slideHeadline: 'Ready to Stop Missing High-Margin Repair Jobs?',
    slideBody: copy,
    slideActionText: 'SEND A DM 💬',
    slideMetric: APPROVED_ALTERNATIVE_CTAS.dm_conversation.slideMetric,
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

  const ctaGuidance = ctaType === 'calculator'
    ? `MANDATORY CALL TO ACTION: Direct the reader to the Revenue-Loss Calculator.
Exact URL to include: ${CALCULATOR_URL}
Required wording angle: ${ctaSpec.slideBody}
The final Slide 7 MUST feature this calculator URL legibly, and the captions MUST include the clickable URL.`
    : ctaType === 'dm_calculator'
    ? `CALL TO ACTION: Direct reader to direct message for calculator.
Required wording: "${APPROVED_ALTERNATIVE_CTAS.dm_calculator.copy}"`
    : ctaType === 'demo_cta'
    ? `CALL TO ACTION: Direct reader to test the live voice agent.
Required wording: "${APPROVED_ALTERNATIVE_CTAS.demo_cta.copy}"`
    : `CALL TO ACTION: Invite direct conversation on missed calls.
Required wording: "${APPROVED_ALTERNATIVE_CTAS.dm_conversation.copy}"`;

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
      "icon": "${ctaType === 'calculator' ? 'dollar-sign' : ctaType === 'demo_cta' ? 'phone-call' : 'message-square'}",
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

  if (ctaType === 'calculator') {
    if (!linkedinCaption.includes(CALCULATOR_URL)) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('bio') && !instagramCaption.toLowerCase().includes('calc')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  } else if (ctaType === 'dm_calculator') {
    if (!linkedinCaption.toLowerCase().includes('calculator')) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('calculator')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  } else if (ctaType === 'demo_cta') {
    if (!linkedinCaption.toLowerCase().includes('demo')) {
      linkedinCaption += ctaSpec.linkedinCta;
    }
    if (!instagramCaption.toLowerCase().includes('demo') && !instagramCaption.toLowerCase().includes('bio')) {
      instagramCaption += ctaSpec.instagramCta;
    }
  } else {
    // dm_conversation
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
      if (ctaType === 'calculator') {
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
      icon: s.icon || (isSlide7 ? (ctaType === 'calculator' ? 'dollar-sign' : ctaType === 'demo_cta' ? 'phone-call' : 'message-square') : 'check-circle'),
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
 * Returns the weekly rotating schedule plan for 4 daily posts.
 * Rule: Exactly 2 Calculator CTAs + 2 Distinct Alternative CTAs (rotating DM calculator, Demo CTA, Conversation CTA)
 */
export function getDailyPlanForDay(dayOfWeek: number = new Date().getDay()): Array<{
  pillarId: ContentPillarId;
  buyingMotivation: BuyingMotivation;
  ctaType: CtaType;
  theme: SlideTheme;
  slot: string;
  hasJoke: boolean;
}> {
  // Weekly pairing of the 2 alternative CTAs (never the same on the same day)
  // Options: 'dm_calculator', 'demo_cta', 'dm_conversation'
  const alternativePairs: Array<[CtaType, CtaType]> = [
    ['dm_calculator', 'demo_cta'],       // Sunday (0)
    ['demo_cta', 'dm_conversation'],     // Monday (1)
    ['dm_conversation', 'dm_calculator'], // Tuesday (2)
    ['dm_calculator', 'demo_cta'],       // Wednesday (3)
    ['demo_cta', 'dm_conversation'],     // Thursday (4)
    ['dm_conversation', 'dm_calculator'], // Friday (5)
    ['dm_calculator', 'demo_cta'],       // Saturday (6)
  ];

  const [alt1, alt2] = alternativePairs[dayOfWeek % alternativePairs.length];

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
      ctaType: 'calculator', // Slot 1: Calculator CTA (Missed calls & lost revenue)
      theme: themeSlot1,
      slot: '08:15',
      hasJoke: true, // Post 1 includes relatable garage door humor
    },
    {
      pillarId: 'after-hours',
      buyingMotivation: 'reduce_pain',
      ctaType: alt1, // Slot 2: Alternative CTA #1 (Owner frustrations, after-hours calls)
      theme: themeSlot2,
      slot: '11:45',
      hasJoke: false,
    },
    {
      pillarId: 'lead-capture-booking',
      buyingMotivation: 'gain_time',
      ctaType: 'calculator', // Slot 3: Calculator CTA (Time back & personal freedom)
      theme: themeSlot3,
      slot: '15:30',
      hasJoke: false,
    },
    {
      pillarId: 'ai-agent-demo',
      buyingMotivation: 'reduce_waste',
      ctaType: alt2, // Slot 4: Alternative CTA #2 (AI call demo & lead waste)
      theme: themeSlot4,
      slot: '18:45',
      hasJoke: true, // Post 2 includes relatable garage door humor
    },
  ];
}

/**
 * Programmatic Validation & Auto-Enforcement of the 4 Daily Posts:
 * 1. Exactly 2 Calculator CTAs with CALCULATOR_URL
 * 2. Exactly 2 Alternative CTAs (DM or demo)
 * 3. Both alternative CTAs must be distinct on the same day
 * 4. Slide 7 must contain the assigned CTA
 * 5. Both LinkedIn and Instagram captions adapted properly
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

  // Count existing calculator CTAs
  let calculatorIndices: number[] = [];
  let alternativeIndices: number[] = [];

  campaigns.forEach((c, idx) => {
    const isCalc =
      c.ctaType === 'calculator' ||
      c.platforms.linkedin.caption.includes(CALCULATOR_URL) ||
      c.slides.some((s) => s.ctaUrl === CALCULATOR_URL || s.bodyText?.includes('caculator'));

    if (isCalc) {
      calculatorIndices.push(idx);
    } else {
      alternativeIndices.push(idx);
    }
  });

  const targetPlan = getDailyPlanForDay(dayOfWeek);

  // Enforce rule 1 & 2: exactly 2 calculator CTAs (Slots 0 and 2) and 2 alternative CTAs (Slots 1 and 3)
  const revisedCampaigns = campaigns.map((campaign, idx) => {
    const targetSlotPlan = targetPlan[idx % targetPlan.length];
    const desiredCta = targetSlotPlan.ctaType;
    const currentCta = normalizeCtaType(campaign.ctaType);

    let needsRevision = false;

    // Check if slot type mismatches plan
    if (desiredCta === 'calculator') {
      if (currentCta !== 'calculator' || !campaign.platforms.linkedin.caption.includes(CALCULATOR_URL)) {
        needsRevision = true;
        issues.push(`Slot 0${idx + 1} (${campaign.scheduledTime}) revised to enforce Calculator CTA.`);
      }
    } else {
      if (currentCta === 'calculator' || currentCta !== desiredCta) {
        needsRevision = true;
        issues.push(`Slot 0${idx + 1} (${campaign.scheduledTime}) revised to enforce Alternative CTA [${desiredCta}].`);
      }
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
          ctaUrl: desiredCta === 'calculator' ? CALCULATOR_URL : undefined,
          icon: desiredCta === 'calculator' ? 'dollar-sign' : desiredCta === 'demo_cta' ? 'phone-call' : 'message-square',
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

  // Calculate final validation metrics
  const finalCalcCount = revisedCampaigns.filter(
    (c) =>
      c.ctaType === 'calculator' &&
      c.platforms.linkedin.caption.includes(CALCULATOR_URL) &&
      c.platforms.instagram.caption.includes(CALCULATOR_URL) &&
      c.slides.some((s) => s.ctaUrl === CALCULATOR_URL)
  ).length;

  const alternativeTypes = revisedCampaigns
    .filter((c) => c.ctaType !== 'calculator')
    .map((c) => normalizeCtaType(c.ctaType));

  const distinctAltCount = new Set(alternativeTypes).size;

  const validation: CtaBatchValidation = {
    valid: finalCalcCount === 2 && revisedCampaigns.length === 4 && distinctAltCount === 2,
    calculatorCount: finalCalcCount,
    alternativeCount: revisedCampaigns.length - finalCalcCount,
    distinctAlternativesCount: distinctAltCount,
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
