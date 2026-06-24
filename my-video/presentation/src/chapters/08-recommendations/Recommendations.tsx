import type { CSSProperties } from "react";
import "./Recommendations.css";

interface Props {
  step: number;
}

/**
 * Chapter 8 · 对策建议
 *
 * Step 0 — 总览：4 条政策建议 vs 4 个行业短板
 * Step 1 — 建议一：打破地域集聚
 * Step 2 — 建议二：加速传统行业渗透
 * Step 3 — 建议三：建立备案与政策的联动响应机制
 * Step 4 — 建议四：扶持中小 AI 企业
 * Step 5 — 总结：四条政策建议总览
 */
export function Recommendations({ step }: Props) {
  return (
    <div className="rc-stage">
      {step === 0 && <OverviewStep />}
      {step === 1 && <Rec1Step />}
      {step === 2 && <Rec2Step />}
      {step === 3 && <Rec3Step />}
      {step === 4 && <Rec4Step />}
      {step === 5 && <SummaryStep />}
    </div>
  );
}

/* ── Step 0 · 总览 ── */

const OVERVIEW = [
  { no: "建议一", title: "打破地域集聚", target: "地域短板 50% / 5%", color: "#FF6B4A", icon: "🌐", action: "中西部设 AI 备案分中心" },
  { no: "建议二", title: "加速传统行业渗透", target: "行业渗透 0.8%", color: "#FFA94D", icon: "🏭", action: "制造/金融/医疗专项指引" },
  { no: "建议三", title: "熨平备案脉冲", target: "脉冲 ×235", color: "#FFD166", icon: "📅", action: "季度预告制度" },
  { no: "建议四", title: "扶持中小企业", target: "单点 78% / 巨头近半", color: "#00D4FF", icon: "🌱", action: "首次备案绿色通道" },
];

function OverviewStep() {
  return (
    <div className="rc-overview">
      <div className="rc-overview__header">
        <div className="rc-overview__kicker">RECOMMENDATIONS · 04</div>
        <h2 className="rc-overview__title">四条政策建议 · 对症四个短板</h2>
        <div className="rc-overview__sub">上一章我们看到四个行业短板：地域集聚、传统行业、备案脉冲、巨头壁垒。下面一一给出对策。</div>
      </div>
      <div className="rc-overview__grid">
        {OVERVIEW.map((o, i) => (
          <div key={o.no} className="rc-overview__card" style={{ "--rc-color": o.color, animationDelay: `${0.15 + i * 0.12}s` } as CSSProperties}>
            <div className="rc-overview__card-icon">{o.icon}</div>
            <div className="rc-overview__card-no">{o.no}</div>
            <div className="rc-overview__card-title">{o.title}</div>
            <div className="rc-overview__card-target">对症 · {o.target}</div>
            <div className="rc-overview__card-action">{o.action}</div>
          </div>
        ))}
      </div>
      <div className="rc-overview__arrow">对症 · 下药 →</div>
    </div>
  );
}

/* ── Step 1 · 打破地域集聚 ── */

const REC1 = {
  top2: 48.7, centralWest: 5,
  top2List: [{ name: "广东", v: 26.6 }, { name: "北京", v: 22.1 }],
  targetCities: [{ name: "成渝", color: "#FF6B4A" }, { name: "武汉", color: "#FFA94D" }, { name: "西安", color: "#FFD166" }],
  actions: [
    { icon: "🏛️", title: "属地化备案补贴", desc: "对中西部企业首次备案给予专项补贴与税收优惠" },
    { icon: "🏢", title: "节点城市设分中心", desc: "在成渝、武汉、西安建立 AI 备案分中心，把服务送到企业门口" },
    { icon: "🚚", title: "服务下沉替代扎堆", desc: "备案不必再跑广东，本地办理、本地审批、本地答疑" },
  ],
};

function Rec1Step() {
  return (
    <div className="rc-rec">
      <div className="rc-rec__head">
        <div className="rc-rec__kicker"><span className="rc-rec__kicker-no">建议一</span><span className="rc-rec__kicker-target">对症 · 短板一 地域集聚 50% / 5%</span></div>
        <h2 className="rc-rec__title">打破地域集聚，推动备案生态向中西部扩散</h2>
        <div className="rc-rec__sub">中西部不是没有需求，是缺乏渠道和激励——让备案服务跑到企业门口</div>
      </div>
      <div className="rc-rec__body">
        <div className="rc-rec__panel rc-rec__panel--diag">
          <div className="rc-rec__panel-title">数据大屏现场</div>
          <div className="rc-rec__bigmetric"><span className="rc-rec__bigmetric-num">{REC1.top2}%</span><span className="rc-rec__bigmetric-lbl">广东+北京 双核占比</span></div>
          <div className="rc-rec__compare">
            <div className="rc-rec__cmp-row"><div className="rc-rec__cmp-lbl">广东+北京</div><div className="rc-rec__cmp-bar"><div className="rc-rec__cmp-fill rc-rec__cmp-fill--hot" style={{ width: `${REC1.top2}%` }} /></div><div className="rc-rec__cmp-val" style={{ color: "#FF6B4A" }}>{REC1.top2}%</div></div>
            <div className="rc-rec__cmp-row"><div className="rc-rec__cmp-lbl">中西部合计</div><div className="rc-rec__cmp-bar"><div className="rc-rec__cmp-fill rc-rec__cmp-fill--cold" style={{ width: `${REC1.centralWest * 4}%` }} /></div><div className="rc-rec__cmp-val" style={{ color: "#06D6A0" }}>&lt;{REC1.centralWest}%</div></div>
          </div>
          <div className="rc-rec__map-note"><div className="rc-rec__map-note__lbl">节点城市布局</div><div className="rc-rec__map-note__cities">{REC1.targetCities.map((c) => (<span key={c.name} className="rc-rec__city-tag" style={{ color: c.color, borderColor: c.color }}>{c.name}</span>))}</div></div>
        </div>
        <div className="rc-rec__panel rc-rec__panel--action">
          <div className="rc-rec__panel-title">建议动作</div>
          <div className="rc-rec__actions">{REC1.actions.map((a, i) => (<div key={a.title} className="rc-action-card" style={{ animationDelay: `${0.5 + i * 0.15}s` }}><div className="rc-action-card__icon">{a.icon}</div><div className="rc-action-card__body"><div className="rc-action-card__title">{a.title}</div><div className="rc-action-card__desc">{a.desc}</div></div></div>))}</div>
        </div>
      </div>
      <div className="rc-rec__flow"><div className="rc-rec__flow-node rc-rec__flow-node--hot">沿海双核 50%<small>资源过度集中</small></div><span className="rc-rec__flow-arrow">→</span><div className="rc-rec__flow-node rc-rec__flow-node--policy">分中心 + 属地补贴<small>服务下沉到节点城市</small></div><span className="rc-rec__flow-arrow">→</span><div className="rc-rec__flow-node rc-rec__flow-node--balanced">中西部接棒<small>备案生态扩散</small></div></div>
    </div>
  );
}

/* ── Step 2 · 加速传统行业渗透 ── */

const REC2 = {
  top2: 76, bottom: 0.8,
  items: [{ name: "ICT", v: 42, color: "#FF6B4A" }, { name: "科技服务", v: 34, color: "#FFA94D" }, { name: "金融", v: 0.3, color: "#06D6A0" }, { name: "制造", v: 0.3, color: "#00D4FF" }, { name: "教育", v: 0.1, color: "#C792EA" }, { name: "医疗", v: 0.1, color: "#FFD166" }],
  targetIndustries: ["制造", "金融", "医疗"],
  actions: [
    { icon: "📑", title: "行业专项备案指引", desc: "针对制造、金融、医疗出台专项备案指引，给出明确合规路径" },
    { icon: "🔍", title: "监管覆盖增量空间", desc: "把这片游离在备案体系之外的 AI 应用纳入监管范围" },
    { icon: "💼", title: "降低传统行业准入门槛", desc: "为非 ICT 行业设立差异化合规要求，鼓励申报" },
  ],
};

function Rec2Step() {
  const max = 45;
  return (
    <div className="rc-rec">
      <div className="rc-rec__head">
        <div className="rc-rec__kicker"><span className="rc-rec__kicker-no">建议二</span><span className="rc-rec__kicker-target">对症 · 短板二 传统行业渗透 0.8%</span></div>
        <h2 className="rc-rec__title">加速传统行业渗透，释放第二增长极</h2>
        <div className="rc-rec__sub">制造、金融、教育、医疗——把它们从备案体系外拉回到体系内</div>
      </div>
      <div className="rc-rec__body">
        <div className="rc-rec__panel rc-rec__panel--diag">
          <div className="rc-rec__panel-title">数据大屏现场 · 行业分布</div>
          <div className="rc-rec__bigmetric"><span className="rc-rec__bigmetric-num">{REC2.top2}%</span><span className="rc-rec__bigmetric-lbl">ICT + 科技服务</span><span className="rc-rec__bigmetric-vs">vs</span><span className="rc-rec__bigmetric-num rc-rec__bigmetric-num--cold" style={{ fontSize: "2.4rem" }}>{REC2.bottom}%</span><span className="rc-rec__bigmetric-lbl">制造/金融/教育/医疗</span></div>
          <div className="rc-rec__ind-bars">{REC2.items.map((it, i) => { const isTop = i < 2; const isBottom = i >= 2; return (<div key={it.name} className="rc-rec__ind-row" style={{ animationDelay: `${0.3 + i * 0.06}s` }}><div className="rc-rec__ind-name">{it.name}</div><div className="rc-rec__ind-track"><div className="rc-rec__ind-fill" style={{ width: `${Math.max((it.v / max) * 100, 1.2)}%`, background: it.color }} /></div><div className="rc-rec__ind-val" style={{ color: isTop ? "#FF6B4A" : isBottom ? "#06D6A0" : "rgba(200,220,240,0.7)" }}>{it.v}%</div></div>); })}</div>
        </div>
        <div className="rc-rec__panel rc-rec__panel--action">
          <div className="rc-rec__panel-title">建议动作</div>
          <div className="rc-rec__actions">{REC2.actions.map((a, i) => (<div key={a.title} className="rc-action-card" style={{ animationDelay: `${0.5 + i * 0.15}s` }}><div className="rc-action-card__icon">{a.icon}</div><div className="rc-action-card__body"><div className="rc-action-card__title">{a.title}</div><div className="rc-action-card__desc">{a.desc}</div></div></div>))}</div>
          <div className="rc-tech-tags"><div className="rc-tech-tags__title">重点渗透行业</div><div className="rc-tech-tags__list">{REC2.targetIndustries.map((t, i) => (<span key={t} className="rc-tech-tag" style={{ "--tag-color": "#FFA94D", animationDelay: `${0.8 + i * 0.08}s` } as CSSProperties}>{t}</span>))}</div></div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3 · 熨平备案脉冲 ── */

const REC3 = {
  series: [
    { label: "22Q1", v: 5 }, { label: "22Q2", v: 12 }, { label: "22Q3", v: 28 }, { label: "22Q4", v: 45 },
    { label: "23Q1", v: 78 }, { label: "23Q2", v: 95 }, { label: "23Q3", v: 132 }, { label: "23Q4", v: 184 },
    { label: "24Q1", v: 562, peak: true }, { label: "24Q2", v: 478 }, { label: "24Q3", v: 396 }, { label: "24Q4", v: 412 },
    { label: "25Q1", v: 1180, peak: true }, { label: "25Q2", v: 920 }, { label: "25Q3", v: 760 }, { label: "25Q4", v: 685 },
    { label: "26Q1", v: 980 }, { label: "26Q2", v: 658 },
  ],
  maxV: 1200,
  peakNotes: [
    { idx: 8, note: "《生成式人工智能服务管理暂行办法》施行" },
    { idx: 12, note: "新一批促进政策出台" },
  ],
  actions: [
    { icon: "📅", title: "季度预告制度", desc: "提前告诉企业下一批时间与侧重点，让企业合理安排节奏" },
    { icon: "📊", title: "批次受理均衡化", desc: "通过申报预审与材料辅导，错峰提交，避免扎堆" },
    { icon: "🔁", title: "数据公开节拍化", desc: "把备案节奏变成可预期的政策信号，平滑行业判断" },
  ],
};

function Rec3Step() {
  return (
    <div className="rc-rec">
      <div className="rc-rec__head">
        <div className="rc-rec__kicker"><span className="rc-rec__kicker-no">建议三</span><span className="rc-rec__kicker-target">对症 · 短板三 备案脉冲 ×235</span></div>
        <h2 className="rc-rec__title">建立备案与政策的联动响应机制，熨平备案脉冲</h2>
        <div className="rc-rec__sub">让企业不必在扎堆与观望之间二选一</div>
      </div>
      <div className="rc-rec__body rc-rec__body--chart">
        <div className="rc-rec__panel rc-rec__panel--diag rc-rec__panel--wide">
          <div className="rc-rec__panel-title">数据大屏现场 · 季度备案量趋势</div>
          <Rec3PulseChart />
        </div>
      </div>
      <div className="rc-rec__body rc-rec__body--actions-row">
        <div className="rc-rec__panel rc-rec__panel--action">
          <div className="rc-rec__panel-title">建议动作</div>
          <div className="rc-rec__actions">{REC3.actions.map((a, i) => (<div key={a.title} className="rc-action-card" style={{ animationDelay: `${0.5 + i * 0.15}s` }}><div className="rc-action-card__icon">{a.icon}</div><div className="rc-action-card__body"><div className="rc-action-card__title">{a.title}</div><div className="rc-action-card__desc">{a.desc}</div></div></div>))}</div>
        </div>
      </div>
      <div className="rc-rec__flow"><div className="rc-rec__flow-node rc-rec__flow-node--hot">政策一出来<small>扎堆备案</small></div><span className="rc-rec__flow-arrow">→</span><div className="rc-rec__flow-node rc-rec__flow-node--policy">季度预告 + 错峰<small>企业合理安排节奏</small></div><span className="rc-rec__flow-arrow">→</span><div className="rc-rec__flow-node rc-rec__flow-node--balanced">备案稳态化<small>资源不再大起大落</small></div></div>
    </div>
  );
}

function Rec3PulseChart() {
  const W = 1200; const H = 350;
  const padL = 50; const padR = 30; const padT = 24; const padB = 56;
  const innerW = W - padL - padR; const innerH = H - padT - padB;
  const data = REC3.series;
  const colW = innerW / data.length;
  const barW = colW * 0.7;
  const max = REC3.maxV;
  const ticks = [0, 300, 600, 900, 1200];
  return (
    <div className="rc-w3-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="rc-w3-svg">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={padT + innerH - (t / max) * innerH} y2={padT + innerH - (t / max) * innerH} stroke="rgba(143,170,200,0.1)" strokeWidth="1" />
            <text x={padL - 10} y={padT + innerH - (t / max) * innerH + 4} fill="rgba(143,170,200,0.5)" fontSize="11" textAnchor="end" fontFamily="var(--font-mono)">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + i * colW + (colW - barW) / 2;
          const ch = (d.v / max) * innerH;
          const cy = padT + innerH - ch;
          const isPeak = REC3.peakNotes.some((p) => p.idx === i);
          return (
            <g key={d.label}>
              <rect x={cx} y={cy} width={barW} height={ch} rx="3" fill={isPeak ? "#FF6B4A" : "rgba(0, 212, 255, 0.6)"} className="rc-w3-bar" style={{ animationDelay: `${0.05 + i * 0.04}s` }} />
              <text x={cx + barW / 2} y={padT + innerH + 16} fill="rgba(200,220,240,0.5)" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">{d.label}</text>
              {isPeak && (<text x={cx + barW / 2} y={cy - 6} fill="#FF6B4A" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">{d.v}</text>)}
            </g>
          );
        })}
        {REC3.peakNotes.map((p) => {
          const cx = padL + p.idx * colW + colW / 2;
          const ch = (data[p.idx].v / max) * innerH;
          const cy = padT + innerH - ch;
          return (
            <g key={p.note}>
              <line x1={cx} y1={cy - 12} x2={cx} y2={cy - 48} stroke="#FF6B4A" strokeWidth="1" strokeDasharray="3 3" />
              <text x={cx} y={cy - 54} fill="#FF6B4A" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">⚡ 政策节点</text>
            </g>
          );
        })}
      </svg>
      <div className="rc-w3-takeaway">
        <div className="rc-w3-takeaway__item"><div className="rc-w3-takeaway__n">×235</div><div className="rc-w3-takeaway__t">备案量极差比</div></div>
        <div className="rc-w3-takeaway__sep" />
        <div className="rc-w3-takeaway__item"><div className="rc-w3-takeaway__n">2 次</div><div className="rc-w3-takeaway__t">主要脉冲峰值</div></div>
        <div className="rc-w3-takeaway__sep" />
        <div className="rc-w3-takeaway__item"><div className="rc-w3-takeaway__n">~30%</div><div className="rc-w3-takeaway__t">峰值后回落幅度</div></div>
      </div>
    </div>
  );
}

/* ── Step 4 · 扶持中小 AI 企业 ── */

const REC4 = {
  single: 78.1,
  top3: 48,
  top3List: [{ name: "腾讯", v: 36, color: "#FF6B4A" }, { name: "字节跳动", v: 28, color: "#FFA94D" }, { name: "百度", v: 19, color: "#FFD166" }],
  trend: [{ year: "2023", v: 28 }, { year: "2024", v: 20 }, { year: "2025", v: 12 }, { year: "2026", v: 6 }],
  actions: [
    { icon: "🚪", title: "首次备案绿色通道", desc: "对中小 AI 企业首次备案简化流程、缩短审核周期" },
    { icon: "💸", title: "材料补贴", desc: "为中小企业提供合规材料编制补贴，降低申报成本" },
    { icon: "⭐", title: "多算法优先审批", desc: "对备案 ≥ 3 个算法的企业给予优先审批，鼓励持续投入" },
  ],
};

function Rec4Step() {
  return (
    <div className="rc-rec">
      <div className="rc-rec__head">
        <div className="rc-rec__kicker"><span className="rc-rec__kicker-no">建议四</span><span className="rc-rec__kicker-target">对症 · 短板四 单点 78% / 巨头近半</span></div>
        <h2 className="rc-rec__title">扶持中小 AI 企业，防止行业壁垒加速形成</h2>
        <div className="rc-rec__sub">让行业生态保持开放，而不是逐渐被巨头锁死</div>
      </div>
      <div className="rc-rec__body rc-rec__body--three">
        <div className="rc-rec__panel rc-rec__panel--diag">
          <div className="rc-rec__panel-title">数据大屏现场 · Top 3 巨头</div>
          <div className="rc-rec__top3">{REC4.top3List.map((c, i) => (<div key={c.name} className="rc-rec__top3-row" style={{ animationDelay: `${0.3 + i * 0.1}s` }}><div className="rc-rec__top3-name">{c.name}</div><div className="rc-rec__top3-track"><div className="rc-rec__top3-fill" style={{ width: `${(c.v / 40) * 100}%`, background: c.color }} /></div><div className="rc-rec__top3-val" style={{ color: c.color }}>{c.v}</div></div>))}<div className="rc-rec__top3-sum">合计 ≈ <strong style={{ color: "#FF6B4A" }}>{REC4.top3}%</strong> · 头部效应明显</div></div>
        </div>
        <div className="rc-rec__panel rc-rec__panel--diag">
          <div className="rc-rec__panel-title">企业结构</div>
          <div className="rc-w5-single">
            <div className="rc-w5-single__head">
              <div className="rc-w5-single__num">{REC4.single}%</div>
              <div className="rc-w5-single__lbl">企业只备案 1 个算法</div>
            </div>
            <svg viewBox="0 0 200 95" className="rc-w5-single__svg">
              <path d="M 20 85 A 65 65 0 1 1 180 85" fill="none" stroke="rgba(143,170,200,0.15)" strokeWidth="14" strokeLinecap="round" />
              <path d="M 20 85 A 65 65 0 0 1 165.5 40" fill="none" stroke="#00D4FF" strokeWidth="14" strokeLinecap="round" className="rc-w5-arc" style={{ animationDelay: "0.3s" }} />
            </svg>
            <div className="rc-w5-single__rest">21.9% 备 ≥ 2 个</div>
          </div>
        </div>
        <div className="rc-rec__panel rc-rec__panel--diag">
          <div className="rc-rec__panel-title">持续备案者占比 ↓</div>
          <SME_TrendChart />
        </div>
      </div>
      <div className="rc-rec__body rc-rec__body--actions-row">
        <div className="rc-rec__panel rc-rec__panel--action">
          <div className="rc-rec__panel-title">建议动作</div>
          <div className="rc-rec__actions">{REC4.actions.map((a, i) => (<div key={a.title} className="rc-action-card" style={{ animationDelay: `${0.5 + i * 0.15}s` }}><div className="rc-action-card__icon">{a.icon}</div><div className="rc-action-card__body"><div className="rc-action-card__title">{a.title}</div><div className="rc-action-card__desc">{a.desc}</div></div></div>))}</div>
        </div>
      </div>
    </div>
  );
}

function SME_TrendChart() {
  const W = 360; const H = 160; const padL = 36; const padR = 12; const padT = 14; const padB = 28;
  const innerW = W - padL - padR; const innerH = H - padT - padB;
  const data = REC4.trend; const maxV = 32;
  const x = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + innerH - (v / maxV) * innerH;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.v)}`).join(" ");
  return (<div className="rc-w5-trend"><svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="rc-w5-trend__svg">{[0, 10, 20, 30].map((t) => (<line key={t} x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="rgba(143,170,200,0.1)" strokeWidth="1" />))}<path d={path} fill="none" stroke="#00D4FF" strokeWidth="2.5" className="rc-w5-trend__line" />{data.map((d, i) => (<g key={d.year}><circle cx={x(i)} cy={y(d.v)} r="4" fill="#00D4FF" className="rc-w5-trend__dot" style={{ animationDelay: `${0.3 + i * 0.15}s` }} /><text x={x(i)} y={y(d.v) - 10} fill="rgba(0,212,255,0.95)" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">{d.v}%</text><text x={x(i)} y={H - 8} fill="rgba(200,220,240,0.6)" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">{d.year}</text></g>))}</svg><div className="rc-w5-trend__note">4 年内从 28% 降至 6% · 长尾活跃度快速萎缩</div></div>);
}

/* ── Step 5 · 总结 ── */

const SUMMARY = [
  { no: "01", title: "打破地域集聚", kpi: "成渝/武汉/西安", color: "#FF6B4A" },
  { no: "02", title: "加速传统行业渗透", kpi: "制造/金融/医疗", color: "#FFA94D" },
  { no: "03", title: "熨平备案脉冲", kpi: "季度预告制度", color: "#FFD166" },
  { no: "04", title: "扶持中小企业", kpi: "绿色通道 + 补贴", color: "#00D4FF" },
];

function SummaryStep() {
  return (
    <div className="rc-summary">
      <div className="rc-summary__head">
        <div className="rc-summary__kicker">FOUR POLICIES · 政策建议总览</div>
        <h2 className="rc-summary__title">四条政策建议 · 对症四个短板</h2>
        <div className="rc-summary__sub">数据驱动的政策闭环：从产业洞察到结构性对策</div>
      </div>
      <div className="rc-summary__grid">{SUMMARY.map((it, i) => (<div key={it.no} className="rc-summary__card" style={{ "--card-color": it.color, animationDelay: `${0.1 + i * 0.12}s` } as CSSProperties}><div className="rc-summary__card-no">{it.no}</div><div className="rc-summary__card-title">{it.title}</div><div className="rc-summary__card-kpi">{it.kpi}</div></div>))}</div>
      <div className="rc-summary__cta">以上就是我们小组对 AI 算法服务商的全部成果汇报 · 谢谢各位评审老师</div>
    </div>
  );
}
