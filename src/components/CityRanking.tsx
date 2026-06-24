import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type { CityMetric } from '../utils/types';

interface CityRankingProps {
  cities: CityMetric[];
  selectedCity?: string | null;
  selectionLabel?: string | null;
  selectionType?: 'province' | 'city' | null;
}

const HIGHLIGHT_CITY = '广州';

export function CityRanking({ cities, selectedCity = null, selectionLabel = null, selectionType = null }: CityRankingProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const data = useMemo(() => cities.slice(0, 9).reverse(), [cities]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      grid: {
        top: 20,
        bottom: 22,
        left: 28,
        right: 18,
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#7E9BC0', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(110, 159, 214, 0.18)' } },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(90, 140, 196, 0.08)' } }
      },
      yAxis: {
        type: 'category',
        data: data.map((item) => item.city),
        boundaryGap: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#DCEBFF',
          fontSize: 12,
          fontWeight: 600,
          align: 'right',
          margin: 10
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.22)',
        borderWidth: 1,
        formatter: (params: any) => {
          const item = data[params[0].dataIndex];
          return `
            <div class="map-tooltip">
              <div class="map-tooltip__title">${item.city}</div>
              <div>备案量：<strong>${item.filings}</strong> 条</div>
              <div>企业数：<strong>${item.companyCount}</strong> 家</div>
              <div>主要算法类别：<strong>${item.topCategory}</strong></div>
            </div>
          `;
        }
      },
      series: [
        {
          type: 'bar',
          barWidth: 16,
          label: {
            show: true,
            position: 'right',
            color: '#DCEBFF',
            fontSize: 11,
            fontWeight: 700
          },
          data: data.map((item) => ({
            value: item.filings,
            itemStyle: {
              color:
                item.city === selectedCity
                  ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: '#FFD166' },
                      { offset: 1, color: '#FFF0B3' }
                    ])
                  : item.city === HIGHLIGHT_CITY
                  ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: '#F4A81D' },
                      { offset: 1, color: '#FFD166' }
                    ])
                  : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: '#2462D6' },
                      { offset: 1, color: '#5AC8FA' }
                    ]),
              borderRadius: [0, 10, 10, 0],
              shadowBlur: item.city === selectedCity ? 18 : 0,
              shadowColor: item.city === selectedCity ? 'rgba(255, 209, 102, 0.45)' : 'transparent'
            }
          }))
        }
      ]
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [data, selectedCity]);

  return (
    <section className={`panel panel--compact city-ranking-panel${selectionLabel ? ' is-linked' : ''}`}>
      <div className="panel__header panel__header--ranking">
        {selectionLabel ? (
          <div className="panel__lock-chip">{selectionType === 'city' ? 'CITY LINK' : 'PROVINCE LINK'} {selectionLabel}</div>
        ) : null}
        <p className="panel__eyebrow">城市排名</p>
        <h3 className="panel__title">Top 城市构成全国 AI 算法服务商基本盘</h3>
      </div>
      <div ref={chartRef} className="chart chart--ranking" />
    </section>
  );
}
