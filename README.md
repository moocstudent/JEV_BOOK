# JEV_BOOK · Jev 与 Laya:System One 决策模型

中英双语的「System One 决策模型」自学教程 —— 面向要把 Jev 或它的开源平替(Laya 为首)真的评测、部署、并做出上线判决的工程师。

**8 个模块 / 24 章**,每章由三块组成:

- **决策台**:一个可交互模拟器,所有数字在你的浏览器里现算 —— 真实的 softmax、真实的 ECE、真实的温度网格搜索、真实的 M/M/c 排队。没有一张是画出来的假图。
- **解释**:讲清机制、代价和边界。
- **代码**:Python / 请求 / 部署评测 三个视角的完整片段。

全书用一份真实数据贯穿始终 —— 216 条中文需求分进 18 个业务模块,全部在一台没有 GPU 的机器上实测(准确率 0.505、置信度门槛失效、confidence 其实是归一化熵)。

## 模块

| # | 模块 | 章数 | 内容 |
|---|---|---|---|
| I | 决策不是文本 | 3 | 两条流水线 · 三原语(choice/score/noul) · 一次前向的延迟 |
| II | Jev 本体 | 3 | /v1/systemone 接口 · **输出免费的定价后果** · 宣传数字的条件 |
| III | 概率与校准 | 3 | 可靠性图/ECE/Brier · **温度缩放** · 门槛-覆盖率-精度曲线 |
| IV | Laya | 3 | 三 checkpoint 与语言路由 · head_max_len token 预算 · **只有读源码才知道的坑** |
| V | 开源生态 | 3 | 编码器派(Von/Verdict) · LLM 派(Kev/SemIf) · **你可能根本不需要它** |
| VI | 自己评测 | 3 | 三条基线 · 建评测集与一致率 · 四张表判决模板 |
| VII | 上线工程 | 3 | 协议兼容自托管 · 排队容量 · 两级架构 |
| VIII | 案例与决策 | 2+1 | **实测失败案例** · 成本模型成功形状 · 选型决策树 |

## 本地运行

无需构建工具,React 18 UMD + 浏览器内 Babel:

```bash
python -m http.server 5870 --directory D:/webcode/JEV_BOOK
```

然后打开 http://localhost:5870

## 文件结构

```
index.html          入口,按顺序加载下面的脚本
i18n.jsx            中英切换与 UI 文案
data.jsx            8 个模块 / 24 章的课程数据 + 本书实测常量 MEASURED
viz.jsx             共享前奏 + 概率工具(softmax/ece/fitTemp) + t1–t9 决策台
viz2.jsx            t10–t18 决策台
viz3.jsx            t19–t24 决策台 + VIZ 注册表 + <Viz>
figures.jsx         <Figure> + 24 章节图 + 8 张模块架构图
code.jsx            <CodeLab> + t1–t12 代码面板
code2.jsx           t13–t24 代码面板
pages.jsx           首页 / 模块页 / 章节页
app.jsx             路由、主题、进度
jv.css / styles.css 决策台样式 + 全站样式(indigo/amber 主题)
content/            48 个 markdown 讲义(t1–t24 × zh/en)
```

## 关于「所有数字现算」

决策台里跑的是真实计算,不是宣传语:

- **softmax + 归一化熵 + ECE**:`viz.jsx` 的 `softmax` / `entropy` / `layaConf` / `ece`
- **温度网格搜索**:`fitTemp`,区间 `[0.5, 5.0]` 与 Laya 运行时 clamp 一致
- **合成评测集**:`makeEval`,带可调的能力/过度自信旋钮,喂给可靠性图
- **M/M/c 排队(Erlang-C)**:`viz3.jsx` 的 `CapacityViz`
- **本书实测数字**:全部集中在 `data.jsx` 的 `MEASURED`,决策台从这里取,不会和案例研究漂移

## 数据来源与诚实边界

本书写于 **2026-09-23**,距 Jev 发布(2026-09-15)第八天。凡涉及具体版本号、参数量、延迟、基准分的数字都有很短的保质期,凡标「本书实测」的是在本机 CPU 上真实跑出来的,凡标「自报」的是各项目自己公布、尚无第三方复测的。方法(三条基线、四张表、门槛曲线、自己重测)不会过期,具体排行榜会。

派生自 TIMESERIES_BOOK 的三块式结构(决策台 + 解释 + 三视角代码),`ts-` 类前缀改为 `jv-`,主题从 teal/orange 改为 indigo/amber。
