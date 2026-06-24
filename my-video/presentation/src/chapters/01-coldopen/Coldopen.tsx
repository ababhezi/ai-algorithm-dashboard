import "./Coldopen.css";

interface Props {
  step: number;
}

export function Coldopen({ step }: Props) {

  return (
    <div className="co-stage">
      {step === 0 && <HookScene />}
      {step === 1 && <StatsScene />}
      {step === 2 && <GrowthScene />}
      {step === 3 && <TransitionScene />}
    </div>
  );
}

function HookScene() {
  return (
    <div className="co-hook">
      <div className="co-hook__question">
        <span className="co-hook__line1">你猜，中国从2022年到今天，</span>
        <span className="co-hook__line2">一共备案了多少个</span>
        <span className="co-hook__line3">AI 算法？</span>
      </div>
      <div className="co-hook__cursor" />
    </div>
  );
}

function StatsScene() {
  return (
    <div className="co-stats">
      <div className="co-stats__label">截至2026年5月</div>
      <div className="co-stats__grid">
        <div className="co-stat co-stat--1">
          <span className="co-stat__number">8,008</span>
          <span className="co-stat__unit">条</span>
          <span className="co-stat__desc">备案总量</span>
        </div>
        <div className="co-stat co-stat--2">
          <span className="co-stat__number">5,333</span>
          <span className="co-stat__unit">家</span>
          <span className="co-stat__desc">独立企业</span>
        </div>
        <div className="co-stat co-stat--3">
          <span className="co-stat__number">127</span>
          <span className="co-stat__unit">座</span>
          <span className="co-stat__desc">覆盖城市</span>
        </div>
      </div>
    </div>
  );
}

function GrowthScene() {
  return (
    <div className="co-growth">
      <div className="co-growth__badge">三年 &times; 80</div>
      <div className="co-growth__main">
        <p>从几乎没人备，</p>
        <p>到现在每个月 <strong>几百条</strong> 备案。</p>
      </div>
      <div className="co-growth__map">
        <ChinaMapSilhouette />
      </div>
    </div>
  );
}

function TransitionScene() {
  const questions = [
    "地理分布是什么格局？",
    "2022-2026 发展态势有哪些特点？",
    "未来 3-5 年如何预测？",
    "当前发展有没有明显短板？",
  ];
  return (
    <div className="co-transition">
      <div className="co-transition__header">我们从四个问题出发</div>
      <div className="co-transition__list">
        {questions.map((q, i) => (
          <div key={i} className={`co-tq co-tq--${i + 1}`}>
            <span className="co-tq__num">0{i + 1}</span>
            <span className="co-tq__text">{q}</span>
          </div>
        ))}
      </div>
      <div className="co-transition__hint">点击继续 →</div>
    </div>
  );
}

function ChinaMapSilhouette() {
  return (
    <svg viewBox="0 0 800 600" className="co-map-svg" xmlns="http://www.w3.org/2000/svg">
      {/* Simplified China silhouette path */}
      <path
        className="co-map-silhouette"
        d="M580,120 L620,100 L660,110 L700,90 L720,120 L740,150 L730,180 L750,210 L740,240 L760,270 L750,300 L760,330 L750,360 L730,390 L710,420 L690,450 L660,480 L620,510 L580,530 L540,520 L500,500 L460,480 L420,490 L380,480 L340,460 L300,430 L270,390 L250,350 L240,310 L250,270 L240,230 L220,190 L200,150 L220,120 L260,100 L300,90 L340,80 L380,70 L420,80 L460,90 L500,100 L540,110 Z"
      />
      {/* Pulsing city dots */}
      {[
        [620, 200], [660, 240], [700, 280], [580, 320],
        [540, 360], [500, 340], [460, 300], [420, 260],
        [380, 300], [340, 340], [300, 300], [260, 260],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" className="co-city-dot" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
    </svg>
  );
}
