import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { CapitalSummary, DashboardDataset } from '../utils/types';

interface CompanyQualityPanelProps {
  capitalSummary: CapitalSummary;
  unknownSummary: DashboardDataset['unknownSummary'];
  totalFilings: number;
  onOpenCompany: () => void;
  onOpenQuality: () => void;
}

export function CompanyQualityPanel({
  capitalSummary,
  unknownSummary,
  totalFilings,
  onOpenCompany,
  onOpenQuality
}: CompanyQualityPanelProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      grid: { left: 26, right: 16, top: 10, bottom: 22, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.22)',
        borderWidth: 1
      },
      xAxis: {
        type: 'category',
        data: capitalSummary.bins.map((bin) => bin.label),
        axisLabel: { color: '#8FAAC8', fontSize: 10, interval: 0 },
        axisLine: { lineStyle: { color: 'rgba(143, 170, 200, 0.18)' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: capitalSummary.bins.map((bin, index) => ({
            value: bin.count,
            itemStyle: {
              color:
                index === capitalSummary.bins.length - 1
                  ? '#F5A623'
                  : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#56C5FF' },
                      { offset: 1, color: '#1E88FF' }
                    ]),
              borderRadius: [10, 10, 0, 0]
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

  const provinceValid = totalFilings - unknownSummary.provinceUnknown;
  const cityValid = totalFilings - unknownSummary.cityUnknown;
  const coordinateValid = totalFilings - unknownSummary.coordinateUnknown;

  return (
    <section className="panel panel--compact panel--company-quality">
      <div className="panel__header">
        <p className="panel__eyebrow">企业画像</p>
        <h3 className="panel__title">企业规模呈长尾结构，字段回填进度影响空间统计</h3>
      </div>

      <div className="company-quality">
        <div className="company-quality__group">
          <div className="company-quality__title">企业规模</div>
          <div className="company-quality__metrics">
            <div>
              <span>注册资本中位数</span>
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
          <div ref={chartRef} className="company-quality__chart" />
          <button type="button" className="ghost-button ghost-button--small" onClick={onOpenCompany}>
            查看企业详情
          </button>
        </div>

        <div className="company-quality__divider" />

        <div className="company-quality__group">
          <div className="company-quality__title">数据质量</div>
          <div className="quality-mini-list">
            <div className="quality-mini-list__row">
              <span>省份有效</span>
              <strong>{provinceValid}</strong>
            </div>
            <div className="quality-mini-list__row">
              <span>城市有效</span>
              <strong>{cityValid}</strong>
            </div>
            <div className="quality-mini-list__row">
              <span>经纬度有效</span>
              <strong>{coordinateValid}</strong>
            </div>
          </div>
          <div className="company-quality__note">地图、排名和结构图均基于有效字段统计。</div>
          <button type="button" className="ghost-button ghost-button--small" onClick={onOpenQuality}>
            查看质量详情
          </button>
        </div>
      </div>
    </section>
  );
}
