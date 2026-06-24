import { Building2, Factory, Sparkles, GitBranchPlus } from 'lucide-react';
import type { InsightCardData } from '../utils/types';

interface InsightCardsProps {
  cards: InsightCardData[];
  onCardClick?: (card: InsightCardData) => void;
}

const ICONS = {
  region: Building2,
  industry: Factory,
  innovation: Sparkles,
  scale: GitBranchPlus
};

export function InsightCards({ cards, onCardClick }: InsightCardsProps) {
  return (
    <div className="insight-grid">
      {cards.map((card) => {
        const Icon = ICONS[card.key as keyof typeof ICONS] ?? Building2;
        const clickable = Boolean(onCardClick);
          return (
            <article
              key={card.key}
              className={`insight-card insight-card--${card.tone}${clickable ? ' is-clickable' : ''}`}
            onClick={clickable ? () => onCardClick?.(card) : undefined}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={
              clickable
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onCardClick?.(card);
                    }
                  }
                : undefined
            }
            >
              <div className="insight-card__icon">
                <Icon size={18} />
              </div>
              <div className="insight-card__title">{card.title}</div>
              <p className="insight-card__finding">{card.finding}</p>
              <p className="insight-card__suggestion">{card.suggestion}</p>
              {clickable ? <div className="insight-card__action">查看详情 &gt;</div> : null}
            </article>
          );
        })}
      </div>
  );
}
