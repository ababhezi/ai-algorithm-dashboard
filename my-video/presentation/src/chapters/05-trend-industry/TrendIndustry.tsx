import "./TrendIndustry.css";

interface Props {
  step: number;
}

export function TrendIndustry({ step }: Props) {

  return (
    <div className="ti-stage">
      {step === 0 && <Q2Frame />}
      {step === 1 && <TimeTrendStep />}
      {step === 2 && <AccelStep />}
      {step === 3 && <IndustryStep />}
      {step === 4 && <TechGenStep />}
      {step === 5 && <TrendJudgment />}
    </div>
  );
}

function Q2Frame() {
  return (
    <div className="ti-qframe">
      <div className="ti-qframe__num">Q2</div>
      <div className="ti-qframe__text">2022-2026年备案AI算法服务商<br />发展态势有哪些显著特点？</div>
    </div>
  );
}

function TimeTrendStep() {
  // Simulated sparkline data for the growth curve
  const dataPoints = [
    { m: "22.1", v: 3 }, { m: "22.4", v: 8 }, { m: "22.7", v: 15 },
    { m: "23.1", v: 22 }, { m: "23.4", v: 40 }, { m: "23.7", v: 55 },
    { m: "24.1", v: 85 }, { m: "24.4", v: 120 }, { m: "24.7", v: 95 },
    { m: "25.1", v: 180 }, { m: "25.4", v: 320 }, { m: "25.7", v: 450 },
    { m: "25.10", v: 580 }, { m: "26.1", v: 620 }, { m: "26.4", v: 637 },
  ];
  const maxV = 637;
  const W = 700, H = 200;
  const pts = dataPoints.map((d, i) => ({
    x: (i / (dataPoints.length - 1)) * W,
    y: H - (d.v / maxV) * H,
    m: d.m,
    v: d.v,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="ti-trend">
      <div className="ti-trend__header">月度备案总量走势（2022.1 → 2026.4）</div>
      <div className="ti-trend__chart">
        <svg viewBox={`0 0 ${W} ${H + 40}`} className="ti-svg-chart">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="0" y1={i * H / 4} x2={W} y2={i * H / 4}
              stroke="rgba(0,212,255,0.1)" strokeDasharray="4 4" />
          ))}
          {/* Area fill */}
          <path d={`${pathD} L ${W} ${H} L 0 ${H} Z`} fill="url(#areaGrad)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke="#00d4ff" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            className="ti-chart-line" />
          {/* Dots */}
          {pts.filter((_, i) => i % 3 === 0).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ffd700" />
          ))}
          {/* Key annotations */}
          <text x={pts[2].x} y={pts[2].y - 12} fill="#ffd700" fontSize="11">15条</text>
          <text x={pts[8].x - 20} y={pts[8].y - 12} fill="#ff8c00" fontSize="11">95条(V形底)</text>
          <text x={pts[14].x - 30} y={pts[14].y - 14} fill="#ffd700" fontSize="12" fontWeight="700">637条</text>
        </svg>
        <div className="ti-trend__labels">
          <span>2022.1</span><span>2023.1</span><span>2024.1</span><span>2025.1</span><span>2026.4</span>
        </div>
      </div>
      <div className="ti-trend__annotations">
        <span className="ti-tag ti-tag--green">强V形走势</span>
        <span className="ti-tag ti-tag--orange">2024.7 V形底：95条</span>
        <span className="ti-tag ti-tag--gold">2026.4 峰：637条</span>
      </div>
    </div>
  );
}

function AccelStep() {
  const stages = [
    { year: "2023", avg: 59, color: "#00d4ff" },
    { year: "2024", avg: 129, color: "#ffd700" },
    { year: "2025", avg: 276, color: "#ff8c00" },
  ];
  return (
    <div className="ti-accel">
      <div className="ti-accel__header">月度增速台阶</div>
      <div className="ti-accel__bars">
        {stages.map((s, i) => (
          <div key={i} className="ti-accel-bar" style={{ animationDelay: `${i * 0.2}s` }}>
            <div className="ti-accel-bar__year">{s.year}年</div>
            <div className="ti-accel-bar__track">
              <div className="ti-accel-bar__fill" style={{ width: `${(s.avg / 276) * 100}%`, background: s.color }} />
            </div>
            <div className="ti-accel-bar__val">{s.avg}条/月</div>
          </div>
        ))}
      </div>
      <div className="ti-accel__label">
        <div className="ti-accel__mul">×2.2</div>
        <div className="ti-accel__mul">×2.1</div>
      </div>
      <div className="ti-accel__insight">每年翻倍以上，三年三个台阶</div>
    </div>
  );
}

function IndustryStep() {
  const industries = [
    { name: "互联网", pct: 32.0, color: "#ffd700" },
    { name: "IT制造", pct: 21.0, color: "#00d4ff" },
    { name: "信息技术服务", pct: 14.0, color: "#00d4ff" },
    { name: "其他300+行业", pct: 33.0, color: "rgba(0,212,255,0.3)" },
  ];
  return (
    <div className="ti-industry">
      <div className="ti-industry__header">行业分布</div>
      <div className="ti-industry__donut">
        <svg viewBox="0 0 200 200" className="ti-donut-svg">
          {(() => {
            const total = 100;
            let cumsum = 0;
            return industries.map((ind, i) => {
              const angle = (ind.pct / total) * 360;
              const startAngle = cumsum;
              cumsum += angle;
              const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 100 + 80 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
              const y2 = 100 + 80 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
              const large = angle > 180 ? 1 : 0;
              return <path key={i} d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${large} 1 ${x2} ${y2} Z`}
                fill={ind.color} opacity="0.85" />;
            });
          })()}
          <circle cx="100" cy="100" r="45" fill="#030b18" />
          <text x="100" y="95" textAnchor="middle" fill="rgba(200,220,240,0.6)" fontSize="10">Top3</text>
          <text x="100" y="112" textAnchor="middle" fill="#ffd700" fontSize="13" fontWeight="700">67%</text>
        </svg>
      </div>
      <div className="ti-industry__legend">
        {industries.map((ind, i) => (
          <div key={i} className="ti-ind-item">
            <div className="ti-ind-dot" style={{ background: ind.color }} />
            <span className="ti-ind-name">{ind.name}</span>
            <span className="ti-ind-pct">{ind.pct}%</span>
          </div>
        ))}
      </div>
      <div className="ti-industry__insight">前三行业占67%，高度集中</div>
    </div>
  );
}

function TechGenStep() {
  const gens = [
    { name: "第四代 Agent", pct: 9.6, color: "#b464ff" },
    { name: "多模型组合", pct: 10.7, color: "#ffd700" },
    { name: "第三代 Transformer", pct: 75.0, color: "#00d4ff" },
    { name: "第二代 传统ML", pct: 9.7, color: "rgba(0,212,255,0.4)" },
    { name: "第一代 专家规则", pct: 2.7, color: "rgba(0,212,255,0.15)" },
  ];
  return (
    <div className="ti-tech">
      <div className="ti-tech__header">技术代际分布</div>
      <div className="ti-tech__bars">
        {gens.map((g, i) => (
          <div key={i} className="ti-tech-bar" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="ti-tech-bar__info">
              <span className="ti-tech-bar__name">{g.name}</span>
              <span className="ti-tech-bar__pct" style={{ color: g.color }}>{g.pct}%</span>
            </div>
            <div className="ti-tech-bar__track">
              <div className="ti-tech-bar__fill" style={{ width: `${g.pct * 0.95}%`, background: g.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="ti-tech__insight">
        第三代Transformer占75% → 生成式AI已全面主导
      </div>
    </div>
  );
}

function TrendJudgment() {
  const points = ["数量加速增长", "行业高度集中", "技术代际全面升级"];
  return (
    <div className="ti-judgment">
      <div className="ti-judgment__text">三大特点叠加</div>
      <div className="ti-judgment__cards">
        {points.map((p, i) => (
          <div key={i} className="ti-judge-card" style={{ animationDelay: `${i * 0.15}s` }}>
            {p}
          </div>
        ))}
      </div>
      <div className="ti-judgment__conclusion">
        AI算法服务商正在经历<br />
        <span className="ti-judgment__highlight">规模化洗牌</span>
      </div>
    </div>
  );
}
