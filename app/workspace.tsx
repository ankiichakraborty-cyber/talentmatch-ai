"use client";

import { useEffect, useState } from "react";
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, Copy, Clock3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { AnalysisReport } from "@/lib/analysis";

type HistoryRow = { id:string; fileName:string; jobTitle:string; overallScore:number; matchedSkills:string[]; missingSkills:string[]; createdAt:string };

async function extractDocument(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
    const pages: string[] = [];
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }
    return pages.join("\n");
  }
  if (extension === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  }
  if (extension === "txt") return file.text();
  throw new Error("Please upload a PDF, DOCX, or TXT resume.");
}

export default function Workspace({ signedIn }: { signedIn: boolean }) {
  const [file, setFile] = useState<File | null>(null); const [resumeText, setResumeText] = useState(""); const [jd, setJd] = useState("");
  const [report, setReport] = useState<AnalysisReport | null>(null); const [history, setHistory] = useState<HistoryRow[]>([]);
  const [busy, setBusy] = useState(false); const [extracting, setExtracting] = useState(false); const [error, setError] = useState(""); const [copied, setCopied] = useState(false);

  useEffect(() => { if (signedIn) fetch("/api/history").then(r=>r.json()).then(d=>setHistory(d.analyses ?? [])).catch(()=>{}); }, [signedIn, report]);
  async function chooseFile(next: File | null) { if (!next) return; if (next.size > 5*1024*1024) { setError("Resume must be smaller than 5 MB."); return; } setError(""); setFile(next); setExtracting(true); try { const text=await extractDocument(next); if(text.trim().length<120) throw new Error("We could not extract enough text. Try another file or paste the text manually."); setResumeText(text); } catch(err){setResumeText("");setError(err instanceof Error?err.message:"Document extraction failed.");} finally{setExtracting(false);} }
  async function analyze(){setError("");if(resumeText.trim().length<120){setError("Upload a readable resume or paste at least 120 characters of resume text.");return}if(jd.trim().length<120){setError("Paste a complete job description of at least 120 characters.");return}setBusy(true);try{const response=await fetch("/api/analyze",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({resumeText,jobDescription:jd,fileName:file?.name??"Pasted resume"})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Analysis failed.");setReport(data.report);}catch(err){setError(err instanceof Error?err.message:"Analysis failed.");}finally{setBusy(false)}}
  const copyLetter=async()=>{if(!report)return;await navigator.clipboard.writeText(report.coverLetter);setCopied(true);setTimeout(()=>setCopied(false),1800)};

  return <section className="workspace" id="analyzer"><Tabs defaultValue="analyze"><div className="workspace-head"><div><span className="kicker">Application workspace</span><h2>Analyze a target role</h2></div><TabsList><TabsTrigger value="analyze">New analysis</TabsTrigger><TabsTrigger value="history">History {history.length?`(${history.length})`:""}</TabsTrigger></TabsList></div>
    <TabsContent value="analyze"><div className="input-grid"><div className="panel"><div className="panel-title"><span><FileText size={18}/> Resume</span><small>PDF, DOCX or TXT · 5 MB max</small></div><label className="dropzone"><input type="file" accept=".pdf,.docx,.txt" onChange={e=>chooseFile(e.target.files?.[0]??null)}/><Upload size={27}/><strong>{extracting?"Extracting text…":file?file.name:"Choose a resume"}</strong><span>{file?`${Math.round(file.size/1024)} KB · ${resumeText.length.toLocaleString()} characters extracted`:"or drag and drop your document"}</span></label><details><summary>Paste resume text instead</summary><Textarea aria-label="Resume text" value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Paste resume text here…"/></details></div>
    <div className="panel"><div className="panel-title"><span><Sparkles size={18}/> Target role</span><small>{jd.length.toLocaleString()} characters</small></div><Textarea className="jd-input" aria-label="Job description" value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste the full job title, responsibilities, required skills and qualifications…"/><div className="privacy"><ShieldCheck size={16}/><span>Raw resume text is not saved.</span></div></div></div>
    {error&&<div className="error" role="alert"><AlertCircle size={18}/>{error}</div>}<div className="analyze-row"><p>{signedIn?"This report will be saved to your private history.":"Sign in to save reports; analysis works without an account."}</p><Button size="lg" onClick={analyze} disabled={busy||extracting}>{busy?"Running NLP analysis…":"Generate match report"}</Button></div>
    {report&&<div className="report" aria-live="polite"><div className="report-top"><div className="score-ring" style={{"--score":`${report.overallScore*3.6}deg`} as React.CSSProperties}><div><strong>{report.overallScore}</strong><span>overall match</span></div></div><div className="breakdown"><h3>Explainable score</h3>{Object.entries(report.breakdown).map(([key,value])=><div className="score-row" key={key}><span>{key}</span><Progress value={value}/><b>{value}%</b></div>)}<small>{report.methodology}</small></div></div>
    <div className="insight-grid"><article><h3><CheckCircle2 size={18}/> Matched skills</h3><div className="tags">{report.matchedSkills.length?report.matchedSkills.map(x=><span className="tag good" key={x}>{x}</span>):<p>No explicit matches detected.</p>}</div></article><article><h3><AlertCircle size={18}/> Skill gaps</h3><div className="tags">{report.missingSkills.length?report.missingSkills.map(x=><span className="tag gap" key={x}>{x}</span>):<p>No explicit gaps detected.</p>}</div></article></div>
    <div className="insight-grid"><article><h3>Evidence-based strengths</h3><ul>{report.strengths.map(x=><li key={x}>{x}</li>)}</ul></article><article><h3>Priority improvements</h3><ol>{report.recommendations.map(x=><li key={x}>{x}</li>)}</ol></article></div>
    <Tabs defaultValue="letter" className="output-tabs"><TabsList><TabsTrigger value="letter">Cover letter</TabsTrigger><TabsTrigger value="interview">Interview questions</TabsTrigger></TabsList><TabsContent value="letter"><div className="generated"><Button variant="outline" size="sm" onClick={copyLetter}><Copy size={15}/>{copied?"Copied":"Copy"}</Button><pre>{report.coverLetter}</pre></div></TabsContent><TabsContent value="interview"><div className="questions"><h4>Technical</h4>{report.interviewQuestions.technical.map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}<h4>Behavioral</h4>{report.interviewQuestions.behavioral.map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}</div></TabsContent></Tabs></div>}</TabsContent>
    <TabsContent value="history"><div className="history-panel">{!signedIn?<div className="empty"><Clock3/><h3>Sign in to build your history</h3><p>Your reports will be linked to your account and available on future visits.</p><a href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT</a></div>:history.length===0?<div className="empty"><Clock3/><h3>No saved reports yet</h3><p>Complete your first analysis to see it here.</p></div>:<div className="history-table"><div className="history-row heading"><span>Role</span><span>Resume</span><span>Match</span><span>Date</span></div>{history.map(row=><div className="history-row" key={row.id}><strong>{row.jobTitle}</strong><span>{row.fileName}</span><b>{row.overallScore}%</b><span>{new Date(row.createdAt).toLocaleDateString()}</span></div>)}</div>}</div></TabsContent>
  </Tabs></section>;
}
