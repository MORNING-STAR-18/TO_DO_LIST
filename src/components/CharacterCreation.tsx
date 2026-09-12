"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";

export default function CharacterCreation() {
  const [introFinished, setIntroFinished] = useState(false);
  const [alias, setAlias] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [mainQuest, setMainQuest] = useState("");

  // Trigger the glitch screen intro
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 2200); // Intro lasts 2.2 seconds
    return () => clearTimeout(timer);
  }, []);

  const classes = [
    { 
      id: "netrunner", 
      name: "Netrunner", 
      stat: "Intellect", 
      icon: "ph:brain-fill", 
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.4)]", 
      border: "border-cyan-400",
      accent: "text-cyan-400",
      bgHover: "hover:border-cyan-400/50"
    },
    { 
      id: "solo", 
      name: "Solo", 
      stat: "Strength", 
      icon: "ph:sword-fill", 
      glow: "shadow-[0_0_20px_rgba(236,72,153,0.4)]", 
      border: "border-pink-500",
      accent: "text-pink-500",
      bgHover: "hover:border-pink-500/50"
    },
    { 
      id: "corpo", 
      name: "Corpo", 
      stat: "Focus", 
      icon: "ph:briefcase-fill", 
      glow: "shadow-[0_0_20px_rgba(250,204,21,0.4)]", 
      border: "border-yellow-400",
      accent: "text-yellow-400",
      bgHover: "hover:border-yellow-400/50"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center font-sans overflow-hidden text-[#e7ecf2] relative">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(45,212,191,0.05)_0%,transparent_60%)] pointer-events-none" />

      <AnimatePresence>
        {!introFinished && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              textShadow: [
                "0 0 10px #2dd4bf", 
                "0 0 40px #2dd4bf, -5px 0 10px #e879f9", 
                "0 0 10px #2dd4bf"
              ],
              x: [0, -4, 4, -2, 2, 0] // Glitch jitter
            }}
            exit={{ 
              opacity: 0, 
              scale: 4, // Zoom out effect
              filter: "blur(20px)" 
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut", 
              exit: { duration: 0.6, ease: "easeIn" } 
            }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0f14]"
          >
            <h1 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 tracking-[0.2em] uppercase text-center drop-shadow-2xl">
              System Unlocked
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {introFinished && (
        <motion.div
          initial={{ y: -800, opacity: 0, rotateX: 20 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 12,
            bounce: 0.5,
            delay: 0.1
          }}
          className="relative w-full max-w-2xl mx-4 p-8 sm:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-[24px] border border-white/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              Initialize Avatar
            </h2>
            <p className="text-white/40 text-xs mt-2 font-mono tracking-widest uppercase">
              Establish your neural identity
            </p>
          </div>

          <div className="space-y-8">
            {/* 1. Player Alias */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                1. Player Alias
              </label>
              <div className="relative">
                <Icon icon="ph:terminal-window-fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Enter designation..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono text-sm placeholder:text-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* 2. Select Class */}
            <div className="space-y-4">
              <label className="text-[11px] font-mono text-pink-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
                2. Select Class Paradigm
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {classes.map((c) => {
                  const isSelected = selectedClass === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClass(c.id)}
                      className={`relative cursor-pointer rounded-xl p-5 flex flex-col items-center gap-3 transition-all duration-300 border bg-black/40 ${
                        isSelected
                          ? `${c.border} ${c.glow} bg-white/5`
                          : `border-white/10 ${c.bgHover}`
                      }`}
                    >
                      <Icon 
                        icon={c.icon} 
                        className={`text-3xl transition-colors ${isSelected ? c.accent : "text-white/30"}`} 
                      />
                      <div className="text-center">
                        <h3 className={`font-bold text-sm uppercase tracking-wider transition-colors ${isSelected ? "text-white" : "text-white/60"}`}>
                          {c.name}
                        </h3>
                        <p className={`text-[10px] font-mono mt-1 transition-colors ${isSelected ? c.accent : "text-white/30"}`}>
                          [{c.stat}]
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Main Quest */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                3. Primary Directive (Main Quest)
              </label>
              <div className="relative">
                <Icon icon="ph:crosshair-fill" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                <input
                  type="text"
                  value={mainQuest}
                  onChange={(e) => setMainQuest(e.target.value)}
                  placeholder="E.g. Survive Night City, Learn Next.js..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-yellow-50 outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-mono text-sm placeholder:text-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={!alias || !selectedClass || !mainQuest}
              className="w-full relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 py-4 mt-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative font-bold uppercase tracking-[0.3em] text-sm text-white group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-md">
                Initialize Link
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
