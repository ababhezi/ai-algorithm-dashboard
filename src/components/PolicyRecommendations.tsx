import { Lightbulb, MapPin, Factory, TrendingUp, Building2 } from 'lucide-react';

export interface PolicyRecommendation {
  number: number;
  icon: 'region' | 'industry' | 'pulse' | 'enterprise';
  title: string;
  finding: string;
  suggestion: string;
}

const RECOMMENDATIONS: PolicyRecommendation[] = [
  {
    number: 1,
    icon: 'region',
    title: '推动地域均衡发展',
    finding: '粤京合计占比 48.8%，前四省占 73.3%，中西部不足 5%，空间极化显著',
    suggestion: '属地化备案激励：对中西部省份中小 AI 企业首次备案给予补贴或绿色通道，降低跨省备案的行政摩擦成本。依托成渝、武汉、西安等节点城市建立 AI 备案服务分中心，提供材料预审和合规指导，把服务送到企业门口。',
  },
  {
    number: 2,
    icon: 'industry',
    title: '加速传统行业渗透',
    finding: 'ICT + 科技服务占 76.4%，制造业仅 0.3%、金融 0.3%、教育 0.1%，大量传统行业 AI 应用游离于备案体系之外',
    suggestion: '针对制造业（智能质检/预测性维护）、金融（风控/合规审核）、医疗（辅助诊断/影像分析）等行业出台专项备案指引，明确"面向公众服务"与"内部使用"的界定标准，降低专业领域 AI 算法的备案门槛，释放存量应用进入备案体系。',
  },
  {
    number: 3,
    icon: 'pulse',
    title: '熨平备案脉冲波动',
    finding: '2024 年备案量同比激增 722%，2025 年回落 14%，形成"冲击—观望—再冲击"的周期性波动，行政资源利用效率偏低',
    suggestion: '建立备案批次的季度预告机制：提前告知企业下一批次预计时间和重点审查方向，让企业合理安排合规节奏。同时将各省份备案节奏的平稳性纳入网信办工作考核，避免因批次发放不规律导致数据失真和行政资源浪费。',
  },
  {
    number: 4,
    icon: 'enterprise',
    title: '防止头部马太效应',
    finding: '腾讯/字节/百度三巨头占 Top10 备案量 47%，78.1% 企业仅备案 1 个算法；持续备案者占比从 80% 降至 45%，行业壁垒正在形成',
    suggestion: '对中小企业首次备案提供绿色通道和材料补贴模板，缩短"产品发布"到"完成备案"的时间窗口。对单企业备案 3 个算法以上的企业给予优先审批，鼓励多品类同步合规。同时要求大型平台对旗下子公司算法备案关系进行透明披露，防止通过拆分规避集中度监管。',
  },
];

const ICONS = {
  region: MapPin,
  industry: Factory,
  pulse: TrendingUp,
  enterprise: Building2,
};

const TONES = ['warning', 'accent', 'positive', 'accent'] as const;

interface Props {
  compact?: boolean;
}

export function PolicyRecommendations({ compact = false }: Props) {
  if (compact) {
    // Compact: 5 cards in 2-row grid, smaller text
    return (
      <div className="policy-recs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 4px' }}>
        {RECOMMENDATIONS.map((rec, i) => {
          const Icon = ICONS[rec.icon];
          const tone = TONES[i];
          return (
            <div
              key={rec.number}
              style={{
                background: tone === 'warning'
                  ? 'linear-gradient(135deg, rgba(251,146,60,0.08), rgba(251,146,60,0.03))'
                  : tone === 'accent'
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(56,189,248,0.03))'
                  : 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))',
                border: `1px solid ${
                  tone === 'warning' ? 'rgba(251,146,60,0.25)' : tone === 'accent' ? 'rgba(56,189,248,0.25)' : 'rgba(52,211,153,0.25)'
                }`,
                borderRadius: 8,
                padding: '10px 12px',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: tone === 'warning' ? 'rgba(251,146,60,0.15)' : tone === 'accent' ? 'rgba(56,189,248,0.15)' : 'rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={14} color={tone === 'warning' ? '#fb923c' : tone === 'accent' ? '#38bdf8' : '#34d399'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#dcebff', marginBottom: 3, lineHeight: 1.3 }}>{rec.title}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(220,235,255,0.55)', lineHeight: 1.35, marginBottom: 3 }}>{rec.finding}</div>
                <div style={{ fontSize: 9.5, color: tone === 'warning' ? '#fb923c' : tone === 'accent' ? '#38bdf8' : '#34d399', lineHeight: 1.35 }}>{rec.suggestion}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full: vertical list with larger cards
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0', height: '100%', justifyContent: 'space-between' }}>
      {RECOMMENDATIONS.map((rec, i) => {
        const Icon = ICONS[rec.icon];
        const tone = TONES[i];
        return (
          <div
            key={rec.number}
            style={{
              background: tone === 'warning'
                ? 'linear-gradient(90deg, rgba(251,146,60,0.06), transparent)'
                : tone === 'accent'
                ? 'linear-gradient(90deg, rgba(56,189,248,0.06), transparent)'
                : 'linear-gradient(90deg, rgba(52,211,153,0.06), transparent)',
              borderLeft: `3px solid ${tone === 'warning' ? '#fb923c' : tone === 'accent' ? '#38bdf8' : '#34d399'}`,
              borderRadius: '0 8px 8px 0',
              padding: '14px 16px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              flex: 1,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: tone === 'warning' ? 'rgba(251,146,60,0.12)' : tone === 'accent' ? 'rgba(56,189,248,0.12)' : 'rgba(52,211,153,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color={tone === 'warning' ? '#fb923c' : tone === 'accent' ? '#38bdf8' : '#34d399'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: tone === 'warning' ? '#fb923c' : tone === 'accent' ? '#38bdf8' : '#34d399' }}>
                  建议{rec.number}
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#dcebff' }}>{rec.title}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(220,235,255,0.55)', lineHeight: 1.5, marginBottom: 5 }}>
                数据依据：{rec.finding}
              </div>
              <div style={{ fontSize: 11.5, color: tone === 'warning' ? '#fb923c' : tone === 'accent' ? '#38bdf8' : '#34d399', lineHeight: 1.5 }}>
                {rec.suggestion}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
