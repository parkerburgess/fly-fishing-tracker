"use client";

import { useState } from "react";
import { Button } from "@parkerburgess/wandering-parker-ui";

export function DeleteOutingButton({
  onDelete,
}: {
  onDelete: () => Promise<{ error?: string } | void>;
}) {
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    await onDelete();
  }

  function startConfirming() {
    setConfirming(true);
  }

  function cancelConfirming() {
    setConfirming(false);
  }

  // #region Tailwind utility consts
  const confirmGroupCls = "flex gap-2";
  // #endregion

  if (confirming) {
    return (
      <div className={confirmGroupCls}>
        <Button variant="danger" onClick={handleConfirm}>
          Confirm
        </Button>
        <Button variant="ghost" onClick={cancelConfirming}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={startConfirming}>
      Delete
    </Button>
  );
}
