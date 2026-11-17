"use client";

import { SlowRequestNotice, useSlowRequestNotice } from "@parkerburgess/wandering-parker-ui";

export default function Loading() {
  // A loading.tsx file only renders while its sibling page.tsx is still
  // resolving, so being mounted at all is equivalent to "pending" here.
  const slowMessage = useSlowRequestNotice(true);

  // #region Tailwind utility consts
  const skeletonCls = "space-y-6 animate-pulse";
  const containerCls = "space-y-6";
  const titleBarCls = "h-8 bg-gray-200 rounded w-48";
  const statsGridCls = "grid grid-cols-2 md:grid-cols-5 gap-4";
  const statCardCls = "bg-white rounded-xl border border-gray-200 p-6 h-24";
  const chartCardCls = "bg-white rounded-xl border border-gray-200 p-6 h-64";
  // #endregion

  return (
    <div className={containerCls}>
      <SlowRequestNotice message={slowMessage} />
      <div className={skeletonCls}>
        <div className={titleBarCls} />
        <div className={statsGridCls}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={statCardCls} />
          ))}
        </div>
        <div className={chartCardCls} />
      </div>
    </div>
  );
}
