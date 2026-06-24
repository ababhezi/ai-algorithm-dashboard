import type { DataQualityItem } from '../utils/types';

interface DataQualityNoteProps {
  items: DataQualityItem[];
}

export function DataQualityNote({ items }: DataQualityNoteProps) {
  return (
    <section className="panel panel--compact panel--quality">
      <div className="panel__header">
        <p className="panel__eyebrow">数据质量提示</p>
        <h3 className="panel__title">有效字段支撑主结论，未知字段不会被静默忽略</h3>
      </div>
      <div className="quality-list">
        {items.map((item) => (
          <div className="quality-row" key={item.field}>
            <div>
              <div className="quality-row__field">{item.field}</div>
              <div className="quality-row__note">{item.note}</div>
            </div>
            <div className="quality-row__meta">
              <span>有效 {item.valid}</span>
              <span>未知 {item.missing}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="quality-disclaimer">算法备案数据反映的是合规备案情况，不完全等同于市场规模或 AI 实力排名。</div>
    </section>
  );
}
