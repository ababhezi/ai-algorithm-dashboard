const NEWS_ITEMS = [
  {
    id: 1,
    title: '国家网信办第17批算法备案信息已纳入当前大屏口径',
    source: '项目数据更新',
    date: '2026-06-12',
    summary: '当前前端已切换到补全版数据源，运行态统计与地图呈现使用同一份备案数据。',
    tag: '更新'
  },
  {
    id: 2,
    title: '未知值与“未回填”字段已统一纳入数据质量统计',
    source: '项目数据更新',
    date: '2026-06-12',
    summary: '“未回填”、空值、-、--、\\N 等已统一按未知处理，不再直接进入地图热力与城市排行。',
    tag: '质量'
  },
  {
    id: 3,
    title: '头部省份与城市结构改为按当前数据实时计算',
    source: '项目数据更新',
    date: '2026-06-12',
    summary: 'Top4 省份、城市排行、算法结构和预测情景不再依赖旧静态比例，而是按补全版数据动态生成。',
    tag: '结构'
  }
];

const TAG_CLASS: Record<string, string> = {
  更新: 'hot-news__tag--policy',
  质量: 'hot-news__tag--region',
  结构: 'hot-news__tag--trend'
};

export function HotNews() {
  return (
    <section className="panel panel--hot-news">
      <div className="panel__header">
        <p className="panel__eyebrow">数据动态</p>
        <h3 className="panel__title">当前大屏口径与补全版数据同步说明</h3>
      </div>

      <div className="hot-news__feed">
        {NEWS_ITEMS.map((item) => (
          <article key={item.id} className="hot-news__card">
            <div className="hot-news__head">
              <span className={`hot-news__tag ${TAG_CLASS[item.tag] ?? ''}`}>{item.tag}</span>
              <span className="hot-news__date">{item.date}</span>
            </div>
            <h4 className="hot-news__title">{item.title}</h4>
            <p className="hot-news__summary">{item.summary}</p>
            <div className="hot-news__source">{item.source}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
