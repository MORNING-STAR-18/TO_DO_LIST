import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface TaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
}

export default function TaskHistoryModal({ isOpen, onClose, taskTitle }: TaskHistoryModalProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !taskTitle || !auth.currentUser) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "tasks"), 
          where("userId", "==", auth.currentUser.uid),
          where("title", "==", taskTitle),
          where("status", "==", "completed")
        );
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map(doc => {
          const data = doc.data();
          // Extract just the YYYY-MM-DD date
          return data.completedAt ? data.completedAt.split('T')[0] : (data.createdAt ? data.createdAt.split('T')[0] : '');
        }).filter(Boolean);
        
        // Remove duplicates and sort descending
        const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        setHistory(uniqueDates);
      } catch (err) {
        console.error("Failed to load history", err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [isOpen, taskTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-[#0a0f16] border border-cyan-400/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold font-mono text-white tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              Quest Log
            </h2>
            <p className="text-cyan-400 text-sm font-bold mt-1">[{taskTitle}]</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <Icon icon="ph:x-bold" className="text-xl" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <Icon icon="ph:spinner-gap-bold" className="text-3xl text-cyan-400 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-white/40 font-mono text-sm">
              No completion records found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-white/50 font-mono uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Total Clears</span>
                <span className="text-cyan-400 text-sm font-bold">{history.length}</span>
              </div>
              {history.map((date, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Icon icon="ph:calendar-check-fill" className="text-green-400 text-lg" />
                    <span className="font-mono text-sm text-white/80">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <span className="text-[10px] text-green-400 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Cleared</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
