import { z } from "zod";
import { WEATHER_OPTIONS, WATER_CONDITIONS } from "./constants";

export const outingSchema = z.object({
  date: z.string().min(1, "Date is required").refine(
    (val) => new Date(val) <= new Date(),
    "Date cannot be in the future"
  ),
  location: z.string().min(1, "Location is required"),
  caught: z.coerce.number().int().min(0).default(0),
  lost: z.coerce.number().int().min(0).default(0),
  missed: z.coerce.number().int().min(0).default(0),
  weather: z.enum(WEATHER_OPTIONS).optional().or(z.literal("")),
  waterConditions: z.enum(WATER_CONDITIONS).optional().or(z.literal("")),
  waterTemp: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  timeSpentMin: z.coerce.number().int().min(0).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().optional(),
});

export type OutingFormData = z.infer<typeof outingSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
