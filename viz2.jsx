/* =========================================================
   viz2.jsx — benches for Modules IV–VI (t10–t18).
   Reuses the prelude from viz.jsx; exported as __JV_VIZ_2.
   ========================================================= */

/* =========================================================
   Module IV · LY — Laya
   ========================================================= */

/* t10 · routeLab — script/language routing across three checkpoints */
function RouteViz() {
  const L = useL();
  const [sample, setSample] = React.useState("zh");
  const [def, setDef] = React.useState("english");
  const SAMPLES = {
    zh:   { text: "客户被重复扣款,请退款", script: "han", lang: "zh", latin: false },
    km:   { text: "សូមសងប្រាក់មកវិញ", script: "khmer", lang: "km", latin: false },
    de:   { text: "Der Kunde wurde zweimal belastet", script: "latin", lang: "de", latin: true },
    short:{ text: "refund please", script: "latin", lang: "?", latin: true },
    en:   { text: "billed twice, please refund", script: "latin", lang: "en", latin: true },
  };
  const s = SAMPLES[sample];
  // routing logic mirrors Laya's Router
  let route, reason;
  if (!s.latin) { route = "multilingual"; reason = L(`非拉丁文字(${s.script})`, `non-Latin script (${s.script})`); }
  else if (s.lang === "?") { route = def; reason = L("短文本,无语言信号 → default", "short text, no language signal → default"); }
  else if (s.lang !== "en") { route = "multilingual"; reason = L(`拉丁文字但语言像 '${s.lang}'`, `Latin but language looks like '${s.lang}'`); }
  else { route = "english"; reason = L("英文", "English"); }
  const wrong = sample === "km" && route === "english";
  // Khmer on the English checkpoint: 0.000 accuracy at 95.2% confidence.
  const collapse = !s.latin && route === "english";
  return (
    <div>
      <VizHead idx="LY1" title={L("三个 checkpoint 和一个路由器", "Three checkpoints and a router")} />
      <div className="viz-ctrl">
        <Choice label={L("输入样本", "input sample")} value={sample} onChange={setSample}
          options={[{ v: "zh", l: L("中文", "Chinese") }, { v: "km", l: L("高棉语", "Khmer") }, { v: "de", l: L("德语", "German") }, { v: "short", l: L("短英文", "short Latin") }, { v: "en", l: L("英文", "English") }]} />
        <Choice label={L("default 分支", "default branch")} value={def} onChange={setDef}
          options={[{ v: "english", l: "english" }, { v: "multilingual", l: "multilingual" }]} />
      </div>
      <div className="jv-note" style={{ marginTop: 10 }}>
        <div style={{ font: "500 14px var(--f-mono)", color: "var(--ink)", direction: "auto" }}>{s.text}</div>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("路由到", "routed to")} value={route} tone={collapse ? "bad" : "acc"} />
        <Kpi label={L("理由", "reason")} value="—" hint={reason} tone="mut" />
        <Kpi label={L("这条路的表现", "outcome")} value={collapse ? "acc 0.000" : L("正常", "fine")} tone={collapse ? "bad" : "ok"}
          hint={collapse ? "conf 95.2%" : ""} />
      </div>
      <Note mark="!" tone={collapse ? "bad" : ""}>
        {collapse
          ? L("英文 checkpoint 在非拉丁文字上不是差一点,而是崩溃:高棉语准确率 0.000,而它自报置信度 95.2%。这是全书最干净的「高置信度 + 全错」——中文必须走多语言支。",
              "On non-Latin scripts the English checkpoint does not degrade, it collapses: 0.000 accuracy on Khmer at a self-reported 95.2% confidence. The cleanest 'high confidence, total failure' in the book — Chinese must go multilingual.")
          : L("很短的拉丁文本往往不携带语言信号,会落到 default。如果你的流量大部分不是英文,把 default 改成 multilingual,否则短文本被静默送错分支。",
              "Very short Latin text carries no language signal and falls to default. If most traffic is not English, set default to multilingual, or short inputs get silently misrouted.")}
      </Note>
    </div>
  );
}

/* t11 · budgetLab — options compete with the document for tokens */
function BudgetViz() {
  const L = useL();
  const [nLabels, setNLabels] = React.useState(18);
  const [headMax, setHeadMax] = React.useState(256);
  const [descLen, setDescLen] = React.useState(12);   // tokens the writer wants per label
  const perLabel = Math.floor((headMax - 16) / nLabels);
  const kept = Math.min(perLabel, descLen);
  const truncated = perLabel < descLen;
  const stateTok = Math.max(0, (headMax * 2) - headMax);  // rough: max_len − head
  // measured: raising head_max_len did NOT move accuracy but did move P95
  const p95 = clamp(447 * (headMax / 256) ** 1.7, 447, 2600);
  const banking = nLabels >= 70 ? 0.425 : nLabels >= 30 ? 0.55 : 0.505;
  return (
    <div>
      <VizHead idx="LY2" title={L("选项要和正文抢 token:head_max_len 的账", "Options compete with the document: the head_max_len budget")} />
      <div className="viz-ctrl">
        <Slider label={L("标签数", "labels")} min={2} max={77} step={1} value={nLabels} onChange={setNLabels} />
        <Slider label="head_max_len" min={128} max={1024} step={64} value={headMax} onChange={setHeadMax} />
        <Slider label={L("每标签想写多少 token", "tokens wanted / label")} min={3} max={60} step={1} value={descLen} onChange={setDescLen} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("每标签实得 token", "tokens / label")} value={perLabel} tone={perLabel < descLen ? "bad" : "ok"} hint={`(${headMax}−16)//${nLabels}`} />
        <Kpi label={L("描述被截断", "description truncated")} value={truncated ? L("是", "yes") : L("否", "no")} tone={truncated ? "bad" : "ok"} />
        <Kpi label="P95" value={ms(p95)} tone={p95 > 1000 ? "bad" : "warn"} hint={L("预算越大越慢", "bigger budget, slower")} />
        <Kpi label={L("这个标签数下的准确率", "accuracy at this k")} value={nf(banking, 3)} tone={banking < 0.5 ? "bad" : "warn"} />
      </div>
      <Note mark="=">
        {L(`选项不是分类头上的神经元,是拼进输入的一段文本。77 个标签时每个只剩 3–4 个 token,标签无法区分,准确率掉到 0.425(Jev 是 0.870)。但本书实测:18 标签时把预算从 256 提到 1024,准确率一点没动,P95 却从 447 涨到 2290 ms——token 预算是高基数崩塌的必要不充分条件。`,
           `Options are text spliced into the input, not neurons on a head. At 77 labels each gets 3–4 tokens, they become indistinguishable, accuracy falls to 0.425 (Jev: 0.870). But measured here at 18 labels: raising the budget from 256 to 1024 moved accuracy not at all while P95 went 447 → 2290 ms — token budget is necessary for collapse, not sufficient.`)}
      </Note>
    </div>
  );
}

/* t12 · honestLab — reproduce the noul label-bias trap */
function HonestViz() {
  const L = useL();
  const [labelPull, setLabelPull] = React.useState(1.6);   // how hard false:/true: labels pull
  const [truth, setTruth] = React.useState(true);          // the input's real answer
  // noul renders options as false:/true:; on the English ckpt the label pair can dominate.
  const evidence = truth ? 1.8 : -1.8;
  const noulLogits = [-labelPull, -labelPull + evidence * 0.4];   // label pull suppresses both, weakly separates
  const noulP = softmax(noulLogits);
  const noulSaysYes = noulP[1] > 0.5;
  // rewrite as a 2-option choice with neutral keys A/B → evidence dominates
  const choiceP = softmax([truth ? -evidence : evidence, truth ? evidence : -evidence].map((z) => z));
  const choiceSaysYes = choiceP[0] > 0.5;   // A = yes
  const agree = noulSaysYes === choiceSaysYes;
  return (
    <div>
      <VizHead idx="LY3" title={L("复现 #156:noul 跟着 false:/true: 标签走", "Reproducing #156: noul follows its false:/true: labels")} />
      <div className="viz-ctrl">
        <Toggle label={L("输入真实答案 = 是", "input's true answer = yes")} value={truth} onChange={setTruth} />
        <Slider label={L("标签牵引强度", "label pull")} min={0} max={3} step={0.1} value={labelPull} onChange={setLabelPull} />
      </div>
      <div className="jv-grid2" style={{ marginTop: 10 }}>
        <div className="jv-note">
          <div className="jv-label">noul</div>
          <div style={{ font: "600 20px var(--f-mono)", color: noulSaysYes === truth ? "var(--ok)" : "var(--bad)" }}>
            P(true) = {nf(noulP[1], 3)}
          </div>
          <div style={{ font: "500 11px var(--f-mono)", color: "var(--muted)" }}>{noulSaysYes ? L("答:是", "says yes") : L("答:否", "says no")}</div>
        </div>
        <div className="jv-note">
          <div className="jv-label">{L("二选一 choice (A=是)", "2-option choice (A=yes)")}</div>
          <div style={{ font: "600 20px var(--f-mono)", color: choiceSaysYes === truth ? "var(--ok)" : "var(--bad)" }}>
            {choiceSaysYes ? "A" : "B"} · {nf(Math.max(...choiceP), 3)}
          </div>
          <div style={{ font: "500 11px var(--f-mono)", color: "var(--muted)" }}>{choiceSaysYes ? L("答:是", "says yes") : L("答:否", "says no")}</div>
        </div>
      </div>
      <Note mark={agree ? "✓" : "✗"} tone={agree ? "" : "bad"}>
        {agree
          ? L("这次两者一致,这条流水线上 noul 可用。但你必须每次都这样交叉验证,而不是默认它对。", "They agree this time, so noul is usable on this pipeline. But you must cross-check every time, not assume it.")
          : L("两者矛盾:标签牵引压过了正文,noul 对该答「是」的输入自信地答了「否」。补救——把问题改写成二选一 choice,键用中性的 A/B,是非写进描述。", "They conflict: the label pull overrode the document and noul confidently answered no to a yes input. Remedy — rewrite as a two-option choice with neutral keys A/B and the yes/no in the descriptions.")}
      </Note>
    </div>
  );
}

/* =========================================================
   Module V · OS — 开源生态
   ========================================================= */

/* t13 · encoderLab — the encoder camp compared, ViZDoom insight */
function EncoderViz() {
  const L = useL();
  const [freq, setFreq] = React.useState(2);   // decisions per second in a control loop
  const PROJ = [
    { n: "Von", p: 395, lat: 18, acc: 0.72, lic: "Apache-2.0", note: L("协议兼容", "protocol-compat") },
    { n: "Laya", p: 322, lat: 33, acc: 0.505, lic: "Apache-2.0", note: L("100+ 语言", "100+ langs") },
    { n: "Verdict", p: 151, lat: 12, acc: 0.771, lic: "Apache-2.0", note: "WebGPU" },
    { n: "jeff", p: 400, lat: 30, acc: 0.70, lic: "MIT", note: L("只做分类", "classify only") },
    { n: "Jev", p: 0, lat: 115, acc: 0.966, lic: L("闭源", "closed"), note: L("云端", "hosted") },
  ];
  // In a real-time loop, per-decision budget = 1000/freq ms. A model that misses it
  // acts on stale state — this is why Von beats Jev in ViZDoom despite lower accuracy.
  const budget = 1000 / freq;
  return (
    <div>
      <VizHead idx="OS1" title={L("编码器派,以及「延迟也是准确率」", "The encoder camp, and 'latency is accuracy too'")} />
      <div className="viz-ctrl">
        <Slider label={L("决策频率 (次/秒)", "decisions / second")} min={1} max={20} step={1} value={freq} onChange={setFreq} />
      </div>
      <div style={{ marginTop: 8 }}>
        {PROJ.map((p) => {
          const inBudget = p.lat <= budget;
          // effective quality: accuracy if it fits the budget, else it acts on stale state
          const eff = inBudget ? p.acc : p.acc * (budget / p.lat);
          return <Bar key={p.n} label={`${p.n} · ${p.lat}ms`} value={eff} max={1} tone={inBudget ? "ok" : "bad"}
            valText={`${nf(eff, 2)}${inBudget ? "" : " ⚠"}`} />;
        })}
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("每决策预算", "per-decision budget")} value={ms(budget)} tone="acc" />
        <Kpi label={L("Jev 是否达标", "Jev fits?")} value={115 <= budget ? L("是", "yes") : L("否", "no")} tone={115 <= budget ? "ok" : "bad"}
          hint={L("115 ms 延迟", "115 ms latency")} />
        <Kpi label="ViZDoom" value="9.00 vs 5.62" tone="acc" hint={L("Von 反超 Jev", "Von over Jev")} />
      </div>
      <Note mark="!">
        {L("当决策频率高到延迟本身成为胜负手,72 分的快模型打得过 96 分的慢模型——这就是 Von 在 ViZDoom 实时对战里反超 Jev 的原因。准确率不是唯一的轴。",
           "When decisions come fast enough that latency itself decides the outcome, a 72-point fast model beats a 96-point slow one — which is why Von overtakes Jev in real-time ViZDoom. Accuracy is not the only axis.")}
      </Note>
    </div>
  );
}

/* t14 · llmLab — the LLM camp, and SemIf's zero-component trick */
function LlmViz() {
  const L = useL();
  const [labels, setLabels] = React.useState(30);
  const [haveLlm, setHaveLlm] = React.useState(true);
  // encoder accuracy degrades with cardinality; LLM camp holds up better
  const encoder = clamp(0.85 - 0.006 * labels, 0.35, 0.85);
  const llm = clamp(0.87 - 0.001 * labels, 0.80, 0.87);
  const crossover = labels >= 20;
  const semifCost = haveLlm ? 0 : 1;   // components to add
  return (
    <div>
      <VizHead idx="OS2" title={L("LLM 派:标签一多就该让编码器让位", "The LLM camp: past enough labels, the encoder yields")} />
      <div className="viz-ctrl">
        <Slider label={L("标签数", "labels")} min={2} max={77} step={1} value={labels} onChange={setLabels} />
        <Toggle label={L("已经在跑 LLM", "already run an LLM")} value={haveLlm} onChange={setHaveLlm} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Bar label={L("编码器派", "encoder camp")} value={encoder} max={1} tone={crossover ? "bad" : "ok"} valText={nf(encoder, 3)} />
        <Bar label={L("LLM 派 (Kev-9B ~0.85)", "LLM camp (Kev-9B ~0.85)")} value={llm} max={1} tone="acc" valText={nf(llm, 3)} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("该选哪派", "pick")} value={crossover ? "LLM" : L("编码器", "encoder")} tone="acc" hint={crossover ? L("标签 ≥ 20", "labels ≥ 20") : L("标签少", "few labels")} />
        <Kpi label={L("SemIf 新增组件", "SemIf adds")} value={semifCost} tone={semifCost ? "warn" : "ok"} hint={haveLlm ? L("读现有 logits", "read existing logits") : L("要先有 LLM", "needs an LLM first")} />
        <Kpi label={L("OpenJev 规模", "OpenJev size")} value="26B" tone="mut" hint={L("要大显存", "needs VRAM")} />
      </div>
      <Note mark="=">
        {L("如果你已经在跑 LLM,先试 SemIf 的做法:直接读选项 token 的 logits,零新增组件——你已经在跑的那个模型就是你的决策引擎。标签超过 20、或语义细分,编码器派该让位。",
           "If you already run an LLM, try SemIf first: read the option-token logits, adding no component — the model you already run is your decision engine. Past twenty labels, or fine semantic splits, the encoder should step aside.")}
      </Note>
    </div>
  );
}

/* t15 · routesLab — four routes to a typed decision */
function RoutesViz() {
  const L = useL();
  const [nTasks, setNTasks] = React.useState(1);
  const [haveData, setHaveData] = React.useState(true);
  const ROUTES = [
    { n: L("微调分类器", "fine-tune a classifier"), calib: true, data: true, comp: 2, reuse: "low" },
    { n: L("约束解码", "constrained decoding"), calib: false, data: false, comp: 1, reuse: "mid" },
    { n: L("读 logits (SemIf)", "read logits (SemIf)"), calib: "part", data: false, comp: 0, reuse: "mid" },
    { n: L("System One 模型", "a System One model"), calib: true, data: false, comp: 1, reuse: "high" },
  ];
  // recommendation: one task + data → fine-tune; many tasks → System One
  const rec = nTasks >= 4 ? 3 : (haveData ? 0 : 2);
  return (
    <div>
      <VizHead idx="OS3" title={L("拿到类型化决策的四条路", "Four routes to a typed decision")} />
      <div className="viz-ctrl">
        <Slider label={L("你有几个这样的任务", "how many such tasks")} min={1} max={10} step={1} value={nTasks} onChange={setNTasks} />
        <Toggle label={L("有几百条标注数据", "have hundreds of labels")} value={haveData} onChange={setHaveData} />
      </div>
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        {ROUTES.map((r, i) => (
          <div key={i} className="jv-note" style={{ borderColor: i === rec ? "var(--accent)" : undefined, borderWidth: i === rec ? 2 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <span style={{ font: "600 13px var(--f-body)", color: i === rec ? "var(--accent)" : "var(--ink)" }}>{r.n}{i === rec ? L("  ← 推荐", "  ← recommended") : ""}</span>
              <span style={{ font: "500 11px var(--f-mono)", color: "var(--muted)" }}>
                {L("校准", "calib")}:{r.calib === true ? "✓" : r.calib === "part" ? "~" : "✗"} · {L("新增组件", "adds")}:{r.comp} · {L("复用", "reuse")}:{r.reuse}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Note mark="!">
        {L("约束解码保证 schema 合法,但不给校准概率——这是它和 System One 模型的根本分界,也是选型讨论里最常被混为一谈的地方。一个任务 + 有数据,微调几乎总是赢;System One 赢在很多任务共用一个接口。",
           "Constrained decoding guarantees a valid schema but no calibrated probability — the dividing line from a System One model, and where selection debates conflate the two. One task with data: fine-tuning almost always wins. System One wins on many tasks sharing one interface.")}
      </Note>
    </div>
  );
}

/* =========================================================
   Module VI · EV — 自己评测
   ========================================================= */

/* t16 · baseLab — three baselines make accuracy mean something */
function BaseViz() {
  const L = useL();
  const [k, setK] = React.useState(18);
  const [imbalance, setImbalance] = React.useState(0.3);   // majority-class share proxy
  const [acc, setAcc] = React.useState(0.505);
  const random = 1 / k;
  const majority = clamp(random + imbalance, random, 0.85);
  const keyword = clamp(0.35 + imbalance * 0.4, 0.2, 0.7);
  const verdict = acc <= majority ? "bad" : acc <= keyword ? "warn" : "ok";
  return (
    <div>
      <VizHead idx="EV1" title={L("三条基线:没有基线的准确率是个没单位的数", "Three baselines: accuracy without one has no units")} />
      <div className="viz-ctrl">
        <Slider label={L("类别数 k", "classes k")} min={2} max={40} step={1} value={k} onChange={setK} />
        <Slider label={L("最大类占比(不平衡)", "majority share (imbalance)")} min={0} max={0.6} step={0.02} value={imbalance} onChange={setImbalance} />
        <Slider label={L("你的模型准确率", "your accuracy")} min={0} max={1} step={0.005} value={acc} onChange={setAcc} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Bar label={L("你的模型", "your model")} value={acc} max={1} tone={verdict} valText={nf(acc, 3)} />
        <Bar label={L("关键词规则", "keyword rule")} value={keyword} max={1} tone="warn" valText={nf(keyword, 3)} />
        <Bar label={L("多数类", "majority class")} value={majority} max={1} tone="mut" valText={nf(majority, 3)} />
        <Bar label={L("随机", "random")} value={random} max={1} tone="mut" valText={nf(random, 3)} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("对随机的倍数", "× over random")} value={`${nf(acc / random, 1)}×`} tone="acc" />
        <Kpi label={L("判定", "verdict")} value={verdict === "bad" ? L("等于没做", "did nothing") : verdict === "warn" ? L("勉强", "marginal") : L("学到了", "learned")} tone={verdict} />
      </div>
      <Note mark="!">
        {L("本书实测 0.505 对随机 0.056、多数类 0.120——模型确实学到了东西。但如果你的多数类就有 0.62,那 0.65 的模型等于没做。任何准确率都必须和三条基线一起出现。",
           "Measured here: 0.505 against a random 0.056 and majority 0.120 — the model did learn. But if your majority is 0.62, a 0.65 model did nothing. An accuracy must always appear beside all three baselines.")}
      </Note>
    </div>
  );
}

/* t17 · datasetLab — per-class sample size + taxonomy agreement */
function DatasetViz() {
  const L = useL();
  const [n, setN] = React.useState(216);
  const [k, setK] = React.useState(18);
  const [agree, setAgree] = React.useState(0.72);   // human inter-annotator agreement
  const perClass = n / k;
  const canPerClass = perClass >= 20;
  const taxonomyOk = agree >= 0.8;
  return (
    <div>
      <VizHead idx="EV2" title={L("评测集:样本量与标签体系一致率", "The eval set: sample size and taxonomy agreement")} />
      <div className="viz-ctrl">
        <Slider label={L("标注条数", "labelled rows")} min={40} max={2000} step={20} value={n} onChange={setN} />
        <Slider label={L("类别数", "classes")} min={2} max={40} step={1} value={k} onChange={setK} />
        <Slider label={L("人工两遍一致率", "human agreement")} min={0.4} max={1} step={0.02} value={agree} onChange={setAgree} />
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("每类平均", "rows / class")} value={nf(perClass, 1)} tone={canPerClass ? "ok" : "bad"} />
        <Kpi label={L("能报每类指标?", "per-class metrics?")} value={canPerClass ? L("能", "yes") : L("只能报总体", "overall only")} tone={canPerClass ? "ok" : "warn"} hint={L("经验线 20/类", "rule: 20/class")} />
        <Kpi label={L("标签体系", "taxonomy")} value={taxonomyOk ? L("可测", "testable") : L("先修体系", "fix it first")} tone={taxonomyOk ? "ok" : "bad"} hint={`κ≈${nf(agree, 2)}`} />
      </div>
      <Note mark={taxonomyOk ? "!" : "✗"} tone={taxonomyOk ? "" : "bad"}>
        {taxonomyOk
          ? L("216 条 / 18 类 ≈ 每类 12 条,低于「每类 20 条」的经验线——本书那次能给可信的总体准确率,但给不了可信的每类准确率,报告时必须说明。",
              "216 rows / 18 classes ≈ 12 per class, below the '20 per class' rule — this book's run supports a credible overall accuracy but not per-class ones, and the report must say so.")
          : L("一致率低于 0.8 的标签体系不值得拿去测模型。「仓库管理」和「客户计划变更下的原料保障与库存控制」本来就不互斥,任何模型都会撞墙——先做一致率体检。",
              "A taxonomy below 0.8 agreement is not worth testing a model on. Warehouse management and material assurance under plan changes were never mutually exclusive — every model hits that wall. Check agreement first.")}
      </Note>
    </div>
  );
}

/* t18 · reportLab — read the four tables to a verdict */
function ReportViz() {
  const L = useL();
  const [tbl1, setTbl1] = React.useState(true);    // beats baseline?
  const [tbl3, setTbl3] = React.useState(0.141);   // ECE after fit
  const [tbl4, setTbl4] = React.useState(0.07);    // precision gained from 0.5→0.95
  let verdict, tone;
  if (!tbl1) { verdict = L("没过基线 → 换条路,后面不用看", "fails baseline → another route, stop reading"); tone = "bad"; }
  else if (tbl4 < 0.1) { verdict = L("门槛拉不开精度 → gating 失效,不能上线", "threshold buys no precision → gating fails, do not ship"); tone = "bad"; }
  else if (tbl3 > 0.1) { verdict = L("校准不够 → 概率不能当概率用,只排序", "under-calibrated → use for ranking, not probability"); tone = "warn"; }
  else { verdict = L("可以上线(带门槛和兜底)", "ship it (with threshold and fallback)"); tone = "ok"; }
  return (
    <div>
      <VizHead idx="EV3" title={L("读四张表,读到判决就停", "Read the four tables, stop at the verdict")} />
      <div className="viz-ctrl">
        <Toggle label={L("表一:准确率过了三条基线", "table 1: beats all baselines")} value={tbl1} onChange={setTbl1} />
        <Slider label={L("表三:拟合后 ECE", "table 3: ECE after fit")} min={0.02} max={0.4} step={0.01} value={tbl3} onChange={setTbl3} />
        <Slider label={L("表四:0.5→0.95 精度增益", "table 4: precision gain")} min={0} max={0.4} step={0.01} value={tbl4} onChange={setTbl4} />
      </div>
      <div className="jv-steps" style={{ marginTop: 8 }}>
        <Note mark="1">{L("表一 · 准确率对三条基线:有没有学到东西", "Table 1 · accuracy vs baselines: did it learn?")}</Note>
        <Note mark="2">{L("表二 · 延迟中位与 P95(不报平均,冷启动会骗你)", "Table 2 · median & P95 latency (never the mean — cold starts lie)")}</Note>
        <Note mark="3">{L("表三 · 原样 ECE 与拟合后 ECE", "Table 3 · ECE as-shipped and after fitting")}</Note>
        <Note mark="4">{L("表四 · 门槛能买到多少精度", "Table 4 · how much precision the threshold buys")}</Note>
      </div>
      <div className="jv-kpi-grid">
        <Kpi label={L("判决", "verdict")} value="—" hint={verdict} tone={tone} />
      </div>
      <Note mark="!">
        {L("顺序很重要:表一没过,后三张不用看;表四拉不开精度,前三张再好看也不能上线。本书实测就死在表四:0.5→0.95 只涨 6.6 个点。",
           "Order matters: if table 1 fails, skip the rest; if table 4 buys no precision, the first three cannot justify shipping. This book's run died at table 4: 0.5→0.95 gained only 6.6 points.")}
      </Note>
    </div>
  );
}

window.__JV_VIZ_2 = {
  routeLab: RouteViz, budgetLab: BudgetViz, honestLab: HonestViz,
  encoderLab: EncoderViz, llmLab: LlmViz, routesLab: RoutesViz,
  baseLab: BaseViz, datasetLab: DatasetViz, reportLab: ReportViz,
};
