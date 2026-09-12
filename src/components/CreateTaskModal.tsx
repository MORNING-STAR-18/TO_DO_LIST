import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: { isOpen: boolean; onClose: () => void; onTaskCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(25);
  
  // Custom Interval Engine States
  const [doesNotRepeat, setDoesNotRepeat] = useState(true);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<'MINUTES'|'HOURS'>('HOURS');
  
  const [taskType, setTaskType] = useState<'timed' | 'instant'>('timed');

  // Custom Time Stepper states
  const [targetHour, setTargetHour] = useState(12);
  const [targetMinute, setTargetMinute] = useState(0);
  const [targetAmPm, setTargetAmPm] = useState<'AM'|'PM'>('PM');
  const [isTimeSet, setIsTimeSet] = useState(false); // To know if user enabled time

  const [isDaily, setIsDaily] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-check isDaily for Quick Actions
  useEffect(() => {
    if (taskType === 'instant') {
      setIsDaily(true);
    } else {
      setIsDaily(false);
    }
  }, [taskType]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (difficultyDropdownRef.current && !difficultyDropdownRef.current.contains(event.target as Node)) {
        setIsDifficultyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const PRESETS_TIMED = [
    { title: 'DSA / Code', difficulty: 'Hard', icon: 'ph:code-bold' },
    { title: 'Eng. Maths Revision', difficulty: 'Hard', icon: 'ph:math-operations-bold' },
    { title: 'Gym / Workout', difficulty: 'Medium', icon: 'ph:barbell-bold' },
    { title: 'Ranked Match', difficulty: 'Tutorial', icon: 'ph:game-controller-bold' },
  ];

  const PRESETS_INSTANT = [
    { title: 'Hydration Sync', icon: 'ph:drop-bold' },
    { title: 'Comms Check', icon: 'ph:envelope-simple-bold' },
    { title: 'Hardware Reset', icon: 'ph:broom-bold' },
  ];

  const adjustHour = (delta: number) => {
    setIsTimeSet(true);
    setTargetHour(prev => {
      let next = prev + delta;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return next;
    });
  };

  const adjustMinute = (delta: number) => {
    setIsTimeSet(true);
    setTargetMinute(prev => {
      let next = prev + delta;
      if (next > 59) next = 0;
      if (next < 0) next = 59;
      return next;
    });
  };

  const setQuickTime = (type: string) => {
    setIsTimeSet(true);
    const now = new Date();
    if (type === '+1') {
      now.setHours(now.getHours() + 1);
    } else if (type === '+3') {
      now.setHours(now.getHours() + 3);
    } else if (type === 'EOD') {
      now.setHours(20, 0, 0, 0); // 8 PM
    }
    
    let hh = now.getHours();
    setTargetMinute(now.getMinutes());
    if (hh >= 12) {
      setTargetAmPm('PM');
      if (hh > 12) hh -= 12;
    } else {
      setTargetAmPm('AM');
      if (hh === 0) hh = 12;
    }
    setTargetHour(hh);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !auth.currentUser) return;
    
    setLoading(true);
    
    let finalTargetTime = '';
    if (isTimeSet) {
       let hh = targetHour;
       if (targetAmPm === 'PM' && hh !== 12) hh += 12;
       if (targetAmPm === 'AM' && hh === 12) hh = 0;
       finalTargetTime = `${hh.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`;
    }

    let reward = 50;
    if (difficulty === 'Hard') reward = 200;
    if (difficulty === 'Epic') reward = 500;
    if (difficulty === 'Medium') reward = 120;

    let iconColor = "text-cyan-400";
    let icon = "ph:brain-fill";
    
    // Assign random generic colors/icons since attribute is gone
    const colors = ["text-cyan-400", "text-purple-500", "text-pink-500", "text-yellow-400", "text-orange-500", "text-green-400"];
    iconColor = colors[Math.floor(Math.random() * colors.length)];
    
    const icons = ["ph:lightning-fill", "ph:cube-fill", "ph:hexagon-fill", "ph:crosshair-fill"];
    icon = icons[Math.floor(Math.random() * icons.length)];

    // Check presets to retain icon
    const allPresets = [...PRESETS_TIMED, ...PRESETS_INSTANT];
    const presetMatch = allPresets.find(p => p.title === title);
    if (presetMatch && presetMatch.icon) icon = presetMatch.icon;

    // Calculate final interval minutes
    let finalIntervalMinutes = 0;
    if (taskType === 'instant' && !doesNotRepeat) {
      finalIntervalMinutes = intervalUnit === 'HOURS' ? intervalValue * 60 : intervalValue;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        userId: auth.currentUser.uid,
        title,
        desc,
        difficulty: taskType === 'instant' ? 'Tutorial' : difficulty,
        durationMinutes: taskType === 'instant' ? 0 : Number(duration),
        targetTime: finalTargetTime,
        interval_minutes: finalIntervalMinutes,
        isDaily,
        reward: taskType === 'instant' ? 20 : reward,
        icon,
        iconColor,
        taskType,
        status: 'pending',
        timerStartedAt: null,
        createdAt: new Date().toISOString()
      });
      onTaskCreated();
      onClose();
      setTitle('');
      setDesc('');
      setDuration(25);
      setDoesNotRepeat(true);
      setIntervalValue(1);
      setIntervalUnit('HOURS');
      setTargetHour(12);
      setTargetMinute(0);
      setTargetAmPm('PM');
      setIsTimeSet(false);
      setIsDaily(false);
      setTaskType('timed');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const activePresets = taskType === 'timed' ? PRESETS_TIMED : PRESETS_INSTANT;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[#0b0f14] border border-cyan-400/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-pink-500" />
            
            <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white/40 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10 hover:border-white/30 transition-colors">
              <Icon icon="ph:x-bold" className="text-lg" />
            </button>
            
            <div className="flex items-center mb-6 mt-2">
              <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Icon icon="ph:plus-bold" className="text-cyan-400" /> Create Quest
              </h2>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 mb-6 relative">
               <button 
                  type="button" 
                  onClick={() => setTaskType('timed')} 
                  className={`flex-1 relative z-10 py-2 text-xs font-mono tracking-widest uppercase transition-colors ${taskType === 'timed' ? 'text-black font-bold' : 'text-cyan-400/70 hover:text-cyan-400'}`}
               >
                  Deep Work
               </button>
               <button 
                  type="button" 
                  onClick={() => setTaskType('instant')} 
                  className={`flex-1 relative z-10 py-2 text-xs font-mono tracking-widest uppercase transition-colors ${taskType === 'instant' ? 'text-black font-bold' : 'text-pink-400/70 hover:text-pink-400'}`}
               >
                  Quick Action
               </button>
               <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ${taskType === 'timed' ? 'left-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'left-[calc(50%+2px)] bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]'}`}
               />
            </div>

            {/* Quick Load Presets */}
            <div className="mb-6">
              <label className={`block text-[10px] font-mono uppercase tracking-widest mb-3 flex items-center gap-1 ${taskType === 'timed' ? 'text-cyan-400' : 'text-pink-500'}`}>
                <Icon icon="ph:lightning-bold" /> Quick Load Presets
              </label>
              <div ref={containerRef} className="flex flex-wrap gap-2 relative p-1 -m-1">
                {activePresets.map((preset) => (
                  <motion.div
                    key={preset.title}
                    drag
                    dragConstraints={containerRef}
                    dragElastic={0.2}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setTitle(preset.title);
                      if (taskType === 'timed') setDifficulty(preset.difficulty);
                    }}
                    className={`cursor-pointer bg-white/5 backdrop-blur-md border px-3 py-1.5 rounded-full flex items-center gap-2 transition-colors z-20 ${taskType === 'instant' ? 'border-pink-500/30 text-pink-400 hover:border-pink-400/60 hover:bg-pink-900/30 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] shadow-[0_0_10px_rgba(236,72,153,0.1)]' : 'border-cyan-400/30 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-900/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] shadow-[0_0_10px_rgba(34,211,238,0.1)]'}`}
                  >
                    <Icon icon={preset.icon} />
                    <span className="text-xs font-mono font-bold tracking-wide">{preset.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1">Target Designation</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1">Mission Brief</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Task description..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <label className={`block text-[10px] font-mono uppercase tracking-widest mb-1 flex items-center gap-1 ${taskType === 'instant' ? 'text-pink-400' : 'text-cyan-400'}`}><Icon icon="ph:target-bold"/> {taskType === 'instant' ? 'First Trigger Time' : 'Target Time (Deadline)'}</label>
                    
                    {/* Custom Digital Time Stepper */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col relative overflow-hidden">
                      {!isTimeSet && (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                            <button type="button" onClick={() => setIsTimeSet(true)} className={`border px-3 py-1 rounded text-xs font-mono transition-colors ${taskType === 'instant' ? 'bg-pink-500/20 text-pink-400 border-pink-400/50 hover:bg-pink-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-400/50 hover:bg-cyan-500/40'}`}>
                               Set Time
                            </button>
                         </div>
                      )}
                      
                      <div className="flex items-center justify-center gap-2 mb-3">
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                          <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => adjustHour(1)} className={`text-white/40 pb-1 ${taskType === 'instant' ? 'hover:text-pink-400' : 'hover:text-cyan-400'}`}><Icon icon="ph:caret-up-bold" /></motion.button>
                          <div className={`w-10 h-10 bg-black/50 border rounded flex items-center justify-center font-mono text-xl font-bold ${taskType === 'instant' ? 'border-pink-400/30 shadow-[0_0_10px_rgba(236,72,153,0.2)] text-pink-300' : 'border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)] text-cyan-300'}`}>
                            {targetHour.toString().padStart(2, '0')}
                          </div>
                          <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => adjustHour(-1)} className={`text-white/40 pt-1 ${taskType === 'instant' ? 'hover:text-pink-400' : 'hover:text-cyan-400'}`}><Icon icon="ph:caret-down-bold" /></motion.button>
                        </div>

                        <div className={`font-bold text-xl animate-pulse -mt-4 ${taskType === 'instant' ? 'text-pink-400/50' : 'text-cyan-400/50'}`}>:</div>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                          <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => adjustMinute(5)} className={`text-white/40 pb-1 ${taskType === 'instant' ? 'hover:text-pink-400' : 'hover:text-cyan-400'}`}><Icon icon="ph:caret-up-bold" /></motion.button>
                          <div className={`w-10 h-10 bg-black/50 border rounded flex items-center justify-center font-mono text-xl font-bold ${taskType === 'instant' ? 'border-pink-400/30 shadow-[0_0_10px_rgba(236,72,153,0.2)] text-pink-300' : 'border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)] text-cyan-300'}`}>
                            {targetMinute.toString().padStart(2, '0')}
                          </div>
                          <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => adjustMinute(-5)} className={`text-white/40 pt-1 ${taskType === 'instant' ? 'hover:text-pink-400' : 'hover:text-cyan-400'}`}><Icon icon="ph:caret-down-bold" /></motion.button>
                        </div>

                        {/* AM/PM Toggle */}
                        <div className="ml-2 flex flex-col gap-1 -mt-4">
                          <button 
                            type="button" 
                            onClick={() => { setIsTimeSet(true); setTargetAmPm('AM'); }}
                            className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${targetAmPm === 'AM' ? (taskType === 'instant' ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]') : 'bg-black/40 border-white/10 text-white/40'}`}
                          >
                            AM
                          </button>
                          <button 
                            type="button"
                            onClick={() => { setIsTimeSet(true); setTargetAmPm('PM'); }}
                            className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${targetAmPm === 'PM' ? 'bg-magenta-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_8px_rgba(232,121,249,0.4)]' : 'bg-black/40 border-white/10 text-white/40'}`}
                          >
                            PM
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/5">
                         <button type="button" onClick={() => setQuickTime('+1')} className={`flex-1 bg-black/30 border border-white/5 rounded py-1 text-[9px] font-mono transition-colors ${taskType === 'instant' ? 'hover:bg-pink-900/30 text-white/60 hover:text-pink-300 hover:border-pink-400/30' : 'hover:bg-cyan-900/30 text-white/60 hover:text-cyan-300 hover:border-cyan-400/30'}`}>
                            +1h
                         </button>
                         <button type="button" onClick={() => setQuickTime('+3')} className={`flex-1 bg-black/30 border border-white/5 rounded py-1 text-[9px] font-mono transition-colors ${taskType === 'instant' ? 'hover:bg-pink-900/30 text-white/60 hover:text-pink-300 hover:border-pink-400/30' : 'hover:bg-cyan-900/30 text-white/60 hover:text-cyan-300 hover:border-cyan-400/30'}`}>
                            +3h
                         </button>
                         <button type="button" onClick={() => setQuickTime('EOD')} className={`flex-1 bg-black/30 border border-white/5 rounded py-1 text-[9px] font-mono transition-colors ${taskType === 'instant' ? 'hover:bg-pink-900/30 text-white/60 hover:text-pink-300 hover:border-pink-400/30' : 'hover:bg-cyan-900/30 text-white/60 hover:text-cyan-300 hover:border-cyan-400/30'}`}>
                            EOD
                         </button>
                         {isTimeSet && (
                           <button type="button" onClick={() => setIsTimeSet(false)} className="px-2 text-[10px] text-red-400 hover:text-red-300 ml-1">
                             <Icon icon="ph:x-bold" />
                           </button>
                         )}
                      </div>
                    </div>
                    
                    {taskType === 'instant' && (
                       <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
                         <div className="flex items-center justify-between mb-3 relative z-10">
                           <label className="text-[10px] text-pink-400 font-mono uppercase tracking-widest flex items-center gap-1">
                             <Icon icon="ph:arrows-clockwise-bold"/> Repeat Interval
                           </label>
                           <button 
                             type="button"
                             onClick={() => setDoesNotRepeat(!doesNotRepeat)}
                             className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded border transition-colors ${doesNotRepeat ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'bg-black/40 border-white/10 text-white/40 hover:text-white/80'}`}
                           >
                             Does Not Repeat
                           </button>
                         </div>
                         
                         <div className={`transition-all duration-300 ${doesNotRepeat ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'} relative z-10 flex items-center gap-3`}>
                           {/* Custom Value Stepper */}
                           <div className="flex items-center bg-black/50 border border-pink-400/30 rounded flex-1 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                             <button type="button" onClick={() => setIntervalValue(prev => Math.max(1, prev - 1))} className="p-2 text-white/40 hover:text-pink-400 border-r border-pink-400/20">
                               <Icon icon="ph:minus-bold" />
                             </button>
                             <div className="flex-1 text-center font-mono text-lg font-bold text-pink-300">
                               {intervalValue}
                             </div>
                             <button type="button" onClick={() => setIntervalValue(prev => prev + 1)} className="p-2 text-white/40 hover:text-pink-400 border-l border-pink-400/20">
                               <Icon icon="ph:plus-bold" />
                             </button>
                           </div>

                           {/* Unit Toggle */}
                           <div className="flex bg-black/50 border border-white/10 rounded p-1">
                             <button 
                               type="button" 
                               onClick={() => setIntervalUnit('MINUTES')}
                               className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors ${intervalUnit === 'MINUTES' ? 'bg-pink-500/20 text-pink-300 border border-pink-400/50 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'text-white/40 hover:text-white/80'}`}
                             >
                               MINS
                             </button>
                             <button 
                               type="button" 
                               onClick={() => setIntervalUnit('HOURS')}
                               className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors ${intervalUnit === 'HOURS' ? 'bg-pink-500/20 text-pink-300 border border-pink-400/50 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'text-white/40 hover:text-white/80'}`}
                             >
                               HOURS
                             </button>
                           </div>
                         </div>
                       </div>
                    )}
                  </div>
                
                {taskType === 'timed' && (
                  <div className="flex flex-col col-span-2 md:col-span-1">
                    <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1 flex items-center gap-1"><Icon icon="ph:hourglass-bold"/> Duration (Minutes)</label>
                    
                    {/* Custom Digital Duration Stepper */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col relative overflow-hidden h-full justify-center">
                      <div className="flex items-center justify-between px-2 mb-3">
                         <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => setDuration(prev => Math.max(1, prev - 5))} className="w-8 h-8 rounded bg-black/50 border border-cyan-400/30 text-white/50 hover:text-cyan-400 hover:border-cyan-400/80 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            <Icon icon="ph:minus-bold" />
                         </motion.button>
                         
                         <div className="flex flex-col items-center">
                            <span className="font-mono text-3xl font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                               {duration}
                            </span>
                            <span className="text-[9px] text-cyan-400/50 uppercase tracking-widest -mt-1">MINS</span>
                         </div>
                         
                         <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => setDuration(prev => Math.min(240, prev + 5))} className="w-8 h-8 rounded bg-black/50 border border-cyan-400/30 text-white/50 hover:text-cyan-400 hover:border-cyan-400/80 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                            <Icon icon="ph:plus-bold" />
                         </motion.button>
                      </div>
                      
                      {/* Quick Pills */}
                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/5">
                         <button type="button" onClick={() => setDuration(15)} className="flex-1 bg-black/30 hover:bg-cyan-900/30 text-white/60 hover:text-cyan-300 border border-white/5 hover:border-cyan-400/30 rounded py-1 text-[9px] font-mono transition-colors">
                           15m
                         </button>
                         <button type="button" onClick={() => setDuration(25)} className={`flex-1 hover:bg-cyan-900/30 hover:text-cyan-300 border hover:border-cyan-400/30 rounded py-1 text-[9px] font-mono transition-colors ${duration === 25 ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400' : 'bg-black/30 text-white/60 border-white/5'}`}>
                           25m
                         </button>
                         <button type="button" onClick={() => setDuration(60)} className="flex-1 bg-black/30 hover:bg-cyan-900/30 text-white/60 hover:text-cyan-300 border border-white/5 hover:border-cyan-400/30 rounded py-1 text-[9px] font-mono transition-colors">
                           60m
                         </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                <input
                  type="checkbox"
                  id="isDaily"
                  checked={isDaily}
                  onChange={(e) => setIsDaily(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-cyan-400 focus:ring-cyan-400 bg-black/50"
                />
                <label htmlFor="isDaily" className="text-sm text-white/80 cursor-pointer select-none">
                  Daily Recurring Quest
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {taskType === 'timed' && (
                  <div className="col-span-2 relative" ref={difficultyDropdownRef}>
                    <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1">Difficulty</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        onFocus={() => setIsDifficultyDropdownOpen(true)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 focus:bg-cyan-900/10 text-sm transition-colors"
                        placeholder="Type or select..."
                      />
                      <div 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer p-1"
                        onClick={() => setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)}
                      >
                        <Icon icon="ph:caret-down-bold" className={`transition-transform ${isDifficultyDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isDifficultyDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-[#0a0a0f]/95 border border-cyan-500/30 rounded-xl overflow-hidden backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                        >
                          {['Tutorial', 'Medium', 'Hard', 'Epic'].map((opt) => (
                            <div
                              key={opt}
                              className="px-4 py-3 text-sm text-white/80 hover:text-cyan-300 hover:bg-cyan-500/10 cursor-pointer transition-colors flex items-center gap-2"
                              onClick={() => {
                                setDifficulty(opt);
                                setIsDifficultyDropdownOpen(false);
                              }}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${difficulty === opt ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-transparent'}`} />
                              {opt}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 border font-bold font-mono uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50 ${taskType === 'instant' ? 'bg-pink-500/10 border-pink-400/50 hover:bg-pink-500/20 hover:border-pink-400 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-cyan-500/10 border-cyan-400/50 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'}`}
              >
                {loading ? 'Processing...' : taskType === 'instant' ? 'Deploy Action' : 'Deploy Quest'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
