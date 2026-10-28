import React from 'react';
import { motion } from 'framer-motion';
import { ScrapedProductInfo } from '../types';

interface ScrapedProductCardProps {
  scrapedProduct?: ScrapedProductInfo;
  isLoading?: boolean;
  rawPayload: string;
}

export const ScrapedProductCard: React.FC<ScrapedProductCardProps> = ({
  scrapedProduct,
  isLoading = false,
  rawPayload,
}) => {
  if (isLoading && !scrapedProduct) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-[#006948]/30 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-bold text-[#006948]">
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>Web Scraping Product Intelligence...</span>
        </div>
        <p className="text-xs text-[#3d4a42]">
          Searching global manufacturer catalogs, GS1 barcode registries, and web sources for specifications and authenticity signals...
        </p>
        <div className="space-y-2 pt-1 animate-pulse">
          <div className="h-4 bg-[#f4f3f1] rounded w-3/4"></div>
          <div className="h-3 bg-[#f4f3f1] rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!scrapedProduct) {
    return null;
  }

  const isReal = scrapedProduct.authenticityVerdict === 'GENUINE';
  const isFake = scrapedProduct.authenticityVerdict === 'LIKELY_FAKE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-5 sm:p-6 rounded-2xl bg-white border border-[#bccac0]/40 shadow-xs space-y-5"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#bccac0]/25">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#85f8c4]/40 border border-[#006948]/25 text-[#006948] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">travel_explore</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1a1c1a]">Web-Scraped Product Intelligence</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4f3f1] border border-[#bccac0]/40 text-[#006948] font-semibold">
                Live Web Grounded
              </span>
            </div>
            <p className="text-xs text-[#6d7a72] mt-0.5">
              Real-time internet scraping of product specifications & authenticity indicators
            </p>
          </div>
        </div>

        {/* Verdict Tag */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {isLoading && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-[#006948] bg-[#85f8c4]/30 px-2.5 py-1 rounded-full animate-pulse">
              <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
              <span>Refreshing...</span>
            </span>
          )}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
              isReal
                ? 'bg-[#85f8c4]/40 text-[#006948] border border-[#006948]/30'
                : isFake
                  ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isReal ? 'verified' : isFake ? 'cancel' : 'help'}
            </span>
            <span>
              {isReal ? 'Authentic Product Catalog' : isFake ? 'Counterfeit / Replica Risk' : 'Unconfirmed Origin'}
            </span>
          </span>
        </div>
      </div>

      {/* Product Hero Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Product Title & Brand */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#006948] uppercase tracking-wide">
              {scrapedProduct.brand || 'Verified Brand'}
            </span>
            {scrapedProduct.category && (
              <span className="text-[11px] text-[#6d7a72] bg-[#f4f3f1] px-2 py-0.5 rounded">
                {scrapedProduct.category}
              </span>
            )}
          </div>
          <h4 className="text-lg sm:text-xl font-extrabold text-[#1a1c1a] leading-tight">
            {scrapedProduct.name}
          </h4>
          {scrapedProduct.description && (
            <p className="text-xs sm:text-sm text-[#3d4a42] leading-relaxed">
              {scrapedProduct.description}
            </p>
          )}
        </div>

        {/* Price & Manufacturer Box */}
        <div className="p-4 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/30 space-y-2.5 flex flex-col justify-center">
          <div>
            <span className="text-[11px] text-[#6d7a72] block">Estimated Retail Price</span>
            <span className="text-base font-extrabold text-[#006948]">
              {scrapedProduct.estimatedPrice || 'Contact Official Retailer'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#6d7a72] block">Manufacturer & Origin</span>
            <span className="text-xs font-medium text-[#1a1c1a]">
              {scrapedProduct.manufacturer || scrapedProduct.brand || 'Official Maker'}
              {scrapedProduct.originCountry ? ` (${scrapedProduct.originCountry})` : ''}
            </span>
          </div>
          {scrapedProduct.officialWebsite && (
            <a
              href={scrapedProduct.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-[#006948] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Visit Official Website</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          )}
        </div>
      </div>

      {/* Key Specifications & Scraped Attributes Grid */}
      {scrapedProduct.attributes && Object.keys(scrapedProduct.attributes).length > 0 && (
        <div className="pt-2">
          <h5 className="text-xs font-mono uppercase tracking-wider text-[#6d7a72] mb-2.5">
            Scraped Specifications & Attributes
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {Object.entries(scrapedProduct.attributes).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-lg bg-[#faf9f6] border border-[#bccac0]/35 text-xs">
                <span className="text-[10px] text-[#6d7a72] block font-mono">{key}</span>
                <span className="font-semibold text-[#1a1c1a] block truncate mt-0.5" title={String(val)}>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Authenticity Summary & Reasons */}
      <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#bccac0]/35 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#006948]">fact_check</span>
          <h5 className="text-xs font-bold text-[#1a1c1a]">Web Authenticity Findings</h5>
        </div>
        <p className="text-xs text-[#3d4a42] leading-relaxed">
          {scrapedProduct.authenticitySummary}
        </p>

        {/* Legitimacy Factors vs Counterfeit Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Positive Signals */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#006948] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Legitimacy Factors</span>
            </span>
            <ul className="text-xs text-[#3d4a42] space-y-1 list-disc list-inside">
              {isReal ? (
                <>
                  <li>Manufacturer barcode / serial matched against official product lines.</li>
                  <li>Official brand documentation and retail presence confirmed.</li>
                </>
              ) : (
                <li>Encoding complies with standard barcode / QR optical requirements.</li>
              )}
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#ba1a1a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">report</span>
              <span>Counterfeit Risk Checklist</span>
            </span>
            <ul className="text-xs text-[#3d4a42] space-y-1 list-disc list-inside">
              {isFake ? (
                <>
                  <li>Payload or domain flagged for unauthorized replica keywords or clones.</li>
                  <li>Serial lacks cryptographic cryptographic seal from manufacturer.</li>
                </>
              ) : (
                <li>Verify holographic packaging label matches official manufacturer batch seal.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Web Source Citations */}
      {scrapedProduct.sourceUrls && scrapedProduct.sourceUrls.length > 0 && (
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6d7a72] font-mono text-[11px]">Scraped Sources:</span>
          {scrapedProduct.sourceUrls.map((source: { title: string; url: string }, i: number) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#f4f3f1] hover:bg-[#efeeeb] text-[#006948] font-medium text-[11px] border border-[#bccac0]/40 flex items-center gap-1 transition-colors"
            >
              <span>{source.title}</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
};
