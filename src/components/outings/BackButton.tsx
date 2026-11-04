"use client";

import { useRouter } from "next/navigation";
import { Button } from "@parkerburgess/wandering-parker-ui";

export function BackButton() {
  const router = useRouter();

  // #region Tailwind utility consts
  const wrapperCls = "mb-4";
  // #endregion

  return (
    <div className={wrapperCls}>
      <Button variant="ghost" onClick={() => router.back()}>
        ← Back
      </Button>
    </div>
  );
}
