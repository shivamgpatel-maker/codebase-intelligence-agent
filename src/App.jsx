import { useState } from "react";
import { fetchGitHubFiles } from "./agent.js";
import Analyze from "./Analyze.jsx";

const C = { blue:”#0071e3”, green:”#28cd41”, orange:”#ff9f0a”, red:”#ff3b30”, purple:”#bf5af2”, teal:”#5ac8fa”, text:”#1d1d1f”, sec:”#6e6e73”, ter:”#aeaeb2”, bg:”#f5f5f7”, surface:”#ffffff” };
const card = { background: C.surface, borderRadius: 16, padding: 24, boxShadow: “0 2px 20px rgba(0,0,0,0.08)”, cursor: “pointer”, transition: “transform 0.15s, box-shadow 0.15s”, border: “1px solid rgba(0,0,0,0.06)” };

const DEMO_REPOS = [
{ owner: “pallets”, repo: “flask”, path: “src/flask”, label: “Flask”, lang: “Python”, desc: “Python web framework” },
{ owner: “expressjs”, repo: “express”, path: “lib”, label: “Express.js”, lang: “JavaScript”, desc: “Node.js web framework” },
{ owner: “django”, repo: “django”, path: “django/core”, label: “Django”, lang: “Python”, desc: “Python web framework” },
];

export default function App() {
const [screen, setScreen] = useState(“landing”); // landing | github | paste | vscode | analyze
const [files, setFiles] = useState([]);
const [repoLabel, setRepoLabel] = useState(””);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(””);
const [owner, setOwner] = useState(””); const [repo, setRepo] = useState(””); const [path, setPath] = useState(””);
const [pasteCode, setPasteCode] = useState(””);
const [pasteName, setPasteName] = useState(“my-codebase.js”);

const goAnalyze = (f, label) => { setFiles(f); setRepoLabel(label); setScreen(“analyze”); };

const connectRepo = async () => {
if (!owner || !repo) return;
setLoading(true); setError(””);
try { const f = await fetchGitHubFiles(owner, repo, path); goAnalyze(f, `${owner}/${repo}`); }
catch (e) { setError(e.message); }
finally { setLoading(false); }
};

const loadDemo = async (d) => {
setLoading(true); setError(””);
try { const f = await fetchGitHubFiles(d.owner, d.repo, d.path); goAnalyze(f, `Demo · ${d.label}`); }
catch (e) { setError(e.message); }
finally { setLoading(false); }
};

const submitPaste = () => {
if (!pasteCode.trim()) return;
goAnalyze([{ name: pasteName, path: pasteName, content: pasteCode }], `Pasted · ${pasteName}`);
};

if (screen === “analyze”) return (
<div style={{ minHeight: “100vh”, background: C.bg, fontFamily: “-apple-system,BlinkMacSystemFont,sans-serif” }}>
<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
<Analyze files={files} repoLabel={repoLabel} onBack={() => setScreen(“landing”)} />
</div>
);

return (
<div style={{ minHeight: “100vh”, background: C.bg, fontFamily: “-apple-system,BlinkMacSystemFont,sans-serif” }}>
<style>{`@keyframes spin{to{transform:rotate(360deg)}} .option-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.12)!important}`}</style>

```
  {/* Nav */}
  <div style={{ background: "rgba(245,245,247,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
    <div style={{ maxWidth: 900, margin: "0 auto", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#0071e3,#bf5af2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15 }}>◈</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>Codebase Intelligence</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {["Enterprise","4-Agent AI","RAG Pipeline"].map((l,i) => <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: [C.blue,C.purple,C.teal][i]+"18", color: [C.blue,C.purple,C.teal][i], fontWeight: 600 }}>{l}</span>)}
      </div>
    </div>
  </div>

  <div style={{ maxWidth: 900, margin: "0 auto", padding: "52px 20px 80px" }}>

    {/* Hero */}
    <div style={{ textAlign: "center", marginBottom: 52 }}>
      <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 700, color: C.text, letterSpacing: -1, lineHeight: 1.15, marginBottom: 14 }}>
        Your legacy code,<br /><span style={{ color: C.blue }}>finally understood.</span>
      </h1>
      <p style={{ fontSize: 16, color: C.sec, maxWidth: 520, margin: "0 auto", lineHeight: 1.65 }}>
        A team of AI agents reads undocumented source code and answers your business questions — with evidence, confidence scores, and impact analysis.
      </p>
    </div>

    {/* 3 Option Cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 40 }}>

      {/* GitHub */}
      <div className="option-card" style={card} onClick={() => setScreen("github")}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1b1f23", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>GitHub Integration</div>
        <div style={{ fontSize: 13, color: C.sec, lineHeight: 1.6, marginBottom: 14 }}>Connect any public or private repo. Agent fetches files via GitHub API — nothing is stored or cached.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {["Public & private repos","GitHub Enterprise support","Browse and select files","PAT or OAuth token auth"].map((f,i) => <div key={i} style={{ fontSize: 12, color: C.sec, display: "flex", gap: 7 }}><span style={{ color: C.green }}>✓</span>{f}</div>)}
        </div>
        <div style={{ marginTop: 16, padding: "9px", background: `${C.blue}12`, borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: C.blue }}>Connect Repository →</div>
      </div>

      {/* VS Code */}
      <div className="option-card" style={card} onClick={() => setScreen("vscode")}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#0066b8,#23a9f2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,102,184,0.3)", fontSize: 24 }}>⎈</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>VS Code Extension</div>
        <div style={{ fontSize: 13, color: C.sec, lineHeight: 1.6, marginBottom: 14 }}>Analyze code without leaving your IDE. Code never leaves the developer's machine — zero data egress.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {["Right-click any file or folder","No network policy approval","Works behind any firewall","CI/CD pipeline integration"].map((f,i) => <div key={i} style={{ fontSize: 12, color: C.sec, display: "flex", gap: 7 }}><span style={{ color: C.green }}>✓</span>{f}</div>)}
        </div>
        <div style={{ marginTop: 16, padding: "9px", background: "rgba(0,102,184,0.10)", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#0066b8" }}>View Extension Details →</div>
      </div>

      {/* Paste */}
      <div className="option-card" style={card} onClick={() => setScreen("paste")}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${C.orange}18`, border: `1px solid ${C.orange}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 24 }}>📋</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>Paste Code</div>
        <div style={{ fontSize: 13, color: C.sec, lineHeight: 1.6, marginBottom: 14 }}>Paste any code snippet directly. Perfect for quick demos, interviews, or analyzing small modules.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {["No setup required","Works with any language","Instant analysis","Great for demos & POCs"].map((f,i) => <div key={i} style={{ fontSize: 12, color: C.sec, display: "flex", gap: 7 }}><span style={{ color: C.green }}>✓</span>{f}</div>)}
        </div>
        <div style={{ marginTop: 16, padding: "9px", background: `${C.orange}12`, borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: C.orange }}>Paste Code →</div>
      </div>
    </div>

    {/* Demo Repos */}
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: C.ter, marginBottom: 14 }}>— or try a live demo with a real open-source repo —</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {DEMO_REPOS.map((d, i) => (
          <button key={i} onClick={() => loadDemo(d)} disabled={loading} style={{ padding: "10px 18px", background: C.surface, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, cursor: "pointer", textAlign: "left", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{d.label}</div>
            <div style={{ fontSize: 11, color: C.sec }}>{d.desc}</div>
          </button>
        ))}
      </div>
      {loading && <div style={{ marginTop: 10, fontSize: 13, color: C.sec, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ display: "inline-block", width: 12, height: 12, border: `2px solid #e0e0e0`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Fetching from GitHub…</div>}
      {error && <div style={{ marginTop: 10, fontSize: 13, color: C.red }}>{error}</div>}
    </div>
  </div>

  {/* GitHub Modal */}
  {screen === "github" && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Connect GitHub Repository</div>
        <div style={{ fontSize: 13, color: C.sec, marginBottom: 20 }}>Reads files via GitHub API. Nothing is stored.</div>
        {[{ l: "Owner / Org", v: owner, set: setOwner, p: "e.g. pallets" }, { l: "Repository", v: repo, set: setRepo, p: "e.g. flask" }, { l: "Path (optional)", v: path, set: setPath, p: "e.g. src/flask" }].map((f, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.sec, display: "block", marginBottom: 5 }}>{f.l}</label>
            <input value={f.v} onChange={e => f.set(e.target.value)} placeholder={f.p} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 13, fontFamily: "monospace", outline: "none" }} />
          </div>
        ))}
        {error && <div style={{ fontSize: 13, color: C.red, marginBottom: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button onClick={() => { setScreen("landing"); setError(""); }} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #e0e0e0", background: C.bg, fontSize: 14, cursor: "pointer", color: C.sec }}>Cancel</button>
          <button onClick={connectRepo} disabled={!owner || !repo || loading} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: owner && repo ? "#1b1f23" : "#e0e0e0", color: owner && repo ? "#fff" : C.ter, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #444", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Fetching…</> : <>Connect Repository</>}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Paste Modal */}
  {screen === "paste" && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 28, width: "100%", maxWidth: 560, boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6 }}>Paste Your Code</div>
        <div style={{ fontSize: 13, color: C.sec, marginBottom: 16 }}>Paste any source code. Works with any language.</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.sec, display: "block", marginBottom: 5 }}>File name (optional)</label>
          <input value={pasteName} onChange={e => setPasteName(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 13, fontFamily: "monospace", outline: "none" }} />
        </div>
        <textarea value={pasteCode} onChange={e => setPasteCode(e.target.value)} placeholder="Paste your legacy source code here..." style={{ width: "100%", height: 200, padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 12, fontFamily: "monospace", lineHeight: 1.6, outline: "none", resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={() => setScreen("landing")} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #e0e0e0", background: C.bg, fontSize: 14, cursor: "pointer", color: C.sec }}>Cancel</button>
          <button onClick={submitPaste} disabled={!pasteCode.trim()} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: pasteCode.trim() ? `${C.orange}` : "#e0e0e0", color: pasteCode.trim() ? "#fff" : C.ter, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Analyze Code →</button>
        </div>
      </div>
    </div>
  )}

  {/* VS Code Modal */}
  {screen === "vscode" && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>VS Code Extension</div>
        <div style={{ fontSize: 13, color: C.sec, marginBottom: 20 }}>Zero data egress — runs entirely on the developer's machine.</div>
        {[{ i:"🔒", t:"Zero data egress", d:"Code never leaves the machine. Claude API is called locally." }, { i:"⚡", t:"Right-click anywhere", d:"Select any file or folder → Analyze with Codebase Intelligence." }, { i:"🏢", t:"No IT approval needed", d:"No SaaS to approve. Works behind any firewall or air-gap." }, { i:"🔄", t:"CI/CD ready", d:"Headless mode for automated requirement checks pre-merge." }].map((f,i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>{f.i}</div>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.t}</div><div style={{ fontSize: 12, color: C.sec }}>{f.d}</div></div>
          </div>
        ))}
        <div style={{ background: "#1e1e1e", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
            <div style={{ color: "#569cd6" }}>{`// Install (once published)`}</div>
            <div style={{ color: "#4ec9b0" }}>ext install codebase-intelligence</div>
            <div style={{ color: "#569cd6", marginTop: 8 }}>{`// Enterprise — point to your proxy`}</div>
            <div style={{ color: "#4ec9b0" }}>ANTHROPIC_BASE_URL=https://your-proxy</div>
          </div>
        </div>
        <div style={{ background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: C.green, marginBottom: 16 }}>✓ Full VS Code extension source included in <code>/vscode-extension</code> in this repo.</div>
        <button onClick={() => setScreen("landing")} style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e0e0e0", background: C.bg, fontSize: 14, cursor: "pointer", color: C.sec }}>← Back</button>
      </div>
    </div>
  )}
</div>
```

);
}
