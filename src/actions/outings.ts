"use server";

import dal from "@/lib/dal";
import { getUserId } from "@/lib/auth";
import { outingSchema } from "@/lib/validators";
import { calculateScore } from "@/lib/scoring";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOuting(formData: FormData) {
  const userId = await getUserId();

  const raw = Object.fromEntries(formData.entries());
  const result = outingSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;
  const score = calculateScore(data.caught, data.lost, data.missed);

  const outing = await dal.createOuting(userId, {
    date: data.date,
    location: data.location,
    caught: data.caught,
    lost: data.lost,
    missed: data.missed,
    score,
    weather: data.weather || null,
    waterConditions: data.waterConditions || null,
    waterTemp: data.waterTemp ?? null,
    timeSpentMin: data.timeSpentMin ?? null,
    notes: data.notes || null,
  });

  revalidatePath("/outings");
  revalidatePath("/");
  redirect(`/outings/${outing.id}`);
}

export async function updateOuting(id: string, formData: FormData) {
  const userId = await getUserId();
  const outingId = Number(id);
  if (!Number.isInteger(outingId)) {
    return { error: "Invalid outing id" };
  }

  const raw = Object.fromEntries(formData.entries());
  const result = outingSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;
  const score = calculateScore(data.caught, data.lost, data.missed);

  try {
    await dal.updateOuting(userId, outingId, {
      date: data.date,
      location: data.location,
      caught: data.caught,
      lost: data.lost,
      missed: data.missed,
      score,
      weather: data.weather || null,
      waterConditions: data.waterConditions || null,
      waterTemp: data.waterTemp ?? null,
      timeSpentMin: data.timeSpentMin ?? null,
      notes: data.notes || null,
    });
  } catch {
    return { error: "Not authorized" };
  }

  revalidatePath("/outings");
  revalidatePath(`/outings/${id}`);
  revalidatePath("/");
  redirect(`/outings/${id}`);
}

export async function deleteOuting(id: string) {
  const userId = await getUserId();
  const outingId = Number(id);
  if (!Number.isInteger(outingId)) {
    return { error: "Invalid outing id" };
  }

  const existing = await dal.getOuting(outingId);
  if (!existing || existing.userId !== userId) {
    return { error: "Not authorized" };
  }

  await dal.deleteOuting(userId, outingId);

  revalidatePath("/outings");
  revalidatePath("/");
  redirect("/outings");
}
