'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RoundSummaryProps {
  visible: boolean;
  teamAHands: number;
  teamBHands: number;
  teamAPoints: number;
  teamBPoints: number;
  pointsAwarded: { teamA: number; teamB: number };
  isKapothi: boolean;
  isTie: boolean;
  onContinue: () => void;
}

export default function RoundSummary({
  visible, teamAHands, teamBHands, teamAPoints, teamBPoints,
  pointsAwarded, isKapothi, isTie, onContinue,
}: RoundSummaryProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              {isKapothi ? '💥 Kapothi!' : isTie ? '🤝 Tie Round' : '📊 Round Summary'}
            </h2>

            {/* Hands won */}
            <div className="flex justify-center items-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-xs text-teal-600 uppercase font-semibold">Team A</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-4xl font-bold text-teal-600"
                >
                  {teamAHands}
                </motion.p>
                <p className="text-xs text-gray-400">hands</p>
              </div>
              <span className="text-gray-300 text-2xl">—</span>
              <div className="text-center">
                <p className="text-xs text-orange-500 uppercase font-semibold">Team B</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-4xl font-bold text-orange-500"
                >
                  {teamBHands}
                </motion.p>
                <p className="text-xs text-gray-400">hands</p>
              </div>
            </div>

            {/* Points awarded */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/60 rounded-xl p-3 mb-4"
            >
              {isTie ? (
                <p className="text-center text-sm text-gray-600">
                  No points awarded. Next round is worth double!
                </p>
              ) : (
                <div className="flex justify-center gap-6 text-sm">
                  {pointsAwarded.teamA > 0 && (
                    <span className="text-teal-600 font-medium">
                      Team A: +{pointsAwarded.teamA} pts
                    </span>
                  )}
                  {pointsAwarded.teamB > 0 && (
                    <span className="text-orange-500 font-medium">
                      Team B: +{pointsAwarded.teamB} pts
                    </span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Total score */}
            <div className="text-center text-xs text-gray-400 mb-5">
              Total: {teamAPoints} – {teamBPoints}
            </div>

            {/* Continue button */}
            <motion.button
              onClick={onContinue}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 bg-gradient-to-r from-teal-400 to-teal-500 
                         text-white rounded-2xl shadow-md font-medium"
            >
              Continue →
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
