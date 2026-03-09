'use client';

import { motion } from 'framer-motion';
import type { Play, Player } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/constants';

interface HandHistoryEntry {
  id: number;
  room_id: number;
  hand_number: number;
  plays: Play[];
  winner_id: number | null;
  leading_suit: string | null;
}

interface HandHistoryProps {
  hands: HandHistoryEntry[];
  players?: Player[];
}

export default function HandHistory({ hands, players = [] }: HandHistoryProps) {
  if (hands.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 shadow-md">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Hand History</h3>
        <p className="text-xs text-gray-400">No hands played yet</p>
      </div>
    );
  }

  const getPlayerName = (id: number | null) => {
    if (id == null) return '—';
    return players.find((p) => p.id === id)?.username ?? `Player ${id}`;
  };

  const rankDisplay: Record<string, string> = {
    Ace: 'A', King: 'K', Queen: 'Q', Jack: 'J',
    Ten: '10', Nine: '9', Eight: '8', Seven: '7',
  };

  return (
    <div className="glass rounded-2xl p-4 shadow-md max-h-72 overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-700 mb-3">Hand History</h3>
      <div className="flex flex-col gap-2">
        {hands.slice().reverse().map((hand, i) => (
          <motion.div
            key={hand.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/60 rounded-lg px-3 py-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-600">
                Hand {hand.hand_number}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                {hand.leading_suit && (
                  <span className={hand.leading_suit === 'Hearts' || hand.leading_suit === 'Diamonds' ? 'text-red-500' : 'text-gray-700'}>
                    {SUIT_SYMBOLS[hand.leading_suit as keyof typeof SUIT_SYMBOLS]}
                  </span>
                )}
                Won by: <span className="font-medium text-gray-600">{getPlayerName(hand.winner_id)}</span>
              </span>
            </div>
            {hand.plays.length > 0 && (
              <div className="flex gap-2 mt-1">
                {hand.plays.map((play) => (
                  <span
                    key={`${play.card.suit}-${play.card.rank}`}
                    className={`text-xs px-1.5 py-0.5 rounded bg-gray-100
                              ${play.card.suit === 'Hearts' || play.card.suit === 'Diamonds' ? 'text-red-500' : 'text-gray-700'}`}
                  >
                    {rankDisplay[play.card.rank]}{SUIT_SYMBOLS[play.card.suit]}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
