import type { DataQualityItem } from '../utils/types';

interface QualitySummaryPanelProps {
  summaryText: string;
  items: DataQualityItem[];
}

export function QualitySummaryPanel({ summaryText, items }: QualitySummaryPanelProps) {
  return (
    <section className="panel panel--quality-detail">
      <div className="panel__header">
        <p className="panel__eyebrow">数据质量</p>
        <h3 className="panel__title">字段回填进度与备案数据口径说明</h3>
      </div>

      <div className="quality-summary">
        <p>{summaryText}</p>
        <ul>
          <li>地图、城市排名和算法结构均以有效字段为口径。</li>
          <li>未知字段单独计数，不参与热力与排名。</li>
          <li>备案数据反映合规情况，不完全等同于市场规模或 AI 实力排名。</li>
        </ul>
      </div>

      <div className="quality-divider">
        <span>字段覆盖详情</span>
      </div>

      <div className="quality-list">
        {items.map((item) => (
          <div className="quality-row" key={item.field}>
            <div className="quality-row__body">
              <div className="quality-row__field">{item.field}</div>
              <div className="quality-row__note">{item.note}</div>
            </div>
            <div className="quality-row__meta">
              <span className="quality-row__stat">
                <em>有效</em> {item.valid}
              </span>
              <span className="quality-row__stat quality-row__stat--missing">
                <em>未知</em> {item.missing}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="quality-disclaimer">
        算法备案数据反映的是合规备案情况，不完全等同于市场规模或 AI 实力排名。
      </div>
    </section>
  );
}
