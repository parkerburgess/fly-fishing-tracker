"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortDirection } from "@/dto";

export function SortableHeader<TKey extends string>({
  field,
  current,
  dir,
  children,
}: {
  field: TKey;
  current: TKey;
  dir: SortDirection;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir: SortDirection = current === field && dir === "asc" ? "desc" : "asc";
    params.set("sort", field);
    params.set("dir", nextDir);
    router.push(`${pathname}?${params.toString()}`);
  }

  const isActive = current === field;

  // #region Tailwind utility consts
  const headerCellCls =
    "text-left py-3 px-4 font-medium text-gray-500 cursor-pointer " +
    "hover:text-gray-800 select-none";
  const sortIndicatorCls = "ml-1";
  // #endregion

  return (
    <th className={headerCellCls} onClick={handleClick}>
      {children}
      {isActive && (
        <span className={sortIndicatorCls}>{dir === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );
}
