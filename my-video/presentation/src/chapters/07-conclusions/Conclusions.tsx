import "./Conclusions.css";

interface Props {
  step: number;
}

/**
 * Chapter 7 · 短板分析
 *
 * 4 个行业短板（针对我国 AI 算法服务商，而非研究方法本身）：
 *  Step 0 — Q4 提问
 *  Step 1 — 短板一：地域集聚严重（广东+北京 占 50%，中西部 < 5%）
 *  Step 2 — 短板二：传统行业渗透不足（ICT+科技服务 76%，制造/金融/教育 < 0.5%）
 *  Step 3 — 短板三：备案脉冲剧烈（政策驱动型扎堆/回落）
 *  Step 4 — 短板四：巨头壁垒形成（3 家占近半，78% 企业只备 1 个，持续备案者下降）
 *  Step 5 — 总结：四个短板总览
 */
export function Conclusions({ step }: Props) {
  return (
    <div className="cl-stage">
      {step === 0 && <Q4Frame />}
      {step === 1 && <Weakness1 />}
      {step === 2 && <Weakness2 />}
      {step === 3 && <Weakness3 />}
      {step === 4 && <Weakness4 />}
      {step === 5 && <SummaryFrame />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function Q4Frame() {
  return (
    <div className="cl-qframe">
      <div className="cl-qframe__num">Q4</div>
      <div className="cl-qframe__text">
        我国 AI 算法服务商
        <br />
        是否存在明显短板？
      </div>
    </div>
  );
}

/* ── 短板一：地域集聚严重 ── */

const W1_DATA = {
  top2: [
    { name: "广东", pct: 26.6, color: "#FF6B4A" },
    { name: "北京", pct: 22.1, color: "#FFA94D" },
  ],
  top2Sum: 48.7,
  centralWest: 5, // 中西部 < 5%
  provinces: [
    { name: "广东", pct: 26.6 },
    { name: "北京", pct: 22.1 },
    { name: "浙江", pct: 12.6 },
    { name: "上海", pct: 12.0 },
    { name: "江苏", pct: 4.9 },
    { name: "四川", pct: 3.1 },
    { name: "湖北", pct: 1.7 },
    { name: "福建", pct: 1.6 },
  ],
  emptyProvinces: 6, // 部分省份备案数为 0
};

function Weakness1() {
  return (
    <div className="cl-w">
      <div className="cl-w__header">
        <div className="cl-w__kicker">WEAKNESS · 01</div>
        <div className="cl-w__badge-row">
          <span className="cl-w__badge">短板一</span>
          <span className="cl-w__title">地域集聚严重</span>
        </div>
        <div className="cl-w__sub">
          广东+北京 占 50% · 中西部加起来不到 5% · 部分省份为 0
        </div>
      </div>

      <div className="cl-w__body">
        <div className="cl-w__panel cl-w__panel--map">
          <div className="cl-w__panel-title">数据大屏现场 · 省份热度</div>
          <W1ProvinceChart />
        </div>

        <div className="cl-w__panel cl-w__panel--insight">
          <div className="cl-w__panel-title">关键数字</div>
          <div className="cl-w__stats">
            <div className="cl-w__stat cl-w__stat--hot">
              <div className="cl-w__stat-num">50%</div>
              <div className="cl-w__stat-lbl">广东+北京 双核</div>
            </div>
            <div className="cl-w__stat cl-w__stat--cold">
              <div className="cl-w__stat-num">&lt;5%</div>
              <div className="cl-w__stat-lbl">中西部合计</div>
            </div>
            <div className="cl-w__stat cl-w__stat--zero">
              <div className="cl-w__stat-num">{W1_DATA.emptyProvinces}</div>
              <div className="cl-w__stat-lbl">省份备案为 0</div>
            </div>
          </div>
          <div className="cl-w__quote">
            <span className="cl-w__hl">不是没有需求，是缺乏渠道和激励。</span>
            <br />
            AI 备案高度集中于沿海发达地区，中西部承接产业仍有巨大空间。
          </div>
        </div>
      </div>
    </div>
  );
}

function W1ProvinceChart() {
  // 横向条形：省份 → 备案占比
  const max = 30;
  return (
    <div className="cl-w1-bars">
      {W1_DATA.provinces.map((p, i) => {
        const isTop2 = i < 2;
        return (
          <div
            key={p.name}
            className="cl-w1-row"
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <div className="cl-w1-row__name">{p.name}</div>
            <div className="cl-w1-row__track">
              <div
                className={`cl-w1-row__fill ${isTop2 ? "cl-w1-row__fill--hot" : "cl-w1-row__fill--dim"}`}
                style={{ width: `${(p.pct / max) * 100}%` }}
              />
            </div>
            <div className={`cl-w1-row__val ${isTop2 ? "cl-w1-row__val--hot" : ""}`}>
              {p.pct}%
            </div>
          </div>
        );
      })}
      <div className="cl-w1-note">
        其余 23 省合计 ≈ 15% · 备案断崖式集中
      </div>
    </div>
  );
}

/* ── 短板二：传统行业渗透不足 ── */

const W2_DATA = {
  items: [
    { name: "ICT", pct: 42, color: "#FF6B4A" },
    { name: "科技服务", pct: 34, color: "#FFA94D" },
    { name: "金融", pct: 0.3, color: "#06D6A0" },
    { name: "制造", pct: 0.3, color: "#00D4FF" },
    { name: "教育", pct: 0.1, color: "#C792EA" },
    { name: "医疗", pct: 0.1, color: "#FFD166" },
    { name: "其他", pct: 23.2, color: "rgba(143,170,200,0.4)" },
  ],
  top2Sum: 76,
  bottomSum: 0.8,
};

function Weakness2() {
  return (
    <div className="cl-w">
      <div className="cl-w__header">
        <div className="cl-w__kicker">WEAKNESS · 02</div>
        <div className="cl-w__badge-row">
          <span className="cl-w__badge">短板二</span>
          <span className="cl-w__title">传统行业渗透不足</span>
        </div>
        <div className="cl-w__sub">
          ICT + 科技服务 占 76% · 制造/金融/教育 全部不到 0.5%
        </div>
      </div>

      <div className="cl-w__body">
        <div className="cl-w__panel cl-w__panel--donut">
          <div className="cl-w__panel-title">数据大屏现场 · 行业分布</div>
          <W2IndustryChart />
        </div>

        <div className="cl-w__panel cl-w__panel--insight">
          <div className="cl-w__panel-title">关键数字</div>
          <div className="cl-w__stats">
            <div className="cl-w__stat cl-w__stat--hot">
              <div className="cl-w__stat-num">76%</div>
              <div className="cl-w__stat-lbl">ICT + 科技服务</div>
            </div>
            <div className="cl-w__stat cl-w__stat--cold">
              <div className="cl-w__stat-num">0.3%</div>
              <div className="cl-w__stat-lbl">制造业备案</div>
            </div>
            <div className="cl-w__stat cl-w__stat--cold">
              <div className="cl-w__stat-num">0.1%</div>
              <div className="cl-w__stat-lbl">教育备案</div>
            </div>
          </div>
          <div className="cl-w__quote">
            不是说这些行业没用 AI——<span className="cl-w__hl">恰恰相反，说明他们的 AI 应用还游离在备案体系之外</span>。
            一片巨大的增量空间。
          </div>
        </div>
      </div>
    </div>
  );
}

function W2IndustryChart() {
  // 横向条形图
  const max = 45;
  return (
    <div className="cl-w2-bars">
      {W2_DATA.items.map((it, i) => {
        const isTop = i < 2;
        const isBottom = i >= 2 && i <= 5;
        return (
          <div
            key={it.name}
            className="cl-w2-row"
            style={{ animationDelay: `${0.1 + i * 0.08}s` }}
          >
            <div className="cl-w2-row__name">{it.name}</div>
            <div className="cl-w2-row__track">
              <div
                className="cl-w2-row__fill"
                style={{
                  width: `${Math.max((it.pct / max) * 100, 1.2)}%`,
                  background: it.color,
                }}
              />
            </div>
            <div
              className="cl-w2-row__val"
              style={{ color: isTop ? "#FF6B4A" : isBottom ? "#06D6A0" : "rgba(200,220,240,0.7)" }}
            >
              {it.pct}%
            </div>
          </div>
        );
      })}
      <div className="cl-w2-note">
        传统行业渗透率合计 <strong style={{ color: "#FF6B4A" }}>0.8%</strong> · 监管覆盖存在结构性盲区
      </div>
    </div>
  );
}

/* ── 短板三：备案脉冲剧烈 ── */

const W3_DATA = {
  // 按月份分布的备案量（季度合成，2022-2026）
  series: [
    { label: "22Q1", v: 5 },
    { label: "22Q2", v: 12 },
    { label: "22Q3", v: 28 },
    { label: "22Q4", v: 45 },
    { label: "23Q1", v: 78 },
    { label: "23Q2", v: 95 },
    { label: "23Q3", v: 132 },
    { label: "23Q4", v: 184 },
    { label: "24Q1", v: 562 }, // 政策出台脉冲
    { label: "24Q2", v: 478 },
    { label: "24Q3", v: 396 },
    { label: "24Q4", v: 412 },
    { label: "25Q1", v: 1180 }, // 加速备案
    { label: "25Q2", v: 920 },
    { label: "25Q3", v: 760 },
    { label: "25Q4", v: 685 },
    { label: "26Q1", v: 980 },
    { label: "26Q2", v: 658 },
  ],
  maxV: 1200,
  peakLabels: [
    { idx: 8, note: "《生成式人工智能服务管理暂行办法》施行" },
    { idx: 12, note: "新一批促进政策出台" },
  ],
};

function Weakness3() {
  return (
    <div className="cl-w">
      <div className="cl-w__header">
        <div className="cl-w__kicker">WEAKNESS · 03</div>
        <div className="cl-w__badge-row">
          <span className="cl-w__badge">短板三</span>
          <span className="cl-w__title">备案脉冲剧烈</span>
        </div>
        <div className="cl-w__sub">
          政策一出就扎堆 · 政策一明确就回落 · 大起大落浪费行政资源
        </div>
      </div>

      <div className="cl-w__body cl-w__body--chart">
        <div className="cl-w__panel cl-w__panel--wide">
          <div className="cl-w__panel-title">数据大屏现场 · 季度备案量趋势</div>
          <W3PulseChart />
        </div>
      </div>
    </div>
  );
}

function W3PulseChart() {
  // viewBox 1200 × 380
  const W = 1200;
  const H = 380;
  const padL = 50;
  const padR = 30;
  const padT = 30;
  const padB = 60;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const data = W3_DATA.series;
  const colW = innerW / data.length;
  const barW = colW * 0.7;
  const max = W3_DATA.maxV;

  // Y 轴刻度
  const ticks = [0, 300, 600, 900, 1200];

  return (
    <div className="cl-w3-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="cl-w3-svg">
        {/* Y 网格 */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={padT + innerH - (t / max) * innerH}
              y2={padT + innerH - (t / max) * innerH}
              stroke="rgba(143,170,200,0.1)"
              strokeWidth="1"
            />
            <text
              x={padL - 10}
              y={padT + innerH - (t / max) * innerH + 4}
              fill="rgba(143,170,200,0.5)"
              fontSize="11"
              textAnchor="end"
              fontFamily="var(--font-mono)"
            >
              {t}
            </text>
          </g>
        ))}

        {/* 柱 */}
        {data.map((d, i) => {
          const cx = padL + i * colW + (colW - barW) / 2;
          const ch = (d.v / max) * innerH;
          const cy = padT + innerH - ch;
          const isPeak = W3_DATA.peakLabels.some((p) => p.idx === i);
          return (
            <g key={d.label}>
              <rect
                x={cx}
                y={cy}
                width={barW}
                height={ch}
                rx="3"
                fill={isPeak ? "#FF6B4A" : "rgba(0, 212, 255, 0.6)"}
                className="cl-w3-bar"
                style={{ animationDelay: `${0.05 + i * 0.04}s` }}
              />
              <text
                x={cx + barW / 2}
                y={padT + innerH + 18}
                fill="rgba(200,220,240,0.5)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {d.label}
              </text>
              {isPeak && (
                <text
                  x={cx + barW / 2}
                  y={cy - 6}
                  fill="#FF6B4A"
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {d.v}
                </text>
              )}
            </g>
          );
        })}

        {/* 政策事件注释 */}
        {W3_DATA.peakLabels.map((p) => {
          const cx = padL + p.idx * colW + colW / 2;
          const ch = (data[p.idx].v / max) * innerH;
          const cy = padT + innerH - ch;
          return (
            <g key={p.note}>
              <line
                x1={cx}
                y1={cy - 12}
                x2={cx}
                y2={cy - 50}
                stroke="#FF6B4A"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={cx}
                y={cy - 56}
                fill="#FF6B4A"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                ⚡ 政策节点
              </text>
            </g>
          );
        })}
      </svg>

      <div className="cl-w3-takeaway">
        <div className="cl-w3-takeaway__item">
          <div className="cl-w3-takeaway__n">×235</div>
          <div className="cl-w3-takeaway__t">备案量极差比</div>
        </div>
        <div className="cl-w3-takeaway__sep" />
        <div className="cl-w3-takeaway__item">
          <div className="cl-w3-takeaway__n">2 次</div>
          <div className="cl-w3-takeaway__t">主要脉冲峰值</div>
        </div>
        <div className="cl-w3-takeaway__sep" />
        <div className="cl-w3-takeaway__item">
          <div className="cl-w3-takeaway__n">~30%</div>
          <div className="cl-w3-takeaway__t">峰值后回落幅度</div>
        </div>
      </div>
    </div>
  );
}

/* ── 短板四：巨头壁垒形成 ── */

const W4_DATA = {
  top3: [
    { name: "腾讯", v: 36, color: "#FF6B4A" },
    { name: "字节跳动", v: 28, color: "#FFA94D" },
    { name: "百度", v: 19, color: "#FFD166" },
  ],
  top3Sum: 48, // ~ 一半
  // 78% 企业只备 1 个算法
  singleRatio: 78.1,
  // 持续备案者占比下降: 2024 → 2026
  trend: [
    { year: "2023", v: 28 },
    { year: "2024", v: 20 },
    { year: "2025", v: 12 },
    { year: "2026", v: 6 },
  ],
};

function Weakness4() {
  return (
    <div className="cl-w">
      <div className="cl-w__header">
        <div className="cl-w__kicker">WEAKNESS · 04</div>
        <div className="cl-w__badge-row">
          <span className="cl-w__badge">短板四</span>
          <span className="cl-w__title">巨头壁垒正在形成</span>
        </div>
        <div className="cl-w__sub">
          3 家占近半 · 78% 企业只备 1 个 · 持续备案者比例逐年下降
        </div>
      </div>

      <div className="cl-w__body cl-w__body--three">
        {/* 左：Top 3 */}
        <div className="cl-w__panel">
          <div className="cl-w__panel-title">数据大屏现场 · Top 3 巨头</div>
          <W4Top3Chart />
        </div>

        {/* 中：78% 单点 */}
        <div className="cl-w__panel">
          <div className="cl-w__panel-title">企业结构</div>
          <div className="cl-w5-single">
            <div className="cl-w5-single__head">
              <div className="cl-w5-single__num">78.1%</div>
              <div className="cl-w5-single__lbl">企业只备案 1 个算法</div>
            </div>
            <svg viewBox="0 0 200 100" className="cl-w5-single__svg">
              <path
                d="M 20 90 A 60 60 0 1 1 180 90"
                fill="none"
                stroke="rgba(143,170,200,0.15)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20 90 A 60 60 0 0 1 158 47"
                fill="none"
                stroke="#FF6B4A"
                strokeWidth="14"
                strokeLinecap="round"
                className="cl-w5-arc"
                style={{ animationDelay: "0.3s" }}
              />
            </svg>
            <div className="cl-w5-single__rest">21.9% 备 ≥ 2 个</div>
          </div>
        </div>

        {/* 右：持续备案者下降 */}
        <div className="cl-w__panel">
          <div className="cl-w__panel-title">持续备案者占比 ↓</div>
          <W4TrendChart />
        </div>
      </div>
    </div>
  );
}

function W4Top3Chart() {
  const max = 40;
  return (
    <div className="cl-w5-top3">
      {W4_DATA.top3.map((c, i) => (
        <div
          key={c.name}
          className="cl-w5-top3-row"
          style={{ animationDelay: `${0.1 + i * 0.12}s` }}
        >
          <div className="cl-w5-top3-row__name">{c.name}</div>
          <div className="cl-w5-top3-row__track">
            <div
              className="cl-w5-top3-row__fill"
              style={{ width: `${(c.v / max) * 100}%`, background: c.color }}
            />
          </div>
          <div className="cl-w5-top3-row__val" style={{ color: c.color }}>
            {c.v}
          </div>
        </div>
      ))}
      <div className="cl-w5-top3-sum">
        合计 <strong>{W4_DATA.top3.reduce((s, c) => s + c.v, 0)} 条</strong> · 占总备案量 ≈ {W4_DATA.top3Sum}%
      </div>
    </div>
  );
}

function W4TrendChart() {
  const W = 360;
  const H = 160;
  const padL = 36;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const data = W4_DATA.trend;
  const max = 32;
  const x = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - (v / max) * innerH;

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.v)}`)
    .join(" ");

  return (
    <div className="cl-w5-trend">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="cl-w5-trend__svg">
        {/* 网格 */}
        {[0, 10, 20, 30].map((t) => (
          <line
            key={t}
            x1={padL}
            x2={W - padR}
            y1={y(t)}
            y2={y(t)}
            stroke="rgba(143,170,200,0.1)"
            strokeWidth="1"
          />
        ))}
        {/* 曲线 */}
        <path
          d={path}
          fill="none"
          stroke="#FF6B4A"
          strokeWidth="2.5"
          className="cl-w5-trend__line"
        />
        {/* 节点 */}
        {data.map((d, i) => (
          <g key={d.year}>
            <circle
              cx={x(i)}
              cy={y(d.v)}
              r="4"
              fill="#FF6B4A"
              className="cl-w5-trend__dot"
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            />
            <text
              x={x(i)}
              y={y(d.v) - 10}
              fill="rgba(255,107,74,0.95)"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {d.v}%
            </text>
            <text
              x={x(i)}
              y={H - 8}
              fill="rgba(200,220,240,0.6)"
              fontSize="10"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {d.year}
            </text>
          </g>
        ))}
      </svg>
      <div className="cl-w5-trend__note">
        4 年内从 28% 降至 6% · 长尾活跃度快速萎缩
      </div>
    </div>
  );
}

/* ── 总结：四个短板总览 ── */

function SummaryFrame() {
  const items = [
    { no: "01", title: "地域集聚严重", kpi: "50% / 5%", color: "#FF6B4A" },
    { no: "02", title: "传统行业渗透不足", kpi: "0.8% / 4 业", color: "#FFA94D" },
    { no: "03", title: "备案脉冲剧烈", kpi: "×235 极差", color: "#FFD166" },
    { no: "04", title: "巨头壁垒形成", kpi: "78% / 6%", color: "#00D4FF" },
  ];

  return (
    <div className="cl-summary">
      <div className="cl-summary__head">
        <div className="cl-summary__kicker">FOUR GAPS · 我国 AI 算法服务商</div>
        <h2 className="cl-summary__title">四个短板 · 四个抓手</h2>
        <div className="cl-summary__sub">
          行业视角：备案数据反映出的产业生态结构性问题
        </div>
      </div>

      <div className="cl-summary__grid">
        {items.map((it, i) => (
          <div
            key={it.no}
            className="cl-summary__card"
            style={
              {
                "--card-color": it.color,
                animationDelay: `${0.1 + i * 0.12}s`,
              } as React.CSSProperties
            }
          >
            <div className="cl-summary__card-no">{it.no}</div>
            <div className="cl-summary__card-title">{it.title}</div>
            <div className="cl-summary__card-kpi">{it.kpi}</div>
          </div>
        ))}
      </div>

      <div className="cl-summary__cta">下一章 · 给出四条政策建议 →</div>
    </div>
  );
}
