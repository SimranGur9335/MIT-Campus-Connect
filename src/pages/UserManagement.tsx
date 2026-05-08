import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { motion } from 'framer-motion';
import { Shield, Mail, Building, Clock, Loader2, Search, Edit3 } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as UserProfile));
      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: UserRole) => {
    switch(role) {
      case 'ADMIN': return 'text-purple-400 glass border-purple-500/30';
      case 'FACULTY': return 'text-cyan-400 glass border-cyan-500/30';
      case 'CLUB_HEAD': return 'text-amber-400 glass border-amber-500/30';
      default: return 'text-sky-400 glass border-sky-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personnel Directory</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Access Tier: Alpha-9 Clearance</p>
        </div>
        <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by ID or Sector..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-700 font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 glass rounded-3xl">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-4" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Bio-database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
          {filteredUsers.map((user, idx) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 glass rounded-[28px] flex items-start gap-5 hover:bg-white/[0.06] transition-all group relative overflow-hidden"
            >
              <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-sky-500/10 group-hover:border-sky-500/30 transition-all shrink-0">
                <span className="text-xl font-black text-sky-400 uppercase">{user.displayName?.charAt(0) || '?'}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h3 className="font-bold text-white truncate text-lg tracking-tight uppercase">{user.displayName || 'Anonymous Entry'}</h3>
                  <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest leading-none ${getRoleColor(user.role)}`}>
                    {user.role}
                  </div>
                </div>
                
                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium italic">
                    <Mail className="w-3.5 h-3.5 text-slate-600" /> {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                    <Building className="w-3.5 h-3.5 text-slate-600" /> {user.department} Sector
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-2">
                    <Clock className="w-3.5 h-3.5" /> Enlisted: {user.createdAt?.toDate ? format(user.createdAt.toDate(), 'yyyy.MM.dd') : 'N/A'}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest mr-2 shrink-0">Override Access:</span>
                  {(['STUDENT', 'FACULTY', 'CLUB_HEAD', 'ADMIN'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(user.uid, r)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shrink-0 tracking-widest ${
                        user.role === r 
                          ? 'glass-active text-sky-400 border border-sky-500/30' 
                          : 'glass text-slate-500 hover:text-white border-transparent'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
