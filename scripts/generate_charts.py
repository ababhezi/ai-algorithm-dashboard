#!/usr/bin/env python3
"""生成选题报告所需的所有分析图表，输出至 ./figures/ 目录"""

import os
import sys
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import seaborn as sns
from collections import Counter

# ── 全局样式 ──────────────────────────────────────────────
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Microsoft YaHei', 'SimHei', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei', 'Arial'],
    'axes.unicode_minus': False,
    'figure.dpi': 150,
    'savefig.dpi': 150,
    'savefig.bbox': 'tight',
    'savefig.facecolor': 'white',
})

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'figures')
os.makedirs(OUTPUT_DIR, exist_ok=True)

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'data', 'algorithm_filing.csv')

# ── 配色 ──────────────────────────────────────────────────
PALETTE = {
    'primary': '#1E88FF',
    'accent': '#30C48D',
    'warn': '#FF6B4A',
    'gold': '#FFD166',
    'purple': '#7C5CFC',
    'cyan': '#00E5FF',
    'dark': '#0A1628',
    'grey': '#8FAAC8',
}
CATEGORY_COLORS = ['#1E88FF', '#30C48D', '#FF6B4A', '#FFD166', '#7C5CFC', '#00E5FF', '#F5A623', '#E040FB', '#90A4AE']


def load_data():
    df = pd.read_csv(CSV_PATH)
    # 清理
    df['备案月份'] = df['备案月份'].astype(str).str.strip()
    df['year'] = df['备案月份'].str[:4].astype(int)
    df['month_label'] = df['备案月份']
    # 省份归一化
    province_map = {
        '北京': '北京市', '北京市': '北京市',
        '上海': '上海市', '上海市': '上海市',
        '天津': '天津市', '天津市': '天津市',
        '重庆': '重庆市', '重庆市': '重庆市',
        '广东': '广东省', '广东省': '广东省',
        '浙江': '浙江省', '浙江省': '浙江省',
        '江苏': '江苏省', '江苏省': '江苏省',
        '四川': '四川省', '四川省': '四川省',
        '湖北': '湖北省', '湖北省': '湖北省',
    }
    df['province_clean'] = df['省份'].map(province_map).fillna(df['省份'])
    invalid_province = {'', '-', '--', '国家', '未知', '未知省份', '未回填', np.nan}
    df.loc[df['province_clean'].isin(invalid_province), 'province_clean'] = None
    # 城市清理
    invalid_city = {'', '-', '--', '未知', '未知城市', '未回填', np.nan}
    df['city_clean'] = df['城市'].astype(str).str.replace('市$', '', regex=True)
    df.loc[df['城市'].isin(invalid_city), 'city_clean'] = None
    # 类别
    df['category_clean'] = df['算法类别_LLM'].fillna('其他/未回填')
    df.loc[df['category_clean'].isin(['', '-', '--']), 'category_clean'] = '其他/未回填'
    return df


df = load_data()


# ═══════════════════════════════════════════════════════════
# 图1: 月度备案趋势 + 移动平均 + 政策标注
# ═══════════════════════════════════════════════════════════
def fig1_monthly_trend():
    monthly = df.groupby('month_label').size().sort_index()
    months = monthly.index.tolist()
    values = monthly.values

    # 3期移动平均
    ma = pd.Series(values).rolling(3, center=True).mean().values

    fig, ax = plt.subplots(figsize=(14, 5.5))

    # 柱状图
    bars = ax.bar(range(len(months)), values, width=0.7, color='#1E88FF', alpha=0.28, label='月度备案量', zorder=2)
    # 移动平均线
    ax.plot(range(len(months)), ma, color='#38BDF8', linewidth=2.5, marker='o', markersize=4,
            label='3期移动平均', zorder=3)

    # 填充面积
    ax.fill_between(range(len(months)), ma, alpha=0.12, color='#38BDF8')

    # 标注政策节点
    annotations = [
        (2, '《互联网信息服务\n深度合成管理规定》\n正式施行', '2023-01'),
        (14, '《生成式人工智能\n服务管理暂行办法》\n施行', '2024-08'),
    ]
    for x, text, date_label in annotations:
        if x < len(values):
            ax.axvline(x=x, color='#FF6B4A', linestyle='--', linewidth=1, alpha=0.6, zorder=1)
            y_pos = values[x] if not np.isnan(values[x]) else max(values) * 0.7
            ax.annotate(text, xy=(x, y_pos), xytext=(x + 0.5, max(values) * 0.85),
                        fontsize=8, color='#E05530', ha='left',
                        bbox=dict(boxstyle='round,pad=0.4', facecolor='#FFF5F0', edgecolor='#FFCCBB', alpha=0.9),
                        arrowprops=dict(arrowstyle='->', color='#FF6B4A', lw=1.2))

    # 阶段标签
    phases = [
        (0.5, '合规启动期', '#90A4AE'),
        (7, '生成式AI启动', '#F5A623'),
        (15, '集中爆发期', '#FF6B4A'),
        (24, '高位运行期', '#30C48D'),
    ]
    for x_frac, label, color in phases:
        idx = int(x_frac)
        if idx < len(months):
            ax.text(idx, max(values) * 0.92, label, fontsize=9, color=color, fontweight='bold', ha='center')

    # 刻度
    tick_indices = list(range(0, len(months), 3))
    ax.set_xticks(tick_indices)
    ax.set_xticklabels([months[i] for i in tick_indices], rotation=45, ha='right', fontsize=8)
    ax.set_ylabel('备案量（条）', fontsize=11)
    ax.set_title('图1  月度算法备案量趋势（2022.08 — 2026.05）', fontsize=13, fontweight='bold', pad=14)
    ax.legend(fontsize=9, loc='upper left')
    ax.set_ylim(0, max(values) * 1.18)
    ax.grid(axis='y', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig1_monthly_trend.png'))
    plt.close(fig)
    print('[OK] fig1_monthly_trend.png')


# ═══════════════════════════════════════════════════════════
# 图2: 省份备案量柱状图 (Top 12)
# ═══════════════════════════════════════════════════════════
def fig2_province_distribution():
    province_counts = df['province_clean'].dropna().value_counts().head(12)
    total = df['province_clean'].dropna().shape[0]

    fig, ax = plt.subplots(figsize=(12, 5.5))
    colors = ['#FFD166' if i < 4 else '#1E88FF' for i in range(len(province_counts))]
    bars = ax.barh(range(len(province_counts)), province_counts.values, color=colors, alpha=0.88, height=0.65)

    for i, (name, count) in enumerate(zip(province_counts.index, province_counts.values)):
        pct = count / total * 100
        ax.text(count + 15, i, f'{count} 条 ({pct:.1f}%)', va='center', fontsize=9, color='#333')

    ax.set_yticks(range(len(province_counts)))
    ax.set_yticklabels(province_counts.index, fontsize=10)
    ax.invert_yaxis()
    ax.set_xlabel('备案量（条）', fontsize=11)
    ax.set_title('图2  各省份算法备案量分布（Top 12）  |  前4省占比 73.3%', fontsize=13, fontweight='bold', pad=14)
    ax.grid(axis='x', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # 添加图例说明
    from matplotlib.patches import Patch
    legend_elements = [Patch(facecolor='#FFD166', label='Top 4 头部省份'),
                       Patch(facecolor='#1E88FF', label='其他省份')]
    ax.legend(handles=legend_elements, fontsize=9, loc='lower right')

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig2_province_distribution.png'))
    plt.close(fig)
    print('[OK] fig2_province_distribution.png')


# ═══════════════════════════════════════════════════════════
# 图3: 城市备案量 Top 15
# ═══════════════════════════════════════════════════════════
def fig3_city_top15():
    city_counts = df['city_clean'].dropna().value_counts().head(15)
    total = len(df)

    fig, ax = plt.subplots(figsize=(12, 5.5))
    colors = ['#00E5FF' if i < 5 else '#176DA2' for i in range(len(city_counts))]
    bars = ax.bar(range(len(city_counts)), city_counts.values, color=colors, alpha=0.88, width=0.6)

    for i, (name, count) in enumerate(zip(city_counts.index, city_counts.values)):
        pct = count / total * 100
        ax.text(i, count + 10, f'{count}\n({pct:.1f}%)', ha='center', va='bottom', fontsize=8, color='#333')

    ax.set_xticks(range(len(city_counts)))
    ax.set_xticklabels(city_counts.index, rotation=35, ha='right', fontsize=9)
    ax.set_ylabel('备案量（条）', fontsize=11)
    ax.set_title('图3  城市算法备案量 Top 15  |  前5城占比 70.1%', fontsize=13, fontweight='bold', pad=14)
    ax.grid(axis='y', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig3_city_top15.png'))
    plt.close(fig)
    print('[OK] fig3_city_top15.png')


# ═══════════════════════════════════════════════════════════
# 图4: 算法类别分布 (饼图 + 条形图双图)
# ═══════════════════════════════════════════════════════════
def fig4_category_distribution():
    cat_counts = df['category_clean'].value_counts()
    # 合并尾部
    top5 = cat_counts.head(5)
    other_sum = cat_counts.iloc[5:].sum() if len(cat_counts) > 5 else 0
    if other_sum > 0:
        top5['其他类别'] = other_sum

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5))

    # 饼图
    colors = CATEGORY_COLORS[:len(top5)]
    wedges, texts, autotexts = ax1.pie(
        top5.values, labels=top5.index, autopct='%1.1f%%',
        colors=colors, startangle=140, pctdistance=0.6,
        textprops={'fontsize': 9}
    )
    for at in autotexts:
        at.set_fontsize(8)
        at.set_color('white')
        at.set_fontweight('bold')
    ax1.set_title('算法类别占比（饼图）', fontsize=12, fontweight='bold', pad=10)

    # 条形图
    bar_data = cat_counts.head(9).sort_values()
    bar_colors = CATEGORY_COLORS[:len(bar_data)]
    ax2.barh(range(len(bar_data)), bar_data.values, color=bar_colors, alpha=0.88, height=0.6)
    for i, (name, count) in enumerate(zip(bar_data.index, bar_data.values)):
        ax2.text(count + 5, i, f'{count} 条', va='center', fontsize=8, color='#333')
    ax2.set_yticks(range(len(bar_data)))
    ax2.set_yticklabels(bar_data.index, fontsize=9)
    ax2.invert_yaxis()
    ax2.set_title('算法类别备案量（条形图）', fontsize=12, fontweight='bold', pad=10)
    ax2.grid(axis='x', alpha=0.18)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    fig.suptitle('图4  算法应用类别分布  |  内容生成+人机对话占比 75.4%', fontsize=13, fontweight='bold', y=1.02)
    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig4_category_distribution.png'))
    plt.close(fig)
    print('[OK] fig4_category_distribution.png')


# ═══════════════════════════════════════════════════════════
# 图5: 年度备案量对比 + 同比增长率
# ═══════════════════════════════════════════════════════════
def fig5_yearly_trend():
    yearly = df.groupby('year').size()
    years = yearly.index.tolist()
    values = yearly.values

    fig, ax1 = plt.subplots(figsize=(10, 5))

    # 柱状图
    colors = ['#90A4AE', '#F5A623', '#FF6B4A', '#1E88FF', '#30C48D']
    bars = ax1.bar(years, values, color=colors[:len(years)], alpha=0.85, width=0.55, zorder=2)
    for x, v in zip(years, values):
        ax1.text(x, v + 30, str(v), ha='center', fontsize=11, fontweight='bold', color='#222')
    ax1.set_ylabel('备案量（条）', fontsize=11)
    ax1.set_ylim(0, max(values) * 1.25)
    ax1.grid(axis='y', alpha=0.18)
    ax1.spines['top'].set_visible(False)

    # 同比增长率 (次轴)
    ax2 = ax1.twinx()
    growth_rates = []
    growth_labels = []
    for i in range(1, len(years)):
        rate = (values[i] - values[i-1]) / values[i-1] * 100
        growth_rates.append(rate)
        growth_labels.append(f'{years[i]}\n↑{rate:.0f}%' if rate > 0 else f'{years[i]}\n↓{abs(rate):.0f}%')
    # 第一个年份无增长率
    growth_x = years[1:]
    ax2.plot(growth_x, growth_rates, color='#FF6B4A', marker='D', markersize=8, linewidth=2.2, zorder=3)
    for x, r in zip(growth_x, growth_rates):
        ax2.text(x, r + 8 if r > 0 else r - 25, f'{r:+.0f}%', ha='center', fontsize=10, fontweight='bold', color='#E05530')
    ax2.set_ylabel('同比增长率 (%)', fontsize=11, color='#E05530')
    ax2.tick_params(axis='y', colors='#E05530')
    ax2.spines['top'].set_visible(False)

    ax1.set_title('图5  年度备案量变化  |  2024年爆发（+722%），2025年后趋于稳态', fontsize=13, fontweight='bold', pad=14)
    ax1.set_xticks(years)
    ax1.set_xticklabels([str(y) for y in years], fontsize=11)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig5_yearly_trend.png'))
    plt.close(fig)
    print('[OK] fig5_yearly_trend.png')


# ═══════════════════════════════════════════════════════════
# 图6: 技术代际年度堆叠柱状图
# ═══════════════════════════════════════════════════════════
def fig6_generation_evolution():
    gen_data = df[df['技术代际'].notna() & (df['技术代际'] != '')]
    # 只保留 G1-G4
    gen_data = gen_data[gen_data['技术代际'].str.match(r'^G\d$')]
    pivot = gen_data.pivot_table(index='year', columns='技术代际', aggfunc='size', fill_value=0)
    # 确保顺序
    gen_order = ['G1', 'G2', 'G3', 'G4']
    pivot = pivot.reindex(columns=gen_order, fill_value=0)

    fig, ax = plt.subplots(figsize=(10, 5.5))
    gen_colors = ['#90A4AE', '#F5A623', '#1E88FF', '#30C48D']
    bottom = np.zeros(len(pivot))
    for i, gen in enumerate(gen_order):
        if gen in pivot.columns:
            vals = pivot[gen].values
            ax.bar(pivot.index.astype(str), vals, bottom=bottom, color=gen_colors[i],
                   alpha=0.88, width=0.55, label=gen, zorder=2)
            # 在段内标注数值（仅较大值）
            for j, v in enumerate(vals):
                if v > 50:
                    ax.text(j, bottom[j] + v/2, str(v), ha='center', va='center',
                            fontsize=7, fontweight='bold', color='white')
            bottom += vals

    ax.set_ylabel('备案量（条）', fontsize=11)
    ax.set_title('图6  技术代际年度演变  |  G4（LLM/多模态）从2024年起一统天下', fontsize=13, fontweight='bold', pad=14)
    ax.legend(fontsize=9, loc='upper left', title='技术代际')
    ax.grid(axis='y', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig6_generation_evolution.png'))
    plt.close(fig)
    print('[OK] fig6_generation_evolution.png')


# ═══════════════════════════════════════════════════════════
# 图7: 企业备案频次分布 (长尾图)
# ═══════════════════════════════════════════════════════════
def fig7_company_longtail():
    company_counts = df['企业名称'].value_counts()
    freq_dist = company_counts.value_counts().sort_index()

    # 分组
    bins_def = [(1, '1条'), (2, '2条'), (3, '3条'), (4, '4-5条'), (6, '6-10条'), (11, '10条以上')]
    grouped = {}
    for start, label in bins_def:
        if label == '4-5条':
            grouped[label] = int(((company_counts >= 4) & (company_counts <= 5)).sum())
        elif label == '6-10条':
            grouped[label] = int(((company_counts >= 6) & (company_counts <= 10)).sum())
        elif label == '10条以上':
            grouped[label] = int((company_counts >= 11).sum())
        else:
            grouped[label] = int((company_counts == start).sum())

    labels = list(grouped.keys())
    values = list(grouped.values())

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5))

    # 左图: 分组柱状图
    bar_colors = ['#30C48D', '#38BDF8', '#1E88FF', '#7C5CFC', '#F5A623', '#FF6B4A']
    ax1.bar(range(len(labels)), values, color=bar_colors, alpha=0.88, width=0.55)
    for i, v in enumerate(values):
        pct = v / company_counts.shape[0] * 100
        ax1.text(i, v + 15, f'{v}家\n({pct:.1f}%)', ha='center', fontsize=9, color='#333')
    ax1.set_xticks(range(len(labels)))
    ax1.set_xticklabels(labels, fontsize=9)
    ax1.set_ylabel('企业数（家）', fontsize=11)
    ax1.set_title('企业备案频次分布', fontsize=12, fontweight='bold')
    ax1.grid(axis='y', alpha=0.18)
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # 右图: Top 10 企业
    top10 = company_counts.head(10)
    # 缩短名称以便显示
    short_names = [n[:12] + '...' if len(n) > 12 else n for n in top10.index]
    ax2.barh(range(len(top10)), top10.values, color='#1E88FF', alpha=0.85, height=0.6)
    for i, (name, count) in enumerate(zip(short_names, top10.values)):
        ax2.text(count + 0.5, i, f'{count} 条', va='center', fontsize=9, color='#333')
    ax2.set_yticks(range(len(top10)))
    ax2.set_yticklabels(short_names, fontsize=8)
    ax2.invert_yaxis()
    ax2.set_xlabel('备案量（条）', fontsize=11)
    ax2.set_title('Top 10 企业备案量', fontsize=12, fontweight='bold')
    ax2.grid(axis='x', alpha=0.18)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)

    fig.suptitle('图7  企业备案结构  |  78.1%企业仅备案1个算法，长尾特征显著', fontsize=13, fontweight='bold', y=1.02)
    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig7_company_longtail.png'))
    plt.close(fig)
    print('[OK] fig7_company_longtail.png')


# ═══════════════════════════════════════════════════════════
# 图8: 行业分布 (一级分类)
# ═══════════════════════════════════════════════════════════
def fig8_industry_distribution():
    industry_counts = df['行业一级'].dropna().value_counts()
    # 过滤无效值
    invalid = {'', '-', '--', '未回填', '未知'}
    industry_counts = industry_counts[~industry_counts.index.isin(invalid)]

    fig, ax = plt.subplots(figsize=(12, 5.5))
    colors = ['#1E88FF', '#7C5CFC', '#30C48D', '#F5A623', '#FF6B4A', '#00E5FF'] + ['#90A4AE'] * 10
    bars = ax.barh(range(len(industry_counts)), industry_counts.values, color=colors[:len(industry_counts)], alpha=0.85, height=0.6)

    for i, (name, count) in enumerate(zip(industry_counts.index, industry_counts.values)):
        pct = count / industry_counts.sum() * 100
        ax.text(count + 5, i, f'{count} 条 ({pct:.1f}%)', va='center', fontsize=9, color='#333')

    ax.set_yticks(range(len(industry_counts)))
    ax.set_yticklabels(industry_counts.index, fontsize=9)
    ax.invert_yaxis()
    ax.set_xlabel('备案量（条）', fontsize=11)
    ax.set_title('图8  行业分布（一级分类）  |  ICT + 科技服务占 76.4%，传统行业渗透不足 3%', fontsize=13, fontweight='bold', pad=14)
    ax.grid(axis='x', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig8_industry_distribution.png'))
    plt.close(fig)
    print('[OK] fig8_industry_distribution.png')


# ═══════════════════════════════════════════════════════════
# 图9: 预测情景推演 (三情景对比)
# ═══════════════════════════════════════════════════════════
def fig9_forecast_scenarios():
    # 基于calculateMetrics.ts的逻辑复现
    yearly = df.groupby('year').size()
    years_list = yearly.index.tolist()
    latest_year = years_list[-1]  # 2026
    latest_count = int(yearly[latest_year])
    previous_count = int(yearly.get(latest_year - 1, max(round(latest_count * 0.82), 1)))

    observed_growth = (latest_count - previous_count) / previous_count if previous_count > 0 else 0.15

    def clamp(v, lo, hi):
        return max(lo, min(v, hi))

    baseline_rate = clamp(observed_growth * 0.55 + 0.12, 0.08, 0.24)
    optimistic_rate = clamp(baseline_rate + 0.08, 0.14, 0.34)
    pessimistic_rate = clamp(baseline_rate - 0.08, -0.12, 0.18)

    forecast_years = [latest_year, latest_year + 2, latest_year + 4]
    volatilities = [0.08, 0.10, 0.12]

    def make_nodes(rate):
        nodes = []
        for yr, vol in zip(forecast_years, volatilities):
            step = yr - latest_year
            mid = latest_count * (1 + rate) ** step
            nodes.append({'year': yr, 'mid': mid, 'low': mid * (1 - vol), 'high': mid * (1 + vol)})
        return nodes

    scenarios = [
        ('稳态情景', '#1E88FF', make_nodes(baseline_rate)),
        ('加速情景', '#30C48D', make_nodes(optimistic_rate)),
        ('收紧情景', '#FF6B4A', make_nodes(pessimistic_rate)),
    ]

    fig, ax = plt.subplots(figsize=(12, 5.5))

    # 历史数据
    hist_years = years_list[:-1]
    hist_values = [int(yearly[y]) for y in hist_years]
    ax.bar(hist_years, hist_values, color='#B0BEC5', alpha=0.5, width=0.45, label='历史备案量', zorder=1)
    # 当前年 (部分年)
    ax.bar([latest_year], [latest_count], color='#90A4AE', alpha=0.7, width=0.45, label='2026(截至5月)', zorder=1)

    # 预测
    for name, color, nodes in scenarios:
        yrs = [n['year'] for n in nodes]
        mids = [n['mid'] for n in nodes]
        lows = [n['low'] for n in nodes]
        highs = [n['high'] for n in nodes]

        linestyle = '--' if name == '收紧情景' else '-'
        linewidth = 3 if name == '稳态情景' else 2.2
        ax.plot(yrs, mids, color=color, linewidth=linewidth, linestyle=linestyle,
                marker='o', markersize=8, label=name, zorder=3)
        ax.fill_between(yrs, lows, highs, alpha=0.1, color=color)

        # 末端标签
        last_node = nodes[-1]
        ax.annotate(f'{name}\n{int(last_node["mid"])} 条\n({int(last_node["low"])}–{int(last_node["high"])})',
                    xy=(last_node['year'], last_node['mid']),
                    xytext=(last_node['year'] - 0.3, last_node['mid'] + 300),
                    fontsize=8, color=color, fontweight='bold', ha='center',
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor=color, alpha=0.9))

    # 分隔线
    ax.axvline(x=latest_year + 1, color='#CCC', linestyle=':', linewidth=1.2, alpha=0.6)
    ax.text(latest_year + 1.3, ax.get_ylim()[1] * 0.95, '← 预测区间 →', fontsize=9, color='#999', ha='center')

    ax.set_ylabel('备案量（条）', fontsize=11)
    ax.set_title('图9  2026–2030 备案量情景预测  |  基于历史趋势的情景推演，不等同确定性预测', fontsize=13, fontweight='bold', pad=14)
    ax.legend(fontsize=9, loc='upper left')
    ax.grid(axis='y', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    # 确保x轴显示所有年份
    all_years = hist_years + forecast_years
    ax.set_xticks(all_years)
    ax.set_xticklabels([str(y) for y in all_years], fontsize=9)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig9_forecast_scenarios.png'))
    plt.close(fig)
    print('[OK] fig9_forecast_scenarios.png')


# ═══════════════════════════════════════════════════════════
# 图10: 注册资本分布 (分箱柱状图 + 累积曲线)
# ═══════════════════════════════════════════════════════════
def fig10_capital_distribution():
    capital = pd.to_numeric(df['注册资本_万元'], errors='coerce').dropna()
    capital = capital[capital > 0]  # 去除0值及负数
    # 分箱
    bins = [0, 100, 500, 1000, 5000, 10000, float('inf')]
    labels = ['0-100万', '100-500万', '500-1000万', '1000-5000万', '5000万-1亿', '1亿以上']
    capital_binned = pd.cut(capital, bins=bins, labels=labels, right=False)
    bin_counts = capital_binned.value_counts().reindex(labels)

    fig, ax1 = plt.subplots(figsize=(12, 5.5))

    bar_colors = ['#30C48D', '#38BDF8', '#1E88FF', '#7C5CFC', '#F5A623', '#FF6B4A']
    ax1.bar(range(len(labels)), bin_counts.values, color=bar_colors, alpha=0.85, width=0.55, zorder=2)
    for i, v in enumerate(bin_counts.values):
        pct = v / bin_counts.sum() * 100
        ax1.text(i, v + 8, f'{v}条\n({pct:.1f}%)', ha='center', fontsize=8, color='#333')
    ax1.set_xticks(range(len(labels)))
    ax1.set_xticklabels(labels, fontsize=9)
    ax1.set_ylabel('备案量（条）', fontsize=11)
    ax1.grid(axis='y', alpha=0.18)
    ax1.spines['top'].set_visible(False)

    # 累积曲线 (次轴)
    ax2 = ax1.twinx()
    cumulative = bin_counts.cumsum() / bin_counts.sum() * 100
    ax2.plot(range(len(labels)), cumulative.values, color='#E040FB', marker='s', markersize=7,
             linewidth=2.2, zorder=3, label='累积占比')
    for i, v in enumerate(cumulative.values):
        ax2.text(i, v + 1.5, f'{v:.1f}%', ha='center', fontsize=8, color='#9C27B0')
    ax2.set_ylabel('累积占比 (%)', fontsize=11, color='#9C27B0')
    ax2.tick_params(axis='y', colors='#9C27B0')
    ax2.set_ylim(0, 110)
    ax2.spines['top'].set_visible(False)

    # 标注中位数
    median_val = capital.median()
    ax1.axvline(x=2.8, color='#FF6B4A', linestyle='--', linewidth=1.2, alpha=0.6)
    ax1.text(3.0, ax1.get_ylim()[1] * 0.9, f'← 中位数\n{median_val:.0f} 万元', fontsize=9, color='#E05530', fontweight='bold')

    ax1.set_title('图10  注册资本分布  |  中位数1,000万，均值1.35亿（极端右偏）', fontsize=13, fontweight='bold', pad=14)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig10_capital_distribution.png'))
    plt.close(fig)
    print('[OK] fig10_capital_distribution.png')


# ═══════════════════════════════════════════════════════════
# 图11: 区域集群对比 (京津冀/大湾区/长三角/成渝/中部)
# ═══════════════════════════════════════════════════════════
def fig11_region_clusters():
    region_defs = [
        ('京津冀', ['北京市', '天津市', '河北省'], '#FFD166'),
        ('大湾区', ['广东省'], '#30C48D'),
        ('长三角', ['上海市', '江苏省', '浙江省'], '#1E88FF'),
        ('成渝', ['四川省', '重庆市'], '#FF6B4A'),
        ('中部城市群', ['湖北省', '湖南省', '江西省', '河南省', '安徽省'], '#7C5CFC'),
    ]

    data = []
    for name, provinces, color in region_defs:
        subset = df[df['province_clean'].isin(provinces)]
        filings = len(subset)
        companies = subset['企业名称'].nunique()
        data.append({'name': name, 'filings': filings, 'companies': companies, 'color': color})

    fig, ax = plt.subplots(figsize=(12, 5))
    names = [d['name'] for d in data]
    filings = [d['filings'] for d in data]
    companies = [d['companies'] for d in data]
    colors = [d['color'] for d in data]
    total = sum(filings)

    x = np.arange(len(names))
    width = 0.35
    bars1 = ax.bar(x - width/2, filings, width, color=colors, alpha=0.85, label='备案量（条）')
    ax2 = ax.twinx()
    bars2 = ax2.bar(x + width/2, companies, width, color='#B0BEC5', alpha=0.55, label='企业数（家）')

    for i, (f, c) in enumerate(zip(filings, companies)):
        ax.text(i - width/2, f + 10, f'{f}\n({f/total*100:.1f}%)', ha='center', fontsize=8, color='#333')
        ax2.text(i + width/2, c + 5, str(c), ha='center', fontsize=8, color='#666')

    ax.set_xticks(x)
    ax.set_xticklabels(names, fontsize=10)
    ax.set_ylabel('备案量（条）', fontsize=11)
    ax2.set_ylabel('企业数（家）', fontsize=11, color='#666')
    ax.set_title('图11  五大区域集群对比  |  京津冀+大湾区+长三角占据备案主体', fontsize=13, fontweight='bold', pad=14)
    ax.grid(axis='y', alpha=0.18)
    ax.spines['top'].set_visible(False)

    # 合并图例
    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, fontsize=9, loc='upper right')

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig11_region_clusters.png'))
    plt.close(fig)
    print('[OK] fig11_region_clusters.png')


# ═══════════════════════════════════════════════════════════
# 图12: 年份×算法类别热力图 (展示类别结构演变)
# ═══════════════════════════════════════════════════════════
def fig12_category_year_heatmap():
    cat_order = ['内容生成', '人机对话', '智能搜索', '智能推荐', '风险检测', '数据分析', '内容审核', '身份认证', '其他']
    pivot = df.pivot_table(index='year', columns='category_clean', aggfunc='size', fill_value=0)
    # 保留存在的类别
    existing_cats = [c for c in cat_order if c in pivot.columns]
    pivot = pivot.reindex(columns=existing_cats, fill_value=0)

    fig, ax = plt.subplots(figsize=(12, 5))
    sns.heatmap(pivot, annot=True, fmt='d', cmap='YlOrRd', ax=ax,
                linewidths=0.5, linecolor='white', cbar_kws={'label': '备案量（条）'},
                annot_kws={'fontsize': 8})
    ax.set_title('图12  年度 × 算法类别热力图  |  内容生成类从2024年起主导，各赛道同步扩张', fontsize=13, fontweight='bold', pad=14)
    ax.set_xlabel('算法类别', fontsize=11)
    ax.set_ylabel('年份', fontsize=11)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig12_category_year_heatmap.png'))
    plt.close(fig)
    print('[OK] fig12_category_year_heatmap.png')


# ═══════════════════════════════════════════════════════════
# 图13: 季度备案趋势
# ═══════════════════════════════════════════════════════════
def fig13_quarterly_trend():
    # 构造季度字段
    df_copy = df.copy()
    df_copy['quarter'] = df_copy['备案月份'].str[:4] + '-Q' + ((df_copy['备案月份'].str[5:7].astype(int) - 1) // 3 + 1).astype(str)
    quarterly = df_copy.groupby('quarter').size().sort_index()

    fig, ax = plt.subplots(figsize=(14, 5))
    quarters = quarterly.index.tolist()
    values = quarterly.values

    # 按年份着色
    colors = []
    for q in quarters:
        yr = int(q[:4])
        if yr == 2022: colors.append('#90A4AE')
        elif yr == 2023: colors.append('#F5A623')
        elif yr == 2024: colors.append('#FF6B4A')
        elif yr == 2025: colors.append('#1E88FF')
        else: colors.append('#30C48D')

    ax.bar(range(len(quarters)), values, color=colors, alpha=0.85, width=0.6)
    for i, v in enumerate(values):
        if v > 100:
            ax.text(i, v + 5, str(v), ha='center', fontsize=7, color='#333')

    tick_indices = list(range(0, len(quarters), 2))
    ax.set_xticks(tick_indices)
    ax.set_xticklabels([quarters[i] for i in tick_indices], rotation=45, ha='right', fontsize=8)
    ax.set_ylabel('备案量（条）', fontsize=11)
    ax.set_title('图13  季度备案量趋势  |  2024-Q3起进入高频发放节奏', fontsize=13, fontweight='bold', pad=14)
    ax.grid(axis='y', alpha=0.18)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # 图例
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#90A4AE', label='2022 合规启动'),
        Patch(facecolor='#F5A623', label='2023 生成式AI启动'),
        Patch(facecolor='#FF6B4A', label='2024 集中爆发'),
        Patch(facecolor='#1E88FF', label='2025 增量扩散'),
        Patch(facecolor='#30C48D', label='2026 高位运行'),
    ]
    ax.legend(handles=legend_elements, fontsize=8, loc='upper left', ncol=5)

    fig.tight_layout()
    fig.savefig(os.path.join(OUTPUT_DIR, 'fig13_quarterly_trend.png'))
    plt.close(fig)
    print('[OK] fig13_quarterly_trend.png')


# ═══════════════════════════════════════════════════════════
# 主函数
# ═══════════════════════════════════════════════════════════
def main():
    print(f'数据加载完成: {len(df)} 条记录')
    print(f'输出目录: {OUTPUT_DIR}')
    print('---')

    fig1_monthly_trend()
    fig2_province_distribution()
    fig3_city_top15()
    fig4_category_distribution()
    fig5_yearly_trend()
    fig6_generation_evolution()
    fig7_company_longtail()
    fig8_industry_distribution()
    fig9_forecast_scenarios()
    fig10_capital_distribution()
    fig11_region_clusters()
    fig12_category_year_heatmap()
    fig13_quarterly_trend()

    print(f'\n全部图表已生成至 {OUTPUT_DIR}/')
    print(f'共 13 张图表')


if __name__ == '__main__':
    main()
