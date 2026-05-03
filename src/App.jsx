import { useState } from "react";

const AGENT_TOOLS = [
  {
    name: "analyze_codebase",
    description: "Analyzes source code and answers whether a business requirement or functionality exists. Returns structured finding with confidence score and evidence.",
    input_schema: {
      type: "object",
      properties: {
        exists: { type: "boolean" },
        confidence: { type: "number" },
        finding: { type: "string" },
        evidence: {
          type: "array",
          items: {
            type: "object",
            properties: {
              file: { type: "string" },
              detail: { type: "string" },
            },
            required: ["file", "detail"]
          }
        },
        gaps: { type: "array", items: { type: "string" } },
      },
      required: ["exists", "confidence", "finding", "evidence", "gaps"]
    }
  }
];

async function runAnalysis(apiKey, code, question, onStep) {
  onStep("Indexing codebase...");
  const messages = [{
    role: "user",
    content: `Analyze this code and answer the question.\n\nCode:\n${code}\n\nQuestion: ${question}\n\nUse the analyze_codebase tool to return a structured answer.`
  }];

  let result = null;
  let iterations = 0;

  while (iterations < 8) {
    iterations++;
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        tools: AGENT_TOOLS,
        messages
      })
    });

    if (!resp.ok) {
      const e = await resp.json();
      throw new Error(e.error?.message || "API error");
    }

    const data = await resp.json();
    const toolUses = data.content.filter(b => b.type === "tool_use");
    const texts = data.content.filter(b => b.type === "text");

    if (texts.length) onStep(texts[0].text.slice(0, 100) + "...");

    const toolResults = [];
    for (const tu of toolUses) {
      if (tu.name === "analyze_codebase") {
        onStep("Analysis complete.");
        result = tu.input;
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify({ success: true }) });
      }
    }

    messages.push({ role: "assistant", content: data.content });
    if (toolResults.length) messages.push({ role: "user", content: toolResults });
    if (data.stop_reason === "end_turn" && result) break;
  }

  if (!result) throw new Error("Agent did not complete.");
  return result;
}

export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [code, setCode] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("idle");
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleRun = async () => {
    if (!apiKey || !code || !question) return;
    setStatus("running");
    setSteps([]);
    setResult(null);
    setError("");
    try {
      const data = await runAnalysis(apiKey, code, question, (s) =>
        setSteps(p => [...p, s])
      );
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  };

  const pct = result ? Math.round(result.confidence * 100) : 0;
  const exists = result?.exists;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.5 }}>
            Codebase Intelligence
          </div>
          <div style={{ fontSize: 15, color: "#6e6e73", marginTop: 4 }}>
            Ask any business question about undocumented legacy code.
          </div>
        </div>

        {/* API Key */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>🔑 Anthropic API Key</div>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 13, fontFamily: "monospace", outline: "none" }}
          />
          <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 6 }}>Never stored. Used only in this session.</div>
        </div>

        {/* Code Input */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>{"</>"} Paste Your Code</div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Paste your legacy source code here..."
            style={{ width: "100%", height: 180, padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 12, fontFamily: "monospace", lineHeight: 1.6, outline: "none", resize: "vertical" }}
          />
        </div>

        {/* Question */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>💬 Your Question</div>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Does this code handle authentication?"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 10, fontSize: 13, outline: "none" }}
          />
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Does this handle authentication?", "Is there error handling?", "Does it support routing?"].map((q, i) => (
              <button key={i} onClick={() => setQuestion(q)} style={{ fontSize: 11, padding: "5px 10px", background: "#f5f5f7", border: "1px solid #e0e0e0", borderRadius: 20, cursor: "pointer", color: "#6e6e73" }}>{q}</button>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={handleRun}
          disabled={!apiKey || !code || !question || status === "running"}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: apiKey && code && question && status !== "running" ? "#0071e3" : "#e0e0e0",
            color: apiKey && code && question && status !== "running" ? "#fff" : "#aeaeb2",
            fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 20,
          }}
        >
          {status === "running" ? "Agent running..." : "Run Analysis"}
        </button>

        {/* Agent Log */}
        {steps.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 10 }}>Agent Log</div>
            {steps.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: "#6e6e73", padding: "4px 0", borderBottom: "1px solid #f5f5f7" }}>→ {s}</div>
            ))}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffb3b3", borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 13, color: "#ff3b30" }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>

            {/* Verdict */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: exists ? "#e8fbe8" : "#fff0f0",
                border: `2px solid ${exists ? "#28cd41" : "#ff3b30"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0
              }}>
                {exists ? "✓" : "✗"}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: exists ? "#28cd41" : "#ff3b30" }}>
                  {exists ? "Functionality Exists" : "Not Found"}
                </div>
                <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 2 }}>{question}</div>
              </div>
            </div>

            {/* Confidence */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 6 }}>Confidence</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 6, background: "#f5f5f7", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct >= 80 ? "#28cd41" : pct >= 55 ? "#ff9f0a" : "#ff3b30", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>{pct}%</span>
              </div>
            </div>

            {/* Finding */}
            <div style={{ background: "#f5f5f7", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 4 }}>Finding</div>
              <div style={{ fontSize: 14, color: "#1d1d1f", lineHeight: 1.6 }}>{result.finding}</div>
            </div>

            {/* Evidence */}
            {result.evidence?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>Evidence</div>
                {result.evidence.map((ev, i) => (
                  <div key={i} style={{ background: "#f0f6ff", borderLeft: "3px solid #0071e3", borderRadius: "0 8px 8px 0", padding: "10px 12px", marginBottom: 8 }}>
                    <code style={{ fontSize: 11, color: "#0071e3" }}>{ev.file}</code>
                    <div style={{ fontSize: 13, color: "#6e6e73", marginTop: 3 }}>{ev.detail}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Gaps */}
            {result.gaps?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ff9f0a", marginBottom: 8 }}>⚠ Gaps</div>
                {result.gaps.map((g, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#6e6e73", padding: "4px 0 4px 12px", borderLeft: "2px solid #ff9f0a", marginBottom: 6 }}>{g}</div>
                ))}
              </div>
            )}

            <button onClick={() => { setResult(null); setStatus("idle"); setSteps([]); }} style={{ marginTop: 16, fontSize: 13, color: "#0071e3", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← New Analysis</button>
          </div>
        )}

      </div>
    </div>
  );
}
