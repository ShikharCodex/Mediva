import { z } from "zod";
import { REPORT_TYPES } from "@/config/constants";

export const SUPPORTED_LANGUAGES = ["English", "Hindi", "Spanish", "French", "Arabic", "Bengali", "Russian", "Portuguese", "Urdu"] as const;

export const createReportSchema = z.object({
  imageUrl: z.string().url(),
  reportType: z.enum(REPORT_TYPES),
  language: z.enum(SUPPORTED_LANGUAGES).default("English"),
});

export const reportQuerySchema = z.object({
  search: z.string().optional(),
  reportType: z.enum(REPORT_TYPES).optional(),
});
