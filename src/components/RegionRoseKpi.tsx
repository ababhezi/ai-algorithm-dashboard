import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type { RegionClusterMetric } from '../utils/types';

interface RegionRoseKpiProps {
  clusters: RegionClusterMetric[];
}

export function RegionRoseKpi({ clusters }: RegionRoseKpiProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const totalShare = useMemo(
    () => clusters.reduce((sum, cluster) => sum + cluster.share, 0),
    [clusters]
  );

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption({
      animationDuration: 900,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        position: (_point: any[], _params: any, _dom: any, _rect: any, size: { viewSize: number[] }) => {
          return [size.viewSize[0] + 14, 0];
        },
        confine: false,
        extraCssText: 'padding: 10px 14px;',
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.22)',
        borderWidth: 1,
        textStyle: { color: '#DCEBFF', fontSize: 12 },
        formatter: (params: any) => `
          <div class="map-tooltip">
            <div class="map-tooltip__title">${params.name}</div>
            <div>备案量：<strong>${params.data.filings}</strong> 条</div>
            <div>企业数：<strong>${params.data.companyCount}</strong> 家</div>
            <div>备案占比：<strong>${params.data.percent}%</strong></div>
          </div>
        `
      },
      series: [
        {
          type: 'pie',
          roseType: 'radius',
          radius: ['8%', '50%'],
          center: ['50%', '50%'],
          startAngle: 110,
          minAngle: 8,
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          emphasis: {
            focus: 'none',
            scaleSize: 6
          },
          itemStyle: {
            borderColor: 'rgba(4, 16, 31, 0.92)',
            borderWidth: 2,
            shadowBlur: 14,
            shadowColor: 'rgba(0, 183, 255, 0.18)'
          },
          data: clusters.map((cluster, index) => ({
            name: cluster.name,
            value: Number((cluster.share * 100).toFixed(2)),
            filings: cluster.filings,
            companyCount: cluster.companyCount,
            percent: (cluster.share * 100).toFixed(1),
            itemStyle: {
              color: ['#5AD7FF', '#3AA7FF', '#2E78FF', '#3351D4', '#FFCC59'][index % 5]
            }
          }))
        },
        {
          type: 'pie',
          radius: ['0%', '14%'],
          center: ['50%', '50%'],
          silent: true,
          label: { show: false },
          data: [
            {
              value: 1,
              itemStyle: {
                color: 'rgba(8, 28, 52, 0.92)',
                shadowBlur: 18,
                shadowColor: 'rgba(0, 183, 255, 0.15)'
              }
            }
          ]
        }
      ],
      graphic: []
    } as echarts.EChartsOption);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [clusters, totalShare]);

  return (
    <div className="kpi-rose-card">
      <div className="kpi-rose-card__text">
        <div className="kpi-rose-card__value">{(totalShare * 100).toFixed(1)}%</div>
        <div className="kpi-rose-card__label">五区合计</div>
      </div>
      <div ref={chartRef} className="kpi-rose-card__chart" />
    </div>
  );
}
