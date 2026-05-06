import { NextResponse } from "next/server";
import { createReportSchema, reportQuerySchema } from "@/validators/report";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { MedicalReport } from "@/models/MedicalReport";
import { generateMedicalExplanation } from "@/services/openai.service";
import { detectUrgency } from "@/services/report-analyzer.service";

export const maxDuration = 60; // Prevent Vercel timeout during long AI generation

function isCloudinaryUrl(url: string) {
  return url.startsWith("https://res.cloudinary.com/");
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;
  try {
    await connectToDatabase();
    const data = createReportSchema.parse(await req.json());
    if (!isCloudinaryUrl(data.imageUrl)) {
      return NextResponse.json(
        { message: "Only Cloudinary hosted images are accepted" },
        { status: 400 },
      );
    }
    const { aiResponse, aiSummary, extractedText } = await generateMedicalExplanation(
      data.imageUrl,
      data.reportType,
      data.language,
    );
    const urgencyFlag = detectUrgency(aiResponse);
    const report = await MedicalReport.create({
      userId: auth.user.userId,
      imageUrl: data.imageUrl,
      reportType: data.reportType,
      extractedText,
      aiResponse,
      aiSummary,
      urgencyFlag,
      language: data.language,
    });
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Report analysis failed" },
      { status: 400 },
    );
  }
}

export async function GET(req: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const query = reportQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      reportType: searchParams.get("reportType") || undefined,
    });
    const filter: Record<string, unknown> = { userId: auth.user.userId };
    if (query.reportType) filter.reportType = query.reportType;
    if (query.search) filter.aiResponse = { $regex: query.search, $options: "i" };
    const reports = await MedicalReport.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not fetch reports" },
      { status: 400 },
    );
  }
}
