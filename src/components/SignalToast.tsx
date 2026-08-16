import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { ThemeConfig } from '../types';

interface SignalToastProps {
  message: string | null;
  theme: ThemeConfig;
}

export const SignalToast: React.FC<SignalToastProps> = ({ message, theme }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border backdrop-blur-xl flex items-center gap-2.5 shadow-2xl"
          style={{
            backgroundColor: 'rgba(18, 12, 8, 0.95)',
            borderColor: theme.border,
            boxShadow: `0 10px 40px rgba(0,0,0,0.8), 0 0 20px ${theme.primaryGlow}`,
            color: '#ffffff',
          }}
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" style={{ color: theme.primary }} />
          <span className="text-xs sm:text-sm font-bold font-rajdhani tracking-wider uppercase">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
