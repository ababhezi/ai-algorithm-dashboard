import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type { CityMetric, ProvinceMetric } from '../utils/types';
import { buildCityTooltip, registerChinaMap } from '../utils/mapUtils';

interface ChinaFeature {
  properties?: {
    name?: string;
  };
}

interface ProvinceMapDatum {
  name: string;
  value: number;
  enterpriseCount: number;
  percent: number;
  mainAlgorithm: string;
  hasData: boolean;
  label?: {
    show?: boolean;
    formatter?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: number;
    textShadowBlur?: number;
    textShadowColor?: string;
  };
  itemStyle?: {
    areaColor?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
    shadowColor?: string;
    shadowBlur?: number;
  };
}

interface ChinaMapProps {
  mapJson: { features?: ChinaFeature[] } | object;
  provinceMetrics: ProvinceMetric[];
  topCityMetrics: CityMetric[];
  cityMetricsAll: CityMetric[];
  topProvinceNames: string[];
  top4ShareValue: number;
  selectedProvince?: string | null;
  selectedCity?: string | null;
  selectedYear: string;
  yearOptions: string[];
  onYearSelect: (year: string) => void;
  onProvinceSelect: (province: string) => void;
  onCitySelect: (city: string) => void;
  onResetSelection: () => void;
}

type LabelConfig = { position: 'left' | 'right'; offset: [number, number] };

const CORE_CITIES = ['北京', '广州', '深圳', '上海', '杭州', '成都'];
const LABEL_CITIES = ['北京', '上海', '杭州', '广州', '深圳', '成都'];

const LABEL_CONFIG: Record<string, LabelConfig> = {
  北京: { position: 'right', offset: [10, -8] },
  上海: { position: 'right', offset: [12, -12] },
  杭州: { position: 'right', offset: [12, 14] },
  广州: { position: 'right', offset: [10, -12] },
  深圳: { position: 'right', offset: [10, 14] },
  成都: { position: 'left', offset: [-10, 2] }
};

const CITY_COLORS: Record<string, string> = {
  北京: '#FFD166',
  广州: '#F5A623',
  深圳: '#00E5FF',
  上海: '#38BDF8',
  杭州: '#00C2FF',
  成都: '#6CA8FF'
};

const HIGHLIGHT_LINES = new Set(['北京-上海', '北京-广州', '广州-深圳', '上海-杭州']);

const STAR_LINES = [
  ['北京', '上海'],
  ['北京', '杭州'],
  ['北京', '广州'],
  ['北京', '深圳'],
  ['北京', '成都'],
  ['北京', '武汉'],
  ['上海', '杭州'],
  ['上海', '深圳'],
  ['上海', '南京'],
  ['杭州', '苏州'],
  ['杭州', '宁波'],
  ['广州', '深圳'],
  ['广州', '佛山'],
  ['深圳', '东莞'],
  ['成都', '重庆'],
  ['武汉', '合肥']
];

const FAINT_LINES = [
  ['上海', '杭州'],
  ['杭州', '南京'],
  ['广州', '深圳'],
  ['深圳', '厦门'],
  ['北京', '天津'],
  ['北京', '济南'],
  ['成都', '重庆'],
  ['武汉', '合肥'],
  ['西安', '成都'],
  ['南京', '苏州']
];

function buildProvinceTooltip(data?: ProvinceMapDatum, fallbackName?: string) {
  const title = data?.name ?? fallbackName ?? '省份';
  if (!data || !data.hasData || data.value === 0) {
    return `
      <div class="map-tooltip">
        <div class="map-tooltip__title">${title}</div>
        <div>备案量：暂无数据</div>
        <div>企业数：暂无数据</div>
        <div>全国占比：暂无数据</div>
        <div>主要算法：暂无数据</div>
      </div>
    `;
  }

  return `
    <div class="map-tooltip">
      <div class="map-tooltip__title">${title}</div>
      <div>备案量：<strong>${data.value}</strong> 条</div>
      <div>企业数：<strong>${data.enterpriseCount}</strong> 家</div>
      <div>全国占比：<strong>${data.percent.toFixed(1)}%</strong></div>
      <div>主要算法：<strong>${data.mainAlgorithm}</strong></div>
    </div>
  `;
}

function buildLinkSeriesData(cityMetrics: CityMetric[], links: string[][]) {
  const cityMap = new Map(cityMetrics.map((item) => [item.city, item]));
  return links
    .map(([from, to]) => {
      const source = cityMap.get(from);
      const target = cityMap.get(to);
      if (!source || !target) return null;
      return {
        fromName: source.city,
        toName: target.city,
        highlight: HIGHLIGHT_LINES.has(`${from}-${to}`),
        coords: [
          [source.longitude, source.latitude],
          [target.longitude, target.latitude]
        ]
      };
    })
    .filter(Boolean);
}

export function ChinaMap({
  mapJson,
  provinceMetrics,
  topCityMetrics,
  cityMetricsAll,
  topProvinceNames,
  top4ShareValue,
  selectedProvince,
  selectedCity,
  selectedYear,
  yearOptions,
  onYearSelect,
  onProvinceSelect,
  onCitySelect,
  onResetSelection
}: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const cityLookup = useMemo(() => new Map(cityMetricsAll.map((metric) => [metric.city, metric])), [cityMetricsAll]);
  const selectedCityMetric = selectedCity ? cityLookup.get(selectedCity) ?? null : null;
  const selectedYearIndex = Math.max(0, yearOptions.indexOf(selectedYear));
  const selectedTargetLabel = selectedCity ?? selectedProvince ?? null;

  const handlePrevYear = () => {
    if (selectedYearIndex > 0) {
      onYearSelect(yearOptions[selectedYearIndex - 1]);
    }
  };

  const handleNextYear = () => {
    if (selectedYearIndex < yearOptions.length - 1) {
      onYearSelect(yearOptions[selectedYearIndex + 1]);
    }
  };

  const provinceMapData = useMemo(() => {
    const featureNames = ((mapJson as { features?: ChinaFeature[] }).features ?? [])
      .map((feature) => feature.properties?.name?.trim())
      .filter((name): name is string => Boolean(name))
      .filter((name) => name !== '100000_JD');

    const uniqueFeatureNames = [...new Set(featureNames)];
    const metricMap = new Map(provinceMetrics.map((metric) => [metric.province, metric]));
    const maxFilings = Math.max(...provinceMetrics.map((item) => item.filings), 1);

    return uniqueFeatureNames.map((name) => {
      const stat = metricMap.get(name);
      const hasData = Boolean(stat && stat.filings > 0);
      const ratio = stat ? stat.filings / maxFilings : 0;

      let areaColor = '#071E35';
      if (hasData) {
        if (ratio > 0.78) areaColor = '#FFD166';
        else if (ratio > 0.58) areaColor = '#16D1FF';
        else if (ratio > 0.34) areaColor = '#2E8FFF';
        else if (ratio > 0.16) areaColor = '#176DA2';
        else areaColor = '#0B2B4A';
      }

      const itemStyle = !hasData
        ? {
            areaColor: '#071E35',
            borderColor: 'rgba(56,189,248,0.28)',
            borderWidth: 1,
            opacity: 0.75
          }
        : topProvinceNames.includes(name)
          ? {
              areaColor,
              borderColor: '#FFD166',
              borderWidth: 1.6,
              shadowColor: 'rgba(255, 209, 102, 0.62)',
              shadowBlur: 30
            }
          : {
              areaColor,
              borderColor: 'rgba(56, 189, 248, 0.82)',
              borderWidth: 1.15,
              shadowColor: 'rgba(0, 183, 255, 0.62)',
              shadowBlur: 24
            };

      return {
        name,
        value: stat?.filings ?? 0,
        enterpriseCount: stat?.companyCount ?? 0,
        percent: (stat?.share ?? 0) * 100,
        mainAlgorithm: stat?.topCategory ?? '暂无数据',
        hasData,
        itemStyle:
          selectedProvince === name
            ? {
                areaColor: '#1B638F',
                borderColor: '#9BE8FF',
                borderWidth: 2.1,
                shadowBlur: 42,
                shadowColor: 'rgba(0, 229, 255, 1)'
              }
            : itemStyle,
        label:
          selectedProvince === name
            ? {
                show: true,
                formatter: name,
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                textShadowBlur: 14,
                textShadowColor: 'rgba(0, 229, 255, 0.95)'
              }
            : undefined
      } satisfies ProvinceMapDatum;
    });
  }, [mapJson, provinceMetrics, selectedProvince, topProvinceNames]);

  useEffect(() => {
    if (!chartRef.current) return;

    registerChinaMap(mapJson);
    const chart = echarts.init(chartRef.current);
    const starLines = buildLinkSeriesData(cityMetricsAll, STAR_LINES);
    const faintLines = buildLinkSeriesData(cityMetricsAll, FAINT_LINES);
    const topCityData = topCityMetrics.filter((item) => CORE_CITIES.includes(item.city));
    const labelCityData = topCityMetrics.filter((item) => LABEL_CITIES.includes(item.city));
    const scatterCities = topCityMetrics.slice(0, 20);

    chart.setOption({
      animationDuration: 1100,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.28)',
        borderWidth: 1,
        textStyle: { color: '#DCEBFF' },
        formatter: (params: any) => {
          if (params.seriesType === 'map') {
            return buildProvinceTooltip(params.data as ProvinceMapDatum | undefined, params.name);
          }
          return buildCityTooltip(cityLookup.get(params.name));
        }
      },
      geo: [
        {
          map: 'china-dashboard',
          roam: false,
          layoutCenter: ['50%', '55.1%'],
          layoutSize: '94%',
          aspectScale: 0.85,
          zoom: 1,
          silent: true,
          itemStyle: {
            areaColor: 'rgba(3, 16, 34, 0.76)',
            borderColor: 'rgba(0, 183, 255, 0.18)',
            borderWidth: 1,
            shadowColor: 'rgba(0, 183, 255, 0.28)',
            shadowBlur: 18,
            shadowOffsetY: 10
          },
          emphasis: { disabled: true },
          regions: provinceMapData.map((item) => ({
            name: item.name,
            itemStyle: {
              areaColor: 'rgba(5, 18, 35, 0.8)',
              borderColor: 'rgba(0, 183, 255, 0.12)'
            }
          }))
        },
        {
          map: 'china-dashboard',
          roam: false,
          layoutCenter: ['50%', '53.35%'],
          layoutSize: '94%',
          aspectScale: 0.85,
          zoom: 1,
          label: { show: false },
          itemStyle: {
            areaColor: '#0A2A45',
            borderColor: 'rgba(56, 189, 248, 0.82)',
            borderWidth: 1.15,
            shadowColor: 'rgba(0, 183, 255, 0.58)',
            shadowBlur: 24,
            shadowOffsetY: 3
          },
          emphasis: {
            scale: false,
            label: { show: false },
            itemStyle: {
              areaColor: '#155C8A',
              borderColor: '#00E5FF',
              borderWidth: 1.5,
              shadowBlur: 30,
              shadowColor: 'rgba(0, 229, 255, 0.95)'
            }
          }
        }
      ],
      series: [
        {
          name: '地图阴影',
          type: 'map',
          map: 'china-dashboard',
          geoIndex: 0,
          zlevel: 1,
          silent: true,
          tooltip: { show: false },
          selectedMode: false,
          data: provinceMapData.map((item) => ({ name: item.name, value: item.value }))
        },
        {
          type: 'map',
          map: 'china-dashboard',
          geoIndex: 1,
          zlevel: 2,
          selectedMode: false,
          label: { show: false },
          data: provinceMapData
        },
        {
          name: '星座网络底纹',
          type: 'lines',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 3,
          silent: true,
          lineStyle: {
            color: 'rgba(56, 189, 248, 0.18)',
            width: 0.7,
            opacity: 0.45,
            curveness: 0.08,
            shadowBlur: 6,
            shadowColor: 'rgba(56, 189, 248, 0.45)'
          },
          data: faintLines as never[]
        },
        {
          name: '城市扩散流线',
          type: 'lines',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 4,
          effect: {
            show: true,
            period: 3.8,
            trailLength: 0.28,
            symbol: 'circle',
            symbolSize: 3.8,
            color: '#FFD166'
          },
          lineStyle: {
            width: 1.2,
            opacity: 0.76,
            curveness: 0.28,
            shadowBlur: 18,
            shadowColor: 'rgba(0,194,255,0.82)'
          },
          data: (starLines as any[]).map((item) => ({
            ...item,
            lineStyle: {
              color: item.highlight ? 'rgba(255, 209, 102, 0.66)' : 'rgba(0, 194, 255, 0.48)',
              width: item.highlight ? 1.6 : 1.1,
              opacity: 0.78,
              curveness: 0.28,
              shadowBlur: 18,
              shadowColor: item.highlight ? 'rgba(255, 209, 102, 0.88)' : 'rgba(0,194,255,0.85)'
            }
          })) as never[]
        },
        {
          name: '城市星点',
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 5,
          data: scatterCities.map((metric) => ({
            name: metric.city,
            value: [metric.longitude, metric.latitude, metric.filings],
            itemStyle: selectedCity === metric.city ? { color: '#FFD166' } : undefined
          })),
          symbol: 'circle',
          symbolSize: (value: number[]) => Math.max(5, Math.min(10, Math.sqrt(value[2]) * 0.26)),
          itemStyle: {
            color: 'rgba(56, 189, 248, 1)',
            shadowBlur: 18,
            shadowColor: 'rgba(56, 189, 248, 1)'
          },
          label: { show: false }
        },
        {
          name: '核心城市光柱',
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 6,
          silent: true,
          data: topCityData.map((metric) => ({
            name: metric.city,
            value: [metric.longitude, metric.latitude, metric.filings]
          })),
          symbol: 'path://M0,-28 L5,0 L0,28 L-5,0 Z',
          symbolSize: [10, 44],
          symbolOffset: [0, -18],
          itemStyle: {
            color: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 0.84)' : 'rgba(56, 189, 248, 0.82)',
            shadowBlur: 26,
            shadowColor: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 0.92)' : 'rgba(56, 189, 248, 0.92)',
            opacity: 0.9
          }
        },
        {
          name: '核心城市锚点',
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 6,
          silent: true,
          data: topCityData.map((metric) => ({
            name: metric.city,
            value: [metric.longitude, metric.latitude, metric.filings]
          })),
          symbol: 'circle',
          symbolSize: (value: number[]) => Math.max(8, Math.min(16, Math.sqrt(value[2]) * 0.32)),
          itemStyle: {
            color: (params: any) => CITY_COLORS[params.name] ?? '#00C2FF',
            borderColor: 'rgba(255,255,255,0.88)',
            borderWidth: 1,
            shadowBlur: 24,
            shadowColor: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 1)' : 'rgba(0, 229, 255, 1)'
          }
        },
        {
          name: '核心城市光晕',
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 7,
          data: topCityData.map((metric) => ({
            name: metric.city,
            value: [metric.longitude, metric.latitude, metric.filings]
          })),
          symbol: 'circle',
          symbolSize: (value: number[]) => Math.max(54, Math.min(88, Math.sqrt(value[2]) * 1.9)),
          itemStyle: {
            color: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 0.18)' : 'rgba(0, 183, 255, 0.16)',
            borderColor: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 0.82)' : 'rgba(0, 229, 255, 0.72)',
            borderWidth: 1.2,
            shadowBlur: 48,
            shadowColor: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 0.95)' : 'rgba(0, 229, 255, 0.9)'
          },
          silent: true
        },
        {
          name: '核心城市脉冲',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 8,
          data: topCityData.map((metric) => ({
            name: metric.city,
            value: [metric.longitude, metric.latitude, metric.filings]
          })),
          symbol: 'circle',
          symbolSize: (value: number[]) => Math.max(18, Math.min(34, Math.sqrt(value[2]) * 0.8)),
          rippleEffect: {
            period: 3.2,
            scale: 6,
            brushType: 'stroke',
            number: 4
          },
          itemStyle: {
            color: (params: any) => CITY_COLORS[params.name] ?? '#00C2FF',
            shadowBlur: 42,
            shadowColor: (params: any) =>
              params.name === '北京' || params.name === '广州' ? 'rgba(255, 209, 102, 1)' : 'rgba(0, 229, 255, 1)'
          },
          label: { show: false }
        },
        {
          name: '核心城市标签',
          type: 'scatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 9,
          silent: true,
          data: labelCityData.map((metric) => ({
            name: metric.city,
            value: [metric.longitude, metric.latitude, metric.filings],
            symbolSize: 1,
            label: {
              show: true,
              formatter: '{b}',
              position: LABEL_CONFIG[metric.city]?.position ?? 'right',
              offset: LABEL_CONFIG[metric.city]?.offset ?? [8, 0],
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              textShadowBlur: 10,
              textShadowColor: 'rgba(0,183,255,0.95)',
              textBorderColor: 'rgba(3, 16, 34, 0.9)',
              textBorderWidth: 2
            }
          })),
          symbol: 'circle',
          symbolSize: 1,
          itemStyle: {
            color: 'transparent',
            opacity: 0
          }
        },
        {
          name: 'selected-city-lock',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          geoIndex: 1,
          zlevel: 10,
          silent: true,
          data: selectedCityMetric
            ? [
                {
                  name: selectedCityMetric.city,
                  value: [selectedCityMetric.longitude, selectedCityMetric.latitude, selectedCityMetric.filings]
                }
              ]
            : [],
          symbol: 'circle',
          symbolSize: (value: number[]) => Math.max(24, Math.min(42, Math.sqrt(value[2]) * 0.92)),
          rippleEffect: {
            period: 2.8,
            scale: 8,
            brushType: 'stroke',
            number: 3
          },
          itemStyle: {
            color: '#FFD166',
            borderColor: '#FFFFFF',
            borderWidth: 1.2,
            shadowBlur: 36,
            shadowColor: 'rgba(255, 209, 102, 0.92)'
          },
          label: selectedCityMetric
            ? {
                show: true,
                formatter: '{b}',
                position: 'top',
                offset: [0, -18],
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                textShadowBlur: 12,
                textShadowColor: 'rgba(255, 209, 102, 0.92)',
                textBorderColor: 'rgba(3, 16, 34, 0.92)',
                textBorderWidth: 2
              }
            : { show: false }
        }
      ]
    });

    chart.off('click');
    chart.on('click', (params: any) => {
      if (params.seriesType === 'map' && typeof params.name === 'string') {
        onProvinceSelect(params.name);
      }
      if ((params.seriesType === 'scatter' || params.seriesType === 'effectScatter') && typeof params.name === 'string') {
        onCitySelect(params.name);
      }
    });

    const zr = chart.getZr();
    const blankHandler = (event: any) => {
      if (!event.target) onResetSelection();
    };
    zr.off('click', blankHandler as never);
    zr.on('click', blankHandler as never);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      zr.off('click', blankHandler as never);
      chart.dispose();
    };
  }, [
    cityLookup,
    cityMetricsAll,
    mapJson,
    onCitySelect,
    onProvinceSelect,
    onResetSelection,
    provinceMapData,
    selectedCity,
    selectedCityMetric,
    topCityMetrics
  ]);

  return (
    <section className="panel panel--map panel--map-twin">
      <div className="panel__header panel__header--inline panel__header--map-twin">
        <div>
          <p className="panel__eyebrow">空间主视觉</p>
          <h2 className="panel__title">AI 算法服务商星光网络热力图</h2>
          <p className="panel__footnote">省份热力表示备案规模，城市星点表示服务商集聚节点</p>
        </div>
        <div className="insight-pill">Top4 省份贡献全国约 {(top4ShareValue * 100).toFixed(1)}% 备案量</div>
      </div>

      <div className={`map-stage map-container${selectedTargetLabel ? ' is-locked' : ''}`}>
        <div className="map-stage__shell" />
        <div className="map-stage__viewport" />
        <div className="map-stage__rail map-stage__rail--top" />
        <div className="map-stage__rail map-stage__rail--bottom" />
        <div className="map-stage__corner map-stage__corner--tl" />
        <div className="map-stage__corner map-stage__corner--tr" />
        <div className="map-stage__corner map-stage__corner--bl" />
        <div className="map-stage__corner map-stage__corner--br" />
        <div className="map-stage__dock" />
        <div className="map-stage__dock-shadow" />
        <div className="map-stage__starfield" />
        <div className="map-stage__glow" />
        <div className="map-stage__core" />
        <div className="map-stage__terrain" />
        <div className="map-stage__scan map-stage__scan--left" />
        <div className="map-stage__scan map-stage__scan--right" />
        <div className="map-stage__frame map-stage__frame--left" />
        <div className="map-stage__frame map-stage__frame--right" />
        <div className="map-stage__focus-box map-stage__focus-box--a" />
        <div className="map-stage__focus-box map-stage__focus-box--b" />
        <div className="map-stage__ring-lines" />
        <div className="map-stage-glow map-stage__base-ring" />
        <div className="map-stage__legend">
          <span>高</span>
          <div className="map-stage__legend-bar" />
          <span>低</span>
        </div>

        <div className="map-stage__chart-shell">
          <div ref={chartRef} className="map-stage__chart echarts-map" />
        </div>

        <div className="south-sea-inset" aria-hidden="true">
          <div className="south-sea-inset__hud">
            <span className="south-sea-inset__title">South Sea</span>
            <span className="south-sea-inset__meta">Grid 09</span>
          </div>
          <svg viewBox="0 0 120 140">
            <path d="M24 24 L40 34 L56 48 L72 66 L68 90 L52 112" />
            <path d="M34 54 L45 71 L42 93" />
            <path d="M76 34 L84 50 L80 70" />
            <circle cx="24" cy="18" r="1.8" />
            <circle cx="42" cy="32" r="1.8" />
            <circle cx="58" cy="48" r="1.8" />
            <circle cx="72" cy="62" r="1.8" />
            <circle cx="64" cy="88" r="1.8" />
            <circle cx="44" cy="102" r="1.8" />
            <circle cx="30" cy="84" r="1.8" />
            <circle cx="80" cy="100" r="1.8" />
            <circle cx="88" cy="118" r="1.8" />
            <circle cx="54" cy="120" r="1.8" />
            <text x="30" y="128">南海诸岛</text>
          </svg>
        </div>

        <div className="map-year-switcher map-stage__timeline">
          <div className="map-stage__timeline-track" />
          <div className="map-stage__timeline-glow" />
          <div className="map-stage__timeline-meta">
            <span className="map-stage__timeline-kicker">TIME AXIS</span>
            <strong className="map-stage__timeline-title">{selectedYear}</strong>
          </div>
          <button type="button" className="map-stage__timeline-nav map-stage__timeline-nav--prev" aria-label="Previous year" onClick={handlePrevYear}>
            ‹
          </button>
          <button type="button" className="map-stage__timeline-nav map-stage__timeline-nav--next" aria-label="Next year" onClick={handleNextYear}>
            ›
          </button>
          <button type="button" className="map-stage__arrow" aria-label="上一年">
            ‹
          </button>
          {yearOptions.map((year) => (
            <button
              key={year}
              type="button"
              className={`map-stage__year${selectedYear === year ? ' is-active' : ''}`}
              onClick={() => onYearSelect(year)}
            >
              {year}
            </button>
          ))}
          <button type="button" className="map-stage__arrow" aria-label="下一年">
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
