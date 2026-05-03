// Results.jsx — Analysis results display

const C = { blue:”#0071e3”, green:”#28cd41”, orange:”#ff9f0a”, red:”#ff3b30”, purple:”#bf5af2”, teal:”#5ac8fa”, text:”#1d1d1f”, sec:”#6e6e73”, ter:”#aeaeb2”, bg:”#f5f5f7”, surface:”#ffffff” };
const card = { background: C.surface, borderRadius: 14, padding: 20, boxShadow: “0 2px 16px rgba(0,0,0,0.07)”, marginBottom: 14 };
const Tag = ({ label, color }) => <span style={{ fontSize: 11, fontWeight: 600, padding: “3px 9px”, borderRadius: 20, background: `${color}18`, color, fontFamily: “-apple-system,sans-serif” }}>{label}</span>;

const impactColors = { Low: C.green, Medium: C.orange, High: C.red, Critical: “#ff2d55” };
const impactTypeColors = { Modify: C.orange, Extend: C.blue, Risk: C.red, New: C.green };

export default function Results({ result, question, onReset, agentSteps }) {
const { analysis, index, search, impact } = result;
const pct = Math.round((analysis.confidence || 0) * 100);
const confColor = pct >= 80 ? C.green : pct >= 55 ? C.orange : C.red;
const [tab, setTab] = React.useState(“analysis”);
const tabs = [
{ id: “analysis”, label: “Analysis” },
{ id: “index”, label: “Index” },
{ id: “search”, label: “Search” },
…(impact ? [{ id: “impact”, label: “Impact” }] : [])
];

return (
<div>
{/* Verdict */}
<div style={{ …card, display: “flex”, gap: 16, alignItems: “flex-start” }}>
<div style={{ width: 60, height: 60, borderRadius: “50%”, background: analysis.exists ? `${C.green}18` : `${C.red}18`, border: `2px solid ${analysis.exists ? C.green : C.red}`, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 26, flexShrink: 0 }}>
{analysis.exists ? “✓” : “✗”}
</div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 11, color: C.ter, marginBottom: 3 }}>Question</div>
<div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>”{question}”</div>
<div style={{ display: “flex”, alignItems: “center”, gap: 10 }}>
<div style={{ flex: 1, height: 5, background: C.bg, borderRadius: 3, overflow: “hidden” }}>
<div style={{ width: `${pct}%`, height: “100%”, background: confColor, borderRadius: 3 }} />
</div>
<span style={{ fontSize: 13, fontWeight: 700, color: confColor }}>{pct}%</span>
</div>
<div style={{ fontSize: 13, color: C.sec, marginTop: 8, lineHeight: 1.6, background: C.bg, borderRadius: 8, padding: “10px 12px” }}>{analysis.finding}</div>
</div>
</div>

```
  {/* Tabs */}
  <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${tab === t.id ? C.blue : "#e0e0e0"}`, background: tab === t.id ? C.blue : C.surface, color: tab === t.id ? "#fff" : C.sec, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{t.label}</button>
    ))}
    <button onClick={onReset} style={{ marginLeft: "auto", padding: "7px 16px", borderRadius: 20, border: "1px solid #e0e0e0", background: C.surface, color: C.sec, fontSize: 12, cursor: "pointer" }}>← New</button>
  </div>

  {/* Analysis Tab */}
  {tab === "analysis" && (
    <div>
      {analysis.evidence?.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Evidence</div>
          {analysis.evidence.map((ev, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${C.blue}`, paddingLeft: 12, marginBottom: 10 }}>
              <code style={{ fontSize: 11, color: C.blue }}>{ev.file}</code>
              <span style={{ fontSize: 11, color: C.ter, marginLeft: 8 }}>{ev.lineRef}</span>
              <div style={{ fontSize: 13, color: C.sec, marginTop: 3 }}>{ev.detail}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {analysis.gaps?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 8 }}>⚠ Gaps</div>
            {analysis.gaps.map((g, i) => <div key={i} style={{ fontSize: 12, color: C.sec, borderLeft: `2px solid ${C.orange}`, paddingLeft: 8, marginBottom: 6 }}>{g}</div>)}
          </div>
        )}
        {analysis.relatedCapabilities?.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 8 }}>◈ Related</div>
            {analysis.relatedCapabilities.map((c, i) => <div key={i} style={{ fontSize: 12, color: C.sec, borderLeft: `2px solid ${C.teal}`, paddingLeft: 8, marginBottom: 6 }}>{c}</div>)}
          </div>
        )}
      </div>
    </div>
  )}

  {/* Index Tab */}
  {tab === "index" && index && (
    <div>
      <div style={card}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          {[{ l: "Files", v: index.totalFiles }, { l: "Chunks", v: index.chunks?.length }, { l: "Architecture", v: index.architecturePattern }].map((m, i) => (
            <div key={i} style={{ flex: 1, minWidth: 100, background: C.bg, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: C.ter }}>{m.l}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.sec, background: C.bg, borderRadius: 8, padding: 10 }}>{index.summary}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {index.chunks?.map((c, i) => (
          <div key={i} style={{ ...card, marginBottom: 0 }}>
            <Tag label={c.type} color={C.purple} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: "6px 0 2px" }}>{c.name}</div>
            <code style={{ fontSize: 10, color: C.ter, display: "block", marginBottom: 4 }}>{c.file}</code>
            <div style={{ fontSize: 12, color: C.sec }}>{c.businessCapability}</div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Search Tab */}
  {tab === "search" && search && (
    <div>
      {search.results?.map((r, i) => (
        <div key={i} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <code style={{ fontSize: 12, color: C.blue, background: `${C.blue}12`, padding: "2px 8px", borderRadius: 5 }}>{r.file}</code>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{Math.round(r.relevanceScore * 100)}%</span>
          </div>
          <div style={{ fontSize: 12, color: C.sec, marginBottom: 8 }}>{r.reason}</div>
          <pre style={{ fontSize: 11, background: C.bg, borderRadius: 8, padding: 10, overflowX: "auto", color: C.text, lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{r.snippet}</pre>
        </div>
      ))}
    </div>
  )}

  {/* Impact Tab */}
  {tab === "impact" && impact && (
    <div>
      <div style={card}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <Tag label={`Impact: ${impact.impactLevel}`} color={impactColors[impact.impactLevel] || C.orange} />
          <span style={{ fontSize: 13, color: C.sec }}>Effort: <strong style={{ color: C.text }}>{impact.estimatedEffort}</strong></span>
        </div>
        {impact.affectedAreas?.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f0f0", alignItems: "flex-start" }}>
            <Tag label={a.impactType} color={impactTypeColors[a.impactType] || C.sec} />
            <div>
              <code style={{ fontSize: 11, color: C.blue }}>{a.file}</code>
              <div style={{ fontSize: 12, color: C.sec, marginTop: 2 }}>{a.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 8 }}>⚠ Risks</div>
          {impact.risks?.map((r, i) => <div key={i} style={{ fontSize: 12, color: C.sec, borderLeft: `2px solid ${C.red}`, paddingLeft: 8, marginBottom: 6 }}>{r}</div>)}
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>✓ Recommendations</div>
          {impact.recommendations?.map((r, i) => <div key={i} style={{ fontSize: 12, color: C.sec, borderLeft: `2px solid ${C.green}`, paddingLeft: 8, marginBottom: 6 }}>{r}</div>)}
        </div>
      </div>
    </div>
  )}

  {/* Pipeline footer */}
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "12px 16px", background: C.surface, borderRadius: 10, border: "1px solid #e0e0e0", marginTop: 4, alignItems: "center" }}>
    <span style={{ fontSize: 11, color: C.ter }}>Pipeline:</span>
    {[{ i:"⬡",l:"Indexer",c:C.purple },{ i:"◎",l:"Search",c:C.blue },{ i:"◈",l:"Archaeologist",c:C.teal },...(impact?[{i:"▲",l:"Impact",c:C.orange}]:[])].map((a,i,arr)=>(
      <span key={i} style={{ fontSize: 11, color: a.c }}>{a.i} {a.l}{i<arr.length-1?" →":""} </span>
    ))}
  </div>
</div>
```

);
}
