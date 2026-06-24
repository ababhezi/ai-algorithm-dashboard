import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';

interface ItemValue {
  name: string;
  value: number;
  share?: number;
}

interface GeoDetailPanelProps {
  kind: 'province' | 'city';
  name: string;
  yearLabel: string;
  filings: number;
  companyCount: number;
  share: number;
  yoyGrowth: number | null;
  topCategory: string;
  rankLabel?: string;
  topCities: ItemValue[];
  categories: ItemValue[];
  yearlyTrend: ItemValue[];
  qualitySummary: {
    provinceUnknown: number;
    cityUnknown: number;
    coordinateUnknown: number;
    categoryUnknown: number;
    industryUnknown: number;
  };
  totalFilings: number;
  onReset: () => void;
  onOpenQuality: () => void;
}

function getInsightText(name: string) {
  const insightMap: Record<string, string> = {
    广东省: '广州+深圳双核驱动，应用转化和产业链协同优势突出。',
    北京市: '北京以研发与总部型企业为主，是全国 AI 算法备案的核心节点。',
    上海市: '上海依托资本、金融和 B 端技术服务，产业解决方案能力突出。',
    浙江省: '杭州单核带动明显，电商、云计算和搜索推荐生态支撑较强。',
    北京: '北京是全国研发与总部型算法服务商的代表性城市节点。',
    广州: '广州依托商贸场景与平台生态，应用转化效率突出。',
    深圳: '深圳在硬件、产业链与制造场景联动上更具协同优势。',
    上海: '上海更偏向资本、企业服务与解决方案输出能力。',
    杭州: '杭州受电商、云计算与搜索推荐生态带动明显。'
  };

  return insightMap[name] ?? '核心地区集聚效应明显，算法服务能力正向更多区域节点扩散。';
}

export function GeoDetailPanel({
  kind,
  name,
  yearLabel,
  filings,
  companyCount,
  share,
  yoyGrowth,
  topCategory,
  rankLabel,
  topCities,
  categories,
  yearlyTrend,
  qualitySummary,
  totalFilings,
  onReset,
  onOpenQuality
}: GeoDetailPanelProps) {
  const trendRef = useRef<HTMLDivElement | null>(null);

  const normalizedCategories = useMemo(
    () => categories.slice(0, 6).map((item) => ({ ...item, share: item.share ?? 0 })),
    [categories]
  );

  useEffect(() => {
    if (!trendRef.current) return;
    const chart = echarts.init(trendRef.current);

    chart.setOption({
      grid: { left: 34, right: 18, top: 22, bottom: 24, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.22)',
        borderWidth: 1
      },
      xAxis: {
        type: 'category',
        data: yearlyTrend.map((item) => item.name),
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
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: yearlyTrend.map((item) => item.value),
          itemStyle: { color: '#FFD166' },
          lineStyle: { color: '#F5A623', width: 2.8 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 166, 35, 0.28)' },
              { offset: 1, color: 'rgba(245, 166, 35, 0.02)' }
            ])
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 14,
            itemStyle: { color: '#FFD166' },
            data: yearlyTrend
              .filter((item) => item.name === yearLabel)
              .map((item) => ({ coord: [item.name, item.value], value: item.value }))
          }
        }
      ]
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(trendRef.current);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [yearLabel, yearlyTrend]);

  const provinceValid = totalFilings - qualitySummary.provinceUnknown;
  const cityValid = totalFilings - qualitySummary.cityUnknown;
  const coordinateValid = totalFilings - qualitySummary.coordinateUnknown;
  const insightText = getInsightText(name);

  return (
    <section className="panel panel--detail-portrait">
      <div className="detail-portrait__header">
        <div>
          <div className="detail-portrait__lock">SYSTEM LOCK / DETAIL ANALYSIS</div>
          <div className="detail-portrait__title">
            <h3>{name}</h3>
            <span>详情概览</span>
          </div>
          <p>{kind === 'province' ? '点击地图其他省份查看详情' : '点击地图其他城市查看详情'}</p>
          <div className="detail-portrait__insight">{insightText}</div>
        </div>
        <button type="button" className="ghost-button ghost-button--small" onClick={onReset}>
          返回全国
        </button>
      </div>

      <div className="detail-portrait__stats">
        <div className="detail-stat-card">
          <span>备案量</span>
          <strong>{filings}</strong>
          <em>条</em>
        </div>
        <div className="detail-stat-card">
          <span>企业数</span>
          <strong>{companyCount}</strong>
          <em>家</em>
        </div>
        <div className="detail-stat-card">
          <span>占全国比例</span>
          <strong>{(share * 100).toFixed(1)}</strong>
          <em>%</em>
        </div>
        <div className="detail-stat-card detail-stat-card--accent">
          <span>同比增长</span>
          <strong>{yoyGrowth === null ? '--' : `${yoyGrowth > 0 ? '↑' : ''}${yoyGrowth.toFixed(1)}`}</strong>
          <em>{yoyGrowth === null ? '' : '%'}</em>
        </div>
      </div>

      <div className="detail-portrait__meta">
        <div className="detail-meta-chip">{rankLabel ?? '核心地区画像'}</div>
        <div className="detail-meta-chip">主导算法：{topCategory}</div>
        <div className="detail-meta-chip">{yearLabel} 年视角</div>
      </div>

      {kind === 'province' && topCities.length > 0 ? (
        <div className="detail-portrait__cities">
          {topCities.slice(0, 3).map((item) => (
            <div key={item.name} className="detail-city-chip">
              <span>{item.name}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

      <div className="detail-block">
        <div className="detail-block__title">年度备案量趋势</div>
        <div ref={trendRef} className="detail-chart detail-chart--trend" />
      </div>

      <div className="detail-block">
        <div className="detail-block__title">算法类型结构（按备案量）</div>
        <div className="category-bars">
          {normalizedCategories.map((item) => (
            <div key={item.name} className="category-bars__row">
              <span>{item.name}</span>
              <div className="category-bars__track">
                <div className="category-bars__fill" style={{ width: `${Math.max((item.share ?? 0) * 100, 2)}%` }} />
              </div>
              <strong>{((item.share ?? 0) * 100).toFixed(1)}%</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-block detail-block--quality">
        <div className="detail-block__title">
          数据质量提示
          <button type="button" className="ghost-link" onClick={onOpenQuality}>
            查看详情
          </button>
        </div>
        <div className="quality-cards-mini">
          <div className="quality-cards-mini__item">
            <span>省份</span>
            <strong>{provinceValid}</strong>
            <em>有效</em>
          </div>
          <div className="quality-cards-mini__item">
            <span>城市</span>
            <strong>{cityValid}</strong>
            <em>有效</em>
          </div>
          <div className="quality-cards-mini__item">
            <span>经纬度</span>
            <strong>{coordinateValid}</strong>
            <em>有效</em>
          </div>
        </div>
      </div>
    </section>
  );
}
