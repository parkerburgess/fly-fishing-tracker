"use client";

import { useState } from "react";
import { deleteOuting } from "@/actions/outings";
import { Button } from "@/components/ui/Button";

export function DeleteOutingButton({ outingId }: { outingId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button
          variant="danger"
          onClick={async () => {
            await deleteOuting(outingId);
          }}
        >
          Confirm
        </Button>
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
