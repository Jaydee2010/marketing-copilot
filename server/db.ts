import fs from 'fs';
import path from 'path';
import {
  Campaign,
  MarketingStrategy,
  SchedulerConfig,
  LinkedInCredentials,
  InstagramCredentials,
  PublishingLog,
  QuotaAndUsage,
  ContentPillar,
} from '../src/types/index';

const DATA_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
const ASSETS_DIR = path.resolve(DATA_DIR, 'assets');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

export const CALCULATOR_URL = 'https://garage-door-lost-revenue-caculator.vercel.app/';

export const DEFAULT_PILLARS: ContentPillar[] = [
  {
    id: 'missed-calls',
    title: 'Money & Missed Opportunities',
    shortLabel: 'MAKE MORE MONEY',
    description: 'Technicians on 10ft ladders winding springs cannot answer calls. Homeowners with cars trapped inside call the next competitor.',
    icon: 'dollar-sign',
    defaultAngle: 'Illustrate believable scenarios where unanswered calls lose $280 to $600 repair and replacement jobs. Always include the Revenue-Loss Calculator CTA.',
  },
  {
    id: 'after-hours',
    title: 'After-Hours & Weekend Frustrations',
    shortLabel: 'REDUCE PAIN',
    description: 'Answering emergency broken spring calls at 11 PM or having Sunday family dinner interrupted. The emotional toll of being 24/7 on-call.',
    icon: 'moon',
    defaultAngle: 'Relatable scenes of interrupted dinners and exhausted owners. Practical triage that handles routine calls while alerting techs only for true emergencies.',
  },
  {
    id: 'lead-capture-booking',
    title: 'Time-Back & Personal Freedom',
    shortLabel: 'GAIN TIME',
    description: 'Finishing repairs without checking your phone every 4 minutes. Giving office staff time back from repetitive phone tag.',
    icon: 'clock',
    defaultAngle: 'Core question: "If you got two hours a day back, what would you do with them?" Use the Revenue-Loss Calculator CTA to quantify the opportunity.',
  },
  {
    id: 'ai-agent-demo',
    title: 'Operating Costs & Lead Waste',
    shortLabel: 'REDUCE WASTE',
    description: 'Paying $65+ for Google LSA or Local SEO leads only to miss the inbound call while driving between jobs.',
    icon: 'trending-up',
    defaultAngle: 'Generating leads is only step 1. Show how unanswered enquiries burn marketing budget and encourage owners to measure their revenue gap.',
  },
  {
    id: 'objections-faqs',
    title: 'Contractor Education & Sample Transcripts',
    shortLabel: 'CALL HANDLING',
    description: 'Walkthroughs of realistic garage door phone qualification: torsion vs extension spring, opener brand, door dimensions, gate codes.',
    icon: 'bot',
    defaultAngle: 'Sample demonstrative call transcripts showing natural qualification without technical jargon.',
  },
  {
    id: 'garage-business-education',
    title: 'Trade Realities & Honest Questions',
    shortLabel: 'TRADE FAQS',
    description: 'Honest answers on contractor questions: price quotes, angry callers, human escalation, and field service CRM sync.',
    icon: 'help-circle',
    defaultAngle: 'Clear expectations: AI does not replace skilled technicians or sound pricing; it protects call response and customer capture.',
  },
  {
    id: 'demo-invitations',
    title: '2-Week Pilot & Revenue Calculator',
    shortLabel: 'PILOT & CALCULATOR',
    description: 'Invitation to run numbers on the Revenue-Loss Calculator or test call handling on a no-risk 2-week pilot.',
    icon: 'phone-call',
    defaultAngle: 'Low-friction next steps: plug your numbers into the calculator or test the live line.',
  },
];

export const DEFAULT_STRATEGY: MarketingStrategy = {
  businessName: 'ApexDoor Call Systems',
  brandTagline: 'Reliable Call Handling & Revenue Protection for US Garage Door Companies',
  targetAudience: 'US Garage Door Repair and Installation Business Owners, General Managers, and Dispatchers',
  targetRegion: 'United States (Residential & Commercial)',
  coreService: 'Intelligent call handling that answers when technicians are on ladders or after hours, qualifies broken springs and opener repairs, and routes details so owners stop losing jobs to competitors.',
  toneOfVoice: 'Conversational, direct, authentic American trade contractor tone. Focus on business problems, owner personal freedom, and revenue—never AI buzzwords.',
  demoPhoneNumber: '(844) 385-DOOR',
  websiteUrl: 'https://apexdoorai.com/demo',
  calculatorUrl: CALCULATOR_URL,
  customPillars: DEFAULT_PILLARS,
  bannedClaims: [
    'Guaranteed 10x your business in 30 days',
    'Fire your entire office staff tomorrow',
    'Fabricated customer reviews or fake names',
    'Fake percentage claims without verifiable audit logs',
    'Generic AI buzzwords without connection to garage door work',
    'Robotic phone menus or Press 1 for sales',
  ],
  companyHighlights: [
    'Answers within 1 second while tech is on a 10ft ladder or driving',
    'Understands broken torsion springs, snapped cables, off-track doors, LiftMaster/Genie openers',
    'Triage urgency: identifies if a vehicle is trapped inside the garage',
    'Protects family dinners and after-hours sleep with customizable dispatch rules',
  ],
};

export const DEFAULT_SCHEDULE: SchedulerConfig = {
  timezone: 'America/Chicago', // Central Time default
  dailyTargetPosts: 4,
  dailySlots: ['08:15', '11:45', '15:30', '18:45'],
  autoPublishEnabled: false,
  globalPaused: false,
  linkedinPaused: false,
  instagramPaused: false,
  dailyPostLimitPerPlatform: 4,
  maxRetries: 3,
  activeFormatPreference: 'portrait_4_5',
};

export const DEFAULT_LINKEDIN: LinkedInCredentials = {
  isConnected: false,
  clientId: '',
  clientSecret: '',
  redirectUri: 'https://your-app-domain.com/api/auth/linkedin/callback',
  isTestMode: true,
};

export const DEFAULT_INSTAGRAM: InstagramCredentials = {
  isConnected: false,
  metaAppId: '',
  metaAppSecret: '',
  instagramBusinessId: '',
  facebookPageId: '',
  isTestMode: true,
  publicHostUrl: '',
};

export const INITIAL_DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-demo-01',
    title: 'Dave Was Halfway Through a Spring Replacement When His Phone Rang',
    targetAudience: 'US Garage Door Service Owners & Independent Contractors',
    pillarId: 'missed-calls',
    buyingMotivation: 'make_money',
    ctaType: 'calculator',
    objective: 'Demonstrate how missed emergency repair calls during active jobs become lost revenue for garage door companies.',
    contentAngleExplanation: 'Dave is on a 10ft ladder with winding bars in hand. An emergency call comes in from a homeowner with a trapped car. He cannot answer, and the customer dials the next contractor on Google.',
    theme: 'garage-amber',
    scheduledTime: '08:15',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `Dave was balanced on a 10-foot ladder with two winding bars in hand when his phone buzzed in his pocket.\n\nDown in Westlake, a homeowner had just pressed their garage remote to leave for work and heard a deafening bang: a broken torsion spring. Their car was trapped inside.\n\nDave couldn't let go of the high-tension spring to answer. The call went to voicemail.\n\nBy 8:22 AM, the homeowner had already dialed the next company on Google Local Services. That was an estimated $340 spring replacement job—gone in 4 minutes.\n\nIf your technicians are doing the actual physical work, who is answering your incoming calls?\n\nHow much revenue could missed calls be costing your garage door business? Run your own numbers with our free estimator:\nhttps://garage-door-lost-revenue-caculator.vercel.app/\n\n#GarageDoorRepair #TradeContractors #FieldService #SmallBusinessOperations #ContractorLife`,
        hashtags: ['#GarageDoorRepair', '#TradeContractors', '#FieldService', '#SmallBusinessOperations'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `Dave was halfway through winding a high-tension spring when his phone started ringing. 📞\n\nSwipe ➡️ to see what happened next—and why a 3-minute missed call cost his garage door business a $340 job.\n\n💡 How much revenue is slipping through your unanswered calls? Test your own numbers with the free calculator link below:\nhttps://garage-door-lost-revenue-caculator.vercel.app/\n\n#garagedoor #garagedoorrepair #contractorlife #tradesman #fieldservice #smallbusinessowner`,
        hashtags: ['#garagedoor', '#garagedoorrepair', '#contractorlife', '#fieldservice'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: 'The Universal Law of Broken Springs',
        bodyText: 'They only snap when the homeowner is already 20 minutes late for work and their car is trapped inside.',
        supportingLabel: 'TRADE HUMOR',
        layoutType: 'hook_title',
        icon: 'wrench',
        highlightMetric: { value: '8:18 AM', label: 'Tension Spring Snapped' },
      },
      {
        slideNumber: 2,
        headline: 'A Trapped Minivan & A Deafening Bang',
        bodyText: 'A homeowner in Westlake just heard a gunshot sound in her garage. Her car is trapped and she has an 8:45 AM school run.',
        supportingLabel: 'EMERGENCY DISPATCH',
        layoutType: 'problem_stat',
        icon: 'alert-triangle',
        bulletPoints: [
          'She dials Dave’s business line from Google Maps',
          'Dave is on a 10ft ladder holding 30 quarter-turns on winding bars',
          'Phone rings 5 times, vibrates in his pocket, and drops to voicemail',
        ],
      },
      {
        slideNumber: 3,
        headline: 'She Tapped Competitor #2 in 90 Seconds',
        bodyText: 'Homeowners with trapped vehicles don’t wait for callbacks. They tap the next listing on their phone.',
        supportingLabel: 'REVENUE LEAK',
        layoutType: 'breakdown_list',
        icon: 'phone-missed',
        highlightMetric: { value: '$340', label: 'Lost Spring Replacement' },
        bulletPoints: [
          'Competitor down the road answers on ring 2',
          'Technician dispatched with an arrival window of 9:30 AM',
          'Dave calls back at 8:45 AM—homeowner already booked elsewhere.',
        ],
      },
      {
        slideNumber: 4,
        headline: 'More Google Ads Won’t Fix An Empty Phone',
        bodyText: 'Dave spent money on Google Ads to generate that call. But lead gen means nothing if you’re too busy on a ladder to pick up.',
        supportingLabel: 'CONTRACTOR MATH',
        layoutType: 'solution_feature',
        icon: 'trending-up',
        bulletPoints: [
          'Technicians are doing physical labor with heavy tools',
          'A $4,000/mo full-time dispatcher is too steep for a 2-truck shop',
          'Voicemail is where high-ticket emergency repair jobs go to die',
        ],
      },
      {
        slideNumber: 5,
        headline: 'Quiet AI Call Intake on Ring 2',
        bodyText: 'An intelligent voice system answers on ring 2 with Dave’s company greeting and immediately qualifies the job.',
        supportingLabel: 'AI CALL INTAKE',
        layoutType: 'call_flow',
        icon: 'bot',
        bulletPoints: [
          'Identifies the broken spring and confirms car is trapped',
          'Collects double-door specs (16x7) and street address',
          'Quotes Dave’s standard diagnostic callout fee transparently',
          'Sends instant SMS job card to Dave’s phone with audio transcript',
        ],
      },
      {
        slideNumber: 6,
        headline: 'The Job Was Booked Before Dave Reached The Ground',
        bodyText: 'Dave didn’t drop his winding bars. He simply finished torquing the set screws and had his next $340 ticket already scheduled.',
        supportingLabel: 'OWNER FREEDOM',
        layoutType: 'metrics_grid',
        icon: 'shield-check',
        highlightMetric: { value: '0', label: 'Missed Repair Jobs' },
        bulletPoints: [
          'Zero phone tag while balancing on ladders',
          'Customer felt immediate relief that help was confirmed',
          'Revenue captured instead of handed to a competitor',
        ],
      },
      {
        slideNumber: 7,
        headline: 'How Much Are Missed Calls Costing You?',
        bodyText: 'Stop guessing. Plug your own company numbers into our free garage door revenue-loss calculator:',
        supportingLabel: 'TAKE ACTION',
        layoutType: 'cta_action',
        icon: 'dollar-sign',
        highlightMetric: { value: 'CALCULATE NOW', label: 'https://garage-door-lost-revenue-caculator.vercel.app/' },
        ctaUrl: CALCULATOR_URL,
        bulletPoints: [
          'Enter your average ticket size ($280 - $450)',
          'Enter your estimated weekly missed calls',
          'See your potential monthly revenue gap instantly',
        ],
      },
    ],
    renderedAssets: [],
  },
  {
    id: 'camp-demo-02',
    title: 'It’s 11:07 P.M. A Homeowner’s Garage Door Won’t Close.',
    targetAudience: 'US Garage Door Business Owners & Technicians',
    pillarId: 'after-hours',
    buyingMotivation: 'reduce_pain',
    ctaType: 'dm_conversation',
    objective: 'Illustrate the emotional toll of late-night calls and show how automated triage protects sleep and family time.',
    contentAngleExplanation: 'An owner exhausted after a 10-hour day gets a midnight call about a door stuck open. They need a system that triages real emergencies from routine sensor misalignment.',
    theme: 'precision-blueprint',
    scheduledTime: '11:45',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `It's 11:07 PM. You've just fallen asleep after a grueling 10-hour day hanging doors in 90-degree heat.\n\nYour bedside phone buzzes. A homeowner is frantic because their garage door reversed and is stuck 3 feet off the ground, leaving their tools and home exposed.\n\nYou pick up half-asleep, heart racing, only to discover the homeowner accidentally kicked a photo-eye sensor out of alignment.\n\nThis is the hidden tax of running a garage door business: you either answer everything yourself and burn out, or you turn your phone off and risk losing high-margin emergency jobs.\n\nHere is how smart call handling triages midnight calls: checking simple sensor issues first, quoting after-hours policies, and alerting your on-call technician only when a real truck roll is required.\n\nInterested in handling more missed calls? DM me and let’s talk.\n\n#GarageDoorContractors #TradeBusiness #ContractorBurnout #FieldServiceManagement #SmallBusinessFreedom`,
        hashtags: ['#GarageDoorContractors', '#TradeBusiness', '#ContractorBurnout', '#FieldServiceManagement'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `11:07 PM. Your phone rings. Do you answer half-asleep or let it go to voicemail? 🌙\n\nSwipe ➡️ to see how top garage door operators triage late-night calls without sacrificing their sleep or family time.\n\n💬 Interested in handling more missed calls? DM me and let’s talk.\n\n#garagedoors #garagedoorrepair #contractorlife #tradesman #emergencyservice`,
        hashtags: ['#garagedoors', '#garagedoorrepair', '#contractorlife', '#emergencyservice'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: 'It’s 11:07 P.M. The Garage Door Won’t Close.',
        bodyText: 'Your phone buzzes on the nightstand. You’ve been asleep for 45 minutes after a 10-hour shift.',
        supportingLabel: 'AFTER-HOURS CALL',
        layoutType: 'hook_title',
        icon: 'moon',
        highlightMetric: { value: '11:07 PM', label: 'Emergency Ringing' },
      },
      {
        slideNumber: 2,
        headline: 'Answer Half-Asleep Or Lose The Job?',
        bodyText: 'A homeowner just got home from the airport. Their garage door reversed and stopped 3 feet open. Their house is exposed to the street.',
        supportingLabel: 'EMERGENCY DISPATCH',
        layoutType: 'problem_stat',
        icon: 'alert-triangle',
        bulletPoints: [
          'If you don’t answer, they’ll call 4 other companies until someone picks up',
          'If you do answer, you might wake up your spouse just to give basic sensor advice',
          'You are caught between family peace and business revenue',
        ],
      },
      {
        slideNumber: 3,
        headline: 'The Constant Exhaustion of Being 24/7 On-Call',
        bodyText: 'Being 24/7 on-call means you never actually leave work. Even dinner with your kids is shadowed by the next ring.',
        supportingLabel: 'OWNER BURNOUT',
        layoutType: 'breakdown_list',
        icon: 'clock',
        highlightMetric: { value: '24/7', label: 'Never Switching Off' },
        bulletPoints: [
          'Disrupted sleep leads to slower technician work the next day',
          'Routine inquiries at night wake you up for non-urgent tune-ups',
          'Traditional answering services don’t understand garage door safety sensors',
        ],
      },
      {
        slideNumber: 4,
        headline: 'Triage Is The Missing Piece of The Puzzle',
        bodyText: 'Not every midnight call requires a truck roll. But every midnight caller needs immediate reassurance and clear direction.',
        supportingLabel: 'DISPATCH REALITY',
        layoutType: 'solution_feature',
        icon: 'shield-check',
        bulletPoints: [
          'Simple sensor blockage = guided troubleshooting saves everyone time',
          'Car trapped or broken cable = qualified as high-priority emergency',
          'Clear emergency callout rates quoted upfront before waking anyone',
        ],
      },
      {
        slideNumber: 5,
        headline: 'Automated 2-Ring Night Triage Workflow',
        bodyText: 'An intelligent voice system answers immediately, speaks in a calm, professional tone, and follows your exact rules.',
        supportingLabel: 'AI CALL INTAKE',
        layoutType: 'call_flow',
        icon: 'bot',
        bulletPoints: [
          'Checks if sensors are aligned: "Are both yellow and green lights solid?"',
          'If genuinely stuck: collects address and explains your $149 emergency callout',
          'Only alerts your on-call tech if the customer agrees and it’s a real job',
          'Books standard repairs for an 8:00 AM priority morning dispatch',
        ],
      },
      {
        slideNumber: 6,
        headline: 'Sleep Through The Night Without Missing Revenue',
        bodyText: 'Wake up to organized jobs, qualified customer notes, and zero midnight phone anxiety.',
        supportingLabel: 'OWNER FREEDOM',
        layoutType: 'metrics_grid',
        icon: 'check-circle-2',
        highlightMetric: { value: '100%', label: 'Night Calls Triaged' },
        bulletPoints: [
          'No unnecessary midnight wakeups for routine questions',
          'Real emergencies dispatched with clear customer commitment',
          'Your family gets their evenings back',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Ready to Stop Missing High-Margin Repair Jobs?',
        bodyText: 'Interested in handling more missed calls? DM me and let’s talk.',
        supportingLabel: 'TAKE ACTION',
        layoutType: 'cta_action',
        icon: 'message-square',
        highlightMetric: { value: 'LET’S TALK', label: 'DM Me Directly To Discuss' },
        bulletPoints: [
          'No high-pressure sales pitch. Just honest trade call triage.',
          'Review how many emergency calls your shop might be missing.',
          'Find out how a 2-week pilot works on your live phone line.',
        ],
      },
    ],
    renderedAssets: [],
  },
  {
    id: 'camp-demo-03',
    title: 'If You Got Two Hours a Day Back, What Would You Do With Them?',
    targetAudience: 'Garage Door Company Owners & Dispatch Managers',
    pillarId: 'lead-capture-booking',
    buyingMotivation: 'gain_time',
    ctaType: 'calculator',
    objective: 'Address owner time-freedom, eliminating the 2 hours wasted on voicemail tag and phone interruptions every evening.',
    contentAngleExplanation: 'Owners finish physical jobs only to spend 2 hours returning voicemails, playing phone tag with cold leads, and missing dinner with their kids.',
    theme: 'midnight-crimson',
    scheduledTime: '15:30',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `Ask most garage door business owners why they started their own company, and they will say the same thing: freedom.\n\nYet by 5:30 PM, after driving 120 miles and completing 4 torsion spring replacements, the owner sits in their truck or at the kitchen table with 8 voicemails on their phone.\n\nNext comes 2 hours of phone tag:\n"Hey, this is Mike returning your call about the garage door..."\n"Oh, thanks Mike, but we already got someone out here 3 hours ago."\n\nYou missed dinner with your kids, and you still lost the job.\n\nIf you got two hours a day back, what would you do with them? Spend time with family? Focus on hiring your next technician? Actually take a weekend off?\n\nFind out what unanswered calls and callback delays could be costing your garage door business. Plug your numbers into our free revenue-loss calculator:\nhttps://garage-door-lost-revenue-caculator.vercel.app/\n\n#GarageDoorBusiness #ContractorFreedom #FieldServiceManagement #SmallBusinessOwner #TimeFreedom`,
        hashtags: ['#GarageDoorBusiness', '#ContractorFreedom', '#FieldServiceManagement', '#TimeFreedom'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `If you got two hours a day back, what would you do with them? ⏳\n\nSwipe ➡️ to see how top garage door owners eliminated evening voicemail tag and got their family dinners back.\n\n📊 Estimate what missed calls are costing your business: https://garage-door-lost-revenue-caculator.vercel.app/\n\n#garagedoor #contractortime #tradesman #businessfreedom #workliferedefined`,
        hashtags: ['#garagedoor', '#contractortime', '#tradesman', '#businessfreedom'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: 'If You Got Two Hours a Day Back...',
        bodyText: 'What would you do with them? Spend time with family? Work on bigger installs? Or finally take a real weekend off?',
        supportingLabel: 'OWNER FREEDOM',
        layoutType: 'hook_title',
        icon: 'clock',
        highlightMetric: { value: '2 Hours', label: 'Average Daily Phone Tag' },
      },
      {
        slideNumber: 2,
        headline: 'The 5:30 P.M. Truck Notepad Routine',
        bodyText: 'You wrap up your last job, pack your winding bars, and sit in your truck. Your phone shows 8 missed calls and 5 voicemails.',
        supportingLabel: 'DAILY OPERATIONS',
        layoutType: 'problem_stat',
        icon: 'phone-missed',
        bulletPoints: [
          'You start dialing callbacks while your family is eating dinner',
          'Caller 1: "We already found someone else who could come today."',
          'Caller 2: Leaves no voicemail, never picks up again.',
          'You spend 90 minutes playing phone tag for 1 booked estimate.',
        ],
      },
      {
        slideNumber: 3,
        headline: 'The Hidden Voicemail Tax on Your Life',
        bodyText: 'You didn’t start a garage door business to become a full-time phone operator. But the phone runs your entire personal schedule.',
        supportingLabel: 'PERSONAL COST',
        layoutType: 'breakdown_list',
        icon: 'alert-triangle',
        highlightMetric: { value: '70%+', label: 'Leads Already Booked Elsewhere' },
        bulletPoints: [
          'Emergency customers don’t wait 3 hours for a callback',
          'Dinner with your kids gets interrupted by callbacks that don’t close',
          'Your office staff is overwhelmed trying to organize messy notes',
        ],
      },
      {
        slideNumber: 4,
        headline: 'Routine Call Intake Doesn’t Need You On The Phone',
        bodyText: 'Qualifying whether someone needs an 8x7 spring or a LiftMaster gear kit doesn’t require the owner’s personal voice on every call.',
        supportingLabel: 'SYSTEM INTAKE',
        layoutType: 'solution_feature',
        icon: 'bot',
        bulletPoints: [
          'Every caller gets an immediate live conversational pickup',
          'Door dimensions, symptoms, address, and urgency are logged cleanly',
          'Appointments are drafted according to your technician availability',
        ],
      },
      {
        slideNumber: 5,
        headline: 'Answering on Ring 2 With Full Job Specs',
        bodyText: 'A specialized garage door voice system collects the customer’s issue and contact info, qualifies the inquiry, and routes details.',
        supportingLabel: 'AI CALL INTAKE',
        layoutType: 'call_flow',
        icon: 'calendar-check',
        bulletPoints: [
          'Understands door terminology (torsion springs, off-track drums, gear sprockets)',
          'Confirms customer address and service window transparently',
          'Pings your phone with a 15-second audio summary and job card',
        ],
      },
      {
        slideNumber: 6,
        headline: 'Walk Through The Front Door at 5:30 P.M.',
        bodyText: 'Put your keys on the counter. Have dinner without looking at your screen every 3 minutes. Your jobs are already booked.',
        supportingLabel: 'PEACE OF MIND',
        layoutType: 'metrics_grid',
        icon: 'check-circle-2',
        highlightMetric: { value: '0 Voicemails', label: 'Waiting at 5:30 PM' },
        bulletPoints: [
          'No 2-hour phone tag sessions every evening',
          'Jobs booked into your calendar while you were driving',
          'Peace of mind that no paying lead was left behind',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Estimate Your Potential Revenue Gap',
        bodyText: 'Find out what unanswered calls and callback delays could be costing your garage door business:',
        supportingLabel: 'TAKE ACTION',
        layoutType: 'cta_action',
        icon: 'dollar-sign',
        highlightMetric: { value: 'CALCULATE NOW', label: 'https://garage-door-lost-revenue-caculator.vercel.app/' },
        ctaUrl: CALCULATOR_URL,
        bulletPoints: [
          'Enter your average garage door repair ticket',
          'See how recovering 2 calls a week impacts your bottom line',
          'Run your numbers free at: https://garage-door-lost-revenue-caculator.vercel.app/',
        ],
      },
    ],
    renderedAssets: [],
  },
  {
    id: 'camp-demo-04',
    title: 'You Paid $65 for The Google Lead. Who Answered The Phone?',
    targetAudience: 'Garage Door Owners Investing in Google LSA, PPC, or SEO',
    pillarId: 'garage-business-education',
    buyingMotivation: 'reduce_waste',
    ctaType: 'demo_cta',
    objective: 'Show the economic waste of paying for leads when call intake is bottlenecked by busy technicians.',
    contentAngleExplanation: 'Owners invest thousands into Google Local Services Ads, but when calls arrive while a technician is driving or in an attic, the ad spend is wasted and the job is lost.',
    theme: 'modern-navy',
    scheduledTime: '18:45',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `Here is a math problem every garage door business owner knows too well:\n\nYou spend $1,800 a month on Google Local Services Ads and SEO.\n\nA homeowner's torsion spring snaps at 3:15 PM. They tap your ad. Google charges your account $65 for the qualified phone lead.\n\nYour technician is driving on the freeway with an impact wrench rattling in the back. He can't safely answer.\n\nThe phone rings 5 times, hits voicemail, and the homeowner clicks back to the next company on the list.\n\nYou just paid $65 to give your competitor a $380 spring replacement.\n\nLead generation doesn't fix a broken phone intake process. The businesses that grow aren't the ones buying the most clicks—they're the ones answering in under 2 rings and booking the truck roll before the customer can look elsewhere.\n\nWant to hear how an AI voice agent handles garage door calls? Go to the link in my bio or call our 24/7 demo line: (844) 385-DOOR.\n\n#GarageDoorAdvertising #GoogleLSA #FieldService #TradeContractors #ContractorMarketing`,
        hashtags: ['#GarageDoorAdvertising', '#GoogleLSA', '#FieldService', '#TradeContractors'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `You paid $65 for the lead. Who answered the phone? 💸\n\nSwipe ➡️ to see why buying more ads won't fix a missed call problem—and how top garage door companies protect their marketing ROI.\n\n🎧 Want to hear how an AI voice agent handles garage door calls? Go to the link in my bio and call the demo yourself.\n\n#garagedoor #contractorads #leadgeneration #fieldservice #smallbusinessops`,
        hashtags: ['#garagedoor', '#contractorads', '#leadgeneration', '#fieldservice'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: 'Things Homeowners Say at 11:30 P.M.',
        bodyText: '“I swear it just stopped working on its own!” Meanwhile panel 1 has a fresh dent the size of a pickup bumper.',
        supportingLabel: 'TRADE HUMOR',
        layoutType: 'hook_title',
        icon: 'trending-up',
        highlightMetric: { value: '$65 Cost', label: 'Per Google Lead Click' },
      },
      {
        slideNumber: 2,
        headline: 'While You Smile, Your Phone Rings on The Highway',
        bodyText: 'Your lead alert dings while your technician is driving 65 mph on the freeway between jobs.',
        supportingLabel: 'TRANSIT DISPATCH',
        layoutType: 'problem_stat',
        icon: 'car',
        bulletPoints: [
          'Safety rules prevent answering while navigating heavy highway traffic',
          'Phone rings 5 times and goes to generic voicemail',
          'Google still charges your credit card for the connected lead',
        ],
      },
      {
        slideNumber: 3,
        headline: 'Paying For Your Competitor’s $380 Spring Job',
        bodyText: 'The homeowner doesn’t leave a voicemail. They tap the next contractor listed on Google.',
        supportingLabel: 'REVENUE LEAK',
        layoutType: 'breakdown_list',
        icon: 'dollar-sign',
        highlightMetric: { value: '$380 Job', label: 'Handed to Competitor' },
        bulletPoints: [
          'You paid Google $65 for the phone click',
          'Competitor picks up and books the $380 spring repair',
          'Your effective customer acquisition cost doubles',
        ],
      },
      {
        slideNumber: 4,
        headline: 'Ad Spend Doesn’t Fix An Unanswered Phone',
        bodyText: 'Pumping more money into advertising with a leaky call-handling bucket just accelerates wasted budget.',
        supportingLabel: 'CONTRACTOR MATH',
        layoutType: 'solution_feature',
        icon: 'help-circle',
        bulletPoints: [
          'Step 1: Pay for lead (Easy)',
          'Step 2: Answer within 2 rings & qualify (Where 60% of companies fail)',
          'Step 3: Book the appointment before they call another business',
        ],
      },
      {
        slideNumber: 5,
        headline: 'Instant 2-Ring Call Capture & Qualification',
        bodyText: 'Calls are answered on ring 2 by an intelligent system trained specifically on garage door repair dispatching.',
        supportingLabel: 'AI CALL INTAKE',
        layoutType: 'call_flow',
        icon: 'bot',
        bulletPoints: [
          'Greets with your company name and identifies urgency immediately',
          'Collects customer address, door size, and opener brand',
          'Dispatches SMS alert directly to tech or office with full transcript',
        ],
      },
      {
        slideNumber: 6,
        headline: 'Every Ad Dollar Captured as A Confirmed Booking',
        bodyText: 'Stop lighting advertising budget on fire. Turn the calls you are already paying for into confirmed truck rolls.',
        supportingLabel: 'CONFIRMED BOOKINGS',
        layoutType: 'metrics_grid',
        icon: 'check-circle-2',
        highlightMetric: { value: '100%', label: 'Paid Lead Pickup' },
        bulletPoints: [
          'No missed calls while driving between service appointments',
          'Maximize the return on your Google LSA and SEO spend',
          'Higher closing rates on emergency inquiries',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Hear How An AI Voice Agent Handles Garage Door Calls',
        bodyText: 'Want to hear how an AI voice agent handles garage door calls? Go to the link in my bio and call the demo yourself.',
        supportingLabel: 'TAKE ACTION',
        layoutType: 'cta_action',
        icon: 'phone-call',
        highlightMetric: { value: 'TRY THE DEMO', label: 'Call 24/7 Agent in Bio Link' },
        bulletPoints: [
          'Pretend your garage door spring just snapped or door won’t close.',
          'Experience natural contractor qualification without tech jargon.',
          'Test it on your own phone 24/7 with zero sales pitch.',
        ],
      },
    ],
    renderedAssets: [],
  },
];

export interface DatabaseSchema {
  strategy: MarketingStrategy;
  schedule: SchedulerConfig;
  linkedin: LinkedInCredentials;
  instagram: InstagramCredentials;
  campaigns: Campaign[];
  logs: PublishingLog[];
  usage: QuotaAndUsage;
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirs();
    this.data = this.load();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ASSETS_DIR)) {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }
  }

  private getInitialData(): DatabaseSchema {
    const today = new Date().toISOString().split('T')[0];
    return {
      strategy: DEFAULT_STRATEGY,
      schedule: DEFAULT_SCHEDULE,
      linkedin: DEFAULT_LINKEDIN,
      instagram: DEFAULT_INSTAGRAM,
      campaigns: INITIAL_DEMO_CAMPAIGNS,
      logs: [
        {
          id: 'log-init-1',
          timestamp: new Date().toISOString(),
          campaignId: 'camp-demo-01',
          campaignTitle: 'Dave Was Halfway Through a Spring Replacement When His Phone Rang',
          platform: 'linkedin',
          action: 'scheduled_trigger',
          status: 'success',
          message: 'Pivoted garage door growth campaigns loaded with Revenue-Loss Calculator CTAs.',
        },
      ],
      usage: {
        todayGeminiRequests: 0,
        todayGeminiEstimatedTokens: 0,
        todayPostsLinkedIn: 0,
        todayPostsInstagram: 0,
        todayRenderedAssetsCount: 0,
        totalAssetsDiskBytes: 0,
        lastQuotaResetDate: today,
        maxDailyGeminiRequests: 50,
        maxDailyPostsPerPlatform: 4,
      },
    };
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Check if strategy needs migration for calculatorUrl
        const strategy: MarketingStrategy = parsed.strategy || DEFAULT_STRATEGY;
        if (!strategy.calculatorUrl) {
          strategy.calculatorUrl = CALCULATOR_URL;
        }

        // Check if campaigns need update to new garage door business growth positioning
        let campaigns: Campaign[] = parsed.campaigns || INITIAL_DEMO_CAMPAIGNS;
        const hasCalculatorCta = campaigns.some(
          (c) =>
            c.platforms.linkedin.caption?.includes(CALCULATOR_URL) ||
            c.slides?.some((s) => s.ctaUrl === CALCULATOR_URL || s.bodyText?.includes('caculator'))
        );

        if (!hasCalculatorCta || campaigns.length === 0) {
          campaigns = INITIAL_DEMO_CAMPAIGNS;
        }

        return {
          strategy,
          schedule: parsed.schedule || DEFAULT_SCHEDULE,
          linkedin: parsed.linkedin || DEFAULT_LINKEDIN,
          instagram: parsed.instagram || DEFAULT_INSTAGRAM,
          campaigns,
          logs: parsed.logs || [],
          usage: parsed.usage || this.getInitialData().usage,
        };
      }
    } catch (err) {
      console.error('Error reading database file, initializing default:', err);
    }
    const initial = this.getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    this.ensureDirs();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private persist() {
    this.saveDirect(this.data);
  }

  // Strategy
  getStrategy(): MarketingStrategy {
    return this.data.strategy;
  }

  saveStrategy(strategy: MarketingStrategy): MarketingStrategy {
    this.data.strategy = strategy;
    this.persist();
    return this.data.strategy;
  }

  // Schedule
  getSchedule(): SchedulerConfig {
    return this.data.schedule;
  }

  saveSchedule(schedule: SchedulerConfig): SchedulerConfig {
    this.data.schedule = schedule;
    this.persist();
    return this.data.schedule;
  }

  // Integrations
  getLinkedIn(): LinkedInCredentials {
    return this.data.linkedin;
  }

  saveLinkedIn(creds: Partial<LinkedInCredentials>): LinkedInCredentials {
    this.data.linkedin = { ...this.data.linkedin, ...creds };
    this.persist();
    return this.data.linkedin;
  }

  getInstagram(): InstagramCredentials {
    return this.data.instagram;
  }

  saveInstagram(creds: Partial<InstagramCredentials>): InstagramCredentials {
    this.data.instagram = { ...this.data.instagram, ...creds };
    this.persist();
    return this.data.instagram;
  }

  // Campaigns
  getCampaigns(): Campaign[] {
    return this.data.campaigns;
  }

  getCampaign(id: string): Campaign | undefined {
    return this.data.campaigns.find((c) => c.id === id);
  }

  saveCampaign(campaign: Campaign): Campaign {
    const idx = this.data.campaigns.findIndex((c) => c.id === campaign.id);
    campaign.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      this.data.campaigns[idx] = campaign;
    } else {
      this.data.campaigns.unshift(campaign);
    }
    this.persist();
    return campaign;
  }

  deleteCampaign(id: string): boolean {
    const prevLen = this.data.campaigns.length;
    this.data.campaigns = this.data.campaigns.filter((c) => c.id !== id);
    if (this.data.campaigns.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Logs
  getLogs(limit = 100): PublishingLog[] {
    return this.data.logs.slice(0, limit);
  }

  addLog(log: Omit<PublishingLog, 'id' | 'timestamp'>): PublishingLog {
    const entry: PublishingLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.logs.unshift(entry);
    if (this.data.logs.length > 500) {
      this.data.logs = this.data.logs.slice(0, 500);
    }
    this.persist();
    return entry;
  }

  // Usage and Quota
  getUsage(): QuotaAndUsage {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.usage.lastQuotaResetDate !== today) {
      this.data.usage.todayGeminiRequests = 0;
      this.data.usage.todayGeminiEstimatedTokens = 0;
      this.data.usage.todayPostsLinkedIn = 0;
      this.data.usage.todayPostsInstagram = 0;
      this.data.usage.todayRenderedAssetsCount = 0;
      this.data.usage.lastQuotaResetDate = today;
      this.persist();
    }
    return this.data.usage;
  }

  recordGeminiCall(estimatedTokens = 1400) {
    const usage = this.getUsage();
    usage.todayGeminiRequests += 1;
    usage.todayGeminiEstimatedTokens += estimatedTokens;
    this.persist();
  }

  recordPostSuccess(platform: 'linkedin' | 'instagram') {
    const usage = this.getUsage();
    if (platform === 'linkedin') usage.todayPostsLinkedIn += 1;
    if (platform === 'instagram') usage.todayPostsInstagram += 1;
    this.persist();
  }

  recordAssetRender(sizeBytes: number) {
    const usage = this.getUsage();
    usage.todayRenderedAssetsCount += 1;
    usage.totalAssetsDiskBytes += sizeBytes;
    this.persist();
  }
}

export const db = new DatabaseManager();
