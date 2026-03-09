'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '@/lib/sounds';

export interface AnimationOverlayHandle {
  playShuffle: () => Promise<void>;
  playDeal: () => Promise<void>;
  playCollect: (winnerPosition: 'top' | 'bottom' | 'left' | 'right') => Promise<void>;
  playRoundEnd: () => Promise<void>;
}

interface AnimationOverlayProps {
  active: boolean;
}

const AnimationOverlay = forwardRef<AnimationOverlayHandle, AnimationOverlayProps>(
  ({ active }, ref) => {
    const [animationType, setAnimationType] = useState<string | null>(null);
    const [dealCards, setDealCards] = useState<{ id: number; targetX: number; targetY: number }[]>([]);
    const [collectTarget, setCollectTarget] = useState<string>('bottom');

    useImperativeHandle(ref, () => ({
      playShuffle: async () => {
        soundManager.playShuffle();
        setAnimationType('shuffle');
        await delay(800);
        setAnimationType(null);
      },
      playDeal: async () => {
        soundManager.playDeal();
        setAnimationType('deal');
        // Create card deal animations for 4 players × 4 cards
        const cards = Array.from({ length: 16 }, (_, i) => ({
          id: i,
          targetX: getTargetX(Math.floor(i / 4)),
          targetY: getTargetY(Math.floor(i / 4)),
        }));
        setDealCards(cards);
        await delay(1500);
        setDealCards([]);
        setAnimationType(null);
      },
      playCollect: async (winnerPosition) => {
        soundManager.playWinHand();
        setCollectTarget(winnerPosition);
        setAnimationType('collect');
        await delay(1000);
        setAnimationType(null);
      },
      playRoundEnd: async () => {
        setAnimationType('roundEnd');
        await delay(1500);
        setAnimationType(null);
      },
    }));

    if (!active && !animationType) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-40">
        {/* Shuffle Animation */}
        <AnimatePresence>
          {animationType === 'shuffle' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 
                             rounded-xl border-2 border-blue-400 shadow-lg"
                  initial={{ rotate: 0, x: 0 }}
                  animate={{
                    rotate: [0, (i - 1) * 15, 0, (1 - i) * 10, 0],
                    x: [0, (i - 1) * 30, 0, (1 - i) * 20, 0],
                    y: [0, -10, 5, -5, 0],
                  }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                  style={{ zIndex: 2 - i }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deal Animation */}
        <AnimatePresence>
          {dealCards.map((card, i) => (
            <motion.div
              key={card.id}
              className="absolute w-10 h-14 bg-gradient-to-br from-blue-600 to-blue-800 
                         rounded-lg border border-blue-400 shadow-md"
              style={{ left: '50%', top: '50%', marginLeft: -20, marginTop: -28 }}
              initial={{ opacity: 1, scale: 0.8 }}
              animate={{
                x: card.targetX,
                y: card.targetY,
                opacity: [1, 1, 0],
                scale: [0.8, 1, 0.6],
              }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Collect Animation */}
        <AnimatePresence>
          {animationType === 'collect' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-14 h-20 bg-white rounded-xl border border-gray-200 shadow-md"
                  initial={{
                    x: (i - 1.5) * 40,
                    y: 0,
                    rotate: (i - 1.5) * 5,
                  }}
                  animate={{
                    x: getCollectX(collectTarget),
                    y: getCollectY(collectTarget),
                    rotate: 0,
                    scale: 0.3,
                    opacity: 0,
                  }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeIn' }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round End */}
        <AnimatePresence>
          {animationType === 'roundEnd' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
                className="text-4xl font-bold text-teal-600 drop-shadow-lg"
              >
                Round Complete!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimationOverlay.displayName = 'AnimationOverlay';
export default AnimationOverlay;

// Helpers
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTargetX(playerIndex: number): number {
  // 0=bottom, 1=left, 2=top, 3=right
  switch (playerIndex) {
    case 0: return 0;
    case 1: return -200;
    case 2: return 0;
    case 3: return 200;
    default: return 0;
  }
}

function getTargetY(playerIndex: number): number {
  switch (playerIndex) {
    case 0: return 200;
    case 1: return 0;
    case 2: return -200;
    case 3: return 0;
    default: return 0;
  }
}

function getCollectX(position: string): number {
  switch (position) {
    case 'left': return -300;
    case 'right': return 300;
    default: return 0;
  }
}

function getCollectY(position: string): number {
  switch (position) {
    case 'top': return -250;
    case 'bottom': return 250;
    default: return 0;
  }
}
