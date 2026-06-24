import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { CapitalSummary } from '../utils/types';

interface CapitalDistributionProps {
  capitalSummary: CapitalSummary;
}

export function CapitalDistribution({ capitalSummary }: CapitalDistributionProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      grid: { top: 36, left: 36, right: 16, bottom: 28, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(8, 23, 40, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        borderWidth: 1
      },
      xAxis: {
        type: 'category',
        data: capitalSummary.bins.map((bin) => bin.label),
        axisLabel: { color: '#8FAAC8', interval: 0, fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8FAAC8', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.08)' } }
      },
      series: [
        {
          type: 'bar',
          barWidth: 18,
          data: capitalSummary.bins.map((bin, index) => ({
            value: bin.count,
            itemStyle: {
              color: index === capitalSummary.bins.length - 1 ? '#FFB84D' : '#74A9F8',
              borderRadius: [8, 8, 0, 0]
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
  }, [capitalSummary]);

  return (
    <section className="panel panel--compact">
      <div className="panel__header">
        <p className="panel__eyebrow">企业规模</p>
        <h3 className="panel__title">企业规模呈现明显长尾结构</h3>
      </div>
      <div className="capital-stats">
        <div>
          <span>中位数</span>
          <strong>{capitalSummary.median.toFixed(0)} 万</strong>
        </div>
        <div>
          <span>小微企业占比</span>
          <strong>{(capitalSummary.microShare * 100).toFixed(1)}%</strong>
        </div>
        <div>
          <span>过亿企业占比</span>
          <strong>{(capitalSummary.overHundredMillionShare * 100).toFixed(1)}%</strong>
        </div>
      </div>
      <div ref={chartRef} className="chart chart--capital" />
    </section>
  );
}
