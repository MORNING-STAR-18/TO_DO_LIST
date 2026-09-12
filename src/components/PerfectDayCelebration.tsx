import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';

interface PerfectDayCelebrationProps {
  totalTasks: number;
  completedTasks: number;
}

export default function PerfectDayCelebration({ totalTasks, completedTasks }: PerfectDayCelebrationProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (totalTasks > 0 && completedTasks === totalTasks) {
      if (!hasCelebrated) {
        setShowCelebration(true);
        setHasCelebrated(true);
      }
    } else {
      setHasCelebrated(false);
      setShowCelebration(false);
    }
  }, [totalTasks, completedTasks, hasCelebrated]);

  return (
    <AnimatePresence>
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 12,
              mass: 1.2
            }}
            className="relative max-w-lg w-full bg-black/60 border border-cyan-400/50 rounded-2xl p-8 overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.2)]"
          >
            {/* Continuous CSS Pulse on Modal Border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-pulse pointer-events-none" />

            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-transparent opacity-50" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-24 h-24 bg-cyan-400/20 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]"
              >
                <Icon icon="ph:trophy-fill" className="text-5xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-black font-mono tracking-widest text-cyan-400 uppercase mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                Mission Accomplished
              </h2>
              
              <p className="text-cyan-100/80 font-mono text-sm md:text-base mb-8 uppercase tracking-widest border-t border-b border-cyan-400/20 py-3">
                100% System Clear.
                <br />
                <span className="text-cyan-300 font-bold mt-1 block drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">+10 Bonus Points Awarded!</span>
              </p>
              
              <button
                onClick={() => setShowCelebration(false)}
                className="group relative px-8 py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-400 font-mono font-bold tracking-widest uppercase rounded-lg overflow-hidden transition-all hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center gap-2">
                  Close / Continue <Icon icon="ph:arrow-right-bold" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
