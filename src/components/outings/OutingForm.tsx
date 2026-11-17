"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, Input, Select, Textarea, Button } from "@parkerburgess/wandering-parker-ui";
import { WEATHER_OPTIONS, WATER_CONDITIONS } from "@/lib/constants";
import { calculateScore } from "@/lib/scoring";
import type { OutingFormDto } from "@/dto";

const SAVE_FAILED_MESSAGE = "Couldn't save the outing. Please try again.";

export function OutingForm({
  action,
  initialData,
  submitLabel = "Save Outing",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  initialData?: OutingFormDto;
  submitLabel?: string;
}) {
  const [caught, setCaught] = useState(initialData?.caught ?? 0);
  const [lost, setLost] = useState(initialData?.lost ?? 0);
  const [missed, setMissed] = useState(initialData?.missed ?? 0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = calculateScore(caught, lost, missed);
  // The user's local date, not the UTC date toISOString() would give.
  const today = format(new Date(), "yyyy-MM-dd");

  function showError(message: string) {
    setError(message);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    // On success the action redirects, so loading stays on until the new
    // page renders. It's only reset when we stay on this form.
    try {
      const result = await action(formData);
      if (result?.error) {
        showError(result.error);
      }
    } catch {
      // Thrown when the server rejects the request outright, e.g. the
      // read-only guest account (proxy 403) or a database error.
      showError(SAVE_FAILED_MESSAGE);
    }
  }

  // #region Tailwind utility consts
  const errorBannerCls = "mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm";
  const formCls = "space-y-6";
  const twoColumnRowCls = "grid grid-cols-1 md:grid-cols-2 gap-4";
  const countsRowCls = "grid grid-cols-3 gap-4";
  const scorePreviewCls = "bg-blue-50 rounded-lg p-4 text-center";
  const scorePreviewLabelCls = "text-sm text-blue-600 font-medium";
  const scorePreviewValueCls = "text-3xl font-bold text-blue-700";
  const scorePreviewFormulaCls = "text-xs text-blue-500 mt-1";
  const submitButtonCls = "w-full";
  // #endregion

  return (
    <Card>
      {error && (
        <div className={errorBannerCls}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={formCls}>
        <div className={twoColumnRowCls}>
          <Input
            id="date"
            name="date"
            type="date"
            label="Date"
            max={today}
            defaultValue={initialData?.date}
            required
          />
          <Input
            id="location"
            name="location"
            label="Location"
            maxLength={200}
            defaultValue={initialData?.location}
            required
          />
        </div>

        <div className={countsRowCls}>
          <Input
            id="caught"
            name="caught"
            type="number"
            label="Caught (5 pts)"
            min={0}
            value={caught}
            onChange={(e) => setCaught(Number(e.target.value) || 0)}
          />
          <Input
            id="lost"
            name="lost"
            type="number"
            label="Lost (3 pts)"
            min={0}
            value={lost}
            onChange={(e) => setLost(Number(e.target.value) || 0)}
          />
          <Input
            id="missed"
            name="missed"
            type="number"
            label="Missed (1 pt)"
            min={0}
            value={missed}
            onChange={(e) => setMissed(Number(e.target.value) || 0)}
          />
        </div>

        <div className={scorePreviewCls}>
          <span className={scorePreviewLabelCls}>Live Score Preview</span>
          <p className={scorePreviewValueCls}>{score} pts</p>
          <p className={scorePreviewFormulaCls}>
            {caught}x5 + {lost}x3 + {missed}x1
          </p>
        </div>

        <div className={twoColumnRowCls}>
          <Select
            id="weather"
            name="weather"
            label="Weather"
            options={WEATHER_OPTIONS}
            defaultValue={initialData?.weather || ""}
          />
          <Select
            id="waterConditions"
            name="waterConditions"
            label="Water Conditions"
            options={WATER_CONDITIONS}
            defaultValue={initialData?.waterConditions || ""}
          />
        </div>

        <div className={twoColumnRowCls}>
          <Input
            id="waterTemp"
            name="waterTemp"
            type="number"
            label="Water Temp (°F)"
            step="0.1"
            defaultValue={initialData?.waterTemp ?? ""}
          />
          <Input
            id="timeSpentMin"
            name="timeSpentMin"
            type="number"
            label="Time Spent (minutes)"
            min={0}
            defaultValue={initialData?.timeSpentMin ?? ""}
          />
        </div>

        <Textarea
          id="notes"
          name="notes"
          label="Notes"
          defaultValue={initialData?.notes || ""}
        />

        <Button type="submit" disabled={loading} className={submitButtonCls}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
