"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { redirect } from "next/navigation";

export async function register(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: (formData.get("email") as string).toLowerCase(),
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({
    where: { email: result.data.email },
  });

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10);

  await prisma.user.create({
    data: {
      name: result.data.name,
      email: result.data.email,
      hashedPassword,
    },
  });

  redirect("/login?registered=true");
}
