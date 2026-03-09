'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  reconnectAttempt?: number;
}

const statusConfig = {
  disconnected: { color: 'bg-gray-400', label: 'Disconnected', pulse: false },
  connecting: { color: 'bg-yellow-400', label: 'Connecting...', pulse: true },
  connected: { color: 'bg-green-400', label: 'Connected', pulse: false },
  reconnecting: { color: 'bg-yellow-400', label: 'Reconnecting...', pulse: true },
  error: { color: 'bg-red-400', label: 'Connection Error', pulse: false },
};

export default function ConnectionStatus({ status, reconnectAttempt }: ConnectionStatusProps) {
  const config = statusConfig[status];
  const showBanner = status !== 'connected';

  return (
    <>
      {/* Small indicator dot — always visible */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
        <span className="text-xs text-gray-500 hidden sm:inline">{config.label}</span>
      </div>

      {/* Reconnecting banner */}
      <AnimatePresence>
        {showBanner && status !== 'disconnected' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center"
          >
            <div className={`mt-2 px-4 py-2 rounded-2xl shadow-lg text-sm text-white font-medium
              ${status === 'error' ? 'bg-red-500/90' : 'bg-yellow-500/90'} backdrop-blur`}>
              {status === 'reconnecting' && reconnectAttempt
                ? `Reconnecting... (attempt ${reconnectAttempt})`
                : config.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
