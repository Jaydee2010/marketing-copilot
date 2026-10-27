import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Instagram,
  Linkedin,
  Copy,
  Check,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Eye,
  AlertCircle,
  Hash,
  Share2,
} from 'lucide-react';
import { Campaign, Platform } from '../types/index';

interface PublishedPostsViewProps {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
  onGoToCockpit: () => void;
}

export const PublishedPostsView: React.FC<PublishedPostsViewProps> = ({
  campaigns,
  onSelectCampaign,
  onGoToCockpit,
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'linkedin'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCaptionId, setExpandedCaptionId] = useState<string | null>(null);
  const [previewSlideUrl, setPreviewSlideUrl] = useState<string | null>(null);

  // Filter campaigns that have actually been published on at least one platform
  const publishedCampaigns = campaigns.filter((c) => {
    const isIG = c.platforms?.instagram?.status === 'published';
    const isLI = c.platforms?.linkedin?.status === 'published';
    if (platformFilter === 'instagram') return isIG;
    if (platformFilter === 'linkedin') return isLI;
    return isIG || isLI;
  });

  const totalIGPublished = campaigns.filter((c) => c.platforms?.instagram?.status === 'published').length;
  const totalLIPublished = campaigns.filter((c) => c.platforms?.linkedin?.status === 'published').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/20 border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMED LIVE FULFILLMENT</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {publishedCampaigns.length} total published
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Published Posts & Delivery Audit
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Real-time audit log of carousel posts confirmed published to Instagram and LinkedIn. Every post below has been successfully processed and verified by Meta's or LinkedIn's official API containers.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="flex items-center gap-1.5 text-xs text-pink-400 font-semibold justify-center">
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5 font-mono">
                {totalIGPublished}
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold justify-center">
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5 font-mono">
                {totalLIPublished}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              platformFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Platforms ({totalIGPublished + totalLIPublished})
          </button>
          <button
            onClick={() => setPlatformFilter('instagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              platformFilter === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-pink-400'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram ({totalIGPublished})</span>
          </button>
          <button
            onClick={() => setPlatformFilter('linkedin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              platformFilter === 'linkedin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn ({totalLIPublished})</span>
          </button>
        </div>

        <button
          onClick={onGoToCockpit}
          className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <span>Go to Daily Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Published List */}
      {publishedCampaigns.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No Published Posts Found Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Posts published to Instagram or LinkedIn will appear here with live links, verified container IDs, and full 7-slide carousel previews.
            </p>
          </div>
          <button
            onClick={onGoToCockpit}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md"
          >
            <span>Open Queue & Publish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {publishedCampaigns.map((campaign) => {
            const ig = campaign.platforms?.instagram;
            const li = campaign.platforms?.linkedin;
            const isIGPublished = ig?.status === 'published';
            const isLIPublished = li?.status === 'published';

            return (
              <div
                key={campaign.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all space-y-5"
              >
                {/* Top Row: Meta info & Live Platform Badges */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                        {campaign.pillarId.replace(/-/g, ' ')}
                      </span>
                      {campaign.hasJoke && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          COMEDIC ANGLE
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Slot: {campaign.scheduledTime}</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {campaign.title}
                    </h3>
                  </div>

                  {/* Actions & Editor link */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectCampaign(campaign.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open in Studio</span>
                    </button>
                  </div>
                </div>

                {/* Platforms Fulfillment Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Instagram Delivery Record */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isIGPublished
                        ? 'bg-slate-950/70 border-pink-500/30'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Instagram Carousel</span>
                          <span className="text-[10px] text-slate-400">7-Slide Portrait (4:5)</span>
                        </div>
                      </div>

                      {isIGPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> FULFILLED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          {ig?.status ? ig.status.toUpperCase() : 'NOT PUBLISHED'}
                        </span>
                      )}
                    </div>

                    {isIGPublished ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>Published At:</span>
                          <span className="font-mono text-slate-300">
                            {ig.publishedAt ? new Date(ig.publishedAt).toLocaleString() : 'Just now'}
                          </span>
                        </div>

                        {ig.externalPostId && (
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span>Meta Post ID:</span>
                            <code className="text-pink-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                              {ig.externalPostId}
                            </code>
                          </div>
                        )}

                        {ig.externalPostUrl && (
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                            <a
                              href={ig.externalPostUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <span>View Live on Instagram</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => handleCopy(ig.externalPostUrl!, `ig-url-${campaign.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Copy Live Link"
                            >
                              {copiedId === `ig-url-${campaign.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Not published to Instagram yet. Click Publish in Cockpit to fulfill.
                      </p>
                    )}
                  </div>

                  {/* LinkedIn Delivery Record */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isLIPublished
                        ? 'bg-slate-950/70 border-blue-500/30'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                          <Linkedin className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">LinkedIn Carousel</span>
                          <span className="text-[10px] text-slate-400">7-Slide Multi-Image Document</span>
                        </div>
                      </div>

                      {isLIPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> FULFILLED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          {li?.status ? li.status.toUpperCase() : 'NOT PUBLISHED'}
                        </span>
                      )}
                    </div>

                    {isLIPublished ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 text-[11px]">
                          <span>Published At:</span>
                          <span className="font-mono text-slate-300">
                            {li.publishedAt ? new Date(li.publishedAt).toLocaleString() : 'Just now'}
                          </span>
                        </div>

                        {li.externalPostId && (
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span>LinkedIn URN:</span>
                            <code className="text-blue-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded text-[10px] truncate max-w-[200px]">
                              {li.externalPostId}
                            </code>
                          </div>
                        )}

                        {li.externalPostUrl && (
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                            <a
                              href={li.externalPostUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <span>View Live on LinkedIn</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => handleCopy(li.externalPostUrl!, `li-url-${campaign.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Copy Live Link"
                            >
                              {copiedId === `li-url-${campaign.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Not published to LinkedIn yet. Click Publish in Cockpit to fulfill.
                      </p>
                    )}
                  </div>
                </div>

                {/* 7 Slide Carousel Strip Visualizer */}
                {campaign.renderedAssets && campaign.renderedAssets.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Verified 7-Slide Sequence Delivered</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {campaign.renderedAssets.length} slides • High-Res PNG
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1">
                      {campaign.renderedAssets.map((asset, idx) => (
                        <div
                          key={asset.assetId || idx}
                          onClick={() => setPreviewSlideUrl(asset.url)}
                          className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all aspect-[4/5]"
                        >
                          <img
                            src={asset.url}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-amber-400">
                            0{idx + 1}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Copy & Caption Accordion */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setExpandedCaptionId(
                          expandedCaptionId === campaign.id ? null : campaign.id
                        )
                      }
                      className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <span>
                        {expandedCaptionId === campaign.id ? 'Hide Published Caption' : 'Show Published Caption & Tags'}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        handleCopy(
                          `${ig?.caption || li?.caption || ''}\n\n${(ig?.hashtags || li?.hashtags || []).join(' ')}`,
                          `cap-${campaign.id}`
                        )
                      }
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === `cap-${campaign.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Caption</span>
                        </>
                      )}
                    </button>
                  </div>

                  {expandedCaptionId === campaign.id && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 whitespace-pre-wrap font-sans leading-relaxed">
                      <p>{ig?.caption || li?.caption}</p>
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                        {(ig?.hashtags || li?.hashtags || []).map((tag, i) => (
                          <span key={i} className="text-pink-400 font-mono text-[11px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide Modal Preview */}
      {previewSlideUrl && (
        <div
          onClick={() => setPreviewSlideUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl"
          >
            <img
              src={previewSlideUrl}
              alt="Slide Full Preview"
              className="w-full h-auto object-contain"
            />
            <button
              onClick={() => setPreviewSlideUrl(null)}
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-bold hover:bg-black"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
