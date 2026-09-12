"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { auth, db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, increment, deleteDoc, getDocs } from "firebase/firestore";
import CreateTaskModal from "./CreateTaskModal";
import SettingsModal from "./SettingsModal";
import TaskHistoryModal from "./TaskHistoryModal";
import NeuralProfileModal from "./NeuralProfileModal";
import LinkAvatarModal from "./LinkAvatarModal";
import PerfectDayCelebration from "./PerfectDayCelebration";
import { signOut } from "firebase/auth";
import { useCyberAudio } from "../hooks/useCyberAudio";

// --- 3D Task Card Component ---
interface TaskCardProps {
  task: any;
  onCompleteToggle: (id: string, currentStatus: boolean, reward: number) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onPause?: (id: string, elapsedMs: number) => void;
  onResume?: (id: string, pausedElapsedMs: number) => void;
  onViewHistory?: (title: string) => void;
  isDelayed?: boolean;
  isMissed?: boolean;
}
const TaskCard: React.FC<TaskCardProps> = ({ task, onCompleteToggle, onDelete, onStart, onPause, onResume, onViewHistory, isDelayed, isMissed }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const durationInSeconds = (task.durationMinutes || 25) * 60;
  
  const { playSuccess, playGlitch } = useCyberAudio();
  
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const isCompleted = task.status === 'completed' || task.isCompleted;
  const isRunning = task.status === 'in_progress';
  const isPaused = task.status === 'paused';

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && task.timerStartedAt && task.taskType !== 'instant') {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - task.timerStartedAt) / 1000);
        const remaining = durationInSeconds - elapsed;
        
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsCelebrating(true);
          playSuccess(); // Play success chime
          
          if (Notification.permission === 'granted') {
            new Notification('Quest Completed! +XP', { body: `Task [${task.title}] has been successfully completed. Rewards credited.` });
          }
          
          setTimeout(() => {
            setIsCelebrating(false);
            onCompleteToggle(task.id, false, task.reward); // marking it completed
          }, 3000); // Show effect for 3 seconds
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else if (isPaused && task.paused_elapsed_time) {
      const remaining = durationInSeconds - Math.floor(task.paused_elapsed_time / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    } else if (!isRunning && !isCompleted && !isPaused) {
      setTimeLeft(durationInSeconds);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, task.timerStartedAt, task.paused_elapsed_time, durationInSeconds, task.id, onCompleteToggle, playSuccess, isCompleted, task.title, task.reward, task.taskType]);

  // AFK Reminder logic
  useEffect(() => {
    let afkTimeout: NodeJS.Timeout;
    if (isPaused) {
      let timeoutMs = 120000; // Medium: 2 mins
      if (task.difficulty === 'Easy') timeoutMs = 60000; // 1 min
      else if (task.difficulty === 'Hard') timeoutMs = 300000; // 5 mins

      afkTimeout = setTimeout(() => {
        const messages = [
          'SYSTEM IDLE: Wake up, Samurai. We have a task to burn! Hit play.',
          'NEURO-LINK DEGRADING: Focus lost. Resume your mission immediately!',
          'AFK WARNING: The timeline is slipping. Get back to work.'
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        playGlitch();
        const notification = document.createElement('div');
        notification.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-yellow-900/80 border border-yellow-500 text-yellow-200 px-6 py-3 rounded-lg font-mono text-sm shadow-[0_0_20px_rgba(234,179,8,0.4)] z-[200] backdrop-blur-md animate-[slide_0.3s_ease-out]";
        notification.innerHTML = `<span class="font-bold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,104v40a8,8,0,0,0,16,0V104a8,8,0,0,0-16,0Zm20,80a12,12,0,1,1-12-12A12,12,0,0,1,140,184Z"></path></svg> ${randomMsg}</span>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transition = 'opacity 0.3s';
          setTimeout(() => notification.remove(), 300);
        }, 5000);
      }, timeoutMs);
    }
    return () => clearTimeout(afkTimeout);
  }, [isPaused, task.difficulty, playGlitch]);

  const onComplete = (taskId: string, reward: number) => {
      setIsCelebrating(true);
      playSuccess();
      setTimeout(() => {
        setIsCelebrating(false);
        onCompleteToggle(taskId, false, reward);
      }, 1500);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [isLocked, setIsLocked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Check if time-locked
  useEffect(() => {
    if (task.taskType !== 'instant' && task.targetTime && !isCompleted && !isRunning) {
      const checkLock = () => {
        const [h, m] = task.targetTime.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);
        // Locked if current time is strictly before target time
        setIsLocked(new Date() < target);
      };
      checkLock();
      const interval = setInterval(checkLock, 60000); // Check every minute
      return () => clearInterval(interval);
    } else {
      setIsLocked(false);
    }
  }, [task.targetTime, task.taskType, isCompleted, isRunning]);

  const handleToggleTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLocked) {
      setIsShaking(true);
      playGlitch(); // Use glitch sound for access denied
      
      // Toast notification for lock
      const notification = document.createElement('div');
      notification.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 text-red-200 px-6 py-3 rounded-lg font-mono text-sm shadow-[0_0_20px_rgba(239,68,68,0.4)] z-[200] backdrop-blur-md animate-[slide_0.3s_ease-out]";
      notification.innerHTML = `<span class="font-bold flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-72v32a8,8,0,0,1-16,0V136a8,8,0,0,1,16,0Z"></path></svg> ACCESS DENIED: Mission unlocks at ${task.targetTime}. Conserve your stamina!</span>`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        setIsShaking(false);
      }, 300);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
      
      return;
    }
    
    // Do not allow pausing or starting if already completed/celebrating
    if (!isRunning && !isPaused && !isCompleted && !isCelebrating) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      onStart(task.id);
    } else if (isRunning && onPause) {
      onPause(task.id, Date.now() - task.timerStartedAt);
    } else if (isPaused && onResume) {
      onResume(task.id, task.paused_elapsed_time);
    }
  };

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getContainerStyles = () => {
    if (isCelebrating) return "border-green-400 bg-green-900/20 shadow-[0_0_50px_rgba(74,222,128,0.5)]";
    if (isCompleted) return "border-green-400 bg-green-900/10 shadow-[0_0_20px_rgba(74,222,128,0.3)]";
    if (isRunning) return "border-cyan-400 bg-cyan-900/10 shadow-[0_0_30px_rgba(34,211,238,0.3)]";
    if (isPaused) return "border-yellow-400 bg-yellow-900/10 shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-[pulse_3s_ease-in-out_infinite]";
    if (isMissed) return "border-red-900/50 bg-black/60 shadow-none opacity-80 grayscale-[30%]";
    if (task.taskType === 'instant') return "border-pink-500/30 bg-white/[0.03] hover:border-pink-500/70 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]";
    if (isDelayed) return "border-red-500 bg-red-900/10 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-[pulse_2s_ease-in-out_infinite]";
    return "border-cyan-400/30 bg-white/[0.03] hover:border-cyan-400/70 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]";
  };

  return (
    <div className="relative [perspective:1000px] w-full">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full p-6 rounded-2xl backdrop-blur-xl border shadow-lg group transition-colors duration-300 overflow-hidden ${getContainerStyles()}`}
      >
        <AnimatePresence>
          {isCelebrating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-500/20 backdrop-blur-md"
            >
              <Icon icon="ph:check-circle-fill" className="text-6xl text-green-400 mb-2 drop-shadow-[0_0_20px_rgba(74,222,128,1)] animate-bounce" />
              <h2 className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-yellow-300 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] tracking-widest uppercase">
                Quest Cleared
              </h2>
              <p className="text-green-200 font-mono text-sm mt-1">+{task.reward} XP Earned</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!isCompleted && !isRunning && !isPaused && !isCelebrating && (
          <div 
            className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl ${isMissed ? 'bg-red-900' : isDelayed ? 'bg-red-500' : task.taskType === 'instant' ? 'bg-pink-500' : 'bg-cyan-400'}`} 
            style={{ transform: "translateZ(-10px)" }} 
          />
        )}
        
        {isRunning && !isCelebrating && (
          <div 
            className={`absolute inset-0 opacity-30 animate-pulse rounded-2xl blur-xl bg-cyan-400`} 
            style={{ transform: "translateZ(-10px)" }} 
          />
        )}

        {isPaused && !isCelebrating && (
          <div 
            className={`absolute inset-0 opacity-20 animate-pulse rounded-2xl blur-xl bg-yellow-400`} 
            style={{ transform: "translateZ(-10px)" }} 
          />
        )}

        <div style={{ transform: "translateZ(40px)" }} className="relative z-10 flex flex-col h-full">
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {task.taskType === 'instant' ? (
                <button
                  onClick={() => onComplete(task.id, task.reward)}
                  disabled={isCompleted || isCelebrating}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted || isCelebrating
                      ? "bg-green-500/20 border border-green-400 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                      : "bg-pink-500/10 border border-pink-400/50 hover:border-pink-400 text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                  }`}
                >
                  <Icon icon={isCompleted || isCelebrating ? "ph:check-bold" : "ph:lightning-bold"} className="text-xl" />
                </button>
              ) : (
                <motion.button 
                  onClick={handleToggleTimer}
                  disabled={isCompleted || isCelebrating || isMissed}
                  animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted || isCelebrating
                      ? "bg-green-500/20 border border-green-400 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                      : isMissed
                      ? "bg-red-900/10 border border-red-900/30 text-red-500/50 cursor-not-allowed"
                      : isLocked
                      ? "bg-gray-500/10 border border-gray-500/50 text-gray-400 opacity-60 cursor-not-allowed hover:border-gray-500 hover:opacity-100"
                      : isDelayed && !isRunning && !isPaused
                      ? "bg-red-500/20 border border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-500/40 cursor-pointer"
                      : isRunning
                      ? "bg-yellow-500/20 border border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:bg-yellow-500/40 cursor-pointer"
                      : isPaused
                      ? "bg-yellow-500/10 border border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.5)] cursor-pointer"
                      : "bg-cyan-500/10 border border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] cursor-pointer"
                  }`}
                >
                  {isCompleted || isCelebrating ? <Icon icon="ph:check-bold" className="text-xl" /> : 
                   isRunning ? <Icon icon="ph:pause-fill" className="text-xl drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" /> :
                   isPaused ? <Icon icon="ph:play-fill" className="text-xl pl-0.5" /> :
                   isLocked ? <Icon icon="ph:lock-fill" className="text-xl" /> :
                   <Icon icon="ph:play-bold" className="text-xl pl-0.5" />}
                </motion.button>
              )}
              
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border border-white/10 ${isCompleted ? "text-green-400" : isMissed ? "text-red-900/50" : isDelayed && task.taskType !== 'instant' ? "text-red-400" : task.iconColor}`}>
                <Icon icon={task.icon || "ph:brain-fill"} className="text-xl" />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 mb-1 z-20 relative">
                {onViewHistory && (
                  <button onClick={(e) => { e.stopPropagation(); onViewHistory(task.title); }} className="text-cyan-400/50 hover:text-cyan-400">
                    <Icon icon="ph:clock-counter-clockwise-bold" />
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-red-400/50 hover:text-red-400">
                  <Icon icon="ph:trash-bold" />
                </button>
              </div>
              {task.isDaily && (
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 bg-black/40 text-purple-400 mb-1 flex items-center gap-1`}>
                  <Icon icon="ph:arrows-clockwise-bold" /> Daily
                </span>
              )}
              {task.taskType !== 'instant' && (
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 bg-black/40 text-cyan-400`}>
                  {task.difficulty}
                </span>
              )}
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/40 px-2">
                [{task.attribute}]
              </span>
            </div>
          </div>

          <h3 className={`text-lg font-bold mb-2 tracking-wide transition-all ${isCompleted ? "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" : isMissed ? "text-white/20" : isDelayed && task.taskType !== 'instant' ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : isRunning ? "text-cyan-300" : isPaused ? "text-yellow-300" : "text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400"}`}>
            {task.title}
          </h3>
          
          {isRunning || isPaused ? (
            <div className="py-2 mb-2">
              <div className={`text-4xl font-mono font-bold text-transparent bg-clip-text text-center tracking-widest ${isPaused ? 'bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="w-full bg-black/50 h-1 mt-3 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / durationInSeconds) * 100}%` }}
                    transition={{ ease: "linear", duration: 1 }}
                    className={`h-full ${isPaused ? 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}
                 />
              </div>
            </div>
          ) : isCompleted ? (
             <div className="py-2 mb-4 mt-2">
                <div className="inline-block border border-green-400/50 bg-green-500/20 px-3 py-1 rounded text-green-400 font-mono text-sm tracking-widest uppercase font-bold shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                  <Icon icon="ph:seal-check-fill" className="inline-block mr-2 text-lg -mt-1" />
                  Completed
                </div>
             </div>
          ) : isMissed ? (
             <div className="py-2 mb-4 mt-2">
                <div className="inline-block border border-red-900/30 bg-red-900/10 px-3 py-1 rounded text-red-500/50 font-mono text-sm tracking-widest uppercase font-bold">
                  <Icon icon="ph:warning-circle-fill" className="inline-block mr-2 text-lg -mt-1" />
                  Missed
                </div>
             </div>
          ) : isDelayed && task.taskType !== 'instant' ? (
             <div className="py-2 mb-4 mt-2">
                <div className="inline-block border border-red-500/50 bg-red-500/20 px-3 py-1 rounded text-red-500 font-mono text-sm tracking-widest uppercase font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                  <Icon icon="ph:warning-octagon-fill" className="inline-block mr-2 text-lg -mt-1" />
                  Delayed
                </div>
             </div>
          ) : (
            <p className={`text-sm text-white/40 font-sans line-clamp-2 ${task.taskType === 'instant' ? 'mb-2' : 'mb-6'}`}>
              {task.desc}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
            <div className={`flex items-center gap-2`}>
              <Icon icon="ph:coin-vertical-fill" className="text-yellow-400 text-lg" />
              <span className="text-yellow-400 font-mono text-sm font-bold">+{task.reward} XP</span>
            </div>
            {!isRunning && (
               <div className="flex items-center gap-3 text-xs font-mono text-white/50 uppercase tracking-widest">
                  {task.targetTime && (
                    <span className={`flex items-center gap-1 ${isMissed ? 'text-white/20' : isDelayed && !isCompleted ? 'text-red-400 font-bold' : ''}`}>
                       <Icon icon={isMissed || (isDelayed && !isCompleted) ? "ph:warning-circle-bold" : "ph:target-bold"} /> {task.targetTime}
                    </span>
                  )}
                  {!isCompleted && task.taskType !== 'instant' && (
                    <span className="flex items-center gap-1">
                      <Icon icon="ph:clock-fill" /> {task.durationMinutes || 25} MIN
                    </span>
                  )}
               </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};


export default function CyberDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [systemToast, setSystemToast] = useState<string | null>(null);
  const [historyTitle, setHistoryTitle] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Real-time clock for dashboard
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle Android/Browser Back Button for Modals
  useEffect(() => {
    const isAnyModalOpen = isModalOpen || isSettingsOpen || isProfileOpen || isAddUserModalOpen || historyTitle !== null;
    
    if (isAnyModalOpen) {
      // Push a new state to the history when a modal opens
      window.history.pushState({ modalOpen: true }, "");
    }

    const handlePopState = (e: PopStateEvent) => {
      if (isAnyModalOpen) {
        // Intercept back button to close modals instead of leaving app
        setIsModalOpen(false);
        setIsSettingsOpen(false);
        setIsProfileOpen(false);
        setIsAddUserModalOpen(false);
        setHistoryTitle(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isModalOpen, isSettingsOpen, isProfileOpen, isAddUserModalOpen, historyTitle]);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Fetch User Data
    const userUnsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      setUserData(doc.data());
    });

    // Fetch Tasks
    const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid));
    const tasksUnsub = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const fetchedTasks = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((t: any) => t.createdAt && t.createdAt.startsWith(today));
      setTasks(fetchedTasks);
    });

    return () => {
      userUnsub();
      tasksUnsub();
    };
  }, []);

  const handleCompleteToggle = async (taskId: string, currentStatus: boolean, reward: number) => {
    if (!auth.currentUser || !userData) return;
    const taskRef = doc(db, "tasks", taskId);
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!currentStatus) {
      // Mark as completed
      const lastCompleted = userData.lastCompletedDate;
      let newStreak = userData.streak || 0;
      
      if (lastCompleted !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastCompleted === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1; // reset streak if missed a day
        }
      }

      await updateDoc(taskRef, { 
        isCompleted: true, 
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      // Auto-Respawn Logic for Quick Action Intervals
      const task = tasks.find(t => t.id === taskId);
      if (task && task.taskType === 'instant' && task.interval_minutes && task.interval_minutes > 0) {
        if (task.targetTime) {
          const now = new Date();
          const nextTime = new Date(now);
          const [hhStr, mmStr] = task.targetTime.split(':');
          nextTime.setHours(parseInt(hhStr, 10), parseInt(mmStr, 10), 0, 0);
          
          // Add the interval minutes to the original target time
          nextTime.setMinutes(nextTime.getMinutes() + task.interval_minutes);
          
          // Ensure the next time is still on the same day
          if (nextTime.getDate() === now.getDate() && nextTime.getMonth() === now.getMonth()) {
            const hh = nextTime.getHours().toString().padStart(2, '0');
            const mm = nextTime.getMinutes().toString().padStart(2, '0');
            const nextTargetTimeStr = `${hh}:${mm}`;

            await addDoc(collection(db, 'tasks'), {
              userId: auth.currentUser.uid,
              title: task.title,
              desc: task.desc || '',
              difficulty: task.difficulty,
              durationMinutes: task.durationMinutes,
              targetTime: nextTargetTimeStr,
              interval_minutes: task.interval_minutes,
              isDaily: task.isDaily,
              reward: task.reward,
              icon: task.icon,
              iconColor: task.iconColor,
              taskType: task.taskType,
              status: 'pending',
              timerStartedAt: null,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      await updateDoc(userRef, { 
        xp: increment(reward),
        credits: increment(10),
        [`activityMap.${today}`]: increment(1),
        lastCompletedDate: today,
        streak: newStreak
      });
    } else {
      // Revert completion
      await updateDoc(taskRef, { 
        isCompleted: false, 
        status: 'pending', 
        timerStartedAt: null,
        completedAt: null
      });
      // We don't revert streak easily because it's complex, just reverse XP/credits & activity
      await updateDoc(userRef, { 
        xp: increment(-reward),
        credits: increment(-10),
        [`activityMap.${today}`]: increment(-1)
      });
    }
  };

  const handleStartTask = async (taskId: string) => {
    if (!auth.currentUser) return;
    
    // Query Firestore to check if ANY task is already in_progress
    const activeQuery = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid), where("status", "==", "in_progress"));
    const snapshot = await getDocs(activeQuery);
    
    if (!snapshot.empty) {
      alert('Only one task can be active at a time.');
      return;
    }
    
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { 
      status: 'in_progress',
      timerStartedAt: Date.now() // Use client timestamp for simple elapsed calc
    });
  };

  const handlePauseTask = async (taskId: string, elapsedMs: number) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { 
      status: 'paused',
      paused_elapsed_time: elapsedMs
    });
  };

  const handleResumeTask = async (taskId: string, pausedElapsedMs: number) => {
    if (!auth.currentUser) return;
    
    const activeQuery = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid), where("status", "==", "in_progress"));
    const snapshot = await getDocs(activeQuery);
    
    if (!snapshot.empty) {
      alert('Only one task can be active at a time.');
      return;
    }

    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { 
      status: 'in_progress',
      timerStartedAt: Date.now() - pausedElapsedMs
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const handleBuyToken = async () => {
    if (!auth.currentUser || !userData || userData.credits < 100) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      credits: increment(-100),
      tokens: increment(1)
    });
  };

  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  
  // Basic level calculation
  const currentLevel = userData ? Math.floor(userData.xp / 1000) + 1 : 1;
  const currentXp = userData ? userData.xp % 1000 : 0;
  const xpPercent = (currentXp / 1000) * 100;

  // Categorize Tasks
  const failedTasks: any[] = [];
  const activeTasks: any[] = [];
  const completedTasks: any[] = [];

  const todayStr = currentTime.toISOString().split('T')[0];

  tasks.forEach(t => {
    if (t.status === 'completed' || t.isCompleted) {
      completedTasks.push(t);
    } else {
      let isMissed = false;
      let isDelayed = false;

      const taskDate = t.createdAt ? t.createdAt.split('T')[0] : todayStr;
      
      if (taskDate < todayStr) {
        isMissed = true;
      }

      if (!isMissed && t.taskType !== 'instant' && t.targetTime) {
        const [h, m] = t.targetTime.split(':').map(Number);
        const target = new Date(currentTime);
        target.setHours(h, m, 0, 0);
        target.setMinutes(target.getMinutes() + 30);
        if (currentTime > target) {
          isDelayed = true;
        }
      }

      if (t.status === 'in_progress') {
        activeTasks.push(t);
      } else if (isMissed) {
        t._isMissed = true;
        failedTasks.push(t);
      } else {
        t._isDelayed = isDelayed;
        activeTasks.push(t);
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#05090f] text-white font-sans relative overflow-x-hidden selection:bg-cyan-500/30 pb-20">
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskCreated={() => {}} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userData={userData} handleBuyToken={handleBuyToken} />
      <TaskHistoryModal isOpen={!!historyTitle} onClose={() => setHistoryTitle(null)} taskTitle={historyTitle || ''} />
      <PerfectDayCelebration totalTasks={totalTasks} completedTasks={completedTasksCount} />
      
      {/* System Toast Overlay */}
      <AnimatePresence>
        {systemToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-black/90 backdrop-blur-xl border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] rounded-full px-6 py-3 flex items-center gap-3"
          >
            <Icon icon="ph:terminal-window-fill" className="text-cyan-400 text-xl animate-pulse" />
            <span className="font-mono text-cyan-300 text-sm tracking-widest">{systemToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Animated Background --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Top HUD */}
        <header className="sticky top-0 w-full backdrop-blur-xl bg-black/60 border-b border-white/10 p-4 sm:p-6 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Player Info & Economy */}
            <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-center md:justify-start">
              
              <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400 p-1 transition-all group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    <div className="w-full h-full bg-cyan-400/20 rounded-full flex items-center justify-center">
                      <Icon icon="ph:user-circle-bold" className="text-xl text-cyan-400" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-black border border-cyan-400 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    LVL {currentLevel}
                  </div>
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-4 left-0 w-64 bg-black/80 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.2)] p-2 z-[100]"
                    >
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => { setIsProfileOpen(true); setIsDropdownOpen(false); }}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-cyan-900/30 rounded-xl transition-colors text-white text-sm font-mono uppercase tracking-widest"
                          >
                            <Icon icon="ph:brain-fill" className="text-cyan-400 text-lg" />
                            Neural Profile
                          </button>
                          <button 
                            onClick={() => { setIsSettingsOpen(true); setIsDropdownOpen(false); }}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-cyan-900/30 rounded-xl transition-colors text-white text-sm font-mono uppercase tracking-widest"
                          >
                            <Icon icon="ph:gear-fill" className="text-white/70 text-lg" />
                            System Config
                          </button>
                          <button 
                            onClick={() => signOut(auth)}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-red-900/30 rounded-xl transition-colors text-red-400 text-sm font-mono uppercase tracking-widest"
                          >
                            <Icon icon="ph:power-bold" className="text-lg" />
                            Log Out
                          </button>
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest px-4 mb-2">Linked Avatars</p>
                          <div className="flex flex-col gap-1">
                             {userData?.linkedAvatars?.map((avatar: any, idx: number) => (
                               <div key={idx} className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer rounded-xl transition-colors">
                                 <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-400/30 flex items-center justify-center">
                                   <Icon icon="ph:user" className="text-cyan-400 text-xs" />
                                 </div>
                                 <span className="text-xs font-mono text-cyan-100 truncate flex-1">{avatar.email}</span>
                               </div>
                             ))}
                             
                             <button 
                               onClick={() => {
                                 setIsDropdownOpen(false);
                                 setIsAddUserModalOpen(true);
                               }}
                               className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-colors text-white/70 text-xs font-mono w-full text-left"
                             >
                               <div className="w-6 h-6 rounded-full border border-dashed border-white/30 flex items-center justify-center"><Icon icon="ph:plus-bold" /></div>
                               Add New User
                             </button>
                          </div>
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <h1 className="text-lg font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {userData?.alias || 'Unknown'}
                  </h1>
                  <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    Netrunner
                  </p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              {/* Streak & Credits */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
                  <Icon icon="ph:fire-fill" className="text-orange-500 text-lg drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest leading-none">Streak</span>
                    <span className="text-sm font-bold text-white leading-none mt-1">{userData?.streak || 0} <span className="text-[10px] font-normal text-white/40">Days</span></span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
                  <Icon icon="ph:coin-vertical-fill" className="text-yellow-400 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/50 uppercase font-mono tracking-widest leading-none">Balance</span>
                    <span className="text-sm font-bold text-white leading-none mt-1">{userData?.credits || 0} <span className="text-[10px] font-normal text-yellow-400">CR</span></span>
                  </div>
                </div>
              </div>

            </div>

            {/* Stats Bars (XP) */}
            <div className="flex-1 w-full md:max-w-md space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/50">
                  <span>Experience to LVL {currentLevel + 1}</span>
                  <span className="text-cyan-400">{currentXp} / 1000</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                  <motion.div 
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] relative"
                  />
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Main Interface */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 flex flex-col lg:flex-row gap-8">
          
          <NeuralProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} userData={userData} tasks={tasks} />
          <LinkAvatarModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />

          {/* Left Column: Action Area & Quest Board */}
          <div className="flex-1 space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
                  <Icon icon="ph:kanban-fill" className="text-2xl text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    Active Quests
                  </h2>
                  <p className="text-xs text-white/40 font-mono mt-1">{tasks.length}/10 targets identified</p>
                </div>
              </div>

              {/* Create Quest Button */}
              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={tasks.length >= 10}
                className="relative group overflow-hidden rounded-xl bg-cyan-500/10 border border-cyan-400/30 px-6 py-3 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative font-bold font-mono uppercase tracking-widest text-xs text-cyan-400 group-hover:text-cyan-300 flex items-center gap-2">
                  <Icon icon="ph:plus-bold" /> Create Quest
                </span>
              </button>
            </div>

            {/* Task Grid - 3 Sections */}
            {tasks.length === 0 ? (
              <div className="text-center py-20 border border-white/5 border-dashed rounded-2xl bg-black/20">
                <Icon icon="ph:radar-fill" className="text-6xl text-cyan-400/20 mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-white/50 font-mono uppercase tracking-widest">No active quests found</h3>
                <p className="text-white/30 text-sm mt-2">Initialize a new quest to begin.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                
                {/* SECTION 1: FAILED / MISSED */}
                {failedTasks.length > 0 && (
                  <div>
                    <h3 className="text-red-500 font-bold font-mono tracking-widest uppercase mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                      <Icon icon="ph:warning-octagon-bold" className="text-xl animate-pulse" /> Critical: Missed Quests
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-1000">
                      <AnimatePresence>
                        {failedTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onCompleteToggle={handleCompleteToggle} onDelete={handleDeleteTask} onStart={handleStartTask} onPause={handlePauseTask} onResume={handleResumeTask} onViewHistory={setHistoryTitle} isMissed={task._isMissed} isDelayed={task._isDelayed} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* SECTION 2: ACTIVE / UPCOMING */}
                {activeTasks.length > 0 && (
                  <div>
                    <h3 className="text-cyan-400 font-bold font-mono tracking-widest uppercase mb-4 flex items-center gap-2">
                      <Icon icon="ph:lightning-bold" className="text-xl" /> Active / Upcoming
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-1000">
                      <AnimatePresence>
                        {activeTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onCompleteToggle={handleCompleteToggle} onDelete={handleDeleteTask} onStart={handleStartTask} onPause={handlePauseTask} onResume={handleResumeTask} onViewHistory={setHistoryTitle} isMissed={task._isMissed} isDelayed={task._isDelayed} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* SECTION 3: COMPLETED */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-green-500 font-bold font-mono tracking-widest uppercase mb-4 flex items-center gap-2">
                      <Icon icon="ph:check-circle-bold" className="text-xl" /> Success / Cleared
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-1000">
                      <AnimatePresence>
                        {completedTasks.map((task) => (
                          <TaskCard key={task.id} task={task} onCompleteToggle={handleCompleteToggle} onDelete={handleDeleteTask} onStart={handleStartTask} onPause={handlePauseTask} onResume={handleResumeTask} onViewHistory={setHistoryTitle} isMissed={false} isDelayed={false} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Right Column: Sidebar Widgets */}
          <aside className="w-full lg:w-[32%] shrink-0 space-y-6">
            
            {/* 1. Perfect Day Tracker */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-green-400/30 transition-colors">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="font-bold text-sm uppercase tracking-wider text-white/80 flex items-center gap-2">
                  <Icon icon="ph:calendar-check-fill" className="text-green-400 text-lg" />
                  Perfect Day
                </h3>
                <span className="text-[10px] font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
                  +10 XP Bonus
                </span>
              </div>
              
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-xs font-mono text-white/50">
                  <span>Progress</span>
                  <span className="text-white">{completedTasksCount} / {totalTasks || 1} Tasks</span>
                </div>
                <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    animate={{ width: `${totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0}%` }}
                    className="h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                  />
                </div>
                {totalTasks > 0 && completedTasksCount === totalTasks && (
                  <p className="text-xs text-green-400 font-mono mt-2 text-center animate-pulse">Daily Protocol Complete!</p>
                )}
              </div>
            </div>

            {/* 2. Mini-Rank */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-400/30 transition-colors">
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              
              <h3 className="font-bold text-sm uppercase tracking-wider text-white/80 flex items-center gap-2 mb-5 relative z-10">
                <Icon icon="ph:trophy-fill" className="text-blue-400 text-lg" />
                Current Standings
              </h3>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
                      <Icon icon="ph:globe-hemisphere-west-fill" />
                    </div>
                    <span className="text-xs text-white/60 uppercase tracking-wider font-mono">Global Rank</span>
                  </div>
                  <span className="font-bold font-mono text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">#{Math.floor(Math.random() * 500) + 1}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                      <Icon icon="ph:brain-fill" />
                    </div>
                    <span className="text-xs text-white/60 uppercase tracking-wider font-mono">Netrunner</span>
                  </div>
                  <span className="font-bold font-mono text-lg text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]">#{Math.floor(Math.random() * 50) + 1}</span>
                </div>
              </div>
            </div>

          </aside>

        </main>
      </div>
    </div>
  );
}
