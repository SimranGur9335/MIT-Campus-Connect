import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, Mail, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create default profile
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.email === 'gursimransinghsaini81@gmail.com' ? 'ADMIN' : 'STUDENT', 
          department: 'General',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="mesh-bg" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md glass-heavy border-white/20 rounded-[40px] p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 glass rounded-[24px] flex items-center justify-center mb-6 border-sky-500/20 shadow-xl">
            <MessageSquare className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter text-center uppercase">
            Campus<span className="text-sky-400">Connect</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black mt-2 uppercase tracking-[0.3em] text-center">
            Signal Hub • Operational
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-white font-bold text-xl tracking-tight text-center">Secure Gateway Authorization</h2>
            <p className="text-slate-500 text-sm text-center leading-relaxed font-medium">
              Initialize connection using authorized university identifiers to access the central broadcast stream.
            </p>
          </div>

          {error && (
            <div className="p-4 glass-alert rounded-2xl text-red-500 text-[11px] font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-4 px-8 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-sky-500/30 uppercase text-xs tracking-[0.1em]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Initialize Identity Link</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-6 py-2">
            <div className="h-px glass flex-1 border-none" />
            <span className="text-slate-700 text-[9px] font-black uppercase tracking-[0.3em]">Encrypted</span>
            <div className="h-px glass flex-1 border-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-4 rounded-2xl border-white/5 flex flex-col gap-2 items-center text-center group hover:bg-white/[0.05] transition-colors">
              <ShieldCheck className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Protocol α-9</span>
            </div>
            <div className="glass p-4 rounded-2xl border-white/5 flex flex-col gap-2 items-center text-center group hover:bg-white/[0.05] transition-colors">
              <Mail className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Verified-Net</span>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/5">
          <p className="text-slate-600 text-[9px] text-center font-black uppercase tracking-[0.3em] leading-loose">
            Authorized Nodes Only • CampusConnect v1.0<br/>Maintained by Central IT
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
