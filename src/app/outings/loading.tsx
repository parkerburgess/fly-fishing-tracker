export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-40" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
            <div className="h-5 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-5 bg-gray-200 rounded w-12" />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
