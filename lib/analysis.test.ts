import { describe, expect, it } from "vitest";
import { analyzeResume, extractSkills } from "./analysis";

const resume = `Software engineer with 2 years of experience. Built React and Node.js applications with REST APIs, MongoDB and Python. Developed machine learning and NLP projects at college. Bachelor degree in Information Technology.`;
const jd = `Full Stack AI Engineer. We need 2 years of experience building React and TypeScript products using Node.js, REST APIs, PostgreSQL, Python, Docker and AWS. Candidates should demonstrate machine learning projects and automated testing.`;

describe("analysis engine", () => {
  it("normalizes skill aliases", () => expect(extractSkills("ReactJS, node js and RESTful services")).toEqual(expect.arrayContaining(["React", "Node.js", "REST APIs"])));
  it("returns an explainable bounded score", () => {
    const report = analyzeResume(resume, jd);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.matchedSkills).toContain("React");
    expect(report.missingSkills).toContain("Docker");
    expect(report.methodology).toContain("skills 40%");
  });
  it("rejects insufficient input", () => expect(() => analyzeResume("short", jd)).toThrow());
});
