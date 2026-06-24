import { BarChart3, Blocks, BrainCircuit, DatabaseZap, Lightbulb, MapPinned, Radar } from 'lucide-react';

interface ThemeTabOption {
  key: string;
  label: string;
  subtitle: string;
}

interface ThemeTabsProps {
  activeKey: string;
  options: ThemeTabOption[];
  onChange: (key: string) => void;
}

const iconMap: Record<string, typeof Blocks> = {
  overview: Blocks,
  region: MapPinned,
  algorithm: BrainCircuit,
  company: DatabaseZap,
  forecast: BarChart3,
  quality: Radar,
  recommend: Lightbulb
};

export function ThemeTabs({ activeKey, options, onChange }: ThemeTabsProps) {
  return (
    <div className="theme-tabs">
      {options.map((option, index) => {
        const Icon = iconMap[option.key] ?? Blocks;
        return (
          <button
            key={option.key}
            type="button"
            className={`theme-tabs__item${activeKey === option.key ? ' is-active' : ''}`}
            onClick={() => onChange(option.key)}
          >
            <div className="theme-tabs__index">{String(index + 1).padStart(2, '0')}</div>
            <div className="theme-tabs__icon">
              <Icon size={18} />
            </div>
            <div className="theme-tabs__text">
              <strong>{option.label}</strong>
              <span>{option.subtitle}</span>
            </div>
            <div className="theme-tabs__signal">
              <span />
            </div>
          </button>
        );
      })}
    </div>
  );
}
