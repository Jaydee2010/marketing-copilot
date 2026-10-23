import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Campaign, Slide, SlideFormat, SlideTheme, RenderedSlideAsset } from '../src/types/index';
import { db } from './db';

const ASSETS_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data', 'assets')
  : path.resolve(process.cwd(), 'data', 'assets');

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Word wrapping helper for SVG text
function wrapText(text: string, maxCharsPerLine = 34): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

interface ThemePalette {
  bgGradientStart: string;
  bgGradientEnd: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentGlow: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
  highlightBg: string;
  highlightText: string;
}

function getThemePalette(theme: SlideTheme): ThemePalette {
  switch (theme) {
    case 'garage-amber':
      return {
        bgGradientStart: '#0f172a',
        bgGradientEnd: '#090d16',
        cardBg: '#1e293b',
        cardBorder: '#f59e0b',
        accent: '#f59e0b',
        accentGlow: 'rgba(245, 158, 11, 0.25)',
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeText: '#fbbf24',
        highlightBg: '#b45309',
        highlightText: '#ffffff',
      };
    case 'precision-blueprint':
      return {
        bgGradientStart: '#0a192f',
        bgGradientEnd: '#020c1b',
        cardBg: '#112240',
        cardBorder: '#38bdf8',
        accent: '#38bdf8',
        accentGlow: 'rgba(56, 189, 248, 0.25)',
        textPrimary: '#ffffff',
        textSecondary: '#8892b0',
        badgeBg: 'rgba(56, 189, 248, 0.15)',
        badgeText: '#38bdf8',
        highlightBg: '#0284c7',
        highlightText: '#ffffff',
      };
    case 'emerald-minimal':
      return {
        bgGradientStart: '#061310',
        bgGradientEnd: '#020706',
        cardBg: '#0e231e',
        cardBorder: '#10b981',
        accent: '#10b981',
        accentGlow: 'rgba(16, 185, 129, 0.25)',
        textPrimary: '#ffffff',
        textSecondary: '#a7f3d0',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeText: '#34d399',
        highlightBg: '#059669',
        highlightText: '#ffffff',
      };
    case 'midnight-crimson':
      return {
        bgGradientStart: '#1b0808',
        bgGradientEnd: '#0a0303',
        cardBg: '#2c0f0f',
        cardBorder: '#ef4444',
        accent: '#ef4444',
        accentGlow: 'rgba(239, 68, 68, 0.28)',
        textPrimary: '#ffffff',
        textSecondary: '#fca5a5',
        badgeBg: 'rgba(239, 68, 68, 0.18)',
        badgeText: '#f87171',
        highlightBg: '#b91c1c',
        highlightText: '#ffffff',
      };
    case 'industrial-copper':
      return {
        bgGradientStart: '#1c1108',
        bgGradientEnd: '#0d0703',
        cardBg: '#2e1c0e',
        cardBorder: '#ea580c',
        accent: '#f97316',
        accentGlow: 'rgba(249, 115, 22, 0.25)',
        textPrimary: '#ffffff',
        textSecondary: '#fdba74',
        badgeBg: 'rgba(249, 115, 22, 0.18)',
        badgeText: '#fb923c',
        highlightBg: '#c2410c',
        highlightText: '#ffffff',
      };
    case 'modern-navy':
    default:
      return {
        bgGradientStart: '#0b132b',
        bgGradientEnd: '#050814',
        cardBg: '#1c2541',
        cardBorder: '#3b82f6',
        accent: '#38bdf8',
        accentGlow: 'rgba(56, 189, 248, 0.25)',
        textPrimary: '#ffffff',
        textSecondary: '#94a3b8',
        badgeBg: 'rgba(59, 130, 246, 0.18)',
        badgeText: '#60a5fa',
        highlightBg: '#2563eb',
        highlightText: '#ffffff',
      };
  }
}

export function generateSlideSvg(
  slide: Slide,
  theme: SlideTheme,
  format: SlideFormat,
  campaignTitle: string,
  businessName = 'Stepstone AI Agency',
  demoPhone = '(844) 385-DOOR'
): string {
  const width = 1080;
  const height = format === 'portrait_4_5' ? 1350 : 1080;
  const palette = getThemePalette(theme);

  const headlineLines = wrapText(slide.headline, 28);
  const bodyLines = wrapText(slide.bodyText, 40);

  // Background grid and theme-specific decorative styling
  const patternDefs = `
    <defs>
      <!-- Standard blueprint/technical grid -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.035)" stroke-width="1"/>
      </pattern>
      <!-- Industrial caution diagonal stripes for garage-amber -->
      <pattern id="stripes" width="40" height="40" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(245, 158, 11, 0.04)" stroke-width="8" />
      </pattern>
      <!-- Technical dot matrix for emerald / crimson -->
      <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="rgba(255, 255, 255, 0.04)"/>
      </pattern>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.bgGradientStart}"/>
        <stop offset="100%" stop-color="${palette.bgGradientEnd}"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${palette.accent}"/>
        <stop offset="100%" stop-color="${palette.badgeText}"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="20" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    <rect width="${width}" height="${height}" fill="${theme === 'garage-amber' ? 'url(#stripes)' : theme === 'emerald-minimal' || theme === 'midnight-crimson' ? 'url(#dots)' : 'url(#grid)'}"/>
    <circle cx="${width - 100}" cy="100" r="320" fill="${palette.accentGlow}" filter="url(#glow)"/>
    <circle cx="100" cy="${height - 100}" r="280" fill="${palette.accentGlow}" filter="url(#glow)"/>
  `;

  // Header Bar (Brand & Slide Indicator)
  const header = `
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="36" height="36" rx="8" fill="${palette.accent}"/>
      <text x="18" y="24" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="16" fill="#000000" text-anchor="middle">AI</text>
      <text x="48" y="24" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="20" fill="${palette.textPrimary}">${escapeXml(businessName)}</text>
      <text x="48" y="44" font-family="Plus Jakarta Sans, sans-serif" font-weight="500" font-size="13" fill="${palette.textSecondary}">GARAGE DOOR VOICE DISPATCH</text>
      
      <!-- Slide Counter Badge -->
      <rect x="${width - 240}" y="2" width="80" height="36" rx="18" fill="${palette.badgeBg}" stroke="${palette.accent}" stroke-width="1.5"/>
      <text x="${width - 200}" y="25" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="16" fill="${palette.badgeText}" text-anchor="middle">0${slide.slideNumber} / 07</text>
    </g>
  `;

  // Supporting Badge (Top of Content)
  const badgeY = 190;
  const badge = `
    <g transform="translate(80, ${badgeY})">
      <rect x="0" y="0" width="${Math.min(480, (slide.supportingLabel.length * 11) + 40)}" height="38" rx="8" fill="${palette.badgeBg}" stroke="${palette.accent}" stroke-width="1"/>
      <circle cx="20" cy="19" r="5" fill="${palette.accent}"/>
      <text x="35" y="24" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="14" fill="${palette.badgeText}" letter-spacing="1.5">${escapeXml(slide.supportingLabel.toUpperCase())}</text>
    </g>
  `;

  // Headline
  const headlineStartY = 275;
  const headlineLineHeight = 56;
  const headlineSvg = headlineLines
    .map(
      (line, i) =>
        `<text x="80" y="${headlineStartY + (i * headlineLineHeight)}" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="44" fill="${palette.textPrimary}" letter-spacing="-0.5">${escapeXml(line)}</text>`
    )
    .join('');

  const headlineEndY = headlineStartY + (headlineLines.length * headlineLineHeight);

  // Subtitle / Body text
  const bodyStartY = headlineEndY + 20;
  const bodyLineHeight = 32;
  const bodySvg = bodyLines
    .map(
      (line, i) =>
        `<text x="80" y="${bodyStartY + (i * bodyLineHeight)}" font-family="Plus Jakarta Sans, sans-serif" font-weight="400" font-size="22" fill="${palette.textSecondary}">${escapeXml(line)}</text>`
    )
    .join('');

  const contentEndY = bodyStartY + (bodyLines.length * bodyLineHeight) + 30;

  // Layout-specific dynamic visual elements
  let dynamicSection = '';

  if (slide.highlightMetric) {
    const metricY = contentEndY + 10;
    dynamicSection += `
      <g transform="translate(80, ${metricY})">
        <rect x="0" y="0" width="${width - 160}" height="140" rx="16" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="2"/>
        <rect x="0" y="0" width="8" height="140" rx="4" fill="${palette.accent}"/>
        <text x="40" y="75" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="56" fill="${palette.accent}">${escapeXml(slide.highlightMetric.value)}</text>
        <text x="40" y="112" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="20" fill="${palette.textPrimary}">${escapeXml(slide.highlightMetric.label)}</text>
      </g>
    `;
  }

  // Bullets / Workflow steps
  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    const startY = slide.highlightMetric ? contentEndY + 175 : contentEndY + 15;
    const cardHeight = Math.min(height - startY - 140, slide.bulletPoints.length * 75);

    const bulletsSvg = slide.bulletPoints.map((pt, i) => {
      const py = startY + (i * 72);
      const isCallFlow = slide.layoutType === 'call_flow';
      const bulletLines = wrapText(pt, 38);
      return `
        <g transform="translate(80, ${py})">
          <rect x="0" y="0" width="${width - 160}" height="64" rx="12" fill="${palette.cardBg}" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
          <circle cx="32" cy="32" r="14" fill="${palette.badgeBg}" stroke="${palette.accent}" stroke-width="1.5"/>
          <text x="32" y="37" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="14" fill="${palette.accent}" text-anchor="middle">${i + 1}</text>
          <text x="64" y="38" font-family="Plus Jakarta Sans, sans-serif" font-weight="600" font-size="19" fill="${palette.textPrimary}">${escapeXml(bulletLines[0] || pt)}</text>
        </g>
      `;
    }).join('');

    dynamicSection += bulletsSvg;
  }

  // Footer with Swipe Prompt or CTA
  const footerY = height - 90;
  const isLastSlide = slide.slideNumber === 7;
  const isCalculatorCta =
    slide.ctaUrl?.includes('caculator') ||
    slide.bodyText?.includes('caculator') ||
    slide.headline?.toLowerCase().includes('calculator') ||
    slide.supportingLabel?.toLowerCase().includes('calculator') ||
    slide.highlightMetric?.label?.includes('caculator') ||
    slide.highlightMetric?.value?.includes('caculator');

  const isDmCalculator =
    !isCalculatorCta &&
    (slide.headline?.toLowerCase().includes('dm') ||
      slide.bodyText?.toLowerCase().includes('dm me calculator') ||
      slide.highlightMetric?.value?.toLowerCase().includes('calculator'));

  const isDemoCta =
    !isCalculatorCta &&
    !isDmCalculator &&
    (slide.bodyText?.toLowerCase().includes('bio') ||
      slide.bodyText?.toLowerCase().includes('demo') ||
      slide.headline?.toLowerCase().includes('demo') ||
      slide.highlightMetric?.value?.toLowerCase().includes('demo') ||
      slide.highlightMetric?.value?.includes('844'));

  let lastSlideButtonText = 'RUN YOUR NUMBERS 👉';
  let lastSlideFooterText = 'https://garage-door-lost-revenue-caculator.vercel.app/';

  if (isCalculatorCta) {
    lastSlideButtonText = 'RUN YOUR NUMBERS 👉';
    lastSlideFooterText = 'https://garage-door-lost-revenue-caculator.vercel.app/';
  } else if (isDmCalculator) {
    lastSlideButtonText = 'DM "CALCULATOR" 💬';
    lastSlideFooterText = 'DM me CALCULATOR for the free estimator';
  } else if (isDemoCta) {
    lastSlideButtonText = 'TRY LIVE DEMO 👉';
    lastSlideFooterText = 'Link in bio to test the 24/7 demo agent';
  } else {
    // dm_conversation or other
    lastSlideButtonText = 'LET’S TALK 💬';
    lastSlideFooterText = 'DM me and let’s talk missed calls';
  }

  const footer = `
    <g transform="translate(80, ${footerY})">
      <line x1="0" y1="0" x2="${width - 160}" y2="0" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
      ${
        isLastSlide
          ? `
            <rect x="${width - 440}" y="15" width="280" height="48" rx="24" fill="url(#accentGrad)"/>
            <text x="${width - 300}" y="45" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="16" fill="#000000" text-anchor="middle">${escapeXml(lastSlideButtonText)}</text>
            <text x="0" y="45" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${lastSlideFooterText.length > 40 ? '13' : '15'}" fill="${palette.accent}">${escapeXml(lastSlideFooterText)}</text>
            `
          : `
          <text x="0" y="45" font-family="Plus Jakarta Sans, sans-serif" font-weight="500" font-size="16" fill="${palette.textSecondary}">stepstoneai.agency // Garage Door Call Handling</text>
          <g transform="translate(${width - 320}, 20)">
            <text x="0" y="24" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="16" fill="${palette.accent}">SWIPE TO LEARN</text>
            <path d="M 135 18 L 155 18 M 147 10 L 155 18 L 147 26" stroke="${palette.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          `
      }
    </g>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${patternDefs}
      ${header}
      ${badge}
      ${headlineSvg}
      ${bodySvg}
      ${dynamicSection}
      ${footer}
    </svg>
  `;
}

export async function renderCampaignSlides(campaignId: string, format: SlideFormat = 'portrait_4_5'): Promise<RenderedSlideAsset[]> {
  const campaign = db.getCampaign(campaignId);
  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const strategy = db.getStrategy();
  const rendered: RenderedSlideAsset[] = [];

  for (const slide of campaign.slides) {
    const svg = generateSlideSvg(
      slide,
      campaign.theme,
      format,
      campaign.title,
      strategy.businessName,
      strategy.demoPhoneNumber
    );

    const filename = `${campaign.id}_slide_${slide.slideNumber}_${format}.png`;
    const outputPath = path.join(ASSETS_DIR, filename);

    // Convert SVG to PNG via Sharp
    const buffer = Buffer.from(svg);
    const pngBuffer = await sharp(buffer)
      .png({ quality: 95, compressionLevel: 8 })
      .toBuffer();

    fs.writeFileSync(outputPath, pngBuffer);

    const asset: RenderedSlideAsset = {
      slideIndex: slide.slideNumber,
      format,
      assetId: `asset-${campaign.id}-${slide.slideNumber}-${format}`,
      url: `/api/assets/${filename}`,
      filename,
      sizeBytes: pngBuffer.length,
      renderedAt: new Date().toISOString(),
    };

    rendered.push(asset);
    db.recordAssetRender(pngBuffer.length);
  }

  // Update campaign
  campaign.renderedAssets = rendered;
  db.saveCampaign(campaign);

  db.addLog({
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    platform: 'linkedin',
    action: 'render',
    status: 'success',
    message: `Rendered 7 slides as high-res PNGs (${format}).`,
    details: { slideCount: rendered.length, totalBytes: rendered.reduce((a, b) => a + b.sizeBytes, 0) },
  });

  return rendered;
}
