import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const analyses = sqliteTable("analyses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  jobTitle: text("job_title").notNull(),
  overallScore: integer("overall_score").notNull(),
  matchedSkills: text("matched_skills").notNull(),
  missingSkills: text("missing_skills").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_analyses_user_created").on(table.userId, table.createdAt)]);
