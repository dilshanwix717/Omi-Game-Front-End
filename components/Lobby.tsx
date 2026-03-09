'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@/lib/types';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  myPlayer: Player | null;
  isDealer: boolean;
  onDeal: () => void;
  onLeave?: () => void;
}

export default function Lobby({ roomCode, players, myPlayer, isDealer, onDeal, onLeave }: LobbyProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [roomCode]);

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/game?room=${roomCode}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareLink]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      {/* Room Code */}
      <div className="glass rounded-2xl p-6 w-full text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Room Code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-mono font-bold text-teal-600 tracking-[0.3em]">
            {roomCode}
          </span>
          <motion.button
            onClick={copyRoomCode}
            whileTap={{ scale: 0.9 }}
            className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 rounded-lg 
                       hover:bg-teal-200 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </motion.button>
        </div>
        <button onClick={copyLink} className="text-xs text-gray-400 hover:text-teal-500 mt-2 transition-colors">
          📎 Copy invite link
        </button>
      </div>

      {/* Player Seats */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {[0, 1, 2, 3].map((seat) => {
          const player = players.find((p) => p.seat_index === seat);
          const isMe = player?.id === myPlayer?.id;
          const teamColor = seat % 2 === 0 ? 'border-teal-300' : 'border-orange-300';

          return (
            <motion.div
              key={seat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: seat * 0.1 }}
              className={`glass rounded-xl p-4 border-2 ${player ? teamColor : 'border-dashed border-gray-200'}
                         flex flex-col items-center gap-1 ${isMe ? 'ring-2 ring-teal-400' : ''}`}
            >
              <span className="text-2xl">{player ? (player.is_bot ? '🤖' : '👤') : '⬜'}</span>
              <span className={`text-sm font-medium truncate max-w-full
                              ${isMe ? 'text-teal-600' : 'text-gray-700'}`}>
                {player?.username ?? 'Empty'}
              </span>
              <span className="text-[10px] text-gray-400">
                {seat % 2 === 0 ? 'Team A' : 'Team B'}
                {isMe ? ' (You)' : ''}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Status */}
      <div className="text-center">
        {players.length < 4 ? (
          <p className="text-gray-500 text-sm animate-pulse-soft">
            Waiting for players... ({players.length}/4)
          </p>
        ) : (
          <p className="text-teal-600 text-sm font-medium">
            All players ready!
          </p>
        )}
      </div>

      {/* Actions */}
      {players.length === 4 && isDealer && (
        <motion.button
          onClick={onDeal}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 
                     text-white rounded-2xl shadow-lg font-semibold text-lg transition-colors"
        >
          🃏 Deal Cards
        </motion.button>
      )}

      {onLeave && (
        <button onClick={onLeave} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
          Leave Room
        </button>
      )}
    </div>
  );
}
