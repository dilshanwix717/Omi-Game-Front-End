'use client';

import { motion } from 'framer-motion';
import type { Suit } from '@/lib/types';
import { SUITS, SUIT_SYMBOLS } from '@/lib/constants';

interface TrumpSelectorProps {
  onSelect: (suit: Suit) => void;
}

export default function TrumpSelector({ onSelect }: TrumpSelectorProps) {
  const suitStyles: Record<Suit, string> = {
    Hearts: 'text-red-500 hover:bg-red-50 hover:border-red-300',
    Diamonds: 'text-red-500 hover:bg-red-50 hover:border-red-300',
    Clubs: 'text-gray-800 hover:bg-gray-50 hover:border-gray-400',
    Spades: 'text-gray-800 hover:bg-gray-50 hover:border-gray-400',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass rounded-3xl p-8 shadow-2xl"
    >
      <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Select Trump Suit</h3>
      <p className="text-xs text-gray-400 text-center mb-5">Choose based on your first 4 cards</p>
      <div className="flex gap-4">
        {SUITS.map((suit, i) => (
          <motion.button
            key={suit}
            onClick={() => onSelect(suit)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }}
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9 }}
            className={`w-18 h-18 flex flex-col items-center justify-center gap-1
                        bg-white rounded-2xl border-2 border-gray-200 shadow-md
                        transition-colors duration-200 cursor-pointer ${suitStyles[suit]}`}
            style={{ width: '4.5rem', height: '4.5rem' }}
            aria-label={`Select ${suit} as trump`}
          >
            <span className="text-3xl">{SUIT_SYMBOLS[suit]}</span>
            <span className="text-[10px] font-medium text-gray-400">{suit}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
