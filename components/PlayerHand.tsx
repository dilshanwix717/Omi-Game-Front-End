'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Card as CardType, Suit } from '@/lib/types';
import Card from './Card';
import { RANK_VALUES } from '@/lib/constants';

interface PlayerHandProps {
  cards: CardType[];
  onPlayCard?: (card: CardType) => void;
  playableCards?: CardType[];
  isCurrentTurn?: boolean;
  invalidCard?: CardType | null;
}

function sortCards(cards: CardType[]): CardType[] {
  const suitOrder: Record<Suit, number> = { Spades: 0, Hearts: 1, Diamonds: 2, Clubs: 3 };
  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;
    return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
  });
}

export default function PlayerHand({
  cards,
  onPlayCard,
  playableCards = [],
  isCurrentTurn = false,
  invalidCard = null,
}: PlayerHandProps) {
  const sorted = sortCards(cards);

  const isPlayable = (card: CardType) =>
    playableCards.some((c) => c.suit === card.suit && c.rank === card.rank);

  const isInvalid = (card: CardType) =>
    invalidCard?.suit === card.suit && invalidCard?.rank === card.rank;

  return (
    <div className="relative flex justify-center items-end" style={{ minHeight: '7rem' }}>
      <AnimatePresence mode="popLayout">
        {sorted.map((card, i) => {
          const playable = isPlayable(card);
          const invalid = isInvalid(card);
          return (
            <motion.div
              key={`${card.suit}-${card.rank}`}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.7 }}
              animate={{
                opacity: 1,
                y: isCurrentTurn && playable ? -8 : 0,
                scale: 1,
              }}
              exit={{ opacity: 0, y: -60, scale: 0.5 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
              style={{ marginLeft: i === 0 ? 0 : '-12px', zIndex: i }}
            >
              <Card
                card={card}
                onClick={() => onPlayCard?.(card)}
                disabled={!isCurrentTurn || !playable}
                highlighted={isCurrentTurn && playable}
                invalid={invalid}
                delay={0}
                animate={false}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
