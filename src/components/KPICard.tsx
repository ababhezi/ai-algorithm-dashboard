import { BarChart3, Building2, FileText, Layers3, PieChart } from 'lucide-react';
import type { KPIItem } from '../utils/types';

interface KPICardProps {
  item: KPIItem;
}

function pickIcon(label: string) {
  if (label.includes('Top4')) return PieChart;
  if (label.includes('鍐呭')) return FileText;
  if (label.includes('鍩庡競')) return BarChart3;
  if (label.includes('浼佷笟')) return Building2;
  return Layers3;
}

export function KPICard({ item }: KPICardProps) {
  const Icon = pickIcon(item.label);
  const isPrimary = item.label.includes('澶囨');

  return (
    <div className={`kpi-card ${isPrimary ? 'kpi-card--filings' : ''}`}>
      <div className="kpi-card__track" />
      <div className="kpi-card__signal">
        <span />
      </div>
      <div className="kpi-card__icon">
        <Icon size={24} />
      </div>
      <div className="kpi-card__content">
        <div className="kpi-card__label">{item.label}</div>
        <div className="kpi-card__value-row">
          <span className="kpi-card__value">{item.value}</span>
          <span className="kpi-card__unit">{item.unit}</span>
        </div>
        <div className="kpi-card__caption">{item.caption}</div>
      </div>
    </div>
  );
}
