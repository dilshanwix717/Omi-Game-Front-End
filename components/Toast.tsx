'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
}

export default function Toast({
  message,
  visible,
  duration = 2500,
  onHide,
}: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onHide?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50
                     bg-red-400/90 backdrop-blur-md text-white 
                     px-6 py-3 rounded-xl shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
