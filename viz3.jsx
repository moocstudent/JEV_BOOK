/* =========================================================
   viz3.jsx — benches for Modules VII–VIII (t19–t24, t27),
   the VIZ registry and <Viz>. Loaded after viz.jsx / viz2.jsx.
   ========================================================= */

/* =========================================================
   Module VII · OP — 上线工程
   ========================================================= */

/* t19 · serveLab — the /v1/systemone drop-in and its env vars */
function ServeViz() {
  const L = useL();
  const [device, setDevice] = React.useState("cpu");
  const [preload, setPreload] = React.useState(true);
  const [apiKey, setApiKey] = React.useState(false);
  const [models, setModels] = React.useState(2);
  const firstReq = preload ? 40 : (device === "cpu" ? 18500 : 3200);
  const mem = models * (device === "cpu" ? 900 : 1500);
  const exposed = !apiKey;
  return (
    <div>
      <VizHead idx="OP1" title={L("自托管:把 baseUrl 指过来", "Self-hosting: repoint the baseUrl")} />
      <div className="viz-ctrl">
        <Seg value={device} onChange={setDevice} options={[{ v: "cpu", l: "cpu" }, { v: "cuda", l: "cuda" }]} />
        <Toggle label="LAYA_PRELOAD" value={preload} onChange={setPreload} />
        <Toggle label={L("设置 LAYA_API_KEY", "set LAYA_API_KEY")} value={apiKey} onChange={setApiKey} />
        <Slider label={L("预加载 checkpoint 数", "checkpoints preloaded")} min={1} max={3} step={1} value={models} onChange={setModels} />
      </div>
      <pre style={{ marginTop: 10, background: "var(--surface-2)", padding: 12, borderRadius: 8, font: "500 11px var(--f-mono)", color: "var(--ink)", overflow: "auto" }}>
{`pip install "laya[serve]"
LAYA_DEVICE=${device} LAYA_PRELOAD=${preload ? 1 : 0}${apiKey ? " LAYA_API_KEY=•••" : ""} laya-serve
# → POST 0.0.0.0:8000/v1/systemone  (Jev-compatible)`}
      </pre>
      <div className="jv-kpi-grid">
        <Kpi label={L("第一个请求延迟", "first request")} value={preload ? ms(firstReq) : `${nf(firstReq / 1000, 1)} s`} tone={preload ? "ok" : "bad"}
          hint={preload ? L("已预热", "warm") : L("首个用户吃加载", "first user pays load")} />
        <Kpi label={L("常驻内存", "resident memory")} value={`${nf(mem, 0)} MB`} tone="mut" />
        <Kpi label={L("暴露面", "exposure")} value={exposed ? L("无鉴权!", "no auth!") : L("需 Bearer", "Bearer required")} tone={exposed ? "bad" : "ok"} />
      </div>
      <Note mark="!" tone={exposed ? "bad" : ""}>
        {exposed
          ? L("默认没有鉴权,而这个服务接受任意文本并返回判断——它不该直接暴露在公网上。设 LAYA_API_KEY,客户端带 Authorization: Bearer。",
              "There is no authentication by default, and this service takes arbitrary text and returns judgements — it does not belong on the public internet. Set LAYA_API_KEY and have clients send Authorization: Bearer.")
          : L("协议对齐 Jev,一个已有的 Jev 客户端只要改 baseUrl 就能指过来,别的一行不用动——这是开源平替最实际的价值。",
              "Aligned to Jev's protocol, an existing Jev client needs only its baseUrl repointed and nothing else — the most practical value an open alternative offers.")}
      </Note>
    </div>
  );
}

/* t20 · capacityLab — an M/M/c queueing model to a worker count */
function CapacityViz() {
  const L = useL();
  const [qps, setQps] = React.useState(20);
  const [svcMs, setSvcMs] = React.useState(401);
  const [workers, setWorkers] = React.useState(12);
  const [batch, setBatch] = React.useState(1);
  // batching cuts per-question service time (measured: 32.8→7.2 at batch 10 on GPU)
  const eff = svcMs / (1 + Math.log2(batch) * 0.55);
  const svc = eff / 1000;                        // seconds
  const lam = qps, mu = 1 / svc, rho = lam / (workers * mu);
  // M/M/c waiting time (Erlang-C, approximate)
  let wq;
  if (rho >= 1) wq = Infinity;
  else {
    const a = lam / mu;
    let sum = 0; for (let n = 0; n < workers; n++) sum += a ** n / fact(n);
    const last = a ** workers / (fact(workers) * (1 - rho));
    const p0 = 1 / (sum + last);
    const pWait = last * p0;
    wq = (pWait / (workers * mu - lam)) * 1000;  // ms
  }
  const p95 = isFinite(wq) ? wq * 3 + eff : Infinity;
  return (
    <div>
      <VizHead idx="OP2" title={L("容量:排队模型 → worker 数", "Capacity: a queueing model → worker count")} />
      <div className="viz-ctrl">
        <Slider label="QPS" min={1} max={200} step={1} value={qps} onChange={setQps} />
        <Slider label={L("单请求服务 (ms)", "service time (ms)")} min={40} max={800} step={10} value={svcMs} onChange={setSvcMs} />
        <Slider label={L("worker 数", "workers")} min={1} max={64} step={1} value={workers} onChange={setWorkers} />
        <Slider label={L("同 state 批大小", "batch size")} min={1} max={20} step={1} value={batch} onChange={setBatch} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("利用率 ρ", "utilisation ρ")} value={rho >= 1 ? "≥1 ✗" : nf(rho, 2)} tone={rho >= 0.85 ? "bad" : rho >= 0.7 ? "warn" : "ok"} />
        <Kpi label={L("批后单问", "per-q after batch")} value={ms(eff)} tone="acc" />
        <Kpi label="P95" value={isFinite(p95) ? ms(p95) : L("发散", "diverges")} tone={!isFinite(p95) || p95 > 1500 ? "bad" : "ok"} />
        <Kpi label={L("这些 worker 能扛", "these workers hold")} value={rho < 0.85 ? L("是", "yes") : L("否", "no")} tone={rho < 0.85 ? "ok" : "bad"} />
      </div>
      <Note mark="=">
        {L("没有 KV cache、显存常数,容量规划变成算术。按 P95 而不是平均来定——决策服务通常挂在同步调用链上,P95 超标意味着每二十个用户里有一个在等。ρ 一旦逼近 1,P95 就起飞,那就是容量墙。",
           "No KV cache and constant memory make capacity arithmetic. Size on P95, not the mean — a decision service usually hangs in a synchronous chain, so a blown P95 means one user in twenty waits. As ρ approaches 1, P95 takes off — that is the capacity wall.")}
      </Note>
    </div>
  );
}
function fact(n) { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; }

/* t21 · tierLab — the two-tier system below the threshold */
function TierViz() {
  const L = useL();
  const [thr, setThr] = React.useState(0.8);
  const [fbCap, setFbCap] = React.useState(200);   // human fallback capacity / day
  const [fbLlm, setFbLlm] = React.useState(true);
  const perDay = 2000;
  const g = [[0.5, 0.565], [0.6, 0.505], [0.7, 0.458], [0.8, 0.361], [0.85, 0.319], [0.9, 0.292], [0.95, 0.208]];
  let cov = 0.565; for (const r of g) if (thr >= r[0]) cov = r[1];
  const fbVol = Math.round(perDay * (1 - cov));
  const overload = !fbLlm && fbVol > fbCap;
  const chainP95 = fbLlm ? 3200 : 401;   // LLM fallback sets the chain P95
  return (
    <div>
      <VizHead idx="OP3" title={L("两级架构:门槛之下是什么", "Two tiers: what sits below the threshold")} />
      <div className="viz-ctrl">
        <Slider label={L("置信度门槛", "threshold")} min={0.5} max={0.95} step={0.05} value={thr} onChange={setThr} />
        <Slider label={L("人工兜底日容量", "human fallback / day")} min={50} max={800} step={50} value={fbCap} onChange={setFbCap} />
        <Toggle label={L("兜底用 LLM(而非人工)", "fallback is an LLM")} value={fbLlm} onChange={setFbLlm} />
      </div>
      <div className="jv-grid2" style={{ marginTop: 10 }}>
        <div className="jv-note">
          <div className="jv-label">{L("上层 · 模型自动", "tier 1 · model auto")}</div>
          <div style={{ font: "600 20px var(--f-mono)", color: "var(--ok)" }}>{pct1(cov)}</div>
          <div style={{ font: "500 11px var(--f-mono)", color: "var(--muted)" }}>{nf(perDay * cov, 0)} {L("条/日", "/ day")}</div>
        </div>
        <div className="jv-note" style={{ borderColor: overload ? "var(--bad)" : undefined }}>
          <div className="jv-label">{L("下层 · 兜底", "tier 2 · fallback")}</div>
          <div style={{ font: "600 20px var(--f-mono)", color: overload ? "var(--bad)" : "var(--ink)" }}>{fbVol} {L("条/日", "/ day")}</div>
          <div style={{ font: "500 11px var(--f-mono)", color: "var(--muted)" }}>{fbLlm ? L("LLM 复核", "LLM review") : `${L("人工上限", "human cap")} ${fbCap}`}</div>
        </div>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("链路 P95", "chain P95")} value={ms(chainP95)} tone={fbLlm ? "warn" : "ok"} hint={fbLlm ? L("由 LLM 那条路决定", "set by the LLM path") : ""} />
        <Kpi label={L("兜底是否溢出", "fallback overflow")} value={overload ? L("溢出!", "overflow!") : L("够", "ok")} tone={overload ? "bad" : "ok"} />
        <Kpi label={L("线上可监控", "monitor online")} value={L("推翻率", "override rate")} tone="acc" hint={L("唯一带标签的信号", "the one labelled signal")} />
      </div>
      <Note mark="!" tone={overload ? "bad" : ""}>
        {overload
          ? L("门槛太低,兜底量超过人工容量。门槛要由兜底容量决定,而不是由曲线最优点决定——哪怕这意味着放过一些本该兜底的错误。",
              "The threshold is too low and fallback volume exceeds human capacity. Set the threshold by fallback capacity, not the curve's optimum — even if that lets some errors through.")
          : L("线上没有标签,监控不了准确率。能看的是三样:置信度分布漂移、兜底率变化、人工推翻率——最后一个是唯一带标签的线上信号,当作准实时准确率代理。",
              "Production has no labels, so accuracy cannot be monitored. Watch three things: confidence drift, fallback-rate movement, and the human override rate — the last is the only labelled online signal, a proxy for near-real-time accuracy.")}
      </Note>
    </div>
  );
}

/* =========================================================
   Module VIII · CS — 案例与决策
   ========================================================= */

/* t22 · caseLab — the full measured failure, attributed */
function CaseViz() {
  const L = useL();
  const [view, setView] = React.useState("gate");
  const g = MEASURED.gate;
  return (
    <div>
      <VizHead idx="CS1" title={L("案例一:216 条、18 类、0.505,为什么没过", "Case one: 216 rows, 18 classes, 0.505, why it failed")} />
      <div className="viz-ctrl">
        <Seg value={view} onChange={setView} options={[{ v: "gate", l: L("门槛表", "gate table") }, { v: "attr", l: L("失败归因", "attribution") }]} />
      </div>
      {view === "gate" ? (
        <div style={{ marginTop: 8 }}>
          {g.map((r) => (
            <div key={r[0]} className="jv-bar-row">
              <span>thr {nf(r[0], 2)}</span>
              <div className="b-track"><div className="b-fill acc" style={{ width: `${r[1] * 100}%` }} /></div>
              <span className="b-val">{L("覆盖", "cov")} {pct1(r[1])} · {L("精度", "prec")} {nf(r[2], 3)}</span>
            </div>
          ))}
          <Note mark="✗" tone="bad">
            {L("覆盖率从 56.5% 砍到 20.8%,精度只从 0.623 爬到 0.689。置信度几乎不区分对错——而这是整个范式的卖点。",
               "Coverage cut from 56.5% to 20.8% for a precision rise of 0.623 to 0.689. Confidence barely separates right from wrong — and that was the whole pitch.")}
          </Note>
        </div>
      ) : (
        <div className="jv-steps" style={{ marginTop: 8 }}>
          <Note mark="M" tone="bad">{L("模型:18 标签落在被库拒绝的 choice:11+ 温度桶;base checkpoint 零样本 0.362 对随机 0.318,本就是待微调底座。", "Model: 18 labels land in the refused choice:11+ bucket; base zero-shot 0.362 vs random 0.318 — a foundation to fine-tune.")}</Note>
          <Note mark="D" tone="warn">{L("评测集:每类平均 12 条,低于 20/类的经验线,只支持总体指标。", "Eval set: ~12 rows per class, below 20/class, supports overall metrics only.")}</Note>
          <Note mark="T" tone="bad">{L("任务:标签语义重叠,「仓库管理」与「客户计划变更下的原料保障与库存控制」本就不互斥——任何模型都会撞墙。", "Task: labels overlap; warehouse management and material assurance under plan changes were never exclusive — every model hits this wall.")}</Note>
        </div>
      )}
      <div className="jv-kpi-grid">
        <Kpi label={L("准确率", "accuracy")} value="0.505" tone="warn" hint={L("对随机 0.056", "vs random 0.056")} />
        <Kpi label={L("延迟 中位/P95", "latency med/P95")} value="401/447" unit="ms" tone="ok" />
        <Kpi label="ECE" value="0.215→0.141" tone="bad" hint="T=1.65" />
      </div>
    </div>
  );
}

/* t23 · winLab — the shape it wins on, priced */
function WinViz() {
  const L = useL();
  const [labels, setLabels] = React.useState(2);
  const [volume, setVolume] = React.useState(500000);
  const [rate, setRate] = React.useState(0.003);   // positive rate (e.g. injection rate)
  const [missCost, setMissCost] = React.useState(20);
  // few labels + clean boundary → high precision achievable; System One pays vs LLM-for-all
  const fewLabels = labels <= 5;
  const soLat = 40, llmLat = 1200;
  const soPrec = fewLabels ? 0.94 : 0.7;
  const positives = volume * rate;
  const missed = positives * (1 - soPrec);
  const llmCostDay = volume * 0.0006;       // $ if every call went to an LLM
  const soCostDay = volume * 0.00004;       // System One input-billed
  const savingDay = llmCostDay - soCostDay - missed * missCost / 30;
  return (
    <div>
      <VizHead idx="CS2" title={L("案例二:它能赢的那个形状", "Case two: the shape it wins on")} />
      <div className="viz-ctrl">
        <Slider label={L("标签数", "labels")} min={2} max={20} step={1} value={labels} onChange={setLabels} />
        <Slider label={L("日调用量", "calls / day")} min={10000} max={2000000} step={10000} value={volume} onChange={setVolume} fmt={(v) => `${nf(v / 1000, 0)}K`} />
        <Slider label={L("正例率", "positive rate")} min={0.0005} max={0.05} step={0.0005} value={rate} onChange={setRate} fmt={(v) => pct1(v)} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("形状匹配", "shape match")} value={fewLabels ? L("✓ 少标签", "✓ few labels") : L("✗ 标签太多", "✗ too many")} tone={fewLabels ? "ok" : "bad"} />
        <Kpi label={L("可达精度", "achievable precision")} value={nf(soPrec, 2)} tone={soPrec > 0.9 ? "ok" : "warn"} />
        <Kpi label={L("对比全量 LLM 日省", "$/day vs LLM-for-all")} value={`$${nf(savingDay, 0)}`} tone={savingDay > 0 ? "ok" : "bad"} />
        <Kpi label={L("延迟", "latency")} value={`${soLat} vs ${llmLat}`} unit="ms" tone="acc" />
      </div>
      <Note mark="!">
        {L("形状有四个条件:标签少(2–5)、量大(几十万/日)、语义边界清晰、门槛真能分开对错。提示词注入检测、内容安全、模型路由都属于这类。注意:这是按公开数字加本书延迟实测构造的成本模型,不是一次真实部署复盘——证据等级低于案例一。",
           "The shape has four conditions: few labels (2–5), high volume (hundreds of thousands a day), clean boundaries, and a threshold that separates right from wrong. Prompt-injection detection, content safety and model routing fit. Note: this is a cost model from public figures plus this book's latency measurements, not a real deployment — weaker evidence than case one.")}
      </Note>
    </div>
  );
}

/* t24 · treeLab — the selection decision tree */
function TreeViz() {
  const L = useL();
  const [labels, setLabels] = React.useState(4);
  const [latin, setLatin] = React.useState(true);
  const [data, setData] = React.useState(false);
  const [llm, setLlm] = React.useState(false);
  let rec, why;
  if (data) { rec = L("微调分类器", "fine-tune a classifier"); why = L("有标注数据,单任务几乎总是它赢", "with labelled data, one task almost always favours this"); }
  else if (llm) { rec = L("SemIf / 读 logits", "SemIf / read logits"); why = L("已有 LLM,边际成本接近零", "you already run an LLM, near-zero marginal cost"); }
  else if (labels > 20) { rec = L("Kev-9B 或 Jev", "Kev-9B or Jev"); why = L("高基数,编码器派会垮", "high cardinality, the encoder camp breaks"); }
  else if (!latin) { rec = L("Laya-multilingual / Von", "Laya-multilingual / Von"); why = L("非拉丁文字,排除英文 checkpoint", "non-Latin, the English checkpoint is out"); }
  else { rec = L("Von(协议兼容,快)", "Von (protocol-compatible, fast)"); why = L("少标签、英文、要低延迟", "few labels, English, low latency"); }
  return (
    <div>
      <VizHead idx="CS3" title={L("一棵决策树,和一个必须写下的时间戳", "A decision tree, and a timestamp you must write down")} />
      <div className="viz-ctrl">
        <Slider label={L("标签数", "labels")} min={2} max={77} step={1} value={labels} onChange={setLabels} />
        <Toggle label={L("拉丁文字", "Latin script")} value={latin} onChange={setLatin} />
        <Toggle label={L("有几百条标注", "have labelled data")} value={data} onChange={setData} />
        <Toggle label={L("已经在跑 LLM", "already run an LLM")} value={llm} onChange={setLlm} />
      </div>
      <div className="jv-note" style={{ marginTop: 10, borderColor: "var(--accent)", borderWidth: 2 }}>
        <div className="jv-label">{L("建议", "recommendation")}</div>
        <div style={{ font: "700 20px var(--f-display)", color: "var(--accent)" }}>{rec}</div>
        <div style={{ font: "500 12px var(--f-body)", color: "var(--muted)", marginTop: 4 }}>{why}</div>
      </div>
      <Note mark="⏱">
        {L("本书写于 2026-09-23,距 Jev 发布第 8 天。每个具体数字——版本号、参数量、延迟、基准分——都有很短的保质期。不会过期的是方法:三条基线、四张表、门槛-覆盖率-精度曲线,以及「所有数字都自己在自己的数据上重测一遍」。",
           "This book was written on 2026-09-23, eight days after Jev launched. Every specific number — versions, parameter counts, latencies, benchmark scores — has a short shelf life. What does not expire is the method: three baselines, four tables, the threshold-coverage-precision curve, and the rule that every number is re-measured on your own data.")}
      </Note>
    </div>
  );
}

/* t27 · reviewLab — code review as a k=3 choice, gated per hunk, cⁿ per push */
// Synthetic review set: gold verdicts drawn from a prior where most hunks are
// fine; the model is makeEval's recipe (skill lifts the true class). Not measured.
const REVIEW_PRIOR = [0.72, 0.10, 0.18];         // approve / request_changes / needs_human
function makeReviewSet(n, skill, seed) {
  const r = rng(seed), items = [];
  for (let i = 0; i < n; i++) {
    const u = r();
    const gold = u < REVIEW_PRIOR[0] ? 0 : u < REVIEW_PRIOR[0] + REVIEW_PRIOR[1] ? 1 : 2;
    const logits = [0, 1, 2].map(() => gauss(r) * 0.6);
    logits[gold] += skill * 2.4;
    const p = softmax(logits);
    let top = 0; for (let j = 1; j < 3; j++) if (p[j] > p[top]) top = j;
    items.push({ p, gold, top, conf: layaConf(p) });
  }
  return items;
}
function ReviewViz() {
  const L = useL();
  const [thr, setThr] = React.useState(0.5);       // gate on Laya's confidence (normalized entropy, k=3)
  const [skill, setSkill] = React.useState(1.0);
  const [hunks, setHunks] = React.useState(6);     // hunks per push
  const [tok, setTok] = React.useState(200);       // tokens per hunk
  const [pushes, setPushes] = React.useState(120); // pushes per day
  const set = React.useMemo(() => makeReviewSet(1500, skill, 2027), [skill]);
  // English checkpoint: max_len 512 − head_max_len 192 ≈ 320, minus the state wrapper → ~300
  const ROOM = 300;
  const windows = Math.ceil(tok / ROOM);
  const nEff = hunks * windows;                    // decisions per push
  // per-hunk gate: only a confident APPROVE skips a human
  const auto = set.filter((x) => x.top === 0 && x.conf >= thr);
  const c = auto.length / set.length;
  const escaped = auto.length ? auto.filter((x) => x.gold === 1).length / auto.length : 0;  // defects waved through
  const llm = set.filter((x) => x.top === 1 && x.conf >= thr).length / set.length;
  const human = 1 - c - llm;
  const pushAuto = Math.pow(c, nEff);
  const perDay = pushes * nEff;
  const labels = ["approve", "changes", "human"];
  const ex = set.find((x) => x.gold === 0) || set[0];
  const exAct = ex.top === 0 && ex.conf >= thr ? "auto_pass" : ex.top === 1 && ex.conf >= thr ? "llm_review" : "human_review";
  return (
    <div>
      <VizHead idx="OP4" title={L("代码评审当作 k=3 的 choice:按 hunk 过闸,按推送是 cⁿ", "Code review as a k=3 choice: gate per hunk, cⁿ per push")} />
      <div className="viz-ctrl">
        <Slider label={L("置信度门槛 θ(k=3 的归一化熵)", "threshold θ (normalized entropy, k=3)")} min={0.1} max={0.9} step={0.05} value={thr} onChange={setThr} />
        <Slider label={L("模型能力(合成)", "model skill (synthetic)")} min={0.3} max={1.6} step={0.1} value={skill} onChange={setSkill} />
        <Slider label={L("每次推送的 hunk 数 n", "hunks per push n")} min={1} max={20} step={1} value={hunks} onChange={setHunks} />
        <Slider label={L("每个 hunk 的 token 数", "tokens per hunk")} min={50} max={900} step={50} value={tok} onChange={setTok} />
        <Slider label={L("每日推送数", "pushes / day")} min={20} max={500} step={20} value={pushes} onChange={setPushes} />
      </div>
      <div className="jv-grid2" style={{ marginTop: 10 }}>
        <div>
          <div className="jv-cap">{L("一个本该放行的 hunk:verdict 的分布", "one hunk that should pass: the verdict distribution")}</div>
          <DistBars probs={ex.p} labels={labels} mark={ex.top} />
          <div style={{ font: "500 11px var(--f-mono)", color: "var(--muted)", textAlign: "center" }}>
            confidence {nf(ex.conf, 3)} → <span style={{ color: exAct === "auto_pass" ? "var(--ok)" : "var(--warn)" }}>{exAct}</span>
          </div>
        </div>
        <div>
          <div className="jv-cap">{L("每个 hunk 被送到哪", "where each hunk goes")}</div>
          <Bar label="auto_pass" value={c} max={1} tone="ok" valText={pct1(c)} />
          <Bar label="llm_review" value={llm} max={1} tone="warn" valText={pct1(llm)} />
          <Bar label="human_review" value={human} max={1} tone="acc" valText={pct1(human)} />
          <div className="jv-cap" style={{ marginTop: 6 }}>{L("token 预算", "token budget")}: {tok} / ~{ROOM} → {windows > 1 ? L(`切成 ${windows} 个窗口`, `${windows} windows`) : L("放得下", "fits")}</div>
        </div>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("评审量省下", "review load saved")} value={pct1(c)} tone="acc" hint={`${nf(perDay * (1 - c), 0)} / ${nf(perDay, 0)} ${L("块/日要看", "hunks/day to read")}`} />
        <Kpi label={L("推送整体自动放行", "whole push auto-passes")} value={pct1(pushAuto)} tone={pushAuto < 0.1 ? "bad" : "warn"} hint={`c^n = ${nf(c, 2)}^${nEff}`} />
        <Kpi label={L("放行里的漏检", "escapes among passes")} value={pct1(escaped)} tone={escaped > 0.05 ? "bad" : "ok"} hint={`≈ ${nf(perDay * c * escaped, 1)} ${L("个缺陷/日", "defects/day")}`} />
        <Kpi label={L("一次推送的模型延迟", "model latency / push")} value={ms(nEff * MEASURED.latMed)} tone="mut" hint={L("CS1 中位数 × 决策数,粗估", "CS1 median × decisions, rough")} />
      </div>
      <Note mark="!" tone={pushAuto < 0.1 ? "bad" : ""}>
        {L(`一次推送只有最差的那一块放行了才算放行:${pct1(c)} 的 hunk 放行率,到 ${nEff} 个决策的推送上只剩 ${pct1(pushAuto)}。别拿「推送自动化率」当目标——真正的收益是评审者只读没放行的 ${pct1(1 - c)}。拉高门槛能压低漏检,代价是评审量;这一对取舍和 CA3 的门槛曲线是同一件事。`,
           `A push passes only if its worst hunk passes: a ${pct1(c)} hunk pass rate leaves ${pct1(pushAuto)} for a push of ${nEff} decisions. Do not target push automation — the real win is that reviewers read only the ${pct1(1 - c)} that did not pass. Raising θ cuts escapes at the cost of review load; it is the same trade as CA3's threshold curve.`)}
      </Note>
      <Note mark="≈">
        {L("合成数据,不是实测:先验 72% approve / 10% request_changes / 18% needs_human 是假设。你自己的门槛、放行率和漏检率,要用合并历史建评测集才能知道(EV1–EV3)。",
           "Synthetic, not measured: the 72% approve / 10% request_changes / 18% needs_human prior is an assumption. Your own threshold, pass rate and escape rate are known only after building an eval set from your merge history (EV1–EV3).")}
      </Note>
    </div>
  );
}

/* ---------------- registry + <Viz> ---------------- */
const VIZ = Object.assign({},
  window.__JV_VIZ_1 || {},
  window.__JV_VIZ_2 || {},
  {
    serveLab: ServeViz, capacityLab: CapacityViz, tierLab: TierViz, reviewLab: ReviewViz,
    caseLab: CaseViz, winLab: WinViz, treeLab: TreeViz,
  });

function Viz({ name }) {
  const C = VIZ[name];
  if (!C) return null;
  return <div className="jv-viz"><C /></div>;
}

window.VIZ = VIZ;
window.Viz = Viz;
