import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeResume } from "@/lib/analysis";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { analyses } from "@/db/schema";

const inputSchema = z.object({
  resumeText: z.string().trim().min(120).max(60000),
  jobDescription: z.string().trim().min(120).max(30000),
  fileName: z.string().trim().min(1).max(180),
});

export async function POST(request: Request) {
  try {
    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please provide a readable resume and complete job description." }, { status: 400 });
    const report = analyzeResume(parsed.data.resumeText, parsed.data.jobDescription);
    const user = await getChatGPTUser();
    if (user) {
      const jobTitle = parsed.data.jobDescription.split(/\n|\.|:/)[0].trim().slice(0, 80) || "Target role";
      await getDb().insert(analyses).values({
        id: crypto.randomUUID(), userId: user.userId, fileName: parsed.data.fileName,
        jobTitle, overallScore: report.overallScore,
        matchedSkills: JSON.stringify(report.matchedSkills), missingSkills: JSON.stringify(report.missingSkills),
        createdAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ report, saved: Boolean(user) });
  } catch (error) {
    console.error("analysis_failed", error);
    return NextResponse.json({ error: "Analysis is temporarily unavailable. Your document was not stored." }, { status: 500 });
  }
}
