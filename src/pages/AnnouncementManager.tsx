import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthState } from '../hooks/useAuthState';
import { Announcement, Category, Priority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Loader2,
  X,
  Megaphone,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

export default function AnnouncementManager() {
  const { user, profile } = useAuthState();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Academics' as Category,
    priority: 'LOW' as Priority,
    department: profile?.department || 'General',
  });

  const categories: Category[] = ['Academics', 'Placements', 'Sports', 'Clubs', 'Seminars', 'Events', 'Transport', 'Emergency'];
  const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    if (!user) return;

    let q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));

    // Students can see all published, but manager view is for personal/admin management
    if (profile?.role !== 'ADMIN') {
      q = query(
        collection(db, 'announcements'), 
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Announcement));
      setAnnouncements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        ...formData,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || 'Anonymous',
        status: profile?.role === 'ADMIN' ? 'published' : 'pending',
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), payload);
      } else {
        await addDoc(collection(db, 'announcements'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  const handleStatusChange = async (id: string, status: 'published' | 'pending') => {
    await updateDoc(doc(db, 'announcements', id), { 
      status, 
      updatedAt: serverTimestamp() 
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'Academics',
      priority: 'LOW',
      department: profile?.department || 'General',
    });
    setEditingId(null);
  };

  const openEdit = (ann: Announcement) => {
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      priority: ann.priority,
      department: ann.department,
    });
    setEditingId(ann.id);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Signal Control Center</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            {profile?.role === 'ADMIN' 
              ? 'Authorized: Full Spectrum Management' 
              : 'Sector Specific: Broadcast Transmission'}
          </p>
        </div>
        {(profile?.role === 'ADMIN' || profile?.role === 'FACULTY' || profile?.role === 'CLUB_HEAD') && (
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="flex items-center gap-2 bg-sky-500 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sky-400 active:scale-95 transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Transmission</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-4" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Syncing with Mainframe...</p>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Transmission</th>
                  <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Sector</th>
                  <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Timestamp</th>
                  <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-bold text-white truncate group-hover:text-sky-400 transition-colors uppercase tracking-tight text-sm">{ann.title}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{ann.authorName} • {ann.department} sector</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="glass px-2 py-1 rounded text-[9px] font-black text-slate-400 uppercase tracking-widest">{ann.category}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          ann.status === 'published' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        }`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                          ann.status === 'published' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {ann.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] text-slate-500 font-bold">
                        {ann.createdAt?.toDate ? format(ann.createdAt.toDate(), 'MMM dd, HH:mm') : 'Syncing...'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {profile?.role === 'ADMIN' && ann.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(ann.id, 'published')}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                            title="Approve Transmission"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => openEdit(ann)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(ann.id)}
                          className="p-2 text-red-400/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">
                      No active signals detected in sector
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-heavy rounded-[32px] shadow-2xl overflow-hidden p-8 border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-sky-500/20">
                    <Megaphone className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold uppercase tracking-tight">{editingId ? 'Edit Emission' : 'New Broadcast'}</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Status: Authorized Link established</p>
                  </div>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 glass rounded-full text-slate-400 hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Core Subject</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full glass bg-white/[0.03] rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-sky-500/50 outline-none transition-all placeholder:text-slate-700 font-bold"
                      placeholder="e.g., QUANTUM SEMINAR 2026"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Sector Path</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                        className="w-full glass bg-white/[0.03] rounded-xl px-5 py-4 focus:bg-white/[0.08] focus:border-sky-500/50 outline-none transition-all appearance-none font-bold uppercase text-[11px] tracking-widest cursor-pointer"
                      >
                        {categories.map(cat => <option key={cat} value={cat} className="bg-slate-900 border-none">{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Priority Weight</label>
                    <div className="relative">
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                        className="w-full glass bg-white/[0.03] rounded-xl px-5 py-4 focus:bg-white/[0.08] focus:border-sky-500/50 outline-none transition-all appearance-none font-bold uppercase text-[11px] tracking-widest cursor-pointer"
                      >
                        {priorities.map(p => <option key={p} value={p} className="bg-slate-900 text-slate-50 border-none">{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Signal Payload (Data Content)</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full glass bg-white/[0.03] rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-sky-500/50 outline-none transition-all placeholder:text-slate-700 resize-none font-medium leading-relaxed"
                      placeholder="Input the full transmission payload here..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-3 rounded-xl font-black text-slate-500 hover:text-white transition-all text-[10px] uppercase tracking-[0.3em]"
                  >
                    Abort Sequence
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-sky-500 text-slate-950 rounded-2xl font-black hover:bg-sky-400 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-500/30"
                  >
                    {editingId ? 'Execute Update' : 'Live Broadcast'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
