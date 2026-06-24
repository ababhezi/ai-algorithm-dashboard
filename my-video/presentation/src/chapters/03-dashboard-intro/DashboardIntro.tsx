import type { ChapterStepProps } from "../../registry/types";
import "./DashboardIntro.css";

/**
 * Chapter 3 · dashboard-intro
 *
 * Walk through the data dashboard architecture: layout, KPIs,
 * interaction model, and temporal navigation. Uses the original
 * dashboard screenshot (`d:\数据大屏\初版\my-video\presentation\public\dashboard-screenshot.png`,
 * 3072×1672) with CSS zoom transforms — guaranteeing a pixel-faithful
 * match to the original design.
 *
 * Image aspect = 3072/1672 = 1.838. The wrapper is sized to 1920×1045
 * to match that ratio, then centered in the 1920×1080 stage-frame.
 * All overlays live INSIDE the wrapper so they share the same coordinate
 * space as the image and zoom with it.
 */

export function DashboardIntro({ step }: ChapterStepProps) {
  return (
    <div className="dbi-scene">
      {/* ── Step 0: teaser text ── */}
      {step === 0 && (
        <h2 className="dbi-intro-text">先看看大屏本身</h2>
      )}

      {/* ── Steps 1-4: dashboard screenshot with progressive zoom ── */}
      {step >= 1 && (
        <div className="dbi-iframe-stage">
          <div
            className={`dbi-iframe-wrapper ${
              step === 1
                ? "dbi-zoom-full"
                : step === 2
                  ? "dbi-zoom-full"
                  : step === 3
                    ? "dbi-zoom-kpi"
                    : "dbi-zoom-structural"
            }`}
          >
            <img
              src="/dashboard-screenshot.png"
              alt="AI算法备案数据大屏"
              className="dbi-screenshot"
            />

            {/* ── Step 2: layout zone highlights (overlaid on image) ── */}
            {step === 2 && (
              <div className="dbi-overlay">
                <div className="dbi-highlight dbi-highlight--header" />
                <div className="dbi-highlight dbi-highlight--kpi" />
                <div className="dbi-highlight dbi-highlight--left" />
                <div className="dbi-highlight dbi-highlight--center" />
                <div className="dbi-highlight dbi-highlight--right" />
                <div className="dbi-highlight dbi-highlight--bottom" />

                <div className="dbi-annot-label dbi-annot-label--header">
                  ① 标题栏 · 指令面板
                </div>
                <div className="dbi-annot-label dbi-annot-label--kpi">
                  ② KPI 指标卡 · 5 项核心数据
                </div>
                <div className="dbi-annot-label dbi-annot-label--left">
                  ③ 区域集群 · 城市排行
                </div>
                <div className="dbi-annot-label dbi-annot-label--center">
                  ④ 中国地图 · 核心交互中枢
                </div>
                <div className="dbi-annot-label dbi-annot-label--right">
                  ⑤ 专题面板 · 热点新闻 + 时间线条
                </div>
                <div className="dbi-annot-label dbi-annot-label--bottom">
                  ⑥ 六模块总线 · 总览 / 区域 / 算法 / 企业 / 预测 / 数据质量
                </div>
              </div>
            )}

            {/* ── Step 3: KPI card detail callouts ── */}
            {step === 3 && (
              <div className="dbi-overlay">
                <div className="dbi-kpi-callout dbi-kpi-callout--filing">
                  累计备案量<strong>8,008 条</strong>
                </div>
                <div className="dbi-kpi-callout dbi-kpi-callout--company">
                  独立企业数<strong>5,333 家</strong>
                </div>
                <div className="dbi-kpi-callout dbi-kpi-callout--city">
                  覆盖城市数<strong>127 座</strong>
                </div>
                <div className="dbi-kpi-callout dbi-kpi-callout--top4">
                  Top4 省份占比<strong>73.4%</strong>
                </div>
                <div className="dbi-kpi-callout dbi-kpi-callout--content">
                  内容生成占比<strong>89.0%</strong>
                </div>
              </div>
            )}

            {/* ── Step 4: interaction demo + structural callouts ── */}
            {step === 4 && (
              <div className="dbi-overlay">
                <div className="dbi-click-indicator dbi-click-indicator--gd" />
                <div className="dbi-arrow-annotation dbi-arrow-annotation--panel">
                  点击省份 → 右侧面板切换
                </div>
                <div className="dbi-struct-callout dbi-struct-callout--bus">
                  <strong>SYSTEM BUS</strong>
                  <span>六大模块总线 · 总览 / 区域 / 算法 / 企业 / 预测 / 数据质量</span>
                </div>
                <div className="dbi-struct-callout dbi-struct-callout--year">
                  <strong>年份切换</strong>
                  <span>2022 → 2026 · 地图热点逐年点亮全国</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
