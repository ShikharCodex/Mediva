export const AUTH_COOKIE = "medexplain_token";
export const DISCLAIMER =
  "This information is for educational purposes only and is not a medical diagnosis. Please consult a qualified doctor.";

export const REPORT_TYPES = [
  "medicine",
  "prescription",
  "lab_report",
  "doctor_note",
  "other",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];
