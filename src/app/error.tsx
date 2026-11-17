"use client";

import { Card, Button } from "@parkerburgess/wandering-parker-ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // #region Tailwind utility consts
  const containerCls = "max-w-md mx-auto mt-16";
  const cardCls = "text-center";
  const headingCls = "text-xl font-bold text-red-600 mb-2";
  const messageCls = "text-gray-600 mb-4";
  // #endregion

  return (
    <div className={containerCls}>
      <Card className={cardCls}>
        <h2 className={headingCls}>Something went wrong</h2>
        <p className={messageCls}>{error.message || "An unexpected error occurred."}</p>
        <Button onClick={reset}>Try Again</Button>
      </Card>
    </div>
  );
}
