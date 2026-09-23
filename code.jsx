/* =========================================================
   code.jsx — <CodeLab> + the listings for t1–t12.
   Every chapter ships three angles: a runnable Python
   implementation, the request/config that decides behaviour,
   and the shell that touches the real world (serve, eval).
   Sources are ordinary template literals — never a bare
   dollar-brace or a stray backslash inside one. code2.jsx
   extends CODE for t13–t24.
   ========================================================= */

const KW = {
  py: "def class return if elif else for while in is not and or None True False import from as with try except finally raise lambda yield async await global nonlocal pass break continue assert del self print len range int float str dict list set bool open round sum max min sorted enumerate zip map filter",
  json: "true false null",
  sh: "if then else fi for do done while case esac function echo export local return curl python pip git set source nohup uvicorn laya-serve jq",
  txt: "",
};
const CODE_RE = {
  py: /(#[^\n]*)|("""[\s\S]*?"""|"(?:[^"\n])*"|'(?:[^'\n])*')|(\b\d[\w.]*)|(@?[A-Za-z_][A-Za-z0-9_]*)/g,
  json: /(\/\/[^\n]*)|("(?:[^"\n])*")|(\b\d[\w.]*)|([A-Za-z_][A-Za-z0-9_]*)/g,
  sh: /(#[^\n]*)|("(?:[^"\n])*"|'(?:[^'\n])*')|(\b\d[\w.]*)|([A-Za-z_][A-Za-z0-9_-]*)/g,
  txt: /(#[^\n]*)|("(?:[^"\n])*")|(\b\d[\w.]*)|([A-Za-z_][A-Za-z0-9_]*)/g,
};
const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function highlight(src, k) {
  const re = CODE_RE[k] || CODE_RE.py;
  const kws = new Set((KW[k] || "").split(/\s+/).filter(Boolean));
  re.lastIndex = 0;
  let out = "", last = 0, m;
  while ((m = re.exec(src)) !== null) {
    out += escHtml(src.slice(last, m.index));
    if (m[1]) out += `<span class="cm">${escHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="st">${escHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="nu">${escHtml(m[3])}</span>`;
    else if (m[4]) {
      const w = m[4], isKw = kws.has(w) || (k === "py" && w[0] === "@");
      out += isKw ? `<span class="kw">${escHtml(w)}</span>` : escHtml(w);
    }
    last = m.index + m[0].length;
  }
  out += escHtml(src.slice(last));
  return out;
}

const CodeLab = ({ id }) => {
  const t = useT();
  const lang = useLang();
  const entry = CODE[id];
  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => { setTab(0); }, [id]);
  if (!entry) return null;
  const cur = entry.tabs[Math.min(tab, entry.tabs.length - 1)];
  const copy = () => {
    try { navigator.clipboard.writeText(cur.src); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch (e) { /* no clipboard */ }
  };
  return (
    <div className="jv-code-lab">
      <div className="cl-head">
        {entry.tabs.map((x, i) => <button key={i} className={`jv-tab ${i === tab ? "on" : ""}`} onClick={() => setTab(i)}>{x.lang}</button>)}
        <span className="cl-file">{cur.file}</span>
        <button className={`cl-copy ${copied ? "done" : ""}`} onClick={copy}>{copied ? t("copied_btn") : t("copy_btn")}</button>
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: highlight(cur.src, cur.k) }} /></pre>
      {cur.run ? <div className="cl-run">{cur.run}</div> : null}
      {entry.note ? <div className="cl-note">{pick(lang, entry.note)}</div> : null}
    </div>
  );
};

const CODE = {};
const PY = "Python", REQ = "请求 / request", OPS = "部署评测 / run";

/* ============ SO1 · t1 ============ */
CODE.t1 = {
  note: { zh: "两条流水线放在一起。左边生成 JSON 再解析,要处理截断、字段漂移、拼错和重试;右边一次调用拿到枚举和概率。同一个工单,代码量和失败面差一个数量级。",
          en: "Both pipelines together. Generate-then-parse must handle truncation, drift, misspelling and retries; the decision call returns an enum and a probability in one shot. Same ticket, an order of magnitude less code and less failure surface." },
  tabs: [
    { lang: PY, k: "py", file: "two_pipelines.py", run: "# python two_pipelines.py",
      src: `"""The same routing decision, two ways."""
import json

TICKET = {"body": "billed twice, refund or we cancel"}

# --- generate-then-parse: the pattern we tolerated for three years ---
def via_llm(client):
    prompt = ("Return JSON {\\"dept\\": one of billing|technical|sales}. "
              f"Ticket: {TICKET['body']}")
    for attempt in range(3):                 # retries ARE the failure handling
        text = client.complete(prompt)
        try:
            obj = json.loads(text)           # can raise: truncated / invalid
        except json.JSONDecodeError:
            continue
        dept = obj.get("dept")               # can be None: field drifted
        if dept in {"billing", "technical", "sales"}:
            return dept                      # still no probability attached
    raise RuntimeError("no valid answer in 3 tries")

# --- return-the-decision: one forward pass, typed, calibrated ---
def via_systemone(agent):
    ans = agent.predict(TICKET, {"dept": {
        "type": "choice", "instructions": "which team?",
        "criteria": {"billing": "refunds", "technical": "bugs", "sales": "pricing"}}})
    a = ans["answers"]["dept"]
    return a["choice"], a["confidence"]      # enum AND a number to route on` },
    { lang: REQ, k: "json", file: "request.json", run: "# POST /v1/systemone",
      src: `{
  "state": { "body": "billed twice, refund or we cancel" },
  "questions": {
    "dept": {
      "type": "choice",
      "instructions": "which team should handle this?",
      "criteria": {
        "billing": "invoices, payments, refunds",
        "technical": "bugs, outages, system errors",
        "sales": "pricing, new contracts"
      }
    }
  }
}` },
    { lang: OPS, k: "sh", file: "compare.sh", run: "# measure both paths",
      src: `# time the parse pipeline (note the retry tail on failures)
python -c "from two_pipelines import *; import time"

# the decision call returns usage with output_tokens=0 — nothing was generated
curl -s localhost:8000/v1/systemone -d @request.json | jq '.usage'
# { "input_tokens": 34, "output_tokens": 0 }` },
  ],
};

/* ============ SO2 · t2 ============ */
CODE.t2 = {
  note: { zh: "三个原语各自的读法。choice 拿整个分布,score 是有序期望且不确定性藏在形状里,noul 的数值本身就是概率。注意 confidence 不是概率——见校准一章。",
          en: "How to read each primitive. choice gives the whole distribution; score is an ordinal expectation whose uncertainty hides in the shape; noul's value is itself the probability. Note confidence is not a probability — see the calibration chapter." },
  tabs: [
    { lang: PY, k: "py", file: "primitives.py", run: "# python primitives.py",
      src: `import laya
agent = laya.load("convaiinnovations/laya")

qs = {
    "dept":   {"type": "choice", "instructions": "which team?",
               "criteria": {"billing": "refunds", "tech": "bugs", "sales": "pricing"}},
    "urgency":{"type": "score",  "instructions": "how urgent?",
               "criteria": ["low", "soon", "critical"]},
    "refund": {"type": "noul",   "instructions": "does the user want a refund?"},
}
a = agent.predict({"body": "billed twice, refund please"}, qs)["answers"]

# choice: the whole distribution, plus the argmax
print(a["dept"]["choice"], a["dept"]["probabilities"])
# score: an ordinal expectation in [0, k-1]; a bimodal shape can land between
print(a["urgency"]["score"], a["urgency"]["probabilities"])
# noul: the number IS P(true)
print(a["refund"]["noul"])
# confidence is normalized entropy, NOT a probability — do not feed it to ECE
print(a["dept"]["confidence"])` },
    { lang: REQ, k: "json", file: "answers.json",
      src: `{
  "dept":   { "choice": "billing", "probabilities": {"billing": 0.94, "tech": 0.03, "sales": 0.03},
              "confidence": 0.86 },
  "urgency":{ "score": 1.84, "probabilities": {"0": 0.05, "1": 0.06, "2": 0.89} },
  "refund": { "noul": 0.91, "confidence": 0.91 }
}` },
    { lang: OPS, k: "sh", file: "k_matters.sh",
      src: `# the random baseline depends on k — never carry one threshold between tasks
python - <<'PY'
for k in (2, 4, 18, 77):
    print(f"k={k:2d}  random={1/k:.3f}  entropy_ceiling={__import__('math').log(k):.2f}")
PY
# k= 2  random=0.500 ...   k=18  random=0.056 ...` },
  ],
};

/* ============ SO3 · t3 ============ */
CODE.t3 = {
  note: { zh: "把延迟测出来,而不是引用宣传语。冷启动会污染平均值,所以先热身再测,报中位和 P95。本机 CPU 实测:热态三问 976ms,多语言单问 401ms。",
          en: "Measure latency instead of quoting it. Cold starts pollute the mean, so warm up first and report median and P95. Measured on this CPU: 976 ms warm for three questions, 401 ms for one multilingual question." },
  tabs: [
    { lang: PY, k: "py", file: "bench_latency.py", run: "# python bench_latency.py",
      src: `import time, statistics, laya

agent = laya.load("convaiinnovations/laya")
qs = {"dept": {"type": "choice", "instructions": "team?",
               "criteria": {"a": "x", "b": "y", "c": "z"}}}
state = {"body": "billed twice, refund please"}

agent.predict(state, qs)                       # warm-up: discard the cold pass
lat = []
for _ in range(50):
    t0 = time.perf_counter()
    agent.predict(state, qs)
    lat.append((time.perf_counter() - t0) * 1000)

lat.sort()
print(f"median {statistics.median(lat):.0f} ms   "
      f"p95 {lat[int(len(lat)*0.95)-1]:.0f} ms")   # NOT the mean` },
    { lang: REQ, k: "json", file: "usage.json",
      src: `// a single forward: output_tokens is always 0, so latency does not
// scale with the answer — it scales only with input length and batch
{ "input_tokens": 34, "output_tokens": 0 }` },
    { lang: OPS, k: "sh", file: "cpu_note.sh",
      src: `# this machine has no GPU. cap threads at the physical core count —
# more threads contend and get SLOWER on CPU inference
export LAYA_THREADS=8
# measured here: 3 questions / 1 warm forward = 976 ms;
# multilingual single 18-option question, median 401 ms, p95 447 ms` },
  ],
};

/* ============ JV1 · t4 ============ */
CODE.t4 = {
  note: { zh: "一个合法的 /v1/systemone 请求。state 不需要 schema;questions 是字典按名字取;criteria 的键给程序 switch,描述给模型。今天可经 Vercel AI Gateway 免排队。",
          en: "A valid /v1/systemone request. state needs no schema; questions is a dict fetched by name; the criteria key is for your switch and the description is for the model. Reachable today via Vercel's AI Gateway with no waitlist." },
  tabs: [
    { lang: PY, k: "py", file: "call_jev.py",
      src: `import os, requests

resp = requests.post(
    "https://api.typesafe.ai/v1/systemone",
    headers={"authorization": f"Bearer {os.environ['JEV_KEY']}"},
    json={
        "model": "jev-latest",
        "state": {"from": "user@acme.com", "body": "billed twice, refund please"},
        "questions": {
            "dept": {"type": "choice", "instructions": "which team?",
                     "criteria": {"billing": "refunds", "tech": "bugs"}},
            "refund": {"type": "noul", "instructions": "does the user want a refund?"},
        },
    },
    timeout=5,
)
a = resp.json()["answers"]
print(a["dept"]["choice"], a["refund"]["noul"])` },
    { lang: REQ, k: "json", file: "keys_vs_descriptions.json",
      src: `{
  "questions": {
    "dept": {
      "type": "choice",
      "instructions": "which team?",
      "criteria": {
        "billing": "invoices, payments, refunds",   // ← the model reads THIS
        "tech":    "bugs, outages, system errors"     //   the key is your switch id
      }
    }
  }
}` },
    { lang: OPS, k: "sh", file: "reach_it.sh",
      src: `# official early access is behind a waitlist; Vercel wired Jev into the
# AI Gateway the day after launch — callable from AI SDK 7's evaluate()
# with no queue. For local work, point at an open server instead:
curl -s localhost:8000/v1/systemone -d @request.json | jq '.answers.dept'` },
  ],
};

/* ============ JV2 · t5 ============ */
CODE.t5 = {
  note: { zh: "输出免费,所以真正花钱的是 state。按需多次每问重付一遍 state;一次扇出只付一次。这段脚本把两种用法的月度账单算出来,交叉点通常出现得很早。",
          en: "Output is free, so what you pay for is the state. On-demand pays for the state per question; one fan-out pays once. This script prices both monthly bills — the crossover comes early." },
  tabs: [
    { lang: PY, k: "py", file: "cost_model.py", run: "# python cost_model.py",
      src: `PRICE = 0.042 / 1e6      # $ per input token, output free

def bills(state_tok, n_questions, calls):
    on_demand = calls * n_questions * state_tok * PRICE   # state paid per q
    fan_out   = calls * (state_tok + n_questions * 6) * PRICE
    return on_demand, fan_out

od, fo = bills(state_tok=200, n_questions=8, calls=1_000_000)
print(f"on-demand \${od:,.0f}   fan-out \${fo:,.0f}   saved \${od-fo:,.0f}")
# on-demand $67   fan-out $9   saved $58  — and the gap widens with volume` },
    { lang: REQ, k: "json", file: "fan_out.json",
      src: `{
  "state": { "email": "…one shared block of state…" },
  "questions": {
    "dept": { "type": "choice", "criteria": { "…": "…" } },
    "urgency": { "type": "score", "criteria": ["low", "soon", "critical"] },
    "churn": { "type": "noul", "instructions": "threatens to leave?" },
    "refund": { "type": "noul", "instructions": "asks for a refund?" },
    "sentiment": { "type": "score", "criteria": ["angry", "neutral", "happy"] }
  }
}` },
    { lang: OPS, k: "sh", file: "when_not.sh",
      src: `# fan-out cannot help when a judgement DEPENDS on a previous answer —
# that is a genuinely multi-turn problem, price it as several calls.
# rule of thumb: ask everything independent in one call, chain only deps.` },
  ],
};

/* ============ JV3 · t6 ============ */
CODE.t6 = {
  note: { zh: "把宣传数字还原成条件。这段脚本用公开基准点插值出「你的任务离哪个基准最近」,并标出外推不确定性。任何供应商基准只能排序候选,不能承诺你的准确率。",
          en: "Reduce a headline number to its conditions. This interpolates which public benchmark your task sits nearest and flags the extrapolation risk. A vendor benchmark ranks candidates; it cannot promise your accuracy." },
  tabs: [
    { lang: PY, k: "py", file: "locate_task.py", run: "# python locate_task.py",
      src: `# public anchor points (label count → reported accuracy)
JEV = {5: 0.96, 20: 0.94, 77: 0.87}
ENC = {5: 0.86, 20: 0.75, 77: 0.42}     # open encoder camp

def nearest(labels):
    if labels <= 5:  return "v2 (low-card)", "moderate"
    if labels <= 30: return "MASSIVE",       "moderate"
    return "Banking77", "high"              # extrapolation risk

bench, risk = nearest(labels=18)
print(f"nearest public benchmark: {bench}   extrapolation risk: {risk}")
print("→ rank candidates on it; DO NOT promise your accuracy from it")` },
    { lang: REQ, k: "json", file: "claims.json",
      src: `{
  "jev_v2_macro": 0.966,
  "jev_banking77": 0.870,
  "latency_ms": "70–500 (end-to-end; width comes from state + net)",
  "note": "every number here is vendor-reported"
}` },
    { lang: OPS, k: "sh", file: "measure_yours.sh",
      src: `# the only number that predicts YOUR accuracy is your own labelled data.
# module VI does exactly this — see laya_check.py, three baselines + ECE.
python laya_check.py yours.csv -c criteria.json -m multilingual` },
  ],
};

/* ============ CA1 · t7 ============ */
CODE.t7 = {
  note: { zh: "校准的三件套:可靠性图、ECE、Brier。关键陷阱——ECE 必须用 top-1 概率,不能用 confidence(Laya 的 confidence 是归一化熵)。这段是本书评测脚本的核心。",
          en: "The calibration trio: reliability diagram, ECE, Brier. The key trap — ECE must use the top-1 probability, not confidence (Laya's confidence is normalized entropy). This is the core of the book's eval script." },
  tabs: [
    { lang: PY, k: "py", file: "calibration.py", run: "# from laya_check import ece",
      src: `import math

def ece(conf, correct, bins=10):
    """Expected Calibration Error on the TOP-1 probability (not confidence)."""
    n = len(conf); total = 0.0
    for b in range(bins):
        lo, hi = b / bins, (b + 1) / bins
        idx = [i for i, c in enumerate(conf) if (c > lo or b == 0) and c <= hi]
        if not idx: continue
        acc  = sum(correct[i] for i in idx) / len(idx)
        cf   = sum(conf[i]    for i in idx) / len(idx)
        total += len(idx) / n * abs(acc - cf)
    return total

def brier(prob_rows, gold):
    return sum(sum((p - (j == g)) ** 2 for j, p in enumerate(row))
               for row, g in zip(prob_rows, gold)) / len(gold)` },
    { lang: REQ, k: "json", file: "confidence_is_entropy.json",
      src: `// laya/common.py:210 — the 'confidence' field is normalized entropy:
//     1 - H(p) / log(k)
// It measures how peaked the distribution is, NOT P(correct).
// Feed max(probabilities) to ece(), never confidence.
{ "choice": "billing", "probabilities": {"billing": 0.62, "tech": 0.38},
  "confidence": 0.04 }   // ← 0.04 is entropy-derived, not a probability` },
    { lang: OPS, k: "sh", file: "run_eval.sh",
      src: `python laya_check.py jiayue.csv -c criteria.json -m multilingual
# accuracy 0.505   ECE(raw, top-1 prob) 0.215   ECE(T=1.65) 0.141` },
  ],
};

/* ============ CA2 · t8 ============ */
CODE.t8 = {
  note: { zh: "温度缩放:一维网格搜索最小化 NLL,区间和 Laya 的运行时 clamp 一致。必须在留出集上拟合。改概率不改排序,所以准确率不动。",
          en: "Temperature scaling: a one-dimensional grid search minimising NLL over the same clamp Laya uses at runtime. Fit on held-out data. It changes probabilities, not ranking, so accuracy does not move." },
  tabs: [
    { lang: PY, k: "py", file: "fit_temperature.py",
      src: `import math

def softmax(z, T=1.0):
    m = max(z); e = [math.exp((x - m) / T) for x in z]; s = sum(e)
    return [x / s for x in e]

def fit_temperature(logprobs, gold):
    """Grid-search T in [0.5, 5.0] — Laya's own runtime clamp."""
    best_nll, best_T = float("inf"), 1.0
    T = 0.5
    while T <= 5.0001:
        nll = -sum(math.log(max(softmax(lp, T)[g], 1e-12))
                   for lp, g in zip(logprobs, gold))
        if nll < best_nll: best_nll, best_T = nll, T
        T += 0.05
    return round(best_T, 2)

# fit on the FIRST half, report on the SECOND — overlap is self-deception
half = len(rows) // 2
T = fit_temperature(logprobs[:half], gold[:half])   # e.g. 1.65` },
    { lang: REQ, k: "json", file: "temperature_config.json",
      src: `// a fitted temperature per (question type × option count) bucket.
// counter-example the library refuses: the shipped choice:11+ bucket
{ "choice:2": 1.4, "choice:3-5": 1.55, "choice:6-10": 1.6,
  "choice:11+": 0.1006 }   // ← < TEMP_MIN 0.5, so the runtime ignores it` },
    { lang: OPS, k: "sh", file: "apply.sh",
      src: `# write the fitted T back onto the agent before serving
python - <<'PY'
import laya
agent = laya.load("convaiinnovations/laya", subfolder="multilingual")
agent.temperature["choice"] = 1.65     # from the held-out fit
PY` },
  ],
};

/* ============ CA3 · t9 ============ */
CODE.t9 = {
  note: { zh: "把校准换算成钱:门槛-覆盖率-精度表,加一个成本模型。这段直接输出本书实测那张判死刑的表:门槛拉满,精度几乎不动。",
          en: "Convert calibration into money: the threshold-coverage-precision table plus a cost model. This prints the very table that condemned the run — the threshold maxes out and precision barely moves." },
  tabs: [
    { lang: PY, k: "py", file: "gate.py", run: "# python gate.py",
      src: `def gate_table(conf, correct, cuts=(0.5, 0.7, 0.9, 0.95)):
    n = len(conf)
    for c in cuts:
        idx  = [i for i, v in enumerate(conf) if v >= c]
        cov  = len(idx) / n
        prec = sum(correct[i] for i in idx) / len(idx) if idx else float("nan")
        print(f"thr {c:.2f}   coverage {cov:5.1%}   precision {prec:.3f}")

# measured on the real run:
# thr 0.50   coverage 56.5%   precision 0.623
# thr 0.95   coverage 20.8%   precision 0.689   ← 2/3 of coverage for +0.066` },
    { lang: REQ, k: "json", file: "operating_point.json",
      src: `{
  "threshold": 0.90,
  "automation_rate": 0.292,
  "precision_of_automated": 0.651,
  "verdict": "confidence does not separate right from wrong here — gating fails"
}` },
    { lang: OPS, k: "sh", file: "net_gain.sh",
      src: `# pick the threshold that maximises: auto*prec*save - wrong*miss_cost
# if no threshold gives a positive net gain, this model cannot ship here.
python - <<'PY'
for thr, cov, prec in [(0.5,0.565,0.623),(0.9,0.292,0.651),(0.95,0.208,0.689)]:
    per_day = 2000; auto = per_day*cov; wrong = auto*(1-prec)
    print(thr, round(auto*prec*0.8 - wrong*6))
PY` },
  ],
};

/* ============ LY1 · t10 ============ */
CODE.t10 = {
  note: { zh: "路由:先脚本/语言检测再派 checkpoint。中文必须走多语言支;英文 checkpoint 在非拉丁文字上会崩。短文本无语言信号会落到 default,流量非英文就把 default 改掉。",
          en: "Routing: detect script/language, then dispatch. Chinese must go multilingual; the English checkpoint collapses on non-Latin. Short text with no language signal falls to default — change it if traffic isn't English." },
  tabs: [
    { lang: PY, k: "py", file: "router.py",
      src: `from laya import Router

# if most of your traffic is not English, set the default branch
router = Router(preload=True, default="multilingual")

state = {"body": "客户被重复扣款,请退款"}
print(router.route(state).model)     # -> multilingual  (non-Latin: han)
print(router.route(state).reason)    # -> "non-Latin script (han); the English
                                     #     checkpoint cannot read it"

res = router.predict(state, {"dept": {"type": "choice",
      "instructions": "哪个部门?", "criteria": {"billing": "退款", "tech": "故障"}}})
print(res["answers"]["dept"]["choice"], res["routing"]["model"])` },
    { lang: REQ, k: "json", file: "routing.json",
      src: `{
  "routing": {
    "model": "multilingual",
    "repo": "convaiinnovations/laya/multilingual",
    "reason": "non-Latin script (han, 100% of letters)"
  }
}
// the English checkpoint on Khmer: accuracy 0.000 at confidence 0.952` },
    { lang: OPS, k: "sh", file: "serve_multi.sh",
      src: `# preload only the checkpoints you serve to save memory
LAYA_MODELS=multilingual LAYA_PRELOAD=1 laya-serve
# a short Latin phrase ('refund please') carries no language signal and
# falls to default — keep default=multilingual if you serve mixed traffic` },
  ],
};

/* ============ LY2 · t11 ============ */
CODE.t11 = {
  note: { zh: "选项和正文抢 token。标签多时调大 head_max_len,或用 predict_shortlist 先召回 top-k。但本书实测:18 标签下加预算准确率不动、P95 却翻几倍——先确认标签是不是本身重叠。",
          en: "Options compete with the document. Raise head_max_len for many labels, or shortlist a top-k first. But measured here at 18 labels: more budget moved accuracy 0 and multiplied P95 — first check whether the labels themselves overlap." },
  tabs: [
    { lang: PY, k: "py", file: "budget.py",
      src: `import laya
agent = laya.load("convaiinnovations/laya", subfolder="multilingual")

# default head_max_len=256 → at 18 labels, ~13 tokens each (descriptions cut)
print((256 - 16) // 18)          # 13
print((256 - 16) // 77)          # 3   → Banking77 collapses to 0.425

# remedy 1: raise the budget (costs latency — measured p95 447 → 2290 ms)
agent.cfg["head_max_len"] = 512
agent.cfg["max_len"] = 1024

# remedy 2: shortlist the top-k labels with embeddings, then one forward pass
res = laya.predict_shortlist(agent, {"text": "charged twice on a transfer"},
        questions, embed_fn=laya.embed_fn_from_agent(agent), k=20)` },
    { lang: REQ, k: "json", file: "shortlist.json",
      src: `{
  "shortlist": { "intent": { "labels": ["transfer_fee", "card_arrival", "..."] } },
  "note": "probabilities are over the k shortlisted labels only"
}` },
    { lang: OPS, k: "sh", file: "ab_budget.sh",
      src: `# the A/B this book ran — accuracy unchanged, latency worse:
python laya_check.py jiayue.csv -c crit.json -m multilingual                    # p95 447ms
python laya_check.py jiayue.csv -c crit.json -m multilingual --head-max-len 1024 # p95 2290ms
# both: accuracy 0.505 — budget was necessary for collapse, not sufficient` },
  ],
};

/* ============ LY3 · t12 ============ */
CODE.t12 = {
  note: { zh: "Laya 的诚实清单,做成可复现检查。每个 noul 用二选一 choice 交叉验证;score 路由到英文;gate 用 confidence 不用 act_probability;别信 choice:11+ 的出厂温度。",
          en: "Laya's honest list as reproducible checks. Cross-check every noul with a two-option choice; route score to English; gate on confidence not act_probability; distrust the shipped choice:11+ temperature." },
  tabs: [
    { lang: PY, k: "py", file: "honest_checks.py",
      src: `# #156 — noul follows its false:/true: labels on the English checkpoint.
# cross-check every noul with a neutral two-option choice:
noul_q   = {"q": {"type": "noul", "instructions": "is this review positive?"}}
choice_q = {"q": {"type": "choice", "instructions": "is this review positive?",
                  "criteria": {"A": "yes, positive", "B": "no, negative"}}}
n = agent.predict(state, noul_q)["answers"]["q"]["noul"]
c = agent.predict(state, choice_q)["answers"]["q"]
assert (n > 0.5) == (c["choice"] == "A"), "noul disagrees — use the choice form"

# #185 — act_probability reads ~1.0 for everything (AUROC 0.30). gate on
# confidence instead (AUROC 0.77):
dept = agent.predict(state, dept_q)["answers"]["dept"]
if dept["confidence"] >= 0.85: auto(dept["choice"])
else: escalate(dept["choice"])` },
    { lang: REQ, k: "json", file: "traps.json",
      src: `{
  "#156": "noul renders options as false:/true:; the label pair can dominate",
  "#131": "multilingual score has a position bias; route score to english",
  "#185": "action.act_probability ~ 1.0 for all inputs (AUROC 0.30) — do not gate",
  "choice:11+": "shipped temperature 0.1006 < TEMP_MIN 0.5 → runtime refuses it"
}` },
    { lang: OPS, k: "sh", file: "read_the_source.sh",
      src: `# these traps live in issues and source comments, not the landing page.
grep -n "TEMP_MIN\\|normalized entropy\\|act_probability" $(python -c \\
  "import laya,os;print(os.path.dirname(laya.__file__))")/*.py
# read them BEFORE you ship, not after the first production surprise` },
  ],
};

/* ============ SO4 · t25 ============ */
CODE.t25 = {
  note: { zh: "两种范式并排。Python 那栏把区别讲成代码:自回归是一个 N 次的循环、每步喂回上一个 token;一次前向是读一次分类头。服务那栏是两套完全不同的技术栈。训练那栏是最根本的分界——优化的目标函数不一样。",
          en: "The two paradigms side by side. The Python tab states the difference as code: autoregression is an N-step loop feeding each token back; the single forward reads a classification head once. The serving tab is two entirely different stacks. The training tab is the deepest divide — the objective being optimised is not the same." },
  tabs: [
    { lang: PY, k: "py", file: "two_paradigms.py",
      src: `# --- ChatGPT: autoregressive. N sequential passes, KV cache grows. ---
def generate(model, prompt, max_new=48):
    ids = tokenize(prompt)
    cache = None
    for _ in range(max_new):                 # N forward passes, one per token
        logits, cache = model(ids[-1:], cache)   # each reads all weights + cache
        nxt = sample(logits[-1])             # a sampling loop
        ids.append(nxt)
        if nxt == EOS: break
    return detokenize(ids)                    # then you still parse JSON out of it

# --- Jev: non-autoregressive. ONE pass, answer read off a head. ---
def decide(encoder, heads, state, questions):
    h = encoder(tokenize(state, questions))  # one bidirectional forward pass
    out = {}
    for name, q in questions.items():        # heads run in parallel, no loop
        logits = heads[q.type](h, q.options) # a classification / regression head
        out[name] = softmax(logits)          # a calibrated distribution, no text
    return out                               # nothing to sample, nothing to parse` },
    { lang: OPS, k: "sh", file: "serving_stacks.sh",
      src: `# ChatGPT-class: a stack built to make autoregression bearable
#   vLLM / TensorRT-LLM  ·  paged KV cache  ·  continuous batching
#   ·  speculative decoding  ·  tensor parallelism across GPUs
vllm serve meta-llama/Llama-3-70B --tensor-parallel-size 8

# Jev-class: there is no autoregression to optimise, so the stack collapses
pip install "laya[serve]"
laya-serve                    # one FastAPI process, constant memory, CPU-ok
# no KV cache to page, batching = several questions in one forward pass` },
    { lang: REQ, k: "json", file: "why_faster.json",
      src: `{
  "speed_is_three_multiplicative_effects": {
    "1_passes":  "N forward passes (one per output token)  vs  1",
    "2_size":    "~10^11-10^12 params  vs  ~10^8 (400M encoder)",
    "3_no_loop": "sampling loop + growing KV cache  vs  none, constant memory"
  },
  "training_objective": {
    "chatgpt": "next-token likelihood, then RLHF",
    "jev":     "a strictly proper scoring rule — optimises CALIBRATED probability"
  },
  "honest_boundary": "Jev internals never published reproducibly; this architecture",
  "_": "is what the open clones (Laya, Von) re-derived. Not a better ChatGPT — a",
  "__": "fast decision head that only answers a predefined answer space."
}` },
  ],
};

window.CODE = CODE;
window.CodeLab = CodeLab;
window.highlight = highlight;
