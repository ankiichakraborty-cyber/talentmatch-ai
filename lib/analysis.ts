export type ScoreBreakdown = {
  skills: number;
  experience: number;
  keywords: number;
  education: number;
  projects: number;
};

export type AnalysisReport = {
  overallScore: number;
  breakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
  coverLetter: string;
  interviewQuestions: { technical: string[]; behavioral: string[] };
  methodology: string;
};

const SKILLS: Record<string, string[]> = {
  "React": ["react", "reactjs", "react.js"],
  "TypeScript": ["typescript"],
  "JavaScript": ["javascript", "es6"],
  "Node.js": ["node.js", "nodejs", "node js"],
  "Express": ["express", "express.js"],
  "Python": ["python"],
  "FastAPI": ["fastapi"],
  "Django": ["django"],
  "REST APIs": ["rest api", "restful", "api development"],
  "GraphQL": ["graphql"],
  "MongoDB": ["mongodb", "mongo db"],
  "PostgreSQL": ["postgresql", "postgres"],
  "MySQL": ["mysql"],
  "SQL": [" sql ", "relational database"],
  "Docker": ["docker", "containerization"],
  "Kubernetes": ["kubernetes", "k8s"],
  "AWS": ["aws", "amazon web services"],
  "Azure": ["azure"],
  "Git": ["git", "github"],
  "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
  "Machine Learning": ["machine learning", "ml model"],
  "NLP": ["natural language processing", "nlp"],
  "TensorFlow": ["tensorflow"],
  "PyTorch": ["pytorch"],
  "OpenCV": ["opencv", "computer vision"],
  "LLMs": ["large language model", "llm", "generative ai"],
  "RAG": ["retrieval augmented generation", "rag"],
  "Testing": ["jest", "vitest", "pytest", "unit testing", "automated testing"],
  "Agile": ["agile", "scrum"],
};

const STOP_WORDS = new Set(["the","and","for","with","that","this","from","you","your","are","our","will","have","has","job","role","work","using","into","who","their","about","years","skills","team"]);

function normalized(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9+#./-]+/g, " ").replace(/\s+/g, " ")} `;
}

export function extractSkills(text: string): string[] {
  const value = normalized(text);
  return Object.entries(SKILLS)
    .filter(([, aliases]) => aliases.some((alias) => value.includes(` ${alias} `) || value.includes(alias)))
    .map(([skill]) => skill);
}

function keywords(text: string): string[] {
  const words = normalized(text).trim().split(" ").filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  const counts = new Map<string, number>();
  words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  return [...counts.entries()].sort((a,b) => b[1] - a[1]).slice(0, 30).map(([word]) => word);
}

function overlapScore(source: string[], target: string[]) {
  if (!target.length) return 70;
  const sourceSet = new Set(source);
  return Math.round((target.filter((item) => sourceSet.has(item)).length / target.length) * 100);
}

function years(text: string) {
  const matches = [...text.matchAll(/(\d+)\+?\s*(?:years?|yrs?)/gi)].map((match) => Number(match[1]));
  return matches.length ? Math.max(...matches) : 0;
}

function jobTitleFrom(jd: string) {
  const first = jd.split(/\n|\.|:/).map((line) => line.trim()).find((line) => line.length > 4 && line.length < 80);
  return first || "the advertised role";
}

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisReport {
  if (resumeText.trim().length < 120) throw new Error("Resume text is too short for a reliable analysis.");
  if (jobDescription.trim().length < 120) throw new Error("Job description is too short for a reliable analysis.");

  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);
  const matchedSkills = jobSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = jobSkills.filter((skill) => !resumeSkills.includes(skill));
  const skillScore = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 65;
  const experienceScore = Math.min(100, Math.max(35, 55 + (years(resumeText) - years(jobDescription)) * 10));
  const keywordScore = overlapScore(keywords(resumeText), keywords(jobDescription));
  const educationScore = /b\.?tech|bachelor|master|degree|diploma|university|college/i.test(resumeText) ? 90 : 45;
  const projectScore = /project|developed|built|implemented|designed/i.test(resumeText) ? 85 : 45;
  const breakdown = { skills: skillScore, experience: experienceScore, keywords: keywordScore, education: educationScore, projects: projectScore };
  const overallScore = Math.round(skillScore * .40 + experienceScore * .25 + keywordScore * .15 + educationScore * .10 + projectScore * .10);
  const strengths = [
    matchedSkills.length ? `Evidence of ${matchedSkills.slice(0,4).join(", ")}` : "Transferable technical experience",
    projectScore >= 80 ? "Project-based evidence is present" : "Relevant education is present",
    keywordScore >= 55 ? "Strong terminology alignment" : "Clear foundation for tailoring",
  ];
  const recommendations = [
    missingSkills.length ? `Prioritize evidence for ${missingSkills.slice(0,3).join(", ")}; only add skills you genuinely have.` : "Preserve the strong skills alignment and add measurable outcomes.",
    "Rewrite the top two relevant project bullets using action + technology + measurable result.",
    keywordScore < 65 ? "Mirror important job terminology naturally in the summary and project descriptions." : "Keep the current keyword alignment while removing repetition.",
  ];
  const role = jobTitleFrom(jobDescription);
  const evidence = matchedSkills.slice(0,4).join(", ") || resumeSkills.slice(0,4).join(", ") || "software development";
  const coverLetter = `Dear Hiring Manager,\n\nI am writing to express my interest in ${role}. My background includes hands-on experience with ${evidence}, supported by practical projects that required building, integrating, and improving working software.\n\nWhat attracts me to this opportunity is the chance to apply my technical foundation to real product challenges while continuing to grow in ${missingSkills.slice(0,2).join(" and ") || "scalable application development"}. I would welcome the opportunity to discuss how my experience and learning mindset can contribute to your team.\n\nSincerely,\nCandidate`;
  const technical = (jobSkills.length ? jobSkills : ["REST APIs","React","Python"]).slice(0,5).map((skill) => `How have you applied ${skill} in a real project, and what trade-offs did you consider?`);
  const behavioral = ["Tell me about a difficult technical problem you solved.", "Describe a time you received feedback and improved your work.", "How do you prioritize quality when working under a deadline?"];

  return { overallScore, breakdown, matchedSkills, missingSkills, strengths, recommendations, coverLetter, interviewQuestions: { technical, behavioral }, methodology: "Weighted NLP analysis: skills 40%, experience 25%, keywords 15%, education 10%, projects 10%." };
}
