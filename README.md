# 中国人工智能算法服务商发展态势数据大屏

一个基于 `Vite + React + TypeScript + ECharts + SCSS` 的课程数据可视化大屏项目，围绕 2022.8—2026.5 国家网信办 17 批算法备案数据，呈现我国 AI 算法服务商的空间分布、时间演化、结构转向与趋势判断。

## 运行方式

```bash
npm install
npm run prepare:data
npm run dev
```

默认开发地址为 [http://127.0.0.1:3000](http://127.0.0.1:3000)。

## 数据来源

- `public/data/algorithm_filing.csv`
- `中国AI算法服务商分析报告_优化版.md`
- `policy_outputs.zip`

## 主要设计方向

- 浅色高级产业监测大屏
- 中心中国地图作为主叙事
- 左右两翼围绕空间主图展开
- 底部补充短板洞察、规模结构、未来情景和数据质量说明

## 项目结构

```text
src/
  components/
  styles/
  utils/
  App.tsx
  main.tsx
public/
  data/
scripts/
  generateArtifacts.mjs
```

## 数据清洗逻辑

- 统一使用 `备案月份` 作为时间趋势口径
- 省份名称归一化：`广东/广东省 -> 广东省`、`北京/北京市 -> 北京市` 等
- 城市名称归一化：`北京市 -> 北京`、`广州市 -> 广州`、`深圳市 -> 深圳` 等
- `-`、`--`、`国家`、空值视作未知或未回填
- 企业数按企业名称去重
- 备案量按记录数统计
- 注册资本保留极端值，但核心展示使用中位数与分箱结构

## 交付文件

- `dashboard_metrics.json`
- `data_quality_summary.csv`
- `cleaned_policy_results_summary.md`
- `province_core_did_summary.txt`
- `monthly_counts_redraw.png`
- `event_study_plot.png`
- `placebo_distribution.png`

## 备注

若地图文件缺失，请确认 `public/data/china.json` 已存在。该项目优先使用 ECharts GeoJSON 地图，不依赖外部地图 API。
