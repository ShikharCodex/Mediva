import { ReportType } from "@/config/constants";

export type MedicalReport = {
  _id: string;
  imageUrl: string;
  reportType: ReportType;
  extractedText: string;
  aiResponse: string;
  aiSummary: string;
  urgencyFlag: boolean;
  language?: string;
  createdAt: string;
};
