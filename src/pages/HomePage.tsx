import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Announcement, UserProfile } from '../types';
import { useAuthState } from '../hooks/useAuthState';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Clock, 
  Filter, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Share2,
  Bookmark,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const { profile } = useAuthState();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Academics', 'Placements', 'Events', 'Sports', 'Emergency'];

  useEffect(() => {
    let q = query(
      collection(db, 'announcements'), 
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    if (activeCategory !== 'All') {
      q = query(
        collection(db, 'announcements'), 
        where('status', '==', 'published'),
        where('category', '==', activeCategory),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Announcement));
      setAnnouncements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const stats = [
    { label: 'Active Notices', value: announcements.length, trend: '+12%', icon: Megaphone, color: '#00FF00' },
    { label: 'Pending Approvals', value: '4', trend: '-2', icon: Clock, color: '#F27D26' },
    { label: 'System Health', value: '98%', trend: 'Optimum', icon: TrendingUp, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
              Welcome back, <span className="text-sky-400">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Campus Signal Core • Operational</p>
          </div>
          <div className="flex items-center gap-2 glass p-1 rounded-xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'glass-active text-sky-400' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-3xl relative overflow-hidden group hover:bg-white/[0.07] transition-colors"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} className="text-sky-400" />
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-white leading-none">{stat.value}</h3>
                <span className="text-[10px] font-bold py-1 px-2 rounded glass text-sky-400 uppercase tracking-tighter">
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Feed Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_12px_#38bdf8]" />
              Recent Announcements
            </h2>
            <button className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 glass rounded-3xl animate-pulse" />
                ))
              ) : announcements.length > 0 ? (
                announcements.map((ann, idx) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 glass rounded-3xl hover:bg-white/[0.07] transition-all group relative overflow-hidden border-l-4 border-l-transparent hover:border-l-sky-500"
                  >
                    {ann.priority === 'URGENT' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          ann.category === 'Emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-sky-400'
                        }`}>
                          {ann.category}
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold">/ {format(ann.createdAt?.toDate() || new Date(), 'HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-500 hover:text-sky-400 transition-colors"><Bookmark className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-500 hover:text-sky-400 transition-colors"><Share2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors leading-tight">{ann.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed font-medium">{ann.content}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                          {ann.authorName?.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-300 font-bold tracking-tight">{ann.authorName}</span>
                      </div>
                      <div className="text-[9px] font-black text-sky-400/60 uppercase tracking-[0.2em]">
                        {ann.department} sector
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center glass rounded-3xl border-dashed">
                  <Megaphone className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Signal Detected</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar widgets */}
        <aside className="space-y-6">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center justify-between">
              Activity Metrics
              <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Network Engagement</span>
                <span className="text-xs font-mono text-white text-right">4.2k</span>
              </div>
              <div className="w-full glass h-1.5 rounded-full overflow-hidden p-0">
                <div className="bg-sky-500 h-full w-[75%] rounded-full shadow-[0_0_12px_#38bdf8]" />
              </div>
              <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                <span>Monthly Target</span>
                <span>75% Optimal</span>
              </div>
            </div>
          </div>

          <div className="glass-alert rounded-3xl overflow-hidden">
            <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Priority Alerts</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 glass rounded-2xl">
                <p className="text-xs text-slate-200 mb-2 leading-relaxed font-medium">Campus Transport Route B delayed by 20 mins due to maintenance.</p>
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">12:30 PM • TRANSPORT</span>
              </div>
            </div>
          </div>

          <div className="p-6 glass rounded-3xl relative overflow-hidden group cursor-pointer border-sky-500/20 hover:bg-white/[0.07] transition-all">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
            <h3 className="text-lg font-bold text-white mb-2 relative">Open Broadcast</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 relative font-medium">Verified administrators and faculty can initiate broadcasts to targeted sectors.</p>
            <button className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-2 transition-transform relative">
              Start Transmission <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
