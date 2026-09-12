"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function CharacterCreation({ onComplete }: { onComplete?: () => void }) {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [alias, setAlias] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hexCode, setHexCode] = useState("0x000000");
  const [loading, setLoading] = useState(false);

  const handleStartGame = async () => {
    if (!alias) return;
    setLoading(true);
    if (auth.currentUser) {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        alias,
        xp: 0,
        level: 1,
        credits: 0,
        streak: 0,
        lastPerfectDay: null,
        tokens: 0,
        createdAt: new Date().toISOString()
      });
    }
    setIsGameStarted(true);
    if (onComplete) {
      setTimeout(onComplete, 2000);
    }
  };

  // Interactive hex decoder effect while typing
  useEffect(() => {
    if (alias.length > 0) {
      const interval = setInterval(() => {
        setHexCode("0x" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
      }, 80);
      return () => clearInterval(interval);
    } else {
      setHexCode("0x000000");
    }
  }, [alias]);

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center font-sans overflow-hidden text-[#e7ecf2] relative [perspective:1200px]">
      
      {/* Dynamic Background ambient light that reacts to input */}
      <motion.div 
        animate={{ 
          scale: alias.length > 0 ? 1.2 : 1,
          opacity: alias.length > 0 ? 0.8 : 0.4
        }}
        transition={{ duration: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_60%)] pointer-events-none" 
      />

      <AnimatePresence mode="wait">
        {!isGameStarted ? (
          <motion.div
            key="form"
            initial={{ rotateY: -90, scale: 0.8, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ rotateY: 90, scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-xl mx-4 p-8 sm:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-[24px] border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] z-10 overflow-hidden"
          >
            {/* Animated scanning line over the card */}
            <motion.div 
              animate={{ y: ["-100%", "400%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.5)] pointer-events-none z-50"
            />

            <div className="text-center mb-10 relative z-10">
              <motion.div 
                animate={alias.length > 0 ? { rotate: 180 } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 mx-auto mb-4 border-2 border-cyan-400/30 rounded-full flex items-center justify-center bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <Icon icon="ph:fingerprint-simple-fill" className="text-2xl text-cyan-400" />
              </motion.div>
              <h2 className="text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-200">
                Identity Setup
              </h2>
              <p className="text-white/40 text-xs mt-2 font-mono tracking-widest uppercase">
                Awaiting neural input
              </p>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Highly Interactive Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)] flex items-center gap-2 uppercase tracking-wider">
                    Choose Your Username
                  </label>
                  <span className="text-[10px] text-cyan-400/50 font-mono transition-colors">{hexCode}</span>
                </div>
                
                <motion.div 
                  animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                  className="relative group"
                >
                  {/* Glowing border effect on focus */}
                  <div className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 blur transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'group-hover:opacity-20'}`} />
                  
                  <div className="relative bg-black/60 border border-white/10 rounded-xl flex items-center overflow-hidden">
                    <div className="pl-4 pr-2 flex items-center justify-center">
                      <Icon 
                        icon="ph:terminal-window-fill" 
                        className={`text-xl transition-colors duration-300 ${isFocused || alias.length > 0 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-white/30'}`} 
                      />
                    </div>
                    <span className={`font-mono text-cyan-400 transition-opacity duration-300 ${isFocused || alias.length > 0 ? 'opacity-100' : 'opacity-30'}`}>{'>'}</span>
                    
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Type here..."
                      className="w-full bg-transparent py-4 pl-3 pr-4 text-cyan-50 outline-none font-mono text-lg placeholder:text-white/20"
                      autoComplete="off"
                      spellCheck="false"
                    />

                    {alias.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pr-4"
                      >
                        <Icon icon="ph:check-circle-fill" className="text-green-400 text-xl drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    initial={{ width: "0%" }}
                    animate={{ width: alias.length > 0 ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  />
                </div>
                <p className="text-[10px] text-white/30 font-mono text-right uppercase mt-1">
                  {alias.length > 0 ? 'Status: Valid' : 'Status: Empty'}
                </p>
              </div>

              {/* Interactive Submit Button */}
              <div className="pt-6">
                <motion.button
                  whileHover={alias && !loading ? { scale: 1.02 } : {}}
                  whileTap={alias && !loading ? { scale: 0.96 } : {}}
                  onClick={handleStartGame}
                  disabled={!alias || loading}
                  className="w-full relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 py-5 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.3)]"
                >
                  {/* Sweep animation on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                  
                  <span className="relative font-bold uppercase tracking-[0.3em] text-sm text-white group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-md flex items-center justify-center gap-3">
                    Start Game
                    <motion.div
                      animate={alias ? { x: [0, 5, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Icon icon="ph:arrow-right-bold" className="text-lg" />
                    </motion.div>
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ rotateY: -90, scale: 0.8, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            exit={{ rotateY: 90, scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-4xl mx-4 p-8 sm:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-[24px] border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] z-10 min-h-[400px] flex flex-col justify-center items-center"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-green-400/50 flex items-center justify-center bg-green-400/10 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                <Icon icon="ph:check-bold" className="text-4xl text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">
                Welcome, <span className="text-cyan-400">{alias}</span>
              </h2>
              <p className="text-white/50 font-mono uppercase tracking-widest text-sm mb-8">
                Neural Link Established
              </p>
              
              <button 
                onClick={() => setIsGameStarted(false)}
                className="text-xs text-white/40 hover:text-cyan-400 transition-colors font-mono uppercase tracking-widest border border-white/10 hover:border-cyan-400/50 rounded-lg px-6 py-3"
              >
                Disconnect & Revert
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
