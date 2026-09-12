import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { signInWithPopup } from 'firebase/auth';
import { googleProvider } from './lib/firebase';
import CyberDashboard from './components/CyberDashboard';
import CharacterCreation from './components/CharacterCreation';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checkingDb, setCheckingDb] = useState(true);

  useEffect(() => {
    async function checkUser() {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }
      }
      setCheckingDb(false);
    }
    if (!loading) {
      checkUser();
    }
  }, [user, loading]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || checkingDb) {
    return (
      <div className="min-h-screen bg-[#05090f] flex items-center justify-center">
        <Icon icon="ph:spinner-gap-bold" className="text-4xl text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05090f] flex flex-col items-center justify-center font-sans">
        <div className="w-20 h-20 bg-cyan-500/10 rounded-full border border-cyan-400/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <Icon icon="ph:terminal-window-fill" className="text-4xl text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-widest uppercase">System Login</h1>
        <p className="text-white/40 font-mono text-sm mb-8 uppercase">Neural authentication required</p>
        <button 
          onClick={handleLogin}
          className="bg-white/5 border border-white/10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] text-white font-mono uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center gap-3"
        >
          <Icon icon="logos:google-icon" className="text-xl" />
          Authenticate with Google
        </button>
      </div>
    );
  }

  if (isNewUser) {
    return <CharacterCreation onComplete={() => setIsNewUser(false)} />;
  }

  return <CyberDashboard />;
}
