import "./Background.css";

interface Props {
  step: number;
}

export function Background({ step }: Props) {

  return (
    <div className="bg-stage">
      {step === 0 && <IntroStep />}
      {step === 1 && <DirtyDataStep />}
      {step === 2 && <CleaningStep />}
      {step === 3 && <TransitionStep />}
    </div>
  );
}

function IntroStep() {
  return (
    <div className="bg-intro">
      <div className="bg-intro__icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#ffd700" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M20 32 L28 40 L44 24" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="32" y1="10" x2="32" y2="54" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
          <line x1="10" y1="32" x2="54" y2="32" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
        </svg>
      </div>
      <div className="bg-intro__text">数据清洗与预处理</div>
      <div className="bg-intro__sub">我们做的第一件事</div>
    </div>
  );
}

function DirtyDataStep() {
  const issues = [
    { label: "省份字段", before: '"北京" / "北京市" / "北京海淀"', icon: "province" },
    { label: "城市字段", before: '"深圳" / "深圳市" / "深圳特区"', icon: "city" },
    { label: "算法类别", before: "10% 填了「服务提供者」", icon: "algo", after: "→ 填错列" },
    { label: "行业字段", before: "缺失率 12%", icon: "industry" },
  ];
  return (
    <div className="bg-dirty">
      <div className="bg-dirty__header">原始数据质量——问题一览</div>
      <div className="bg-dirty__grid">
        {issues.map((item, i) => (
          <div key={i} className={`bg-issue bg-issue--${i + 1}`}>
            <div className="bg-issue__label">{item.label}</div>
            <div className="bg-issue__before">{item.before}</div>
            {item.after && <div className="bg-issue__after">{item.after}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CleaningStep() {
  const actions = [
    { title: "映射表归一化", desc: "统一省份、城市写法，去除\"市\"后缀，统一占位符", color: "#00d4ff" },
    { title: "LLM 字段修正", desc: "用 LLM 修正版覆盖被污染的算法类别字段", color: "#ffd700" },
    { title: "缺失率标注", desc: "行业 12% / 技术代际 7.5% / 省份 2.7%", color: "#ff8c00" },
  ];
  return (
    <div className="bg-clean">
      <div className="bg-clean__header">我们做了什么</div>
      <div className="bg-clean__list">
        {actions.map((a, i) => (
          <div key={i} className="bg-action" style={{ animationDelay: `${i * 0.2}s` }}>
            <div className="bg-action__bar" style={{ background: a.color }} />
            <div className="bg-action__content">
              <div className="bg-action__title">{a.title}</div>
              <div className="bg-action__desc">{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-clean__caveat">
        <span className="bg-clean__caveat-icon">⚠</span>
        所有结论需加前缀「在有效样本范围内」
      </div>
    </div>
  );
}

function TransitionStep() {
  const questions = [
    "Q1：地理分布是什么格局？",
    "Q2：2022-2026 发展态势有哪些特点？",
    "Q3：未来 3-5 年如何预测？",
    "Q4：当前发展有没有明显短板？",
  ];
  return (
    <div className="bg-transition">
      <div className="bg-transition__text">数据洗干净了。</div>
      <div className="bg-transition__sub">我们从四个问题出发，开始分析。</div>
      <div className="bg-transition__grid">
        {questions.map((q, i) => (
          <div key={i} className={`bg-qcard bg-qcard--${i + 1}`}>
            {q}
          </div>
        ))}
      </div>
    </div>
  );
}
