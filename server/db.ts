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

export const DEFAULT_PILLARS: ContentPillar[] = [
  {
    id: 'missed-calls',
    title: 'Missed Calls & Lost Revenue',
    shortLabel: 'LOST REVENUE',
    description: 'When techs are on ladders or in attics, ringing calls go to the competitor down the street.',
    icon: 'phone-missed',
    defaultAngle: 'Highlight that 80%+ of garage door emergencies call the next company if the first goes to voicemail.',
  },
  {
    id: 'after-hours',
    title: 'After-Hours & Weekend Emergencies',
    shortLabel: 'AFTER-HOURS 24/7',
    description: 'Broken torsion springs and cars stuck in garages at 6 AM or 9 PM require immediate live qualification.',
    icon: 'clock',
    defaultAngle: 'Emergency jobs carry the highest ticket values. An AI agent answers on the 2nd ring while the owner sleeps.',
  },
  {
    id: 'lead-capture-booking',
    title: 'Lead Qualification & Dispatch Booking',
    shortLabel: 'DISPATCH WORKFLOW',
    description: 'Gather door size, spring count, motor brand, address, and urgency before booking the truck roll.',
    icon: 'calendar-check',
    defaultAngle: 'Eliminate 15-minute phone tag games. The AI agent collects exact door specs and dispatches to the technician.',
  },
  {
    id: 'ai-agent-demo',
    title: 'Live Voice Agent Demonstrations',
    shortLabel: 'VOICE SIMULATION',
    description: 'Realistic audio transcript walkthroughs showing how natural, polite, and rapid the conversational agent sounds.',
    icon: 'bot',
    defaultAngle: 'Demonstrate natural interruption handling, background noise tolerance, and professional tone.',
  },
  {
    id: 'objections-faqs',
    title: 'Common Objections & Dispatch FAQs',
    shortLabel: 'CONTRACTOR FAQS',
    description: 'Answering real contractor concerns: "Will it sound robotic?", "What if a homeowner is angry?", "How does it route?"',
    icon: 'help-circle',
    defaultAngle: 'Clear, honest answers. Highlight human-escalation protocols and transparent price range boundaries.',
  },
  {
    id: 'garage-business-education',
    title: 'Garage Door Business Economics',
    shortLabel: 'UNIT ECONOMICS',
    description: 'Calculations on technician labor efficiency, cost per acquisition (CPA), and maximizing Google Local Services Ads.',
    icon: 'trending-up',
    defaultAngle: 'Paying $65+ per Google LSA click only to miss the inbound call is lighting marketing budget on fire.',
  },
  {
    id: 'demo-invitations',
    title: 'Live Audio Demos & Company Audits',
    shortLabel: 'TEST CALL INVITATION',
    description: 'Direct call-to-action inviting garage door company owners to dial a live dedicated test line right now.',
    icon: 'phone-call',
    defaultAngle: 'No aggressive sales pitches. Just call (800) 555-DOOR and test how it handles a double-spring emergency.',
  },
];

export const DEFAULT_STRATEGY: MarketingStrategy = {
  businessName: 'ApexDoor Voice AI',
  brandTagline: '24/7 Conversational AI Voice Dispatch for Garage Door Contractors',
  targetAudience: 'US Garage Door Repair and Installation Business Owners, General Managers, and Dispatchers',
  targetRegion: 'United States (Residential & Commercial)',
  coreService: 'Voice AI agents that pick up emergency calls on ring 2, qualify spring/opener repairs, collect job addresses, and dispatch directly into contractor scheduling systems.',
  toneOfVoice: 'Pragmatic, professional, respectful of trade contractors, numbers-grounded, zero fluff or tech jargon.',
  demoPhoneNumber: '(844) 385-DOOR',
  websiteUrl: 'https://apexdoorai.com/demo',
  customPillars: DEFAULT_PILLARS,
  bannedClaims: [
    'Guaranteed 10x your business in 30 days',
    'Fire your entire office staff tomorrow',
    'Fabricated customer reviews or fake names',
    'Fake percentage claims without verifiable audit logs',
    'Spammy DM bot tactics',
  ],
  companyHighlights: [
    'Under 1-second conversational latency',
    'Trained specifically on garage door vocabulary (torsion springs, opener gear sprockets, off-track drums)',
    'Handles urgent emergency routing vs standard next-week tune-ups',
    'Instant SMS notifications sent to technicians with full call audio transcript',
  ],
};

export const DEFAULT_SCHEDULE: SchedulerConfig = {
  timezone: 'America/Chicago', // Central Time default (great central US distribution)
  dailyTargetPosts: 4,
  dailySlots: ['08:15', '11:45', '15:30', '18:45'],
  autoPublishEnabled: false, // Default to FALSE for safety
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
    title: 'The $280 Voicemail Leak in Garage Door Repair',
    targetAudience: 'US Garage Door Service Companies',
    pillarId: 'missed-calls',
    objective: 'Demonstrate the true dollar cost of unanswered phone calls during technician service hours.',
    contentAngleExplanation: 'Contractors are on job sites with impact drivers buzzing. Calls go to voicemail, and the homeowner immediately taps the next sponsored listing on Google.',
    theme: 'garage-amber',
    scheduledTime: '08:15',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `If your garage door repair technicians are on ladders from 8 AM to 5 PM, who is picking up the phone when a homeowner's car is trapped inside?\n\nIn our audits with garage door contractors across the US, over 74% of emergency service calls that reach voicemail never leave a message. They hang up and dial the next company on Google Maps.\n\nHere is the exact economics breakdown of what 3 missed calls a day cost a 2-truck garage door business—and how voice AI captures those bookings in under 60 seconds without hiring an extra full-time office rep.\n\nSwipe through the 7-slide breakdown 👉\n\n#GarageDoorRepair #FieldService #TradeContractors #VoiceAI #HomeServices #SmallBusinessOperations`,
        hashtags: ['#GarageDoorRepair', '#FieldService', '#TradeContractors', '#VoiceAI', '#HomeServices'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `Swipe ➡️ to see why 3 missed calls a day is costing your garage door company over $20,000 every single month.\n\nHomeowners with broken springs don't leave friendly voicemails—they need their car out of the garage for work, and they call the next guy who actually answers.\n\n💡 Save this post for your weekly dispatch review.\n\n#garagedoorrepair #garagedoors #contractorlife #tradesman #fieldservice #smallbusinessowner #dispatchautomation`,
        hashtags: ['#garagedoorrepair', '#garagedoors', '#contractorlife', '#fieldservice'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: 'The $280 Voicemail Leak in Garage Door Repair',
        bodyText: 'Why 70%+ of emergency homeowners hang up and dial your competitor the second they hear a beep.',
        supportingLabel: 'PILLAR 01 // MISSED CALLS',
        layoutType: 'hook_title',
        icon: 'phone-missed',
        visualInstruction: 'High contrast alert header with bold emergency badge and phone call icon.',
        highlightMetric: { value: '74%', label: 'Hang up on voicemail' },
      },
      {
        slideNumber: 2,
        headline: 'The Real Math Behind 3 Unanswered Calls',
        bodyText: 'A single standard spring replacement or opener gear service averages $280 to $450 in gross ticket value.',
        supportingLabel: 'COST CALCULATION',
        layoutType: 'problem_stat',
        icon: 'trending-up',
        bulletPoints: [
          '3 missed emergency calls/day = 90 missed opportunities/month',
          'At a conservative 40% close rate = 36 lost jobs',
          '36 jobs x $320 average ticket = $11,520/month in lost revenue',
          'Yearly loss: $138,240 handed to your competitors',
        ],
      },
      {
        slideNumber: 3,
        headline: 'Why It Happens: The Ladder Trap',
        bodyText: 'Garage door contractors are not ignoring calls on purpose. You are doing the actual physical work.',
        supportingLabel: 'ROOT CAUSE',
        layoutType: 'breakdown_list',
        icon: 'wrench',
        bulletPoints: [
          'Technician is balancing on a ladder winding a high-tension spring',
          'Impact wrench and motor running in a loud echoing garage',
          'Driving the service truck between job sites on the highway',
          'Office staff already on line 1 with another customer',
        ],
      },
      {
        slideNumber: 4,
        headline: 'How Instant Voice AI Picks Up on Ring 2',
        bodyText: 'The AI answers in natural conversational voice and handles the caller as professionally as your best dispatcher.',
        supportingLabel: 'DISPATCH WORKFLOW',
        layoutType: 'call_flow',
        icon: 'bot',
        bulletPoints: [
          'Step 1: Answers within 0.8 seconds (24/7/365)',
          'Step 2: Identifies issue (broken spring, opener dead, off-track cable)',
          'Step 3: Collects customer address and door dimensions',
          'Step 4: Transcribes audio and dispatches instant SMS to tech',
        ],
      },
      {
        slideNumber: 5,
        headline: 'What The Homeowner Actually Experiences',
        bodyText: 'No robotic menu trees. No "Press 1 for service." Just an immediate, calm, and reassuring conversation.',
        supportingLabel: 'CALLER EXPERIENCE',
        layoutType: 'solution_feature',
        icon: 'check-circle-2',
        bulletPoints: [
          'Understands slang like "the door slammed down crooked"',
          'Asks if a car is currently stuck inside (urgency triage)',
          'Quotes your standard service fee range transparently',
          'Confirms tech arrival window and sends SMS receipt',
        ],
      },
      {
        slideNumber: 6,
        headline: 'Zero Extra Overhead. Maximum Truck Roll ROI.',
        bodyText: 'You spent thousands on Google LSA and local SEO. Make sure every single dollar spent connects to a booked job.',
        supportingLabel: 'OPERATIONAL IMPACT',
        layoutType: 'metrics_grid',
        icon: 'shield-check',
        highlightMetric: { value: '100%', label: 'Emergency Call Capture' },
        bulletPoints: [
          'No full-time $4,000/mo night dispatcher salary',
          'No missed calls while technicians are on ladders',
          'Full audio recording & summary delivered to your phone',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Test The Agent Yourself in 60 Seconds',
        bodyText: 'Call our dedicated garage door demo line right now. Pretend your torsion spring just snapped.',
        supportingLabel: 'FREE LIVE DEMO',
        layoutType: 'cta_action',
        icon: 'phone-call',
        highlightMetric: { value: '(844) 385-DOOR', label: 'Call Live Demo Line' },
        bulletPoints: [
          'No sales rep. No pitch. Just test the voice quality.',
          'Experience the exact questions it asks garage door callers.',
          'Available 24 hours a day, 7 days a week.',
        ],
      },
    ],
    renderedAssets: [],
  },
  {
    id: 'camp-demo-02',
    title: 'The 9 PM Broken Torsion Spring Dilemma',
    targetAudience: 'US Garage Door Companies with After-Hours Service',
    pillarId: 'after-hours',
    objective: 'Explain why after-hours emergency calls have the highest profit margins and how to capture them without ruining family dinners.',
    contentAngleExplanation: 'Homeowners coming home late find their door won’t open. They will pay premium rates if someone answers immediately with confidence.',
    theme: 'modern-navy',
    scheduledTime: '11:45',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `It's 9:15 PM on a Tuesday. A homeowner arrives home from work, presses their garage remote, and hears a deafening bang: a broken torsion spring.\n\nTheir minivan is stuck inside. They have to take their kids to school at 7:00 AM tomorrow.\n\nWho gets this job? Not the company with the best 5-star rating that opens at 8 AM. The company that picks up the phone right now at 9:15 PM and confirms a technician will be there at 6:30 AM.\n\nHere is how garage door owners use voice AI to protect after-hours emergency revenue while keeping their phones on silent during dinner with their family. 👉\n\n#GarageDoorContractors #AfterHoursService #FieldServiceManagement #SmallBusinessAutomation #VoiceAgents`,
        hashtags: ['#GarageDoorContractors', '#AfterHoursService', '#VoiceAgents'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `9 PM emergency calls are the highest ticket jobs in the garage door industry. 💰\n\nSwipe to see how top operators answer 100% of night and weekend calls without waking up their family or paying for an expensive answering service. ➡️\n\n#garagedoors #garagedoorrepair #afterhourscalls #tradesmen #servicecontractor`,
        hashtags: ['#garagedoors', '#garagedoorrepair', '#servicecontractor'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: 'The 9 PM Broken Spring Emergency',
        bodyText: 'Why after-hours calls carry your highest ticket margins—and why most contractors miss them completely.',
        supportingLabel: 'PILLAR 02 // AFTER-HOURS',
        layoutType: 'hook_title',
        icon: 'moon',
        highlightMetric: { value: '2.4x', label: 'Higher Emergency Margin' },
      },
      {
        slideNumber: 2,
        headline: 'The Homeowner Panic at 9:15 PM',
        bodyText: 'When a garage door spring snaps at night, the homeowner is not shopping around for coupons.',
        supportingLabel: 'BUYER PSYCHOLOGY',
        layoutType: 'problem_stat',
        icon: 'alert-triangle',
        bulletPoints: [
          'Their vehicle is trapped inside the garage',
          'They have a 7:30 AM commute or school drop-off',
          'High willingness to pay emergency dispatch premiums',
          'They will dial up to 5 contractors until a human voice answers',
        ],
      },
      {
        slideNumber: 3,
        headline: 'The Problem with Generic Call Centers',
        bodyText: 'Old-school answering services don’t understand garage door mechanics and create customer frustration.',
        supportingLabel: 'THE BOTTLENECK',
        layoutType: 'breakdown_list',
        icon: 'x-circle',
        bulletPoints: [
          'Generic operators say "Someone will call you back tomorrow"',
          'Zero knowledge of torsion springs vs extension springs',
          'Charge $2.50 to $4.00 per minute just to take down messy notes',
          'Customer still hangs up feeling uncertain',
        ],
      },
      {
        slideNumber: 4,
        headline: 'AI Voice Agent: 24/7 Triage & Dispatch',
        bodyText: 'Configured with your exact garage door repair rules, pricing tiers, and on-call technician schedule.',
        supportingLabel: 'INTELLIGENT ROUTING',
        layoutType: 'call_flow',
        icon: 'cpu',
        bulletPoints: [
          'Answers instantly with your company greeting',
          'Asks: "Is your car currently trapped inside?"',
          'Quotes after-hours emergency callout policy clearly',
          'Pings on-call technician via SMS with job details and address',
        ],
      },
      {
        slideNumber: 5,
        headline: 'You Stay in Control of The Schedule',
        bodyText: 'Set customized business rules for what qualifies as an immediate truck roll vs next-morning appointment.',
        supportingLabel: 'RULES ENGINE',
        layoutType: 'solution_feature',
        icon: 'settings',
        bulletPoints: [
          'Rule 1: Car trapped + homeowner agrees to $149 dispatch fee = alert tech',
          'Rule 2: Routine tune-up inquiry = book next open morning slot',
          'Rule 3: Spam or telemarketer = politely filtered without bothering you',
        ],
      },
      {
        slideNumber: 6,
        headline: 'Sleep Through The Night with Peace of Mind',
        bodyText: 'Wake up to booked morning jobs, qualified addresses, and audio recordings waiting in your dashboard.',
        supportingLabel: 'CONTRACTOR FREEDOM',
        layoutType: 'metrics_grid',
        icon: 'check-check',
        highlightMetric: { value: '0', label: 'Missed Night Emergencies' },
        bulletPoints: [
          'Protect family dinners from non-stop phone vibrations',
          'Every legitimate emergency is captured and scheduled',
          'Full transcript logged into your CRM or scheduling app',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Hear What It Sounds Like in Action',
        bodyText: 'Dial the demo number from your smartphone right now to hear how an after-hours emergency call is handled.',
        supportingLabel: 'LISTEN TO DEMO',
        layoutType: 'cta_action',
        icon: 'phone-call',
        highlightMetric: { value: '(844) 385-DOOR', label: 'Interactive Demo Line' },
        bulletPoints: [
          'Available 24 hours a day, 7 days a week',
          'Speak naturally and ask about pricing or emergency spring repairs',
          'See how fast and natural the conversation feels',
        ],
      },
    ],
    renderedAssets: [],
  },
  {
    id: 'camp-demo-03',
    title: '5 Crucial Questions Every Garage Door Dispatcher Must Ask',
    targetAudience: 'US Garage Door Business Owners & Dispatchers',
    pillarId: 'lead-capture-booking',
    objective: 'Educate contractors on the 5 qualifying questions that save technicians 30 minutes on every truck roll.',
    contentAngleExplanation: 'Technicians arriving without the right spring wire size or opener track length waste hours. Proper phone qualification fixes this before the truck departs.',
    theme: 'precision-blueprint',
    scheduledTime: '15:30',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `Nothing burns technician morale faster than driving 25 minutes across town, only to find the homeowner has a commercial 14-foot door when the tech only has residential 2-inch springs on the truck.\n\nProper phone qualification isn't just about getting an address—it's about equipping your field technician to complete the job in a single trip.\n\nHere are the 5 essential questions our voice AI asks every single inbound garage door caller before booking the appointment. 🛠️\n\n#GarageDoorInstallation #FieldServiceOperations #DispatchTips #HomeServices #HVACandPlumbingTrades #ContractorTools`,
        hashtags: ['#GarageDoorInstallation', '#DispatchTips', '#HomeServices', '#ContractorTools'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `Ever sent a technician to a job only for them to realize they didn't have the right parts on the truck? 🤦‍♂️\n\nSwipe through for the 5 questions our Voice AI asks on every single garage door call to ensure 1-trip completion rates. ➡️\n\n#garagedoor #servicecontractor #technicianlife #dispatching #contractorbusiness`,
        hashtags: ['#garagedoor', '#servicecontractor', '#dispatching'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: '5 Questions Your Phone Must Ask Before Dispatching',
        bodyText: 'How smart phone qualification prevents wasted truck rolls and boosts first-trip completion to 92%.',
        supportingLabel: 'PILLAR 03 // DISPATCH QUALIFICATION',
        layoutType: 'hook_title',
        icon: 'help-circle',
        highlightMetric: { value: '92%', label: 'First-Trip Completion' },
      },
      {
        slideNumber: 2,
        headline: 'Question 1: Door Size & Configuration',
        bodyText: 'Is this a single-car 8x7, a standard double 16x7, or a custom 8-foot or 14-foot commercial height door?',
        supportingLabel: 'QUESTION 01',
        layoutType: 'solution_feature',
        icon: 'maximize-2',
        bulletPoints: [
          'Ensures the truck is stocked with the right torsion spring wire size',
          'Identifies if a 2-man crew is needed for heavy carriage-house doors',
          'Prevents unexpected surprises upon arrival at the driveway',
        ],
      },
      {
        slideNumber: 3,
        headline: 'Question 2: Symptoms & Cable Condition',
        bodyText: 'Did you hear a loud gunshot sound (spring snap), or is the cable loose and spooling off the drum?',
        supportingLabel: 'QUESTION 02',
        layoutType: 'solution_feature',
        icon: 'tool',
        bulletPoints: [
          'Differentiates simple sensor misalignment from dangerous spring tension',
          'Instructs the caller NOT to pull the emergency red release cord if door is crooked',
          'Keeps the customer safe before the technician arrives',
        ],
      },
      {
        slideNumber: 4,
        headline: 'Question 3: Motor & Opener Make/Model',
        bodyText: 'Is it a LiftMaster, Chamberlain, Genie, or older unit with stripped nylon drive gears?',
        supportingLabel: 'QUESTION 03',
        layoutType: 'solution_feature',
        icon: 'power',
        bulletPoints: [
          'Identifies belt-drive vs chain-drive vs wall-mount jackshaft',
          'Allows technician to pre-load compatible remotes and logic boards',
          'Saves 45 minutes of driving back to the supplier supply shop',
        ],
      },
      {
        slideNumber: 5,
        headline: 'Question 4: Car Entrapment & Urgency',
        bodyText: 'Is an automobile currently trapped inside the garage, or is this a scheduled preventive maintenance check?',
        supportingLabel: 'QUESTION 04',
        layoutType: 'solution_feature',
        icon: 'car',
        bulletPoints: [
          'Determines appointment priority: Immediate 90-min vs Next-day window',
          'Allows dispatchers to route the nearest technician dynamically',
          'Delivers high customer relief by validating their urgency',
        ],
      },
      {
        slideNumber: 6,
        headline: 'Question 5: Address, Gate Codes & Authority',
        bodyText: 'Accurate street address, gate entry codes, and verification that the caller is the homeowner or authorized tenant.',
        supportingLabel: 'QUESTION 05',
        layoutType: 'solution_feature',
        icon: 'map-pin',
        bulletPoints: [
          'Zero delayed arrivals due to missing gate codes',
          'Ensures payment decision-maker will be present at the appointment',
          'Synced immediately to ServiceTitan, Housecall Pro, or Jobber',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Let Voice AI Handle Every Question Perfectly',
        bodyText: 'Trained on 50+ garage door scenarios so your technicians can focus on repairs, not administrative phone tag.',
        supportingLabel: 'TRY IT LIVE',
        layoutType: 'cta_action',
        icon: 'phone-call',
        highlightMetric: { value: '(844) 385-DOOR', label: 'Call The Demo Line' },
        bulletPoints: [
          'Call right now to hear how questions are asked naturally',
          'Seamless integration with standard contractor CRMs',
          'Start capturing 100% of inbound calls today',
        ],
      },
    ],
    renderedAssets: [],
  },
  {
    id: 'camp-demo-04',
    title: 'The Contractor FAQ: Will Voice AI Sound Robotic?',
    targetAudience: 'Garage Door Company Owners & Managers',
    pillarId: 'objections-faqs',
    objective: 'Dispel the myth of clunky IVR menus and demonstrate conversational latency, natural interruptions, and caller delight.',
    contentAngleExplanation: 'Contractors are skeptical because they remember terrible 2012 automated menus. Modern Voice AI operates at 800ms conversational latency with natural voice inflections.',
    theme: 'emerald-minimal',
    scheduledTime: '18:45',
    isDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    platforms: {
      linkedin: {
        enabled: true,
        caption: `Whenever we speak with garage door company owners, the #1 objection is always the same:\n\n"I don't want my customers getting stuck in a robotic phone tree like an airline or credit card company."\n\nWe agree 100%. Traditional IVR menus ("Press 1 for sales...") lose garage door customers.\n\nModern conversational voice AI is entirely different: there are no keypad buttons, no robot accents, and under 800ms response latency.\n\nHere are the top 5 questions garage door contractors ask us before testing the technology. 👉\n\n#GarageDoorBusiness #TradeContractor #VoiceAI #FieldServiceManagement #ContractorTech`,
        hashtags: ['#GarageDoorBusiness', '#TradeContractor', '#VoiceAI', '#ContractorTech'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
      instagram: {
        enabled: true,
        caption: `"Will it sound like a robot?"\n\nSwipe to see the 5 most common questions garage door owners ask about AI phone agents—and why callers usually think they're speaking with someone in your front office. ➡️\n\n#garagedoor #tradesman #contractortips #smallbiztech #automation`,
        hashtags: ['#garagedoor', '#tradesman', '#contractortips'],
        format: 'portrait_4_5',
        status: 'draft',
        retryCount: 0,
      },
    },
    slides: [
      {
        slideNumber: 1,
        headline: '"Will It Sound Like a Robotic Airline Menu?"',
        bodyText: 'The 5 most common contractor questions about AI voice dispatch—answered with total honesty.',
        supportingLabel: 'PILLAR 05 // CONTRACTOR FAQS',
        layoutType: 'hook_title',
        icon: 'bot',
        highlightMetric: { value: '< 800ms', label: 'Response Latency' },
      },
      {
        slideNumber: 2,
        headline: 'FAQ 1: Can The Caller Interrupt The AI?',
        bodyText: 'Yes. Just like a real human, if a customer speaks while the agent is talking, the agent stops immediately and listens.',
        supportingLabel: 'INTERRUPTION HANDLING',
        layoutType: 'breakdown_list',
        icon: 'mic',
        bulletPoints: [
          'Full duplex audio allows natural two-way conversation',
          'Caller can say: "Wait, let me check the brand on the motor"',
          'The AI pauses politely: "Sure thing, take your time!"',
          'Zero awkward overlaps or waiting for pre-recorded loops',
        ],
      },
      {
        slideNumber: 3,
        headline: 'FAQ 2: What If a Caller Has a Heavy Accent or Background Noise?',
        bodyText: 'Built with noise-cancellation models trained across thousands of garage and street environments.',
        supportingLabel: 'AUDIO PROCESSING',
        layoutType: 'solution_feature',
        icon: 'volume-2',
        bulletPoints: [
          'Filters out barking dogs, passing traffic, and crying children',
          'Accurately transcribes street names, zip codes, and phone numbers',
          'Confirms: "Just to be sure, that was 412 Maple Ridge Road, right?"',
        ],
      },
      {
        slideNumber: 4,
        headline: 'FAQ 3: How Does It Quote Pricing?',
        bodyText: 'You set the exact rules. The AI never guesses or makes up rates that you haven’t explicitly approved.',
        supportingLabel: 'PRICING INTEGRITY',
        layoutType: 'problem_stat',
        icon: 'dollar-sign',
        bulletPoints: [
          'Example rule: "Diagnostic dispatch fee is $79, waived with repair"',
          'Example rule: "Spring repairs typically range $240 to $400 depending on wire size"',
          'If a customer asks for custom welding: "Our tech will inspect and quote on site"',
        ],
      },
      {
        slideNumber: 5,
        headline: 'FAQ 4: What Happens If Someone Demands a Human?',
        bodyText: 'Graceful escalation. If a customer is upset or asks for the manager, the call transfers or alerts you immediately.',
        supportingLabel: 'ESCALATION PROTOCOL',
        layoutType: 'solution_feature',
        icon: 'phone-forwarded',
        bulletPoints: [
          'Instant call forwarding to owner/manager phone if requested',
          'High-priority SMS sent with caller name, phone, and reason',
          'Caller is never trapped or locked in an endless loop',
        ],
      },
      {
        slideNumber: 6,
        headline: 'FAQ 5: Does It Sync with My Existing Software?',
        bodyText: 'Yes. Connects directly via Webhooks, Zapier, or direct API to popular field service platforms.',
        supportingLabel: 'SOFTWARE INTEGRATION',
        layoutType: 'metrics_grid',
        icon: 'refresh-cw',
        highlightMetric: { value: '100%', label: 'CRM Compatibility' },
        bulletPoints: [
          'ServiceTitan, Housecall Pro, Jobber, FieldEdge, Google Calendar',
          'Creates new customer record and drafts the job card automatically',
          'Attaches call recording and transcribed summary',
        ],
      },
      {
        slideNumber: 7,
        headline: 'Don’t Take Our Word For It. Dial The Line.',
        bodyText: 'Experience the conversational speed and natural tone with your own ears on our live demo line.',
        supportingLabel: 'TEST IT YOURSELF',
        layoutType: 'cta_action',
        icon: 'phone-call',
        highlightMetric: { value: '(844) 385-DOOR', label: 'Call Demo Line 24/7' },
        bulletPoints: [
          'Pretend you are a stressed homeowner with a garage door emergency',
          'Notice how quickly it responds without hesitation',
          'See how easily it captures the details',
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
          campaignTitle: 'The $280 Voicemail Leak in Garage Door Repair',
          platform: 'linkedin',
          action: 'scheduled_trigger',
          status: 'success',
          message: 'Demo campaign initialized in draft queue ready for rendering and review.',
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
        // Ensure all required fields exist
        return {
          strategy: parsed.strategy || DEFAULT_STRATEGY,
          schedule: parsed.schedule || DEFAULT_SCHEDULE,
          linkedin: parsed.linkedin || DEFAULT_LINKEDIN,
          instagram: parsed.instagram || DEFAULT_INSTAGRAM,
          campaigns: parsed.campaigns || INITIAL_DEMO_CAMPAIGNS,
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
    // Keep max 500 logs
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

  recordGeminiCall(estimatedTokens = 1200) {
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
