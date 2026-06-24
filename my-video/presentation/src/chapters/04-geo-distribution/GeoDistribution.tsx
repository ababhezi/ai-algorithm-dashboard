import "./GeoDistribution.css";

interface Props {
  step: number;
}

export function GeoDistribution({ step }: Props) {

  return (
    <div className="gd-stage">
      {step === 0 && <Q1Frame />}
      {step === 1 && <ProvinceStep />}
      {step === 2 && <CityStep />}
      {step === 3 && <ClusterStep />}
      {step === 4 && <JudgmentStep />}
    </div>
  );
}

function Q1Frame() {
  return (
    <div className="gd-qframe">
      <div className="gd-qframe__num">Q1</div>
      <div className="gd-qframe__text">我国人工智能算法服务商的<br />地理分布特征是什么？</div>
    </div>
  );
}

function ProvinceStep() {
  const provinces = [
    { name: "广东", pct: 26.6, abs: "2,132", color: "#ffd700" },
    { name: "北京", pct: 22.1, abs: "1,773", color: "#00d4ff" },
    { name: "浙江", pct: 12.6, abs: "1,006", color: "#00d4ff" },
    { name: "上海", pct: 12.0, abs: "963", color: "#00d4ff" },
    { name: "江苏", pct: 4.9, abs: "393", color: "rgba(0,212,255,0.5)" },
  ];
  return (
    <div className="gd-province">
      <div className="gd-province__header">省级分布 · Top5</div>
      <div className="gd-province__total">前四省份合计 <strong>73.3%</strong></div>
      <div className="gd-province__bars">
        {provinces.map((p, i) => (
          <div key={i} className="gd-prov-bar" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="gd-prov-bar__label">{p.name}</div>
            <div className="gd-prov-bar__track">
              <div
                className="gd-prov-bar__fill"
                style={{ width: `${p.pct * 3}%`, background: p.color }}
              />
            </div>
            <div className="gd-prov-bar__pct">{p.pct}%</div>
            <div className="gd-prov-bar__abs">{p.abs}条</div>
          </div>
        ))}
      </div>
      <div className="gd-province__cliff">第五名江苏 4.9% → 直接断崖</div>
    </div>
  );
}

function CityStep() {
  const cities = [
    { name: "北京", pct: 22.0 },
    { name: "深圳", pct: 12.7 },
    { name: "广州", pct: 12.1 },
    { name: "上海", pct: 12.1 },
    { name: "杭州", pct: 11.2 },
    { name: "成都", pct: 2.9 },
    { name: "南京", pct: 2.1 },
  ];
  return (
    <div className="gd-city">
      <div className="gd-city__header">城市分布 · Top7</div>
      <div className="gd-city__top5">
        <div className="gd-city__total">前五城合计 <strong>70%</strong></div>
        <div className="gd-city__ring">
          <svg viewBox="0 0 120 120" className="gd-ring-svg">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke="#ffd700" strokeWidth="10"
              strokeDasharray={`${70 * 3.14} ${314 - 70 * 3.14}`}
              strokeDashoffset="78"
              className="gd-ring-arc" />
          </svg>
          <div className="gd-ring-label">Top5<br />70%</div>
        </div>
      </div>
      <div className="gd-city__bars">
        {cities.map((c, i) => (
          <div key={i} className="gd-city-bar" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="gd-city-bar__name">{c.name}</span>
            <div className="gd-city-bar__track">
              <div className="gd-city-bar__fill" style={{ width: `${c.pct * 4}%` }} />
            </div>
            <span className="gd-city-bar__pct">{c.pct}%</span>
          </div>
        ))}
      </div>
      <div className="gd-city__insight">
        深圳(12.7%) 超 广州(12.1%) → AI硬件 + 出海应用产业优势
      </div>
    </div>
  );
}

function ClusterStep() {
  const clusters = [
    { name: "大湾区", pct: "~25%", cities: "深圳+广州双核", highlight: true },
    { name: "京津冀", pct: "~25%", cities: "北京单核驱动", highlight: false },
    { name: "长三角", pct: "~25%", cities: "上海+杭州+苏州均匀", highlight: false },
    { name: "成渝", pct: "~3%", cities: "西部唯一节点", highlight: false },
    { name: "中部城市群", pct: "~5%", cities: "涨但基数太小", highlight: false },
  ];
  return (
    <div className="gd-cluster">
      <div className="gd-cluster__header">五大经济区集群</div>
      <div className="gd-cluster__grid">
        {clusters.map((c, i) => (
          <div key={i} className={`gd-cluster-card ${c.highlight ? "gd-cluster-card--hl" : ""}`} style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="gd-cluster-card__name">{c.name}</div>
            <div className="gd-cluster-card__pct">{c.pct}</div>
            <div className="gd-cluster-card__cities">{c.cities}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JudgmentStep() {
  return (
    <div className="gd-judgment">
      <div className="gd-judgment__text">AI 不是遍地开花</div>
      <div className="gd-judgment__arrow">↓</div>
      <div className="gd-judgment__conclusion">
        高度扎堆在<br />
        <span className="gd-judgment__highlight">五个顶级城市群</span>
      </div>
      <div className="gd-judgment__sub">
        人才密度 · 资本密度 · 应用场景密度<br />
        三重因素驱动空间极化
      </div>
    </div>
  );
}
