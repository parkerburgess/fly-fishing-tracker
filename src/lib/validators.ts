import { z } from "zod";
import { WEATHER_OPTIONS, WATER_CONDITIONS } from "./constants";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Matches flyfishing.Outing.Location NVARCHAR(200).
const MAX_LOCATION_LENGTH = 200;

// True only for a real calendar date ("2026-02-30" round-trips to March, so
// it fails).
function isRealCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// The server can't know the submitter's timezone, and "today" anywhere on
// Earth is at most one day ahead of the UTC date (UTC+14). So the server
// allows through UTC today + 1. The form's max (the user's local today) is
// the exact limit.
function isNotFutureDate(value: string): boolean {
  const latestAllowed = new Date(Date.now() + ONE_DAY_MS).toISOString().slice(0, 10);
  return value <= latestAllowed;
}

// An empty number input submits "", and z.coerce.number() turns "" into 0.
// Mapping "" to undefined first keeps a blank optional field as null.
function emptyStringToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

export const outingSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .regex(DATE_ONLY_PATTERN, "Date must be in yyyy-MM-dd format")
    .refine(isRealCalendarDate, "Date is not a valid calendar date")
    .refine(isNotFutureDate, "Date cannot be in the future"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(MAX_LOCATION_LENGTH, `Location must be ${MAX_LOCATION_LENGTH} characters or fewer`),
  caught: z.coerce.number().int().min(0).default(0),
  lost: z.coerce.number().int().min(0).default(0),
  missed: z.coerce.number().int().min(0).default(0),
  weather: z.enum(WEATHER_OPTIONS).optional().or(z.literal("")),
  waterConditions: z.enum(WATER_CONDITIONS).optional().or(z.literal("")),
  waterTemp: z.preprocess(emptyStringToUndefined, z.coerce.number().optional()),
  timeSpentMin: z.preprocess(
    emptyStringToUndefined,
    z.coerce.number().int().min(0).optional()
  ),
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
