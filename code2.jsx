/* =========================================================
   code2.jsx — CODE listings for t13–t24. Extends the CODE
   registry defined in code.jsx (loaded after it).
   ========================================================= */

/* ============ OS1 · t13 ============ */
CODE.t13 = {
  note: { zh: "编码器派对比,以及「延迟也是准确率」。Von 自带 /v1/systemone 兼容服务,pip 装上就能顶替 Jev;在高频控制回路里,快而不那么准的模型有效质量反超。",
          en: "The encoder camp compared, and 'latency is accuracy too'. Von ships a /v1/systemone-compatible server and stands in for Jev after one pip install; in a high-frequency loop a fast, less-accurate model's effective quality overtakes." },
  tabs: [
    { lang: PY, k: "py", file: "von_dropin.py",
      src: `# Von: ModernBERT-Large 395M, ~18 ms, ships the Jev wire protocol
import requests

resp = requests.post("http://localhost:8000/v1/systemone", json={
    "state": {"frame": "enemy left, low health"},
    "questions": {"action": {"type": "choice", "instructions": "next move?",
        "criteria": {"fire": "enemy in sight", "dodge": "under threat",
                     "advance": "path clear"}}}})
print(resp.json()["answers"]["action"]["choice"])
# in real-time ViZDoom, Von's 18 ms beats Jev's 115 ms despite lower
# benchmark accuracy: a fast 0.72 outfights a slow 0.97 when the loop
# runs faster than the model can answer` },
    { lang: REQ, k: "json", file: "camp.json",
      src: `{
  "Von":     { "base": "ModernBERT-L 395M", "lat_ms": 18,  "acc": 0.72,  "lic": "Apache-2.0" },
  "Laya":    { "base": "mmBERT 322M",       "lat_ms": 33,  "acc": 0.505, "lic": "Apache-2.0" },
  "Verdict": { "base": "ModernBERT 151M",   "lat_ms": 12,  "acc": 0.771, "lic": "Apache-2.0", "webgpu": true },
  "jeff":    { "base": "GLiFormer 400M",    "classify_only": true,        "lic": "MIT" }
}` },
    { lang: OPS, k: "sh", file: "install.sh",
      src: `pip install von-sdk
von serve --host 0.0.0.0 --port 8000   # exposes /v1/systemone
# repoint any existing Jev client's baseUrl here — nothing else changes` },
  ],
};

/* ============ OS2 · t14 ============ */
CODE.t14 = {
  note: { zh: "LLM 派。Kev 微调 Qwen+LoRA;SemIf 不训练,直接读现有模型选项 token 的 logits——如果你已经在跑 LLM,这是零新增组件的做法。",
          en: "The LLM camp. Kev fine-tunes Qwen+LoRA; SemIf trains nothing and reads the option-token logits of a model you already run — zero new components if an LLM is already in your stack." },
  tabs: [
    { lang: PY, k: "py", file: "semif_logits.py",
      src: `# SemIf's idea: no new model. Read the log-probs the LLM already assigns
# to each option token, then softmax them into a calibrated-ish choice.
import math

def choice_from_logits(llm, state, options):
    """options: {key: description}. Returns (key, distribution)."""
    logps = {}
    for key, desc in options.items():
        # score the option token(s) under the model, conditioned on state
        logps[key] = llm.score(prompt=f"{state}\\nAnswer: ", completion=key)
    m = max(logps.values())
    exp = {k: math.exp(v - m) for k, v in logps.items()}
    z = sum(exp.values())
    dist = {k: v / z for k, v in exp.items()}
    top = max(dist, key=dist.get)
    return top, dist` },
    { lang: REQ, k: "json", file: "llm_camp.json",
      src: `{
  "Kev":     { "base": "Qwen3.5 + LoRA 0.8–9B", "acc": [0.837, 0.852], "api": "aligned to TypeSafe" },
  "SemIf":   { "trains": "nothing", "reads": "option-token logits", "agree": 0.845, "webgpu": true },
  "NanoJev": { "base": "Qwen3 0.6B", "for": "games / control loops" },
  "OpenJev": { "base": "DiffusionGemma 26B-A4B", "needs": "vLLM + VRAM" }
}` },
    { lang: OPS, k: "sh", file: "pick.sh",
      src: `# rule: past ~20 labels, or fine semantic splits, the encoder camp yields.
# if you already run an LLM, try SemIf first — marginal cost near zero.
# only reach for a 26B OpenJev when you actually need its high-card accuracy.` },
  ],
};

/* ============ OS3 · t15 ============ */
CODE.t15 = {
  note: { zh: "四条路到类型化决策。约束解码保证 schema 合法但不给校准概率——这是它和 System One 模型的根本分界。一个任务+有数据,微调几乎总是赢。",
          en: "Four routes to a typed decision. Constrained decoding guarantees a valid schema but no calibrated probability — the dividing line from a System One model. One task with data: fine-tuning almost always wins." },
  tabs: [
    { lang: PY, k: "py", file: "route1_finetune.py",
      src: `# route 1 — fine-tune a classifier when labels are fixed and you have data.
# same latency class as an encoder System One model, but calibration you
# measure yourself, no README to trust.
from setfit import SetFitModel, Trainer     # or a ModernBERT head

model = SetFitModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
Trainer(model=model, train_dataset=train).train()   # a few hundred rows
pred = model.predict_proba(["billed twice, refund please"])  # calibrate this` },
    { lang: REQ, k: "json", file: "route2_constrained.json",
      src: `// route 2 — constrained decoding (Outlines / XGrammar).
// guarantees the SHAPE, gives you no calibrated probability:
{ "dept": "billing" }        // valid enum, but no P(correct) attached
// this is the line: schema-valid  ≠  calibrated. Do not conflate them.` },
    { lang: OPS, k: "sh", file: "route_table.sh",
      src: `# route            calib?  data?  adds  reuse   wins on
# fine-tune          yes     yes    2     low     one task, have data
# constrained        no      no     1     mid     just need valid shape
# read logits (SemIf) part   no     0     mid     already run an LLM
# System One model   yes     no     1     high    MANY tasks, one interface` },
  ],
};

/* ============ EV1 · t16 ============ */
CODE.t16 = {
  note: { zh: "三条基线。任何准确率都必须和随机、多数类、关键词一起出现。关键词规则二十分钟写完,打不过它的模型不该继续。这是评测的第一道闸门。",
          en: "Three baselines. Any accuracy must appear beside random, majority and keyword. The keyword rule takes twenty minutes; a model that cannot beat it should not proceed. This is the first gate." },
  tabs: [
    { lang: PY, k: "py", file: "baselines.py", run: "# python baselines.py",
      src: `import collections

def baselines(rows):
    labels = [r["label"] for r in rows]
    k = len(set(labels))
    counts = collections.Counter(labels)
    random   = 1 / k
    majority = max(counts.values()) / len(rows)
    return random, majority

def keyword_rule(text):
    t = text.lower()
    if any(w in t for w in ("refund", "退款", "charge")): return "billing"
    if any(w in t for w in ("bug", "error", "故障")):     return "technical"
    return "other"

# measured: model 0.505 vs random 0.056, majority 0.120 → learned something.
# but if majority were 0.62, a 0.65 model would have done nothing.` },
    { lang: REQ, k: "json", file: "report_format.json",
      src: `{
  "accuracy": 0.505,
  "baselines": { "random": 0.056, "majority": 0.120, "keyword": 0.42 },
  "verdict": "9x over random — learned; but always report all three baselines"
}` },
    { lang: OPS, k: "sh", file: "gate0.sh",
      src: `# a model that cannot beat the keyword rule should end the project here.
python -c "from baselines import *; print('build a model only if it clears', 0.42)"` },
  ],
};

/* ============ EV2 · t17 ============ */
CODE.t17 = {
  note: { zh: "建评测集的真实做法。从已有层级结构提取标签描述(模型读的是描述);拟合与报告的数据不能重叠;跑模型之前先用人工一致率给标签体系体检。",
          en: "Building the eval set for real. Mine label descriptions from existing structure (the model reads descriptions); the fit and report halves must not overlap; health-check the taxonomy with human agreement before any model runs." },
  tabs: [
    { lang: PY, k: "py", file: "build_set.py",
      src: `import csv, json

# label descriptions from structure you already have (sub-modules, synonyms),
# NOT invented by hand — this is the book's own 216-row set.
rows = list(csv.DictReader(open("requirements.csv", encoding="utf-8-sig")))
criteria = {}
for r in rows:
    criteria.setdefault(r["module"], set()).add(r["submodule"])
criteria = {m: "、".join(sorted(s)) for m, s in criteria.items()}

per_class = len(rows) / len(criteria)     # 216 / 18 = 12
assert per_class < 20, "below 20/class → report OVERALL metrics only"
json.dump(criteria, open("criteria.json", "w"), ensure_ascii=False)` },
    { lang: REQ, k: "json", file: "criteria.json",
      src: `{
  "仓库管理": "基础信息管理、入库管理、出库管理、库存管理",
  "客户计划变更下的原料保障与库存控制": "订单评审看板、成品库存优先覆盖、原料需求换算",
  "质检系统": "检验计划管理、检验执行管理、质检方式"
}
// note: 仓库管理 and 库存控制 overlap — a model cannot fix a taxonomy` },
    { lang: OPS, k: "sh", file: "agreement.sh",
      src: `# before testing a model, label the same batch twice by hand and measure
# inter-annotator agreement. below 0.8 → fix the taxonomy, not the model.
python - <<'PY'
a = ["仓库管理","质检系统","仓库管理"]; b = ["库存控制","质检系统","仓库管理"]
agree = sum(x == y for x, y in zip(a, b)) / len(a)
print("agreement", agree, "→", "OK" if agree >= 0.8 else "fix taxonomy first")
PY` },
  ],
};

/* ============ EV3 · t18 ============ */
CODE.t18 = {
  note: { zh: "读四张表到一个判决。顺序很重要:表一没过就停;表四拉不开精度,前三张再好看也不能上线。本书实测死在表四。",
          en: "Read the four tables to a verdict. Order matters: stop if table 1 fails; if table 4 buys no precision, the first three cannot justify shipping. This run died at table 4." },
  tabs: [
    { lang: PY, k: "py", file: "verdict.py",
      src: `def verdict(beats_baseline, ece_fit, precision_gain_50_to_95):
    if not beats_baseline:
        return "fails baseline → another route, stop reading"
    if precision_gain_50_to_95 < 0.10:
        return "threshold buys no precision → gating fails, do NOT ship"
    if ece_fit > 0.10:
        return "under-calibrated → use for ranking, not as a probability"
    return "ship it (with a threshold and a fallback tier)"

# the book's real run:
print(verdict(beats_baseline=True, ece_fit=0.141,
              precision_gain_50_to_95=0.066))
# -> "threshold buys no precision → gating fails, do NOT ship"` },
    { lang: REQ, k: "json", file: "four_tables.json",
      src: `{
  "t1_accuracy_vs_baselines": "0.505 vs random 0.056, majority 0.120 → learned",
  "t2_latency_median_p95":    "401 / 447 ms  (never the mean — cold starts lie)",
  "t3_ece_pre_post":          "0.215 → 0.141 (T=1.65)  — still > 0.1",
  "t4_precision_gain":        "0.50→0.95 buys only +0.066  → gating fails"
}` },
    { lang: OPS, k: "sh", file: "read_order.sh",
      src: `# read top to bottom, stop at the first failure:
#   T1 fail  → skip T2–T4, take another route
#   T4 fail  → T1–T3 cannot justify shipping
# a pretty T2 mean hides cold starts — always report median and P95` },
  ],
};

/* ============ OP1 · t19 ============ */
CODE.t19 = {
  note: { zh: "自托管:一条 pip、一条命令,暴露 Jev 同协议端点。逐项配置环境变量,预加载避免首个用户吃加载时间,而且默认无鉴权——别直接上公网。",
          en: "Self-hosting: one pip, one command, a Jev-protocol endpoint. Configure the env vars, preload so the first user does not pay the load, and remember there is no auth by default — keep it off the public net." },
  tabs: [
    { lang: OPS, k: "sh", file: "serve.sh", run: "# laya-serve",
      src: `pip install "laya[serve]"

LAYA_DEVICE=cuda \\
LAYA_PRELOAD=1 \\
LAYA_MODELS=english,multilingual \\
LAYA_THREADS=8 \\
LAYA_API_KEY=$SECRET \\
laya-serve                       # binds 0.0.0.0:8000, POST /v1/systemone

curl -s localhost:8000/v1/systemone \\
  -H "authorization: Bearer $SECRET" \\
  -d '{"state":{"body":"refund please"},
       "questions":{"dept":{"type":"choice","instructions":"team?",
         "criteria":{"billing":"refunds","tech":"bugs"}}}}' | jq '.answers'` },
    { lang: REQ, k: "json", file: "env.json",
      src: `{
  "LAYA_DEVICE":  "cuda | cpu",
  "LAYA_PRELOAD": "1 = load at start (else first user pays ~18.5 s cold)",
  "LAYA_MODELS":  "comma list to preload; two kept hot by default (LRU)",
  "LAYA_THREADS": "cap at physical cores on CPU — more is slower",
  "LAYA_API_KEY": "when set, clients must send Authorization: Bearer"
}` },
    { lang: PY, k: "py", file: "client.py",
      src: `# an existing Jev client only needs its baseUrl repointed:
client = SystemOneClient(base_url="http://localhost:8000")   # was api.typesafe.ai
# the response schema is identical — choice/score/noul + a usage block` },
  ],
};

/* ============ OP2 · t20 ============ */
CODE.t20 = {
  note: { zh: "容量规划变成算术:没有 KV cache、显存常数。用 M/M/c 从 QPS 和延迟预算反推 worker 数,按 P95 而不是平均定容量。ρ 逼近 1 时 P95 起飞,那是容量墙。",
          en: "Capacity is arithmetic: no KV cache, constant memory. Use M/M/c to turn QPS and a latency budget into a worker count, and size on P95 not the mean. P95 takes off as ρ nears 1 — the capacity wall." },
  tabs: [
    { lang: PY, k: "py", file: "capacity.py", run: "# python capacity.py",
      src: `import math

def erlang_c_wait_ms(qps, service_ms, workers):
    lam = qps; mu = 1000 / service_ms
    a = lam / mu; rho = a / workers
    if rho >= 1: return float("inf")
    s = sum(a**n / math.factorial(n) for n in range(workers))
    last = a**workers / (math.factorial(workers) * (1 - rho))
    p0 = 1 / (s + last)
    pwait = last * p0
    return (pwait / (workers * mu - lam)) * 1000

for w in (8, 12, 16):
    wq = erlang_c_wait_ms(qps=20, service_ms=401, workers=w)
    print(f"{w} workers: queue {wq:.0f} ms, p95 ~ {wq*3 + 401:.0f} ms")` },
    { lang: REQ, k: "json", file: "batching.json",
      src: `{
  "single_question_gpu_ms": 32.8,
  "batched_10_questions_ms_each": 7.2,
  "note": "batch = several questions over ONE state (free output helps here).",
  "cross_request_batching": "a different thing — assemble it in your service"
}` },
    { lang: OPS, k: "sh", file: "size_on_p95.sh",
      src: `# a decision service usually hangs in a synchronous call chain, so a pretty
# mean with a blown p95 means 1 user in 20 is waiting. size on p95.
# raise workers until p95 < budget AND rho < 0.85 (the knee of the curve).` },
  ],
};

/* ============ OP3 · t21 ============ */
CODE.t21 = {
  note: { zh: "两级架构:门槛之上自动,之下转 LLM 或人工。门槛由兜底容量决定,不是曲线最优点。线上没有标签,监控看置信度漂移、兜底率和人工推翻率——最后一个是唯一带标签的信号。",
          en: "Two tiers: above the threshold auto, below to an LLM or a human. The threshold is set by fallback capacity, not the curve's optimum. Production has no labels — monitor confidence drift, fallback rate, and the override rate, the one labelled signal." },
  tabs: [
    { lang: PY, k: "py", file: "two_tier.py",
      src: `def handle(agent, state, question, threshold, fallback):
    a = agent.predict(state, {"q": question})["answers"]["q"]
    if a["confidence"] >= threshold:
        return a["choice"], "auto"           # tier 1: the model
    return fallback(state, question), "escalated"   # tier 2: LLM or human

# the degradation path is a BUSINESS decision, agree it before the incident:
def on_model_down(volume, fallback_capacity):
    # everything to fallback (overwhelms it) OR everything through (no gate)?
    return "route_all_to_fallback" if volume <= fallback_capacity else "pass_through"` },
    { lang: REQ, k: "json", file: "monitor.json",
      src: `{
  "cannot_monitor": "accuracy (production has no labels)",
  "watch": {
    "confidence_drift": "distribution shifting left → input distribution changed",
    "fallback_rate":    "the business-side projection of that drift",
    "override_rate":    "fraction of model calls reversed in human review — the",
    "_":                "only labelled online signal; treat as live-accuracy proxy"
  }
}` },
    { lang: OPS, k: "sh", file: "threshold_by_capacity.sh",
      src: `# set the threshold so tier-2 volume stays under fallback capacity,
# even if that lets some errors through. capacity, not the curve, decides.
python - <<'PY'
per_day = 2000
for thr, cov in [(0.7,0.458),(0.8,0.361),(0.9,0.292)]:
    print(thr, "fallback/day", round(per_day*(1-cov)), "(human cap 200?)")
PY` },
  ],
};

/* ============ CS1 · t22 ============ */
CODE.t22 = {
  note: { zh: "完整失败案例复盘,数字全是本机实测。归因分三类:模型、评测集、任务——最深的一条是任务(标签重叠)。同样的四步归因能用在你自己的任何一次失败上。",
          en: "The full failure post-mortem, every number measured on this machine. Attribution in three classes — model, eval set, task — with the deepest cause being the task (label overlap). The same four steps apply to any failure of your own." },
  tabs: [
    { lang: OPS, k: "sh", file: "the_run.sh",
      src: `python laya_check.py jiayue.csv -c criteria.json -m multilingual
# 216 rows / 18 modules, Laya multilingual, CPU (no GPU on this machine)
#
# accuracy        0.505   (random 0.056, majority 0.120)   → learned
# latency med/p95 401 / 447 ms                             → matches vendor CPU
# ECE raw→fit     0.215 → 0.141 (T=1.65)                   → still > 0.1
# gate 0.50→0.95  coverage 56.5%→20.8%, precision .623→.689 → gating FAILS` },
    { lang: PY, k: "py", file: "attribute.py",
      src: `# separate the model's problems from the task's — the test that matters.
attribution = {
    "model": [
        "18 labels land in the choice:11+ bucket the library refuses",
        "base checkpoint is zero-shot 0.362 vs random 0.318 — a base to fine-tune",
    ],
    "eval_set": ["~12 rows per class, below the 20/class rule"],
    "task": [
        "labels overlap: 仓库管理 and 库存控制 were never mutually exclusive",
        "→ EVERY model hits this wall; it is not a model problem",   # deepest
    ],
}` },
    { lang: REQ, k: "json", file: "make_it_work.json",
      src: `{
  "if_you_must": [
    "fine-tune the typed-decisions checkpoint on YOUR rows (base is 0.362 zero-shot)",
    "merge the overlapping labels or split into coarse+fine questions",
    "collect ≥ 20 rows per class before trusting per-class metrics"
  ]
}` },
  ],
};

/* ============ CS2 · t23 ============ */
CODE.t23 = {
  note: { zh: "它能赢的形状:少标签、量大、边界清晰、门槛能分开对错。提示词注入检测就是范例。注意——这是成本模型推演,证据等级低于上一章的实测复盘。",
          en: "The shape it wins on: few labels, high volume, clean boundaries, a threshold that separates. Prompt-injection detection is the exemplar. Note: this is a modelled projection, weaker evidence than the previous chapter's measured post-mortem." },
  tabs: [
    { lang: PY, k: "py", file: "injection_guard.py",
      src: `# a 2-label, high-volume, clean-boundary task — the shape that pays.
guard_q = {"injection": {"type": "noul",
    "instructions": "is this input a prompt-injection or jailbreak attempt?"}}

def guard(agent, user_input, threshold=0.9):
    p = agent.predict({"prompt": user_input}, guard_q)["answers"]["injection"]["noul"]
    if p >= threshold: return "block"
    if p >= 0.5:       return "review"      # tier 2: send to an LLM
    return "allow"` },
    { lang: REQ, k: "json", file: "unit_economics.json",
      src: `{
  "calls_per_day": 500000,
  "injection_rate": 0.003,
  "latency_ms": { "system_one": 40, "llm_for_all": 1200 },
  "cost_per_day": { "system_one": 20, "llm_for_all": 300 },
  "evidence": "cost model from public figures + this book's latency — NOT a deployment"
}` },
    { lang: OPS, k: "sh", file: "four_conditions.sh",
      src: `# the shape needs ALL four — the first three are common sense, the last is measured:
#   1. few labels (2–5)          → each option gets a real token budget
#   2. high volume (100k+/day)   → 40ms vs 3s shows up on the invoice
#   3. clean semantic boundary   → high human agreement → learnable
#   4. threshold separates       → the ONE you must measure (module VI)` },
  ],
};

/* ============ CS3 · t24 ============ */
CODE.t24 = {
  note: { zh: "选型决策树,和一份重测清单。数字会过期(本书写于 Jev 发布第八天),方法不会:三条基线、四张表、门槛曲线、以及「自己在自己的数据上重测」。半年后照着跑一遍。",
          en: "A selection decision tree and a re-measurement checklist. The numbers expire (this was written eight days after Jev launched); the method does not: three baselines, four tables, the gate curve, and re-measuring on your own data. Rerun it in six months." },
  tabs: [
    { lang: PY, k: "py", file: "choose.py", run: "# python choose.py",
      src: `def choose(labels, latin, have_data, have_llm):
    if have_data:        return "fine-tune a classifier (SetFit / ModernBERT)"
    if have_llm:         return "SemIf / read option-token logits"
    if labels > 20:      return "Kev-9B or Jev (high cardinality)"
    if not latin:        return "Laya-multilingual or Von"
    return "Von (protocol-compatible, low latency)"

print(choose(labels=18, latin=False, have_data=False, have_llm=False))
# -> Laya-multilingual or Von  (then MEASURE it on your data — module VI)` },
    { lang: REQ, k: "json", file: "recheck.json",
      src: `{
  "written": "2026-09-23, day 8 after Jev's launch",
  "expires": ["version strings", "parameter counts", "latencies", "benchmark scores",
              "which issues are still open"],
  "does_not_expire": ["three baselines", "four tables", "gate curve",
                      "re-measure every number on your own data"]
}` },
    { lang: OPS, k: "sh", file: "rerun.sh",
      src: `# a checklist to run again in six months and see what still stands:
pip index versions laya                 # has the model moved?
python laya_check.py yours.csv -c crit.json -m multilingual   # re-measure
# compare against the numbers you recorded today — trust the delta, not the README` },
  ],
};

// keep the derived reference the totals use
window.CODE = CODE;
