import React from 'react';

export function SocietyCardSkeleton({ count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div 
          key={i} 
          className="bento-card bg-white rounded-3xl border border-border/40 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between"
        >
          <div>
            <div className="h-44 bg-secondary/80 w-full relative">
              <div className="absolute top-3 right-3 w-28 h-6 bg-border/60 rounded-full" />
            </div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-secondary/90 rounded-lg w-3/4" />
              <div className="h-4 bg-secondary/70 rounded-md w-1/2" />
              <div className="flex items-center gap-2 pt-2">
                <div className="h-4 bg-secondary/60 rounded-md w-1/3" />
                <div className="h-4 bg-secondary/60 rounded-md w-1/4" />
              </div>
            </div>
          </div>
          <div className="p-5 pt-0 grid grid-cols-2 gap-2">
            <div className="h-10 bg-secondary/80 rounded-xl" />
            <div className="h-10 bg-primary/20 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
}

export function ProductCardSkeleton({ count = 8 }) {
  const items = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl border border-border/40 p-4 shadow-xs animate-pulse space-y-3 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="h-40 bg-secondary/80 rounded-xl w-full" />
            <div className="h-4 bg-secondary/90 rounded-md w-3/4" />
            <div className="h-3 bg-secondary/70 rounded-md w-1/2" />
          </div>
          <div className="pt-3 border-t border-border/30 flex items-center justify-between">
            <div className="h-6 bg-secondary/90 rounded-md w-1/3" />
            <div className="h-9 bg-primary/20 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VendorCardSkeleton({ count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl border border-border/40 p-5 shadow-xs animate-pulse space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary/80 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-secondary/90 rounded-md w-2/3" />
              <div className="h-3 bg-secondary/70 rounded-md w-1/3" />
            </div>
          </div>
          <div className="h-12 bg-secondary/50 rounded-xl w-full" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-secondary/70 rounded-md w-1/4" />
            <div className="h-8 bg-primary/20 rounded-lg w-20" />
          </div>
        </div>
      ))}
    </>
  );
}

export function TableRowSkeleton({ rows = 5, cols = 4 }) {
  const rowItems = Array.from({ length: rows });
  const colItems = Array.from({ length: cols });

  return (
    <>
      {rowItems.map((_, r) => (
        <tr key={r} className="border-b border-border/30 animate-pulse">
          {colItems.map((_, c) => (
            <td key={c} className="p-4">
              <div className="h-4 bg-secondary/80 rounded-md w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-border/40 shadow-xs">
        <div className="space-y-2">
          <div className="h-7 bg-secondary/90 rounded-xl w-48" />
          <div className="h-4 bg-secondary/60 rounded-lg w-32" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-secondary/80 rounded-full w-28" />
          <div className="h-10 bg-primary/20 rounded-full w-28" />
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-border/40 space-y-3">
            <div className="h-4 bg-secondary/70 rounded-md w-1/2" />
            <div className="h-8 bg-secondary/90 rounded-lg w-3/4" />
            <div className="h-3 bg-secondary/50 rounded-md w-1/3" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-border/40 space-y-4">
          <div className="h-6 bg-secondary/90 rounded-lg w-1/3" />
          <div className="h-64 bg-secondary/40 rounded-2xl w-full" />
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border/40 space-y-4">
          <div className="h-6 bg-secondary/90 rounded-lg w-1/2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-secondary/50 rounded-xl w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default {
  SocietyCardSkeleton,
  ProductCardSkeleton,
  VendorCardSkeleton,
  TableRowSkeleton,
  DashboardSkeleton
};
