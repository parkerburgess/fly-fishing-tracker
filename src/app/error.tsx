"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto mt-16">
      <Card className="text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message || "An unexpected error occurred."}</p>
        <Button onClick={reset}>Try Again</Button>
      </Card>
    </div>
  );
}
