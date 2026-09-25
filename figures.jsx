/* =========================================================
   figures.jsx — <Figure>, SVG primitives, and every diagram.
   24 chapter figures (t1…t24) + 8 module-architecture figures
   (m1-arch…m8-arch). Dependency-free, theme-aware: colors come
   from CSS vars, short labels only (full sentences go in cap,
   which the browser wraps). index.html loads this one file.
   ========================================================= */

const FIGN = {};
const FTONE = { p: "var(--primary)", a: "var(--accent)", m: "var(--muted)", bad: "var(--bad)", ok: "var(--ok)", warn: "var(--warn)", n: "var(--surface-2)" };

function FigFrame({ w = 680, h = 220, cap, idx, children }) {
  const L = useL();
  return (
    <figure className="jv-fig">
      <svg className="jv-fig-svg" viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet" role="img">
        {children}
      </svg>
      {cap ? <figcaption>{idx ? <span className="fno">{L(`图 ${idx}`, `Fig. ${idx}`)}</span> : null}{cap}</figcaption> : null}
    </figure>
  );
}
function FArrow({ x1, y1, x2, y2, dash, c = "var(--muted)", wdt = 1.3 }) {
  const ang = Math.atan2(y2 - y1, x2 - x1), s = 5.5;
  const tip = `${x2},${y2} ${(x2 - s * Math.cos(ang - 0.42)).toFixed(1)},${(y2 - s * Math.sin(ang - 0.42)).toFixed(1)} ${(x2 - s * Math.cos(ang + 0.42)).toFixed(1)},${(y2 - s * Math.sin(ang + 0.42)).toFixed(1)}`;
  return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={wdt} strokeDasharray={dash ? "4 3" : ""} /><polygon points={tip} fill={c} /></g>;
}
function FBox({ x, y, w, h, label, sub, tone = "n", dash }) {
  const solid = tone !== "n", c = FTONE[tone] || FTONE.n;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={solid ? `color-mix(in srgb, ${c} 84%, transparent)` : "var(--surface-2)"}
        stroke={c} strokeWidth="1.2" strokeDasharray={dash ? "4 3" : ""} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 1)} textAnchor="middle" dominantBaseline="middle" style={{ font: "600 11.5px var(--f-mono)", fill: solid ? "#fff" : "var(--ink)" }}>{label}</text>
      {sub ? <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" style={{ font: "500 8.5px var(--f-mono)", fill: solid ? "rgba(255,255,255,.85)" : "var(--muted)" }}>{sub}</text> : null}
    </g>
  );
}
const FT = ({ x, y, children, anchor = "middle", sz = 10, c = "var(--muted)", wt = 500 }) =>
  <text x={x} y={y} textAnchor={anchor} style={{ font: `${wt} ${sz}px var(--f-mono)`, fill: c }}>{children}</text>;

/* ---- axis-free bar helper for tiny inline charts inside a figure ---- */
function FBars({ x, y, w, h, vals, tone = "p", hi }) {
  const mx = hi || Math.max(...vals), n = vals.length, bw = w / n;
  return vals.map((v, i) => {
    const bh = (v / mx) * h;
    return <rect key={i} x={x + i * bw + 1} y={y + h - bh} width={bw - 2} height={bh} rx="1.5"
      fill={FTONE[tone]} opacity={0.55 + 0.45 * (v / mx)} />;
  });
}

/* ================= chapter figures ================= */

// t1 — two pipelines
FIGN["t1-pipes"] = () => (
  <FigFrame idx="SO1" cap={useL()("生成再解析:一串 token 经过校验、重试、修复;直接决策:一次前向出枚举 + 概率。", "Generate-then-parse threads tokens through validation, retries, repair; the decision path returns an enum and a probability in one forward pass.")}>
    <FBox x={20} y={30} w={80} h={34} label="state" tone="n" />
    <FArrow x1={100} y1={47} x2={140} y2={47} />
    <FBox x={140} y={22} w={90} h={50} label="LLM" sub="autoregress" tone="warn" />
    <FArrow x1={230} y1={47} x2={270} y2={47} />
    <FBox x={270} y={30} w={70} h={34} label="JSON" tone="n" />
    <FArrow x1={340} y1={47} x2={378} y2={47} />
    <FBox x={378} y={22} w={80} h={50} label={useL()("校验/重试", "validate")} tone="bad" dash />
    <FArrow x1={458} y1={47} x2={496} y2={47} />
    <FBox x={496} y={30} w={70} h={34} label={useL()("枚举?", "enum?")} tone="m" />
    <FT x={300} y={100} sz={9}>{useL()("↑ 四类失败:截断 / 字段漂移 / 枚举拼错 / 非法", "↑ four failures: truncation / drift / misspelled / invalid")}</FT>
    <line x1={20} y1={130} x2={660} y2={130} stroke="var(--hairline)" />
    <FBox x={20} y={150} w={80} h={34} label="state" tone="n" />
    <FArrow x1={100} y1={167} x2={200} y2={167} c="var(--ok)" wdt={2} />
    <FBox x={200} y={144} w={110} h={46} label={useL()("一次前向", "one forward")} tone="ok" />
    <FArrow x1={310} y1={167} x2={410} y2={167} c="var(--ok)" wdt={2} />
    <FBox x={410} y={150} w={160} h={34} label={useL()("枚举 + 概率 0.94", "enum + prob 0.94")} tone="p" />
  </FigFrame>
);

// t2 — three primitives as distributions
FIGN["t2-prims"] = () => {
  const L = useL();
  return (
    <FigFrame idx="SO2" cap={L("choice 返回整个分布,score 返回有序期望,noul 的数值本身就是概率——三种形状,一个 softmax。", "choice returns the whole distribution, score an ordinal expectation, noul's value is itself the probability — three shapes, one softmax.")}>
      <FT x={110} y={24} wt={700} sz={11} c="var(--ink)">choice</FT>
      <FBars x={40} y={34} w={150} h={64} vals={[0.62, 0.2, 0.1, 0.08]} tone="p" hi={0.7} />
      <FT x={110} y={112}>4 opts · argmax</FT>
      <FT x={340} y={24} wt={700} sz={11} c="var(--ink)">score</FT>
      <FBars x={270} y={34} w={150} h={64} vals={[0.1, 0.25, 0.4, 0.2, 0.05]} tone="a" hi={0.45} />
      <FT x={345} y={112}>E[level] = 1.84</FT>
      <FT x={570} y={24} wt={700} sz={11} c="var(--ink)">noul</FT>
      <FBars x={520} y={34} w={100} h={64} vals={[0.18, 0.82]} tone="ok" hi={1} />
      <FT x={570} y={112}>P(true) = 0.82</FT>
      <FT x={340} y={150} sz={9.5}>{L("选项数 k 决定随机基线、熵上界与置信度的量纲", "k sets the random baseline, the entropy ceiling and confidence's units")}</FT>
    </FigFrame>
  );
};

// t3 — token tax
FIGN["t3-tax"] = () => {
  const L = useL();
  const P = 30, W = 620, H = 150, mx = 40 * 22;
  const ar = (o) => 150 - P - ((3 + 22 * o) / mx) * (H - 2 * P);
  const pts = []; for (let o = 1; o <= 40; o++) pts.push(`${o === 1 ? "M" : "L"}${(P + (o / 40) * (W - 2 * P)).toFixed(1)},${ar(o).toFixed(1)}`);
  return (
    <FigFrame idx="SO3" cap={L("自回归延迟随输出 token 线性增长;一次前向是一条平线——差距在「短输入长输出」时最大。", "Autoregressive latency grows linearly with output tokens; single-forward is flat — the gap is widest with short inputs and long outputs.")}>
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} stroke="var(--hairline-strong)" />
      <path d={pts.join(" ")} fill="none" stroke="var(--bad)" strokeWidth="2" />
      <line x1={P} y1={H - P - 12} x2={W - P} y2={H - P - 12} stroke="var(--ok)" strokeWidth="2" />
      <FT x={W - 60} y={H - P - 28} c="var(--bad)" wt={700}>autoregressive</FT>
      <FT x={P + 90} y={H - P - 18} c="var(--ok)" wt={700}>single forward</FT>
      <FT x={W / 2} y={H - 6} sz={9}>{L("输出 token →", "output tokens →")}</FT>
    </FigFrame>
  );
};

// t4 — request/response
FIGN["t4-api"] = () => {
  const L = useL();
  return (
    <FigFrame idx="JV1" cap={L("questions 是字典:按名字取答案;criteria 的键给程序 switch,描述给模型判断。", "questions is a dict — answers fetched by name; the criteria key is for your switch, the description is what the model judges by.")}>
      <FBox x={20} y={40} w={180} h={120} label="" tone="n" />
      <FT x={110} y={34} c="var(--ink)" wt={700}>request</FT>
      <FT x={34} y={66} anchor="start" sz={9.5} c="var(--ink)">state: {"{...}"}</FT>
      <FT x={34} y={88} anchor="start" sz={9.5} c="var(--ink)">questions:</FT>
      <FT x={44} y={108} anchor="start" sz={9} c="var(--muted)">department: choice</FT>
      <FT x={44} y={124} anchor="start" sz={9} c="var(--muted)">urgency: score</FT>
      <FT x={44} y={140} anchor="start" sz={9} c="var(--muted)">churn: noul</FT>
      <FArrow x1={200} y1={100} x2={280} y2={100} wdt={2} c="var(--primary)" />
      <FBox x={280} y={70} w={110} h={60} label="/v1/systemone" tone="p" />
      <FArrow x1={390} y1={100} x2={470} y2={100} wdt={2} c="var(--primary)" />
      <FBox x={470} y={40} w={190} h={120} label="" tone="n" />
      <FT x={565} y={34} c="var(--ink)" wt={700}>response</FT>
      <FT x={484} y={66} anchor="start" sz={9.5} c="var(--ink)">department: billing</FT>
      <FT x={484} y={86} anchor="start" sz={9} c="var(--muted)">prob 0.94 · conf 0.86</FT>
      <FT x={484} y={110} anchor="start" sz={9.5} c="var(--ink)">urgency: 1.84 / 2</FT>
      <FT x={484} y={134} anchor="start" sz={9.5} c="var(--ink)">usage: in=142 out=0</FT>
    </FigFrame>
  );
};

// t5 — free output → fan-out
FIGN["t5-fanout"] = () => {
  const L = useL();
  return (
    <FigFrame idx="JV2" cap={L("按需多次每问重付一遍 state;一次扇出只付一次 state,输出免费,几乎不加钱。", "On-demand pays for the state per question; one fan-out pays for the state once — output is free, so the extra questions cost almost nothing.")}>
      <FT x={160} y={24} wt={700} c="var(--ink)">{L("按需多次", "on demand")}</FT>
      {[0, 1, 2].map((i) => (<g key={i}>
        <FBox x={30 + i * 100} y={40} w={44} h={26} label="state" tone="bad" />
        <FBox x={74 + i * 100} y={40} w={30} h={26} label="q" tone="n" />
      </g>))}
      <FT x={160} y={86} sz={9} c="var(--bad)">{L("state × 3 = 付三遍", "state × 3 paid")}</FT>
      <line x1={20} y1={104} x2={660} y2={104} stroke="var(--hairline)" />
      <FT x={160} y={128} wt={700} c="var(--ink)">{L("一次扇出", "one fan-out")}</FT>
      <FBox x={30} y={142} w={70} h={30} label="state" tone="ok" />
      {[0, 1, 2, 3, 4].map((i) => <FBox key={i} x={112 + i * 40} y={142} w={34} h={30} label={`q${i + 1}`} tone="n" />)}
      <FT x={470} y={162} anchor="start" sz={9} c="var(--ok)">{L("← state 付一次,问题免费", "← state paid once, questions free")}</FT>
    </FigFrame>
  );
};

// t6 — benchmark decomposed by cardinality
FIGN["t6-claim"] = () => {
  const L = useL();
  const P = 34, W = 620, H = 150;
  const X = (k) => P + (k / 77) * (W - 2 * P), Y = (a) => H - 24 - a * (H - 48);
  const jev = []; const enc = [];
  for (let k = 2; k <= 77; k += 3) { jev.push(`${k === 2 ? "M" : "L"}${X(k)},${Y(Math.max(0.83, 0.97 - 0.0012 * k))}`); enc.push(`${k === 2 ? "M" : "L"}${X(k)},${Y(Math.max(0.3, 0.9 - 0.0075 * k))}`); }
  return (
    <FigFrame idx="JV3" cap={L("标签越多,开源编码器派掉得越快,而 Jev 基本不动——Banking77 是这一类模型的压力测试。", "As labels multiply the open encoder camp falls away while Jev barely moves — Banking77 is this category's stress test.")}>
      <line x1={P} y1={H - 24} x2={W - P} y2={H - 24} stroke="var(--hairline-strong)" />
      <path d={jev.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />
      <path d={enc.join(" ")} fill="none" stroke="var(--bad)" strokeWidth="2" />
      <FT x={X(70)} y={Y(0.9)} c="var(--accent)" wt={700}>Jev 0.87</FT>
      <FT x={X(70)} y={Y(0.34)} c="var(--bad)" wt={700}>enc 0.42</FT>
      <FT x={X(4)} y={H - 8} sz={9}>2</FT><FT x={X(77)} y={H - 8} sz={9}>77 {L("标签", "labels")}</FT>
    </FigFrame>
  );
};

// t7 — reliability diagram
FIGN["t7-reliab"] = () => {
  const L = useL();
  const P = 30, S = 130, x0 = 60, y0 = 20;
  const X = (v) => x0 + v * S, Y = (v) => y0 + S - v * S;
  const bins = [[0.55, 0.42], [0.65, 0.48], [0.75, 0.55], [0.85, 0.6], [0.95, 0.66]];
  return (
    <FigFrame idx="CA1" cap={L("过度自信的模型:点落在对角线下方,自报置信度总高于实际准确率。ECE 是这些竖直落差的加权平均。", "An overconfident model: points sit below the diagonal, reported confidence always above actual accuracy. ECE is the weighted mean of those vertical gaps.")}>
      <rect x={x0} y={y0} width={S} height={S} fill="none" stroke="var(--hairline)" />
      <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--muted)" strokeDasharray="4 4" />
      {bins.map((b, i) => (<g key={i}>
        <line x1={X(b[0])} y1={Y(b[0])} x2={X(b[0])} y2={Y(b[1])} stroke="var(--bad)" strokeWidth="1.4" />
        <circle cx={X(b[0])} cy={Y(b[1])} r="4" fill="var(--primary)" />
      </g>))}
      <FT x={x0 + S / 2} y={y0 + S + 16} sz={9}>confidence →</FT>
      <FT x={x0 - 8} y={y0 + S / 2} anchor="end" sz={9}>acc</FT>
      <FT x={340} y={60} anchor="start" sz={10} c="var(--ink)" wt={600}>{L("完美校准 = 落在对角线上", "perfect calibration = on the diagonal")}</FT>
      <FT x={340} y={82} anchor="start" sz={10} c="var(--bad)">{L("下方 = 过度自信(报 0.95,实际 0.66)", "below = overconfident (says 0.95, is 0.66)")}</FT>
      <FT x={340} y={104} anchor="start" sz={10} c="var(--muted)">{L("ECE = Σ 桶权重 × |准确率 − 置信度|", "ECE = Σ bin-weight × |acc − conf|")}</FT>
    </FigFrame>
  );
};

// t8 — temperature scaling
FIGN["t8-temp"] = () => {
  const L = useL();
  return (
    <FigFrame idx="CA2" cap={L("温度 T 把 logits 拉平,分布变缓但 argmax 不变——准确率纹丝不动,只有概率被校准。", "Temperature T flattens the logits: the distribution softens but the argmax is unchanged — accuracy does not move, only the probabilities are calibrated.")}>
      <FT x={130} y={24} wt={700} c="var(--ink)">T = 1 ({L("过度自信", "overconfident")})</FT>
      <FBars x={50} y={36} w={160} h={70} vals={[0.9, 0.05, 0.03, 0.02]} tone="bad" hi={1} />
      <FT x={130} y={122}>top = 0.90</FT>
      <FArrow x1={250} y1={80} x2={330} y2={80} wdt={2} c="var(--primary)" />
      <FT x={290} y={68} sz={9} c="var(--primary)">÷ 1.65</FT>
      <FT x={470} y={24} wt={700} c="var(--ink)">T = 1.65 ({L("已校准", "calibrated")})</FT>
      <FBars x={380} y={36} w={160} h={70} vals={[0.66, 0.16, 0.11, 0.07]} tone="ok" hi={1} />
      <FT x={460} y={122}>top = 0.66 · {L("同一个 argmax", "same argmax")}</FT>
      <FT x={340} y={150} sz={9.5} c="var(--bad)">{L("反例:出厂 choice:11+ 桶 T=0.1006,把 0.24 放大成 0.99 → 库拒绝", "counter-example: shipped choice:11+ bucket T=0.1006 inflates 0.24 to 0.99 → refused")}</FT>
    </FigFrame>
  );
};

// t9 — gate curve
FIGN["t9-gate"] = () => {
  const L = useL();
  const g = [[0.5, 0.565, 0.623], [0.6, 0.505, 0.624], [0.7, 0.458, 0.657], [0.8, 0.361, 0.654], [0.85, 0.319, 0.638], [0.9, 0.292, 0.651], [0.95, 0.208, 0.689]];
  const P = 40, W = 620, H = 160;
  const X = (i) => P + (i / (g.length - 1)) * (W - 2 * P), Y = (v) => H - 28 - v * (H - 56);
  return (
    <FigFrame idx="CA3" cap={L("本书实测:门槛升高,覆盖率(蓝)大幅下滑,精度(橙)几乎不动——置信度不区分对错,gating 失效。", "Measured here: as the threshold rises, coverage (blue) falls sharply while precision (amber) barely moves — confidence does not separate right from wrong, and gating fails.")}>
      <line x1={P} y1={H - 28} x2={W - P} y2={H - 28} stroke="var(--hairline-strong)" />
      <path d={g.map((r, i) => `${i ? "L" : "M"}${X(i)},${Y(r[1])}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2" />
      <path d={g.map((r, i) => `${i ? "L" : "M"}${X(i)},${Y(r[2])}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {g.map((r, i) => <FT key={i} x={X(i)} y={H - 12} sz={8}>{nf(r[0], 2)}</FT>)}
      <FT x={X(1)} y={Y(0.565) - 10} c="var(--primary)" wt={700}>{L("覆盖 56%→21%", "coverage 56%→21%")}</FT>
      <FT x={X(4)} y={Y(0.638) + 18} c="var(--accent)" wt={700}>{L("精度 0.62→0.69", "precision 0.62→0.69")}</FT>
    </FigFrame>
  );
};

// t10 — router
FIGN["t10-router"] = () => {
  const L = useL();
  return (
    <FigFrame idx="LY1" cap={L("路由器先做亚毫秒脚本/语言检测,再派给对应 checkpoint;非拉丁文字走多语言,英文 checkpoint 在其上会崩。", "The router runs sub-millisecond script/language detection then dispatches; non-Latin goes multilingual, and the English checkpoint collapses on it.")}>
      <FBox x={20} y={90} w={90} h={36} label={useL()("输入文本", "input")} tone="n" />
      <FArrow x1={110} y1={108} x2={160} y2={108} />
      <FBox x={160} y={84} w={110} h={48} label="Router" sub="script + lang" tone="p" />
      <FArrow x1={270} y1={95} x2={330} y2={55} c="var(--ok)" />
      <FArrow x1={270} y1={108} x2={330} y2={108} c="var(--accent)" />
      <FArrow x1={270} y1={120} x2={330} y2={160} c="var(--muted)" />
      <FBox x={330} y={38} w={160} h={34} label="laya" sub="ModernBERT 421M · en" tone="ok" />
      <FBox x={330} y={92} w={160} h={34} label="laya-multilingual" sub="mmBERT 322M · 100+" tone="acc" />
      <FBox x={330} y={146} w={160} h={34} label="typed-decisions" sub="fine-tuned" tone="m" />
      <FT x={560} y={55} anchor="start" sz={9} c="var(--bad)">{L("中文/高棉走这→崩", "zh/km here→collapse")}</FT>
      <FT x={560} y={108} anchor="start" sz={9} c="var(--ok)">{L("中文正确分支", "Chinese correct")}</FT>
    </FigFrame>
  );
};

// t11 — token budget split
FIGN["t11-budget"] = () => {
  const L = useL();
  return (
    <FigFrame idx="LY2" cap={L("序列预算被切成两半:head_max_len 给选项,其余给正文。18 标签时每标签只剩约 13 token,描述被截断。", "The sequence budget splits in two: head_max_len for options, the rest for the document. At 18 labels each keeps ~13 tokens and the description is truncated.")}>
      <rect x={30} y={50} width={620} height={40} fill="var(--surface-2)" stroke="var(--hairline)" />
      <rect x={30} y={50} width={230} height={40} fill="color-mix(in srgb, var(--accent) 30%, transparent)" stroke="var(--accent)" />
      <FT x={145} y={74} c="var(--ink)" wt={600}>head_max_len = 256</FT>
      <FT x={455} y={74} c="var(--ink)" wt={600}>{L("正文 max_len − head", "document")}</FT>
      {[...Array(18)].map((_, i) => <line key={i} x1={30 + (i + 1) * (230 / 18)} y1={50} x2={30 + (i + 1) * (230 / 18)} y2={90} stroke="var(--accent)" strokeWidth="0.6" opacity="0.5" />)}
      <FT x={145} y={112} sz={9.5} c="var(--bad)">{L("18 标签 → 每标签 (256−16)//18 ≈ 13 token", "18 labels → (256−16)//18 ≈ 13 tokens each")}</FT>
      <FT x={145} y={132} sz={9.5} c="var(--bad)">{L("Banking77 → 每标签 3–4 token → 0.425", "Banking77 → 3–4 tokens each → 0.425")}</FT>
      <FT x={340} y={168} sz={9.5} c="var(--muted)">{L("本书实测:预算 256→1024 准确率不动,P95 447→2290ms", "measured: 256→1024 moves accuracy 0, P95 447→2290ms")}</FT>
    </FigFrame>
  );
};

// t12 — noul label bias
FIGN["t12-noul"] = () => {
  const L = useL();
  return (
    <FigFrame idx="LY3" cap={L("noul 把两个选项渲染成 false:/true:;英文 checkpoint 上这对标签可能压过正文,对该答「是」的输入答「否」。", "noul renders its options as false:/true:; on the English checkpoint that label pair can dominate the document and answer no to a yes input.")}>
      <FBox x={30} y={40} w={150} h={34} label={useL()("正文:该答「是」", "input: truly yes")} tone="ok" />
      <FArrow x1={180} y1={57} x2={230} y2={57} />
      <FBox x={230} y={30} w={150} h={54} label="false: / true:" sub={useL()("标签牵引", "label pull")} tone="bad" />
      <FArrow x1={380} y1={57} x2={430} y2={57} c="var(--bad)" />
      <FBox x={430} y={40} w={100} h={34} label={useL()("答:否 ✗", "answer: no ✗")} tone="bad" />
      <line x1={30} y1={100} x2={650} y2={100} stroke="var(--hairline)" />
      <FBox x={30} y={116} w={150} h={34} label={useL()("改二选一 choice", "as 2-opt choice")} tone="p" />
      <FArrow x1={180} y1={133} x2={230} y2={133} c="var(--ok)" />
      <FBox x={230} y={112} w={150} h={42} label="A: yes / B: no" sub={useL()("中性键", "neutral keys")} tone="ok" />
      <FArrow x1={380} y1={133} x2={430} y2={133} c="var(--ok)" />
      <FBox x={430} y={116} w={100} h={34} label={useL()("答:A 是 ✓", "answer: A yes ✓")} tone="ok" />
    </FigFrame>
  );
};

// t13 — encoder camp / latency-is-accuracy
FIGN["t13-encoder"] = () => {
  const L = useL();
  const rows = [["Verdict", 12, 0.77], ["Von", 18, 0.72], ["Laya", 33, 0.505], ["Jev", 115, 0.966]];
  return (
    <FigFrame idx="OS1" cap={L("编码器派用参数量换延迟;当决策频率高到延迟成为胜负手,快模型的有效质量反超慢的准模型。", "The encoder camp trades parameters for latency; when decisions come fast enough, a fast model's effective quality overtakes a slower, more accurate one.")}>
      <FT x={80} y={26} sz={9} c="var(--muted)">{L("延迟", "latency")}</FT><FT x={340} y={26} sz={9} c="var(--muted)">{L("自报准确率", "self-reported acc")}</FT>
      {rows.map((r, i) => (<g key={i}>
        <FT x={70} y={56 + i * 30} anchor="end" sz={10} c="var(--ink)" wt={600}>{r[0]}</FT>
        <rect x={80} y={46 + i * 30} width={r[1] * 1.4} height={16} rx="2" fill="var(--bad)" opacity="0.7" />
        <FT x={82 + r[1] * 1.4} y={58 + i * 30} anchor="start" sz={9}>{r[1]}ms</FT>
        <rect x={340} y={46 + i * 30} width={r[2] * 200} height={16} rx="2" fill="var(--primary)" opacity="0.75" />
        <FT x={344 + r[2] * 200} y={58 + i * 30} anchor="start" sz={9}>{nf(r[2], 2)}</FT>
      </g>))}
      <FT x={340} y={182} sz={9.5} c="var(--accent)">{L("ViZDoom 实时对战:Von 9.00 击杀 > Jev 5.62", "real-time ViZDoom: Von 9.00 kills > Jev 5.62")}</FT>
    </FigFrame>
  );
};

// t14 — LLM camp routes
FIGN["t14-llm"] = () => {
  const L = useL();
  return (
    <FigFrame idx="OS2" cap={L("Kev 微调 Qwen 加 LoRA;SemIf 不训练,直接读现有模型选项 token 的 logits——零新增组件。", "Kev fine-tunes Qwen with LoRA; SemIf trains nothing and reads the option-token logits of a model you already run — zero new components.")}>
      <FBox x={40} y={40} w={140} h={44} label="Kev" sub="Qwen3.5 + LoRA 0.8–9B" tone="p" />
      <FArrow x1={180} y1={62} x2={240} y2={62} />
      <FBox x={240} y={40} w={120} h={44} label="0.837 / 0.852" tone="ok" />
      <line x1={20} y1={104} x2={660} y2={104} stroke="var(--hairline)" />
      <FBox x={40} y={120} w={140} h={44} label={useL()("你已有的 LLM", "your existing LLM")} tone="n" />
      <FArrow x1={180} y1={142} x2={240} y2={142} c="var(--ok)" />
      <FBox x={240} y={120} w={130} h={44} label="SemIf" sub={useL()("读 logits", "read logits")} tone="ok" />
      <FArrow x1={370} y1={142} x2={430} y2={142} c="var(--ok)" />
      <FBox x={430} y={120} w={160} h={44} label={useL()("0 新增组件", "0 new components")} tone="acc" />
    </FigFrame>
  );
};

// t15 — four routes
FIGN["t15-routes"] = () => {
  const L = useL();
  const R = [[L("微调分类器", "fine-tune"), "✓", "0", L("单任务赢", "wins 1 task")], [L("约束解码", "constrained"), "✗", "1", L("只保 schema", "schema only")], [L("读 logits", "read logits"), "~", "0", L("已有 LLM", "have LLM")], [L("System One", "System One"), "✓", "1", L("多任务共享", "many tasks")]];
  return (
    <FigFrame idx="OS3" cap={L("四条路到类型化决策。约束解码保证格式但不给校准概率——这是它和 System One 模型的根本分界。", "Four routes to a typed decision. Constrained decoding guarantees format but no calibrated probability — the dividing line from a System One model.")}>
      <FT x={110} y={30} sz={9} c="var(--muted)">{L("路线", "route")}</FT><FT x={330} y={30} sz={9} c="var(--muted)">{L("校准", "calib")}</FT><FT x={430} y={30} sz={9} c="var(--muted)">{L("新增", "adds")}</FT><FT x={540} y={30} sz={9} c="var(--muted)">{L("赢在", "wins on")}</FT>
      {R.map((r, i) => (<g key={i}>
        <FBox x={30} y={44 + i * 34} w={180} h={26} label={r[0]} tone={i === 3 ? "acc" : "n"} />
        <FT x={330} y={62 + i * 34} sz={12} c={r[1] === "✓" ? "var(--ok)" : r[1] === "✗" ? "var(--bad)" : "var(--warn)"} wt={700}>{r[1]}</FT>
        <FT x={430} y={62 + i * 34} sz={11} c="var(--ink)">{r[2]}</FT>
        <FT x={540} y={62 + i * 34} sz={9.5} c="var(--muted)">{r[3]}</FT>
      </g>))}
    </FigFrame>
  );
};

// t16 — baselines
FIGN["t16-base"] = () => {
  const L = useL();
  const rows = [[L("你的模型", "your model"), 0.505, "warn"], [L("关键词规则", "keyword"), 0.42, "m"], [L("多数类", "majority"), 0.12, "m"], [L("随机", "random"), 0.056, "m"]];
  return (
    <FigFrame idx="EV1" cap={L("同一个 0.505,对着三条基线才有意义:高出随机九倍是强,但若多数类就有 0.62 便等于没做。", "The same 0.505 only means something against three baselines: nine times random is strong, but if the majority is 0.62 it did nothing.")}>
      {rows.map((r, i) => (<g key={i}>
        <FT x={130} y={54 + i * 32} anchor="end" sz={10} c="var(--ink)" wt={i === 0 ? 700 : 500}>{r[0]}</FT>
        <rect x={140} y={42 + i * 32} width={r[1] * 480} height={18} rx="2" fill={FTONE[r[2]]} opacity={i === 0 ? 0.9 : 0.55} />
        <FT x={148 + r[1] * 480} y={55 + i * 32} anchor="start" sz={9.5}>{nf(r[1], 3)}</FT>
      </g>))}
      <FT x={360} y={168} sz={9.5} c="var(--muted)">{L("任何准确率都必须和三条基线一起出现", "an accuracy must always appear beside all three baselines")}</FT>
    </FigFrame>
  );
};

// t17 — dataset sizing
FIGN["t17-dataset"] = () => {
  const L = useL();
  return (
    <FigFrame idx="EV2" cap={L("216 条 / 18 类 ≈ 每类 12 条,低于 20/类经验线:总体准确率可信,每类不可信;标签重叠则先做一致率体检。", "216 rows / 18 classes ≈ 12 each, below the 20/class rule: overall accuracy is credible, per-class is not; overlapping labels need an agreement check first.")}>
      <FT x={120} y={30} c="var(--ink)" wt={700}>216 / 18 = 12/{L("类", "cls")}</FT>
      {[...Array(18)].map((_, i) => <rect key={i} x={30 + (i % 9) * 28} y={44 + Math.floor(i / 9) * 22} width={24} height={18} rx="2" fill="var(--surface-2)" stroke="var(--bad)" strokeWidth="0.8" />)}
      <line x1={30} y1={100} x2={282} y2={100} stroke="var(--muted)" strokeDasharray="3 3" />
      <FT x={300} y={70} anchor="start" sz={9.5} c="var(--bad)">{L("← 每类 12 < 20 经验线", "← 12/class < 20 rule")}</FT>
      <FBox x={360} y={116} w={130} h={40} label={useL()("仓库管理", "warehouse")} tone="warn" />
      <FBox x={510} y={116} w={140} h={40} label={useL()("库存控制", "inventory ctrl")} tone="warn" />
      <line x1={490} y1={136} x2={510} y2={136} stroke="var(--bad)" strokeWidth="2" strokeDasharray="3 2" />
      <FT x={505} y={112} sz={9} c="var(--bad)">{L("语义重叠", "overlap")}</FT>
      <FT x={175} y={150} sz={9.5} c="var(--muted)">{L("κ < 0.8 的标签体系不值得测模型", "κ < 0.8 taxonomy: don't test a model")}</FT>
    </FigFrame>
  );
};

// t18 — four tables funnel
FIGN["t18-report"] = () => {
  const L = useL();
  const T = [[L("表一 · 基线", "T1 · baselines"), L("学到了?", "learned?")], [L("表二 · 延迟", "T2 · latency"), L("中位/P95", "med/P95")], [L("表三 · 校准", "T3 · calib"), L("ECE 前/后", "ECE pre/post")], [L("表四 · 门槛", "T4 · gate"), L("能买到精度?", "buys precision?")]];
  return (
    <FigFrame idx="EV3" cap={L("按顺序读:表一没过就停;表四拉不开精度,前三张再好看也不能上线。本书实测死在表四。", "Read in order: stop if table 1 fails; if table 4 buys no precision, the first three cannot justify shipping. This book's run died at table 4.")}>
      {T.map((t, i) => (<g key={i}>
        <FBox x={40 + i * 160} y={70} w={140} h={50} label={t[0]} sub={t[1]} tone={i === 3 ? "bad" : "p"} />
        {i < 3 && <FArrow x1={180 + i * 160} y1={95} x2={200 + i * 160} y2={95} wdt={2} />}
      </g>))}
      <FT x={110} y={150} sz={10} c="var(--ok)">✓</FT><FT x={270} y={150} sz={10} c="var(--ok)">✓</FT><FT x={430} y={150} sz={10} c="var(--warn)">~</FT><FT x={590} y={150} sz={10} c="var(--bad)" wt={700}>✗ 6.6pt</FT>
    </FigFrame>
  );
};

// t19 — drop-in server
FIGN["t19-serve"] = () => {
  const L = useL();
  return (
    <FigFrame idx="OP1" cap={L("laya-serve 暴露 Jev 同协议的 /v1/systemone,已有 Jev 客户端只改 baseUrl;但默认无鉴权,别直接上公网。", "laya-serve exposes Jev's /v1/systemone; an existing Jev client only repoints baseUrl — but there is no auth by default, so keep it off the public net.")}>
      <FBox x={30} y={80} w={130} h={44} label={useL()("Jev 客户端", "Jev client")} sub="baseUrl = ..." tone="p" />
      <FArrow x1={160} y1={102} x2={240} y2={102} wdt={2} c="var(--primary)" />
      <FBox x={240} y={70} w={160} h={64} label="laya-serve" sub="/v1/systemone" tone="ok" />
      <FArrow x1={400} y1={102} x2={480} y2={102} />
      <FBox x={480} y={64} w={80} h={30} label="english" tone="m" />
      <FBox x={480} y={100} w={80} h={30} label="multiling." tone="m" />
      <FT x={320} y={158} sz={9.5} c="var(--bad)">{L("⚠ 默认无鉴权 → 设 LAYA_API_KEY,别直接暴露", "⚠ no auth by default → set LAYA_API_KEY, don't expose")}</FT>
    </FigFrame>
  );
};

// t20 — capacity wall
FIGN["t20-capacity"] = () => {
  const L = useL();
  const P = 40, W = 620, H = 160;
  const X = (r) => P + r * (W - 2 * P), Y = (v) => H - 28 - Math.min(v, 1) * (H - 56);
  const pts = []; for (let r = 0.05; r < 0.98; r += 0.02) pts.push(`${r === 0.05 ? "M" : "L"}${X(r)},${Y((r / (1 - r)) / 12)}`);
  return (
    <FigFrame idx="OP2" cap={L("P95 随利用率 ρ 上升,逼近 1 时突然起飞——那个拐点就是容量墙。按 P95 而不是平均定 worker 数。", "P95 rises with utilisation ρ and takes off as it nears 1 — that knee is the capacity wall. Size workers on P95, not the mean.")}>
      <line x1={P} y1={H - 28} x2={W - P} y2={H - 28} stroke="var(--hairline-strong)" />
      <path d={pts.join(" ")} fill="none" stroke="var(--bad)" strokeWidth="2" />
      <line x1={X(0.85)} y1={20} x2={X(0.85)} y2={H - 28} stroke="var(--accent)" strokeDasharray="4 3" />
      <FT x={X(0.85)} y={16} sz={9} c="var(--accent)">ρ ≈ 0.85</FT>
      <FT x={X(0.5)} y={H - 10} sz={9}>{L("利用率 ρ →", "utilisation ρ →")}</FT>
      <FT x={P + 6} y={40} anchor="start" sz={9} c="var(--muted)">P95</FT>
    </FigFrame>
  );
};

// t21 — two tiers
FIGN["t21-tier"] = () => {
  const L = useL();
  return (
    <FigFrame idx="OP3" cap={L("门槛之上模型自动处理,之下转 LLM 或人工;门槛由兜底容量决定,监控看推翻率——唯一带标签的线上信号。", "Above the threshold the model auto-handles; below it goes to an LLM or a human. The threshold is set by fallback capacity; monitor the override rate — the one labelled online signal.")}>
      <FBox x={30} y={90} w={100} h={40} label={useL()("请求流", "requests")} tone="n" />
      <FArrow x1={130} y1={110} x2={200} y2={110} />
      <FBox x={200} y={84} w={120} h={52} label={useL()("模型 + 门槛", "model + threshold")} tone="p" />
      <FArrow x1={320} y1={95} x2={400} y2={55} c="var(--ok)" />
      <FArrow x1={320} y1={125} x2={400} y2={160} c="var(--warn)" />
      <FBox x={400} y={38} w={160} h={34} label={useL()("上层 · 自动 (conf≥τ)", "tier 1 · auto (conf≥τ)")} tone="ok" />
      <FBox x={400} y={146} w={160} h={34} label={useL()("下层 · LLM / 人工", "tier 2 · LLM / human")} tone="warn" />
      <FT x={470} y={108} anchor="start" sz={9} c="var(--muted)">{L("推翻率 = 准实时准确率", "override rate = live acc proxy")}</FT>
    </FigFrame>
  );
};

// t22 — attribution
FIGN["t22-case"] = () => {
  const L = useL();
  return (
    <FigFrame idx="CS1" cap={L("0.505 的失败三方归因:模型(废温度桶+待微调底座)、评测集(每类 12 条)、任务(标签重叠)——最深的一条是任务。", "The 0.505 failure attributed three ways: model (dead temperature bucket, un-fine-tuned base), eval set (12 per class), task (label overlap) — the deepest cause is the task.")}>
      <circle cx={130} cy={100} r="54" fill="none" stroke="var(--bad)" strokeWidth="1.4" />
      <FT x={130} y={96} c="var(--bad)" wt={700} sz={11}>0.505</FT>
      <FT x={130} y={112} sz={8.5} c="var(--muted)">{L("失败", "failed")}</FT>
      <FBox x={280} y={40} w={340} h={30} label={useL()("模型:choice:11+ 废桶 · 零样本 0.362", "model: dead choice:11+ · zero-shot 0.362")} tone="bad" />
      <FBox x={280} y={86} w={340} h={30} label={useL()("评测集:每类 12 条 < 20", "eval set: 12/class < 20")} tone="warn" />
      <FBox x={280} y={132} w={340} h={30} label={useL()("任务:标签语义重叠(最深)", "task: label overlap (deepest)")} tone="bad" />
      <FArrow x1={184} y1={90} x2={280} y2={55} /><FArrow x1={184} y1={100} x2={280} y2={101} /><FArrow x1={184} y1={110} x2={280} y2={147} />
    </FigFrame>
  );
};

// t23 — winning shape
FIGN["t23-win"] = () => {
  const L = useL();
  const cond = [[L("标签少 (2–5)", "few labels 2–5"), true], [L("量大 (十万/日)", "high volume"), true], [L("边界清晰", "clean boundary"), true], [L("门槛分开对错", "threshold separates"), true]];
  return (
    <FigFrame idx="CS2" cap={L("能赢的形状有四个条件,缺一不可:提示词注入检测、内容安全、模型路由都满足。这是成本模型,不是实测复盘。", "The winning shape needs all four conditions: prompt-injection detection, content safety and model routing meet them. This is a cost model, not a measured post-mortem.")}>
      {cond.map((c, i) => (<g key={i}>
        <circle cx={70} cy={50 + i * 32} r="8" fill="var(--ok)" opacity="0.85" />
        <FT x={66} y={54 + i * 32} sz={10} c="#fff" wt={700}>✓</FT>
        <FT x={90} y={54 + i * 32} anchor="start" sz={11} c="var(--ink)">{c[0]}</FT>
      </g>))}
      <FBox x={360} y={44} w={280} h={30} label={useL()("提示词注入检测", "prompt-injection detection")} tone="acc" />
      <FBox x={360} y={82} w={280} h={30} label={useL()("内容安全过滤", "content safety filter")} tone="acc" />
      <FBox x={360} y={120} w={280} h={30} label={useL()("小/大模型路由", "small/large model routing")} tone="acc" />
    </FigFrame>
  );
};

// t24 — decision tree
FIGN["t24-tree"] = () => {
  const L = useL();
  return (
    <FigFrame idx="CS3" cap={L("按标签数、语言、是否有数据、是否已有 LLM 走到一个具体建议;而每个具体数字都有很短的保质期。", "Label count, language, whether you have data and whether you already run an LLM lead to one recommendation — and every specific number has a short shelf life.")}>
      <FBox x={280} y={20} w={120} h={30} label={useL()("有标注数据?", "have data?")} tone="p" />
      <FArrow x1={300} y1={50} x2={200} y2={78} /><FT x={230} y={68} sz={8} c="var(--ok)">yes</FT>
      <FArrow x1={380} y1={50} x2={460} y2={78} /><FT x={440} y={68} sz={8} c="var(--muted)">no</FT>
      <FBox x={120} y={80} w={150} h={30} label={useL()("微调分类器", "fine-tune classifier")} tone="ok" />
      <FBox x={400} y={80} w={130} h={30} label={useL()("已有 LLM?", "have LLM?")} tone="p" />
      <FArrow x1={430} y1={110} x2={360} y2={138} /><FArrow x1={500} y1={110} x2={560} y2={138} />
      <FBox x={280} y={140} w={150} h={30} label="SemIf / logits" tone="ok" />
      <FBox x={500} y={140} w={150} h={30} label={useL()("标签多→Kev;少→Von", "many→Kev; few→Von")} tone="acc" />
      <FT x={150} y={185} anchor="start" sz={9} c="var(--muted)">⏱ 2026-09-23 · {L("数字会过期,方法不会", "numbers expire, the method does not")}</FT>
    </FigFrame>
  );
};

// t25 — the two architectures side by side
FIGN["t25-arch"] = () => {
  const L = useL();
  return (
    <FigFrame idx="SO4" h={240} cap={L("上:解码器-only,因果注意力,逐 token 自回归,KV cache 随序列增长——N 次前向。下:双向编码器,一次前向,决策头直接读概率——答案没有长度。", "Top: decoder-only, causal attention, autoregressive token by token, a KV cache that grows with the sequence — N passes. Bottom: a bidirectional encoder, one forward pass, decision heads reading probabilities — the answer has no length.")}>
      {/* --- ChatGPT / autoregressive --- */}
      <FT x={70} y={22} anchor="start" sz={11} c="var(--bad)" wt={700}>ChatGPT · System 2</FT>
      <FBox x={30} y={34} w={70} h={30} label={useL()("上文", "context")} tone="n" />
      <FArrow x1={100} y1={49} x2={128} y2={49} />
      <FBox x={128} y={30} w={90} h={38} label={useL()("解码器栈", "decoder stack")} sub={useL()("因果注意力", "causal attn")} tone="bad" />
      {/* token-by-token emission with feedback loop */}
      {[0, 1, 2, 3].map((i) => <FBox key={i} x={250 + i * 66} y={34} w={54} h={26} label={"tok" + (i + 1)} tone="n" />)}
      <FArrow x1={218} y1={49} x2={250} y2={49} c="var(--bad)" />
      {[0, 1, 2].map((i) => <FArrow key={i} x1={304 + i * 66} y1={49} x2={316 + i * 66} y2={49} c="var(--bad)" />)}
      {/* feedback: each token fed back */}
      <path d="M277,60 C277,84 173,84 173,70" fill="none" stroke="var(--bad)" strokeWidth="1" strokeDasharray="3 2" />
      <FT x={230} y={92} anchor="start" sz={8.5} c="var(--bad)">{L("每个 token 喂回去 → N 次前向 + KV cache", "each token fed back → N passes + KV cache")}</FT>
      <line x1={20} y1={112} x2={660} y2={112} stroke="var(--hairline)" />
      {/* --- Jev / encoder --- */}
      <FT x={70} y={134} anchor="start" sz={11} c="var(--ok)" wt={700}>Jev · System 1</FT>
      <FBox x={30} y={146} w={70} h={30} label={useL()("状态", "state")} tone="n" />
      <FBox x={104} y={146} w={70} h={30} label={useL()("选项", "options")} tone="n" />
      <FArrow x1={174} y1={161} x2={202} y2={161} c="var(--ok)" wdt={2} />
      <FBox x={202} y={140} w={130} h={44} label={useL()("双向编码器", "bidirectional encoder")} sub="~400M · 1 pass" tone="ok" />
      <FArrow x1={332} y1={161} x2={360} y2={161} c="var(--ok)" wdt={2} />
      <FBox x={360} y={140} w={90} h={44} label={useL()("决策头", "decision heads")} tone="p" />
      <FArrow x1={450} y1={161} x2={478} y2={161} c="var(--ok)" wdt={2} />
      <FBox x={478} y={146} w={160} h={30} label={useL()("choice/score/noul + 概率", "choice/score/noul + prob")} tone="acc" />
      <FT x={230} y={204} anchor="start" sz={8.5} c="var(--ok)">{L("一次前向,无回环,无 KV cache", "one forward, no loop, no KV cache")}</FT>
    </FigFrame>
  );
};

// t26 — where it lives + the marker-scoring forward pass
FIGN["t26-runtime"] = () => {
  const L = useL();
  return (
    <FigFrame idx="LY4" h={230} cap={L("上:三个位置——本地脚本、pip 库、远端缓存的权重;推理在本地 CPU。下:一次前向,选项是输入里的标记,在标记处 gather 隐向量,同一个 scorer 打成每选项一个 logit,÷T 后 softmax。", "Top: three locations — a local script, the pip library, remote-cached weights; inference on the local CPU. Bottom: one forward pass, options are markers in the input, hidden vectors are gathered at the markers and the shared scorer makes one logit each, ÷T then softmax.")}>
      {/* three locations */}
      <FBox x={30} y={26} w={130} h={40} label={useL()("① 脚本", "① script")} sub={useL()("本地 · 无权重", "local · no weights")} tone="ok" />
      <FBox x={190} y={26} w={140} h={40} label={useL()("② laya 库", "② laya lib")} sub={useL()("pip · 无权重", "pip · no weights")} tone="acc" />
      <FBox x={360} y={26} w={150} h={40} label={useL()("③ 权重", "③ weights")} sub="HF → ~/.cache" tone="bad" />
      <FArrow x1={160} y1={46} x2={190} y2={46} /><FArrow x1={330} y1={46} x2={360} y2={46} />
      <FBox x={540} y={26} w={110} h={40} label="CPU" sub={useL()("本地推理", "local inference")} tone="p" />
      <FArrow x1={510} y1={46} x2={540} y2={46} c="var(--ok)" wdt={2} />
      <line x1={20} y1={86} x2={660} y2={86} stroke="var(--hairline)" />
      {/* forward pass */}
      <FT x={40} y={108} anchor="start" sz={10} c="var(--ink)" wt={700}>{L("一次前向", "one forward pass")}</FT>
      {/* input sequence with markers */}
      <FT x={30} y={132} anchor="start" sz={9} c="var(--muted)">input_ids</FT>
      {[...Array(10)].map((_, i) => {
        const mark = i === 2 || i === 5 || i === 8;
        return <rect key={i} x={100 + i * 22} y={124} width={18} height={16} rx="2"
          fill={mark ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--surface-2)"}
          stroke={mark ? "var(--accent)" : "var(--hairline)"} />;
      })}
      <FT x={330} y={122} anchor="start" sz={8} c="var(--accent)">{L("↑ 选项标记", "↑ option markers")}</FT>
      <FArrow x1={210} y1={158} x2={210} y2={176} />
      <FBox x={100} y={176} w={230} h={30} label={useL()("双向编码器 + head", "bidirectional encoder + head")} tone="p" />
      <FArrow x1={330} y1={191} x2={360} y2={191} />
      <FBox x={360} y={176} w={120} h={30} label={useL()("gather 标记 → scorer", "gather markers → scorer")} tone="a" />
      <FArrow x1={480} y1={191} x2={510} y2={191} />
      <FBox x={510} y={176} w={140} h={30} label={useL()("÷T · softmax → p", "÷T · softmax → p")} tone="ok" />
    </FigFrame>
  );
};

// t26 appendix — the Hugging Face cache anatomy
FIGN["t26-cache"] = () => {
  const L = useL();
  return (
    <FigFrame idx="LY4·附" h={230} cap={L("HF 缓存是个内容寻址的 git 镜像:refs/main 指向一个 commit,snapshot 里每个文件都是指向 blobs 的软链接;仓库打包了两个 checkpoint(根=英文,multilingual/=多语言),allow_patterns 只拉你要的那个。", "The HF cache is a content-addressed git mirror: refs/main points at a commit, every file in a snapshot is a symlink into blobs, the repo bundles two checkpoints (root = English, multilingual/), and allow_patterns fetches only the one you asked for.")}>
      <FBox x={30} y={26} w={110} h={30} label="refs/main" sub={useL()("→ commit SHA", "→ commit SHA")} tone="p" />
      <FArrow x1={140} y1={41} x2={170} y2={41} />
      <FBox x={170} y={22} w={150} h={40} label={useL()("snapshots/<SHA>/", "snapshots/<SHA>/")} sub={useL()("全是软链接", "all symlinks")} tone="acc" />
      <FArrow x1={320} y1={41} x2={350} y2={41} c="var(--muted)" dash />
      <FBox x={350} y={22} w={140} h={40} label="blobs/" sub={useL()("内容寻址 · 1.5GB", "content-addressed · 1.5GB")} tone="bad" />
      <FT x={560} y={36} anchor="middle" sz={9} c="var(--muted)">{L("去重、可续传", "dedup, resumable")}</FT>
      <line x1={20} y1={82} x2={660} y2={82} stroke="var(--hairline)" />
      <FT x={40} y={104} anchor="start" sz={10} c="var(--ink)" wt={700}>{L("一个 snapshot 里打包了两个 checkpoint", "one snapshot bundles two checkpoints")}</FT>
      <FBox x={40} y={118} w={280} h={86} label="" tone="n" />
      <FT x={56} y={138} anchor="start" sz={10} c="var(--ok)" wt={700}>{L("根 = 英文", "root = English")}</FT>
      <FT x={56} y={156} anchor="start" sz={9} c="var(--muted)">model.safetensors · 843MB</FT>
      <FT x={56} y={172} anchor="start" sz={9} c="var(--muted)">rl_agent_config.json · encoder/</FT>
      <FT x={56} y={188} anchor="start" sz={9} c="var(--muted)">tokenizer/ · ModernBERT-large</FT>
      <FBox x={350} y={118} w={280} h={86} label="" tone="n" />
      <FT x={366} y={138} anchor="start" sz={10} c="var(--accent)" wt={700}>multilingual/</FT>
      <FT x={366} y={156} anchor="start" sz={9} c="var(--muted)">model.safetensors · 644MB</FT>
      <FT x={366} y={172} anchor="start" sz={9} c="var(--muted)">rl_agent_config.json · encoder/</FT>
      <FT x={366} y={188} anchor="start" sz={9} c="var(--muted)">tokenizer/ · mmBERT-base</FT>
      <FT x={490} y={116} anchor="start" sz={8.5} c="var(--muted)">{L("typed-decisions/ 没下(未请求)", "typed-decisions/ absent (not requested)")}</FT>
    </FigFrame>
  );
};

// t27 — a push through TaskaaS → MCP → /v1/systemone, gated per hunk
FIGN["t27-review"] = () => {
  const L = useL();
  return (
    <FigFrame idx="OP4" h={250} cap={L("上:一次推送触发 TaskaaS,它作为 MCP 客户端调用 review_push;工具把 diff 切成 hunk,每块发一次 /v1/systemone(Jev 或内网 laya-serve)。下:每块一个 k=3 的 choice,不对称过闸——只有高置信度的 approve 自动放行。", "Top: a push triggers TaskaaS, which as an MCP client calls review_push; the tool splits the diff into hunks and sends each one /v1/systemone request (Jev or an in-network laya-serve). Bottom: one k=3 choice per hunk, gated asymmetrically — only a confident approve auto-passes.")}>
      <FBox x={20} y={26} w={90} h={40} label="git push" sub="webhook / hook" tone="n" />
      <FArrow x1={110} y1={46} x2={136} y2={46} />
      <FBox x={136} y={26} w={120} h={40} label="TaskaaS" sub={useL()("MCP 客户端", "MCP client")} tone="p" />
      <FArrow x1={256} y1={46} x2={282} y2={46} />
      <FBox x={282} y={26} w={150} h={40} label="review_push" sub={useL()("MCP 工具 · 切 hunk", "MCP tool · split hunks")} tone="acc" />
      <FArrow x1={432} y1={46} x2={458} y2={46} />
      <FBox x={458} y={26} w={200} h={40} label="/v1/systemone" sub={useL()("Jev | laya-serve(本地)", "Jev | laya-serve (local)")} tone="p" />
      <line x1={20} y1={86} x2={660} y2={86} stroke="var(--hairline)" />
      <FT x={30} y={108} anchor="start" sz={10} c="var(--ink)" wt={700}>{L("每个 hunk", "per hunk")}</FT>
      <FBox x={30} y={120} w={170} h={46} label="verdict · choice k=3" sub="approve | changes | human" tone="acc" />
      <FBox x={30} y={176} w={170} h={30} label="severity · score" sub="" tone="n" />
      <FT x={115} y={226} sz={8.5} c="var(--muted)">{L("noul 不用:判决有三种结局", "no noul: the verdict has 3 outcomes")}</FT>
      <FArrow x1={200} y1={143} x2={240} y2={143} />
      <FBox x={240} y={124} w={80} h={38} label={useL()("闸门 θ", "gate θ")} tone="p" />
      <FArrow x1={320} y1={132} x2={400} y2={112} c="var(--ok)" />
      <FArrow x1={320} y1={143} x2={400} y2={155} c="var(--warn)" />
      <FArrow x1={320} y1={154} x2={400} y2={198} c="var(--bad)" />
      <FBox x={400} y={96} w={250} h={30} label={useL()("approve ≥ θ → 自动放行", "approve ≥ θ → auto_pass")} tone="ok" />
      <FBox x={400} y={140} w={250} h={30} label={useL()("changes ≥ θ → LLM 写评论", "changes ≥ θ → LLM writes it")} tone="warn" />
      <FBox x={400} y={184} w={250} h={30} label={useL()("human / 低置信 / 模型挂了 → 人", "human / low conf / down → person")} tone="bad" />
      <FT x={525} y={234} sz={8.5} c="var(--muted)">{L("推送整体放行 = cⁿ;评审者只读没放行的块", "push passes = cⁿ; reviewers read only the rest")}</FT>
    </FigFrame>
  );
};

/* ================= module-architecture figures ================= */
function ModArch({ idx, title, boxes, cap }) {
  return (
    <FigFrame idx={idx} h={130} cap={cap}>
      {boxes.map((b, i) => (<g key={i}>
        <FBox x={30 + i * 158} y={44} w={130} h={44} label={b.l} sub={b.s} tone={b.t || "p"} />
        {i < boxes.length - 1 && <FArrow x1={160 + i * 158} y1={66} x2={188 + i * 158} y2={66} wdt={1.6} />}
      </g>))}
      <FT x={340} y={26} c="var(--ink)" wt={700} sz={12}>{title}</FT>
    </FigFrame>
  );
}
FIGN["m1-arch"] = () => { const L = useL(); return <ModArch idx="I" title={L("决策不是文本", "A Decision Is Not Text")} cap={L("从两条流水线的对比,到三个原语,到延迟的结构差异。", "From the two-pipeline contrast, to the three primitives, to the structural latency gap.")} boxes={[{ l: L("两条流水线", "two pipelines"), s: "SO1" }, { l: L("三原语", "three primitives"), s: "SO2", t: "acc" }, { l: L("延迟结构", "latency"), s: "SO3" }]} />; };
FIGN["m2-arch"] = () => { const L = useL(); return <ModArch idx="II" title={L("Jev 本体", "Jev Itself")} cap={L("接口、输出免费的定价后果、宣传数字背后的条件。", "The interface, the consequence of free output, and the conditions behind the headline numbers.")} boxes={[{ l: L("接口", "interface"), s: "JV1" }, { l: L("扇出成本", "fan-out cost"), s: "JV2", t: "acc" }, { l: L("宣传数字", "the claims"), s: "JV3" }]} />; };
FIGN["m3-arch"] = () => { const L = useL(); return <ModArch idx="III" title={L("概率与校准", "Probability & Calibration")} cap={L("可靠性图,温度缩放,门槛换算成钱——这一类模型真正的卖点。", "Reliability, temperature scaling, converting calibration into money — what is actually being sold.")} boxes={[{ l: L("可靠性/ECE", "reliability"), s: "CA1" }, { l: L("温度缩放", "temperature"), s: "CA2", t: "acc" }, { l: L("门槛→钱", "gate→money"), s: "CA3" }]} />; };
FIGN["m4-arch"] = () => { const L = useL(); return <ModArch idx="IV" title="Laya" cap={L("三个 checkpoint 和路由,token 预算,以及只有读源码才知道的坑。", "Three checkpoints and routing, the token budget, and the traps only the source reveals.")} boxes={[{ l: L("路由", "routing"), s: "LY1" }, { l: L("token 预算", "token budget"), s: "LY2", t: "acc" }, { l: L("诚实清单", "honest list"), s: "LY3", t: "bad" }]} />; };
FIGN["m5-arch"] = () => { const L = useL(); return <ModArch idx="V" title={L("开源生态", "The Open Ecosystem")} cap={L("编码器派、LLM 派,以及「你可能根本不需要 System One 模型」。", "The encoder camp, the LLM camp, and 'you may not need a System One model at all'.")} boxes={[{ l: L("编码器派", "encoder camp"), s: "OS1" }, { l: L("LLM 派", "LLM camp"), s: "OS2" }, { l: L("四条路", "four routes"), s: "OS3", t: "acc" }]} />; };
FIGN["m6-arch"] = () => { const L = useL(); return <ModArch idx="VI" title={L("自己评测", "Measure It Yourself")} cap={L("三条基线,评测集怎么建,读四张表到一个判决。", "Three baselines, how to build the eval set, and reading the four tables to a verdict.")} boxes={[{ l: L("三基线", "baselines"), s: "EV1" }, { l: L("建评测集", "the eval set"), s: "EV2", t: "acc" }, { l: L("四张表", "four tables"), s: "EV3" }]} />; };
FIGN["m7-arch"] = () => { const L = useL(); return <ModArch idx="VII" title={L("上线工程", "Shipping It")} cap={L("协议兼容的自托管,排队容量模型,门槛之下的两级架构,以及把它用在代码评审上的 MCP 推送闸门。", "Protocol-compatible self-hosting, a queueing capacity model, the two-tier system below the threshold, and an MCP push gate that applies it to code review.")} boxes={[{ l: L("自托管", "self-host"), s: "OP1" }, { l: L("容量", "capacity"), s: "OP2" }, { l: L("两级架构", "two tiers"), s: "OP3", t: "acc" }, { l: L("评审闸门", "review gate"), s: "OP4" }]} />; };
FIGN["m8-arch"] = () => { const L = useL(); return <ModArch idx="VIII" title={L("案例与决策", "Cases & Decision")} cap={L("一个实测的失败案例,一个成本模型的成功形状,一棵选型决策树。", "One measured failure, one modelled winning shape, and a selection decision tree.")} boxes={[{ l: L("失败案例", "failure case"), s: "CS1", t: "bad" }, { l: L("成功形状", "winning shape"), s: "CS2", t: "ok" }, { l: L("决策树", "decision tree"), s: "CS3", t: "acc" }]} />; };

/* ---- map chapter id → its figure name (content uses @fig <name>) ---- */
const CHAP_FIG = {
  t1: "t1-pipes", t2: "t2-prims", t3: "t3-tax", t4: "t4-api", t5: "t5-fanout", t6: "t6-claim",
  t7: "t7-reliab", t8: "t8-temp", t9: "t9-gate", t10: "t10-router", t11: "t11-budget", t12: "t12-noul",
  t13: "t13-encoder", t14: "t14-llm", t15: "t15-routes", t16: "t16-base", t17: "t17-dataset", t18: "t18-report",
  t19: "t19-serve", t20: "t20-capacity", t21: "t21-tier", t22: "t22-case", t23: "t23-win", t24: "t24-tree",
  t25: "t25-arch", t26: "t26-runtime", t27: "t27-review",
};

function Figure({ name, idx }) {
  const C = FIGN[name] || FIGN[CHAP_FIG[name]];
  if (!C) return null;
  return <C idx={idx} />;
}
window.FIGN = FIGN;
window.CHAP_FIG = CHAP_FIG;
window.Figure = Figure;
