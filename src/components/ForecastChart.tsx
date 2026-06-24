import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type { ForecastScenario } from '../utils/types';

interface ForecastChartProps {
  scenarios: ForecastScenario[];
  compact?: boolean;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(Math.round(value));
}

export function ForecastChart({ scenarios, compact = false }: ForecastChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const years = useMemo(() => scenarios[0]?.nodes.map((node) => node.year) ?? [], [scenarios]);
  const baselineScenario = scenarios[0] ?? null;

  const scenarioSummaries = useMemo(
    () =>
      scenarios.map((scenario) => {
        const first = scenario.nodes[0];
        const last = scenario.nodes[scenario.nodes.length - 1];
        const firstMid = Math.round((first.low + first.high) / 2);
        const lastMid = Math.round((last.low + last.high) / 2);
        const growth = firstMid > 0 ? ((lastMid - firstMid) / firstMid) * 100 : 0;
        const spread = last.high - last.low;

        return {
          ...scenario,
          lastMid,
          growth,
          spread,
          rangeLabel: `${formatNumber(last.low)} - ${formatNumber(last.high)}`,
          growthLabel: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`
        };
      }),
    [scenarios]
  );

  const yearlyEnvelope = useMemo(
    () =>
      years.map((year, index) => {
        const nodes = scenarios.map((scenario) => scenario.nodes[index]).filter(Boolean);
        const low = Math.min(...nodes.map((node) => node.low));
        const high = Math.max(...nodes.map((node) => node.high));
        const baselineNode = baselineScenario?.nodes[index] ?? null;
        const baselineMid = baselineNode ? Math.round((baselineNode.low + baselineNode.high) / 2) : Math.round((low + high) / 2);

        return {
          year,
          low,
          high,
          baselineMid
        };
      }),
    [baselineScenario, scenarios, years]
  );

  const finalEnvelope = yearlyEnvelope[yearlyEnvelope.length - 1] ?? null;
  const compactScenarioSummaries = compact ? scenarioSummaries.slice(0, 2) : scenarioSummaries;
  const compactYearlyEnvelope = compact ? yearlyEnvelope.slice(-2) : yearlyEnvelope;
  const maxScenarioMid = Math.max(...scenarioSummaries.map((item) => item.lastMid), 1);
  const baselineMidSeries = baselineScenario?.nodes.map((node) => Math.round((node.low + node.high) / 2)) ?? [];
  const keyYearPoints = useMemo(
    () =>
      years
        .map((year, index) => ({
          name: year,
          value: baselineMidSeries[index],
          xAxis: year,
          yAxis: baselineMidSeries[index]
        }))
        .filter((_, index, list) => index === 0 || index === list.length - 1 || index === Math.floor(list.length / 2)),
    [baselineMidSeries, years]
  );

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const envelopeLow = yearlyEnvelope.map((item) => item.low);
    const envelopeSpan = yearlyEnvelope.map((item) => item.high - item.low);

    chart.setOption({
      animationDuration: 900,
      animationEasing: 'cubicOut',
      grid: { left: 34, right: 20, top: 58, bottom: 28, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.22)',
        borderWidth: 1,
        formatter: (params: Array<{ axisValueLabel: string }>) => {
          const year = params?.[0]?.axisValueLabel ?? '';
          const index = years.indexOf(year);
          const envelope = yearlyEnvelope[index];
          const rows = scenarios
            .map((scenario) => {
              const node = scenario.nodes[index];
              const mid = Math.round((node.low + node.high) / 2);
              return `
                <div style="display:flex;justify-content:space-between;gap:18px;">
                  <span style="color:${scenario.color}">${scenario.name}</span>
                  <strong>${formatNumber(mid)}</strong>
                </div>
                <div style="color:#8FAAC8">区间 ${formatNumber(node.low)} - ${formatNumber(node.high)}</div>
              `;
            })
            .join('<div style="height:6px"></div>');

          return `
            <div class="map-tooltip">
              <div class="map-tooltip__title">${year}</div>
              <div style="margin-bottom:8px;color:#8FAAC8;">总包络 ${formatNumber(envelope.low)} - ${formatNumber(envelope.high)}</div>
              ${rows}
            </div>
          `;
        }
      },
      legend: {
        top: 8,
        data: scenarios.map((scenario) => scenario.name),
        textStyle: { color: '#8FAAC8', fontSize: 10 },
        selectedMode: compact ? 'single' : true
      },
      xAxis: {
        type: 'category',
        data: years,
        boundaryGap: false,
        axisLabel: { color: '#8FAAC8', fontSize: 11 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8FAAC8', fontSize: 11 },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.08)' } }
      },
      series: [
        {
          name: '__forecast-envelope-base__',
          type: 'line',
          stack: 'forecast-envelope',
          data: envelopeLow,
          symbol: 'none',
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 },
          tooltip: { show: false },
          emphasis: { disabled: true }
        },
        {
          name: '__forecast-envelope__',
          type: 'line',
          stack: 'forecast-envelope',
          data: envelopeSpan,
          symbol: 'none',
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 189, 248, 0.18)' },
              { offset: 0.55, color: 'rgba(56, 189, 248, 0.08)' },
              { offset: 1, color: 'rgba(255, 209, 102, 0.03)' }
            ])
          },
          tooltip: { show: false },
          emphasis: { disabled: true }
        },
        ...scenarios.map((scenario) => ({
          name: scenario.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: scenario.name === '加速情景' ? 8 : 7,
          itemStyle: { color: scenario.color },
          lineStyle: {
            color: scenario.color,
            width: scenario.name === baselineScenario?.name ? 3 : scenario.name === '加速情景' ? 2.6 : 2,
            type: scenario.name === '收紧情景' ? 'dashed' : 'solid',
            opacity: scenario.name === '收紧情景' ? 0.78 : 1
          },
          areaStyle:
            scenario.name === baselineScenario?.name
              ? { color: `${scenario.color}12` }
              : scenario.name === '加速情景'
                ? { color: `${scenario.color}10` }
                : undefined,
          endLabel: compact
            ? undefined
            : {
                show: true,
                formatter: (params: { value: number }) => `${scenario.name}  ${formatNumber(params.value)}`,
                color: '#DCEBFF',
                fontSize: 10
              },
          markPoint:
            scenario.name === baselineScenario?.name
              ? {
                  symbol: 'circle',
                  symbolSize: 16,
                  itemStyle: {
                    color: '#FFD166',
                    borderColor: '#FFFFFF',
                    borderWidth: 1.2,
                    shadowBlur: 16,
                    shadowColor: 'rgba(255, 209, 102, 0.55)'
                  },
                  label: {
                    show: true,
                    distance: 10,
                    formatter: ({ name, value }: { name: string; value: number }) => `${name}\n${formatNumber(value)}`,
                    color: '#DCEBFF',
                    fontSize: 10,
                    lineHeight: 14,
                    backgroundColor: 'rgba(6, 20, 38, 0.9)',
                    borderColor: 'rgba(56, 189, 248, 0.2)',
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: [4, 6]
                  },
                  data: keyYearPoints
                }
              : undefined,
          markLine:
            scenario.name === baselineScenario?.name && !compact && years.length
              ? {
                  symbol: ['none', 'none'],
                  label: {
                    show: true,
                    formatter: '基线路径',
                    color: '#8FAAC8',
                    fontSize: 10,
                    padding: [2, 6],
                    backgroundColor: 'rgba(5, 18, 35, 0.86)',
                    borderRadius: 999
                  },
                  lineStyle: {
                    color: 'rgba(255, 209, 102, 0.2)',
                    type: 'dashed',
                    width: 1
                  },
                  data: [{ xAxis: years[years.length - 1] }]
                }
              : undefined,
          data: scenario.nodes.map((node) => Math.round((node.low + node.high) / 2)),
          z: scenario.name === baselineScenario?.name ? 4 : 3
        }))
      ]
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [baselineMidSeries, baselineScenario, compact, keyYearPoints, scenarios, yearlyEnvelope, years]);

  return (
    <section className={`panel panel--compact forecast-panel${compact ? ' forecast-panel--compact' : ''}`}>
      <div className="panel__header panel__header--inline forecast-panel__header">
        <div className="panel__header-copy">
          <p className="panel__eyebrow">未来预测</p>
          <h3 className="panel__title">未来增量更可能沿“头部稳住、区域扩散、结构分化”三条线并行演进</h3>
        </div>
        {finalEnvelope ? (
          <div className="forecast-panel__headline">
            <span>终点包络</span>
            <strong>{finalEnvelope.year}</strong>
            <em>
              {formatNumber(finalEnvelope.low)} - {formatNumber(finalEnvelope.high)}
            </em>
          </div>
        ) : null}
      </div>

      <div className="forecast-panel__chart-wrap">
        <div className="forecast-panel__chart-hud" aria-hidden="true">
          <div className="forecast-panel__chart-kicker">
            <span>FORECAST CORE</span>
            <strong>多情景对比</strong>
          </div>
          <div className="forecast-panel__chart-badge">
            <span>波动带</span>
            <strong>{finalEnvelope ? formatNumber(finalEnvelope.high - finalEnvelope.low) : '--'}</strong>
          </div>
        </div>
        <div className="forecast-panel__chart-gridline forecast-panel__chart-gridline--x" />
        <div className="forecast-panel__chart-gridline forecast-panel__chart-gridline--y" />
        <div className="forecast-panel__chart-scan" />
        <div ref={chartRef} className="chart chart--forecast" />
      </div>

      <div className="forecast-panel__scenario-grid">
        {compactScenarioSummaries.map((scenario, index) => (
          <article key={scenario.name} className={`forecast-card forecast-card--${index}`}>
            <div className="forecast-card__top">
              <span className="forecast-card__name" style={{ color: scenario.color }}>
                {scenario.name}
              </span>
              <strong className="forecast-card__growth">{scenario.growthLabel}</strong>
            </div>
            <div className="forecast-card__range">{scenario.rangeLabel}</div>
            <div className="forecast-card__bar">
              <span
                style={{
                  width: `${Math.max(18, Math.min(100, (scenario.lastMid / maxScenarioMid) * 100))}%`,
                  background: scenario.color
                }}
              />
            </div>
            <div className="forecast-card__meta">
              <span>终点中枢 {formatNumber(scenario.lastMid)}</span>
              <em>波动宽度 {formatNumber(scenario.spread)}</em>
            </div>
          </article>
        ))}
      </div>

      <div className="forecast-panel__year-strip">
        {compactYearlyEnvelope.map((item) => (
          <div key={item.year} className="forecast-year-card">
            <span className="forecast-year-card__year">{item.year}</span>
            <strong className="forecast-year-card__mid">{formatNumber(item.baselineMid)}</strong>
            <div className="forecast-year-card__range">
              {formatNumber(item.low)} - {formatNumber(item.high)}
            </div>
          </div>
        ))}
      </div>

      <p className="panel__footnote forecast-panel__footnote">
        预测以现有备案节奏为锚，叠加情景增速与波动带推演，用于趋势研判，不等同于确定性规模预测。
      </p>
    </section>
  );
}
