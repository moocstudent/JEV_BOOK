/* =========================================================
   Curriculum data — 8 modules / 24 chapters
   ---------------------------------------------------------
   Metadata only (bilingual). The teaching content ("解释")
   for each chapter lives in content/<id>.<lang>.md and is
   fetched on demand by the chapter page. `viz` names an
   interactive bench ("决策台") from viz.jsx … viz3.jsx; the
   code listings live in code.jsx / code2.jsx (looked up by
   chapter id). `props` lists the key concepts the chapter
   leans on.

   Domain: System One models — Jev (TypeSafe AI, closed) and
   its open alternatives, Laya first among them. The running
   example is a real one: 216 Chinese requirement rows routed
   into 18 modules, measured on this machine, CPU only.
   Every number attributed to a project is that project's own
   claim; every number attributed to "本书实测" was measured.
   ========================================================= */

const MODULES = [
  {
    id: "m1", arch: "m1-arch", code: "SO", accent: "primary", level: 1,
    zh: "决策不是文本", en: "A Decision Is Not Text",
    tagline: { zh: "程序要的是一个能拿去 if 的值。让模型先写一段话、再把那个值抠出来,是我们忍了三年的绕路。", en: "A program wants a value it can branch on. Making a model write prose so you can dig the value back out is a detour we tolerated for three years." },
    description: {
      zh: "这个模块要回答一个听起来很基础、但决定了后面所有内容的问题:当你的代码需要一个判断——这张工单归哪个部门、这条评论有没有辱骂、这个请求该走小模型还是大模型——你到底需要模型给你什么。过去三年的标准答案是:让 LLM 生成一段 JSON,然后解析它。这条路能走通,但它的失败模式非常特别:模型可能生成不合法的 JSON、可能生成合法但字段名不对的 JSON、可能在同一个 prompt 上今天给 A 明天给 B、可能把你的枚举值拼错一个字母。于是工程上长出了一整套补丁:约束解码、schema 校验、重试、修复提示词。这些补丁解决的是「格式」,但没有解决更深的问题——你拿到的那个字符串背后没有概率,你不知道模型有多确定,也就没法按确定程度分流。第一章把两条流水线并排跑,让你看见它们在延迟、失败模式和可观测性上的结构性差异。第二章定义三个原语:choice(从给定集合里选,返回整个分布)、score(在有序量表上打分)、noul(是非题,返回「是」的概率),并讲清它们各自在数学上是什么——choice 是多类 softmax,score 是有序回归的期望,noul 是二分类的后验。第三章讲延迟从哪来:自回归模型的延迟正比于输出 token 数,而一次前向的编码器模型延迟只取决于输入长度,这个差别在「每天几百万次小决策」的场景里会变成成本表上的一个数量级。",
      en: "This module answers a question that sounds elementary and yet decides everything after it: when your code needs a judgement — which department owns this ticket, is this comment abusive, should this request go to the small model or the large one — what exactly do you need from the model? For three years the standard answer was: have an LLM emit JSON, then parse it. That works, but its failure modes are peculiar. The model can emit invalid JSON, or valid JSON with the wrong field names, or answer A today and B tomorrow on the same prompt, or misspell one of your enum values. So engineering grew a layer of patches: constrained decoding, schema validation, retries, repair prompts. Those patches fix the format and leave the deeper problem untouched — there is no probability behind the string you got back, you do not know how sure the model was, and so you cannot route by certainty. Chapter one runs both pipelines side by side to expose their structural differences in latency, failure mode and observability. Chapter two defines the three primitives: choice (pick from a given set, return the whole distribution), score (rate on an ordered scale), noul (a yes/no question returning the probability of yes), and says what each one is mathematically — choice is a multiclass softmax, score is the expectation of an ordinal regression, noul is a binary posterior. Chapter three explains where latency comes from: an autoregressive model's latency scales with the number of output tokens, while a single-forward encoder's depends only on input length, and at a few million small decisions a day that difference becomes an order of magnitude on the invoice.",
    },
  },
  {
    id: "m2", arch: "m2-arch", code: "JV", accent: "accent", level: 1,
    zh: "Jev 本体", en: "Jev Itself",
    tagline: { zh: "闭源、托管、排队制,但它定义了这一类模型的接口和词汇。先把基准线看清楚。", en: "Closed, hosted, behind a waitlist — and it defined this category's interface and vocabulary. Get the baseline straight first." },
    description: {
      zh: "2026 年 9 月 15 日,TypeSafe AI 发布了 Jev,并给这一类模型起了个名字:System One。这个模块把 Jev 讲清楚,不是因为你一定要用它,而是因为后面十几个开源项目全部按它的接口和它的三个原语来做,不懂它就看不懂它们。第一章讲接口:POST /v1/systemone、模型 ID jev-1.13.0 与别名 jev-latest、请求体里 state 和 questions 的结构、返回体里每个 answer 带的概率和 usage 块。这一章也讲清它的可达性现状——官方早期访问排队,而 Vercel AI Gateway 在发布次日就接进去了,从 AI SDK 的 evaluate 方法可以免排队调用。第二章讲一件很容易被一眼带过、但会改变你整个用法的事:Jev 按输入 token 计费,$0.042 每百万,而输出免费。输出免费意味着往一个 choice 里多加二十个选项、或者在一次请求里多问十个问题,成本几乎不变。这直接鼓励一种在 LLM 时代很奢侈的用法:投机式扇出——把你可能需要的判断一次性全问出来,而不是按需逐个调用。这一章用一个成本模型把两种用法的账算出来。第三章讲能力边界:官方报的 70 到 500 毫秒端到端延迟、v2 基准 96.6% 的准确率、Banking77 这种 77 个标签的高基数任务上 0.870 的成绩,这些数字分别在什么条件下成立,以及它们和你的场景之间隔着什么。",
      en: "On 15 September 2026 TypeSafe AI shipped Jev and gave the category a name: System One. This module covers Jev in detail — not because you must use it, but because the dozen open projects that followed all copy its interface and its three primitives, and none of them parse without it. Chapter one is the interface: POST /v1/systemone, model id jev-1.13.0 with the alias jev-latest, the shape of state and questions in the request, and the probabilities plus usage block each answer carries back. It also covers availability as it stands — official early access is behind a waitlist, while Vercel's AI Gateway wired it in the day after launch, callable from the AI SDK's evaluate method with no queue. Chapter two covers something easy to skim past that changes how you use the thing entirely: Jev bills input tokens at $0.042 per million and charges nothing for output. Free output means twenty more options on a choice, or ten more questions in one request, cost essentially nothing. That actively rewards a pattern that was extravagant in the LLM era — speculative fan-out, asking every judgement you might need in one shot instead of calling for each on demand. A cost model prices both patterns. Chapter three is the capability boundary: the 70-to-500 millisecond end-to-end latency the vendor reports, 96.6% on the v2 suite, 0.870 on a 77-label task like Banking77 — under what conditions each number holds, and what stands between them and your situation.",
    },
  },
  {
    id: "m3", arch: "m3-arch", code: "CA", accent: "primary", level: 2,
    zh: "概率与校准:这一类模型真正的卖点", en: "Probability and Calibration: What Is Actually Being Sold",
    tagline: { zh: "如果那个概率不可信,整个范式就只剩「快」这一个优点——而快是最容易被替代的优点。", en: "If the probability cannot be trusted, the paradigm has speed and nothing else — and speed is the easiest advantage to replace." },
    description: {
      zh: "这是全书的技术核心,也是最多人跳过的模块。System One 模型卖的不是分类能力——ModernBERT 微调一下也能分类——卖的是「带校准概率的分类」:模型说 0.9,那一百次里大约就该对九十次。有了这个性质,你才能写出「≥0.85 自动处理,否则转人工」这种代码,而这行代码就是这类模型全部的商业价值所在。第一章把三个经常被混为一谈的东西拆开:准确率(答对的比例)、置信度(模型自报的把握)、校准(两者是否一致)。一个 70% 准确率但完美校准的模型,比一个 85% 准确率但永远报 0.99 的模型有用得多,因为前者你能分流,后者你只能全信或全不信。这一章在决策台上现算可靠性图、ECE 和 Brier 分数。第二章讲温度缩放:一个标量除在 logits 上,不改变任何预测的排序,却能把 ECE 从 0.466 压到 0.081。它为什么有效、为什么必须在留出集上拟合、以及一个所有教程都会犯的错——在训练集或者在你打算报告的那批数据上拟合温度,等于自己骗自己。第三章把校准换算成钱:门槛-覆盖率-精度的交换曲线。这条曲线才是你要和业务方谈的东西——「0.9 门槛下我能自动处理三成,这三成的准确率是 0.65」,而不是「模型准确率 50.5%」。这一章也给出一个冷静的判据:如果把门槛从 0.5 拉到 0.95、覆盖率砍掉三分之二而精度只涨六个点,那么这个模型在你的数据上没有可用的置信度信号,gating 这条产品设计在这里是失效的。",
      en: "This is the book's technical core and the module most people skip. A System One model does not sell classification — a fine-tuned ModernBERT classifies too — it sells classification with a calibrated probability: when it says 0.9, ninety of a hundred such cases should be right. That property is what lets you write 'auto-handle at 0.85 or above, otherwise escalate', and that one line is where all of this category's commercial value lives. Chapter one separates three things that get conflated: accuracy (how often it is right), confidence (how sure it says it is), and calibration (whether those agree). A 70%-accurate model with perfect calibration is far more useful than an 85%-accurate one that always reports 0.99, because the first can be routed on and the second can only be trusted wholesale or not at all. Reliability diagrams, ECE and Brier score are computed live on the bench. Chapter two is temperature scaling: one scalar divided into the logits, changing no prediction's ranking, yet moving ECE from 0.466 to 0.081. Why it works, why it must be fitted on held-out data, and the mistake every tutorial makes — fitting the temperature on the training set, or on the very data you intend to report, is lying to yourself. Chapter three converts calibration into money: the threshold-coverage-precision trade curve. That curve, not '50.5% accurate', is what you take to the business — 'at a 0.9 threshold I can automate thirty percent of volume, and that thirty percent is 65% correct'. It also gives a cold test: if pushing the threshold from 0.5 to 0.95 cuts coverage by two thirds and buys six points of precision, there is no usable confidence signal in your data and the gating design has failed here.",
    },
  },
  {
    id: "m4", arch: "m4-arch", code: "LY", accent: "accent", level: 2,
    zh: "Laya:把开源平替拆开看", en: "Laya: The Open Alternative, Opened Up",
    tagline: { zh: "421M 参数、Apache-2.0、pip 一行装上。它的价值和它的坑都在源码里,不在 README 里。", en: "421M parameters, Apache-2.0, one pip line. Its value and its traps both live in the source, not the README." },
    description: {
      zh: "Jev 发布一周内出现了三十多个开源实现,Laya 是其中最成熟、也最诚实的一个。这个模块把它拆开:它怎么工作、怎么部署、以及三个只有读源码才会发现的坑。第一章讲结构:三个 checkpoint(英文 421M 基于 ModernBERT-large、多语言 322M 基于 mmBERT-base、以及一个在 typed-decisions 上微调过的变体)和一个内置路由器——它先用亚毫秒级的脚本/语言检测判断文本属于哪一类,再派给对应的 checkpoint。这一章也讲清一个硬约束:英文 checkpoint 在非拉丁文字上会崩,高棉语准确率 0.000 而自报置信度 95.2%,中文必须走多语言那一支。第二章讲编码器怎么吃下一个「问题」:选项不是分类头上的神经元,而是被拼进输入序列的一段提示,所以它们要和正文抢 token 预算。默认 head_max_len 是 256,18 个标签时每个标签只分到约 13 个 token——你的中文标签描述在这里被静默截断。这一章在决策台上把 token 预算、标签数和描述长度的三方拉扯算出来,也给出本书实测的一个反直觉结果:把预算从 256 提到 1024,准确率一点没动,P95 延迟却从 447 毫秒涨到 2290 毫秒。第三章是 Laya 的诚实清单,这一章的内容大部分来自源码注释和 issue,而不是宣传页:noul 在英文 checkpoint 上会跟着 false:/true: 标签走(#156);多语言 checkpoint 在 score 上有位置偏置,几乎不选第一个等级(#131);action.act_probability 对几乎所有输入都读 1.0,AUROC 0.30,反着走,该 gate 的是 confidence(#185);以及最要命的一条——出厂的 choice:11+ 温度桶是 0.1006,会把 0.24 的 top 概率放大成 0.99,库自己加了 TEMP_MIN=0.5 拒绝应用它。",
      en: "Thirty-odd open implementations appeared within a week of Jev's launch; Laya is the most mature and the most honest of them. This module takes it apart: how it works, how to deploy it, and three traps you only find by reading the source. Chapter one is structure — three checkpoints (English 421M on ModernBERT-large, multilingual 322M on mmBERT-base, and a variant fine-tuned on typed-decisions) behind a built-in router that runs sub-millisecond script and language detection and dispatches accordingly. It also nails down a hard constraint: the English checkpoint collapses on non-Latin scripts, scoring 0.000 on Khmer while reporting 95.2% confidence, so Chinese must go to the multilingual branch. Chapter two covers how an encoder swallows a 'question': options are not neurons on a classification head, they are text spliced into the input sequence, so they compete with your document for token budget. The default head_max_len is 256, which at 18 labels leaves roughly 13 tokens per label — and your Chinese label descriptions get silently truncated there. The bench computes the three-way tension between budget, label count and description length, and the chapter reports a counter-intuitive measurement from this book: raising the budget from 256 to 1024 moved accuracy not at all while P95 latency went from 447 ms to 2290 ms. Chapter three is Laya's honest list, most of it drawn from source comments and issues rather than the landing page: noul follows its false:/true: option labels on the English checkpoint (#156); the multilingual checkpoint has a position bias on score and rarely picks the first level (#131); action.act_probability reads 1.0 for nearly every input with an AUROC of 0.30 — it runs against correctness, so gate on confidence instead (#185); and worst of all, the shipped choice:11+ temperature bucket is 0.1006, which inflates a 0.24 top probability to 0.99, and the library added TEMP_MIN=0.5 to refuse to apply it.",
    },
  },
  {
    id: "m5", arch: "m5-arch", code: "OS", accent: "primary", level: 2,
    zh: "另外三十个开源实现", en: "The Other Thirty Open Implementations",
    tagline: { zh: "一周之内冒出来的东西,别当成已经沉淀的技术选型。但里面确实有几个值得认真看。", en: "A week's worth of projects is not a settled field. A few of them are still worth a serious look." },
    description: {
      zh: "这个模块把 Jev 之后一周内出现的开源生态做一次分类和体检。第一章讲编码器派:Von(ModernBERT-Large 395M,自报约 18 毫秒、v2 基准 72.0% 对 Jev 的 96.6%,但在 ViZDoom 实时对战里反超 Jev,9.00 击杀对 5.62,自带 /v1/systemone 兼容服务)、Verdict(ModernBERT 151M,支持弃权这一档,能在浏览器里用 WebGPU 跑)、jeff(GLiFormer 400M,只做分类)、OpenDecision(纯 CPU,README 自己声明 confidence 衡量的是分布集中度而不是校准概率)。这一派的共同特征是快、小、标签一多就垮。第二章讲 LLM 派:Kev(Qwen3.5 加 LoRA,0.8B 到 9B,自报 0.837 与 0.852,对齐 TypeSafe 的 API)、SemIf(不训练新模型,直接读现有模型选项 token 的 logits,0.845 一致率)、NanoJev(Qwen3 0.6B,面向游戏和控制回路)、OpenJev(DiffusionGemma 26B-A4B,规模最大,要 vLLM 加大显存)、Decider(声称校准但没公布任何测量)。这一派慢一些,但在高基数标签集上扛得住。第三章是整个模块的落点,也是最容易被跳过的一条路:你可能根本不需要一个 System One 模型。如果标签固定而且有几百条标注,微调 ModernBERT 或者 SetFit 给你同样的延迟、而且校准是你自己测得出来的;如果只要求输出结构合法,Outlines 和 XGrammar 的约束解码就够了——但要分清,它们保证 schema 合法,不给你校准概率,这是和 System One 模型的根本分界;如果已经在跑 LLM,读选项 token 的 logits 是零新增组件的做法。这一章把四条路线在延迟、校准、上线成本和维护面上并排摆出来。",
      en: "This module classifies and examines the open ecosystem that appeared in the week after Jev. Chapter one covers the encoder camp: Von (ModernBERT-Large 395M, self-reported ~18 ms, 72.0% on the v2 suite against Jev's 96.6%, yet ahead of Jev in real-time ViZDoom combat at 9.00 kills to 5.62, and shipping a /v1/systemone-compatible server), Verdict (ModernBERT 151M, supports abstention, runs in-browser on WebGPU), jeff (GLiFormer 400M, classification only) and OpenDecision (CPU-only, whose README states plainly that its confidence measures distribution concentration rather than calibrated probability). The camp is fast, small, and falls over as labels multiply. Chapter two covers the LLM camp: Kev (Qwen3.5 plus LoRA, 0.8B to 9B, self-reported 0.837 and 0.852, aligned to TypeSafe's API), SemIf (trains nothing, reads the logits of option tokens on a model you already run, 0.845 agreement), NanoJev (Qwen3 0.6B, aimed at games and control loops), OpenJev (DiffusionGemma 26B-A4B, the largest, needing vLLM and real VRAM) and Decider (claims calibration, publishes no measurement). Slower, but they hold up on high-cardinality label sets. Chapter three is where the module lands, and it is the route most often skipped: you may not need a System One model at all. With fixed labels and a few hundred annotations, a fine-tuned ModernBERT or SetFit gives you the same latency with calibration you can measure yourself; if you only need structurally valid output, constrained decoding via Outlines or XGrammar is enough — but be clear that those guarantee a schema and give you no calibrated probability, which is the dividing line; and if you already run an LLM, reading option-token logits adds no component at all. The chapter lays the four routes side by side on latency, calibration, cost to ship and surface to maintain.",
    },
  },
  {
    id: "m6", arch: "m6-arch", code: "EV", accent: "accent", level: 3,
    zh: "自己评测:别信任何人的 README", en: "Measure It Yourself: Trust No README",
    tagline: { zh: "所有项目的数字都是作者自报的,而且没有一个发布过第三方跑的校准复测。你的数据是唯一的裁判。", en: "Every number is the author's own, and nobody has published a third-party calibration run. Your data is the only referee." },
    description: {
      zh: "这个模块教你在两个小时之内判断一个 System One 模型在你的场景里能不能用,而不是读三天评测博客。第一章讲基线,这是最容易被跳过也最不该跳过的一步:随机基线(1/k)、多数类基线、关键词规则基线。一个 0.505 的准确率听起来不高,但如果随机是 0.056、多数类是 0.120,那它确实学到了东西;反过来,如果你的多数类基线就有 0.62,那 0.65 的模型等于没做。没有基线的准确率是一个没有单位的数。第二章讲评测集怎么建:多少条够用(分层抽样下每类至少 20 条才谈得上分类级指标)、标签描述比标签名重要得多(模型读的是描述不是键)、以及一个必须守住的纪律——拟合温度的那一半数据不能和报告指标的那一半重叠。这一章用本书的真实例子:216 条中文需求、18 个模块、描述取自同一张表的子模块名。第三章教你读一次评测的四张表:准确率对三条基线、延迟的中位与 P95(不是平均,平均会被冷启动骗)、校准的原样 ECE 与拟合后 ECE、以及门槛-覆盖率-精度表。这一章也给出一个判决模板——什么样的数字组合意味着「可以上线」、什么样意味着「换条路」、什么样意味着「数据或标签体系本身有问题」。",
      en: "This module teaches you to decide in two hours whether a System One model works in your setting, instead of reading evaluation blogs for three days. Chapter one is baselines, the step most often skipped and least safely skipped: random (1/k), majority class, and a keyword-rule baseline. An accuracy of 0.505 sounds poor, but against a random 0.056 and a majority 0.120 the model has clearly learned something; conversely, if your majority baseline is already 0.62, a 0.65 model has done nothing. Accuracy without a baseline is a number without units. Chapter two covers building the evaluation set: how many rows are enough (under stratified sampling, at least twenty per class before per-class metrics mean anything), why label descriptions matter far more than label names (the model reads the description, not the key), and one discipline you may not break — the half you fit the temperature on must not overlap the half you report. The worked example is this book's own: 216 Chinese requirement rows, 18 modules, descriptions taken from the same sheet's sub-module names. Chapter three teaches you to read the four tables of an evaluation: accuracy against all three baselines, median and P95 latency (never the mean, which cold starts corrupt), ECE as-shipped and after fitting, and the threshold-coverage-precision table. It closes with a verdict template — which combinations of numbers mean ship it, which mean take another route, and which mean the data or the label taxonomy itself is the problem.",
    },
  },
  {
    id: "m7", arch: "m7-arch", code: "OP", accent: "primary", level: 3,
    zh: "上线工程", en: "Shipping It",
    tagline: { zh: "一次前向 400 毫秒的模型,上线难度和一个 Web 服务差不多——前提是你把批处理、线程数和兜底想清楚。", en: "A model that answers in 400 ms ships about as hard as a web service — once batching, thread count and fallback are settled." },
    description: {
      zh: "这个模块讲把它放进生产环境需要的东西。第一章讲自托管:laya[serve] 起的 laya-serve 暴露的就是 Jev 同协议的 POST /v1/systemone,一个现成的 Jev 客户端只要改 baseUrl 就能指过来。这一章讲全部环境变量(LAYA_DEVICE、LAYA_PRELOAD、LAYA_MODELS、LAYA_THREADS、LAYA_API_KEY)、预加载与显存/内存常驻策略(默认保持 english 和 multilingual 两个热的,LRU 淘汰)、以及鉴权这一层必须自己加。第二章讲容量:一次前向的延迟只取决于输入长度和 batch,所以这类模型的吞吐曲线和 LLM 完全不同——批 10 个问题在 GPU 上把单问成本从 32.8 毫秒压到 7.2 毫秒,而在 CPU 上 LAYA_THREADS 超过物理核数反而更慢。这一章在决策台上跑一个排队模型,让你按 QPS、延迟预算和并发数算出要几个 worker。第三章讲这类系统真正的架构:两级。高置信度的走模型自动处理,低置信度的转给 LLM 或人工。这一章讲两级架构的三个参数怎么定(门槛、兜底容量、兜底延迟预算),讲降级路径(模型挂了怎么办——全部转兜底还是全部放行,这是个业务决定不是技术决定),也讲监控该看什么:不是准确率(线上没有标签),而是置信度分布的漂移、兜底率的变化和人工推翻率。",
      en: "This module covers what it takes to put the thing in production. Chapter one is self-hosting: laya-serve from the laya[serve] extra exposes exactly Jev's POST /v1/systemone, so an existing Jev client only needs its baseUrl repointed. It walks the environment variables (LAYA_DEVICE, LAYA_PRELOAD, LAYA_MODELS, LAYA_THREADS, LAYA_API_KEY), the preload and residency strategy (two checkpoints kept hot by default, english and multilingual, with LRU eviction), and the fact that authentication is a layer you must add yourself. Chapter two is capacity: single-forward latency depends only on input length and batch, so the throughput curve looks nothing like an LLM's — batching ten questions on a GPU drops per-question cost from 32.8 ms to 7.2 ms, while on CPU pushing LAYA_THREADS past the physical core count makes things slower. A queueing model on the bench turns QPS, a latency budget and concurrency into a worker count. Chapter three covers what this system's architecture really is: two tiers. High confidence is handled by the model; low confidence goes to an LLM or a human. The chapter settles the three parameters of a two-tier design (threshold, fallback capacity, fallback latency budget), the degradation path (what happens when the model dies — everything to fallback or everything through, which is a business decision and not a technical one), and what to monitor: not accuracy, since production has no labels, but drift in the confidence distribution, movement in the fallback rate, and the human override rate.",
    },
  },
  {
    id: "m8", arch: "m8-arch", code: "CS", accent: "accent", level: 3,
    zh: "两个案例与一棵决策树", en: "Two Cases and a Decision Tree",
    tagline: { zh: "一个失败的案例比十个成功案例有用,因为失败的原因是可迁移的。", en: "One failed case teaches more than ten successes, because the reason it failed transfers." },
    description: {
      zh: "最后一个模块把前面所有东西放回真实场景里。第一章是一个完整的失败案例,数据和数字全部来自本书的实测:216 条中文需求条目,要分进 18 个业务模块,用 Laya 的多语言 checkpoint。准确率 0.505,对着 0.056 的随机和 0.120 的多数类——模型确实学到了东西。延迟中位 401 毫秒、P95 447 毫秒,官方的 CPU 口径站得住。ECE 原样 0.215,自己在留出集上拟合出 T=1.65 之后降到 0.141,仍然大于 0.1。但真正判它死刑的是门槛表:门槛从 0.50 拉到 0.95,覆盖率从 56.5% 砍到 20.8%,精度只从 0.623 爬到 0.689。置信度在这份数据上几乎不区分对错,而这正是整个范式的卖点。这一章逐条分析为什么:18 个标签落在那个被废掉的 choice:11+ 温度桶里、标签之间语义重叠(「仓库管理」和「客户计划变更下的原料保障与库存控制」本来就不互斥)、每类平均只有 12 条、以及 base checkpoint 本来就是个待微调的底座(README 自报零样本 0.362 对随机 0.318)。第二章反过来,讲这类模型能赢的形状:标签少(2 到 5 个)、量大(每天几十万次以上)、语义边界清晰、而且门槛真的能把对错分开——提示词注入检测、内容安全过滤、模型路由都属于这一类,这一章给出一个这种形状的完整算账。第三章是一棵决策树和一个时间戳:按你的标签数、语言、数据量、延迟预算和是否已有 LLM,走到一个具体建议;以及一句提醒——本书写于这一切发生后的第八天,任何具体数字都该被你自己重测一遍。",
      en: "The last module puts everything back into real situations. Chapter one is a complete failure case whose data and numbers are all measured in this book: 216 Chinese requirement rows sorted into 18 business modules using Laya's multilingual checkpoint. Accuracy 0.505 against a random 0.056 and a majority 0.120 — the model did learn something. Median latency 401 ms, P95 447 ms, so the vendor's CPU figures hold. ECE 0.215 as shipped, down to 0.141 after fitting T=1.65 on a held-out half, still above 0.1. What condemned it was the threshold table: from 0.50 to 0.95 the coverage fell from 56.5% to 20.8% while precision rose only from 0.623 to 0.689. Confidence barely separates right from wrong on this data, and that separation is the entire pitch. The chapter works through why: 18 labels land in the discredited choice:11+ temperature bucket; the labels overlap semantically (warehouse management and material assurance under customer plan changes were never mutually exclusive); there are only about twelve rows per class; and the base checkpoint is a foundation to fine-tune, which its own README says by reporting 0.362 zero-shot against a 0.318 random baseline. Chapter two inverts it and describes the shape this class of model wins on: few labels (two to five), high volume (hundreds of thousands of calls a day), clean semantic boundaries, and a threshold that genuinely separates right from wrong — prompt-injection detection, content safety and model routing all have that shape, and the chapter prices one end to end. Chapter three is a decision tree and a timestamp: your label count, language, data volume, latency budget and whether you already run an LLM lead to one concrete recommendation; plus a reminder that this book was written on the eighth day after all of this happened, and every specific number in it deserves your own re-measurement.",
    },
  },
];

const CHAPTERS = [
  /* ============ M1 · SO 决策不是文本 ============ */
  {
    id: "t1", code: "SO1", moduleId: "m1", difficulty: 1, hours: 4, prereq: [], viz: "pipeLab",
    props: ["JSON 解析流水线", "类型化决策", "失败模式", "端到端延迟", "可观测性"],
    title: { zh: "两条流水线:生成再解析 vs 直接返回决策", en: "Two Pipelines: Generate-then-Parse vs Return the Decision" },
    summary: {
      zh: "你的代码需要一个判断。过去三年的做法是:写一段提示词,让 LLM 输出 JSON,再解析出那个字段。这条路能跑,但它的失败模式很特别——不合法的 JSON、合法但字段名漂移的 JSON、同一输入两次不同答案、枚举值被拼错一个字母。于是长出了一整套补丁:约束解码、schema 校验、重试、修复提示词。这些补丁解决的是格式问题,而不是信息问题:你拿回来的那个字符串背后没有概率,你不知道模型有多确定,于是你只能全信或全不信。System One 的提法是把这一层直接翻过去——输入程序状态和若干个类型化问题,输出带概率的答案,没有文本生成,也就没有要解析的东西。这一章在决策台上把两条流水线并排跑:同一个工单,左边走「生成 JSON 再解析」,右边走「一次前向出决策」,你可以注入五类真实故障(截断、字段漂移、枚举拼错、非法 JSON、超时),看两边各自怎么塌。结论不是「LLM 不行」,而是一个更精确的说法:当你要的是一个枚举值和一个概率时,让模型生成一串 token 再抠出来,是在为一个你不需要的能力付延迟和不确定性的账。",
      en: "Your code needs a judgement. For three years the way to get one was: write a prompt, have the LLM emit JSON, parse the field out. It runs, but its failure modes are peculiar — invalid JSON, valid JSON whose field names drifted, two different answers to one input, an enum value with one letter wrong. So a layer of patches grew: constrained decoding, schema validation, retries, repair prompts. Those fix a format problem, not an information problem: there is no probability behind the string you got back, you do not know how sure the model was, and so you can only trust it wholly or not at all. The System One proposal skips that layer — feed in program state and some typed questions, get answers with probabilities, with no text generated and therefore nothing to parse. The bench runs both pipelines on one ticket: generate-then-parse on the left, single forward on the right, with five real faults you can inject (truncation, field drift, misspelled enum, invalid JSON, timeout) so you can watch each one collapse. The conclusion is not that LLMs are bad, but something more precise: when what you want is an enum and a probability, having a model emit tokens so you can dig the value back out means paying latency and uncertainty for a capability you did not need.",
    },
    objectives: [
      { zh: "说清「生成再解析」的四类失败模式,以及每一类的补丁和补丁的代价", en: "Name the four failure modes of generate-then-parse, each patch, and what each patch costs" },
      { zh: "区分「格式合法」和「带概率」——约束解码解决前者,不解决后者", en: "Separate valid format from carrying a probability — constrained decoding fixes the first, not the second" },
      { zh: "判断一个需求是不是 System One 形状的:枚举 + 概率 + 高频", en: "Judge whether a requirement has the System One shape: enum plus probability plus volume" },
    ],
    outline: [
      { zh: "一个真实工单在两条流水线上的旅程", en: "One real ticket's journey down both pipelines" },
      { zh: "五类故障注入:它们各自在哪一步塌", en: "Five injected faults and where each one breaks" },
      { zh: "补丁的代价:重试如何把 P99 拉成 P50 的四倍", en: "What patches cost: how retries make P99 four times P50" },
      { zh: "什么时候这条路不值得换", en: "When the detour is not worth replacing" },
    ],
  },
  {
    id: "t2", code: "SO2", moduleId: "m1", difficulty: 1, hours: 5, prereq: ["t1"], viz: "primLab",
    props: ["choice", "score", "noul", "softmax", "有序回归", "二分类后验"],
    title: { zh: "三个原语:choice、score、noul 在数学上分别是什么", en: "Three Primitives: What choice, score and noul Actually Are" },
    summary: {
      zh: "System One 把所有决策收敛到三个原语,这不是产品上的简化,而是因为这三个形状覆盖了程序真正需要的判断。choice 是从预先给定的集合里选一个,返回的是整个集合上的概率分布——数学上就是一个多类 softmax,所以选项的数量直接决定了分布的熵,也决定了置信度这个数的量纲。score 是在一个有序量表上打分,返回的是这个有序分布的期望值,所以它是个连续数,但它的不确定性藏在分布的形状里而不在这个数里——一个均匀分布和一个双峰分布可以给出同一个 1.5 分。noul 是是非题,返回「是」的概率,它是三者里唯一一个数值本身就是概率的原语,也因此最容易被误用:0.82 的意思是「同类输入里约八成为真」,而不是「这一条有 82 分」。这一章在决策台上让你直接操纵三种分布:拖动 logits,看 choice 的 top-1 概率、熵和置信度怎么联动;看 score 的期望值在双峰分布下怎么落在一个两边都不成立的位置;看 noul 的概率和它的置信度是同一个数的两种读法。这一章还要钉死一件事——选项数量 k 会改变一切:k=2 时随机基线是 0.5,k=18 时是 0.056,拿同一个置信度门槛去卡两种任务是没有意义的。",
      en: "System One collapses every decision into three primitives. That is not product simplification; those three shapes cover what programs actually need. choice picks one item from a set fixed in advance and returns a distribution over the whole set — mathematically a multiclass softmax, so the number of options directly sets the entropy of that distribution and the units of the confidence number. score rates on an ordered scale and returns the expectation of an ordinal distribution, so it is a continuous number whose uncertainty lives in the shape of the distribution rather than in the number: a uniform and a bimodal distribution can both give 1.5. noul is the yes/no question returning the probability of yes, the only primitive whose value is itself a probability, and therefore the easiest to misread: 0.82 means about eight in ten such inputs are true, not that this one scores 82. The bench lets you manipulate all three distributions directly: drag the logits and watch choice's top-1 probability, entropy and confidence move together; watch score's expectation land, under a bimodal distribution, exactly where neither mode is; watch noul's probability and its confidence be two readings of one number. One thing gets nailed down here: the option count k changes everything. At k=2 the random baseline is 0.5; at k=18 it is 0.056, and carrying one confidence threshold between those two tasks is meaningless.",
    },
    objectives: [
      { zh: "写出三个原语各自的概率含义,并说清哪个数是概率、哪个不是", en: "State the probabilistic meaning of each primitive and which numbers are probabilities" },
      { zh: "解释选项数 k 怎么改变置信度这个数的量纲", en: "Explain how the option count k changes the units of the confidence number" },
      { zh: "识别 score 的期望值在双峰分布下的失效", en: "Spot where score's expectation fails under a bimodal distribution" },
    ],
    outline: [
      { zh: "choice:softmax、熵与 top-1 概率", en: "choice: softmax, entropy and top-1 probability" },
      { zh: "score:有序分布的期望,和它藏起来的不确定性", en: "score: the expectation of an ordinal distribution and its hidden uncertainty" },
      { zh: "noul:唯一一个数值即概率的原语", en: "noul: the one primitive whose value is a probability" },
      { zh: "k 的影响:随机基线、熵上界与门槛的可比性", en: "The effect of k: random baseline, entropy ceiling and threshold comparability" },
    ],
  },
  {
    id: "t3", code: "SO3", moduleId: "m1", difficulty: 2, hours: 4, prereq: ["t2"], viz: "latencyLab",
    props: ["自回归延迟", "一次前向", "KV cache", "吞吐 vs 延迟", "成本结构"],
    title: { zh: "延迟从哪来:自回归的 token 税与一次前向", en: "Where Latency Comes From: The Autoregressive Token Tax" },
    summary: {
      zh: "一个自回归模型输出 40 个 token,就要跑 40 次前向,每一次都要读一遍 KV cache——它的延迟正比于输出长度,而输出长度又取决于模型今天想怎么说话。一个非自回归的编码器把整个输入过一遍,在最后一层读出 logits——它的延迟只取决于输入长度和 batch,与「答案有多长」完全无关,因为答案没有长度。这一章把这个结构差异算清楚,而不是停在「快 7 倍」这种宣传语上。决策台上是一个延迟分解器:调输入长度、输出 token 数、batch size 和硬件档位,看两条曲线怎么分叉——短输入长输出时差距最大,长输入短输出时两者趋同,而这恰好解释了为什么 System One 模型在「一句话工单 + 一个枚举」上收益最大,在「十页合同 + 一个枚举」上收益有限。这一章也讲清一个常被忽略的后果:没有 KV cache 意味着显存占用是常数而不是随对话增长,这让并发容量的估算变成一件简单的事。最后给出本书实测的一组数字作为参照——这台没有 GPU 的机器上,英文 checkpoint 三个问题一次前向热态 976 毫秒,多语言 checkpoint 单问 18 选项中位 401 毫秒、P95 447 毫秒,与官方 CPU 口径 193 到 464 毫秒一致。",
      en: "An autoregressive model that emits forty tokens runs forty forward passes, each reading the KV cache — its latency scales with output length, and output length depends on how the model feels like phrasing things today. A non-autoregressive encoder passes the input through once and reads logits off the last layer — its latency depends only on input length and batch, and not at all on how long the answer is, because the answer has no length. This chapter quantifies that structural difference instead of stopping at 'seven times faster'. The bench is a latency decomposer: set input length, output token count, batch size and a hardware tier, and watch the two curves diverge — the gap is widest with short inputs and long outputs, and closes with long inputs and short outputs, which is exactly why System One models pay off most on 'one-line ticket plus one enum' and much less on 'ten-page contract plus one enum'. It also covers a consequence that gets missed: with no KV cache, memory is constant rather than growing with the conversation, which makes concurrency planning arithmetic. It closes with measurements from this book as a reference — on a machine with no GPU, the English checkpoint answers three questions in one warm forward pass in 976 ms, and the multilingual checkpoint answers one 18-option question at a median of 401 ms and a P95 of 447 ms, consistent with the vendor's 193-to-464 ms CPU range.",
    },
    objectives: [
      { zh: "分解一次调用的延迟:输入、输出、排队、网络", en: "Decompose a call's latency into input, output, queueing and network" },
      { zh: "判断什么样的输入输出比会让非自回归的优势消失", en: "Judge which input/output ratio erases the non-autoregressive advantage" },
      { zh: "用常数显存这一性质估算并发容量", en: "Use constant memory to size concurrency" },
    ],
    outline: [
      { zh: "自回归:延迟 = 输出长度 × 每步", en: "Autoregressive: latency equals output length times per-step cost" },
      { zh: "一次前向:延迟只看输入", en: "Single forward: latency sees only the input" },
      { zh: "两条曲线在哪里交叉", en: "Where the two curves cross" },
      { zh: "本书实测:CPU 上的真实数字", en: "Measured here: the real numbers on CPU" },
    ],
  },

  /* ============ M2 · JV Jev 本体 ============ */
  {
    id: "t4", code: "JV1", moduleId: "m2", difficulty: 1, hours: 4, prereq: ["t2"], viz: "apiLab",
    props: ["/v1/systemone", "state", "questions", "usage 块", "jev-latest", "可达性"],
    title: { zh: "Jev 的接口:state、questions 和一个 usage 块", en: "Jev's Interface: state, questions and a usage Block" },
    summary: {
      zh: "Jev 的整个 API 面只有一个端点:POST https://api.typesafe.ai/v1/systemone。请求体里两样东西——state 是你的程序状态,可以是字符串、字典或者列表,不需要预先设计 schema;questions 是一个字典,每个键是你要的答案名,值声明它的 type(choice / score / noul)、instructions 和 criteria。返回体里每个答案带着它的类型、结果、整个概率分布和一个 confidence,外加一个 {input_tokens, output_tokens} 的 usage 块。就这些。这一章把这个接口逐字段讲清楚,并强调两个设计选择:第一,questions 是个字典而不是列表,这意味着你的代码按名字取答案而不是按下标,重排问题不会改变行为;第二,criteria 对 choice 是一个「键到描述」的映射,而模型真正读的是描述——键只是你的程序拿去 switch 的标识符,所以键可以写成 A/B/C,但描述必须写清楚,这一条在后面的实测里会反复出现。这一章也说清可达性:官方早期访问排队中,而 Vercel 在发布次日把它接进了 AI Gateway,从 AI SDK 7 的 evaluate 方法可以免排队调用。决策台上是一个请求构造器:改 state 和 questions,看请求体和返回体怎么变,也看一个格式错误的 question 会收到什么样的报错。",
      en: "Jev's entire API surface is one endpoint: POST https://api.typesafe.ai/v1/systemone. The request carries two things — state, your program's state as a string, dict or list, with no schema to design in advance; and questions, a dict whose keys are the answer names you want and whose values declare a type (choice, score or noul), instructions and criteria. Each answer comes back with its type, its result, the full probability distribution and a confidence, plus an {input_tokens, output_tokens} usage block. That is all of it. The chapter walks every field and highlights two design choices. First, questions is a dict rather than a list, so your code fetches answers by name instead of by index and reordering questions cannot change behaviour. Second, for choice the criteria is a key-to-description mapping and the model reads the description — the key is only the identifier your program switches on. So keys may be A/B/C, but descriptions must be written properly, a point that returns again and again in the measurements later. Availability is covered too: official early access is queued, while Vercel wired it into the AI Gateway the day after launch, callable from AI SDK 7's evaluate method with no waitlist. The bench is a request builder: edit state and questions, watch request and response change, and see what a malformed question gets back.",
    },
    objectives: [
      { zh: "手写一个合法的 /v1/systemone 请求体", en: "Hand-write a valid /v1/systemone request body" },
      { zh: "说清 criteria 的键和描述各自被谁读", en: "Say who reads the criteria key and who reads the description" },
      { zh: "知道今天怎么才能真的调到它", en: "Know how to actually reach it today" },
    ],
    outline: [
      { zh: "state:不需要 schema 的输入", en: "state: input with no schema" },
      { zh: "questions:按名字取答案", en: "questions: answers fetched by name" },
      { zh: "返回体:分布、置信度、usage", en: "The response: distribution, confidence, usage" },
      { zh: "waitlist 与 Vercel AI Gateway", en: "The waitlist and Vercel's AI Gateway" },
    ],
  },
  {
    id: "t5", code: "JV2", moduleId: "m2", difficulty: 2, hours: 5, prereq: ["t4"], viz: "costLab",
    props: ["输入计费", "输出免费", "投机式扇出", "选项成本", "批量提问"],
    title: { zh: "输出免费意味着什么:投机式扇出的成本模型", en: "What Free Output Means: A Cost Model for Speculative Fan-Out" },
    summary: {
      zh: "Jev 按输入 token 计费,每百万 $0.042,输出不要钱。这一行定价表比它看上去重要得多,因为它把 LLM 时代养成的一整套节约习惯翻了过来。在按输出计费的世界里,你会尽量少问、尽量让模型少说;在输出免费的世界里,往一个 choice 里多加二十个选项几乎不加钱,在一次请求里多问十个问题也几乎不加钱——真正花钱的是你把多少 state 送进去,而 state 在这几种问法之间是共享的。于是最省钱的用法反而是投机式扇出:把这条数据你未来可能需要的所有判断一次性问完,而不是按需分多次调用,因为第二次调用要重新付一遍 state 的钱。这一章用一个成本模型把两种用法的账算出来:决策台上调 state 长度、问题数量、选项数量和调用频率,看「按需多次」和「一次问完」的月度账单怎么交叉——交叉点通常出现得比人们预期的早得多。这一章也讲清这个定价结构的边界:当 state 很短而问题很多时,一次问完几乎白赚;当 state 很长而你只需要一个判断时,两种用法没差别;而当你需要的判断依赖前一个判断的结果时,扇出救不了你,那是个真正的多轮问题。",
      en: "Jev bills input tokens at $0.042 per million and charges nothing for output. That line of the price list matters far more than it looks, because it inverts a whole set of habits the LLM era taught. In a world billed by output you ask as little as possible and keep the model terse; with free output, twenty more options on a choice cost almost nothing, and ten more questions in one request cost almost nothing — what you pay for is how much state you send, and the state is shared across all those questions. So the cheapest pattern is the speculative one: ask every judgement you might later need about this record in a single call, rather than calling repeatedly on demand, because a second call pays for the state all over again. A cost model prices both: set state length, question count, option count and call frequency on the bench, and watch the monthly bills for 'on demand' and 'ask it all' cross — usually much earlier than people expect. The chapter also bounds the structure: when state is short and questions are many, asking everything is nearly free; when state is long and you need one judgement, the two patterns are identical; and when a judgement depends on the result of a previous one, fan-out cannot help you, because that is a genuinely multi-turn problem.",
    },
    objectives: [
      { zh: "按输入计费的模型下算出一次调用的真实成本", en: "Compute a call's true cost under input-only billing" },
      { zh: "找到「按需调用」和「一次扇出」的成本交叉点", en: "Find the crossover between on-demand calls and one fan-out" },
      { zh: "识别扇出救不了的那类需求", en: "Recognise the requirements fan-out cannot rescue" },
    ],
    outline: [
      { zh: "定价表的结构性后果", en: "The structural consequence of the price list" },
      { zh: "state 的复用与重复付费", en: "Reusing state versus paying for it twice" },
      { zh: "扇出的账:月度账单交叉点", en: "Pricing fan-out: where the monthly bills cross" },
      { zh: "依赖型判断:扇出的边界", en: "Dependent judgements: the boundary of fan-out" },
    ],
  },
  {
    id: "t6", code: "JV3", moduleId: "m2", difficulty: 2, hours: 5, prereq: ["t5"], viz: "claimLab",
    props: ["v2 基准", "Banking77", "端到端延迟", "宣传数字的条件", "可迁移性"],
    title: { zh: "96.6% 和 0.870 后面是什么条件", en: "What Conditions Sit Behind 96.6% and 0.870" },
    summary: {
      zh: "Jev 的三个招牌数字是:端到端 70 到 500 毫秒、v2 基准 96.6%、Banking77 上 0.870。这一章教你把这类数字拆开看,而不是照搬进你的方案设计。70 到 500 毫秒是个 7 倍宽的区间,跨度来自 state 长度、问题数量和网络,落在区间哪一端取决于你的用法而不是模型;96.6% 是在一个由供应商定义的任务集合上的宏平均,它的价值在于和同一套题上的其他模型比,而不在于预测你的任务;0.870 在 Banking77 上最有信息量——77 个标签的高基数意图分类是这类模型最难的形状,开源编码器派在同一题上普遍掉到 0.4 附近,所以这个数字说明 Jev 在高基数上确实有真本事。这一章在决策台上做一件很具体的事:让你把自己的任务参数(标签数、每标签描述长度、state 长度、语言)填进去,对照公开基准的对应点,给出一个「你的任务离哪个基准最近」的判断,并明确标出外推的不确定性。这一章的立场很硬:任何供应商基准都只能用来排序候选模型,不能用来承诺你的准确率;唯一能承诺你的准确率的是你自己那份标注数据,而那正是第六个模块要教的事。",
      en: "Jev's three headline numbers are 70-to-500 ms end to end, 96.6% on the v2 suite, and 0.870 on Banking77. This chapter teaches you to take such numbers apart rather than copy them into your design. The latency range is a sevenfold spread whose width comes from state length, question count and the network, and where you land in it is decided by your usage rather than by the model. The 96.6% is a macro average over a task set the vendor defined; its value is comparing models on the same questions, not predicting yours. The 0.870 is the most informative of the three — high-cardinality intent classification over 77 labels is the hardest shape for this class of model, and the open encoder camp generally falls to around 0.4 on the same task, so that number says Jev really does have something on high cardinality. The bench does something concrete: enter your own task parameters (label count, description length per label, state length, language), see which public benchmark point your task sits nearest, and get an explicit statement of how uncertain that extrapolation is. The chapter's position is firm: a vendor benchmark can rank candidate models and cannot promise your accuracy; the only thing that can promise your accuracy is your own labelled data, which is what module six is about.",
    },
    objectives: [
      { zh: "把一个宣传数字还原成「在什么任务、什么条件下」", en: "Reduce a headline number to the task and conditions behind it" },
      { zh: "用 Banking77 这类高基数任务判断模型的真实上限", en: "Use a high-cardinality task like Banking77 to read a model's real ceiling" },
      { zh: "估计从公开基准外推到自己任务的不确定性", en: "Estimate the uncertainty of extrapolating a public benchmark to your task" },
    ],
    outline: [
      { zh: "延迟区间的宽度来自哪里", en: "Where the width of a latency range comes from" },
      { zh: "宏平均基准能回答和不能回答的问题", en: "What a macro-average benchmark can and cannot answer" },
      { zh: "高基数:这一类模型的压力测试", en: "High cardinality: this category's stress test" },
      { zh: "外推到你的任务", en: "Extrapolating to your task" },
    ],
  },

  /* ============ M3 · CA 概率与校准 ============ */
  {
    id: "t7", code: "CA1", moduleId: "m3", difficulty: 2, hours: 6, prereq: ["t2"], viz: "calibLab",
    props: ["可靠性图", "ECE", "Brier", "准确率 vs 置信度", "过度自信"],
    title: { zh: "置信度不是准确率:可靠性图、ECE 与 Brier", en: "Confidence Is Not Accuracy: Reliability, ECE and Brier" },
    summary: {
      zh: "这一章要把三个经常被混着说的东西彻底分开。准确率是答对的比例,它是一个关于整批数据的数。置信度是模型对单条输入自报的把握,它是一个关于这一条的数。校准是问两者是否一致:在所有自报 0.9 的样本里,是不是真的约九成答对。一个 70% 准确率但完美校准的模型,比一个 85% 准确率但永远报 0.99 的模型有用得多——前者你可以按确定程度分流,后者你只能全信或全不信,而全信一个 85% 的模型意味着每七条里放过一条错的。这一章在决策台上现算三样东西:可靠性图(把样本按置信度分桶,画出每桶的平均置信度对实际准确率,对角线是完美校准)、ECE(各桶偏差的加权平均,一个标量)、Brier 分数(概率预测的均方误差,同时惩罚不准和不校准)。你可以直接拖动一个「过度自信」旋钮,看可靠性曲线怎么从对角线鼓到下方,ECE 怎么跟着涨。这一章还要点破一个实现层面的陷阱,它在本书的实测里真实发生过:有些库里那个叫 confidence 的字段根本不是概率——Laya 的 confidence 是归一化熵 1 - H(p)/log(k),拿它去算 ECE 是在算一个没有意义的量,要算校准必须用 top-1 概率。",
      en: "This chapter separates three things that get spoken of interchangeably. Accuracy is the share of answers that were right, a number about a batch. Confidence is what the model reports about one input, a number about that row. Calibration asks whether the two agree: among everything it called 0.9, were about nine in ten right? A 70%-accurate model with perfect calibration beats an 85%-accurate one that always says 0.99, because the first can be routed by certainty and the second can only be trusted wholesale — and trusting an 85% model wholesale means letting one in seven errors through. The bench computes three things live: the reliability diagram (bucket by confidence, plot mean confidence against actual accuracy, with the diagonal as perfect calibration), ECE (the weighted mean of those gaps, one scalar), and the Brier score (mean squared error of the probability, punishing both wrongness and miscalibration). Drag an overconfidence knob and watch the reliability curve bulge below the diagonal as ECE climbs. It also exposes an implementation trap that really happened in this book's measurements: in some libraries the field called confidence is not a probability at all — Laya's confidence is normalized entropy, 1 - H(p)/log(k), so computing ECE from it computes a meaningless quantity. Calibration must be measured on the top-1 probability.",
    },
    objectives: [
      { zh: "画出可靠性图并读出过度自信的方向", en: "Draw a reliability diagram and read the direction of overconfidence" },
      { zh: "计算 ECE 和 Brier,并说清两者惩罚的东西不同", en: "Compute ECE and Brier and say what each one punishes" },
      { zh: "检查一个库里的 confidence 字段到底是什么量", en: "Check what a library's confidence field actually measures" },
    ],
    outline: [
      { zh: "三个数:准确率、置信度、校准", en: "Three numbers: accuracy, confidence, calibration" },
      { zh: "可靠性图怎么读", en: "How to read a reliability diagram" },
      { zh: "ECE 与 Brier 的分工", en: "The division of labour between ECE and Brier" },
      { zh: "陷阱:名字叫 confidence 的不一定是概率", en: "The trap: a field named confidence need not be a probability" },
    ],
  },
  {
    id: "t8", code: "CA2", moduleId: "m3", difficulty: 3, hours: 5, prereq: ["t7"], viz: "tempLab",
    props: ["温度缩放", "NLL", "留出集", "分桶温度", "TEMP_MIN"],
    title: { zh: "温度缩放:一个标量怎么修好一个分布", en: "Temperature Scaling: One Scalar, One Fixed Distribution" },
    summary: {
      zh: "温度缩放是校准里性价比最高的一招:把 logits 除以一个标量 T,重新 softmax。T 大于 1 让分布变平(治过度自信),小于 1 让分布变尖。它不改变任何预测的排序——argmax 不变,所以准确率一个点都不会动——它只改变那些概率数值。就是这么一个改动,能把 Laya 英文 checkpoint 的平均 ECE 从 0.466 压到 0.081。这一章讲清三件事。第一,怎么拟合:在留出集上最小化负对数似然,可以用网格搜索(区间取 [0.5, 5.0],和 Laya 运行时的 clamp 一致),也可以用 LBFGS;本书给出的实现用的是网格搜索,因为它十行代码、没有优化器状态、而且在这个一维问题上不会不收敛。第二,一个所有教程都会犯的错:在训练集上、或者在你打算用来报告指标的那批数据上拟合温度,等于自己骗自己——必须留出。第三,分桶:同一个模型在 2 选项和 18 选项上的过度自信程度不同,所以实践中是按(问题类型 × 选项数)分桶各拟合一个温度。这一章也讲一个真实的反面教材:Laya 出厂的 choice:11+ 桶温度是 0.1006,它不是在治过度自信而是在制造过度自信——把 0.24 的 top 概率放大成 0.99,库自己加了 TEMP_MIN=0.5 拒绝应用它。决策台上你可以拖 T,同时看可靠性图、ECE 和 NLL 三个东西一起动,并亲眼确认准确率纹丝不动。",
      en: "Temperature scaling is the highest-yield move in calibration: divide the logits by a scalar T and re-softmax. Above 1 flattens the distribution (curing overconfidence), below 1 sharpens it. It changes no prediction's ranking — the argmax is untouched, so accuracy does not move by a point — it only changes the probability values. That one change moves the mean ECE of Laya's English checkpoint from 0.466 to 0.081. Three things get settled. First, how to fit it: minimise negative log-likelihood on held-out data, by grid search (over [0.5, 5.0], matching Laya's runtime clamp) or LBFGS; this book's implementation uses grid search because it is ten lines, carries no optimiser state and cannot fail to converge on a one-dimensional problem. Second, the mistake every tutorial makes: fitting the temperature on the training set, or on the very data you plan to report, is self-deception — hold data out. Third, bucketing: one model is overconfident to different degrees at 2 options and at 18, so in practice a temperature is fitted per (question type × option count) bucket. The chapter also shows a real counter-example: Laya's shipped choice:11+ bucket is 0.1006, which does not cure overconfidence but manufactures it, inflating a 0.24 top probability to 0.99 — the library added TEMP_MIN=0.5 to refuse it. On the bench, drag T and watch the reliability diagram, ECE and NLL move together while accuracy sits perfectly still.",
    },
    objectives: [
      { zh: "在留出集上拟合一个温度,并解释为什么必须留出", en: "Fit a temperature on held-out data and explain why holding out is mandatory" },
      { zh: "说清温度缩放不改变准确率的原因", en: "Explain why temperature scaling cannot change accuracy" },
      { zh: "判断一个出厂温度是不是有害的", en: "Judge whether a shipped temperature is harmful" },
    ],
    outline: [
      { zh: "T 在做什么:平滑与锐化", en: "What T does: flattening and sharpening" },
      { zh: "用 NLL 拟合:网格搜索十行版", en: "Fitting by NLL: the ten-line grid search" },
      { zh: "分桶:按类型和选项数", en: "Bucketing by type and option count" },
      { zh: "反面教材:一个 0.1006 的温度", en: "A counter-example: a temperature of 0.1006" },
    ],
  },
  {
    id: "t9", code: "CA3", moduleId: "m3", difficulty: 3, hours: 6, prereq: ["t8"], viz: "gateLab",
    props: ["门槛", "覆盖率", "精度", "AUROC", "自动化率", "两级架构"],
    title: { zh: "门槛、覆盖率与精度:把校准换算成钱", en: "Threshold, Coverage, Precision: Converting Calibration into Money" },
    summary: {
      zh: "这是全书最实用的一章。业务方不关心 ECE,他们关心的是「这东西能替我处理掉多少活,处理掉的那部分有多可靠」。这两个数就是覆盖率和精度,而把它们连起来的是门槛。做法很简单:把置信度从低到高扫一遍,每个门槛下算两个数——高于门槛的样本占比(覆盖率,也就是自动化率)和这部分样本的准确率(精度)。这条曲线才是你要拿去谈的东西:「0.9 门槛下自动处理 29%,这部分准确率 0.65」远比「模型准确率 50.5%」有信息量。这一章也给出一个判断模型是否可用的冷静判据,它比准确率更根本:如果把门槛从 0.5 拉到 0.95、覆盖率砍掉三分之二而精度只涨六个点(这正是本书实测的数字:56.5%/0.623 → 20.8%/0.689),那么置信度在这份数据上几乎不区分对错,gating 这条产品设计失效,而 gating 恰恰是这类模型全部的价值主张。这一章用 AUROC 把「置信度能不能分开对错」变成一个标量:0.5 是完全不能分,0.77 是 Laya 官方自报的 confidence 在他们数据上的成绩,而 act_probability 只有 0.30——低于 0.5 意味着它反着走。决策台上你可以拖门槛,同时看覆盖率、精度、兜底量和一个简单的成本模型(自动处理省多少钱、放过一个错误赔多少钱)一起动,找到那个净收益最大的点。",
      en: "This is the book's most practical chapter. The business does not care about ECE; it cares how much work this removes and how reliable the removed part is. Those two numbers are coverage and precision, and the threshold connects them. The method is simple: sweep confidence from low to high and at each threshold compute the share of rows above it (coverage, which is your automation rate) and the accuracy of that share (precision). That curve is what you take into the room: 'at 0.9 we automate 29% and that 29% is 65% correct' carries far more information than '50.5% accurate'. The chapter also gives a cold test of usability that runs deeper than accuracy: if moving the threshold from 0.5 to 0.95 cuts coverage by two thirds and buys six points of precision — exactly this book's measurement, 56.5%/0.623 to 20.8%/0.689 — then confidence barely separates right from wrong on this data, the gating design has failed, and gating was the entire value proposition. AUROC turns 'can confidence separate right from wrong' into one scalar: 0.5 is no separation at all, 0.77 is what Laya reports for confidence on its own data, and act_probability manages 0.30 — below 0.5, meaning it runs backwards. On the bench, drag the threshold and watch coverage, precision, fallback volume and a simple cost model (what automation saves, what a missed error costs) move together toward the point of maximum net gain.",
    },
    objectives: [
      { zh: "画出门槛-覆盖率-精度曲线并选出工作点", en: "Plot the threshold-coverage-precision curve and pick an operating point" },
      { zh: "用 AUROC 判断置信度有没有分辨力", en: "Use AUROC to judge whether confidence discriminates at all" },
      { zh: "把一条曲线换算成月度净收益", en: "Convert the curve into monthly net gain" },
    ],
    outline: [
      { zh: "扫门槛:两个数怎么算", en: "Sweeping the threshold: computing the two numbers" },
      { zh: "AUROC:分辨力的标量", en: "AUROC: discrimination as one scalar" },
      { zh: "成本模型与工作点", en: "The cost model and the operating point" },
      { zh: "失效判据:什么时候该放弃 gating", en: "The failure test: when to abandon gating" },
    ],
  },

  /* ============ M4 · LY Laya ============ */
  {
    id: "t10", code: "LY1", moduleId: "m4", difficulty: 2, hours: 5, prereq: ["t4"], viz: "routeLab",
    props: ["ModernBERT", "mmBERT", "三个 checkpoint", "语言路由", "脚本检测"],
    title: { zh: "三个 checkpoint 和一个路由器", en: "Three Checkpoints and a Router" },
    summary: {
      zh: "Laya 不是一个模型而是三个:laya(英文,ModernBERT-large,421M 参数,512 上下文)、laya-multilingual(mmBERT-base,322M,1024 上下文,覆盖 100 多种语言,而且因为更小反而更快)、laya-typed-decisions(在 typed-decisions 基准的训练集上微调过的变体)。它们前面站着一个 Router:先用亚毫秒级的脚本和语言检测判断这段文本属于哪一类,再派给对应的 checkpoint,并把判断理由一起返回。这一章讲清路由的三种情形:非拉丁文字(中文、阿拉伯文、天城文)直接判给多语言支,理由明确;拉丁文字但语言不像英文(德语、葡萄牙语)也判给多语言支;而很短的拉丁文本往往不携带任何语言信息,会落到 default,这个 default 默认是英文——如果你的流量大部分不是英文,必须显式改成 multilingual,否则短文本会被静默送错分支。这一章也把一条硬约束钉死:英文 checkpoint 在非拉丁文字上不是「差一点」而是崩溃,高棉语准确率 0.000 而自报置信度 95.2%,这是全书最干净的「高置信度 + 全错」的例子,也是第三个模块讲的那件事的现实版本。决策台上你可以输入任意文本,看脚本检测、语言判断和路由理由怎么产生,并手动覆盖路由看结果怎么变。",
      en: "Laya is not one model but three: laya (English, ModernBERT-large, 421M parameters, 512 context), laya-multilingual (mmBERT-base, 322M, 1024 context, 100-plus languages, and faster precisely because it is smaller), and laya-typed-decisions (a variant fine-tuned on the training split of the typed-decisions benchmark). A Router stands in front: sub-millisecond script and language detection decides which class the text belongs to, dispatches to the matching checkpoint, and returns its reasoning alongside the answer. Three routing cases get covered: non-Latin scripts (Chinese, Arabic, Devanagari) go to the multilingual branch for an obvious reason; Latin script that does not look like English (German, Portuguese) also goes multilingual; and very short Latin text often carries no language signal at all and falls to default, which is English unless you change it — so if most of your traffic is not English you must set default to multilingual, or short inputs get silently sent to the wrong branch. One hard constraint is nailed down: on non-Latin scripts the English checkpoint does not degrade, it collapses — 0.000 accuracy on Khmer at a self-reported 95.2% confidence, the cleanest example in this book of high confidence with total failure, and the real-world version of what module three teaches. On the bench, type any text and watch script detection, language judgement and the routing reason appear, then override the route by hand and watch the result change.",
    },
    objectives: [
      { zh: "按语言和脚本选对 checkpoint", en: "Pick the right checkpoint by language and script" },
      { zh: "知道 default 什么时候会坑你", en: "Know when the default will betray you" },
      { zh: "用高棉语那个例子解释「高置信度 ≠ 对」", en: "Use the Khmer example to explain that high confidence is not correctness" },
    ],
    outline: [
      { zh: "三个 checkpoint 的分工", en: "What each of the three checkpoints is for" },
      { zh: "路由怎么判,理由长什么样", en: "How routing decides and what its reasoning looks like" },
      { zh: "短文本与 default 陷阱", en: "Short text and the default trap" },
      { zh: "英文 checkpoint 在非拉丁文字上的崩溃", en: "The English checkpoint's collapse on non-Latin scripts" },
    ],
  },
  {
    id: "t11", code: "LY2", moduleId: "m4", difficulty: 3, hours: 6, prereq: ["t10"], viz: "budgetLab",
    props: ["head_max_len", "max_len", "选项预算", "标签截断", "predict_shortlist"],
    title: { zh: "选项要和正文抢 token:head_max_len 的账", en: "Options Compete with the Document: the head_max_len Budget" },
    summary: {
      zh: "这一章解释这类编码器模型最反直觉的一个机制,也是高基数任务上性能崩塌的根因。选项不是分类头上的神经元——模型并不知道你有哪些类别——它们是被拼接进输入序列的一段提示文本。于是序列预算被切成两半:head_max_len 给选项,max_len 减去它给正文。英文 checkpoint 默认 512/192,多语言默认 1024/256。算一下就知道问题在哪:18 个标签时每个标签分到 (256-16)//18 ≈ 13 个 token;Banking77 的 77 个标签时只剩 3 到 4 个 token,标签之间根本无法区分,于是准确率掉到 0.425,而 Jev 在同一题上是 0.870。README 给了三条补救:调大 head_max_len 和 max_len、用 predict_shortlist 先用嵌入召回 top-k 再跑一次前向、或者自己把标签集拆成粗分类加细分类两问。这一章在决策台上把三方拉扯算出来:标签数、描述长度、预算,看每个标签实际能保留多少字,以及被截断的部分是什么。这一章也诚实报告本书的实测结果,它和直觉相反:在 216 条中文需求、18 个标签的任务上,把 head_max_len 从 256 提到 1024(每标签约 56 token),准确率一点没动,仍是 0.505,而 P95 延迟从 447 毫秒涨到 2290 毫秒。结论是:token 预算是高基数崩塌的必要条件,但不是充分条件——当标签本身语义重叠时,给它更多字也救不回来。",
      en: "This chapter explains the least intuitive mechanism in these encoder models, and the root cause of collapse on high-cardinality tasks. Options are not neurons on a classification head — the model has no idea which categories you have — they are text spliced into the input sequence. So the sequence budget splits in two: head_max_len for the options, max_len minus that for the document. The English checkpoint defaults to 512/192, the multilingual to 1024/256. The arithmetic shows the problem: at 18 labels each gets (256-16)//18 ≈ 13 tokens; at Banking77's 77 labels only three or four remain, the labels become indistinguishable, and accuracy falls to 0.425 where Jev scores 0.870. The README offers three remedies: raise head_max_len and max_len, use predict_shortlist to retrieve a top-k with embeddings before one forward pass, or split the label set yourself into a coarse question and a fine one. The bench computes the three-way tension between label count, description length and budget, showing how much of each label survives and what got cut. The chapter then honestly reports this book's measurement, which contradicts intuition: on 216 Chinese requirement rows across 18 labels, raising head_max_len from 256 to 1024 (about 56 tokens per label) moved accuracy not at all — still 0.505 — while P95 latency went from 447 ms to 2290 ms. The conclusion: token budget is a necessary condition for high-cardinality collapse and not a sufficient one — when the labels themselves overlap semantically, more room for their text cannot save them.",
    },
    objectives: [
      { zh: "算出你的标签数下每个标签能保留多少 token", en: "Compute how many tokens each label keeps at your label count" },
      { zh: "在调预算、shortlist 和拆问题三条路里选一条", en: "Choose among raising the budget, shortlisting, and splitting the question" },
      { zh: "识别「加预算也救不回来」的情形", en: "Recognise the case that more budget cannot rescue" },
    ],
    outline: [
      { zh: "选项是文本,不是神经元", en: "Options are text, not neurons" },
      { zh: "预算怎么切,每标签剩多少", en: "How the budget splits and what each label keeps" },
      { zh: "Banking77 的 0.425 是怎么来的", en: "Where Banking77's 0.425 comes from" },
      { zh: "本书实测:加预算无效的那次", en: "Measured here: the time more budget did nothing" },
    ],
  },
  {
    id: "t12", code: "LY3", moduleId: "m4", difficulty: 3, hours: 6, prereq: ["t11"], viz: "honestLab",
    props: ["noul 标签偏置", "score 位置偏置", "act_probability", "归一化熵", "源码阅读"],
    title: { zh: "Laya 的诚实清单:四个只有读源码才知道的坑", en: "Laya's Honest List: Four Traps Only the Source Reveals" },
    summary: {
      zh: "这一章把 Laya 的 README、issue 和源码注释里那些负面信息集中起来讲,因为它们比任何宣传数字都更能决定你的上线结果。第一个坑:noul 在英文 checkpoint 上会跟着选项标签走(#156)。noul 内部把两个选项渲染成 false: 和 true: 两段文本,而这对标签本身可能压过正文,导致对明显该答「是」的输入自信地答「否」。补救是把同一个问题改写成二选一的 choice,键用中性的 A/B,把是非写进描述里。第二个坑:多语言 checkpoint 在 score 上有位置偏置(#131),它几乎不选第一个等级,任何语言都一样——英文 score 问题应当显式路由到英文 checkpoint。第三个坑:返回体里的 action.act_probability 目前没有可用信号(#185),它对几乎所有输入都读 1.0,而且原始 logits 与正确性反着走,AUROC 0.30;该 gate 的是 confidence,同一批数据上 AUROC 0.77。第四个坑最隐蔽,而且不在 README 里,只在 common.py 的注释里:出厂的 choice:11+ 温度桶是 0.1006,这不是校准而是反校准,会把 0.24 的 top 概率发布成 0.99,库为此加了 TEMP_MIN=0.5 直接拒绝应用。顺带还有一条本书发现的实现细节:那个叫 confidence 的字段是归一化熵 1 - H(p)/log(k),不是概率,拿它算 ECE 是算了个没意义的量。决策台上把前两个坑做成了可复现实验。",
      en: "This chapter gathers the negative information scattered across Laya's README, issues and source comments, because it decides your production outcome more than any headline number. Trap one: noul follows its option labels on the English checkpoint (#156). Internally noul renders its two options as the strings false: and true:, and that label pair can dominate the document, returning a confident no for input that clearly warrants yes. The remedy is to rewrite the question as a two-option choice with neutral keys A and B and the yes/no wording moved into the descriptions. Trap two: the multilingual checkpoint has a position bias on score (#131) and almost never picks the first level, in any language — English score questions should be routed explicitly to the English checkpoint. Trap three: action.act_probability carries no usable signal today (#185); it reads 1.0 for nearly every input and its raw logits run against correctness at AUROC 0.30, so gate on confidence instead, which reaches 0.77 on the same items. Trap four is the best hidden and appears only in a comment in common.py: the shipped choice:11+ temperature bucket is 0.1006, which is anti-calibration rather than calibration, publishing a 0.24 top probability as 0.99 — the library added TEMP_MIN=0.5 to refuse it outright. Alongside these sits an implementation detail this book found: the field named confidence is normalized entropy, 1 - H(p)/log(k), not a probability, so computing ECE from it computes nothing meaningful. The first two traps are reproducible experiments on the bench.",
    },
    objectives: [
      { zh: "用二选一 choice 交叉验证每一个 noul 问题", en: "Cross-check every noul question with a two-option choice" },
      { zh: "知道哪些字段可以 gate、哪些不能", en: "Know which fields may be gated on and which may not" },
      { zh: "养成读 issue 和源码注释再上线的习惯", en: "Build the habit of reading issues and source comments before shipping" },
    ],
    outline: [
      { zh: "#156:noul 跟着标签走", en: "#156: noul follows its labels" },
      { zh: "#131:score 的位置偏置", en: "#131: position bias on score" },
      { zh: "#185:act_probability 反着走", en: "#185: act_probability runs backwards" },
      { zh: "0.1006:一个被库自己拒绝的出厂温度", en: "0.1006: a shipped temperature the library refuses" },
    ],
  },

  /* ============ M5 · OS 开源生态 ============ */
  {
    id: "t13", code: "OS1", moduleId: "m5", difficulty: 2, hours: 5, prereq: ["t10"], viz: "encoderLab",
    props: ["Von", "Verdict", "jeff", "OpenDecision", "ModernBERT 家族", "WebGPU"],
    title: { zh: "编码器派:Von、Verdict 和另外两个", en: "The Encoder Camp: Von, Verdict and Two More" },
    summary: {
      zh: "编码器派的共同选择是:拿一个 BERT 系双向编码器,在决策任务上微调,参数量压在 150M 到 420M,换来十几到几百毫秒的延迟和 CPU 可跑。Von 是这一派里跑得最前的:ModernBERT-Large 395M,Apache-2.0,自报约 18 毫秒,v2 基准 72.0%(对 Jev 的 96.6%),但它在 ViZDoom 实时对战里反超 Jev——9.00 击杀对 5.62,这个反差很说明问题:当决策频率高到延迟本身成为胜负手时,72 分的快模型打得过 96 分的慢模型。它还自带 /v1/systemone 兼容服务,pip install von-sdk 之后 von serve 就能顶替 Jev。Verdict(也叫 NanoJev-151M)走的是另一个方向:151M 参数,自报 77.10% 准确率、Brier 0.0636、ECE 0.0144,支持「弃权」这一档,而且能在浏览器里用 WebGPU 跑——端侧和隐私敏感场景的唯一现实选项。jeff 用 GLiFormer,400M,只做分类,不覆盖 score 和 noul。OpenDecision 不需要 GPU,而且 README 自己声明它的 confidence 衡量的是分布集中度而不是校准概率——这份诚实在这个赛道里值得记一笔。这一章在决策台上把四个项目按延迟、参数量、校准声明和覆盖的原语摆在一起,并标出每一条声明是谁说的。",
      en: "The encoder camp makes one choice in common: take a BERT-family bidirectional encoder, fine-tune it on decision tasks, keep the parameter count between 150M and 420M, and buy latency in the tens to hundreds of milliseconds with CPU deployment. Von runs at the front: ModernBERT-Large 395M, Apache-2.0, a self-reported 18 ms, 72.0% on the v2 suite against Jev's 96.6% — and yet ahead of Jev in real-time ViZDoom combat, 9.00 kills to 5.62. That contrast is instructive: when decisions come fast enough that latency itself decides the outcome, a 72-point fast model beats a 96-point slow one. It also ships a /v1/systemone-compatible server, so pip install von-sdk followed by von serve stands in for Jev. Verdict (also called NanoJev-151M) goes the other way: 151M parameters, a self-reported 77.10% accuracy with Brier 0.0636 and ECE 0.0144, support for abstention as a distinct outcome, and in-browser execution on WebGPU — the only realistic option for edge and privacy-sensitive settings. jeff uses GLiFormer at 400M and does classification only, covering neither score nor noul. OpenDecision needs no GPU and states in its own README that its confidence measures distribution concentration rather than calibrated probability, a piece of honesty worth recording in this field. The bench lines all four up on latency, parameters, calibration claims and primitive coverage, marking who made each claim.",
    },
    objectives: [
      { zh: "说清「快而不准」为什么能在高频决策里赢", en: "Explain why fast-and-less-accurate wins on high-frequency decisions" },
      { zh: "按端侧、协议兼容、原语覆盖三条线筛项目", en: "Filter projects by edge support, protocol compatibility and primitive coverage" },
      { zh: "分辨「声明了校准」和「测了校准」", en: "Separate claiming calibration from measuring it" },
    ],
    outline: [
      { zh: "Von:协议兼容的那一个", en: "Von: the protocol-compatible one" },
      { zh: "Verdict:151M 和浏览器", en: "Verdict: 151M and the browser" },
      { zh: "jeff 与 OpenDecision", en: "jeff and OpenDecision" },
      { zh: "ViZDoom 的启示:延迟也是准确率", en: "What ViZDoom shows: latency is accuracy too" },
    ],
  },
  {
    id: "t14", code: "OS2", moduleId: "m5", difficulty: 2, hours: 5, prereq: ["t13"], viz: "llmLab",
    props: ["Kev", "SemIf", "NanoJev", "OpenJev", "LoRA", "logits 打分"],
    title: { zh: "LLM 派:在生成模型上拿类型化决策", en: "The LLM Camp: Typed Decisions on Generative Models" },
    summary: {
      zh: "LLM 派的思路是:不重新训一个编码器,而是在现成的生成模型上把决策挤出来。Kev 走微调路线:Qwen3.5 加 LoRA 适配器,0.8B 到 9B 一个家族,Apache-2.0,自报 Kev-4B 0.837、Kev-9B 0.852,并且对齐了 TypeSafe 的 System One API,所以它是「想要 Jev 的准确率但要自托管」时最直接的候选。SemIf 走的是最省的一条路:根本不训练,直接读现有模型上选项 token 的 logits,在对齐子集上 0.845 一致率,支持 MLX 和浏览器 WebGPU。这条路的战略价值在于零新增组件——你已经在跑的那个模型就是你的决策引擎,不需要多一个服务、多一份权重、多一条监控。NanoJev 用 Qwen3 0.6B,面向游戏和控制回路,给的是帧级延迟数据。OpenJev 规模最大:DiffusionGemma 26B-A4B,走扩散式并行解码,要 vLLM 加大显存或者 Apple Silicon 上的 MLX。Decider 用 Qwen3.5 2B,声称做了校准但没公布任何测量——这一章把它作为「怎么读一个声明」的练习。这一章的落点是一条选型规则:标签数超过 20、或者标签之间语义细分,编码器派就该让位给 LLM 派;而如果你已经在跑 LLM,先试 SemIf 的做法,因为它的边际成本接近于零。",
      en: "The LLM camp's idea is to squeeze decisions out of a generative model you already have instead of training a new encoder. Kev takes the fine-tuning route: Qwen3.5 with LoRA adapters across a 0.8B-to-9B family, Apache-2.0, self-reporting 0.837 for Kev-4B and 0.852 for Kev-9B, and aligned to TypeSafe's System One API — which makes it the most direct candidate when you want Jev's accuracy but must self-host. SemIf takes the cheapest route of all: it trains nothing and reads the logits of option tokens on a model you already run, reporting 0.845 agreement on its aligned subset, with MLX and in-browser WebGPU support. Its strategic value is that it adds no component — the model you are already running is your decision engine, with no extra service, no extra weights, no extra monitoring. NanoJev uses Qwen3 0.6B for games and control loops and publishes frame-level latency. OpenJev is the largest: DiffusionGemma 26B-A4B with diffusion-style parallel decoding, needing vLLM and real VRAM, or MLX on Apple Silicon. Decider uses Qwen3.5 2B and claims calibration without publishing a measurement — this chapter uses it as an exercise in reading a claim. The chapter lands on a selection rule: past twenty labels, or wherever labels split finely by meaning, the encoder camp should yield to the LLM camp; and if you already run an LLM, try SemIf's approach first, because its marginal cost is close to zero.",
    },
    objectives: [
      { zh: "在微调、logits 打分和大模型三条路里定位自己的场景", en: "Place your setting among fine-tuning, logit scoring and a large model" },
      { zh: "估算「零新增组件」这个性质值多少运维成本", en: "Price what 'adds no component' is worth in operational cost" },
      { zh: "读懂一个没有测量支撑的校准声明", en: "Read a calibration claim with no measurement behind it" },
    ],
    outline: [
      { zh: "Kev:LoRA 与 API 对齐", en: "Kev: LoRA and API alignment" },
      { zh: "SemIf:不训练,读 logits", en: "SemIf: train nothing, read the logits" },
      { zh: "NanoJev 与 OpenJev 的两个极端", en: "NanoJev and OpenJev: the two extremes" },
      { zh: "什么时候编码器该让位", en: "When the encoder should step aside" },
    ],
  },
  {
    id: "t15", code: "OS3", moduleId: "m5", difficulty: 2, hours: 6, prereq: ["t14"], viz: "routesLab",
    props: ["约束解码", "Outlines", "XGrammar", "SetFit", "GLiNER", "微调分类器"],
    title: { zh: "你可能根本不需要 System One 模型", en: "You May Not Need a System One Model at All" },
    summary: {
      zh: "这一章是整个模块的落点,也是全书最省钱的一章。拿到类型化决策一共有四条路,System One 模型只是其中一条。第一条:微调一个分类器。标签固定、有几百条标注,ModernBERT 微调或者 SetFit 给你同样量级的延迟,而且校准是你自己在自己的数据上测出来的,不需要相信任何人的 README——代价是你要维护一条训练流水线和一份标注数据。第二条:约束解码。Outlines、XGrammar 把解码限制在一个语法或 schema 上,保证输出结构合法。但必须分清:它们解决的是格式,不是概率——你拿到的仍然是一个没有校准概率的字符串,这是和 System One 模型的根本分界,也是很多技术选型讨论里被混为一谈的地方。第三条:读 logits。已经在跑 LLM 的话,直接读选项 token 的对数概率,零新增组件,这正是 SemIf 的做法。第四条才是 System One 模型本身,它的独特价值只有一个——开箱即用的、跨任务的、带校准概率的决策接口。这一章在决策台上把四条路按六个维度并排:延迟、是否有校准概率、是否需要标注数据、上线要新增几个组件、跨任务复用性、以及维护面。这一章的结论很直白:如果你只有一个任务而且有标注数据,第一条路几乎总是赢;System One 模型赢在「很多个任务共用一个接口」,而不是赢在单个任务的指标上。",
      en: "This chapter is where the module lands and is the book's cheapest lesson. There are four routes to a typed decision, and a System One model is only one of them. First: fine-tune a classifier. With fixed labels and a few hundred annotations, a fine-tuned ModernBERT or SetFit gives latency in the same class, and calibration you measured yourself on your own data without trusting anyone's README — the price is maintaining a training pipeline and a labelled set. Second: constrained decoding. Outlines and XGrammar restrict decoding to a grammar or schema and guarantee structurally valid output. But be clear that they solve format, not probability — what you get back is still a string with no calibrated probability, which is the dividing line from System One models and the exact place technology discussions conflate the two. Third: read the logits. If you already run an LLM, read the log-probabilities of the option tokens, adding no component, which is precisely SemIf's approach. Fourth is a System One model itself, whose unique value is one thing only: an out-of-the-box, cross-task decision interface that carries calibrated probabilities. The bench lays the four routes across six dimensions: latency, whether a calibrated probability comes with it, whether labelled data is required, how many components ship, reuse across tasks, and surface to maintain. The conclusion is blunt: with one task and labelled data in hand, the first route almost always wins; System One models win on many tasks sharing one interface, not on any single task's metrics.",
    },
    objectives: [
      { zh: "分清「schema 合法」和「带校准概率」两类保证", en: "Separate the guarantee of a valid schema from that of a calibrated probability" },
      { zh: "按任务数量而不是单任务指标来做这个选型", en: "Make this choice by task count rather than single-task metrics" },
      { zh: "估算每条路要新增的组件和维护面", en: "Count the components and maintenance surface each route adds" },
    ],
    outline: [
      { zh: "路线一:微调分类器", en: "Route one: fine-tune a classifier" },
      { zh: "路线二:约束解码(以及它不解决什么)", en: "Route two: constrained decoding, and what it does not solve" },
      { zh: "路线三:读 logits", en: "Route three: read the logits" },
      { zh: "路线四:System One 模型的唯一优势", en: "Route four: the one advantage of a System One model" },
    ],
  },

  /* ============ M6 · EV 自己评测 ============ */
  {
    id: "t16", code: "EV1", moduleId: "m6", difficulty: 1, hours: 4, prereq: ["t9"], viz: "baseLab",
    props: ["随机基线", "多数类基线", "关键词基线", "类别不平衡", "无单位的数"],
    title: { zh: "先定基线:没有基线的准确率是个没单位的数", en: "Baselines First: Accuracy Without One Has No Units" },
    summary: {
      zh: "有人告诉你模型准确率 0.65,这句话本身不包含任何信息。如果这是个二分类而且类别均衡,0.65 只比抛硬币好一点;如果这是个 18 类任务,0.65 是个很强的结果;如果你的多数类本来就占 62%,那 0.65 等于什么都没做。这一章要求你在跑任何模型之前先算三条基线。随机基线是 1/k,它告诉你下限在哪。多数类基线是最大类的占比,它是最容易被忽略、也最容易羞辱一个模型的那条线——类别越不平衡,它越高。关键词规则基线是第三条,也是最有价值的一条:花二十分钟写几条 if 正则,很多真实任务上它能到 0.5 以上,而它零延迟、零成本、完全可解释;一个模型如果打不过它,这个项目就不该继续。这一章在决策台上让你调类别数和不平衡程度,看三条基线怎么随之移动,并让你亲眼看到一个在均衡数据上很体面的准确率,换到长尾分布上会变得多么难看。这一章也讲清一个评测报告的最小格式:任何准确率都必须和这三条基线一起出现,单独出现的准确率应当被退回。",
      en: "Someone tells you the model is 65% accurate. That sentence carries no information. If it is a balanced binary task, 0.65 is barely better than a coin; if it is an 18-class task, 0.65 is strong; and if your majority class already holds 62%, then 0.65 has done nothing. This chapter requires three baselines before any model runs. The random baseline is 1/k and tells you where the floor is. The majority-class baseline is the largest class's share — the line most often forgotten and the one most likely to humiliate a model, rising as imbalance grows. The keyword-rule baseline is the third and most valuable: twenty minutes of if-statements and regexes clears 0.5 on many real tasks, at zero latency, zero cost and total interpretability, and a model that cannot beat it should end the project. On the bench, adjust class count and imbalance and watch all three baselines move, then watch a respectable accuracy on balanced data turn ugly under a long tail. The chapter also fixes the minimum format of an evaluation report: an accuracy must always appear beside all three baselines, and one that appears alone should be sent back.",
    },
    objectives: [
      { zh: "算出随机、多数类、关键词三条基线", en: "Compute the random, majority and keyword baselines" },
      { zh: "判断一个准确率在你的类别分布下是强是弱", en: "Judge an accuracy as strong or weak under your class distribution" },
      { zh: "用关键词基线做项目的第一道闸门", en: "Use the keyword baseline as the project's first gate" },
    ],
    outline: [
      { zh: "三条基线各自回答什么问题", en: "What question each baseline answers" },
      { zh: "不平衡怎么抬高多数类基线", en: "How imbalance lifts the majority baseline" },
      { zh: "二十分钟的正则能走多远", en: "How far twenty minutes of regex gets you" },
      { zh: "评测报告的最小格式", en: "The minimum format of an evaluation report" },
    ],
  },
  {
    id: "t17", code: "EV2", moduleId: "m6", difficulty: 2, hours: 6, prereq: ["t16"], viz: "datasetLab",
    props: ["分层抽样", "每类样本量", "标签描述", "留出拆分", "标签体系重叠"],
    title: { zh: "评测集怎么建:216 条真实数据的教训", en: "Building the Evaluation Set: Lessons from 216 Real Rows" },
    summary: {
      zh: "这一章用本书真实用过的那份数据讲怎么建评测集:216 条中文需求条目,要分进 18 个业务模块,标签描述取自同一张表里每个模块自己的子模块名——不是编的。第一件事是样本量:216 条除以 18 类,平均每类 12 条,这已经低于「每类至少 20 条才谈得上分类级指标」的经验线,所以这份评测能给出可信的总体准确率,但给不出可信的每类准确率,报告时必须说明这一点。第二件事是标签描述:模型读的是描述不是键,所以拿标签名当描述跑出来的数字是下限而不是上限;这一章给出一个具体做法——从已有的层级结构(子模块、同义词、历史工单里的高频词)里提取描述,比人工现编更准也更快。第三件事是拆分纪律:拟合温度的那一半和报告指标的那一半必须不重叠,本书的实现是前一半拟合、后一半报告。第四件事最重要,也是这份数据最后失败的真正原因:标签体系本身。「仓库管理」和「客户计划变更下的原料保障与库存控制」在业务上就不是互斥的,一条讲成品库存优先覆盖的需求两边都说得通——这种重叠不是模型的问题,任何模型在这个标签体系下都会撞墙。这一章教你在跑模型之前就把这类重叠找出来:人工对同一批数据标两遍,算一致率,一致率低于 0.8 的标签体系不值得拿去测模型。",
      en: "This chapter builds an evaluation set from the data this book actually used: 216 Chinese requirement rows to be sorted into 18 business modules, with label descriptions taken from each module's own sub-module names in the same sheet rather than invented. First, sample size: 216 rows over 18 classes averages twelve per class, already below the rule of thumb that per-class metrics need at least twenty, so this set supports a credible overall accuracy but not credible per-class numbers, and the report must say so. Second, label descriptions: the model reads descriptions rather than keys, so numbers produced with label names as descriptions are a floor and not a ceiling. A concrete method follows — mine descriptions from structure you already have (sub-modules, synonyms, frequent terms in historical tickets), which is both more accurate and faster than writing them fresh. Third, split discipline: the half used to fit the temperature must not overlap the half used to report, and this book fits on the first half and reports on the second. Fourth and most important, the real reason this dataset ultimately failed: the label taxonomy itself. Warehouse management and material assurance under customer plan changes were never mutually exclusive in the business, and a row about finished-goods stock covering demand belongs plausibly to both. That overlap is not the model's problem — every model hits the same wall under this taxonomy. The chapter teaches you to find such overlap before running any model: have people label the same batch twice, compute agreement, and treat any taxonomy below 0.8 agreement as not worth testing a model on.",
    },
    objectives: [
      { zh: "按每类样本量决定能报告哪一级指标", en: "Decide which level of metric your per-class sample size supports" },
      { zh: "从已有层级结构里提取标签描述", en: "Mine label descriptions from structure you already have" },
      { zh: "用人工一致率先给标签体系体检", en: "Health-check the taxonomy with human agreement before modelling" },
    ],
    outline: [
      { zh: "多少条够用:总体指标与每类指标", en: "How many rows: overall metrics versus per-class" },
      { zh: "描述比键重要得多", en: "Descriptions matter far more than keys" },
      { zh: "拆分纪律:拟合与报告分开", en: "Split discipline: fit and report on different halves" },
      { zh: "标签重叠:模型救不了的那类失败", en: "Label overlap: the failure no model can fix" },
    ],
  },
  {
    id: "t18", code: "EV3", moduleId: "m6", difficulty: 2, hours: 5, prereq: ["t17"], viz: "reportLab",
    props: ["四张表", "P95 延迟", "冷启动", "判决模板", "指标的先后顺序"],
    title: { zh: "读一次评测:四张表和一个判决模板", en: "Reading an Evaluation: Four Tables and a Verdict Template" },
    summary: {
      zh: "跑完一次评测你会拿到一堆数,这一章教你按什么顺序读、以及读到什么就该停。第一张表是准确率对三条基线,它回答「模型有没有学到东西」——本书实测 0.505 对随机 0.056、多数类 0.120,答案是学到了。第二张表是延迟的中位和 P95,绝对不要报平均:冷启动那几次会把平均值拉到毫无意义,本书第一次测出的 4467 毫秒就是被并发下载污染的,干净复测是 401 / 447 毫秒。第三张表是校准:原样 ECE 和在留出集上拟合温度后的 ECE,本书实测 0.215 → 0.141(T=1.65),仍然大于 0.1,意味着这个概率不能当概率用。第四张表是门槛-覆盖率-精度,它回答最后一个问题:这东西能替我干多少活。读的顺序很重要——如果第一张表就没过基线,后面三张不用看;如果第四张表显示门槛拉不开精度,前面三张再好看也不能上线。这一章给出一个判决模板,把四张表的组合映射到三个结论:可以上线(带门槛和兜底方案)、换条路(微调或 LLM)、以及数据或标签体系本身有问题(回去做第十七章的一致率体检)。决策台上你可以把自己的四组数字填进去,直接得到判决和理由。",
      en: "An evaluation hands you a pile of numbers; this chapter fixes the order to read them in and when to stop. Table one is accuracy against all three baselines and answers whether the model learned anything — this book measured 0.505 against a random 0.056 and a majority 0.120, so yes. Table two is median and P95 latency, never the mean: a few cold starts drag a mean into meaninglessness, and this book's first reading of 4467 ms was polluted by a concurrent download, while the clean re-run gave 401 and 447 ms. Table three is calibration, as-shipped ECE beside ECE after fitting a temperature on held-out data — measured here as 0.215 falling to 0.141 at T=1.65, still above 0.1, which means the probability cannot be used as a probability. Table four is threshold-coverage-precision and answers the last question: how much work does this remove? The order matters — if table one fails the baselines, the other three are irrelevant; and if table four shows the threshold cannot buy precision, the first three cannot justify shipping. A verdict template maps combinations of the four tables onto three conclusions: ship it (with a threshold and a fallback), take another route (fine-tune or an LLM), or the data and taxonomy are themselves the problem (go back to chapter seventeen's agreement check). Enter your own four sets of numbers on the bench and get the verdict with its reasoning.",
    },
    objectives: [
      { zh: "按正确顺序读四张表,并知道什么时候可以停", en: "Read the four tables in order and know when to stop" },
      { zh: "永远报中位和 P95,不报平均", en: "Always report median and P95, never the mean" },
      { zh: "把四组数字映射到一个明确判决", en: "Map four sets of numbers onto one explicit verdict" },
    ],
    outline: [
      { zh: "表一:准确率对三条基线", en: "Table one: accuracy against three baselines" },
      { zh: "表二:延迟分布与冷启动污染", en: "Table two: latency distribution and cold-start pollution" },
      { zh: "表三:校准前后", en: "Table three: calibration before and after" },
      { zh: "表四:门槛能买到多少精度", en: "Table four: how much precision the threshold buys" },
    ],
  },

  /* ============ M7 · OP 上线工程 ============ */
  {
    id: "t19", code: "OP1", moduleId: "m7", difficulty: 2, hours: 5, prereq: ["t4"], viz: "serveLab",
    props: ["laya-serve", "协议兼容", "环境变量", "预加载", "鉴权"],
    title: { zh: "自托管:把 baseUrl 指过来就完事", en: "Self-Hosting: Repoint the baseUrl and You Are Done" },
    summary: {
      zh: "这一章讲怎么把开源实现变成一个你自己的服务。pip install \"laya[serve]\" 之后,laya-serve 起的就是 Jev 同协议的 POST /v1/systemone,返回体的 schema 也对齐,所以一个已有的 Jev 客户端只要改 baseUrl 就能指过来,别的一行不用动——这是开源平替最实际的价值,比任何基准分数都直接。这一章把配置逐项讲清:LAYA_HOST 和 LAYA_PORT 是网络面;LAYA_DEVICE 选 cuda 还是 cpu;LAYA_PRELOAD 决定进程启动时就把 checkpoint 载进内存还是等第一个请求(后者意味着第一个用户吃掉十几秒的加载时间,本书实测英文 checkpoint 冷加载 18.5 秒);LAYA_MODELS 是逗号分隔的预加载清单;LAYA_THREADS 在 CPU 推理时上限应当等于物理核数,超了反而更慢;LAYA_API_KEY 一旦设置,客户端必须带 Authorization: Bearer。这一章特别强调一件事:默认没有鉴权,而这个服务接受任意文本并返回判断——它不该直接暴露在公网上。这一章也给出内存常驻策略:默认保持 english 和 multilingual 两个 checkpoint 热在内存里,按 LRU 淘汰,如果你只服务一种语言,显式只预加载那一个能省下几百兆。",
      en: "This chapter turns an open implementation into a service of your own. After pip install \"laya[serve]\", laya-serve exposes exactly Jev's POST /v1/systemone with an aligned response schema, so an existing Jev client needs its baseUrl repointed and nothing else — the most practical value an open alternative offers, more direct than any benchmark score. Configuration is covered item by item: LAYA_HOST and LAYA_PORT are the network surface; LAYA_DEVICE selects cuda or cpu; LAYA_PRELOAD decides whether checkpoints load at process start or on the first request, the latter meaning your first user pays the load time (measured here at 18.5 seconds cold for the English checkpoint); LAYA_MODELS is the comma-separated preload list; LAYA_THREADS should cap at the physical core count for CPU inference, because more is slower; and LAYA_API_KEY, once set, requires clients to send Authorization: Bearer. One point gets emphasised: there is no authentication by default, and this service accepts arbitrary text and returns judgements — it does not belong directly on the public internet. Residency strategy is covered too: two checkpoints, english and multilingual, are kept hot by default under LRU eviction, and preloading only the one you serve saves a few hundred megabytes if you serve a single language.",
    },
    objectives: [
      { zh: "起一个协议兼容的本地服务并把客户端指过去", en: "Start a protocol-compatible local service and repoint a client at it" },
      { zh: "按语言和硬件设定预加载与线程数", en: "Set preload and thread count by language and hardware" },
      { zh: "把鉴权和网络暴露面当成必须自己补的一层", en: "Treat authentication and exposure as a layer you must add" },
    ],
    outline: [
      { zh: "一条 pip 和一条命令", en: "One pip line and one command" },
      { zh: "环境变量逐项", en: "The environment variables, one by one" },
      { zh: "预加载、常驻与 LRU", en: "Preload, residency and LRU" },
      { zh: "默认没有鉴权这件事", en: "The fact that there is no authentication by default" },
    ],
  },
  {
    id: "t20", code: "OP2", moduleId: "m7", difficulty: 3, hours: 6, prereq: ["t19"], viz: "capacityLab",
    props: ["批处理", "线程数", "排队模型", "QPS", "worker 数量", "P95 预算"],
    title: { zh: "容量:批处理、线程数和一个排队模型", en: "Capacity: Batching, Threads and a Queueing Model" },
    summary: {
      zh: "这类模型的容量规划比 LLM 简单得多,因为它没有 KV cache、显存占用是常数、延迟只取决于输入长度和 batch。这一章把容量算成一道题。第一步是单请求延迟:本书实测 CPU 上多语言 checkpoint 单问 18 选项中位 401 毫秒,而 GPU 上官方数字是单问 32.8 到 39.5 毫秒。第二步是批处理收益:把 10 个问题放进一次前向,官方数字从 32.8 毫秒降到每问 7.2 毫秒——注意这里的「批」指的是同一个 state 上的多个问题,和跨请求的动态批处理是两件事,后者需要你自己在服务层攒批。第三步是线程:CPU 推理时 LAYA_THREADS 超过物理核数会因为争抢变慢,这是个容易被「多多益善」直觉坑到的参数。第四步是排队:给定到达率、服务时间和并发数,用 M/M/c 算出排队延迟,再加上服务延迟得到端到端 P95,反推需要几个 worker。决策台上就是这个排队模型:拖 QPS、单请求延迟、worker 数和批大小,看 P95 怎么在某个负载点突然起飞——那个点就是你的容量墙,它总是比人们凭直觉估计的位置更早。这一章也给出一条实践规则:按 P95 而不是按平均来定容量,因为决策服务通常挂在一个同步调用链上,平均延迟好看而 P95 超标意味着每二十个用户里有一个在等。",
      en: "Capacity planning here is far simpler than for an LLM, because there is no KV cache, memory is constant, and latency depends only on input length and batch. The chapter turns capacity into arithmetic. Step one is single-request latency: measured here at a 401 ms median for one 18-option question on CPU with the multilingual checkpoint, against the vendor's 32.8-to-39.5 ms per question on GPU. Step two is the batching gain: ten questions in one forward pass take the vendor's number from 32.8 ms to 7.2 ms per question — noting that this batch means several questions over one state, which is a different thing from cross-request dynamic batching, and the latter is something you assemble in your own service layer. Step three is threads: on CPU, LAYA_THREADS above the physical core count slows things down through contention, a parameter that punishes the more-is-better instinct. Step four is queueing: given an arrival rate, a service time and a concurrency level, M/M/c gives the queueing delay, which added to service time gives end-to-end P95 and therefore the worker count. The bench is that queueing model: drag QPS, per-request latency, worker count and batch size, and watch P95 take off at a particular load — that point is your capacity wall, and it always arrives earlier than intuition suggests. One practical rule closes the chapter: size on P95 rather than the mean, because a decision service usually hangs inside a synchronous call chain, and a pretty mean with a blown P95 means one user in twenty is waiting.",
    },
    objectives: [
      { zh: "用排队模型从 QPS 和延迟预算反推 worker 数", en: "Use a queueing model to turn QPS and a latency budget into a worker count" },
      { zh: "区分同 state 多问题的批和跨请求动态批", en: "Separate multi-question batching from cross-request dynamic batching" },
      { zh: "把线程数设在物理核数而不是更高", en: "Set thread count at the physical core count, not above it" },
    ],
    outline: [
      { zh: "单请求延迟:CPU 与 GPU 的两组数", en: "Single-request latency: the CPU and GPU numbers" },
      { zh: "批处理:哪种批,收益多少", en: "Batching: which kind, and how much it buys" },
      { zh: "线程争抢", en: "Thread contention" },
      { zh: "排队模型与容量墙", en: "The queueing model and the capacity wall" },
    ],
  },
  {
    id: "t21", code: "OP3", moduleId: "m7", difficulty: 3, hours: 6, prereq: ["t20", "t9"], viz: "tierLab",
    props: ["两级架构", "兜底容量", "降级路径", "线上监控", "推翻率"],
    title: { zh: "两级架构:门槛之下是什么", en: "Two Tiers: What Sits Below the Threshold" },
    summary: {
      zh: "这类模型正确的用法从来不是「全量替代」,而是一个两级系统:高于门槛的由模型自动处理,低于门槛的转给 LLM 或人工。这一章讲这个架构的三个参数怎么定。门槛由第九章的曲线决定,但它不是一个纯技术选择——它取决于兜底那一侧有多少容量:如果人工每天只能处理两百条,那门槛必须设在让兜底量不超过两百条的位置,哪怕这意味着放过一些本该兜底的错误。兜底延迟预算是第二个参数:如果兜底是 LLM,那条路的 P95 是几秒,整个链路的 P95 就由它决定,而不是由 400 毫秒的模型决定。第三个参数是降级路径,而这是个业务决定不是技术决定:模型挂了的时候,是全部转兜底(兜底会被打爆)还是全部放行(等于没有这层判断),必须提前和业务方定好,不能在故障现场临时决定。这一章还讲线上监控该看什么——线上没有标签,所以你监控不了准确率。能监控的有三样:置信度分布的漂移(分布整体左移通常意味着输入分布变了)、兜底率的变化(它是置信度漂移的业务侧投影)、以及人工推翻率(在人工复核的那部分里,模型判断被推翻的比例,这是唯一一个带标签的线上信号,应当被当作准实时的准确率代理)。",
      en: "The correct use of this class of model was never wholesale replacement; it is a two-tier system where confidence above the threshold is handled by the model and everything below goes to an LLM or a human. This chapter settles the three parameters of that design. The threshold comes from chapter nine's curve, but it is not a purely technical choice — it depends on how much capacity the fallback side has. If people can process two hundred items a day, the threshold must sit where fallback volume stays under two hundred, even though that lets some errors through that should have been caught. The fallback latency budget is the second parameter: if the fallback is an LLM whose P95 runs to seconds, the whole chain's P95 is set by that path rather than by a 400 ms model. The third is the degradation path, and it is a business decision rather than a technical one: when the model dies, does everything go to fallback (which will be overwhelmed) or does everything pass through (which is the same as not having this layer)? That must be agreed in advance, not improvised during the incident. The chapter also covers what to monitor, given that production has no labels and accuracy therefore cannot be monitored. Three things can: drift in the confidence distribution (a wholesale shift left usually means the input distribution changed), movement in the fallback rate (the business-side projection of that drift), and the human override rate — the share of model judgements reversed within the human-reviewed portion, the only labelled online signal there is, and the right proxy for near-real-time accuracy.",
    },
    objectives: [
      { zh: "按兜底容量而不是按曲线最优点来定门槛", en: "Set the threshold by fallback capacity rather than by the curve's optimum" },
      { zh: "提前定好模型故障时的降级行为", en: "Agree the degradation behaviour before the model fails" },
      { zh: "在没有标签的线上环境里选对三个监控信号", en: "Pick the three monitorable signals in a production环境 with no labels" },
    ],
    outline: [
      { zh: "门槛、兜底容量、兜底延迟", en: "Threshold, fallback capacity, fallback latency" },
      { zh: "降级路径是业务决定", en: "The degradation path is a business decision" },
      { zh: "线上监控:没有标签怎么办", en: "Monitoring with no labels" },
      { zh: "人工推翻率:唯一带标签的信号", en: "The override rate: the one labelled signal" },
    ],
  },

  /* ============ M8 · CS 案例与决策 ============ */
  {
    id: "t22", code: "CS1", moduleId: "m8", difficulty: 3, hours: 6, prereq: ["t18"], viz: "caseLab",
    props: ["216 条需求", "18 个模块", "0.505", "门槛失效", "失败归因"],
    title: { zh: "案例一:216 条需求、18 个模块、为什么没通过", en: "Case One: 216 Requirements, 18 Modules, and Why It Failed" },
    summary: {
      zh: "这一章把本书的实测从头到尾复盘一遍,所有数字都是在一台没有 GPU 的 Windows 机器上真实跑出来的。任务:216 条中文需求条目分进 18 个业务模块,标签描述取自同一张表的子模块名,模型用 Laya 的多语言 checkpoint(中文必须走这一支)。结果:准确率 0.505,对随机 0.056、多数类 0.120——模型确实学到了东西,高出随机九倍。延迟中位 401 毫秒、P95 447 毫秒,和官方 CPU 口径 193 到 464 毫秒一致。校准:原样 ECE 0.215,在前一半数据上拟合出 T=1.65 之后,后一半的 ECE 降到 0.141,仍然大于 0.1。判死刑的是门槛表:0.50 门槛下覆盖 56.5%、精度 0.623;0.95 门槛下覆盖 20.8%、精度 0.689。覆盖率砍掉三分之二,精度只涨 6.6 个点。这一章逐条做失败归因,而且区分「模型的问题」和「任务的问题」:18 个标签落在那个被库自己拒绝的 choice:11+ 温度桶里(模型);每类平均只有 12 条(评测集);base checkpoint 本来就是待微调的底座,README 自报零样本 0.362 对随机 0.318(模型);而最根本的一条是任务的问题——标签之间语义重叠,「仓库管理」和「客户计划变更下的原料保障与库存控制」本来就不互斥,任何模型在这个标签体系下都会撞墙。这一章的价值不在结论,而在归因方法:同样的四步能用在你自己的任何一次失败上。",
      en: "This chapter replays the book's measurement end to end, every number produced on a Windows machine with no GPU. The task: 216 Chinese requirement rows into 18 business modules, label descriptions taken from the same sheet's sub-module names, using Laya's multilingual checkpoint because Chinese must go to that branch. The result: 0.505 accuracy against a random 0.056 and a majority 0.120 — the model did learn, at nine times random. Latency 401 ms median and 447 ms P95, consistent with the vendor's 193-to-464 ms CPU range. Calibration: 0.215 ECE as shipped, and after fitting T=1.65 on the first half, 0.141 on the second — still above 0.1. What condemned it was the threshold table: at 0.50, coverage 56.5% and precision 0.623; at 0.95, coverage 20.8% and precision 0.689. Two thirds of coverage gone for 6.6 points of precision. The chapter attributes the failure line by line, separating the model's problems from the task's: the 18 labels land in the choice:11+ temperature bucket the library itself refuses (model); there are only twelve rows per class on average (evaluation set); the base checkpoint is a foundation to fine-tune, its own README reporting 0.362 zero-shot against a 0.318 random baseline (model); and the deepest one belongs to the task — the labels overlap semantically, warehouse management and material assurance under customer plan changes were never mutually exclusive, and every model hits that wall. The value here is not the verdict but the attribution method, and the same four steps apply to any failure of your own.",
    },
    objectives: [
      { zh: "把一次失败拆成模型、评测集、任务三类原因", en: "Split a failure into model, evaluation-set and task causes" },
      { zh: "识别标签体系重叠这一类无法用模型解决的失败", en: "Recognise taxonomy overlap as a failure no model can solve" },
      { zh: "复用这套四步归因到自己的项目上", en: "Reuse the four-step attribution on your own project" },
    ],
    outline: [
      { zh: "任务、数据与设置", en: "Task, data and setup" },
      { zh: "四张表的实际数字", en: "The four tables, with the real numbers" },
      { zh: "归因:模型 / 评测集 / 任务", en: "Attribution: model, evaluation set, task" },
      { zh: "如果一定要做成,该怎么做", en: "What it would take to make this work anyway" },
    ],
  },
  {
    id: "t23", code: "CS2", moduleId: "m8", difficulty: 2, hours: 5, prereq: ["t22"], viz: "winLab",
    props: ["少标签高频", "提示词注入检测", "内容安全", "模型路由", "单位成本"],
    title: { zh: "案例二:它能赢的那个形状", en: "Case Two: The Shape It Wins On" },
    summary: {
      zh: "上一章是反面,这一章是正面:什么样的场景会让这类模型明显划算。形状有四个条件,缺一不可。标签少:2 到 5 个,这让每个选项都能分到充足的 token 预算,也让随机基线高到足以让置信度有意义的分辨空间。量大:每天几十万次以上,这样 400 毫秒对 3 秒、$0.042 对按输出计费的差距才会在账单上显形。语义边界清晰:「这段输入是不是提示词注入」「这条评论有没有人身攻击」这类问题,标注者之间的一致率本来就高,模型才有可能学到稳定的边界。门槛真的能分开对错:这是唯一一个必须实测的条件,前三个都能靠常识判断。这一章拿一个具体场景算完整的账——LLM 应用前置的提示词注入检测:每天 50 万次调用,注入率千分之三,漏一次的代价、误拦一次的代价、模型自动处理的比例、兜底 LLM 复核的量,算出月度净收益,再和「全部交给 LLM 判断」以及「用正则规则」两个对照方案比。这一章也诚实标出这个案例的性质:它是按公开数字和本书的延迟实测构造的成本模型,不是一次真实部署的复盘——和上一章那个全部实测的案例不是一个证据等级,读的时候要分清。",
      en: "The previous chapter was the negative case; this one is the positive: which settings make this class of model clearly pay. The shape has four conditions and needs all of them. Few labels — two to five — so each option gets a generous token budget and the random baseline sits high enough to leave confidence meaningful room to discriminate. High volume — hundreds of thousands of calls a day — so that 400 ms against 3 seconds, and $0.042 against output-metered billing, actually show up on an invoice. Clean semantic boundaries: questions like 'is this input a prompt injection' or 'does this comment attack a person' already have high agreement between annotators, which is the precondition for a model learning a stable boundary. And a threshold that genuinely separates right from wrong — the one condition that must be measured, where the first three can be judged by common sense. The chapter prices one concrete setting end to end: prompt-injection detection in front of an LLM application, with 500,000 calls a day, an injection rate of three in a thousand, a cost for each miss, a cost for each false block, an automated share and a volume sent to an LLM for review, producing a monthly net gain compared against two alternatives — sending everything to an LLM, and using regex rules. The chapter is honest about the nature of this case: it is a cost model built from public figures and this book's own latency measurements, not the post-mortem of a real deployment, and it does not carry the evidential weight of the fully measured case before it.",
    },
    objectives: [
      { zh: "用四个条件筛出适合这类模型的场景", en: "Filter settings with the four conditions" },
      { zh: "算出一个具体场景的月度净收益", en: "Compute the monthly net gain of a concrete setting" },
      { zh: "分清「实测复盘」和「成本模型推演」两种证据", en: "Separate a measured post-mortem from a modelled projection" },
    ],
    outline: [
      { zh: "四个条件", en: "The four conditions" },
      { zh: "提示词注入检测的完整账", en: "Prompt-injection detection, priced end to end" },
      { zh: "两个对照方案", en: "Two alternatives for comparison" },
      { zh: "这个案例的证据等级", en: "What this case does and does not prove" },
    ],
  },
  {
    id: "t24", code: "CS3", moduleId: "m8", difficulty: 2, hours: 5, prereq: ["t23", "t15"], viz: "treeLab",
    props: ["选型决策树", "标签数", "语言", "已有 LLM", "时间戳", "重测纪律"],
    title: { zh: "一棵决策树,和一个必须写下的时间戳", en: "A Decision Tree, and a Timestamp You Must Write Down" },
    summary: {
      zh: "最后一章把全书收成一棵树和一条纪律。树的分叉按五个问题走:你有几个标签(超过 20 直接排除编码器派)、什么语言(非拉丁文字排除英文 checkpoint,也排除一批只测过英文的项目)、有没有标注数据(有几百条就先考虑微调分类器)、是否已经在跑 LLM(是的话先试读 logits,边际成本接近零)、以及延迟预算和调用量(决定值不值得多养一个服务)。走到叶子会得到一个具体建议,而不是一份并列的候选清单。决策台上就是这棵树,你可以把自己的五个答案填进去,看路径怎么走、以及每一个分叉是基于哪条证据。这一章的第二部分是纪律:本书写于 2026 年 9 月 23 日,距离 Jev 发布第八天,距离第一批开源实现出现不到一周。这意味着书里每一个具体数字——版本号、参数量、延迟、基准分数、哪个 issue 还没修——都有一个很短的保质期。唯一不会过期的是方法:三条基线、四张表、门槛-覆盖率-精度曲线、以及「所有数字都要自己在自己的数据上重测一遍」这条规矩。这一章给出一份重测清单,你可以在半年后照着跑一遍,看哪些结论还站得住。",
      en: "The last chapter collapses the book into a tree and a discipline. The tree branches on five questions: how many labels you have (past twenty, the encoder camp is out), which language (non-Latin scripts rule out the English checkpoint and a set of projects tested only on English), whether you have labelled data (a few hundred rows argue for fine-tuning a classifier first), whether you already run an LLM (if so, try logit scoring first, at near-zero marginal cost), and your latency budget and call volume (which decide whether another service is worth keeping alive). A leaf gives one concrete recommendation rather than a shortlist. The bench is that tree: enter your five answers, watch the path taken, and see which evidence each branch rests on. The chapter's second half is the discipline. This book was written on 23 September 2026, eight days after Jev launched and less than a week after the first open implementations appeared. That means every specific number in it — version strings, parameter counts, latencies, benchmark scores, which issues remain open — has a short shelf life. What does not expire is the method: three baselines, four tables, the threshold-coverage-precision curve, and the rule that every number must be re-measured on your own data. A re-measurement checklist closes the book, to be run again in six months to see which conclusions still stand.",
    },
    objectives: [
      { zh: "用五个问题走完选型决策树并得到一个建议", en: "Walk the five-question tree to a single recommendation" },
      { zh: "分清哪些结论会过期、哪些方法不会", en: "Separate conclusions that expire from methods that do not" },
      { zh: "建立一份可以定期重跑的重测清单", en: "Build a re-measurement checklist you can rerun" },
    ],
    outline: [
      { zh: "五个问题与它们的分叉", en: "Five questions and their branches" },
      { zh: "叶子:具体建议而不是候选清单", en: "Leaves: a recommendation, not a shortlist" },
      { zh: "保质期:哪些数字明天就不对了", en: "Shelf life: which numbers are wrong tomorrow" },
      { zh: "重测清单", en: "The re-measurement checklist" },
    ],
  },
];

// Derived totals used by the home page hero.
const DEMO_COUNT = CHAPTERS.filter((c) => c.viz).length;      // interactive benches
const TOTAL_HOURS = CHAPTERS.reduce((s, c) => s + (c.hours || 0), 0);

window.MODULES = MODULES;
window.CHAPTERS = CHAPTERS;
window.DEMO_COUNT = DEMO_COUNT;
window.TOTAL_HOURS = TOTAL_HOURS;
