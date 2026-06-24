import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { YearCategoryPoint } from '../utils/types';

interface AlgorithmStructureProps {
  yearlyCategories: YearCategoryPoint[];
  categoryOrder: string[];
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  内容生成: '#2F80ED',
  人机对话: '#4DA3FF',
  智能搜索: '#30C48D',
  智能推荐: '#7B8FA8',
  风险检测: '#F5A623',
  其他: '#7A8FAF'
};

export function AlgorithmStructure({ yearlyCategories, categoryOrder, compact = false }: AlgorithmStructureProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const keptCategories = categoryOrder.slice(0, 5);
    const categories = [...keptCategories, '其他'];
    const compressed = yearlyCategories.map((item) => {
      const other = Object.entries(item.values)
        .filter(([key]) => !keptCategories.includes(key))
        .reduce((sum, [, value]) => sum + value, 0);

      return {
        year: item.year,
        values: Object.fromEntries(
          categories.map((category) => [category, category === '其他' ? other : item.values[category] ?? 0])
        )
      };
    });

    chart.setOption({
      grid: { left: 34, right: 16, top: 46, bottom: 26, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(5, 18, 35, 0.96)',
        borderColor: 'rgba(56, 189, 248, 0.22)',
        borderWidth: 1
      },
      legend: {
        top: 4,
        icon: 'roundRect',
        itemWidth: 10,
        itemHeight: 8,
        textStyle: { color: '#8FAAC8', fontSize: 10 }
      },
      xAxis: {
        type: 'category',
        data: compressed.map((item) => item.year),
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
      series: categories.map((category) => ({
        name: category,
        type: 'bar',
        stack: 'total',
        barMaxWidth: compact ? 22 : 28,
        itemStyle: {
          color: CATEGORY_COLORS[category] ?? '#7A8FAF',
          borderRadius: [4, 4, 0, 0]
        },
        data: compressed.map((item) => item.values[category] ?? 0)
      }))
    });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [categoryOrder, compact, yearlyCategories]);

  return (
    <section className="panel panel--compact">
      <div className="panel__header">
        <p className="panel__eyebrow">算法结构</p>
        <h3 className="panel__title">算法主线从推荐分发转向生成、对话与搜索</h3>
      </div>
      <div ref={chartRef} className="chart chart--algorithm" />
    </section>
  );
}
