export interface CleanedRecord {
  month: string;
  year: number;
  quarter: string;
  company: string;
  province: string | null;
  city: string | null;
  category: string | null;
  industry1: string | null;
  capital: number | null;
  longitude: number | null;
  latitude: number | null;
  generation: string | null;
}

export interface KPIItem {
  label: string;
  value: string;
  unit: string;
  caption: string;
}

export interface ProvinceMetric {
  province: string;
  filings: number;
  companyCount: number;
  share: number;
  cityCount: number;
  topCategory: string;
}

export interface CityMetric {
  city: string;
  province: string;
  filings: number;
  companyCount: number;
  share: number;
  topCategory: string;
  longitude: number;
  latitude: number;
}

export interface RegionClusterMetric {
  name: string;
  filings: number;
  companyCount: number;
  share: number;
  coreCities: string;
  feature: string;
}

export interface TrendPoint {
  label: string;
  filings: number;
  movingAverage: number;
  phase: string;
}

export interface QuarterTrendPoint {
  quarter: string;
  filings: number;
}

export interface YearCategoryPoint {
  year: string;
  values: Record<string, number>;
}

export interface CapitalBin {
  label: string;
  count: number;
}

export interface CapitalSummary {
  median: number;
  microShare: number;
  overHundredMillionShare: number;
  smallAndMediumShare: number;
  bins: CapitalBin[];
}

export interface InsightCardData {
  key: string;
  title: string;
  finding: string;
  suggestion: string;
  tone: 'warning' | 'accent' | 'positive' | 'neutral';
}

export interface ForecastNode {
  year: string;
  low: number;
  high: number;
}

export interface ForecastScenario {
  name: string;
  color: string;
  nodes: ForecastNode[];
}

export interface DataQualityItem {
  field: string;
  missing: number;
  valid: number;
  note: string;
}

export interface OverviewCategoryShare {
  label: string;
  value: number;
}

export interface DashboardDataset {
  kpis: KPIItem[];
  provinceMetrics: ProvinceMetric[];
  cityMetrics: CityMetric[];
  topCityMetrics: CityMetric[];
  topProvinceNames: string[];
  regionClusters: RegionClusterMetric[];
  monthlyTrend: TrendPoint[];
  quarterlyTrend: QuarterTrendPoint[];
  categoryOrder: string[];
  yearlyCategories: YearCategoryPoint[];
  capitalSummary: CapitalSummary;
  insightCards: InsightCardData[];
  forecastScenarios: ForecastScenario[];
  dataQuality: DataQualityItem[];
  top4ShareValue: number;
  contentGenShareValue: number;
  totalFilings: number;
  totalCompanies: number;
  coveredCities: number;
  overviewCategoryShares: OverviewCategoryShare[];
  unknownSummary: {
    provinceUnknown: number;
    cityUnknown: number;
    coordinateUnknown: number;
    categoryUnknown: number;
    industryUnknown: number;
  };
}
