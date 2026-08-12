"use client";

import { SlowRequestNotice, useSlowRequestNotice } from "@parkerburgess/wandering-parker-ui";

export default function Loading() {
  // A loading.tsx file only renders while its sibling page.tsx is still
  // resolving, so being mounted at all is equivalent to "pending" here.
  const slowMessage = useSlowRequestNotice(true);

  return (
    <div className="space-y-6">
      <SlowRequestNotice message={slowMessage} />
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-24" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-64" />
      </div>
    </div>
  );
}
