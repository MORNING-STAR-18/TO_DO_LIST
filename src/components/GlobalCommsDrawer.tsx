import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useCyberAudio } from '../hooks/useCyberAudio';

export default function GlobalCommsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullMode, setIsFullMode] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playHover, playSelect } = useCyberAudio();

  // Fetch current user data (for avatar/name and phone verification status)
  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = collection(db, 'users');
    const q = query(userRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.id === auth.currentUser?.uid) {
          setUserData(doc.data());
        }
      });
    });
    return () => unsubscribe();
  }, []);

  // Fetch global messages
  useEffect(() => {
    const commsRef = collection(db, 'global_comms');
    const q = query(commsRef, orderBy('createdAt', 'asc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // In Firebase, serverTimestamp() is initially null on the client before it syncs with the server.
      // We still want to show the message immediately, so we don't filter it out, we just sort it to the end.
      const sortedMsgs = msgs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? a.createdAt : Date.now());
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? b.createdAt : Date.now());
        return timeA - timeB;
      });

      setMessages(sortedMsgs);
      
      // Auto-scroll on new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Global Comms fetch error:", error);
    });
    
    return () => unsubscribe();
  }, []);

  // Scroll to bottom when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isOpen]);

  // Handle Android Back Button
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modalOpen: true }, "");
    }
    const handlePopState = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;
    
    const txt = newMessage.trim();
    setNewMessage('');
    playSelect();

    try {
      const newMsgRef = await addDoc(collection(db, 'global_comms'), {
        text: txt,
        uid: auth.currentUser.uid,
        senderName: userData?.displayName || auth.currentUser.displayName || 'Anonymous Operator',
        senderAvatar: userData?.avatarUrl || auth.currentUser.photoURL || null,
        createdAt: serverTimestamp()
      });
      console.log("Message sent with ID: ", newMsgRef.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          playHover();
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 border border-cyan-500/50 py-4 px-2 rounded-l-xl backdrop-blur-md cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-400 transition-all flex flex-col items-center gap-4 group shadow-[0_0_15px_rgba(34,211,238,0.2)]"
      >
        <Icon icon="ph:users-three-fill" className="text-cyan-400 text-2xl group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,1)]" />
        <span 
          style={{ writingMode: 'vertical-rl' }} 
          className="text-cyan-400 font-mono text-[10px] tracking-[0.2em] uppercase rotate-180"
        >
          Community
        </span>
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%', width: 'min(100vw, 450px)' }}
              animate={{ x: 0, width: isFullMode ? '100%' : 'min(100vw, 450px)' }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200, width: { type: "spring", damping: 20, stiffness: 150 } }}
              className="fixed inset-y-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-l border-cyan-500/50 shadow-[-20px_0_50px_rgba(34,211,238,0.15)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-transparent to-cyan-900/20">
                <div className="flex items-center gap-3">
                  <Icon icon="ph:globe-hemisphere-east-fill" className="text-2xl text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <h2 className="text-xl font-black font-mono tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Community Terminal
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsFullMode(!isFullMode)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-cyan-900/30 hover:border-cyan-500/50 transition-colors"
                  >
                    <Icon icon={isFullMode ? "ph:corners-in-bold" : "ph:corners-out-bold"} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
                  >
                    <Icon icon="ph:x-bold" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 font-mono text-sm gap-2">
                    <Icon icon="ph:radar-fill" className="text-4xl opacity-50 animate-[spin_4s_linear_infinite]" />
                    <p>SCANNING FREQUENCIES...</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.uid === auth.currentUser?.uid;
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                        {!isMe && (
                          <span className="text-[9px] font-mono text-white/40 mb-1 ml-1 flex items-center gap-1 uppercase tracking-wider">
                            {msg.senderAvatar ? (
                               <img src={msg.senderAvatar} alt="" className="w-3 h-3 rounded-full opacity-70 object-cover" />
                            ) : (
                               <Icon icon="ph:user-focus-duotone" />
                            )}
                            {msg.senderName}
                          </span>
                        )}
                        <div 
                          className={`p-3 rounded-2xl text-sm ${
                            isMe 
                              ? 'bg-cyan-900/30 border border-cyan-500/50 text-cyan-50 shadow-[0_0_15px_rgba(34,211,238,0.15)] rounded-tr-sm' 
                              : 'bg-black/60 border border-fuchsia-500/30 text-white/90 shadow-[0_0_15px_rgba(217,70,239,0.05)] rounded-tl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-black/40">
                {userData?.phoneVerified ? (
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Transmit message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500/50 focus:bg-cyan-900/10 transition-all font-mono"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="h-11 px-4 flex items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-400 font-black font-mono tracking-widest text-[10px] hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      SEND <Icon icon="ph:paper-plane-right-fill" className="ml-2 text-sm" />
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 px-6 bg-[#1a0505]/80 border border-red-500/30 rounded-xl relative overflow-hidden group shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.03)_10px,rgba(239,68,68,0.03)_20px)]" />
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                    
                    <span className="text-red-400 text-xs font-mono font-bold tracking-[0.2em] uppercase flex items-center gap-2 relative z-10 mb-1.5 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">
                      <Icon icon="ph:lock-key-fill" className="text-lg" />
                      Comms Locked
                    </span>
                    <span className="text-red-300/60 text-[10px] font-mono text-center relative z-10">
                      Identity verification required. Link your phone number in Neural Profile to transmit.
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
