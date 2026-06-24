import type { RegionClusterMetric } from '../utils/types';

interface RegionClusterProps {
  clusters: RegionClusterMetric[];
}

export function RegionCluster({ clusters }: RegionClusterProps) {
  return (
    <section className="panel panel--compact">
      <div className="panel__header panel__header--region">
        <div className="panel__header-copy">
          <p className="panel__eyebrow">区域扩散</p>
          <h3 className="panel__title">核心城市群 AI 算法服务商扩散方向</h3>
        </div>
      </div>

      <div className="cluster-list">
        {clusters.map((cluster, index) => (
          <article key={cluster.name} className="cluster-card">
            <div className="cluster-card__top">
              <div className="cluster-card__index">{index + 1}</div>
              <div className="cluster-card__headline">
                <h4>{cluster.name}</h4>
                <p>
                  {cluster.filings} 条备案 | {cluster.companyCount} 家企业
                </p>
              </div>
              <div className="cluster-card__share">{(cluster.share * 100).toFixed(1)}%</div>
            </div>

            <div className="cluster-card__bar">
              <span style={{ width: `${cluster.share * 100}%` }} />
            </div>

            <div className="cluster-card__note">
              <span>{cluster.coreCities}</span>
              <em>{cluster.feature}</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
