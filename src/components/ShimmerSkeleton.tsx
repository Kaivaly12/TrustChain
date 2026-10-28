import React from 'react';

interface SkeletonProps {
  className?: string;
  delayMs?: number;
}

export const ShimmerBar: React.FC<SkeletonProps> = ({ className = '', delayMs = 0 }) => (
  <div
    style={{ animationDelay: `${delayMs}ms` }}
    className={`animate-pulse rounded-lg bg-[#efeeeb] border border-[#bccac0]/30 ${className}`}
  />
);

/**
 * Clean staggered skeleton loader for the Verification Report
 */
export const ScannerPageSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#bccac0]/30 p-6 sm:p-8 space-y-6 shadow-sm animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-[#bccac0]/25">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#efeeeb] border border-[#bccac0]/30"></div>
          <div className="space-y-2">
            <div className="w-56 h-7 rounded-lg bg-[#efeeeb]"></div>
            <div className="w-80 h-4 rounded-md bg-[#efeeeb]"></div>
          </div>
        </div>
        <div className="w-20 h-10 rounded-xl bg-[#efeeeb]"></div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
        <div className="h-20 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/25 p-3 space-y-2">
          <div className="w-20 h-3 rounded bg-[#efeeeb]"></div>
          <div className="w-36 h-5 rounded bg-[#efeeeb]"></div>
        </div>
        <div className="h-20 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/25 p-3 space-y-2">
          <div className="w-24 h-3 rounded bg-[#efeeeb]"></div>
          <div className="w-32 h-5 rounded bg-[#efeeeb]"></div>
        </div>
        <div className="h-20 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/25 p-3 space-y-2">
          <div className="w-28 h-3 rounded bg-[#efeeeb]"></div>
          <div className="w-24 h-5 rounded bg-[#efeeeb]"></div>
        </div>
      </div>

      {/* Footnote skeleton */}
      <div className="h-12 rounded-xl bg-[#f4f3f1] border border-[#bccac0]/25"></div>
    </div>
  );
};
