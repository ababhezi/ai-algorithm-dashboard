import type { ChapterDef } from "./types";
import { Coldopen } from "../chapters/01-coldopen/Coldopen";
import { narrations as coldopenNarrations } from "../chapters/01-coldopen/narrations";
import { Background } from "../chapters/02-background/Background";
import { narrations as backgroundNarrations } from "../chapters/02-background/narrations";
import { DashboardIntro } from "../chapters/03-dashboard-intro/DashboardIntro";
import { narrations as dashboardIntroNarrations } from "../chapters/03-dashboard-intro/narrations";
import { GeoDistribution } from "../chapters/04-geo-distribution/GeoDistribution";
import { narrations as geoDistributionNarrations } from "../chapters/04-geo-distribution/narrations";
import { TrendIndustry } from "../chapters/05-trend-industry/TrendIndustry";
import { narrations as trendIndustryNarrations } from "../chapters/05-trend-industry/narrations";
import { Forecast } from "../chapters/06-forecast/Forecast";
import { narrations as forecastNarrations } from "../chapters/06-forecast/narrations";
import { Conclusions } from "../chapters/07-conclusions/Conclusions";
import { narrations as conclusionsNarrations } from "../chapters/07-conclusions/narrations";
import { Recommendations } from "../chapters/08-recommendations/Recommendations";
import { narrations as recommendationsNarrations } from "../chapters/08-recommendations/narrations";

export const CHAPTERS: ChapterDef[] = [
  { id: "coldopen", title: "开场", narrations: coldopenNarrations, Component: Coldopen },
  { id: "background", title: "背景", narrations: backgroundNarrations, Component: Background },
  { id: "dashboard-intro", title: "大屏全貌", narrations: dashboardIntroNarrations, Component: DashboardIntro },
  { id: "geo-distribution", title: "地理分布", narrations: geoDistributionNarrations, Component: GeoDistribution },
  { id: "trend-industry", title: "发展态势", narrations: trendIndustryNarrations, Component: TrendIndustry },
  { id: "forecast", title: "未来预测", narrations: forecastNarrations, Component: Forecast },
  { id: "conclusions", title: "短板分析", narrations: conclusionsNarrations, Component: Conclusions },
  { id: "recommendations", title: "对策建议", narrations: recommendationsNarrations, Component: Recommendations },
];
