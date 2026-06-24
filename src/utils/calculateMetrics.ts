import type {
  CapitalSummary,
  CleanedRecord,
  DashboardDataset,
  DataQualityItem,
  ForecastScenario,
  InsightCardData,
  KPIItem,
  RegionClusterMetric,
  YearCategoryPoint
} from './types';

const CATEGORY_ORDER = ['内容生成', '人机对话', '智能搜索', '智能推荐', '风险检测', '数据分析', '内容审核', '身份认证', '其他'];

const REGION_DEFINITIONS = [
  { name: '京津冀', provinces: ['北京市', '天津市', '河北省'], coreCities: '北京', feature: '北京单核优势明显，科研与总部资源高度集聚。' },
  { name: '大湾区', provinces: ['广东省'], coreCities: '广州、深圳', feature: '双核驱动，应用转化与产业链协同能力突出。' },
  { name: '长三角', provinces: ['上海市', '江苏省', '浙江省'], coreCities: '上海、杭州', feature: '平台生态成熟，备案扩散节奏稳定。' },
  { name: '成渝', provinces: ['四川省', '重庆市'], coreCities: '成都、重庆', feature: '西部高能级节点持续抬升。' },
  { name: '中部城市群', provinces: ['湖北省', '湖南省', '江西省', '河南省', '安徽省'], coreCities: '武汉、合肥', feature: '区域承接能力增强，扩散势头明显。' }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(Math.round(value));
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function topCategory(records: CleanedRecord[]) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    const key = record.category ?? '未知/未回填';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '未知/未回填';
}

function uniqueCompanies(records: CleanedRecord[]) {
  return new Set(records.map((record) => record.company)).size;
}

function buildCapitalSummary(records: CleanedRecord[]): CapitalSummary {
  const capitalValues = records
    .map((record) => record.capital)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  const median =
    capitalValues.length === 0
      ? 0
      : capitalValues.length % 2 === 1
        ? capitalValues[Math.floor(capitalValues.length / 2)]
        : (capitalValues[capitalValues.length / 2 - 1] + capitalValues[capitalValues.length / 2]) / 2;

  const bins = [
    { label: '0-100万', min: 0, max: 100 },
    { label: '100-1000万', min: 100, max: 1000 },
    { label: '1000-5000万', min: 1000, max: 5000 },
    { label: '5000万-1亿', min: 5000, max: 10000 },
    { label: '1亿以上', min: 10000, max: Number.POSITIVE_INFINITY }
  ].map((bin) => ({
    label: bin.label,
    count: capitalValues.filter((value) => value >= bin.min && value < bin.max).length
  }));

  return {
    median,
    microShare: capitalValues.length ? capitalValues.filter((value) => value <= 100).length / capitalValues.length : 0,
    overHundredMillionShare: capitalValues.length
      ? capitalValues.filter((value) => value >= 10000).length / capitalValues.length
      : 0,
    smallAndMediumShare: capitalValues.length
      ? capitalValues.filter((value) => value > 100 && value < 5000).length / capitalValues.length
      : 0,
    bins
  };
}

function buildQualitySummary(records: CleanedRecord[]): DataQualityItem[] {
  const provinceMissing = records.filter((record) => !record.province).length;
  const cityMissing = records.filter((record) => !record.city).length;
  const coordinateMissing = records.filter((record) => record.longitude === null || record.latitude === null).length;
  const categoryMissing = records.filter((record) => !record.category).length;
  const industryMissing = records.filter((record) => !record.industry1).length;

  return [
    { field: '省份', missing: provinceMissing, valid: records.length - provinceMissing, note: '“未回填”与其他未知值统一计入未知，不参与省级热力和排行。' },
    { field: '城市', missing: cityMissing, valid: records.length - cityMissing, note: '城市星点和城市排行仅统计有效城市字段。' },
    { field: '经纬度', missing: coordinateMissing, valid: records.length - coordinateMissing, note: '无坐标记录不会参与地图点位渲染。' },
    { field: '算法类别', missing: categoryMissing, valid: records.length - categoryMissing, note: '未知类别独立计数，不参与主类别排序。' },
    { field: '行业一级', missing: industryMissing, valid: records.length - industryMissing, note: '行业结构分析仅基于有效行业字段。' }
  ];
}

function buildOverviewCategoryShares(records: CleanedRecord[]) {
  const total = records.length;
  const counts = new Map<string, number>();

  records.forEach((record) => {
    const key = record.category ?? '未知/未回填';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const topFour = sorted.slice(0, 4);
  const rest = sorted.slice(4).reduce((sum, [, value]) => sum + value, 0);
  const merged = rest > 0 ? [...topFour, ['其他', rest] as const] : topFour;

  return merged.map(([label, value]) => ({
    label,
    value: total ? Number(((value / total) * 100).toFixed(1)) : 0
  }));
}

function buildForecastScenarios(records: CleanedRecord[]): ForecastScenario[] {
  const annualCounts = new Map<number, number>();
  records.forEach((record) => {
    annualCounts.set(record.year, (annualCounts.get(record.year) ?? 0) + 1);
  });

  const years = [...annualCounts.keys()].sort((a, b) => a - b);
  const latestYear = years[years.length - 1] ?? 2026;
  const latestCount = annualCounts.get(latestYear) ?? records.length;
  const previousCount = annualCounts.get(latestYear - 1) ?? Math.max(Math.round(latestCount * 0.82), 1);
  const observedGrowth = previousCount > 0 ? (latestCount - previousCount) / previousCount : 0.15;

  const baselineRate = clamp(observedGrowth * 0.55 + 0.12, 0.08, 0.24);
  const optimisticRate = clamp(baselineRate + 0.08, 0.14, 0.34);
  const pessimisticRate = clamp(baselineRate - 0.08, -0.12, 0.18);

  const makeNodes = (rate: number) => {
    const anchor = [
      { year: latestYear, step: 0, volatility: 0.08 },
      { year: latestYear + 2, step: 2, volatility: 0.1 },
      { year: latestYear + 4, step: 4, volatility: 0.12 }
    ];

    return anchor.map(({ year, step, volatility }) => {
      const mid = Math.round(latestCount * (1 + rate) ** step);
      return {
        year: String(year),
        low: Math.round(mid * (1 - volatility)),
        high: Math.round(mid * (1 + volatility))
      };
    });
  };

  return [
    { name: '稳态情景', color: '#1E88FF', nodes: makeNodes(baselineRate) },
    { name: '加速情景', color: '#30C48D', nodes: makeNodes(optimisticRate) },
    { name: '收紧情景', color: '#FF6B4A', nodes: makeNodes(pessimisticRate) }
  ];
}

export function calculateDashboardData(records: CleanedRecord[]): DashboardDataset {
  const totalFilings = records.length;
  const totalCompanies = uniqueCompanies(records);
  const coveredCities = new Set(records.map((record) => record.city).filter(Boolean)).size;
  const contentGenShareValue = totalFilings
    ? records.filter((record) => record.category === '内容生成').length / totalFilings
    : 0;

  const provinceGroups = new Map<string, CleanedRecord[]>();
  const cityGroups = new Map<string, CleanedRecord[]>();

  records.forEach((record) => {
    if (record.province) {
      const provinceRecords = provinceGroups.get(record.province) ?? [];
      provinceRecords.push(record);
      provinceGroups.set(record.province, provinceRecords);
    }

    if (record.province && record.city) {
      const cityKey = `${record.province}__${record.city}`;
      const cityRecords = cityGroups.get(cityKey) ?? [];
      cityRecords.push(record);
      cityGroups.set(cityKey, cityRecords);
    }
  });

  const provinceMetrics = [...provinceGroups.entries()]
    .map(([province, provinceRecords]) => ({
      province,
      filings: provinceRecords.length,
      companyCount: uniqueCompanies(provinceRecords),
      share: totalFilings ? provinceRecords.length / totalFilings : 0,
      cityCount: new Set(provinceRecords.map((record) => record.city).filter(Boolean)).size,
      topCategory: topCategory(provinceRecords)
    }))
    .sort((a, b) => b.filings - a.filings);

  const cityMetrics = [...cityGroups.entries()]
    .map(([key, cityRecords]) => {
      const [province, city] = key.split('__');
      const coordinateSeed = cityRecords.find((record) => record.longitude !== null && record.latitude !== null);
      return {
        city,
        province,
        filings: cityRecords.length,
        companyCount: uniqueCompanies(cityRecords),
        share: totalFilings ? cityRecords.length / totalFilings : 0,
        topCategory: topCategory(cityRecords),
        longitude: coordinateSeed?.longitude ?? 0,
        latitude: coordinateSeed?.latitude ?? 0
      };
    })
    .filter((metric) => metric.longitude !== 0 && metric.latitude !== 0)
    .sort((a, b) => b.filings - a.filings);

  const topCityMetrics = cityMetrics.slice(0, 20);
  const topProvinceNames = provinceMetrics.slice(0, 4).map((metric) => metric.province);
  const top4ShareValue =
    provinceMetrics
      .slice(0, 4)
      .reduce((sum, metric) => sum + metric.filings, 0) / Math.max(totalFilings, 1);

  const regionClusters: RegionClusterMetric[] = REGION_DEFINITIONS.map((region) => {
    const regionRecords = records.filter((record) => record.province && region.provinces.includes(record.province));
    return {
      name: region.name,
      filings: regionRecords.length,
      companyCount: uniqueCompanies(regionRecords),
      share: totalFilings ? regionRecords.length / totalFilings : 0,
      coreCities: region.coreCities,
      feature: region.feature
    };
  });

  const monthBuckets = new Map<string, number>();
  records.forEach((record) => {
    monthBuckets.set(record.month, (monthBuckets.get(record.month) ?? 0) + 1);
  });

  const sortedMonths = [...monthBuckets.keys()].sort();
  const monthCounts = sortedMonths.map((month) => monthBuckets.get(month) ?? 0);
  const movingAverage = monthCounts.map((_, index) => {
    const start = Math.max(0, index - 2);
    const slice = monthCounts.slice(start, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });

  const monthlyTrend = sortedMonths.map((month, index) => {
    const year = Number(month.slice(0, 4));
    let phase = '高位运行';
    if (year === 2022) phase = '合规启动';
    if (year === 2023) phase = '生成式 AI 启动';
    if (year === 2024) phase = '集中爆发';
    if (year === 2025) phase = '增量扩散';
    if (year === 2026) phase = '高位运行与局部回填';

    return {
      label: month,
      filings: monthCounts[index],
      movingAverage: movingAverage[index],
      phase
    };
  });

  const quarterTrendMap = new Map<string, number>();
  records.forEach((record) => {
    quarterTrendMap.set(record.quarter, (quarterTrendMap.get(record.quarter) ?? 0) + 1);
  });
  const quarterlyTrend = [...quarterTrendMap.entries()]
    .map(([quarter, filings]) => ({ quarter, filings }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  const yearlyCategoryMap = new Map<string, Map<string, number>>();
  records.forEach((record) => {
    const yearKey = String(record.year);
    const category = record.category ?? '其他';
    const bucket = yearlyCategoryMap.get(yearKey) ?? new Map<string, number>();
    bucket.set(category, (bucket.get(category) ?? 0) + 1);
    yearlyCategoryMap.set(yearKey, bucket);
  });

  const yearlyCategories: YearCategoryPoint[] = [...yearlyCategoryMap.entries()]
    .map(([year, counts]) => ({
      year,
      values: Object.fromEntries(CATEGORY_ORDER.map((category) => [category, counts.get(category) ?? 0]))
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

  const capitalSummary = buildCapitalSummary(records);
  const qualitySummary = buildQualitySummary(records);
  const overviewCategoryShares = buildOverviewCategoryShares(records);
  const forecastScenarios = buildForecastScenarios(records);

  const industryConcentration = totalFilings
    ? records.filter(
        (record) =>
          record.industry1 === '信息传输、软件和信息技术服务业' || record.industry1 === '科学研究和技术服务业'
      ).length / totalFilings
    : 0;

  const generationKnown = records.filter((record) => record.generation);
  const g4Share = generationKnown.length
    ? generationKnown.filter((record) => record.generation === 'G4').length / generationKnown.length
    : 0;
  const g1Share = generationKnown.length
    ? generationKnown.filter((record) => record.generation === 'G1').length / generationKnown.length
    : 0;

  const insightCards: InsightCardData[] = [
    {
      key: 'region',
      title: '区域集聚',
      finding: `前四省份合计占比 ${formatPercent(top4ShareValue)}，头部地区集聚仍然明显。`,
      suggestion: '继续关注核心省份之外的区域承接节点，观察备案扩散是否形成第二梯队。',
      tone: 'warning'
    },
    {
      key: 'industry',
      title: '行业渗透',
      finding: `ICT 与科技服务相关主体约占 ${formatPercent(industryConcentration)}。`,
      suggestion: '传统行业场景仍有扩展空间，可持续补充制造、医疗、教育等领域的备案观察。',
      tone: 'accent'
    },
    {
      key: 'innovation',
      title: '技术代际',
      finding: `已知代际记录中 G4 占比约 ${formatPercent(g4Share)}，G1 约 ${formatPercent(g1Share)}。`,
      suggestion: '适合把高代际算法和场景落地一起看，避免只看总量忽略结构变化。',
      tone: 'neutral'
    },
    {
      key: 'scale',
      title: '企业规模',
      finding: `注册资本 100 万以内主体约占 ${formatPercent(capitalSummary.microShare)}，长尾结构清晰。`,
      suggestion: '中小主体是备案扩散的重要承接层，后续可继续跟踪其城市分布变化。',
      tone: 'positive'
    }
  ];

  const kpis: KPIItem[] = [
    { label: '累计备案量', value: formatNumber(totalFilings), unit: '条', caption: '按备案记录统计' },
    { label: '独立企业数', value: formatNumber(totalCompanies), unit: '家', caption: '按企业名称去重' },
    { label: '覆盖城市数', value: formatNumber(coveredCities), unit: '座', caption: '仅统计有效城市字段' },
    { label: 'Top4 省份占比', value: (top4ShareValue * 100).toFixed(1), unit: '%', caption: '按备案量自动识别头部四省份' },
    { label: '内容生成算法占比', value: (contentGenShareValue * 100).toFixed(1), unit: '%', caption: '按算法类别_LLM 统计' }
  ];

  return {
    kpis,
    provinceMetrics,
    cityMetrics,
    topCityMetrics,
    topProvinceNames,
    regionClusters,
    monthlyTrend,
    quarterlyTrend,
    categoryOrder: CATEGORY_ORDER,
    yearlyCategories,
    capitalSummary,
    insightCards,
    forecastScenarios,
    dataQuality: qualitySummary,
    top4ShareValue,
    contentGenShareValue,
    totalFilings,
    totalCompanies,
    coveredCities,
    overviewCategoryShares,
    unknownSummary: {
      provinceUnknown: qualitySummary[0].missing,
      cityUnknown: qualitySummary[1].missing,
      coordinateUnknown: qualitySummary[2].missing,
      categoryUnknown: qualitySummary[3].missing,
      industryUnknown: qualitySummary[4].missing
    }
  };
}

export function buildMetricsSnapshot(dataset: DashboardDataset) {
  return {
    totalFilings: dataset.totalFilings,
    totalCompanies: dataset.totalCompanies,
    coveredCities: dataset.coveredCities,
    top4Share: Number(dataset.top4ShareValue.toFixed(4)),
    contentGenShare: Number(dataset.contentGenShareValue.toFixed(4)),
    topProvinceNames: dataset.topProvinceNames,
    topCities: dataset.topCityMetrics.slice(0, 10).map((item) => ({
      city: item.city,
      filings: item.filings
    }))
  };
}
