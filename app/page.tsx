'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ModeSelector from '@/components/ModeSelector';
import InfoButton from '@/components/InfoButton';

type GameMode = 'play_online' | 'play_vs_computer' | 'create_private_room' | null;
type View = 'home' | 'join';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [view, setView] = useState<View>('home');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleSelectMode = useCallback((selectedMode: GameMode) => {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');

    // Store username for the game session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('omi_username', username.trim());
      sessionStorage.setItem('omi_mode', selectedMode ?? '');
    }

    if (selectedMode === 'play_vs_computer') {
      router.push('/game?mode=single');
    } else if (selectedMode === 'create_private_room') {
      router.push('/game?mode=create');
    } else {
      router.push('/game?mode=online');
    }
  }, [username, router]);

  const handleJoinRoom = useCallback(() => {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim() || roomCode.trim().length < 4) {
      setError('Please enter a valid room code');
      return;
    }
    setError('');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('omi_username', username.trim());
    }
    router.push(`/game?mode=join&room=${roomCode.trim()}`);
  }, [username, roomCode, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-50 to-orange-100 
                    flex flex-col items-center justify-center p-4">
      <InfoButton />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-1">🃏 Omi</h1>
          <p className="text-gray-400 text-sm">
            The classic Sri Lankan card game
          </p>
        </motion.div>

        {/* Username Input */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                       focus:border-teal-400 focus:outline-none transition-colors
                       text-gray-800 placeholder-gray-400 bg-white/80"
            onKeyDown={(e) => e.key === 'Enter' && username.trim() && setView('home')}
            aria-label="Your display name"
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-xs mt-1.5 ml-1"
            >
              {error}
            </motion.p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === 'home' && username.trim() && (
            <motion.div
              key="modes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <ModeSelector onSelectMode={handleSelectMode} />

              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <motion.button
                onClick={() => setView('join')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 
                           text-gray-500 rounded-2xl hover:border-teal-300 hover:text-teal-600 
                           transition-colors text-sm"
              >
                🔗 Join with Room Code
              </motion.button>
            </motion.div>
          )}

          {view === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col gap-3"
            >
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                           focus:border-teal-400 focus:outline-none transition-colors
                           text-gray-800 placeholder-gray-400 bg-white/80 text-center 
                           font-mono text-lg tracking-wider"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                aria-label="Room code"
                autoFocus
              />
              <motion.button
                onClick={handleJoinRoom}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-teal-400 to-teal-500 
                           text-white rounded-2xl shadow-md font-medium"
              >
                Join Room
              </motion.button>
              <button
                onClick={() => setView('home')}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back to modes
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400">
        4 players • 2 teams • 32 cards • First to 10 wins
      </p>
    </div>
  );
}
