/* =========================================================
   viz.jsx — interactive benches ("决策台") + shared prelude
   ---------------------------------------------------------
   Dependency-free. Each chapter sets `viz: "<name>"` in
   data.jsx; the chapter page renders <Viz name={...} />.
   Every bench computes its numbers live — real softmax, real
   ECE, real temperature grid-search, real queueing. No canned
   art. This file: the shared helpers + Modules I–III (t1–t9),
   exported as window.__JV_VIZ_1. t10–t18 live in viz2.jsx,
   t19–t24 + the registry + <Viz> in viz3.jsx; index.html
   loads them in that order.
   ========================================================= */

/* ---------------- shared math helpers ---------------- */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const nf = (n, d = 2) => {
  if (!isFinite(n)) return "∞";
  const r = Math.abs(n) >= 1000 ? Math.round(n) : Math.round(n * 10 ** d) / 10 ** d;
  return r.toLocaleString("en-US", { maximumFractionDigits: d });
};
const pct = (x) => `${Math.round(x * 100)}%`;
const pct1 = (x) => `${nf(x * 100, 1)}%`;
const ms = (x) => `${nf(x, 0)} ms`;

// Deterministic PRNG (mulberry32) — reproducible across renders.
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r) { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/* ---------------- the numbers this book measured ---------------- */
// One place for every figure attributed to "本书实测", so a bench never
// drifts from the case study in module VIII.
const MEASURED = {
  acc: 0.505, random: 0.056, majority: 0.120,
  latMed: 401, latP95: 447, latWarm: 976, latCold4467: 4467, loadCold: 18.5,
  eceRaw: 0.215, eceFit: 0.141, tFit: 1.65,
  // threshold → [coverage, precision], from the real run
  gate: [[0.50, 0.565, 0.623], [0.60, 0.505, 0.624], [0.70, 0.458, 0.657],
         [0.80, 0.361, 0.654], [0.85, 0.319, 0.638], [0.90, 0.292, 0.651], [0.95, 0.208, 0.689]],
  n: 216, k: 18,
};

/* ---------------- probability toolkit (the book's real math) ---------------- */
function softmax(logits, T = 1) {
  const m = Math.max(...logits);
  const e = logits.map((z) => Math.exp((z - m) / T));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / s);
}
const entropy = (p) => -p.reduce((s, x) => s + (x > 1e-12 ? x * Math.log(x) : 0), 0);
// Laya's confidence field: normalized entropy, NOT a probability (common.py:210).
const layaConf = (p) => { const k = p.length; return k < 2 ? 1 : clamp(1 - entropy(p) / Math.log(k), 0, 1); };
// Expected Calibration Error on the TOP-1 probability.
function ece(conf, correct, bins = 10) {
  const n = conf.length; if (!n) return 0;
  let tot = 0;
  for (let b = 0; b < bins; b++) {
    const lo = b / bins, hi = (b + 1) / bins;
    const idx = conf.map((c, i) => (c > lo || b === 0) && c <= hi ? i : -1).filter((i) => i >= 0);
    if (!idx.length) continue;
    const acc = idx.reduce((s, i) => s + correct[i], 0) / idx.length;
    const cf = idx.reduce((s, i) => s + conf[i], 0) / idx.length;
    tot += (idx.length / n) * Math.abs(acc - cf);
  }
  return tot;
}
// Grid-search the temperature that minimises NLL, over Laya's own clamp [0.5, 5].
function fitTemp(logprobs, gold) {
  let bestNll = Infinity, bestT = 1;
  for (let T = 0.5; T <= 5.0001; T += 0.05) {
    let nll = 0;
    for (let i = 0; i < gold.length; i++) nll -= Math.log(Math.max(softmax(logprobs[i], T)[gold[i]], 1e-12));
    if (nll < bestNll) { bestNll = nll; bestT = T; }
  }
  return Math.round(bestT * 100) / 100;
}

/* ---------------- shared controls ---------------- */
function Slider({ label, min, max, step, value, onChange, unit, fmt }) {
  return (
    <label>
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step || 1} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="val">{fmt ? fmt(value) : value}{unit || ""}</span>
    </label>
  );
}
function Choice({ label, value, onChange, options }) {
  return (
    <label>
      <span>{label}</span>
      <select className="jv-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === "object" ? o.v : o, l = typeof o === "object" ? o.l : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </label>
  );
}
function Seg({ value, onChange, options }) {
  return (
    <div className="jv-seg">
      {options.map((o) => <button key={o.v} className={value === o.v ? "on" : ""} onClick={() => onChange(o.v)}>{o.l}</button>)}
    </div>
  );
}
function Toggle({ label, value, onChange }) {
  return (
    <label style={{ cursor: "pointer" }} onClick={() => onChange(!value)}>
      <span>{label}</span>
      <span className={`jv-pill click ${value ? "on" : ""}`} style={{ justifySelf: "start" }}>{value ? "ON" : "OFF"}</span>
    </label>
  );
}
function Kpi({ label, value, unit, hint, tone, sel, onClick }) {
  return (
    <div className={`jv-kpi ${tone || ""} ${sel ? "sel" : ""}`} onClick={onClick}>
      <div className="k-label">{label}</div>
      <div className="k-val">{value}{unit ? <span className="k-unit">{unit}</span> : null}</div>
      {hint ? <div className="k-hint">{hint}</div> : null}
    </div>
  );
}
function Bar({ label, value, max, tone, valText }) {
  const w = clamp((value / (max || 1)) * 100, 0, 100);
  return (
    <div className="jv-bar-row">
      <span>{label}</span>
      <div className="b-track"><div className={`b-fill ${tone || ""}`} style={{ width: `${w}%` }} /></div>
      <span className="b-val">{valText !== undefined ? valText : nf(value, 1)}</span>
    </div>
  );
}
function VizHead({ idx, title }) {
  return <div className="viz-title"><span className="viz-title-idx">{idx}</span><span>{title}</span></div>;
}
function Note({ mark, children, tone }) {
  return <div className={`jv-step ${tone || ""}`}><span className="sn">{mark}</span><div>{children}</div></div>;
}
function useL() { const lang = useLang(); return (zh, en) => (lang === "zh" ? zh : en); }

/* ---------------- shared SVG primitives ---------------- */
// A vertical bar chart of a probability distribution over labelled options.
function DistBars({ probs, labels, mark, h = 120, tone = "var(--primary)" }) {
  const w = 300, pad = 8, n = probs.length, bw = (w - 2 * pad) / n;
  const hi = Math.max(...probs, 0.001);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      <line x1={pad} y1={h - 16} x2={w - pad} y2={h - 16} stroke="var(--hairline-strong)" strokeWidth="1" />
      {probs.map((p, i) => {
        const bh = (p / hi) * (h - 32), x = pad + i * bw + 2;
        const on = i === mark;
        return (
          <g key={i}>
            <rect x={x} y={h - 16 - bh} width={bw - 4} height={Math.max(0, bh)} rx="2"
              fill={on ? "var(--accent)" : tone} opacity={on ? 1 : 0.72} />
            {labels && n <= 8 && <text x={x + (bw - 4) / 2} y={h - 5} textAnchor="middle"
              style={{ font: "500 9px var(--f-mono)", fill: "var(--muted)" }}>{labels[i]}</text>}
            {p > 0.06 && <text x={x + (bw - 4) / 2} y={h - 20 - bh} textAnchor="middle"
              style={{ font: "600 9px var(--f-mono)", fill: "var(--ink)" }}>{nf(p * 100, 0)}</text>}
          </g>
        );
      })}
    </svg>
  );
}
// A reliability diagram: mean confidence (x) vs accuracy (y), diagonal = perfect.
function Reliability({ pts, h = 180 }) {
  const w = 260, pad = 26;
  const X = (x) => pad + x * (w - 2 * pad), Y = (y) => h - pad - y * (h - 2 * pad);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", maxWidth: 300, margin: "0 auto" }}>
      <rect x={pad} y={pad} width={w - 2 * pad} height={h - 2 * pad} fill="none" stroke="var(--hairline)" />
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--muted)" strokeDasharray="4 4" strokeWidth="1" />
      {pts.map((p, i) => p.n > 0 && (
        <g key={i}>
          <line x1={X(p.conf)} y1={Y(p.conf)} x2={X(p.conf)} y2={Y(p.acc)} stroke="var(--accent)" strokeWidth="1" opacity="0.5" />
          <circle cx={X(p.conf)} cy={Y(p.acc)} r={2 + Math.sqrt(p.n)} fill="var(--primary)" opacity="0.8" />
        </g>
      ))}
      <text x={X(0.5)} y={h - 6} textAnchor="middle" style={{ font: "500 9px var(--f-mono)", fill: "var(--muted)" }}>confidence →</text>
      <text x={10} y={Y(0.5)} textAnchor="middle" transform={`rotate(-90 10 ${Y(0.5)})`} style={{ font: "500 9px var(--f-mono)", fill: "var(--muted)" }}>accuracy →</text>
    </svg>
  );
}
// A synthetic labelled eval set with a tunable overconfidence/separation knob.
// Returns per-item {logits, gold, top, conf, correct} — the raw material of ECE.
function makeEval(k, nItems, skill, overconf, seed) {
  const r = rng(seed);
  const items = [];
  for (let i = 0; i < nItems; i++) {
    const gold = Math.floor(r() * k);
    const logits = Array.from({ length: k }, () => gauss(r) * 0.6);
    logits[gold] += skill * 2.4;                 // skill lifts the true class
    const scaled = logits.map((z) => z * overconf);
    const p = softmax(scaled);
    let top = 0; for (let j = 1; j < k; j++) if (p[j] > p[top]) top = j;
    items.push({ p, gold, top, conf: p[top], correct: top === gold ? 1 : 0, logits });
  }
  return items;
}

/* =========================================================
   Module I · SO — 决策不是文本
   ========================================================= */

/* t1 · pipeLab — generate-then-parse vs return-the-decision */
function PipeViz() {
  const L = useL();
  const [fault, setFault] = React.useState("none");
  const [retry, setRetry] = React.useState(true);
  const base = 220;            // one LLM generation, ms
  const FAULTS = {
    none:  { zh: "无故障", en: "no fault", jsonOk: true, extra: 0 },
    trunc: { zh: "输出截断", en: "truncation", jsonOk: false, extra: base },
    drift: { zh: "字段名漂移", en: "field drift", jsonOk: true, extra: 0, wrong: true },
    enum:  { zh: "枚举拼错", en: "misspelled enum", jsonOk: true, extra: 0, wrong: true },
    bad:   { zh: "非法 JSON", en: "invalid JSON", jsonOk: false, extra: base },
    to:    { zh: "超时", en: "timeout", jsonOk: false, extra: 3000 },
  };
  const f = FAULTS[fault];
  // generate-then-parse latency: base + repair retry when JSON fails and retry is on
  const needsRetry = !f.jsonOk;
  const llmLat = base + (needsRetry ? (retry ? f.extra : 0) : 0);
  const llmOk = f.jsonOk && !f.wrong ? "ok" : (retry && needsRetry ? "ok" : "dead");
  const soLat = 42;            // one forward pass, encoder, GPU-class
  return (
    <div>
      <VizHead idx="SO1" title={L("两条流水线,同一个工单,注入同一个故障", "Two pipelines, one ticket, the same injected fault")} />
      <div className="viz-ctrl">
        <Choice label={L("注入故障", "Inject fault")} value={fault} onChange={setFault}
          options={Object.entries(FAULTS).map(([v, o]) => ({ v, l: L(o.zh, o.en) }))} />
        <Toggle label={L("生成侧开启修复重试", "Repair-retry on parse side")} value={retry} onChange={setRetry} />
      </div>
      <div className="jv-grid2" style={{ marginTop: 12 }}>
        <div className="jv-note">
          <div className="jv-label">{L("生成 JSON 再解析", "generate-then-parse")}</div>
          <Bar label={L("延迟", "latency")} value={llmLat} max={3400} tone={llmLat > 800 ? "bad" : "warn"} valText={ms(llmLat)} />
          <div style={{ marginTop: 6, font: "600 12px var(--f-mono)", color: llmOk === "ok" ? "var(--ok)" : "var(--bad)" }}>
            {llmOk === "ok" ? L("✓ 拿到决策", "✓ decision obtained") : L("✗ 这一步塌了", "✗ collapsed here")}
          </div>
        </div>
        <div className="jv-note">
          <div className="jv-label">{L("一次前向出决策", "single forward → decision")}</div>
          <Bar label={L("延迟", "latency")} value={soLat} max={3400} tone="ok" valText={ms(soLat)} />
          <div style={{ marginTop: 6, font: "600 12px var(--f-mono)", color: "var(--ok)" }}>
            {L("✓ 决策 + 概率,无可解析之物", "✓ decision + probability, nothing to parse")}
          </div>
        </div>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("延迟比", "latency ratio")} value={`${nf(llmLat / soLat, 1)}×`} tone="acc" hint={L("生成侧 / 决策侧", "parse / decision")} />
        <Kpi label={L("生成侧失败模式", "parse-side failure")} value={f.wrong ? L("静默出错", "silent wrong") : (f.jsonOk ? L("无", "none") : L("硬失败", "hard fail"))}
          tone={f.wrong ? "bad" : (f.jsonOk ? "ok" : "warn")} />
        <Kpi label={L("决策侧概率", "decision-side prob.")} value="0.94" tone="ok" hint={L("可按此分流", "route on this")} />
      </div>
      <Note mark="!" tone={f.wrong ? "bad" : ""}>
        {f.wrong
          ? L("字段漂移和枚举拼错是最危险的一类:JSON 合法,校验通过,但值是错的——重试救不了它,因为没有报错。", "Field drift and misspelled enums are the dangerous class: the JSON is valid, validation passes, but the value is wrong — retries cannot help because nothing errored.")
          : L("当你要的只是一个枚举加一个概率,生成一串 token 再抠出来,是在为你不需要的能力付延迟和不确定性。", "When all you want is an enum and a probability, emitting tokens to dig the value out pays latency and uncertainty for a capability you never needed.")}
      </Note>
    </div>
  );
}

/* t2 · primLab — choice / score / noul, manipulate the distribution */
function PrimViz() {
  const L = useL();
  const [k, setK] = React.useState(4);
  const [spread, setSpread] = React.useState(1.4);   // how peaked the top logit is
  const [bimodal, setBimodal] = React.useState(false);
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H"].slice(0, k);
  let logits = Array.from({ length: k }, (_, i) => (i === 0 ? spread : 0));
  if (bimodal && k >= 3) { logits = logits.map((_, i) => (i === 0 || i === k - 1 ? spread : -0.4)); }
  const p = softmax(logits);
  let top = 0; for (let i = 1; i < k; i++) if (p[i] > p[top]) top = i;
  const conf = layaConf(p);
  const scoreExp = p.reduce((s, x, i) => s + x * i, 0);   // ordinal expectation
  const H = entropy(p), Hmax = Math.log(k);
  const rand = 1 / k;
  return (
    <div>
      <VizHead idx="SO2" title={L("三个原语共享一个分布:choice / score / noul", "Three primitives, one distribution: choice / score / noul")} />
      <div className="viz-ctrl">
        <Slider label={L("选项数 k", "options k")} min={2} max={8} step={1} value={k} onChange={setK} />
        <Slider label={L("顶端锐度", "top sharpness")} min={0} max={4} step={0.1} value={spread} onChange={setSpread} />
        <Toggle label={L("双峰(演示 score 失效)", "bimodal (score failure)")} value={bimodal} onChange={setBimodal} />
      </div>
      <div style={{ marginTop: 10 }}>
        <DistBars probs={p} labels={labels} mark={top} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("choice · top-1 概率", "choice · top-1 prob")} value={nf(p[top], 3)} tone="acc" hint={`> rand ${nf(rand, 3)}`} />
        <Kpi label="score · E[level]" value={nf(scoreExp, 2)} tone={bimodal ? "bad" : "ok"}
          hint={bimodal ? L("落在两峰之间——两边都不成立", "between the modes — neither is true") : L("有序期望", "ordinal expectation")} />
        <Kpi label="noul · P(true)" value={k === 2 ? nf(p[0], 3) : "—"} tone="mut" hint={k === 2 ? L("数值即概率", "value is the probability") : L("noul 只有两选项", "noul is binary")} />
        <Kpi label={L("归一化熵(=laya conf)", "norm. entropy (=laya conf)")} value={nf(conf, 3)} tone="warn"
          hint={L("这不是概率", "this is NOT a probability")} />
      </div>
      <Note mark="k">
        {L(`选项数改变一切:k=${k} 时随机基线 ${nf(rand, 3)}、熵上界 ${nf(Hmax, 2)}。拿同一个置信度门槛去卡 k=2 和 k=18 两种任务是没有意义的。`,
           `k changes everything: at k=${k} the random baseline is ${nf(rand, 3)} and the entropy ceiling ${nf(Hmax, 2)}. One confidence threshold cannot be carried between a k=2 task and a k=18 one.`)}
      </Note>
    </div>
  );
}

/* t3 · latencyLab — the autoregressive token tax vs one forward */
function LatencyViz() {
  const L = useL();
  const [inTok, setInTok] = React.useState(120);
  const [outTok, setOutTok] = React.useState(40);
  const [hw, setHw] = React.useState("gpu");
  const HW = { gpu: { per: 0.9, fwd: 0.14, l: "GPU" }, cpu: { per: 22, fwd: 3.1, l: "CPU" } };
  const h = HW[hw];
  // autoregressive: prefill(input) + per-token × output.  encoder: one forward over input.
  const arLat = h.fwd * inTok / 40 + h.per * outTok;
  const soLat = hw === "cpu" ? clamp(MEASURED.latMed * (inTok / 60), 120, 4000) : h.fwd * (inTok / 40) * 40 + 6;
  const ratio = arLat / soLat;
  const curve = [];
  for (let o = 1; o <= 80; o += 4) curve.push({ ar: h.fwd * inTok / 40 + h.per * o, so: soLat, o });
  const W = 300, P = 22, mx = Math.max(...curve.map((c) => c.ar)) * 1.05;
  const X = (o) => P + (o / 80) * (W - 2 * P), Y = (v) => 150 - P - (v / mx) * (150 - 2 * P);
  return (
    <div>
      <VizHead idx="SO3" title={L("延迟从哪来:输出 token 数是自回归的税", "Where latency comes from: output tokens are the autoregressive tax")} />
      <div className="viz-ctrl">
        <Slider label={L("输入长度 (token)", "input length (tok)")} min={20} max={800} step={20} value={inTok} onChange={setInTok} />
        <Slider label={L("输出长度 (token)", "output length (tok)")} min={1} max={80} step={1} value={outTok} onChange={setOutTok} />
        <Seg value={hw} onChange={setHw} options={[{ v: "gpu", l: "GPU" }, { v: "cpu", l: "CPU" }]} />
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="jv-cap">{L("延迟对输出长度(红=自回归,绿=一次前向)", "latency vs output length (red = autoregressive, green = single forward)")}</div>
        <svg viewBox="0 0 300 150" width="100%" style={{ display: "block" }}>
          <line x1={P} y1={150 - P} x2={W - P} y2={150 - P} stroke="var(--hairline-strong)" />
          <path d={curve.map((c, i) => `${i ? "L" : "M"}${X(c.o).toFixed(1)},${Y(c.ar).toFixed(1)}`).join(" ")} fill="none" stroke="var(--bad)" strokeWidth="2" />
          <path d={curve.map((c, i) => `${i ? "L" : "M"}${X(c.o).toFixed(1)},${Y(c.so).toFixed(1)}`).join(" ")} fill="none" stroke="var(--ok)" strokeWidth="2" />
          <line x1={X(outTok)} y1={P} x2={X(outTok)} y2={150 - P} stroke="var(--accent)" strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("自回归延迟", "autoregressive")} value={ms(arLat)} tone="bad" hint={`${h.l} · ${outTok} tok`} />
        <Kpi label={L("一次前向", "single forward")} value={ms(soLat)} tone="ok" hint={h.l} />
        <Kpi label={L("加速比", "speed-up")} value={`${nf(ratio, 1)}×`} tone="acc" />
      </div>
      <Note mark="=">
        {L(`一次前向的延迟只取决于输入,与答案长度无关,因为答案没有长度。本书实测:CPU 上英文 checkpoint 三问一次前向热态 ${MEASURED.latWarm} ms,多语言单问中位 ${MEASURED.latMed} ms。`,
           `Single-forward latency depends only on the input, not the answer's length, because the answer has none. Measured here: on CPU the English checkpoint answers three questions in one warm pass in ${MEASURED.latWarm} ms; multilingual single-question median ${MEASURED.latMed} ms.`)}
      </Note>
    </div>
  );
}

/* =========================================================
   Module II · JV — Jev 本体
   ========================================================= */

/* t4 · apiLab — build a /v1/systemone request, see the response */
function ApiViz() {
  const L = useL();
  const [nQ, setNQ] = React.useState(3);
  const [nOpt, setNOpt] = React.useState(4);
  const [descKey, setDescKey] = React.useState(true);
  const state = { from: "user@acme.com", subject: "Duplicate charge on #4411", body: "billed twice, refund or we cancel" };
  const qNames = ["department", "urgency", "churn_risk", "refund", "language", "sentiment"].slice(0, nQ);
  const req = { state, questions: {} };
  qNames.forEach((q, i) => {
    req.questions[q] = i === 1 ? { type: "score", instructions: "how urgent?", criteria: ["low", "soon", "critical"] }
      : i >= 2 ? { type: "noul", instructions: `does the user ${q}?` }
      : { type: "choice", instructions: "which team?", criteria: descKey
          ? Object.fromEntries(["billing", "technical", "sales", "other"].slice(0, nOpt).map((k, j) => [k, ["invoices, refunds", "bugs, outages", "pricing", "everything else"][j]]))
          : Object.fromEntries(["billing", "technical", "sales", "other"].slice(0, nOpt).map((k) => [k, k])) };
  });
  return (
    <div>
      <VizHead idx="JV1" title={L("构造一个 /v1/systemone 请求", "Build a /v1/systemone request")} />
      <div className="viz-ctrl">
        <Slider label={L("问题数", "questions")} min={1} max={6} step={1} value={nQ} onChange={setNQ} />
        <Slider label={L("choice 选项数", "choice options")} min={2} max={4} step={1} value={nOpt} onChange={setNOpt} />
        <Toggle label={L("criteria 写描述(而非只写键)", "criteria has descriptions")} value={descKey} onChange={setDescKey} />
      </div>
      <pre className="jv-code-inline" style={{ marginTop: 10, maxHeight: 210, overflow: "auto", background: "var(--surface-2)", padding: 12, borderRadius: 8, font: "500 11px var(--f-mono)", color: "var(--ink)" }}>
        POST /v1/systemone{"\n"}{JSON.stringify(req, null, 2)}
      </pre>
      <div className="jv-kpi-grid">
        <Kpi label={L("按名字取答案", "answers by name")} value={nQ} tone="acc" hint={L("questions 是字典", "questions is a dict")} />
        <Kpi label={L("模型读的是", "the model reads")} value={descKey ? L("描述", "descriptions") : L("键名", "keys")} tone={descKey ? "ok" : "bad"}
          hint={descKey ? L("准确率上限", "accuracy ceiling") : L("准确率下限", "accuracy floor")} />
        <Kpi label={L("output 计费", "output billing")} value={L("免费", "free")} tone="ok" />
      </div>
      <Note mark="!" tone={descKey ? "" : "bad"}>
        {descKey ? L("键(billing / technical…)是你的程序拿去 switch 的标识符;描述才是模型判断的依据。这条区别在后面的实测里反复出现。",
                     "The keys (billing, technical…) are identifiers your program switches on; the descriptions are what the model judges by. That distinction returns throughout the measurements.")
                 : L("现在 criteria 只有键没有描述——模型只能靠键名的字面猜。这就是本书实测里把准确率压到下限的做法。",
                     "criteria now carries keys with no descriptions — the model can only guess from the literal key. This is exactly how the book's measurements hit the accuracy floor.")}
      </Note>
    </div>
  );
}

/* t5 · costLab — free output → speculative fan-out */
function CostViz() {
  const L = useL();
  const [stateTok, setStateTok] = React.useState(200);
  const [nQ, setNQ] = React.useState(8);
  const [calls, setCalls] = React.useState(1_000_000);
  const PRICE = 0.042 / 1e6;                 // $ per input token
  // on-demand: pay state once PER question call.  fan-out: pay state once for all.
  const onDemand = calls * nQ * stateTok * PRICE;
  const fanout = calls * (stateTok + nQ * 6) * PRICE;   // questions add a few tokens each
  const save = onDemand - fanout;
  return (
    <div>
      <VizHead idx="JV2" title={L("输出免费:一次问完 vs 按需多次", "Free output: ask-it-all vs on-demand")} />
      <div className="viz-ctrl">
        <Slider label={L("state 长度 (token)", "state length (tok)")} min={20} max={2000} step={20} value={stateTok} onChange={setStateTok} />
        <Slider label={L("每条数据的问题数", "questions per record")} min={1} max={20} step={1} value={nQ} onChange={setNQ} />
        <Slider label={L("月调用量", "calls / month")} min={100_000} max={10_000_000} step={100_000} value={calls} onChange={setCalls}
          fmt={(v) => `${nf(v / 1e6, 1)}M`} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("按需多次", "on demand")} value={`$${nf(onDemand, 0)}`} tone="bad" hint={L("每问重付一遍 state", "state paid per question")} />
        <Kpi label={L("一次扇出", "one fan-out")} value={`$${nf(fanout, 0)}`} tone="ok" hint={L("state 只付一次", "state paid once")} />
        <Kpi label={L("月省", "saved / month")} value={`$${nf(save, 0)}`} tone="acc" />
      </div>
      <div style={{ marginTop: 8 }}>
        <Bar label={L("按需", "on demand")} value={onDemand} max={onDemand || 1} tone="bad" valText={`$${nf(onDemand, 0)}`} />
        <Bar label={L("扇出", "fan-out")} value={fanout} max={onDemand || 1} tone="ok" valText={`$${nf(fanout, 0)}`} />
      </div>
      <Note mark="$">
        {L("按输入计费、输出免费,意味着真正花钱的是你送进去多少 state,而 state 在一次扇出里是共享的。往一个 choice 里多加选项、一次多问几个问题,几乎不加钱。",
           "Input-billed with free output means what you pay for is how much state you send, and one fan-out shares it. More options on a choice, more questions in a call — almost free.")}
      </Note>
    </div>
  );
}

/* t6 · claimLab — decompose a vendor benchmark number */
function ClaimViz() {
  const L = useL();
  const [labels, setLabels] = React.useState(4);
  const [lang, setLang] = React.useState("en");
  // A rough model of where a public benchmark lands as label cardinality grows.
  const jev = clamp(0.97 - 0.0012 * labels, 0.83, 0.97);
  const encoder = clamp(0.9 - 0.0075 * labels - (lang === "zh" ? 0.18 : 0), 0.30, 0.9);
  const near = labels <= 5 ? "v2 (low-card)" : labels <= 30 ? "MASSIVE" : "Banking77";
  return (
    <div>
      <VizHead idx="JV3" title={L("把一个宣传数字还原成条件", "Reduce a headline number to its conditions")} />
      <div className="viz-ctrl">
        <Slider label={L("你的标签数", "your label count")} min={2} max={77} step={1} value={labels} onChange={setLabels} />
        <Seg value={lang} onChange={setLang} options={[{ v: "en", l: L("英文", "English") }, { v: "zh", l: L("中文", "Chinese") }]} />
      </div>
      <div style={{ marginTop: 10 }}>
        <Bar label={L("Jev(高基数仍强)", "Jev (holds on high-card)")} value={jev} max={1} tone="acc" valText={nf(jev, 3)} />
        <Bar label={L("开源编码器派", "open encoder camp")} value={encoder} max={1} tone={encoder < 0.5 ? "bad" : "warn"} valText={nf(encoder, 3)} />
        <Bar label={L("随机基线", "random baseline")} value={1 / labels} max={1} tone="mut" valText={nf(1 / labels, 3)} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("最接近的公开基准", "nearest public benchmark")} value={near} tone="acc" />
        <Kpi label={L("Jev 对编码器的领先", "Jev − encoder gap")} value={`+${nf((jev - encoder) * 100, 0)}`} tone="warn" hint={L("标签越多差距越大", "grows with labels")} />
        <Kpi label={L("外推不确定性", "extrapolation risk")} value={labels > 30 ? L("高", "high") : L("中", "moderate")} tone={labels > 30 ? "bad" : "warn"} />
      </div>
      <Note mark="?">
        {L("任何供应商基准只能用来排序候选模型,不能用来承诺你的准确率。唯一能承诺你准确率的,是你自己那份标注数据——那是第六个模块要教的事。",
           "A vendor benchmark can rank candidates; it cannot promise your accuracy. The only thing that can is your own labelled data — which is what module VI teaches.")}
      </Note>
    </div>
  );
}

/* =========================================================
   Module III · CA — 概率与校准
   ========================================================= */

/* t7 · calibLab — reliability diagram, ECE, Brier, live */
function CalibViz() {
  const L = useL();
  const [skill, setSkill] = React.useState(0.6);
  const [overconf, setOverconf] = React.useState(1.8);
  const items = React.useMemo(() => makeEval(4, 500, skill, overconf, 7), [skill, overconf]);
  const conf = items.map((it) => it.conf), correct = items.map((it) => it.correct);
  const acc = correct.reduce((a, b) => a + b, 0) / items.length;
  const eceV = ece(conf, correct);
  const brier = items.reduce((s, it) => s + it.p.reduce((a, x, j) => a + (x - (j === it.gold ? 1 : 0)) ** 2, 0), 0) / items.length;
  // bins for the reliability diagram
  const pts = [];
  for (let b = 0; b < 10; b++) {
    const lo = b / 10, hi = (b + 1) / 10;
    const idx = conf.map((c, i) => (c > lo || b === 0) && c <= hi ? i : -1).filter((i) => i >= 0);
    pts.push({ conf: idx.length ? idx.reduce((s, i) => s + conf[i], 0) / idx.length : 0, acc: idx.length ? idx.reduce((s, i) => s + correct[i], 0) / idx.length : 0, n: idx.length });
  }
  return (
    <div>
      <VizHead idx="CA1" title={L("可靠性图:置信度对着准确率画,对角线是完美校准", "Reliability: confidence against accuracy, the diagonal is perfect")} />
      <div className="viz-ctrl">
        <Slider label={L("模型真实能力", "true skill")} min={0} max={1.4} step={0.05} value={skill} onChange={setSkill} />
        <Slider label={L("过度自信旋钮", "overconfidence knob")} min={0.6} max={3.5} step={0.1} value={overconf} onChange={setOverconf} />
      </div>
      <Reliability pts={pts} />
      <div className="jv-kpi-grid">
        <Kpi label={L("准确率", "accuracy")} value={nf(acc, 3)} tone="acc" />
        <Kpi label="ECE" value={nf(eceV, 3)} tone={eceV > 0.1 ? "bad" : "ok"} hint={L("越低越好", "lower is better")} />
        <Kpi label="Brier" value={nf(brier, 3)} tone="warn" hint={L("同时罚不准和不校准", "punishes both")} />
        <Kpi label={L("曲线位置", "curve sits")} value={overconf > 1.2 ? L("对角线下方", "below diagonal") : L("接近对角线", "near diagonal")} tone={overconf > 1.2 ? "bad" : "ok"} />
      </div>
      <Note mark="!">
        {L("准确率、置信度、校准是三个不同的东西。一个 70% 准确但完美校准的模型,比一个 85% 准确但永远报 0.99 的模型有用——前者你能按确定程度分流。",
           "Accuracy, confidence and calibration are three different things. A 70%-accurate but perfectly calibrated model beats an 85%-accurate one that always says 0.99 — the first can be routed by certainty.")}
      </Note>
    </div>
  );
}

/* t8 · tempLab — one scalar, ECE moves, accuracy does not */
function TempViz() {
  const L = useL();
  const [T, setT] = React.useState(1.0);
  const items = React.useMemo(() => makeEval(6, 600, 0.6, 2.2, 11), []);
  const half = items.length / 2;
  const fitOn = items.slice(0, half), reportOn = items.slice(half);
  const bestT = React.useMemo(() => fitTemp(fitOn.map((it) => it.logits), fitOn.map((it) => it.gold)), []);
  const scaled = reportOn.map((it) => softmax(it.logits, T));
  const conf = scaled.map((p) => Math.max(...p));
  const tops = scaled.map((p) => { let t = 0; for (let j = 1; j < p.length; j++) if (p[j] > p[t]) t = j; return t; });
  const correct = reportOn.map((it, i) => (tops[i] === it.gold ? 1 : 0));
  const acc = correct.reduce((a, b) => a + b, 0) / reportOn.length;
  const eceV = ece(conf, correct);
  const eceRaw = ece(reportOn.map((it) => Math.max(...softmax(it.logits, 1))), correct);
  return (
    <div>
      <VizHead idx="CA2" title={L("温度缩放:改概率,不改排序", "Temperature scaling: changes probabilities, not ranking")} />
      <div className="viz-ctrl">
        <Slider label={L("温度 T", "temperature T")} min={0.5} max={5} step={0.05} value={T} onChange={setT} />
        <button className="jv-minibtn" onClick={() => setT(bestT)}>{L(`跳到拟合值 T=${bestT}`, `jump to fitted T=${bestT}`)}</button>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("准确率(T 无关)", "accuracy (T-invariant)")} value={nf(acc, 3)} tone="acc" hint={L("拖 T 它不动", "drag T — it does not move")} />
        <Kpi label="ECE @ T=1" value={nf(eceRaw, 3)} tone="bad" />
        <Kpi label={`ECE @ T=${nf(T, 2)}`} value={nf(eceV, 3)} tone={eceV < eceRaw ? "ok" : "warn"} />
        <Kpi label={L("留出集拟合值", "held-out fit")} value={bestT} tone="acc" hint={L("在前一半拟合", "fitted on first half")} />
      </div>
      <Note mark="=">
        {L(`T 除在 logits 上,argmax 不变,所以准确率一个点都不动。本书实测:Laya 英文 checkpoint 平均 ECE 0.466 → 0.081(温度后)。反例:出厂的 choice:11+ 桶是 0.1006,把 0.24 放大成 0.99,库自己加了 TEMP_MIN=0.5 拒绝它。`,
           `T divides the logits, the argmax is untouched, so accuracy does not move by a point. Measured for Laya's English checkpoint: mean ECE 0.466 → 0.081 after fitting. Counter-example: the shipped choice:11+ bucket is 0.1006, inflating 0.24 to 0.99 — the library added TEMP_MIN=0.5 to refuse it.`)}
      </Note>
    </div>
  );
}

/* t9 · gateLab — threshold, coverage, precision, net gain (the real run) */
function GateViz() {
  const L = useL();
  const [thr, setThr] = React.useState(0.7);
  const [saveEach, setSaveEach] = React.useState(0.8);   // $ saved per automated item
  const [missCost, setMissCost] = React.useState(6);     // $ cost of an automated error
  // interpolate the measured gate table at the chosen threshold
  const g = MEASURED.gate;
  let row = g[0]; for (const r of g) if (thr >= r[0]) row = r;
  const [, cov, prec] = row;
  const perDay = 2000;
  const auto = perDay * cov, wrong = auto * (1 - prec);
  const net = auto * prec * saveEach - wrong * missCost;
  return (
    <div>
      <VizHead idx="CA3" title={L("门槛 → 覆盖率 → 精度 → 净收益(本书实测曲线)", "Threshold → coverage → precision → net gain (the measured curve)")} />
      <div className="viz-ctrl">
        <Slider label={L("置信度门槛", "confidence threshold")} min={0.5} max={0.95} step={0.05} value={thr} onChange={setThr} />
        <Slider label={L("自动处理每条省($)", "$ saved / automated")} min={0.1} max={3} step={0.1} value={saveEach} onChange={setSaveEach} />
        <Slider label={L("放过一个错误赔($)", "$ per missed error")} min={1} max={40} step={1} value={missCost} onChange={setMissCost} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("自动处理率(覆盖)", "automation rate")} value={pct1(cov)} tone="acc" />
        <Kpi label={L("这部分精度", "precision of that")} value={nf(prec, 3)} tone={prec > 0.7 ? "ok" : "warn"} />
        <Kpi label={L("日净收益", "net gain / day")} value={`$${nf(net, 0)}`} tone={net > 0 ? "ok" : "bad"} />
        <Kpi label={L("转人工量", "to fallback")} value={nf(perDay * (1 - cov), 0)} tone="mut" hint={L("兜底容量够吗", "enough fallback?")} />
      </div>
      <Note mark="✗" tone="bad">
        {L("这条曲线判了 Laya 在这份数据上的死刑:门槛从 0.50 拉到 0.95,覆盖率从 56.5% 砍到 20.8%,精度只从 0.623 爬到 0.689。置信度几乎不区分对错——而这正是整个范式的卖点。",
           "This curve condemned Laya on this data: from 0.50 to 0.95 the threshold cut coverage from 56.5% to 20.8% for a precision rise of 0.623 to 0.689. Confidence barely separates right from wrong — and that separation was the entire pitch.")}
      </Note>
    </div>
  );
}

window.__JV_VIZ_1 = {
  pipeLab: PipeViz, primLab: PrimViz, latencyLab: LatencyViz,
  apiLab: ApiViz, costLab: CostViz, claimLab: ClaimViz,
  calibLab: CalibViz, tempLab: TempViz, gateLab: GateViz,
};
