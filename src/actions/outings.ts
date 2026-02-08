"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { outingSchema } from "@/lib/validators";
import { calculateScore } from "@/lib/scoring";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOuting(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const raw = Object.fromEntries(formData.entries());
  const result = outingSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;
  const score = calculateScore(data.caught, data.lost, data.missed);

  const outing = await prisma.outing.create({
    data: {
      userId: session.user.id,
      date: new Date(data.date),
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
    },
  });

  revalidatePath("/outings");
  revalidatePath("/");
  redirect(`/outings/${outing.id}`);
}

export async function updateOuting(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const existing = await prisma.outing.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Not authorized" };
  }

  const raw = Object.fromEntries(formData.entries());
  const result = outingSchema.safeParse(raw);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const data = result.data;
  const score = calculateScore(data.caught, data.lost, data.missed);

  await prisma.outing.update({
    where: { id },
    data: {
      date: new Date(data.date),
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
    },
  });

  revalidatePath("/outings");
  revalidatePath(`/outings/${id}`);
  revalidatePath("/");
  redirect(`/outings/${id}`);
}

export async function deleteOuting(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const existing = await prisma.outing.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Not authorized" };
  }

  await prisma.outing.delete({ where: { id } });

  revalidatePath("/outings");
  revalidatePath("/");
  redirect("/outings");
}
