import * as echarts from 'echarts';
import type { CityMetric, ProvinceMetric } from './types';

export function registerChinaMap(mapJson: object) {
  if (!echarts.getMap('china-dashboard')) {
    echarts.registerMap('china-dashboard', mapJson as never);
  }
}

export function buildProvinceTooltip(metric?: ProvinceMetric) {
  if (!metric) {
    return '<div class="map-tooltip"><div class="map-tooltip__title">省份</div><div>备案量：暂无数据</div></div>';
  }

  return `
    <div class="map-tooltip">
      <div class="map-tooltip__title">${metric.province}</div>
      <div>备案量：<strong>${metric.filings}</strong> 条</div>
      <div>企业数：<strong>${metric.companyCount}</strong> 家</div>
      <div>全国占比：<strong>${(metric.share * 100).toFixed(1)}%</strong></div>
      <div>主要算法类别：<strong>${metric.topCategory}</strong></div>
    </div>
  `;
}

export function buildCityTooltip(metric?: CityMetric) {
  if (!metric) {
    return '<div class="map-tooltip"><div class="map-tooltip__title">城市节点</div><div>备案量：暂无数据</div></div>';
  }

  return `
    <div class="map-tooltip">
      <div class="map-tooltip__title">${metric.city}</div>
      <div>所属省份：<strong>${metric.province}</strong></div>
      <div>备案量：<strong>${metric.filings}</strong> 条</div>
      <div>企业数：<strong>${metric.companyCount}</strong> 家</div>
      <div>全国占比：<strong>${(metric.share * 100).toFixed(1)}%</strong></div>
      <div>主要算法类别：<strong>${metric.topCategory}</strong></div>
    </div>
  `;
}
