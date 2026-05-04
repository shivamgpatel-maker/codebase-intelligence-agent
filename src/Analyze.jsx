// Analyze.jsx — Analysis screen (shared by GitHub, paste, and VS Code modes)
import { useState, useRef } from “react”;
import { runAgent } from “./agent.js”;
import Results from “./Results.jsx”;

const C = { blue:”#0071e3”, green:”#28cd41”, orange:”#ff9f0a”, red:”#ff3b30”, teal:”#5ac8fa”, purple:”#bf5af2”, text:”#1d1d1f”, sec:”#6e6e73”, ter:”#aeaeb2”, bg:”#f5f5f7”, surface:”#ffffff” };
const card = { background: C.surface, borderRadius: 14, padding: 20, boxShadow: “0 2px 16px rgba(0,0,0,0.07)”, marginBottom: 14 };
const toolMeta = { index_codebase:{i:“⬡”,l:“Indexer”,c:C.purple}, search_relevant_chunks:{i:“◎”,l:“Search”,c:C.blue}, analyze_requirements:{i:“◈”,l:“Archaeologist”,c:C.teal}, assess_impact:{i:“▲”,l:“Impact”,c:C.orange} };

export default function Analyze({ files, repoLabel, onBack }) {
const [apiKey, setApiKey] = useState(””);
const [showKey, setShowKey] = useState(false);
const [question, setQuestion] = useState(””);
const [mode, setMode] = useState(“exists”);
const [status, setStatus] = useState(“idle”);
const [steps, setSteps] = useState([]);
const [result, setResult] = useState(null);
const [error, setError] = useState(””);
const logRef = useRef(null);

const suggestions = [
“Does this handle authentication and session management?”,
“Is there middleware or request pipeline processing?”,
“Does it support routing and URL pattern matching?”,
“Is there error handling or exception management?”,
“Does it have caching mechanisms?”
];

const handleRun = async () => {
if (!apiKey || !question || !files.length) return;
setStatus(“running”); setSteps([]); setResult(null); setError(””);
try {
const data = await runAgent({ apiKey, files, question, mode, onStep: s => { setSteps(p => […p, s]); setTimeout(() => logRef.current?.scrollTo(0, 9999), 50); } });
setResult(data); setStatus(“done”);
} catch (e) { setError(e.message); setStatus(“error”); }
};

if (result) return (
<div style={{ maxWidth: 760, margin: “0 auto”, padding: “28px 16px 60px” }}>
<Results result={result} question={question} agentSteps={steps} onReset={() => { setResult(null); setStatus(“idle”); setSteps([]); }} />
</div>
);

return (
<div style={{ maxWidth: 760, margin: “0 auto”, padding: “28px 16px 60px” }}>
<button onClick={onBack} style={{ fontSize: 13, color: C.sec, background: “none”, border: “none”, cursor: “pointer”, marginBottom: 20, display: “flex”, alignItems: “center”, gap: 5 }}>← Back</button>

  {/* Repo/source label */}
  <div style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${C.green}18`, border: `1px solid ${C.green}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✓</div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{repoLabel}</div>
      <div style={{ fontSize: 12, color: C.sec }}>{files.length} files ready to analyze</div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: 6 }}>
      {files.map((f, i) => <span key={i} style={{ fontSize: 10, padding: "2px 7px", background: C.bg, borderRadius: 20, color: C.ter, fontFamily: "monospace" }}>{f.name}</span>)}
    </div>
  </div>

  {/* API Key */}
  <div style={card}>
    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>🔑 Anthropic API Key</div>
    <div style={{ position: "relative" }}>
      <input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: "100%", padding: "10px 36px 10px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 13, fontFamily: "monospace", outline: "none" }} />
      <button onClick={() => setShowKey(!showKey)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.ter }}>{showKey ? "🙈" : "👁"}</button>
    </div>
    <div style={{ fontSize: 11, color: C.ter, marginTop: 5 }}>Never stored. Used only in this browser session.</div>
  </div>

  {/* Question */}
  <div style={card}>
    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>💬 Your Question</div>
    <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. Does this codebase support multi-currency transactions?" style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 13, outline: "none" }} />
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: C.ter, marginBottom: 6 }}>Suggested:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {suggestions.slice(0, 3).map((q, i) => (
          <button key={i} onClick={() => setQuestion(q)} style={{ textAlign: "left", padding: "7px 10px", fontSize: 12, background: question === q ? `${C.blue}12` : C.bg, border: `1px solid ${question === q ? C.blue+"40" : "transparent"}`, borderRadius: 8, color: question === q ? C.blue : C.sec, cursor: "pointer" }}>{q}</button>
        ))}
      </div>
    </div>
  </div>

  {/* Mode */}
  <div style={card}>
    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>Analysis Mode</div>
    <div style={{ display: "flex", gap: 8 }}>
      {[{ id: "exists", label: "Does it exist?", sub: "3 agents", icon: "🔍" }, { id: "impact", label: "+ Impact Analysis", sub: "4 agents", icon: "⚡" }].map(m => (
        <button key={m.id} onClick={() => setMode(m.id)} style={{ flex: 1, padding: "10px 12px", background: mode === m.id ? `${C.blue}12` : C.bg, border: `1px solid ${mode === m.id ? C.blue+"50" : "transparent"}`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: mode === m.id ? C.blue : C.text }}>{m.icon} {m.label}</div>
          <div style={{ fontSize: 11, color: C.ter }}>{m.sub}</div>
        </button>
      ))}
    </div>
  </div>

  {/* Agent Log */}
  {steps.length > 0 && (
    <div style={card}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: status === "running" ? C.orange : C.green }} />
        Agent Activity
      </div>
      <div ref={logRef} style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => {
          const m = s.type === "tool" ? toolMeta[s.name] : null;
          return (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: m ? `${m.c}15` : `${C.teal}15`, border: `1px solid ${m ? m.c : C.teal}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: m ? m.c : C.teal, flexShrink: 0 }}>{m ? m.i : "✦"}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: m ? m.c : C.teal }}>{m ? `Agent · ${m.l}` : "Reasoning"}</div>
                <div style={{ fontSize: 12, color: C.sec }}>{s.type === "tool" ? s.label : s.text}</div>
              </div>
            </div>
          );
        })}
        {status === "running" && <div style={{ fontSize: 12, color: C.ter }}>Processing…</div>}
      </div>
    </div>
  )}

  {error && <div style={{ background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 13, color: C.red }}>{error}</div>}

  {/* Run */}
  <button onClick={handleRun} disabled={!apiKey || !question || !files.length || status === "running"} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: apiKey && question && files.length && status !== "running" ? "linear-gradient(135deg,#0071e3,#bf5af2)" : "#e0e0e0", color: apiKey && question && files.length && status !== "running" ? "#fff" : "#aeaeb2", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
    {status === "running" ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Agents running…</> : <>◈ Run Agent Analysis · {files.length} files</>}
  </button>
</div>
);
}
