import type { RegionClusterMetric } from '../utils/types';

interface RegionFocusPanelProps {
  clusters: RegionClusterMetric[];
}

export function RegionFocusPanel({ clusters }: RegionFocusPanelProps) {
  const topThree = clusters.slice(0, 3);
  const tailTwo = clusters.slice(3, 5);

  return (
    <section className="panel panel--detail-portrait panel--region-focus">
      <div className="region-focus__header">
        <div className="region-focus__title">区域画像｜扩散态势</div>
        <div className="region-focus__subtitle">头部城市群主导备案规模，区域节点承接后续扩散。</div>
      </div>

      <div className="region-focus__leaders">
        {topThree.map((cluster, index) => (
          <div key={cluster.name} className="region-focus__leader">
            <div className="region-focus__leader-rank">#{index + 1}</div>
            <div className="region-focus__leader-main">
              <div className="region-focus__leader-name">{cluster.name}</div>
              <div className="region-focus__leader-meta">
                {cluster.filings} 条备案 | {cluster.companyCount} 家企业
              </div>
            </div>
            <div className="region-focus__leader-share">{(cluster.share * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>

      <div className="region-focus__bar-block">
        <div className="region-focus__bar-title">区域承接梯队</div>
        <div className="region-focus__bars">
          {clusters.map((cluster) => (
            <div key={cluster.name} className="region-focus__bar-row">
              <span className="region-focus__bar-name">{cluster.name}</span>
              <div className="region-focus__bar-track">
                <div className="region-focus__bar-fill" style={{ width: `${cluster.share * 100}%` }} />
              </div>
              <strong className="region-focus__bar-value">{(cluster.share * 100).toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="region-focus__tail-notes">
        {tailTwo.map((cluster) => (
          <div key={cluster.name} className="region-focus__tail-card">
            <div className="region-focus__tail-name">{cluster.name}</div>
            <div className="region-focus__tail-text">{cluster.feature}</div>
          </div>
        ))}
      </div>

      <div className="region-focus__footer">空间格局正在从核心城市群向中西部区域节点和产业场景协同延伸。</div>
    </section>
  );
}
