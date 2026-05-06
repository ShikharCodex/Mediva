import mongoose, { Document, Schema, Types } from "mongoose";
import { REPORT_TYPES } from "@/config/constants";
import { SUPPORTED_LANGUAGES } from "@/validators/report";

export interface IMedicalReport extends Document {
  userId: Types.ObjectId;
  imageUrl: string;
  reportType: (typeof REPORT_TYPES)[number];
  language: string;
  extractedText: string;
  aiResponse: string;
  aiSummary: string;
  urgencyFlag: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalReportSchema = new Schema<IMedicalReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imageUrl: { type: String, required: true },
    reportType: { type: String, enum: REPORT_TYPES, required: true, index: true },
    language: { type: String, enum: SUPPORTED_LANGUAGES, default: "English" },
    extractedText: { type: String, required: true },
    aiResponse: { type: String, required: true },
    aiSummary: { type: String, required: true },
    urgencyFlag: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const MedicalReport =
  mongoose.models.MedicalReport ||
  mongoose.model<IMedicalReport>("MedicalReport", MedicalReportSchema);
