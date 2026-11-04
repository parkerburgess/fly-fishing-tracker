"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@parkerburgess/wandering-parker-ui";
import type { OutingsTableRowDto, SortDirection } from "@/dto";
import { ScopeToggle } from "../ScopeToggle";
import { SortableHeader } from "./SortableHeader";
import { compareBy, parseSortDirection } from "../sorting";

type RowKey = keyof OutingsTableRowDto;

interface ColumnDefinition {
  label: string;
  sortKey: RowKey;
  render: (row: OutingsTableRowDto) => React.ReactNode;
}

// Which DTO properties this table shows and sorts on. Any DTO key can be
// used as a sortKey. Date displays the formatted string but sorts on dateKey.
const COLUMNS: ColumnDefinition[] = [
  { label: "Date", sortKey: "dateKey", render: (row) => row.date },
  { label: "Location", sortKey: "location", render: (row) => row.location },
  { label: "Score", sortKey: "score", render: (row) => row.score },
  { label: "Caught", sortKey: "caught", render: (row) => row.caught },
  { label: "Lost", sortKey: "lost", render: (row) => row.lost },
  { label: "Missed", sortKey: "missed", render: (row) => row.missed },
  { label: "Fisherman", sortKey: "userName", render: (row) => row.userName },
];

const DEFAULT_SORT_KEY: RowKey = "dateKey";
const DEFAULT_SORT_DIRECTION: SortDirection = "desc";

function parseSortKey(value: string | null): RowKey {
  const match = COLUMNS.find((column) => column.sortKey === value);
  return match ? match.sortKey : DEFAULT_SORT_KEY;
}

export function OutingsTable({
  rows,
  currentUserId,
}: {
  rows: OutingsTableRowDto[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMine, setShowMine] = useState(!!currentUserId);

  const sortKey = parseSortKey(searchParams.get("sort"));
  const sortDirection = parseSortDirection(
    searchParams.get("dir"),
    DEFAULT_SORT_DIRECTION
  );

  const filtered = showMine && currentUserId
    ? rows.filter((row) => row.userId === currentUserId)
    : rows;
  const sorted = [...filtered].sort(compareBy(sortKey, sortDirection));

  function goToOuting(outingId: string) {
    router.push(`/outings/${outingId}`);
  }

  // #region Tailwind utility consts
  const headingCls = "text-2xl font-bold";
  const headerRowCls = "border-b border-gray-200";
  const rowCls =
    "border-1 border-transparent border-b-gray-100 " +
    "hover:bg-gray-400";
  const cellCls = "py-3 px-4";
  const emptyRowCls = "py-8 text-center text-gray-500";
  // #endregion

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={headingCls}>
          {showMine && currentUserId ? "My Outings" : "All Outings"}
        </h1>
        <ScopeToggle
          count={filtered.length}
          showMine={showMine && !!currentUserId}
          onShowMineChange={setShowMine}
          disabled={!currentUserId}
        />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={headerRowCls}>
              {COLUMNS.map((column) => (
                <SortableHeader
                  key={column.sortKey}
                  field={column.sortKey}
                  current={sortKey}
                  dir={sortDirection}
                >
                  {column.label}
                </SortableHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.id}
                className={rowCls}
                onClick={() => goToOuting(row.id)}
              >
                {COLUMNS.map((column) => (
                  <td key={column.sortKey} className={cellCls}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className={emptyRowCls}>
                  No outings yet. Be the first to log one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
