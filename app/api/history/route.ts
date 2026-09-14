import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { analyses } from "@/db/schema";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in to view saved analyses." }, { status: 401 });
  try {
    const rows = await getDb().select().from(analyses).where(eq(analyses.userId, user.userId)).orderBy(desc(analyses.createdAt)).limit(20);
    return NextResponse.json({ analyses: rows.map((row) => ({ ...row, matchedSkills: JSON.parse(row.matchedSkills), missingSkills: JSON.parse(row.missingSkills) })) });
  } catch (error) {
    console.error("history_failed", error);
    return NextResponse.json({ error: "History is temporarily unavailable." }, { status: 500 });
  }
}
