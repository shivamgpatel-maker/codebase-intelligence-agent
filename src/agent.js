// agent.js — Agentic pipeline with 4 tools

export const TOOLS = [
{
name: “index_codebase”,
description: “Indexes source files into semantic chunks with inferred business capabilities.”,
input_schema: {
type: “object”,
properties: {
chunks: { type: “array”, items: { type: “object”, properties: { file: { type: “string” }, name: { type: “string” }, type: { type: “string” }, businessCapability: { type: “string” } }, required: [“file”,“name”,“type”,“businessCapability”] } },
summary: { type: “string” },
architecturePattern: { type: “string” },
totalFiles: { type: “number” }
},
required: [“chunks”,“summary”,“architecturePattern”,“totalFiles”]
}
},
{
name: “search_relevant_chunks”,
description: “Semantic search over indexed chunks to find code relevant to the question.”,
input_schema: {
type: “object”,
properties: {
results: { type: “array”, items: { type: “object”, properties: { file: { type: “string” }, relevanceScore: { type: “number” }, snippet: { type: “string” }, reason: { type: “string” } }, required: [“file”,“relevanceScore”,“snippet”,“reason”] } }
},
required: [“results”]
}
},
{
name: “analyze_requirements”,
description: “Determines whether a business requirement exists in the codebase. Returns structured finding with confidence score and evidence.”,
input_schema: {
type: “object”,
properties: {
exists: { type: “boolean” },
confidence: { type: “number” },
finding: { type: “string” },
evidence: { type: “array”, items: { type: “object”, properties: { file: { type: “string” }, detail: { type: “string” }, lineRef: { type: “string” } }, required: [“file”,“detail”,“lineRef”] } },
gaps: { type: “array”, items: { type: “string” } },
relatedCapabilities: { type: “array”, items: { type: “string” } }
},
required: [“exists”,“confidence”,“finding”,“evidence”,“gaps”,“relatedCapabilities”]
}
},
{
name: “assess_impact”,
description: “Assesses impact of a proposed change on the codebase.”,
input_schema: {
type: “object”,
properties: {
impactLevel: { type: “string”, enum: [“Low”,“Medium”,“High”,“Critical”] },
affectedAreas: { type: “array”, items: { type: “object”, properties: { file: { type: “string” }, impactType: { type: “string”, enum: [“Modify”,“Extend”,“Risk”,“New”] }, description: { type: “string” } }, required: [“file”,“impactType”,“description”] } },
estimatedEffort: { type: “string” },
risks: { type: “array”, items: { type: “string” } },
recommendations: { type: “array”, items: { type: “string” } }
},
required: [“impactLevel”,“affectedAreas”,“estimatedEffort”,“risks”,“recommendations”]
}
}
];

export async function runAgent({ apiKey, files, question, mode, onStep }) {
const codeblock = files.map(f => `// FILE: ${f.path}\n${f.content}`).join(”\n\n—\n\n”);
const sys = `You are an elite software archaeologist. Analyze legacy codebases with no documentation and answer business questions with precision. Use tools in sequence: index_codebase → search_relevant_chunks → analyze_requirements${mode === "impact" ? " → assess_impact" : ""}. Reference actual file names and functions from the code.`;
const messages = [{ role: “user”, content: `Analyze these files:\n\n\```\n${codeblock}\n```\n\nQuestion: ${question}\n\nUse all tools sequentially.` }];

let index = null, search = null, analysis = null, impact = null, iter = 0;

while (iter < 12) {
iter++;
const resp = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json”, “x-api-key”: apiKey, “anthropic-version”: “2023-06-01”, “anthropic-dangerous-direct-browser-access”: “true” },
body: JSON.stringify({ model: “claude-sonnet-4-20250514”, max_tokens: 4000, system: sys, tools: TOOLS, messages })
});
if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || `API ${resp.status}`); }
const data = await resp.json();
const toolUses = data.content.filter(b => b.type === “tool_use”);
const texts = data.content.filter(b => b.type === “text”);
if (texts.length) onStep({ type: “thinking”, text: texts[0].text.slice(0, 120) });
const results = [];
for (const tu of toolUses) {
if (tu.name === “index_codebase”) { onStep({ type: “tool”, name: tu.name, label: `Indexed ${tu.input.chunks?.length} chunks · ${tu.input.architecturePattern}` }); index = tu.input; }
if (tu.name === “search_relevant_chunks”) { onStep({ type: “tool”, name: tu.name, label: `Found ${tu.input.results?.length} relevant sections` }); search = tu.input; }
if (tu.name === “analyze_requirements”) { onStep({ type: “tool”, name: tu.name, label: `Confidence ${Math.round((tu.input.confidence||0)*100)}% · ${tu.input.exists ? "EXISTS" : "NOT FOUND"}` }); analysis = tu.input; }
if (tu.name === “assess_impact”) { onStep({ type: “tool”, name: tu.name, label: `Impact: ${tu.input.impactLevel} · ${tu.input.affectedAreas?.length} areas` }); impact = tu.input; }
results.push({ type: “tool_result”, tool_use_id: tu.id, content: JSON.stringify({ success: true }) });
}
messages.push({ role: “assistant”, content: data.content });
if (results.length) messages.push({ role: “user”, content: results });
if (data.stop_reason === “end_turn” && analysis) break;
}
if (!analysis) throw new Error(“Agent did not complete analysis.”);
return { index, search, analysis, impact };
}

export async function fetchGitHubFiles(owner, repo, path = “”, maxFiles = 6) {
const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const resp = await fetch(url, { headers: { Accept: “application/vnd.github.v3+json” } });
if (!resp.ok) throw new Error(`GitHub API error ${resp.status} — check owner/repo/path`);
const items = await resp.json();
if (!Array.isArray(items)) throw new Error(“Path is a file, not a folder. Enter a directory path.”);
const files = items.filter(i => i.type === “file” && /.(py|js|ts|java|rb|go|php|cs|cpp|c)$/.test(i.name)).slice(0, maxFiles);
if (!files.length) throw new Error(“No supported source files found at that path.”);
const contents = await Promise.all(files.map(async f => {
try {
const r = await fetch(f.url, { headers: { Accept: “application/vnd.github.v3+json” } });
const d = await r.json();
const content = d.encoding === “base64” ? atob(d.content.replace(/\n/g,””)) : (d.content||””);
return { name: f.name, path: f.path, content: content.slice(0, 3000) };
} catch { return null; }
}));
return contents.filter(Boolean);
}
