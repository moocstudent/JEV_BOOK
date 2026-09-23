/* =========================================================
   i18n — Chinese / English switching (TIMESERIES_BOOK)
   ---------------------------------------------------------
   UI            : dictionary of interface strings { key: {zh, en} }
   LangContext   : current language ("zh" | "en")
   useLangState(): App-level state hook (persists to localStorage)
   useLang()     : read current language inside any component
   useT()        : returns t(key) -> localized UI string
   pick(lang,obj): localize a content object { zh, en } (or a plain string)
   ========================================================= */

const LANG_KEY = "ts_book_lang";

const LangContext = React.createContext("zh");

function useLangState() {
  const [lang, setLangRaw] = React.useState(() => {
    try { return localStorage.getItem(LANG_KEY) || "zh"; } catch (e) { return "zh"; }
  });
  React.useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);
  const setLang = (l) => {
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    setLangRaw(l);
  };
  const toggle = () => setLang(lang === "zh" ? "en" : "zh");
  return [lang, setLang, toggle];
}

function useLang() { return React.useContext(LangContext); }

function useT() {
  const lang = React.useContext(LangContext);
  return (key) => {
    const e = UI[key];
    if (e === undefined) return key;
    if (typeof e === "object") return e[lang] !== undefined ? e[lang] : e.zh;
    return e;
  };
}

// Localize a { zh, en } object; a bare string is returned as-is.
function pick(lang, obj) {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] !== undefined ? obj[lang] : (obj.zh !== undefined ? obj.zh : obj.en);
}
// The "other" language for a content object (used for the sub-title lines).
function other(lang, obj) { return pick(lang === "zh" ? "en" : "zh", obj); }

// "{n} 章" -> fmt("{n} 章", {n: 3})
function fmt(str, map) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (map[k] !== undefined ? map[k] : `{${k}}`));
}

const UI = {
  /* nav */
  nav_home:    { zh: "首页", en: "Home" },
  nav_about:   { zh: "关于", en: "About" },
  nav_modules: { zh: "模块", en: "Modules" },
  lang_title:  { zh: "切换语言", en: "Switch language" },
  theme_title: { zh: "切换主题", en: "Toggle theme" },

  /* hero */
  hero_badge:  { zh: "System One 决策模型 · 中英双语 · 从一个开源平替到一次上线判决", en: "System One decision models · bilingual · from an open alternative to a shipping verdict" },
  hero_l1:     { zh: "先在真实数据上评一遍,", en: "First measure it on real data," },
  hero_l2a:    { zh: "再决定它到底", en: "then decide whether it" },
  hero_l2b:    { zh: "能不能上线。", en: "can actually ship." },
  hero_sub:    {
    zh: "2026 年 9 月 15 日 TypeSafe 发布了 Jev,一类不生成文字、一次前向直接返回带概率的类型化决策的模型,并给它起名 System One。一周之内,三十多个开源平替堆到了 GitHub 上,Laya 是其中最成熟也最诚实的一个。但在你 pip install 之前,有一串问题必须先有答案:choice、score、noul 三个原语在数学上到底是什么;那个叫 confidence 的字段是不是概率(在 Laya 里它是归一化熵,不是);为什么一个 0.9 的置信度不代表九成会对,除非你先做温度校准;为什么把门槛从 0.5 拉到 0.95、覆盖率砍掉三分之二、精度只涨六个点,就意味着这个模型在你的数据上不能用;77 个标签的高基数任务为什么会让编码器派从 0.87 掉到 0.42;以及最该先问的一个——你是不是根本不需要 System One 模型,微调一个分类器就够了。全书用一份真实数据贯穿始终:216 条中文需求分进 18 个模块,全部在一台没有 GPU 的机器上实测。共 {M} 个模块、{C} 章,每章开头是一个可交互的决策台,结尾是 Python / 请求 / 部署评测 三个视角的真实代码——所有数字现算,所有代码照着能跑。",
    en: "On 15 September 2026 TypeSafe shipped Jev — a model that does not generate text but returns typed, calibrated decisions in a single forward pass — and named the category System One. Within a week thirty-odd open alternatives piled onto GitHub, Laya the most mature and most honest of them. But before you pip install, a queue of questions needs answers. What are choice, score and noul mathematically? Is the field called confidence a probability (in Laya it is normalized entropy, not one)? Why does a confidence of 0.9 not mean nine in ten will be right until you temperature-scale it? Why does moving a threshold from 0.5 to 0.95 — cutting coverage by two thirds for six points of precision — mean the model cannot be used on your data? Why does a 77-label task drop the encoder camp from 0.87 to 0.42? And the one to ask first: do you even need a System One model, or would a fine-tuned classifier do? One real dataset runs through the whole book: 216 Chinese requirement rows sorted into 18 modules, all measured on a machine with no GPU. {M} modules, {C} chapters — each opening with an interactive bench and closing with real code from three angles: Python, request, and deploy-and-measure. Every number is computed live; every listing is meant to run.",
  },
  cta_start:   { zh: "从第一章开始 →", en: "Start chapter 1 →" },
  cta_howto:   { zh: "如何使用", en: "How it works" },
  cta_roadmap: { zh: "查看路线图", en: "See the roadmap" },

  meta_modules:  { zh: "模块", en: "Modules" },
  meta_chapters: { zh: "章", en: "Chapters" },
  meta_demos:    { zh: "决策台", en: "Benches" },
  meta_hours:    { zh: "小时", en: "Hours" },

  your_progress: { zh: "你的进度", en: "Your progress" },
  synced:        { zh: "本地保存 · 无需登录", en: "Saved locally · no login" },

  /* sections */
  sec01:       { zh: "学习路线图", en: "Learning roadmap" },
  sec01_aside: { zh: "从一个开源平替走到一次「能不能上线」的判决", en: "From an open alternative to a ship-or-not verdict" },
  sec02:       { zh: "课程模块", en: "Course modules" },
  sec02_aside: { zh: "点击进入任意模块", en: "Click any module to enter" },
  sec03:       { zh: "学习方法", en: "The method" },
  sec03_aside: { zh: "先跑一遍场景,再读解释,最后自己写一遍", en: "Run the scenario, read why, then write it yourself" },

  rm_notstarted: { zh: "未开始", en: "Not started" },
  rm_done:       { zh: "已完成", en: "Done" },

  hours_unit:    { zh: "小时", en: "h" },
  modules_count: { zh: "章", en: "chapters" },
  done_word:     { zh: "完成", en: "done" },
  enter_word:    { zh: "进入 →", en: "Enter →" },

  phil1_zh: { zh: "先跑一遍场景", en: "Run the scenario" },
  phil1_b:  {
    zh: "每一章开头是一个可交互决策台:把选项数 k 拖起来,看随机基线和置信度的量纲怎么随之改变;把过度自信旋钮拖起来,看可靠性图怎么从对角线鼓到下方、ECE 怎么跟着涨;拖动温度 T,看概率被校准而准确率纹丝不动;把置信度门槛从 0.5 拉到 0.95,看覆盖率大幅下滑而精度几乎不动——这就是本书那次实测失败的样子;把标签数拖到 77,看编码器派怎么从 0.87 掉到 0.42;把 QPS 和 worker 数拖起来,看 P95 在利用率逼近 1 时突然起飞。这类模型的直觉不是背 API 背出来的,是被自己拖出来的曲线打服的。",
    en: "Every chapter opens with an interactive bench: drag the option count k and watch the random baseline and confidence's units change with it; drag the overconfidence knob and watch the reliability diagram bulge below the diagonal as ECE climbs; drag the temperature T and watch probabilities get calibrated while accuracy sits perfectly still; push the confidence threshold from 0.5 to 0.95 and watch coverage collapse while precision barely moves — this is what the book's measured failure looks like; drag the label count to 77 and watch the encoder camp fall from 0.87 to 0.42; drag QPS and worker count and watch P95 take off as utilisation nears 1. Intuition about these models is not memorised from an API — it is beaten into you by curves you dragged yourself.",
  },
  phil2_zh: { zh: "再读解释", en: "Read the explanation" },
  phil2_b:  {
    zh: "决策台背后是机制:choice 为什么是多类 softmax 而 noul 的数值本身就是概率、一次前向的延迟为什么只取决于输入而与答案长度无关、名字叫 confidence 的字段为什么其实是归一化熵而不能拿去算 ECE、温度缩放为什么改概率却不改准确率、选项为什么是拼进输入的文本而不是分类头上的神经元、head_max_len 为什么会在 77 个标签时把每个标签压到只剩三四个 token、noul 为什么会跟着 false:/true: 标签走、出厂的 choice:11+ 温度桶为什么烂到库自己拒绝应用、约束解码为什么保证格式却不给校准概率、以及门槛为什么该由兜底容量决定而不是由曲线最优点决定。「解释」把每个选择的代价和边界讲清楚。",
    en: "Behind each bench sits a mechanism: why choice is a multiclass softmax while noul's value is itself the probability; why a single forward's latency depends only on the input and not on the answer's length; why the field called confidence is really normalized entropy and cannot be fed to ECE; why temperature scaling changes probabilities but not accuracy; why options are text spliced into the input rather than neurons on a head; why head_max_len squeezes each of 77 labels down to three or four tokens; why noul follows its false:/true: labels; why the shipped choice:11+ temperature bucket is bad enough that the library refuses it; why constrained decoding guarantees a format but no calibrated probability; and why the threshold should be set by fallback capacity rather than the curve's optimum. The explanation gives every choice its price and its boundary.",
  },
  phil3_zh: { zh: "最后自己写一遍", en: "Then write it yourself" },
  phil3_b:  {
    zh: "每章结尾是同一件事的三个视角:Python 是能跑的实现(温度拟合的网格搜索、top-1 概率算的 ECE、门槛-覆盖率-精度表、SemIf 式读 logits、M/M/c 排队容量、两级架构的分流逻辑);请求是那几行真正决定结果的东西(/v1/systemone 的 state 与 questions、criteria 的键与描述之分、按类型和选项数分桶的温度、被库拒绝的 choice:11+ 温度、四张表的判决模板);部署评测是把它接到真实世界的那一层(laya-serve 的环境变量与鉴权、baseUrl 重指、本书那份 216 条数据的实测命令、半年后照着重跑的清单)。代码都是可读长度的完整片段,不是伪代码。练习会把你赶到真数据里:建自己的评测集、算三条基线、在留出集上拟合温度、画出你自己的门槛曲线,再决定这东西能不能上线。",
    en: "Every chapter closes with the same thing from three angles. Python is a runnable implementation (the grid search that fits a temperature, ECE computed on the top-1 probability, the threshold-coverage-precision table, SemIf-style logit reading, M/M/c queueing capacity, the routing logic of a two-tier system). Request is the handful of lines that actually decide the outcome (state and questions for /v1/systemone, the split between a criteria key and its description, a temperature bucketed by type and option count, the choice:11+ temperature the library refuses, the four-table verdict template). Deploy-and-measure is the layer that touches the real world (laya-serve's env vars and auth, repointing a baseUrl, the exact command that measured this book's 216-row set, a checklist to rerun in six months). The listings are complete, readable fragments rather than pseudocode. The exercises push you into real data: build your own eval set, score three baselines, fit a temperature on a held-out half, plot your own threshold curve, and then decide whether it can ship.",
  },
  footer_tag:  { zh: "typed decisions · Jev 与 Laya 选型与评测 · 2026", en: "typed decisions · Jev & Laya, measured and chosen · 2026" },
  footer_sync: { zh: "进度本地保存", en: "progress saved locally" },

  /* module page */
  bc_home:    { zh: "首页", en: "Home" },
  bc_modules: { zh: "模块", en: "Modules" },
  module_word:{ zh: "模块", en: "Module" },
  of_word:    { zh: "共", en: "of" },
  m_meta_chapters: { zh: "章数", en: "Chapters" },
  m_meta_hours:    { zh: "预计小时", en: "Est. hours" },
  m_meta_level:    { zh: "难度", en: "Level" },
  m_meta_progress: { zh: "进度", en: "Progress" },
  chapter_list: { zh: "本模块章节", en: "Chapters in this module" },
  click_enter:  { zh: "点击任意章节进入", en: "Click a chapter to enter" },
  no_prereq:    { zh: "无先修", en: "No prereq" },
  prereq_n:     { zh: "{n} 项先修", en: "{n} prereq" },
  not_found_m:  { zh: "未找到该模块。", en: "Module not found." },

  diff_1: { zh: "入门", en: "Intro" },
  diff_2: { zh: "进阶", en: "Core" },
  diff_3: { zh: "挑战", en: "Advanced" },

  /* chapter page */
  ch_sec_intro:   { zh: "本章导读", en: "Overview" },
  ch_sec_obj:     { zh: "学习目标", en: "Objectives" },
  ch_sec_outline: { zh: "内容大纲", en: "Outline" },
  ch_sec_viz:     { zh: "决策台 · 可交互模拟", en: "The decision bench · live model" },
  ch_sec_notes:   { zh: "解释 · 核心讲义", en: "The explanation · core notes" },
  ch_sec_code:    { zh: "代码 · Python / 数据与配置 / 训练与部署", en: "Code · Python / data & config / training & deployment" },
  viz_hint:     { zh: "改动参数,亲眼看准确率、置信度、校准、门槛-覆盖率-精度、延迟和成本如何联动;这里的每一个数字都是现算的,大胆试。", en: "Change the parameters and watch accuracy, confidence, calibration, the threshold-coverage-precision trade, latency and cost move together; every number here is computed live — experiment freely." },
  code_hint:    { zh: "切换标签看同一件事的三个视角:Python 实现、数据与配置、训练与部署;点右上角复制。代码为可读而写,去掉了无关样板,但接口名、参数与关键常量都是真的。", en: "Switch tabs for three angles on the same thing: the Python implementation, the data and configuration, and training or deployment. Copy from the corner button. The listings are written to be read — unrelated boilerplate is trimmed — but every API name, parameter and constant that matters is real." },
  key_badge:    { zh: "重点", en: "Key" },
  code_badge:   { zh: "动手", en: "Hands-on" },
  copy_btn:     { zh: "复制", en: "Copy" },
  copied_btn:   { zh: "已复制", en: "Copied" },
  langs_word:   { zh: "代码", en: "Code" },
  loading_notes:{ zh: "正在加载讲义……", en: "Loading notes…" },
  notes_soon:   { zh: "本章深度讲义正在编写中。以上目标与大纲即为本章脉络,先把上面的决策台玩透。", en: "The deep-dive notes for this chapter are being written. Use the objectives and outline above as your map — and play with the bench first." },
  back_to:      { zh: "返回", en: "Back to" },
  est_word:     { zh: "预计", en: "Est." },
  level_word:   { zh: "难度", en: "Level" },
  props_word:   { zh: "关键概念", en: "Key concepts" },
  mark_done_btn:{ zh: "标记为已完成", en: "Mark as complete" },
  marked_done:  { zh: "已完成", en: "Completed" },
  not_found_c:  { zh: "未找到该章节。", en: "Chapter not found." },

  /* about */
  about_kicker: { zh: "关于本站", en: "About" },
  about_q:      { zh: "为什么写这门课?", en: "Why this course?" },
  about_sub:    { zh: "把 System One 决策模型讲成「决策台 + 解释 + 代码」,而不是一串照抄的 pip install。", en: "Teach System One decision models as a bench, an explanation and code — not a copied pip install." },
  about_h1: { zh: "这是什么", en: "What this is" },
  about_p1: {
    zh: "一门「System One 决策模型」的自学课程,共 {M} 个模块、{C} 章,面向要真的把 Jev 或它的开源平替评测、部署、并做出上线判决的人:可能是接了「加个自动分流/审核」需求的后端工程师,也可能是要在一堆开源实现里做选型的算法开发者。全书用一份真实数据贯穿始终——216 条中文需求分进 18 个业务模块,全部在一台没有 GPU 的机器上实测——但每一章都标出方法怎么迁移到工单分流、内容安全、提示词注入检测这些别的决策任务上。第一个模块讲这类模型为什么存在:决策为什么不该是文本、choice/score/noul 三个原语的数学、一次前向为什么比自回归快一个数量级。然后是 Jev 本体:接口、输出免费的定价后果、宣传数字背后的条件。第三个模块是技术核心也是最多人跳过的——概率校准:可靠性图、ECE、温度缩放、门槛-覆盖率-精度曲线,这才是这类模型真正的卖点。接着把 Laya 拆开(三个 checkpoint、token 预算、只有读源码才知道的坑),再横扫三十多个开源实现,并给出「你可能根本不需要它」的四条替代路。第六个模块教你怎么用三条基线和四张表在两小时内做出判决。最后是上线工程(协议兼容自托管、排队容量、两级架构)和两个案例:一个全部实测的失败,一个成本模型推演的成功形状,收口于一棵选型决策树。",
    en: "A self-study course on System One decision models — {M} modules, {C} chapters — for whoever actually has to measure, deploy and decide whether to ship Jev or one of its open alternatives: the backend engineer handed an 'add auto-routing or moderation' requirement, or the developer choosing among a pile of open implementations. One real dataset runs through the whole book — 216 Chinese requirement rows sorted into 18 business modules, all measured on a machine with no GPU — and every chapter marks how the method carries to ticket routing, content safety and prompt-injection detection. The first module is why this class of model exists: why a decision should not be text, the mathematics of choice/score/noul, and why a single forward pass beats autoregression by an order of magnitude. Then Jev itself: the interface, the consequence of free output, the conditions behind the headline numbers. The third module is the technical core and the one most people skip — calibration: reliability diagrams, ECE, temperature scaling and the threshold-coverage-precision curve, which is what is actually being sold. Then Laya is taken apart (three checkpoints, the token budget, the traps only the source reveals), thirty-odd open implementations are swept, and four alternative routes are given for 'you may not need it at all'. The sixth module teaches you to reach a verdict in two hours with three baselines and four tables. The book closes with shipping engineering (protocol-compatible self-hosting, queueing capacity, the two-tier system) and two cases: one measured failure, one modelled winning shape, ending on a selection decision tree.",
  },
  about_p1b: { zh: "全部内容中英双语,代码为 Python / 请求 / 部署评测三个视角,支持浅色/深色主题,进度保存在你自己的浏览器里,无需注册。本书写于 2026 年 9 月 23 日,距 Jev 发布第八天;凡涉及具体版本号、参数量、延迟与基准分的部分保质期很短,请以各项目官网和你自己在自己数据上的重测为准。", en: "Everything is bilingual (Chinese/English); code comes from three angles — Python, request, deploy-and-measure. Light and dark themes, progress kept in your own browser, no signup. This book was written on 23 September 2026, eight days after Jev launched; anything touching specific version strings, parameter counts, latencies or benchmark scores has a short shelf life — the authority is each project's own pages and your own re-measurement on your own data." },
  about_h2: { zh: "「决策台与解释」是什么意思", en: "What 'the bench & the explanation' means" },
  about_p2: {
    zh: "System One 模型的材料通常走两个极端:要么是论文和 README(准确,但满页自报数字,在你需要判断「它在我的数据上行不行」时毫无帮助),要么是「三行代码接入 Jev」(跑通了,然后在第一次发现 confidence 不是概率、第一次门槛拉不开精度、第一次上线后被高置信度的错误打脸时全线崩溃)。本站每章拆成三块:「决策台」是可交互模拟器,三原语的分布、可靠性图、温度缩放、门槛-覆盖率-精度、token 预算、排队容量、两级架构全部在你的浏览器里现算,改一个参数就看到后果;「解释」讲清机制、代价和边界;「代码」给出 Python、请求、部署评测三个视角,让你能立刻在自己的机器上跑一遍。",
    en: "Material on System One models runs to two extremes: papers and READMEs (accurate, full of self-reported numbers, and no help when what you need is to judge whether it works on your data), or 'wire up Jev in three lines' (it runs, then falls apart the first time you find confidence is not a probability, the first time the threshold buys no precision, the first time a high-confidence error slaps you after go-live). Every chapter here splits into three. The bench is a live model — the three primitives' distributions, reliability diagrams, temperature scaling, threshold-coverage-precision, the token budget, queueing capacity and the two-tier system, all computed in your browser — where one changed parameter shows the consequence. The explanation covers the mechanism, its price and its boundary. The code gives three angles — Python, request, deploy-and-measure — so you can run it today.",
  },
  about_h3: { zh: "开源平替不是终点,那次判决才是", en: "The open alternative is not the point; the verdict is" },
  about_p3: {
    zh: "很多测评把 System One 模型讲成一份跑分清单:Jev 96.6%、Von 72.0%、Laya 0.505。但没有人为了跑分而选模型——你选它,是因为你要给一条每天几十万次的调用加一层自动分流,或者给一个 LLM 应用前置一道注入检测。本书把顺序倒过来:先给你一个真实后果——一份 216 条数据实测出来的 0.505、一张门槛从 0.5 拉到 0.95 精度只涨六个点的表、一个高棉语准确率 0.000 却自报 95.2% 置信度的分支——再让你看清是哪一个原语、哪一处校准、哪一条标签体系在决定成败。学完你记住的不是「Von 有几个参数」,而是「这个任务该不该用 System One、该用哪个、门槛该设在哪、以及什么时候该承认它不行」。",
    en: "Many reviews teach System One models as a leaderboard: Jev 96.6%, Von 72.0%, Laya 0.505. But nobody picks a model for its score — you pick it because you have to add auto-routing to a few hundred thousand calls a day, or a prompt-injection check in front of an LLM app. This book inverts the order: it hands you a real consequence first — a 0.505 measured on 216 rows, a table where moving the threshold from 0.5 to 0.95 buys six points of precision, a branch that scores 0.000 on Khmer while reporting 95.2% confidence — and then shows exactly which primitive, which calibration step and which taxonomy decided it. What you leave with is not how many parameters Von has, but whether this task should use a System One model at all, which one, where the threshold belongs, and when to admit it does not work.",
  },
  about_h4: { zh: "如何使用", en: "How to use it" },
  about_p4: {
    zh: "按路线图学:决策不是文本 → Jev 本体 → 概率与校准 → Laya → 开源生态 → 自己评测 → 上线工程 → 案例与决策。如果你手上已经有一个候选模型、只想知道「能不能上线」,可以直奔模块 III(校准)和模块 VI(自己评测),那两块是独立可读的;但请至少先读 CA1,因为在一个没搞清 confidence 是什么的评测里,后面所有数字都不可信。如果你是要做选型、暂时不写代码,读模块 I、V 和 VIII 就够。每章的练习都要求你离开本站动手:建自己的评测集、算三条基线、在留出集上拟合温度、画出你自己的门槛曲线。本书写于 2026 年 9 月,距 Jev 发布仅八天,几乎所有开源项目都是刚推上去的代码;凡涉及具体版本、参数量、延迟与跑分的部分请以各项目官网和你自己的重测为准,不构成选型或商务意见。",
    en: "Follow the roadmap: a decision is not text → Jev itself → probability and calibration → Laya → the open ecosystem → measure it yourself → shipping → cases and decision. If you already have a candidate and only want to know whether it can ship, jump straight to module III (calibration) and module VI (measuring it yourself); those two stand alone — but read CA1 first, because in an evaluation that never worked out what confidence is, every later number is untrustworthy. If you are choosing and not yet writing code, modules I, V and VIII are enough. Every chapter's exercises send you away from this site: build your own eval set, score three baselines, fit a temperature on a held-out half, and plot your own threshold curve. This book was written in September 2026, eight days after Jev launched, when nearly every open project was freshly pushed code; treat any specific version, parameter count, latency or score as indicative and check each project's own pages and your own re-measurement. It is not selection or commercial advice."
  },
};

window.LangContext = LangContext;
window.useLangState = useLangState;
window.useLang = useLang;
window.useT = useT;
window.pick = pick;
window.other = other;
window.fmt = fmt;
window.UI = UI;
