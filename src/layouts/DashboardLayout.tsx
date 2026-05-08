import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuthState';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardLayout() {
  const { user, profile } = useAuthState();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    ...(profile?.role === 'ADMIN' ? [{ name: 'User Management', path: '/users', icon: Users }] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-brand-bg text-slate-50 font-sans selection:bg-sky-500 selection:text-slate-950 p-4 gap-4">
      <div className="mesh-bg" />
      
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col glass rounded-3xl transition-all duration-300 overflow-hidden shrink-0",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 h-20">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center shadow-lg shadow-sky-500/20">
                  <Megaphone className="w-5 h-5 text-slate-950" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight">Campus<span className="text-sky-400">Connect</span></span>
              </motion.div>
            ) : (
              <motion.div 
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20"
              >
                <Megaphone className="w-5 h-5 text-slate-950" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all group",
                isActive 
                  ? "glass-active text-sky-400" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-white text-slate-950 text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={cn(
            "flex items-center gap-3 p-3 glass rounded-2xl mb-4 overflow-hidden",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-white/20 text-[10px] shrink-0 font-bold">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold truncate text-sm">{profile?.displayName || 'User'}</div>
                <div className="text-[9px] text-sky-400 uppercase tracking-widest font-bold truncate">{profile?.role || 'Guest'}</div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-4 w-full p-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium underline decoration-red-500/20 underline-offset-4">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-4">
        {/* Topbar */}
        <header className="h-16 glass rounded-2xl flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <button 
              className="hidden md:block p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden lg:flex items-center gap-3 glass rounded-xl px-4 py-2 w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search announcements..." 
                className="bg-transparent border-none focus:ring-0 outline-none text-sm w-full placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-sky-400 hover:bg-sky-400/5 rounded-full glass transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-bg shadow-sm" />
            </button>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400 font-medium font-mono uppercase tracking-widest">Academic Year 24-25</span>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto rounded-3xl glass p-6 md:p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-4/5 h-full bg-[#151619] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#00FF00] rounded flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-[#050505]" />
                  </div>
                  <span className="font-display font-bold text-lg">Campus<span className="text-[#00FF00]">Connect</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-[#8E9299]" />
                </button>
              </div>

              <nav className="flex-1 space-y-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-4 p-4 rounded-xl",
                      isActive ? "bg-[#00FF00]/10 text-[#00FF00]" : "text-[#8E9299]"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-lg font-medium">{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 text-red-500 border-t border-white/5"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg font-medium">Logout</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
