import React from 'react';
import './Projects.module.css';

export interface BentoCardProps {
  color?: string;
  title: string;
  description: string;
  label?: string;
}

export interface BentoProps {
  cards: BentoCardProps[];
  textAutoHide?: boolean;
  enableBorderGlow?: boolean;
}


const MagicBento: React.FC<BentoProps> = ({ children, textAutoHide = true, enableBorderGlow = true }) => {
  return (
    <div className="card-grid">
      {cards.map((card, idx) => (
        <div
          key={card.title + idx}
          className={`magic-bento-card${enableBorderGlow ? ' magic-bento-card--border-glow' : ''}${textAutoHide ? ' magic-bento-card--text-autohide' : ''}`}
          style={{ backgroundColor: card.color || 'var(--background-dark)' }}
        >
          <div className="magic-bento-card__header">
            <span className="magic-bento-card__label">{card.label}</span>
          </div>
          <div className="magic-bento-card__content">
            <h3 className="magic-bento-card__title">{card.title}</h3>
            <p className="magic-bento-card__description">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MagicBento;
