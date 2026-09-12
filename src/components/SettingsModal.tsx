import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  handleBuyToken: () => void;
}

export default function SettingsModal({ isOpen, onClose, userData, handleBuyToken }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0b0f14] border border-white/20 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative custom-scrollbar"
          >
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
                <Icon icon="ph:gear-fill" className="text-white/60 animate-spin-slow" /> System Config
              </h2>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <Icon icon="ph:x-bold" className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Profile Readout */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full border border-cyan-400/50 flex items-center justify-center bg-cyan-900/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        <Icon icon="ph:user-circle-bold" className="text-3xl text-cyan-400" />
                     </div>
                     <div>
                        <h3 className="text-sm text-cyan-400 font-mono uppercase tracking-widest mb-1">Active User</h3>
                        <p className="text-lg font-bold text-white tracking-widest">{userData?.alias || 'Unknown'}</p>
                     </div>
                 </div>
                 <div className="text-right">
                    <h3 className="text-xs text-white/40 font-mono uppercase tracking-widest mb-1">Global Streak</h3>
                    <p className="text-xl font-bold text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] flex items-center gap-1 justify-end">
                      <Icon icon="ph:fire-fill" /> {userData?.streak || 0}
                    </p>
                 </div>
              </div>

              {/* 3. The Black Market (Moved from Dashboard) */}
              <div className="bg-black border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-purple-400 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                    <Icon icon="ph:storefront-fill" className="text-lg" />
                    Black Market
                  </h3>
                  <Icon icon="ph:wifi-high-bold" className="text-purple-400/50 animate-pulse" />
                </div>

                <div className="bg-[#0b0f14] border border-purple-500/20 rounded-xl p-4 relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                    <Icon icon="ph:hourglass-medium-fill" className="text-3xl text-white drop-shadow-md" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-bold text-base text-white mb-1">Time Reversal Token</h4>
                    <p className="text-xs text-white/40 font-mono leading-relaxed mb-2">
                      Lost your streak? Use this illegal tech to restore a missed day and fix your timeline.
                    </p>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30 inline-block">
                      Inventory: {userData?.tokens || 0}
                    </span>
                  </div>

                  <div className="w-full md:w-auto shrink-0">
                    <button 
                      onClick={handleBuyToken}
                      disabled={!userData || userData.credits < 100}
                      className="w-full md:w-32 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-mono uppercase tracking-widest py-3 rounded-lg transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      Buy 100
                      <Icon icon="ph:coin-vertical-fill" className="text-yellow-400 group-hover/btn:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
