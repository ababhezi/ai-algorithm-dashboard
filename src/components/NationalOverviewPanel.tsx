interface NationalOverviewPanelProps {
  totalFilings: number;
  totalCompanies: number;
  top4ShareValue: number;
  contentGenShareValue: number;
  overviewCategoryShares: { label: string; value: number }[];
  onOpenAlgorithm: () => void;
}

const NEWS_ITEMS = [
  {
    id: 1,
    title: '国家网信办发布第17批深度合成服务算法备案信息',
    source: '国家网信办',
    date: '2026-05-28',
    tag: '政策'
  },
  {
    id: 2,
    title: '重点省市算法备案继续向多场景、多行业扩散',
    source: '项目数据观察',
    date: '2026-05-22',
    tag: '区域'
  },
  {
    id: 3,
    title: '内容生成类备案仍是当前主导结构',
    source: '项目数据观察',
    date: '2026-05-15',
    tag: '趋势'
  }
];

const STAGE_ITEMS = [
  { year: '2022', label: '合规启动' },
  { year: '2023', label: 'AIGC 启动' },
  { year: '2024', label: '集中爆发', active: true },
  { year: '2025', label: '增量扩散' },
  { year: '2026', label: '高位运行' }
];

const TAG_COLOR: Record<string, string> = {
  政策: '#F5A623',
  区域: '#56C5FF',
  趋势: '#30C48D',
  企业: '#B98EFF'
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(Math.round(value));
}

export function NationalOverviewPanel({
  totalFilings,
  totalCompanies,
  top4ShareValue,
  contentGenShareValue,
  overviewCategoryShares,
  onOpenAlgorithm
}: NationalOverviewPanelProps) {
  return (
    <section className="panel panel--detail-portrait panel--overview-portrait national-overview">
      <div className="overview-header">
        <div className="overview-title">热点新闻</div>
        <div className="overview-subtitle">围绕当前备案结构的快速提示</div>
      </div>

      <div className="hot-news__feed hot-news__feed--compact">
        {NEWS_ITEMS.map((item) => (
          <article key={item.id} className="hot-news__card hot-news__card--compact" style={{ borderLeftColor: TAG_COLOR[item.tag] ?? '#6F8BAB' }}>
            <div className="hot-news__head">
              <span className="hot-news__tag" style={{ color: TAG_COLOR[item.tag], background: `${TAG_COLOR[item.tag]}18`, borderColor: `${TAG_COLOR[item.tag]}33` }}>
                {item.tag}
              </span>
              <span className="hot-news__date">{item.date}</span>
            </div>
            <h4 className="hot-news__title">{item.title}</h4>
            <div className="hot-news__meta">
              <span className="hot-news__source">{item.source}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="overview-metrics">
        <div className="metric-mini-card">
          <div className="metric-label">累计备案量</div>
          <div className="metric-value-row">
            <div className="metric-value">{formatNumber(totalFilings)}</div>
            <div className="metric-unit">条</div>
          </div>
        </div>
        <div className="metric-mini-card">
          <div className="metric-label">独立企业数</div>
          <div className="metric-value-row">
            <div className="metric-value">{formatNumber(totalCompanies)}</div>
            <div className="metric-unit">家</div>
          </div>
        </div>
        <div className="metric-mini-card">
          <div className="metric-label">Top4 省份占比</div>
          <div className="metric-value-row">
            <div className="metric-value">{(top4ShareValue * 100).toFixed(1)}</div>
            <div className="metric-unit">%</div>
          </div>
        </div>
        <div className="metric-mini-card">
          <div className="metric-label">内容生成占比</div>
          <div className="metric-value-row">
            <div className="metric-value">{(contentGenShareValue * 100).toFixed(1)}</div>
            <div className="metric-unit">%</div>
          </div>
        </div>
      </div>

      <div className="trend-block timeline-block">
        <div className="trend-title timeline-label">时间脉冲</div>
        <div className="trend-main timeline-title">2024 年后加速扩张，2026 年在高位持续运行</div>
        <div className="stage-axis">
          {STAGE_ITEMS.map((item) => (
            <div key={item.year} className={`stage-item${item.active ? ' active' : ''}`}>
              <div className="stage-year">{item.year}</div>
              <div className="stage-dot" />
              <div className="stage-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-algorithm-block algorithm-block">
        <div className="overview-algorithm-title algorithm-header">
          <span className="algorithm-title">算法结构</span>
          <button type="button" className="ghost-link algorithm-more" onClick={onOpenAlgorithm}>
            查看详情
          </button>
        </div>
        <div className="overview-algorithm-bars algorithm-bars">
          {overviewCategoryShares.map((item) => (
            <div key={item.label} className="overview-algorithm-row algorithm-row">
              <span className="algorithm-name">{item.label}</span>
              <div className="overview-algorithm-track algorithm-track">
                <div className="overview-algorithm-fill algorithm-fill" style={{ width: `${item.value}%` }} />
              </div>
              <strong className="algorithm-value">{item.value.toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
