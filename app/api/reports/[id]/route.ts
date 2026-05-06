import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { MedicalReport } from "@/models/MedicalReport";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;
  await connectToDatabase();
  const { id } = await params;
  const deleted = await MedicalReport.findOneAndDelete({
    _id: id,
    userId: auth.user.userId,
  });
  if (!deleted) return NextResponse.json({ message: "Report not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
