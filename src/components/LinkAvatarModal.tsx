import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface LinkAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LinkAvatarModal({ isOpen, onClose }: LinkAvatarModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        linkedAvatars: arrayUnion({
          email,
          createdAt: new Date().toISOString()
        })
      });
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      console.error("Error linking avatar:", err);
      alert("Failed to initialize link. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#0b0f14]/90 border border-fuchsia-500/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(217,70,239,0.15)]"
          >
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600" />
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-50 text-white/40 hover:text-fuchsia-400 bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10 hover:border-fuchsia-500/50 transition-colors"
            >
              <Icon icon="ph:x-bold" className="text-lg" />
            </button>

            <div className="mb-8 mt-2">
              <h2 className="text-2xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center gap-3">
                <Icon icon="ph:plugs-connected-fill" className="text-fuchsia-400" /> LINK NEW AVATAR
              </h2>
              <p className="text-white/40 text-xs font-mono mt-2 uppercase tracking-widest">Establish neural connection for secondary user.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1.5 ml-1">Email / Neural ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Icon icon="ph:identification-card-fill" className="text-white/30 text-lg" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter identifier..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-fuchsia-400 font-mono uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Icon icon="ph:lock-key-fill" className="text-white/30 text-lg" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white outline-none focus:border-fuchsia-500 focus:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all font-mono text-sm tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-fuchsia-400 transition-colors"
                  >
                    <Icon icon={showPassword ? "ph:eye-slash-fill" : "ph:eye-fill"} className="text-lg" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 relative overflow-hidden group bg-transparent border border-fuchsia-500/50 text-fuchsia-400 font-bold font-mono uppercase tracking-widest py-4 rounded-xl transition-all hover:bg-fuchsia-500/10 hover:border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.2)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Icon icon={loading ? "ph:spinner-gap-bold" : "ph:lightning-fill"} className={`text-lg ${loading ? 'animate-spin' : ''}`} /> 
                  {loading ? 'INITIALIZING...' : 'INITIALIZE NEURAL LINK'}
                </span>
                {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />}
              </button>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
