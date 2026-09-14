import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
import Workspace from "./workspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Talent Match AI home"><span className="brand-mark">M</span><span>Talent Match <b>AI</b></span></a>
        <nav aria-label="Primary navigation"><a href="#analyzer">Analyzer</a><a href="#features">Features</a><a href="#architecture">Architecture</a></nav>
        {user ? <div className="account"><span>{user.displayName}</span><a href={chatGPTSignOutPath("/")} target="_top">Sign out</a></div> : <a className="signin" href={chatGPTSignInPath("/")} target="_top">Sign in with ChatGPT</a>}
      </header>
      <section className="intro" id="top">
        <div><span className="kicker">Explainable resume intelligence</span><h1>Know where you match.<br/><em>See how to improve.</em></h1><p>Talent Match AI converts your resume and a job description into an evidence-based compatibility report, targeted improvements, a cover-letter draft, and role-specific interview questions.</p></div>
        <div className="method-card"><span>Scoring model</span><strong>5-factor NLP analysis</strong><div className="formula"><i style={{width:"40%"}}>Skills 40%</i><i style={{width:"25%"}}>Experience 25%</i><i style={{width:"15%"}}>Keywords 15%</i><i style={{width:"10%"}}>Education</i><i style={{width:"10%"}}>Projects</i></div><small>Transparent by design. The report never invents experience.</small></div>
      </section>
      <Workspace signedIn={Boolean(user)} />
      <section className="feature-section" id="features">
        <div className="section-heading"><span className="kicker">Complete application workflow</span><h2>One analysis. Four useful outputs.</h2></div>
        <div className="feature-grid">
          <article><span>01</span><h3>Job-fit report</h3><p>A weighted score across skills, experience, keywords, education, and project evidence.</p></article>
          <article><span>02</span><h3>Skill-gap plan</h3><p>Matched and missing competencies with honest, prioritized improvement actions.</p></article>
          <article><span>03</span><h3>Cover-letter draft</h3><p>A tailored starting point grounded in the candidate’s actual resume evidence.</p></article>
          <article><span>04</span><h3>Interview preparation</h3><p>Technical and behavioral questions generated from the target role and skills.</p></article>
        </div>
      </section>
      <section className="architecture" id="architecture">
        <div><span className="kicker">Built for technical credibility</span><h2>From document to decision</h2><p>The application extracts text in the browser, validates inputs through a secure server endpoint, runs a deterministic NLP matching engine, and saves user-owned reports only after sign-in.</p></div>
        <div className="flow" aria-label="Application architecture"><span>PDF / DOCX</span><b>→</b><span>Secure API</span><b>→</b><span>NLP Engine</span><b>→</b><span>D1 History</span></div>
      </section>
      <footer><div className="brand"><span className="brand-mark">M</span><span>Talent Match <b>AI</b></span></div><p>Portfolio project by Ankita Chakraborty · TypeScript, React, NLP and Cloudflare D1</p></footer>
    </main>
  );
}
