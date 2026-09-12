import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Country, State, City } from 'country-state-city';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface NeuralProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  tasks: any[];
}

// --- Custom Select Component for Location Modal ---
const LocationDropdown = ({ placeholder, options, value, onChange, disabled }: { placeholder: string, options: any[], value: string, onChange: (val: string, code: string) => void, disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <Icon icon="ph:caret-down-bold" className="text-white/50 text-xs ml-2 flex-shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-[300] top-full left-0 w-full mt-1 bg-[#1e2329] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '250px' }}
          >
            <div className="p-2 border-b border-white/10 relative">
               <Icon icon="ph:magnifying-glass-bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
               <input 
                 type="text" 
                 autoFocus
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search..."
                 className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 pl-8 pr-2 text-sm text-white outline-none focus:border-blue-500"
               />
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
              {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(opt.name, opt.isoCode || opt.stateCode); setIsOpen(false); setSearch(''); }}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-blue-600 hover:text-white transition-colors truncate"
                >
                  {opt.name}
                </button>
              )) : (
                <div className="px-3 py-4 text-center text-white/40 text-sm">No results</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function NeuralProfileModal({ isOpen, onClose, userData, tasks }: NeuralProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userData?.photoURL || null);
  
  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userData?.alias || '');
  const [editLocation, setEditLocation] = useState(userData?.location || '');
  const [editCommLink, setEditCommLink] = useState(userData?.phone || '');
  
  // Location Modal States
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locCountry, setLocCountry] = useState({ name: '', code: '' });
  const [locState, setLocState] = useState({ name: '', code: '' });
  const [locCity, setLocCity] = useState({ name: '' });

  // OTP States
  const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'pending' | 'verified'>('idle');
  const [otpCode, setOtpCode] = useState('');
  
  // Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Upload Menu State
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSendOtp = () => {
    if (!editCommLink) return;
    setOtpStatus('sending');
    setTimeout(() => {
      setOtpStatus('pending');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otpCode.length > 3) {
      setOtpStatus('verified');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setIsUploadMenuOpen(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const updateData: any = {
        alias: editName,
        location: editLocation,
        phone: editCommLink,
      };
      // If they completed the mock OTP step successfully during this edit session
      if (otpStatus === 'verified') {
         updateData.phoneVerified = true;
      } else if (editCommLink !== userData?.phone) {
         // If they changed the phone number but didn't verify
         updateData.phoneVerified = false;
      }
      
      await updateDoc(doc(db, "users", auth.currentUser.uid), updateData);
      setIsEditingProfile(false);
    } catch (e) {
      console.error("Error saving profile", e);
    }
  };

  const handleCancelEdit = () => {
    // Revert state
    setEditName(userData?.alias || '');
    setEditLocation(userData?.location || '');
    setEditCommLink(userData?.phone || '');
    setIsEditingProfile(false);
  };

  // --- Weekly Trend Data Calculation ---
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, tasks: 0 }));
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      if ((task.status === 'completed' || task.isCompleted) && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate >= oneWeekAgo && completedDate <= now) {
          const dayIndex = completedDate.getDay();
          data[dayIndex].tasks += 1;
        }
      }
    });
    
    // Rotate array so today is last
    const todayIndex = now.getDay();
    const rotatedData = [...data.slice(todayIndex + 1), ...data.slice(0, todayIndex + 1)];
    
    // Replace 'name' with relative days like 'Today', 'Yesterday'
    rotatedData[6].name = 'Today';
    rotatedData[5].name = 'Yesterday';
    
    return rotatedData;
  }, [tasks]);

  // --- Heatmap (Activity Log) Calculation ---
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const offsetDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        const dateStr = offsetDate.toISOString().split('T')[0];
        const count = (userData?.activityMap || {})[dateStr] || 0;
        days.push({ date: dateStr, count });
    }
    return days;
  }, [userData?.activityMap]);

  // Use a dummy variable for totalActiveDays as requested (or calculate from map)
  const totalActiveDays = 110;

  // Auto-scroll to the right (Today) for the heatmap
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (userData) {
      setEditName(userData.alias || '');
      setEditLocation(userData.location || '');
      setEditCommLink(userData.phone || '');
      if (userData.phoneVerified) {
        setOtpStatus('verified');
      }
    }
  }, [userData]);

  React.useEffect(() => {
    if (isOpen && scrollContainerRef.current && !isEditingProfile) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [isOpen, heatmapDays.length, isEditingProfile]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-[#0b0f14]/90 border border-cyan-400/30 rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(34,211,238,0.2)] relative custom-scrollbar flex flex-col gap-8"
          >
            {/* Top decorative bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
            
            {/* Header */}
            <div className="flex justify-between items-center sticky top-0 bg-[#0b0f14]/90 backdrop-blur-md pt-2 pb-6 z-20 border-b border-white/5 -mt-6 -mx-6 px-6 mb-2">
              <h2 className="text-3xl font-bold uppercase tracking-widest text-white flex items-center gap-4">
                <Icon icon="ph:brain-fill" className="text-cyan-400 animate-pulse" /> Neural Profile
              </h2>
              <button onClick={onClose} className="text-white/40 hover:text-cyan-400 transition-colors bg-white/5 p-2 rounded-xl">
                <Icon icon="ph:x-bold" className="text-xl" />
              </button>
            </div>

            {!isEditingProfile ? (
              <>
                {/* Profile Readout (View Mode) */}
                <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-2 border-cyan-400 p-1">
                        <div className="w-full h-full bg-cyan-400/20 rounded-full flex items-center justify-center relative overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Neural Avatar" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Icon icon="ph:user-circle-bold" className="text-5xl text-cyan-400" />
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-black border border-cyan-400 text-cyan-400 text-xs font-mono px-3 py-1 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                        LVL {userData ? Math.floor(userData.xp / 1000) + 1 : 1}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
                      <h3 className="text-sm text-cyan-400 font-mono uppercase tracking-widest mb-1">Active User</h3>
                      <p className="text-3xl font-bold text-white tracking-widest">{userData?.alias || 'Unknown'}</p>
                      <button 
                        onClick={() => {
                          setIsEditingProfile(true);
                          setOtpStatus(userData?.phoneVerified ? 'verified' : 'idle');
                        }}
                        className="mt-3 px-4 py-1.5 border border-cyan-400/50 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2"
                      >
                        <Icon icon="ph:pencil-simple-fill" /> Edit Profile
                      </button>
                    </div>
                    <div className="flex gap-6 text-center md:text-right">
                      <div>
                        <h3 className="text-xs text-white/40 font-mono uppercase tracking-widest mb-1">Global Streak</h3>
                        <p className="text-3xl font-bold text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] flex items-center gap-2 justify-center md:justify-end">
                          <Icon icon="ph:fire-fill" /> {userData?.streak || 0}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs text-white/40 font-mono uppercase tracking-widest mb-1">Active Days</h3>
                        <p className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] flex items-center gap-2 justify-center md:justify-end">
                          <Icon icon="ph:calendar-check-fill" /> {totalActiveDays}
                        </p>
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Weekly Output Trend */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-6">
                      <Icon icon="ph:chart-line-up-bold" className="text-lg" />
                      Weekly Output Trend
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000000e6', border: '1px solid #22d3ee40', borderRadius: '8px' }}
                            itemStyle={{ color: '#22d3ee' }}
                            cursor={{ stroke: '#22d3ee40', strokeWidth: 2, strokeDasharray: '4 4' }}
                          />
                          <Area type="monotone" dataKey="tasks" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Milestone Badges */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-6">
                      <Icon icon="ph:medal-fill" className="text-lg" />
                      Milestone Badges
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* Badge 1: Street Kid (>= 50) */}
                      <div className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${totalActiveDays >= 50 ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'bg-black/40 border-white/5 grayscale opacity-50'}`}>
                        {totalActiveDays < 50 && <Icon icon="ph:lock-fill" className="absolute top-2 right-2 text-white/30" />}
                        <Icon icon="ph:hexagon-fill" className={`text-4xl mb-2 ${totalActiveDays >= 50 ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'text-white/40'}`} />
                        <span className="text-xs font-mono uppercase font-bold tracking-widest text-center text-white/80">Street Kid</span>
                        <span className="text-[9px] text-white/40 font-mono mt-1">50 Days</span>
                      </div>

                      {/* Badge 2: Edgerunner (>= 100) */}
                      <div className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${totalActiveDays >= 100 ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-black/40 border-white/5 grayscale opacity-50'}`}>
                        {totalActiveDays < 100 && <Icon icon="ph:lock-fill" className="absolute top-2 right-2 text-white/30" />}
                        <Icon icon="ph:shield-chevron-fill" className={`text-4xl mb-2 ${totalActiveDays >= 100 ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-white/40'}`} />
                        <span className="text-xs font-mono uppercase font-bold tracking-widest text-center text-white/80">Edgerunner</span>
                        <span className="text-[9px] text-white/40 font-mono mt-1">100 Days</span>
                      </div>

                      {/* Badge 3: Radiant Core (>= 150) */}
                      <div className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${totalActiveDays >= 150 ? 'bg-pink-500/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.2)]' : 'bg-black/40 border-white/5 grayscale opacity-50'}`}>
                        {totalActiveDays < 150 && <Icon icon="ph:lock-fill" className="absolute top-2 right-2 text-white/30" />}
                        <Icon icon="ph:star-four-fill" className={`text-4xl mb-2 ${totalActiveDays >= 150 ? 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'text-white/40'}`} />
                        <span className="text-xs font-mono uppercase font-bold tracking-widest text-center text-white/80">Radiant Core</span>
                        <span className="text-[9px] text-white/40 font-mono mt-1">150 Days</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-4">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-6">
                      <Icon icon="ph:squares-four-bold" className="text-lg" />
                      Activity Log (Contribution Graph)
                    </h3>
                    <div 
                      ref={scrollContainerRef}
                      className="w-full overflow-x-auto pb-4 scrollbar-hide" 
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                      <div className="grid grid-rows-7 grid-flow-col gap-1 w-max mx-auto md:mx-0">
                        {heatmapDays.map((day, i) => {
                            let colorClass = "bg-white/5 border-white/10";
                            if (day.count === 1) colorClass = "bg-cyan-900/60 border-cyan-800/50";
                            else if (day.count === 2) colorClass = "bg-cyan-700/80 border-cyan-600/50";
                            else if (day.count >= 3) colorClass = "bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]";
                            
                            return (
                              <div 
                                key={i} 
                                title={`${day.count} quests cleared on ${day.date}`}
                                className={`w-[14px] h-[14px] rounded-[2px] border ${colorClass} transition-colors hover:border-white`} 
                              />
                            );
                        })}
                      </div>
                    </div>
                </div>
              </>
            ) : (
              /* Edit Profile View */
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                  <h3 className="font-bold text-lg uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-8 border-b border-white/10 pb-4">
                    <Icon icon="ph:user-gear-fill" className="text-2xl" />
                    Edit Neural Data
                  </h3>

                  {/* Avatar Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                    <div className="w-32 h-32 rounded-full border-2 border-cyan-400 p-1 flex-shrink-0">
                      <div className="w-full h-full bg-cyan-400/20 rounded-full flex items-center justify-center relative overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Neural Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Icon icon="ph:user-circle-bold" className="text-6xl text-cyan-400" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="user"
                          className="hidden" 
                          ref={cameraInputRef} 
                          onChange={handleImageUpload} 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => setIsUploadMenuOpen(true)}
                        className="px-6 py-3 bg-cyan-500/10 border border-cyan-400/50 text-cyan-400 font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2"
                      >
                        <Icon icon="ph:upload-simple-bold" className="text-lg" /> Upload Photo
                      </button>
                      <button 
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(248,113,113,0.2)] transition-all flex items-center justify-center gap-2"
                      >
                        <Icon icon="ph:trash-bold" className="text-lg" /> Remove Photo
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1.5 ml-1">Display Name / Alias</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="ph:identification-card-fill" className="text-white/30 text-lg" />
                        </div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="e.g., Morning_star"
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1.5 ml-1">Location / Base of Operations</label>
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => setIsLocationModalOpen(true)}
                      >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon icon="ph:map-pin-fill" className="text-white/30 text-lg group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-mono text-sm flex items-center h-[46px]">
                          {editLocation ? <span>{editLocation}</span> : <span className="text-white/40">Select Location...</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-cyan-400 font-mono uppercase tracking-widest mb-1.5 ml-1">Comm-Link / Phone Number</label>
                      <div className="flex flex-col gap-3">
                        <div className="relative flex items-center gap-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon icon="ph:phone-fill" className="text-white/30 text-lg" />
                            </div>
                            <input
                              type="text"
                              value={editCommLink}
                              onChange={(e) => {
                                setEditCommLink(e.target.value);
                                if (otpStatus !== 'idle') setOtpStatus('idle');
                              }}
                              disabled={otpStatus === 'verified' || otpStatus === 'pending' || otpStatus === 'sending'}
                              placeholder="e.g., +1 234 567 8900"
                              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-mono text-sm disabled:opacity-50"
                            />
                          </div>
                          {otpStatus === 'idle' && editCommLink && (
                             <button
                               onClick={handleSendOtp}
                               className="px-4 py-3 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-xl font-mono text-xs font-bold hover:bg-blue-600/40 hover:text-white transition-colors"
                             >
                               VERIFY
                             </button>
                          )}
                          {otpStatus === 'sending' && (
                             <button disabled className="px-4 py-3 bg-blue-600/10 border border-blue-500/20 text-blue-400/50 rounded-xl font-mono text-xs font-bold flex items-center gap-2">
                               <Icon icon="ph:spinner-gap-bold" className="animate-spin" /> SENDING
                             </button>
                          )}
                          {otpStatus === 'verified' && (
                             <button disabled className="px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-mono text-xs font-bold flex items-center gap-2">
                               <Icon icon="ph:check-circle-fill" className="text-lg" /> VERIFIED
                             </button>
                          )}
                        </div>
                        
                        {otpStatus === 'pending' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-blue-500/30"
                          >
                             <div className="relative flex-1">
                               <Icon icon="ph:password-fill" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                               <input
                                 type="text"
                                 value={otpCode}
                                 onChange={(e) => setOtpCode(e.target.value)}
                                 placeholder="Enter 6-digit OTP"
                                 className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-400 font-mono text-sm"
                                 maxLength={6}
                               />
                             </div>
                             <button
                               onClick={handleVerifyOtp}
                               disabled={otpCode.length < 4}
                               className="px-4 py-2 bg-blue-600 text-white rounded-lg font-mono text-xs font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                             >
                               CONFIRM
                             </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex justify-end gap-4 mt-2">
                  <button 
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-white/10 text-white/60 font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="px-6 py-3 bg-cyan-500/10 border border-cyan-400/50 text-cyan-400 font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2"
                  >
                    <Icon icon="ph:check-bold" className="text-lg" /> Save Changes
                  </button>
                </div>
              </div>
            )}

          </motion.div>

          {/* Nested Location Modal */}
          <AnimatePresence>
            {isLocationModalOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#1a1e23] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.8)] relative mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                    <Icon icon="ph:info-fill" className="text-blue-500 text-xl" /> Update Your Location
                  </h4>
                  
                  <div className="flex flex-col gap-4 mb-8">
                    <LocationDropdown 
                      placeholder="Country/Region"
                      options={Country.getAllCountries()}
                      value={locCountry.name}
                      onChange={(name, code) => {
                        setLocCountry({ name, code });
                        setLocState({ name: '', code: '' });
                        setLocCity({ name: '' });
                      }}
                    />
                    
                    <LocationDropdown 
                      placeholder="State/Province"
                      options={locCountry.code ? State.getStatesOfCountry(locCountry.code) : []}
                      value={locState.name}
                      disabled={!locCountry.code}
                      onChange={(name, code) => {
                        setLocState({ name, code });
                        setLocCity({ name: '' });
                      }}
                    />
                    
                    <LocationDropdown 
                      placeholder="City/Town"
                      options={locState.code ? City.getCitiesOfState(locCountry.code, locState.code) : []}
                      value={locCity.name}
                      disabled={!locState.code}
                      onChange={(name, _code) => {
                        setLocCity({ name });
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsLocationModalOpen(false)}
                      className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        const parts = [locCity.name, locCountry.name].filter(Boolean);
                        if (parts.length > 0) {
                           setEditLocation(parts.join(', '));
                        }
                        setIsLocationModalOpen(false);
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Delete Confirmation Modal */}
          <AnimatePresence>
            {isDeleteConfirmOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#1a1e23] border border-red-500/30 rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(239,68,68,0.2)] relative mx-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon="ph:warning-circle-fill" className="text-red-500 text-5xl mx-auto mb-4" />
                  <h4 className="text-white font-bold mb-2 text-lg uppercase tracking-wider font-mono">Remove Avatar</h4>
                  <p className="text-white/60 text-sm mb-6">Are you sure you want to remove your profile photo? This action cannot be undone.</p>
                  
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setAvatarUrl(null);
                        setIsDeleteConfirmOpen(false);
                      }}
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Upload Choice Modal */}
          <AnimatePresence>
            {isUploadMenuOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md rounded-3xl"
              >
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#1a1e23] border border-cyan-500/30 rounded-xl p-6 w-full max-w-sm shadow-[0_0_40px_rgba(34,211,238,0.15)] relative mx-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon="ph:camera-plus-fill" className="text-cyan-400 text-5xl mx-auto mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  <h4 className="text-white font-bold mb-6 text-lg uppercase tracking-wider font-mono">Select Source</h4>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full px-6 py-3 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 rounded-xl text-sm font-mono font-bold hover:bg-cyan-600/40 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:camera-bold" className="text-xl" /> Camera
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-6 py-3 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-xl text-sm font-mono font-bold hover:bg-blue-600/40 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:folder-open-bold" className="text-xl" /> Choose from Device
                    </button>
                    <button 
                      onClick={() => setIsUploadMenuOpen(false)}
                      className="w-full mt-2 px-6 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm font-mono font-bold hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
