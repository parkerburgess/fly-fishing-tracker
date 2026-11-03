"use client";

import { Button } from "@parkerburgess/wandering-parker-ui";

// Shared "N outings + All/Mine" control. Lives on the right of a page header on
// the outings, dashboard and reports pages. Controlled: the parent owns the
// showMine state and does its own filtering; this just renders count + buttons.
export function ScopeToggle({
  count,
  showMine,
  onShowMineChange,
  disabled,
}: {
  count: number;
  showMine: boolean;
  onShowMineChange: (showMine: boolean) => void;
  disabled: boolean;
}) {
  // #region Tailwind utility consts
  const containerCls = "flex items-center gap-4";
  const countCls = "text-sm text-gray-500";
  const buttonGroupCls = "flex gap-1";
  const scopeButtonCls = "text-sm px-3 py-1";
  // #endregion

  function showAll() {
    onShowMineChange(false);
  }

  function showMineOnly() {
    onShowMineChange(true);
  }

  return (
    <div className={containerCls}>
      <span className={countCls}>{count} outings</span>
      <div className={buttonGroupCls}>
        <Button
          variant={showMine ? "secondary" : "primary"}
          onClick={showAll}
          disabled={disabled}
          className={scopeButtonCls}
        >
          All
        </Button>
        <Button
          variant={showMine ? "primary" : "secondary"}
          onClick={showMineOnly}
          disabled={disabled}
          className={scopeButtonCls}
        >
          Mine
        </Button>
      </div>
    </div>
  );
}
