"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { WEATHER_OPTIONS, WATER_CONDITIONS } from "@/lib/constants";
import { calculateScore } from "@/lib/scoring";

interface OutingData {
  date?: string;
  location?: string;
  caught?: number;
  lost?: number;
  missed?: number;
  weather?: string;
  waterConditions?: string;
  waterTemp?: number | null;
  timeSpentMin?: number | null;
  notes?: string;
}

export function OutingForm({
  action,
  initialData,
  submitLabel = "Save Outing",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  initialData?: OutingData;
  submitLabel?: string;
}) {
  const [caught, setCaught] = useState(initialData?.caught ?? 0);
  const [lost, setLost] = useState(initialData?.lost ?? 0);
  const [missed, setMissed] = useState(initialData?.missed ?? 0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = calculateScore(caught, lost, missed);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            defaultValue={initialData?.location}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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

        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <span className="text-sm text-blue-600 font-medium">Live Score Preview</span>
          <p className="text-3xl font-bold text-blue-700">{score} pts</p>
          <p className="text-xs text-blue-500 mt-1">
            {caught}x5 + {lost}x3 + {missed}x1
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
