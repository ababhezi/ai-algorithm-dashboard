import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { TrendPoint } from '../utils/types';

interface TrendChartProps {
  monthlyTrend: TrendPoint[];
}

export function TrendChart({ monthlyTrend }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      grid: {
        top: 26,
        left: 36,
        right: 18,
        bottom: 28,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(8, 23, 40, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        borderWidth: 1
      },
      xAxis: {
        type: 'category',
        data: monthlyTrend.map((item) => item.label),
        axisLabel: {
          color: '#8FAAC8',
          interval: 5,
          fontSize: 11
        },
        axisLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.18)' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8FAAC8', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.08)' } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '月度备案量',
          type: 'bar',
          barWidth: 9,
          itemStyle: {
            color: 'rgba(30, 136, 255, 0.22)',
            borderRadius: [6, 6, 0, 0]
          },
          data: monthlyTrend.map((item) => item.filings)
        },
        {
          name: '3期移动平均',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          itemStyle: { color: '#2F80ED' },
          lineStyle: { width: 2.5, color: '#38BDF8' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 189, 248, 0.28)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.02)' }
            ])
          },
          markLine: {
            symbol: 'none',
            lineStyle: { color: '#FF6B4A', type: 'dashed' },
            data: [{ xAxis: '2023-06', name: '政策节点' }]
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 44,
            itemStyle: { color: '#F5A623' },
            label: {
              color: '#07111F',
              fontSize: 10,
              formatter: '2024高峰'
            },
            data: [{ coord: ['2024-10', 542] }]
          },
          data: monthlyTrend.map((item) => Number(item.movingAverage.toFixed(2)))
        }
      ]
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [monthlyTrend]);

  return (
    <section className="panel panel--compact">
      <div className="panel__header">
        <p className="panel__eyebrow">时间脉冲</p>
        <h3 className="panel__title">2024 年集中爆发，2025 年后进入高位常态化</h3>
      </div>
      <div className="phase-tags">
        <span>2022 合规启动</span>
        <span>2023 生成式 AI 启动</span>
        <span>2024 集中爆发</span>
        <span>2025 增量扩散</span>
      </div>
      <div ref={chartRef} className="chart chart--trend" />
    </section>
  );
}
