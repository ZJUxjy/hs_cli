/**
 * Card Tooltip Component
 *
 * A rich, fantasy-styled tooltip that appears when hovering over cards.
 * Features magical parchment aesthetics with gold accents and ethereal glow.
 */

import React, { useEffect, useState } from 'react';
import type { UICardState, UIMinionState } from '../types';

interface CardTooltipProps {
  card: UICardState | UIMinionState | null;
  visible: boolean;
  x: number;
  y: number;
}

/**
 * Get keyword badge for special card abilities
 */
function getKeywordBadges(card: UICardState | UIMinionState): string[] {
  const badges: string[] = [];
  const desc = card.description?.toLowerCase() || '';

  if (desc.includes('战吼') || desc.includes('battlecry')) badges.push('战吼');
  if (desc.includes('亡语') || desc.includes('deathrattle')) badges.push('亡语');
  if (desc.includes('嘲讽') || desc.includes('taunt')) badges.push('嘲讽');
  if (desc.includes('冲锋') || desc.includes('charge')) badges.push('冲锋');
  if (desc.includes('圣盾') || desc.includes('divine shield')) badges.push('圣盾');
  if (desc.includes('风怒') || desc.includes('windfury')) badges.push('风怒');
  if (desc.includes('潜行') || desc.includes('stealth')) badges.push('潜行');
  if (desc.includes('法术伤害') || desc.includes('spell damage')) badges.push('法术伤害');
  if (desc.includes('吸血') || desc.includes('lifesteal')) badges.push('吸血');
  if (desc.includes('剧毒') || desc.includes('poisonous')) badges.push('剧毒');

  return badges;
}

/**
 * Format card description with highlighted keywords
 */
function formatDescription(description: string): React.ReactNode {
  if (!description) return null;

  // Split by common keywords and wrap them in styled spans
  const keywords = [
    { cn: '战吼', en: 'Battlecry', color: '#ffd700' },
    { cn: '亡语', en: 'Deathrattle', color: '#9b59b6' },
    { cn: '嘲讽', en: 'Taunt', color: '#8b4513' },
    { cn: '冲锋', en: 'Charge', color: '#e74c3c' },
    { cn: '圣盾', en: 'Divine Shield', color: '#f1c40f' },
    { cn: '风怒', en: 'Windfury', color: '#3498db' },
    { cn: '潜行', en: 'Stealth', color: '#95a5a6' },
    { cn: '法术伤害', en: 'Spell Damage', color: '#9b59b6' },
    { cn: '吸血', en: 'Lifesteal', color: '#c0392b' },
    { cn: '剧毒', en: 'Poisonous', color: '#27ae60' },
    { cn: '冻结', en: 'Freeze', color: '#5dade2' },
    { cn: '沉默', en: 'Silence', color: '#7f8c8d' },
  ];

  let formatted = description;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Find all keyword occurrences
  const matches: Array<{ index: number; length: number; color: string; text: string }> = [];

  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword.cn}|${keyword.en})`, 'gi');
    let match;
    while ((match = regex.exec(description)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        color: keyword.color,
        text: match[0],
      });
    }
  });

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Remove overlapping matches
  const uniqueMatches = matches.filter((match, i) => {
    if (i === 0) return true;
    return match.index >= matches[i - 1].index + matches[i - 1].length;
  });

  // Build the formatted result
  uniqueMatches.forEach(match => {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {description.slice(lastIndex, match.index)}
        </span>
      );
    }
    parts.push(
      <span
        key={`kw-${match.index}`}
        style={{
          color: match.color,
          fontWeight: 700,
          textShadow: `0 0 8px ${match.color}40`,
        }}
      >
        {match.text}
      </span>
    );
    lastIndex = match.index + match.length;
  });

  if (lastIndex < description.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>{description.slice(lastIndex)}</span>
    );
  }

  return parts.length > 0 ? parts : description;
}

export const CardTooltip: React.FC<CardTooltipProps> = ({ card, visible, x, y }) => {
  const [position, setPosition] = useState({ x, y });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // Delay showing for smooth fade-in
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    // Adjust position to keep tooltip on screen
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const padding = 20;

    let adjustedX = x + 20; // Offset to right of cursor
    let adjustedY = y - 50; // Center vertically on cursor

    // Keep within viewport
    if (adjustedX + tooltipWidth > window.innerWidth - padding) {
      adjustedX = x - tooltipWidth - 20; // Show on left side
    }
    if (adjustedY + tooltipHeight > window.innerHeight - padding) {
      adjustedY = window.innerHeight - tooltipHeight - padding;
    }
    if (adjustedY < padding) {
      adjustedY = padding;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  if (!card || !visible) return null;

  const badges = getKeywordBadges(card);
  const hasDescription = card.description && card.description.trim().length > 0;

  return (
    <div
      className="card-tooltip"
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 0.88 : 0,
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(-10px) scale(0.98)',
        pointerEvents: 'none',
      }}
    >
      {/* Magical glow effect */}
      <div className="card-tooltip-glow" />

      {/* Decorative corners */}
      <div className="card-tooltip-corner card-tooltip-corner-tl" />
      <div className="card-tooltip-corner card-tooltip-corner-tr" />
      <div className="card-tooltip-corner card-tooltip-corner-bl" />
      <div className="card-tooltip-corner card-tooltip-corner-br" />

      {/* Content */}
      <div className="card-tooltip-content">
        {/* Header with name and cost */}
        <div className="card-tooltip-header">
          <span className="card-tooltip-cost">{card.cost}</span>
          <span className="card-tooltip-name">{card.name}</span>
          <span className="card-tooltip-type">
            {card.type === 'minion' && '随从'}
            {card.type === 'spell' && '法术'}
            {card.type === 'weapon' && '武器'}
            {card.type === 'hero' && '英雄'}
            {card.type === 'hero_power' && '英雄技能'}
          </span>
        </div>

        {/* Divider with magical effect */}
        <div className="card-tooltip-divider">
          <span className="card-tooltip-rune">⬡</span>
        </div>

        {/* Keyword badges */}
        {badges.length > 0 && (
          <div className="card-tooltip-badges">
            {badges.map((badge, i) => (
              <span key={i} className="card-tooltip-badge">
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {hasDescription ? (
          <div className="card-tooltip-description">
            {formatDescription(card.description!)}
          </div>
        ) : (
          <div className="card-tooltip-description card-tooltip-no-description">
            无特殊效果
          </div>
        )}

        {/* Stats footer for minions/weapons */}
        {(card.type === 'minion' || card.type === 'weapon') && (
          <div className="card-tooltip-stats">
            {card.attack !== undefined && (
              <span className="card-tooltip-stat card-tooltip-attack">
                ⚔ {card.attack}
              </span>
            )}
            {card.health !== undefined && (
              <span className="card-tooltip-stat card-tooltip-health">
                ♥ {card.health}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtle texture overlay */}
      <div className="card-tooltip-texture" />
    </div>
  );
};

export default CardTooltip;
