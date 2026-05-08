import React, { useState } from 'react';
import { useAuthState } from '../hooks/useAuthState';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { User, Mail, Building, Save, Shield, LogOut, CheckCircle2, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile } = useAuthState();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const departments = ['General', 'Computer Science', 'Electronic Engineering', 'Business', 'Arts', 'Basic Sciences'];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        department,
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Terminal Configuration</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Localize profile signature and sector affinity</p>
      </div>

      <div className="glass p-8 rounded-[32px] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Shield size={200} className="text-sky-400" />
        </div>

        <form onSubmit={handleUpdate} className="space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Signature Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full glass bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/[0.07] focus:border-sky-500/50 outline-none transition-all font-bold placeholder:text-slate-700"
                  placeholder="Input Bio-identifier"
                />
              </div>
            </div>

            <div className="space-y-2 opacity-50">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Contact Node (Immutable)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full glass bg-white/[0.02] border-white/5 rounded-2xl pl-12 pr-4 py-4 cursor-not-allowed font-medium text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Assigned Sector</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full glass bg-white/[0.03] border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/[0.07] focus:border-sky-500/50 outline-none transition-all appearance-none font-bold uppercase text-[11px] tracking-widest cursor-pointer"
                >
                  {departments.map(d => <option key={d} value={d} className="bg-slate-900 border-none">{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              {success && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sync Complete
                </motion.span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-sky-500 text-slate-950 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Commit Changes</span>
            </button>
          </div>
        </form>
      </div>

      <div className="glass-alert p-8 rounded-[32px] border-red-500/10">
        <h2 className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Security Directives</h2>
        <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
          Access tokens are refreshed periodically via the main secure gateway. If you encounter authentication anomalies or sector link drops, initiate a manual termination protocol and re-establish your connection.
        </p>
        <button className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-2 transition-transform">
          <LogOut className="w-4 h-4" /> Termination Protocol
        </button>
      </div>
    </div>
  );
}
