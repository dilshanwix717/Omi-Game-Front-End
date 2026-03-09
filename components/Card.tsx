'use client';

import { motion } from 'framer-motion';
import type { Card as CardType } from '@/lib/types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/constants';
import { useState } from 'react';

interface CardProps {
  card?: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  invalid?: boolean;
  small?: boolean;
  animate?: boolean;
  delay?: number;
  ariaLabel?: string;
}

const rankDisplay: Record<string, string> = {
  Ace: 'A', King: 'K', Queen: 'Q', Jack: 'J',
  Ten: '10', Nine: '9', Eight: '8', Seven: '7',
};

export default function Card({
  card,
  faceDown = false,
  onClick,
  disabled = false,
  highlighted = false,
  invalid = false,
  small = false,
  animate = true,
  delay = 0,
  ariaLabel,
}: CardProps) {
  const [shaking, setShaking] = useState(false);

  const handleClick = () => {
    if (invalid) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    onClick?.();
  };

  const sizeClasses = small
    ? 'w-10 h-14 text-xs'
    : 'w-16 h-24 sm:w-20 sm:h-28';

  if (faceDown || !card) {
    return (
      <motion.div
        initial={animate ? { opacity: 0, y: -20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className={`${sizeClasses} bg-gradient-to-br from-blue-600 to-blue-800 
                    rounded-xl shadow-md border-2 border-blue-400 
                    flex items-center justify-center select-none`}
        role="img"
        aria-label="Card back"
      >
        <span className="text-white text-lg opacity-60">🂠</span>
      </motion.div>
    );
  }

  const colorClass = SUIT_COLORS[card.suit];

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled && !invalid}
      initial={animate ? { opacity: 0, scale: 0.8, y: 20 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }}
      whileHover={!disabled ? { scale: 1.12, y: -8, zIndex: 10 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`${sizeClasses} bg-white rounded-xl shadow-lg border-2 
                  flex flex-col items-center justify-center gap-0.5 
                  transition-shadow duration-200 relative select-none cursor-pointer
                  ${highlighted ? 'border-yellow-400 shadow-yellow-200/60 shadow-xl animate-card-glow' : 'border-gray-200'}
                  ${disabled && !invalid ? 'opacity-40 cursor-not-allowed' : ''}
                  ${invalid ? 'border-red-400 shadow-red-200/50' : ''}
                  ${shaking ? 'animate-shake' : ''}
                  ${colorClass}`}
      role="button"
      aria-label={ariaLabel || `${card.rank} of ${card.suit}`}
      aria-disabled={disabled}
    >
      <span className={`font-bold ${small ? 'text-[10px]' : 'text-sm sm:text-base'}`}>
        {rankDisplay[card.rank]}
      </span>
      <span className={`${small ? 'text-sm' : 'text-lg sm:text-xl'}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
      {highlighted && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-yellow-300"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
