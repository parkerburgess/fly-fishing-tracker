"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortableHeader({
  field,
  current,
  dir,
  children,
}: {
  field: string;
  current: string;
  dir: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    params.set("dir", current === field && dir === "asc" ? "desc" : "asc");
    router.push(`/outings?${params.toString()}`);
  }

  const isActive = current === field;

  return (
    <th
      className="text-left py-3 px-4 font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none"
      onClick={handleClick}
    >
      {children}
      {isActive && (
        <span className="ml-1">{dir === "asc" ? "\u2191" : "\u2193"}</span>
      )}
    </th>
  );
}
