"use client";

import { useState } from "react";
import { Button } from "@parkerburgess/wandering-parker-ui";

const DELETE_FAILED_MESSAGE = "Couldn't delete the outing. Please try again.";

export function DeleteOutingButton({
  onDelete,
}: {
  onDelete: () => Promise<{ error?: string } | void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function showError(message: string) {
    setError(message);
    setDeleting(false);
  }

  // On success the action redirects away, so deleting stays on until then.
  async function handleConfirm() {
    setDeleting(true);
    setError("");
    try {
      const result = await onDelete();
      if (result?.error) {
        showError(result.error);
      }
    } catch {
      showError(DELETE_FAILED_MESSAGE);
    }
  }

  function startConfirming() {
    setConfirming(true);
  }

  function cancelConfirming() {
    setConfirming(false);
    setError("");
  }

  // #region Tailwind utility consts
  const confirmAreaCls = "grid gap-2 justify-items-end";
  const confirmGroupCls = "flex gap-2";
  const errorTextCls = "text-sm text-red-700";
  // #endregion

  if (confirming) {
    return (
      <div className={confirmAreaCls}>
        <div className={confirmGroupCls}>
          <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Confirm"}
          </Button>
          <Button variant="ghost" onClick={cancelConfirming} disabled={deleting}>
            Cancel
          </Button>
        </div>
        {error && <p className={errorTextCls}>{error}</p>}
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={startConfirming}>
      Delete
    </Button>
  );
}
