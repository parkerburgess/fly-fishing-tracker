export default function Loading() {
  // #region Tailwind utility consts
  const skeletonCls = "space-y-6 animate-pulse";
  const headerRowCls = "flex justify-between items-center";
  const titleBarCls = "h-8 bg-gray-200 rounded w-40";
  const countBarCls = "h-5 bg-gray-200 rounded w-20";
  const tableCardCls = "bg-white rounded-xl border border-gray-200 p-6";
  const rowCls = "flex gap-4 py-3 border-b border-gray-100 last:border-0";
  const dateBarCls = "h-5 bg-gray-200 rounded w-24";
  const locationBarCls = "h-5 bg-gray-200 rounded w-32";
  const scoreBarCls = "h-5 bg-gray-200 rounded w-12";
  // #endregion

  return (
    <div className={skeletonCls}>
      <div className={headerRowCls}>
        <div className={titleBarCls} />
        <div className={countBarCls} />
      </div>
      <div className={tableCardCls}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={rowCls}>
            <div className={dateBarCls} />
            <div className={locationBarCls} />
            <div className={scoreBarCls} />
            <div className={countBarCls} />
          </div>
        ))}
      </div>
    </div>
  );
}
