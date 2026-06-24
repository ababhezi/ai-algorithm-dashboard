import { useEffect, useMemo, useState } from 'react';
import { Boxes, Download } from 'lucide-react';
import { AlgorithmStructure } from './components/AlgorithmStructure';
import { ChinaMap } from './components/ChinaMap';
import { CityRanking } from './components/CityRanking';
import { CompanyQualityPanel } from './components/CompanyQualityPanel';
import { DashboardModal } from './components/DashboardModal';
import { DataQualityNote } from './components/DataQualityNote';
import { ForecastChart } from './components/ForecastChart';
import { GeoDetailPanel } from './components/GeoDetailPanel';
import { KPICard } from './components/KPICard';
import { NationalOverviewPanel } from './components/NationalOverviewPanel';
import { QualitySummaryPanel } from './components/QualitySummaryPanel';
import { RegionCluster } from './components/RegionCluster';
import { RegionFocusPanel } from './components/RegionFocusPanel';
import { RegionRoseKpi } from './components/RegionRoseKpi';
import { ThemeTabs } from './components/ThemeTabs';
import { buildMetricsSnapshot, calculateDashboardData } from './utils/calculateMetrics';
import { loadAndCleanCsv } from './utils/cleanData';
import { PolicyRecommendations } from './components/PolicyRecommendations';
import type { CleanedRecord, DashboardDataset } from './utils/types';

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const DEFAULT_UPDATE_TIME = '2026-06-12 07:48:00';

type DetailTab = 'overview' | 'region' | 'algorithm' | 'company' | 'forecast' | 'quality' | 'recommend';
type GeoSelection = { type: 'province' | 'city'; name: string } | null;
type ModalState = 'regions' | 'quality' | 'algorithm' | 'company' | 'forecast' | null;

function uniqueCompanies(records: CleanedRecord[]) {
  return new Set(records.map((record) => record.company)).size;
}

function summarizeCategories(records: CleanedRecord[]) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    const key = record.category ?? '其他';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const topFive = sorted.slice(0, 5);
  const rest = sorted.slice(5).reduce((sum, [, value]) => sum + value, 0);
  const merged = rest > 0 ? [...topFive, ['其他', rest] as const] : topFive;
  const total = merged.reduce((sum, [, value]) => sum + value, 0);

  return merged.map(([name, value]) => ({
    name,
    value,
    share: total ? value / total : 0
  }));
}

function summarizeYearlyTrend(records: CleanedRecord[]) {
  const years = [...new Set(records.map((record) => String(record.year)))].sort();
  return years.map((year) => ({
    name: year,
    value: records.filter((record) => String(record.year) === year).length
  }));
}

function summarizeTopCities(records: CleanedRecord[]) {
  const cityMap = new Map<string, number>();
  records.forEach((record) => {
    if (!record.city) return;
    cityMap.set(record.city, (cityMap.get(record.city) ?? 0) + 1);
  });

  return [...cityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
}

function topCategory(records: CleanedRecord[]) {
  return summarizeCategories(records)[0]?.name ?? '未知';
}

function App() {
  const [records, setRecords] = useState<CleanedRecord[]>([]);
  const [dataset, setDataset] = useState<DashboardDataset | null>(null);
  const [mapJson, setMapJson] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selection, setSelection] = useState<GeoSelection>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [cleanedRecords, geoJson] = await Promise.all([
          loadAndCleanCsv('/data/algorithm_filing.csv'),
          fetch('/data/china.json').then((response) => {
            if (!response.ok) {
              throw new Error('中国地图数据加载失败');
            }
            return response.json();
          })
        ]);

        if (cancelled) return;

        const yearOptions = [...new Set(cleanedRecords.map((record) => String(record.year)))].sort();
        setRecords(cleanedRecords);
        setDataset(calculateDashboardData(cleanedRecords));
        setMapJson(geoJson);
        setSelectedYear(yearOptions[yearOptions.length - 1] ?? '');
      } catch (reason) {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : '数据加载失败');
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / DESIGN_WIDTH;
      const scaleY = window.innerHeight / DESIGN_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const yearOptions = useMemo(
    () => [...new Set(records.map((record) => String(record.year)))].sort(),
    [records]
  );
  const selectionTransitionKey = selection ? `${selection.type}-${selection.name}-${selectedYear}` : `idle-${selectedYear}-${activeTab}`;
  const currentScopeLabel = selection ? (selection.type === 'province' ? 'PROVINCE FOCUS' : 'CITY FOCUS') : 'NATIONAL GRID';
  const currentSelectionLabel = selection?.name ?? '全国总览';

  const previewKpis = useMemo(
    () => ['累计备案量', '独立企业数', '覆盖城市数', 'Top4 省份占比'],
    []
  );

  const headerKpis = useMemo(
    () => dataset?.kpis.filter((item) => item.label !== '内容生成算法占比') ?? [],
    [dataset]
  );

  const yearRecords = useMemo(
    () => records.filter((record) => String(record.year) === selectedYear),
    [records, selectedYear]
  );

  const yearDataset = useMemo(
    () => (yearRecords.length ? calculateDashboardData(yearRecords) : null),
    [yearRecords]
  );

  const geoDetail = useMemo(() => {
    if (!dataset || !yearDataset || !selection) return null;

    const currentYearSubset = yearRecords.filter((record) =>
      selection.type === 'province' ? record.province === selection.name : record.city === selection.name
    );
    const allYearSubset = records.filter((record) =>
      selection.type === 'province' ? record.province === selection.name : record.city === selection.name
    );
    if (!currentYearSubset.length || !allYearSubset.length) return null;

    const previousYear = String(Number(selectedYear) - 1);
    const previousSubset = records.filter((record) => {
      if (String(record.year) !== previousYear) return false;
      return selection.type === 'province' ? record.province === selection.name : record.city === selection.name;
    });

    const rank =
      selection.type === 'province'
        ? yearDataset.provinceMetrics.findIndex((item) => item.province === selection.name)
        : yearDataset.cityMetrics.findIndex((item) => item.city === selection.name);

    return {
      kind: selection.type,
      name: selection.name,
      filings: currentYearSubset.length,
      companyCount: uniqueCompanies(currentYearSubset),
      share: yearDataset.totalFilings ? currentYearSubset.length / yearDataset.totalFilings : 0,
      yoyGrowth:
        previousSubset.length > 0 ? ((currentYearSubset.length - previousSubset.length) / previousSubset.length) * 100 : null,
      topCategory: topCategory(currentYearSubset),
      rankLabel: rank >= 0 ? `全国第 ${rank + 1} 位` : undefined,
      topCities: selection.type === 'province' ? summarizeTopCities(currentYearSubset) : [],
      categories: summarizeCategories(currentYearSubset),
      yearlyTrend: summarizeYearlyTrend(allYearSubset)
    };
  }, [dataset, records, selectedYear, selection, yearDataset, yearRecords]);

  const tabOptions = useMemo(
    () => [
      { key: 'overview', label: '总览', subtitle: '全局概览' },
      { key: 'region', label: '区域', subtitle: '区域分析' },
      { key: 'algorithm', label: '算法', subtitle: '算法分析' },
      { key: 'company', label: '企业', subtitle: '企业分析' },
      { key: 'forecast', label: '预测', subtitle: '趋势预测' },
      { key: 'quality', label: '数据质量', subtitle: '质量评估' },
      { key: 'recommend', label: '建议', subtitle: '对策建议' }
    ],
    []
  );

  const handleExport = () => {
    if (!dataset) return;
    const snapshot = {
      exportedAt: new Date().toISOString(),
      selectedYear,
      activeTab,
      selection,
      metrics: buildMetricsSnapshot(dataset)
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `china-ai-dashboard-${selectedYear || 'latest'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderRightPanel = () => {
    if (!dataset || !yearDataset) return null;

    if (selection && geoDetail) {
      return (
        <GeoDetailPanel
          kind={geoDetail.kind}
          name={geoDetail.name}
          yearLabel={selectedYear}
          filings={geoDetail.filings}
          companyCount={geoDetail.companyCount}
          share={geoDetail.share}
          yoyGrowth={geoDetail.yoyGrowth}
          topCategory={geoDetail.topCategory}
          rankLabel={geoDetail.rankLabel}
          topCities={geoDetail.topCities}
          categories={geoDetail.categories}
          yearlyTrend={geoDetail.yearlyTrend}
          qualitySummary={dataset.unknownSummary}
          totalFilings={dataset.totalFilings}
          onReset={() => setSelection(null)}
          onOpenQuality={() => setModal('quality')}
        />
      );
    }

    if (activeTab === 'overview') {
      return (
        <NationalOverviewPanel
          totalFilings={dataset.totalFilings}
          totalCompanies={dataset.totalCompanies}
          top4ShareValue={dataset.top4ShareValue}
          contentGenShareValue={dataset.contentGenShareValue}
          overviewCategoryShares={dataset.overviewCategoryShares}
          onOpenAlgorithm={() => {
            setActiveTab('algorithm');
            setModal('algorithm');
          }}
        />
      );
    }

    if (activeTab === 'region') {
      return <RegionFocusPanel clusters={dataset.regionClusters} />;
    }

    if (activeTab === 'algorithm') {
      return <AlgorithmStructure yearlyCategories={dataset.yearlyCategories} categoryOrder={dataset.categoryOrder} compact />;
    }

    if (activeTab === 'company') {
      return (
        <CompanyQualityPanel
          capitalSummary={dataset.capitalSummary}
          unknownSummary={dataset.unknownSummary}
          totalFilings={dataset.totalFilings}
          onOpenCompany={() => setModal('company')}
          onOpenQuality={() => setModal('quality')}
        />
      );
    }

    if (activeTab === 'forecast') {
      return <ForecastChart scenarios={dataset.forecastScenarios} compact />;
    }

    if (activeTab === 'recommend') {
      return <PolicyRecommendations />;
    }

    return (
      <QualitySummaryPanel
        summaryText="“未回填”、空值、'-'、'--'、'\\N' 已统一按未知处理；地图、排行与结构图只使用有效字段。"
        items={dataset.dataQuality}
      />
    );
  };

  const renderModalContent = () => {
    if (!dataset || !modal) return null;

    if (modal === 'regions') {
      return (
        <DashboardModal title="区域集群详情" subtitle="完整查看五大区域扩散结构" onClose={() => setModal(null)}>
          <div className="modal-panel-wrap">
            <RegionCluster clusters={dataset.regionClusters} />
          </div>
        </DashboardModal>
      );
    }

    if (modal === 'quality') {
      return (
        <DashboardModal title="数据质量详情" subtitle="“未回填”与未知值已统一计数" onClose={() => setModal(null)}>
          <div className="modal-panel-wrap">
            <DataQualityNote items={dataset.dataQuality} />
          </div>
        </DashboardModal>
      );
    }

    if (modal === 'algorithm') {
      return (
        <DashboardModal title="算法结构详情" subtitle="查看年度结构变化" onClose={() => setModal(null)}>
          <div className="modal-panel-wrap">
            <AlgorithmStructure yearlyCategories={dataset.yearlyCategories} categoryOrder={dataset.categoryOrder} />
          </div>
        </DashboardModal>
      );
    }

    if (modal === 'company') {
      return (
        <DashboardModal title="企业规模详情" subtitle="查看注册资本分布与长尾结构" onClose={() => setModal(null)}>
          <div className="modal-panel-wrap">
            <CompanyQualityPanel
              capitalSummary={dataset.capitalSummary}
              unknownSummary={dataset.unknownSummary}
              totalFilings={dataset.totalFilings}
              onOpenCompany={() => undefined}
              onOpenQuality={() => setModal('quality')}
            />
          </div>
        </DashboardModal>
      );
    }

    return (
      <DashboardModal title="趋势预测详情" subtitle="基于现有备案节奏的三情景研判" onClose={() => setModal(null)}>
        <div className="modal-panel-wrap">
          <ForecastChart scenarios={dataset.forecastScenarios} />
        </div>
      </DashboardModal>
    );
  };

  if (error) {
    return (
      <div className="screen-wrapper">
        <main
          className="dashboard-canvas dashboard-canvas--center"
          style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})` }}
        >
          <div className="error-state">
            <h1>中国人工智能算法服务商发展态势数据大屏</h1>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!dataset || !mapJson || !yearDataset) {
    return (
      <div className="screen-wrapper">
        <main
          className="dashboard-canvas"
          style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})` }}
        >
          <div className="dashboard-shell dashboard-shell--center">
            <div className="dashboard-loading">
              <div className="dashboard-loading__brand">
                <Boxes size={24} />
                <span>正在整理补全版备案数据与地图主视图</span>
              </div>
              <div className="dashboard-loading__kpis">
                {previewKpis.map((item) => (
                  <div key={item} className="dashboard-loading__card">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="screen-wrapper">
      <main
        className="dashboard-canvas"
        style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})` }}
      >
        <div className="dashboard-shell">
          <div className="dashboard-backdrop" />
          <div className="dashboard-layout dashboard-layout--reference">
            <header className="dashboard-header dashboard-header--reference">
              <div className="dashboard-command-ribbon">
                <div className="command-pill">
                  <span className="command-pill__label">RUN MODE</span>
                  <strong className="command-pill__value">Command Center</strong>
                </div>
                <div className="command-pill command-pill--active">
                  <span className="command-pill__label">SCOPE</span>
                  <strong className="command-pill__value">{currentScopeLabel}</strong>
                </div>
                <div className="command-pill">
                  <span className="command-pill__label">YEAR</span>
                  <strong className="command-pill__value">{selectedYear || '--'}</strong>
                </div>
              </div>
              <div className="header-top">
                <div className="header-top__code">CN / AI / ALGO / FILING / STRATEGIC BOARD</div>
                <div className="dashboard-title__main main-title">中国人工智能算法服务商发展态势数据大屏</div>
                <div className="header-glow-line">
                  <span />
                </div>
              </div>

              <div className="dashboard-header__side header-meta">
                <div className="header-meta__focus">
                  <span>锁定对象</span>
                  <strong>{currentSelectionLabel}</strong>
                </div>
                <div className="dashboard-header__meta">数据更新：{DEFAULT_UPDATE_TIME}</div>
                <button type="button" className="export-button export-btn" onClick={handleExport}>
                  <Download size={16} />
                  <span>导出</span>
                </button>
              </div>

              <div className="dashboard-kpis kpi-grid kpi-strip dashboard-kpis--with-rose">
                {headerKpis.map((item) => (
                  <KPICard key={item.label} item={item} />
                ))}
                <RegionRoseKpi clusters={dataset.regionClusters} />
              </div>
            </header>

            <div className="dashboard-main dashboard-main--reference">
              <aside className={`dashboard-left-rail${selection ? ' is-linked' : ''}`}>
                <RegionCluster clusters={dataset.regionClusters} />
                <div key={`ranking-${selectionTransitionKey}`} className="panel-transition-stage panel-transition-stage--left">
                  <CityRanking
                    cities={dataset.topCityMetrics}
                    selectedCity={selection?.type === 'city' ? selection.name : null}
                    selectionLabel={selection?.name ?? null}
                    selectionType={selection?.type ?? null}
                  />
                </div>
              </aside>

              <section className="dashboard-center-stage">
                <ChinaMap
                  mapJson={mapJson}
                  provinceMetrics={yearDataset.provinceMetrics}
                  topCityMetrics={yearDataset.topCityMetrics}
                  cityMetricsAll={yearDataset.cityMetrics}
                  topProvinceNames={yearDataset.topProvinceNames}
                  top4ShareValue={yearDataset.top4ShareValue}
                  selectedProvince={selection?.type === 'province' ? selection.name : null}
                  selectedCity={selection?.type === 'city' ? selection.name : null}
                  selectedYear={selectedYear}
                  yearOptions={yearOptions}
                  onYearSelect={setSelectedYear}
                  onProvinceSelect={(province) => {
                    setActiveTab('overview');
                    setSelection({ type: 'province', name: province });
                  }}
                  onCitySelect={(city) => {
                    setActiveTab('overview');
                    setSelection({ type: 'city', name: city });
                  }}
                  onResetSelection={() => setSelection(null)}
                />
              </section>

              <aside className={`dashboard-right-rail${selection ? ' is-linked' : ''}`}>
                <div key={`detail-${selectionTransitionKey}`} className="panel-transition-stage panel-transition-stage--right">
                  {renderRightPanel()}
                </div>
              </aside>
            </div>

            <footer className="dashboard-bottom-nav">
              <div className="dashboard-bottom-nav__rail">
                <div className="dashboard-bottom-nav__meta">
                  <span className="dashboard-bottom-nav__kicker">SYSTEM BUS</span>
                  <strong className="dashboard-bottom-nav__title">专题模块总线</strong>
                </div>
              </div>
              <ThemeTabs
                activeKey={activeTab}
                options={tabOptions}
                onChange={(key) => {
                  setSelection(null);
                  setActiveTab(key as DetailTab);
                }}
              />
            </footer>
          </div>
          {renderModalContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
