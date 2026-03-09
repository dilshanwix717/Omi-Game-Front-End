'use client';

import { motion } from 'framer-motion';
import type { Suit } from '@/lib/types';
import { SUIT_SYMBOLS } from '@/lib/constants';

interface ScoreBoardProps {
  score: { team_a_points: number; team_b_points: number; team_a_hands: number; team_b_hands: number } | null;
  trumpSuit?: Suit | null;
}

export default function ScoreBoard({ score, trumpSuit }: ScoreBoardProps) {
  const teamAPoints = score?.team_a_points ?? 0;
  const teamBPoints = score?.team_b_points ?? 0;
  const trumpDisplay = trumpSuit ? SUIT_SYMBOLS[trumpSuit] : null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass rounded-2xl px-5 py-2.5 shadow-md flex items-center gap-4"
    >
      {/* Team A */}
      <div className="text-center min-w-[60px]">
        <p className="text-[10px] text-teal-600 uppercase font-semibold tracking-wider">Team A</p>
        <motion.p
          key={teamAPoints}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-teal-600"
        >
          {teamAPoints}
        </motion.p>
        <p className="text-[10px] text-gray-400">
          {score?.team_a_hands ?? 0} hands
        </p>
      </div>

      {/* Divider + Trump */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-6 bg-gray-300" />
        {trumpDisplay ? (
          <span className="text-lg" title={`Trump: ${trumpSuit}`}>{trumpDisplay}</span>
        ) : (
          <span className="text-[10px] text-gray-300">vs</span>
        )}
        <div className="w-px h-6 bg-gray-300" />
      </div>

      {/* Team B */}
      <div className="text-center min-w-[60px]">
        <p className="text-[10px] text-orange-500 uppercase font-semibold tracking-wider">Team B</p>
        <motion.p
          key={teamBPoints}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-orange-500"
        >
          {teamBPoints}
        </motion.p>
        <p className="text-[10px] text-gray-400">
          {score?.team_b_hands ?? 0} hands
        </p>
      </div>
    </motion.div>
  );
}
