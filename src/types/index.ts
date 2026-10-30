export type Platform = 'linkedin' | 'instagram';

export type ContentPillarId =
  | 'missed-calls'
  | 'after-hours'
  | 'lead-capture-booking'
  | 'ai-agent-demo'
  | 'objections-faqs'
  | 'garage-business-education'
  | 'demo-invitations';

export interface ContentPillar {
  id: ContentPillarId;
  title: string;
  shortLabel: string;
  description: string;
  icon: string;
  defaultAngle: string;
}

export type SlideLayoutType =
  | 'hook_title'
  | 'problem_stat'
  | 'breakdown_list'
  | 'call_flow'
  | 'solution_feature'
  | 'metrics_grid'
  | 'cta_action';

export type BuyingMotivation = 'make_money' | 'reduce_pain' | 'gain_time' | 'reduce_waste';

export type CtaType =
  | 'bio_calculator' // Post 1: Link in bio to get the free revenue-loss calculator
  | 'bio_voice_agent' // Post 2: Link in bio to test the live AI voice agent demo
  | 'bio_hub' // Post 3: Link in bio to access both calculator and voice demo
  | 'dm_calc_or_voice' // Post 4: DM "CALC" or "VOICE" for direct link
  | 'calculator' // Backward-compatible alias
  | 'dm_calculator' // Backward-compatible alias
  | 'demo_cta' // Backward-compatible alias
  | 'dm_conversation' // Backward-compatible alias
  | 'demo_call'
  | 'pilot_invite'
  | 'checklist';

export interface CtaBatchValidation {
  valid: boolean;
  bioLinkCount: number; // Exactly 3 posts leading to bio (calculator, voice agent, hub)
  dmKeywordCount: number; // Exactly 1 post leading to DM (DM "CALC" or "VOICE")
  calculatorCount?: number;
  alternativeCount?: number;
  distinctAlternativesCount?: number;
  issues: string[];
}

export interface Slide {
  slideNumber: number; // 1 to 7
  headline: string;
  bodyText: string;
  supportingLabel: string; // e.g. "SLIDE 01 // THE HOOK"
  layoutType: SlideLayoutType;
  icon: string;
  visualInstruction?: string;
  bulletPoints?: string[];
  highlightMetric?: {
    value: string;
    label: string;
  };
  ctaUrl?: string; // For Slide 7 calculator URL
}

export type SlideFormat = 'portrait_4_5' | 'square_1_1';
export type SlideTheme =
  | 'modern-navy'
  | 'garage-amber'
  | 'precision-blueprint'
  | 'emerald-minimal'
  | 'midnight-crimson'
  | 'industrial-copper';

export interface PlatformPostConfig {
  enabled: boolean;
  caption: string;
  hashtags: string[];
  format: SlideFormat;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  publishedAt?: string;
  externalPostId?: string;
  externalPostUrl?: string;
  lastError?: string;
  retryCount: number;
}

export interface RenderedSlideAsset {
  slideIndex: number;
  format: SlideFormat;
  assetId: string;
  url: string;
  filename: string;
  sizeBytes: number;
  renderedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  targetAudience: string;
  pillarId: ContentPillarId;
  buyingMotivation?: BuyingMotivation;
  ctaType?: CtaType;
  objective: string;
  contentAngleExplanation: string;
  theme: SlideTheme;
  hasJoke?: boolean;
  scheduledTime: string; // ISO date string or HH:mm slot
  slides: Slide[]; // Exactly 7 slides
  platforms: {
    linkedin: PlatformPostConfig;
    instagram: PlatformPostConfig;
  };
  renderedAssets: RenderedSlideAsset[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingStrategy {
  businessName: string;
  brandTagline: string;
  targetAudience: string;
  targetRegion: string;
  coreService: string;
  toneOfVoice: string;
  demoPhoneNumber: string;
  websiteUrl: string;
  calculatorUrl: string; // https://garage-door-lost-revenue-caculator.vercel.app/
  customPillars: ContentPillar[];
  bannedClaims: string[];
  companyHighlights: string[];
}

export interface SchedulerConfig {
  timezone: string;
  dailyTargetPosts: number;
  dailySlots: string[]; // e.g. ["08:30", "12:15", "16:45", "19:30"]
  autoPublishEnabled: boolean;
  globalPaused: boolean;
  linkedinPaused: boolean;
  instagramPaused: boolean;
  dailyPostLimitPerPlatform: number;
  maxRetries: number;
  activeFormatPreference: SlideFormat;
  lastBatchGeneratedDate?: string;
  autoGenerateBatchEnabled?: boolean;
}

export interface LinkedInCredentials {
  isConnected: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  memberUrn?: string;
  memberName?: string;
  organizationUrn?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
  lastVerifiedAt?: string;
  isTestMode: boolean;
}

export interface InstagramCredentials {
  isConnected: boolean;
  metaAppId: string;
  metaAppSecret: string;
  instagramBusinessId?: string;
  facebookPageId?: string;
  accountUsername?: string;
  userAccessToken?: string;
  tokenExpiresAt?: string;
  lastVerifiedAt?: string;
  isTestMode: boolean;
  publicHostUrl: string; // needed for Meta Graph API to fetch images
}

export interface PublishingLog {
  id: string;
  timestamp: string;
  campaignId: string;
  campaignTitle: string;
  platform: Platform;
  action: 'publish_attempt' | 'render' | 'scheduled_trigger' | 'retry' | 'validation_fail';
  status: 'success' | 'failed' | 'paused' | 'skipped';
  message: string;
  externalPostId?: string;
  details?: Record<string, unknown>;
}

export interface QuotaAndUsage {
  todayGeminiRequests: number;
  todayGeminiEstimatedTokens: number;
  todayPostsLinkedIn: number;
  todayPostsInstagram: number;
  todayRenderedAssetsCount: number;
  totalAssetsDiskBytes: number;
  lastQuotaResetDate: string;
  maxDailyGeminiRequests: number;
  maxDailyPostsPerPlatform: number;
}

export interface AppServerStatus {
  schedulerRunning: boolean;
  currentServerTime: string;
  timezone: string;
  currentTzTime?: string;
  geminiConfigured: boolean;
  geminiModel: string;
  linkedinReady: boolean;
  instagramReady: boolean;
  linkedinConnected?: boolean;
  instagramConnected?: boolean;
  isTestMode?: boolean;
  globalPaused: boolean;
  linkedinPaused?: boolean;
  instagramPaused?: boolean;
  autoPublishEnabled: boolean;
  queueLength: number;
  todayPostsCount: {
    linkedin: number;
    instagram: number;
  };
  todayUsage?: QuotaAndUsage;
}
