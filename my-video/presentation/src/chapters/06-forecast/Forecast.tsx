import "./Forecast.css";

interface Props {
  step: number;
}

/**
 * Chapter 6 · 未来预测
 *
 * Step 0 — Q3 提问
 * Step 1 — 方法说明：三种模型对比，选 Prophet
 * Step 2 — 预测结果：2026-2028E 三情景曲线 + 一线占比下行
 * Step 3 — 重要声明 / 假设前提
 */
export function Forecast({ step }: Props) {
  return (
    <div className="fc-stage">
      {step === 0 && <Q3Frame />}
      {step === 1 && <ModelsStep />}
      {step === 2 && <NumbersStep />}
      {step === 3 && <AssumptionsStep />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function Q3Frame() {
  return (
    <div className="fc-qframe">
      <div className="fc-qframe__num">Q3</div>
      <div className="fc-qframe__text">
        未来 3–5 年我国 AI 算法服务商
        <br />
        数量规模及地域分布如何预测？
      </div>
    </div>
  );
}

function ModelsStep() {
  const models = [
    { name: "线性回归", r2: "0.78", rmse: "5.2", verdict: "被拒绝", ok: false },
    { name: "二次多项式", r2: "0.91", rmse: "4.0", verdict: "外推偏离", ok: false },
    { name: "Prophet 分解", r2: "0.97", rmse: "3.1", verdict: "最优模型", ok: true },
  ];
  const flow = [
    { num: "①", desc: "以 2025 年\n2,496 条为锚点" },
    { num: "②", desc: "计算基线增长率\n±8% 得三情景" },
    { num: "③", desc: "2 年一步外推\n叠加逐年波动带" },
    { num: "④", desc: "8%-12% 波动带\n反映不确定性" },
  ];
  return (
    <div className="fc-models">
      <div className="fc-models__header">
        <div className="fc-models__kicker">METHODOLOGY</div>
        <div className="fc-models__title">三种模型对比 · 选 Prophet 为主预测模型</div>
        <div className="fc-models__sub">
          政策驱动市场 → ARIMA / Prophet 无法预测政策发布时间 · 改用情景外推法
        </div>
      </div>

      <div className="fc-models__body">
        <div className="fc-models__table">
          <div className="fc-models__th">
            <span>模型</span>
            <span>R²</span>
            <span>RMSE</span>
            <span>评估</span>
          </div>
          {models.map((m, i) => (
            <div
              key={i}
              className={`fc-model-row ${m.ok ? "fc-model-row--ok" : ""}`}
              style={{ animationDelay: `${i * 0.18}s` }}
            >
              <span className="fc-model-row__name">{m.name}</span>
              <span className="fc-model-row__r2">{m.r2}</span>
              <span className="fc-model-row__rmse">{m.rmse}</span>
              <span
                className={`fc-model-row__verdict ${
                  m.ok ? "fc-model-row__verdict--ok" : "fc-model-row__verdict--fail"
                }`}
              >
                {m.verdict}
              </span>
            </div>
          ))}
        </div>

        <div className="fc-models__flow">
          <div className="fc-models__flow-title">情景外推法 · 4 步</div>
          <div className="fc-models__flow-list">
            {flow.map((f, i) => (
              <div
                key={i}
                className="fc-models__flow-step"
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              >
                <div className="fc-models__flow-num">{f.num}</div>
                <div className="fc-models__flow-desc">
                  {f.desc.split("\n").map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < f.desc.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fc-models__insight">
        Prophet R²=0.97 置信区间最窄，残差仅 3.1 → 选为主预测模型
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  NumbersStep — 三情景曲线 + 历史柱状 + 一线占比下行          */
/* ─────────────────────────────────────────────────────────── */

const FORECAST_DATA = {
  // 左侧历史：2022-2025 年实际备案量
  history: [
    { year: 2022, v: 100 },
    { year: 2023, v: 350 },
    { year: 2024, v: 1500 },
    { year: 2025, v: 2496 },
  ],
  // 右侧预测：2026E / 2027E / 2028E 三情景
  scenarios: [
    {
      name: "稳态情景",
      color: "#1E88FF",
      solid: true,
      nodes: [3300, 4400, 5500],
    },
    {
      name: "加速情景",
      color: "#30C48D",
      solid: true,
      nodes: [3300, 5300, 7600],
    },
    {
      name: "收紧情景",
      color: "#FF6B4A",
      solid: false,
      nodes: [3300, 4000, 4800],
    },
  ],
  cityShare: [
    { y: "2026E", pct: 60 },
    { y: "2027E", pct: 56 },
    { y: "2028E", pct: 52 },
  ],
};

function NumbersStep() {
  return (
    <div className="fc-numbers">
      <div className="fc-numbers__header">
        <div className="fc-numbers__kicker">FORECAST</div>
        <div className="fc-numbers__title">Prophet 预测 · 2026-2028E 三情景</div>
        <div className="fc-numbers__sub">
          锚点 = 2025 年 2,496 条 · 基线增长率 ±8% 得三情景 · 8%–12% 波动带
        </div>
      </div>

      <div className="fc-numbers__body">
        {/* 左：曲线图 */}
        <div className="fc-numbers__chart">
          <ForecastSVG />
          <div className="fc-numbers__legend">
            {FORECAST_DATA.scenarios.map((s) => (
              <div key={s.name} className="fc-legend-item">
                <span
                  className="fc-legend-swatch"
                  style={{
                    background: s.solid ? s.color : "transparent",
                    borderColor: s.color,
                    borderStyle: s.solid ? "solid" : "dashed",
                    borderWidth: s.solid ? 0 : 2,
                  }}
                />
                <span className="fc-legend-label" style={{ color: s.color }}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 右：一线占比 + 关键结论 */}
        <div className="fc-numbers__side">
          <div className="fc-numbers__yearlist">
            <div className="fc-numbers__yearlist-title">年度预测 · 中位数</div>
            {FORECAST_DATA.scenarios[1].nodes.map((v, i) => (
              <div key={i} className="fc-numbers__yearline">
                <span className="fc-numbers__yearline-y">
                  {2026 + i}E
                </span>
                <span className="fc-numbers__yearline-v">
                  {v.toLocaleString()}
                </span>
                <span className="fc-numbers__yearline-u">条</span>
              </div>
            ))}
          </div>

          <div className="fc-numbers__cityshift">
            <div className="fc-numbers__cityshift-title">
              一线城市占比下行
            </div>
            <div className="fc-numbers__cityshift-track">
              {FORECAST_DATA.cityShare.map((c, i) => (
                <div
                  key={i}
                  className="fc-numbers__cityshift-item"
                  style={{ animationDelay: `${0.2 + i * 0.15}s` }}
                >
                  <div className="fc-numbers__cityshift-pct">
                    {c.pct}
                    <small>%</small>
                  </div>
                  <div className="fc-numbers__cityshift-y">{c.y}</div>
                </div>
              ))}
            </div>
            <div className="fc-numbers__cityshift-note">
              60% <span className="fc-arrow">→</span> 52% · 二三线开始接棒
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastSVG() {
  // viewBox 1200 × 500
  // 左侧历史（2022-2025），右侧预测（2026-2028）
  const W = 1200;
  const H = 500;
  const padL = 110;
  const padR = 60;
  const padT = 60;
  const padB = 70;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // 7 个年份：2022 2023 2024 2025 | 2026E 2027E 2028E
  const years = FORECAST_DATA.history
    .map((h) => h.year)
    .concat(FORECAST_DATA.scenarios[0].nodes.map((_, i) => 2026 + i));
  const colW = innerW / (years.length - 1);
  const xOf = (i: number) => padL + i * colW;

  const maxY = 8000;
  const minY = 0;
  const yOf = (v: number) => padT + innerH - ((v - minY) / (maxY - minY)) * innerH;

  // 预测分界（2025/2026 之间）
  const splitX = xOf(3) + colW / 2;

  // 三条预测曲线路径（从 2025 实际点出）
  const startPt = { x: xOf(3), y: yOf(FORECAST_DATA.history[3].v) };
  const endPts = [5, 6].map((i) => xOf(i));
  const yOf6 = (v: number) => yOf(v);

  const pathFor = (nodes: number[]) => {
    const pts = [startPt, ...nodes.map((v, i) => ({ x: endPts[i], y: yOf6(v) }))];
    // 二次贝塞尔平滑
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  // Y 轴网格刻度：0, 2000, 4000, 6000, 8000
  const yTicks = [0, 2000, 4000, 6000, 8000];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className="fc-svg"
    >
      <defs>
        <linearGradient id="fcAreaBaseline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E88FF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1E88FF" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="fcAreaAccel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#30C48D" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#30C48D" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="fcBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#90A4AE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#90A4AE" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* 水平网格 + Y 轴标签（统一在左侧） */}
      {yTicks.map((v) => (
        <g key={`grid-${v}`}>
          <line
            x1={padL}
            x2={W - padR}
            y1={yOf(v)}
            y2={yOf(v)}
            stroke="rgba(143,170,200,0.12)"
            strokeWidth="1"
          />
          <text
            x={padL - 16}
            y={yOf(v) + 5}
            fill="rgba(143,170,200,0.7)"
            fontSize="14"
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontWeight="500"
          >
            {v.toLocaleString()}
          </text>
        </g>
      ))}

      {/* Y 轴标题 */}
      <text
        x={28}
        y={padT + innerH / 2}
        fill="rgba(143,170,200,0.55)"
        fontSize="13"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        letterSpacing="2"
        transform={`rotate(-90 28 ${padT + innerH / 2})`}
      >
        备案量（条）
      </text>

      {/* 预测分界虚线 */}
      <line
        x1={splitX}
        x2={splitX}
        y1={padT - 10}
        y2={H - padB + 10}
        stroke="rgba(255,209,102,0.4)"
        strokeWidth="1.5"
        strokeDasharray="8 4"
      />
      <text
        x={splitX}
        y={padT - 22}
        fill="rgba(255,209,102,0.8)"
        fontSize="12"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        letterSpacing="2"
      >
        预测区间
      </text>

      {/* 历史柱 */}
      {FORECAST_DATA.history.map((h, i) => {
        const cx = xOf(i) - 22;
        const cy = yOf(h.v);
        const ch = H - padB - cy;
        return (
          <g key={h.year} className="fc-bar-group">
            <rect
              x={cx}
              y={cy}
              width="44"
              height={ch}
              rx="3"
              fill="url(#fcBarGrad)"
              className="fc-bar"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
            {/* 柱顶数值：移到柱体内部偏上，白底高对比 */}
            <rect
              x={xOf(i) - 32}
              y={cy - 24}
              width="64"
              height="20"
              rx="3"
              fill="rgba(3,11,24,0.85)"
              stroke="rgba(143,170,200,0.3)"
              strokeWidth="1"
              className="fc-bar-label-bg"
              style={{ animationDelay: `${i * 0.12 + 0.3}s` }}
            />
            <text
              x={xOf(i)}
              y={cy - 10}
              fill="#e8f4ff"
              fontSize="12"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              className="fc-bar-label"
              style={{ animationDelay: `${i * 0.12 + 0.3}s` }}
            >
              {h.v.toLocaleString()}
            </text>
            <text
              x={xOf(i)}
              y={H - padB + 20}
              fill="rgba(200,220,240,0.7)"
              fontSize="13"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {h.year}
            </text>
          </g>
        );
      })}

      {/* 预测曲线 */}
      {FORECAST_DATA.scenarios.map((s, i) => {
        const d = pathFor(s.nodes);
        return (
          <g key={s.name}>
            {/* 区域填充（仅稳态/加速） */}
            {i < 2 && (
              <path
                d={`${d} L ${endPts[1]},${H - padB} L ${startPt.x},${H - padB} Z`}
                fill={i === 0 ? "url(#fcAreaBaseline)" : "url(#fcAreaAccel)"}
                opacity="0"
                className="fc-area"
                style={{ animationDelay: `${0.6 + i * 0.2}s` }}
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={i === 1 ? 3.5 : 2.6}
              strokeDasharray={s.solid ? "0" : "8 5"}
              strokeLinecap="round"
              className="fc-curve"
              style={{ animationDelay: `${0.5 + i * 0.2}s` }}
            />
            {/* 端点圆 */}
            {s.nodes.map((v, j) => (
              <circle
                key={j}
                cx={endPts[j]}
                cy={yOf(v)}
                r={j === 1 && i === 1 ? 7 : 5}
                fill={s.color}
                stroke="#030b18"
                strokeWidth="2"
                className="fc-pt"
                style={{ animationDelay: `${0.9 + j * 0.1 + i * 0.05}s` }}
              />
            ))}
            {/* 终点数值：白底标签避免与曲线/网格混淆 */}
            {s.nodes.map((v, j) => {
              const tx = endPts[j];
              const ty = yOf(v);
              // 收紧情景显示在下方，稳态下方，加速上方
              const dy = i === 1 ? -22 : 22;
              return (
                <g key={j} className="fc-pt-label-group">
                  <rect
                    x={tx - 4}
                    y={ty + dy - 14}
                    width="62"
                    height="20"
                    rx="3"
                    fill="rgba(3,11,24,0.9)"
                    stroke={s.color}
                    strokeWidth="1"
                    className="fc-pt-label-bg"
                    style={{ animationDelay: `${1.0 + j * 0.1 + i * 0.05}s` }}
                  />
                  <text
                    x={tx + 27}
                    y={ty + dy + 1}
                    fill={s.color}
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                    className="fc-pt-label"
                    style={{ animationDelay: `${1.0 + j * 0.1 + i * 0.05}s` }}
                  >
                    {v.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* 预测年份 */}
      {[2026, 2027, 2028].map((y, i) => (
        <text
          key={y}
          x={xOf(4 + i)}
          y={H - padB + 20}
          fill="#FFD166"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
        >
          {y}E
        </text>
      ))}

      {/* 基线锚点提示 */}
      <text
        x={xOf(3) + 8}
        y={yOf(FORECAST_DATA.history[3].v) - 28}
        fill="rgba(255,209,102,0.95)"
        fontSize="11"
        fontWeight="600"
        fontFamily="var(--font-mono)"
      >
        锚点 2,496
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────── */

function AssumptionsStep() {
  const assumptions = [
    { icon: "📋", text: "政策不收紧", ok: true },
    { icon: "⚡", text: "算力供给跟上", ok: true },
    { icon: "💰", text: "大模型 API 价格持续下降", ok: true },
    { icon: "✕", text: "任一变量出问题 → 增速打折", ok: false },
  ];
  return (
    <div className="fc-assumptions">
      <div className="fc-assumptions__header">
        <div className="fc-assumptions__kicker">CAVEAT</div>
        <div className="fc-assumptions__title">预测假设前提</div>
        <div className="fc-assumptions__sub">
          有上限的乐观预测 · 三变量任一出问题增速打折扣
        </div>
      </div>

      <div className="fc-assumptions__list">
        {assumptions.map((a, i) => (
          <div
            key={i}
            className={`fc-assum ${a.ok ? "fc-assum--ok" : "fc-assum--warn"}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <span className="fc-assum__icon">{a.icon}</span>
            <span className="fc-assum__text">{a.text}</span>
            <span
              className={`fc-assum__tag ${a.ok ? "fc-assum__tag--ok" : "fc-assum__tag--warn"}`}
            >
              {a.ok ? "假设" : "风险"}
            </span>
          </div>
        ))}
      </div>

      <div className="fc-assumptions__caveat">
        ⚠️ 重要声明：预测仅基于 2022-2026 年历史备案数据的趋势外推，不构成
        任何商业建议或投资决策依据。实际备案量受政策发布节奏、审核标准变化
        等多重不可预测因素影响，预测区间不等同于确定性结论。
      </div>
    </div>
  );
}
