import React from 'react';

// Animated Shimmer Base Component
const ShimmerBlock = ({ className = '' }) => (
  <div className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-emerald-950/40 animate-pulse rounded-xl ${className}`} />
);

// 1. Society Card Skeleton (Home Page)
export const SocietyCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-5 border border-[#E4DCC9] shadow-sm flex flex-col justify-between h-[320px] relative overflow-hidden">
    <div className="space-y-3">
      <ShimmerBlock className="w-full h-36 rounded-2xl mb-4" />
      <div className="flex items-center justify-between">
        <ShimmerBlock className="w-20 h-4 rounded-full" />
        <ShimmerBlock className="w-16 h-4 rounded-full" />
      </div>
      <ShimmerBlock className="w-3/4 h-6 rounded-lg" />
      <ShimmerBlock className="w-full h-4 rounded-md" />
    </div>
    <div className="pt-4 border-t border-[#E4DCC9]/60 flex items-center justify-between">
      <ShimmerBlock className="w-24 h-4 rounded-full" />
      <ShimmerBlock className="w-8 h-8 rounded-full" />
    </div>
  </div>
);

// 2. Vendor Card Skeleton (Society Vendors Page)
export const VendorCardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-[#E4DCC9] shadow-sm relative overflow-hidden flex flex-col justify-between h-[360px]">
    <div>
      <ShimmerBlock className="w-full h-48 sm:h-52 rounded-none mb-3" />
      <div className="p-4 space-y-2">
        <ShimmerBlock className="w-full h-4 rounded-md" />
        <ShimmerBlock className="w-3/4 h-3.5 rounded-md" />
      </div>
    </div>
    <div className="p-4 pt-0 space-y-3">
      <div className="pt-2 border-t border-[#E4DCC9]/60 flex items-center justify-between">
        <ShimmerBlock className="w-24 h-4 rounded-md" />
        <ShimmerBlock className="w-20 h-4 rounded-md" />
      </div>
      <ShimmerBlock className="w-full h-10 rounded-xl" />
    </div>
  </div>
);

// 3. Product Catalog Item Skeleton (Shop Menu Page)
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-[#E4DCC9] shadow-sm flex space-x-4 relative overflow-hidden">
    <ShimmerBlock className="w-24 h-24 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2.5 min-w-0 py-1">
      <div className="flex items-center justify-between">
        <ShimmerBlock className="w-1/3 h-3.5 rounded-full" />
        <ShimmerBlock className="w-12 h-3.5 rounded-full" />
      </div>
      <ShimmerBlock className="w-3/4 h-5 rounded-md" />
      <ShimmerBlock className="w-full h-3.5 rounded-md" />
      <div className="flex items-center justify-between pt-1">
        <ShimmerBlock className="w-16 h-5 rounded-md" />
        <ShimmerBlock className="w-20 h-8 rounded-full" />
      </div>
    </div>
  </div>
);

// 4. Vendor Dashboard Stats & Catalog Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto py-6 px-4">
    {/* Header Skeleton */}
    <div className="bg-[#18281F] rounded-3xl p-8 text-white space-y-4">
      <ShimmerBlock className="w-32 h-6 rounded-full bg-white/20" />
      <ShimmerBlock className="w-2/3 h-10 rounded-xl bg-white/20" />
      <ShimmerBlock className="w-1/2 h-4 rounded-md bg-white/20" />
    </div>

    {/* Metric Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-[#E4DCC9] space-y-3">
          <ShimmerBlock className="w-10 h-10 rounded-xl" />
          <ShimmerBlock className="w-1/2 h-4 rounded-md" />
          <ShimmerBlock className="w-3/4 h-8 rounded-lg" />
        </div>
      ))}
    </div>

    {/* Content Table Skeleton */}
    <div className="bg-white p-6 rounded-3xl border border-[#E4DCC9] space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-[#E4DCC9]">
        <ShimmerBlock className="w-48 h-6 rounded-lg" />
        <ShimmerBlock className="w-28 h-9 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F4EE]">
            <div className="flex items-center space-x-3 w-1/3">
              <ShimmerBlock className="w-10 h-10 rounded-lg shrink-0" />
              <ShimmerBlock className="w-full h-4 rounded-md" />
            </div>
            <ShimmerBlock className="w-20 h-4 rounded-md" />
            <ShimmerBlock className="w-20 h-4 rounded-md" />
            <ShimmerBlock className="w-16 h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 5. Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-[#E4DCC9]/60">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="p-4">
        <ShimmerBlock className="w-full h-4 rounded-md" />
      </td>
    ))}
  </tr>
);
