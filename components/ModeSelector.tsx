'use client';

import { motion } from 'framer-motion';

type GameMode = 'play_online' | 'play_vs_computer' | 'create_private_room' | null;

export default function ModeSelector({
  onSelectMode,
}: {
  onSelectMode: (mode: GameMode) => void;
}) {
  const modes = [
    { id: 'play_vs_computer' as const, label: 'Play vs Computer', icon: '🤖', desc: 'Practice with AI bots' },
    { id: 'play_online' as const, label: 'Play Online', icon: '🌐', desc: 'Join a public match' },
    { id: 'create_private_room' as const, label: 'Create Private Room', icon: '🔒', desc: 'Invite friends with a code' },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="text-lg font-semibold text-gray-700">Choose Game Mode</h2>
      <div className="flex flex-col gap-3 w-full">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-teal-400 to-teal-500
                       hover:from-teal-500 hover:to-teal-600 text-white rounded-2xl shadow-md 
                       transition-colors duration-200 text-left"
          >
            <span className="text-2xl">{mode.icon}</span>
            <div>
              <span className="font-medium block">{mode.label}</span>
              <span className="text-xs text-teal-100 block">{mode.desc}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
