import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, User, Briefcase, MapPin, Search, Star, Clock, Home, Calendar, MessageSquare, Menu, Bell, ChevronLeft, ShieldCheck, Zap, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Mock Data ---
const MOCK_SERVICES = [
  { id: '1', name: 'AC Repair', icon: Zap, color: 'bg-blue-100 text-blue-600' },
  { id: '2', name: 'Cleaning', icon: Home, color: 'bg-emerald-100 text-emerald-600' },
  { id: '3', name: 'Plumbing', icon: Zap, color: 'bg-orange-100 text-orange-600' },
  { id: '4', name: 'Electrician', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
];

const MOCK_WORKERS = [
  { id: 'w1', name: 'Rajesh Kumar', rating: 4.8, jobs: 124, distance: '1.2 km', service: 'AC Repair', price: 'â¹499' },
  { id: 'w2', name: 'Amit Singh', rating: 4.9, jobs: 89, distance: '2.5 km', service: 'Plumbing', price: 'â¹299' },
  { id: 'w3', name: 'Suresh Sharma', rating: 4.6, jobs: 210, distance: '0.8 km', service: 'Electrician', price: 'â¹199' },
];

const MOCK_JOBS = [
  { id: 'j1', title: 'AC Service Required', location: 'Sector 14, Gurgaon', time: 'Today, 2:00 PM', price: 'â¹499', status: 'pending' },
  { id: 'j2', title: 'Fix leaking pipe', location: 'DLF Phase 3', time: 'Tomorrow, 10:00 AM', price: 'â¹299', status: 'pending' },
];

export default function AppSimulator() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<'customer' | 'worker' | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [authError, setAuthError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        setAuthError(error.message === 'Failed to fetch' ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' : error.message);
        setLoading(false);
        return;
      }
      setSession(session);
      if (session) {
        checkUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to get session:", err);
      setAuthError(err.message === 'Failed to fetch' ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' : 'Failed to load session.');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.role) {
        setRole(data.role);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message === 'Failed to fetch' 
        ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
        : 'Failed to load profile. Please try again.';
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setAuthError(null);
    
    // If no Supabase keys, simulate login
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      setStep('otp');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
      if (error) throw error;
      setStep('otp');
    } catch (error: any) {
      const msg = error.message === 'Failed to fetch' 
        ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
        : error.message || 'Failed to send OTP. Please check the number and try again.';
      setAuthError(msg);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setAuthError(null);

    // Simulate login if no keys
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      setSession({ user: { id: 'mock-user' } });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'sms' });
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        await checkUserRole(data.session.user.id);
      }
    } catch (error: any) {
      const msg = error.message === 'Failed to fetch' 
        ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
        : error.message || 'Invalid OTP. Please check and try again.';
      setAuthError(msg);
    }
  };

  const handleRoleSelect = async (selectedRole: 'customer' | 'worker') => {
    setRoleError(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && session?.user?.id) {
      try {
        const { error } = await supabase.from('profiles').upsert({ id: session.user.id, role: selectedRole });
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error("Database table 'profiles' is missing. Please run the SQL commands from README.md in your Supabase SQL Editor.");
          }
          throw error;
        }
        setRole(selectedRole);
      } catch (err: any) {
        const msg = err.message === 'Failed to fetch' 
          ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
          : err.message || 'Failed to save your role. Please try again.';
        setRoleError(msg);
      }
    } else {
      setRole(selectedRole);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative">
      {/* Mobile Device Container */}
      <div className="w-full max-w-[400px] h-[800px] max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative flex flex-col">
        {/* Status Bar */}
        <div className="h-7 bg-transparent absolute top-0 w-full z-50 flex justify-between items-center px-6 text-xs font-medium">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-3 bg-current rounded-sm"></div>
            <div className="w-3 h-3 bg-current rounded-full"></div>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pt-8 pb-20 relative">
          <AnimatePresence mode="wait">
            {!session ? (
              <AuthScreen 
                key="auth" 
                step={step} 
                phone={phone} 
                setPhone={setPhone} 
                otp={otp} 
                setOtp={setOtp} 
                onSendOtp={handleSendOtp} 
                onVerifyOtp={handleVerifyOtp}
                error={authError}
              />
            ) : !role ? (
              <RoleSelection key="role" onSelect={handleRoleSelect} error={roleError} />
            ) : role === 'customer' ? (
              <CustomerApp key="customer" onLogout={() => { setSession(null); setRole(null); }} />
            ) : (
              <WorkerApp key="worker" onLogout={() => { setSession(null); setRole(null); }} />
            )}
          </AnimatePresence>
        </div>

        {/* Home Indicator */}
        <div className="h-1 w-1/3 bg-slate-300 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 z-50"></div>
      </div>
    </div>
  );
}

// --- Screens ---

function AuthScreen({ step, phone, setPhone, otp, setOtp, onSendOtp, onVerifyOtp, error }: any) {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      if (!url || url === 'https://placeholder.supabase.co') {
        setDbStatus('disconnected');
        return;
      }
      try {
        // Simple ping to check if Supabase is reachable
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
          console.error("Supabase connection error:", error);
          setDbStatus('disconnected');
        } else {
          setDbStatus('connected');
        }
      } catch (err) {
        setDbStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="p-6 h-full flex flex-col justify-center"
    >
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-8 shadow-lg shadow-blue-600/30">
        G
      </div>
      <h1 className="text-2xl font-bold mb-2">Welcome to Ghar Sathi</h1>
      <p className="text-slate-500 mb-8">Your trusted hyperlocal service partner.</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={onSendOtp} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Phone Number</label>
            <div className="flex gap-2">
              <div className="bg-slate-100 px-3 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium flex items-center">
                +91
              </div>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="flex-1 bg-white px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                maxLength={10}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Enter OTP</label>
            <input 
              type="text" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center tracking-widest text-lg font-bold"
              required
              maxLength={6}
            />
            <p className="text-xs text-slate-500 mt-2 text-center">Sent to +91 {phone}</p>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Verify & Login
          </button>
        </form>
      )}

      {dbStatus === 'disconnected' ? (
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <strong>Demo Mode (Not Connected)</strong>
          </div>
          Supabase keys not found or invalid. Enter any number/OTP to continue in demo mode.
        </div>
      ) : dbStatus === 'connected' ? (
        <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <strong>Database Connected!</strong>
          </div>
          Supabase is successfully linked. OTP will be sent to your phone.
        </div>
      ) : (
        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs text-center">
          Checking database connection...
        </div>
      )}
    </motion.div>
  );
}

function RoleSelection({ onSelect, error }: { onSelect: (role: 'customer' | 'worker') => void; error?: string | null; key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="p-6 h-full flex flex-col justify-center"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Role</h2>
      <p className="text-slate-500 mb-8 text-center">How would you like to use Ghar Sathi?</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <button 
          onClick={() => onSelect('customer')}
          className="w-full bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 transition-colors flex flex-col items-center gap-4 group shadow-sm"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <User className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-slate-900">Customer</h3>
            <p className="text-sm text-slate-500">Book services for your home</p>
          </div>
        </button>

        <button 
          onClick={() => onSelect('worker')}
          className="w-full bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-600 transition-colors flex flex-col items-center gap-4 group shadow-sm"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-slate-900">Worker / Partner</h3>
            <p className="text-sm text-slate-500">Find jobs and earn money</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function CustomerApp({ onLogout }: { onLogout: () => void; key?: string }) {
  const [activeTab, setActiveTab] = useState('home');
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobDetails, setJobDetails] = useState({ title: '', budget: '' });
  const [jobStatus, setJobStatus] = useState<{type: 'error'|'success', msg: string} | null>(null);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobStatus(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        
        const { error } = await supabase.from('bookings').insert({
          customer_id: session.user.id,
          service_type: jobDetails.title,
          amount: parseFloat(jobDetails.budget),
          status: 'pending',
          address: 'Sector 14, Gurgaon', // Mock address
          scheduled_time: new Date().toISOString()
        });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error("Database table 'bookings' is missing. Please run the SQL in README.md.");
          }
          throw error;
        }
        
        setJobStatus({ type: 'success', msg: 'Job posted successfully! Workers notified.' });
        setTimeout(() => {
          setShowJobForm(false);
          setJobStatus(null);
        }, 3000);
        setJobDetails({ title: '', budget: '' });
      } catch (err: any) {
        const msg = err.message === 'Failed to fetch' 
          ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
          : err.message || 'Failed to post job.';
        setJobStatus({ type: 'error', msg });
      }
    } else {
      // Demo Mode Fallback
      setJobStatus({ type: 'success', msg: 'Job posted successfully! (Demo Mode)' });
      setTimeout(() => {
        setShowJobForm(false);
        setJobStatus(null);
      }, 2000);
      setJobDetails({ title: '', budget: '' });
    }
  };

  const handleBookWorker = async (worker: any) => {
    setJobStatus(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        
        const { error } = await supabase.from('bookings').insert({
          customer_id: session.user.id,
          service_type: `${worker.service} (Requested: ${worker.name})`,
          amount: parseFloat(worker.price.replace(/[^0-9.-]+/g,"")),
          status: 'pending',
          address: 'Sector 14, Gurgaon',
          scheduled_time: new Date().toISOString()
        });
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error("Database table 'bookings' is missing. Please run the SQL in README.md.");
          }
          throw error;
        }
        
        setJobStatus({ type: 'success', msg: `Successfully booked ${worker.name}!` });
        setTimeout(() => setJobStatus(null), 3000);
      } catch (err: any) {
        const msg = err.message === 'Failed to fetch' 
          ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
          : err.message || 'Failed to book worker.';
        setJobStatus({ type: 'error', msg });
      }
    } else {
      setJobStatus({ type: 'success', msg: `Successfully booked ${worker.name}! (Demo Mode)` });
      setTimeout(() => setJobStatus(null), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pb-8 rounded-b-3xl shadow-md relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">Current Location</p>
            <div className="flex items-center gap-1 font-bold text-lg">
              <MapPin className="w-4 h-4" />
              <span>Sector 14, Gurgaon</span>
            </div>
          </div>
          <button onClick={onLogout} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for 'AC Repair'" 
            className="w-full bg-white text-slate-900 pl-12 pr-4 py-3.5 rounded-2xl font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 -mt-4 pt-8">
        {activeTab === 'home' ? (
          <>
            {/* AI Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Smart Match</h3>
                <p className="text-xs text-indigo-100">Get 20% off on your first AC service booking today!</p>
              </div>
            </div>

            {/* Services Grid */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 text-lg">Categories</h3>
              <div className="grid grid-cols-4 gap-4">
                {MOCK_SERVICES.map(service => (
                  <button 
                    key={service.id} 
                    onClick={() => {
                      setJobDetails({ title: service.name, budget: '' });
                      setShowJobForm(true);
                    }}
                    className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${service.color}`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 text-center leading-tight">{service.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Job Post */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              {!showJobForm ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">Need something else?</h3>
                    <p className="text-xs text-slate-500">Post a custom job and get bids</p>
                  </div>
                  <button 
                    onClick={() => setShowJobForm(true)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Post Job
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostJob} className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-800">Post Custom Job</h3>
                    <button type="button" onClick={() => setShowJobForm(false)} className="text-slate-400 hover:text-slate-600">
                      <span className="text-xs font-bold">Cancel</span>
                    </button>
                  </div>
                  {jobStatus && (
                    <div className={`p-2 rounded-lg text-xs font-medium ${jobStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {jobStatus.msg}
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder="What do you need done?" 
                    required
                    value={jobDetails.title}
                    onChange={e => setJobDetails({...jobDetails, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input 
                    type="number" 
                    placeholder="Your Budget (â¹)" 
                    required
                    value={jobDetails.budget}
                    onChange={e => setJobDetails({...jobDetails, budget: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
                    Submit Job
                  </button>
                </form>
              )}
            </div>

            {/* Nearby Workers */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-slate-800 text-lg">Top Rated Nearby</h3>
                <span className="text-blue-600 text-xs font-bold">See All</span>
              </div>
              
              {!showJobForm && jobStatus && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${jobStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {jobStatus.msg}
                </div>
              )}

              <div className="space-y-3">
                {MOCK_WORKERS.map(worker => (
                  <div key={worker.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0">
                      <img src={`https://picsum.photos/seed/${worker.id}/64/64`} alt={worker.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{worker.name}</h4>
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {worker.rating}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{worker.service} â€¢ {worker.distance}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-600">{worker.price}</span>
                        <button 
                          onClick={() => handleBookWorker(worker)}
                          className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p className="font-medium capitalize">{activeTab} coming soon</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-4 pb-8 flex justify-between items-center z-20">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'bookings', icon: Calendar, label: 'Bookings' },
          { id: 'chat', icon: MessageSquare, label: 'Chat' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function WorkerApp({ onLogout }: { onLogout: () => void; key?: string }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [isOnline, setIsOnline] = useState(true);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{type: 'error'|'success', msg: string} | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
            
          if (error) {
             if (error.code === '42P01' || error.message?.includes('does not exist')) {
                 throw new Error("Database table 'bookings' is missing. Please run the SQL in README.md.");
             }
             throw error;
          }
          setAvailableJobs(data || []);
        } catch (err: any) {
          const msg = err.message === 'Failed to fetch' 
            ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
            : err.message || 'Failed to load jobs.';
          setError(msg);
        } finally {
          setLoading(false);
        }
      } else {
        // Mock data
        setAvailableJobs(MOCK_JOBS);
        setLoading(false);
      }
    };
    
    if (isOnline) {
      fetchJobs();
    } else {
      setAvailableJobs([]);
    }
  }, [isOnline]);

  const handleAcceptJob = async (jobId: string) => {
    setActionStatus(null);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'accepted', worker_id: session.user.id })
          .eq('id', jobId);
          
        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            throw new Error("Database table 'bookings' is missing.");
          }
          throw error;
        }
        
        setAvailableJobs(prev => prev.filter(job => job.id !== jobId));
        setActionStatus({ type: 'success', msg: 'Job accepted successfully!' });
        setTimeout(() => setActionStatus(null), 3000);
      } catch (err: any) {
        const msg = err.message === 'Failed to fetch' 
          ? 'Failed to connect to Supabase. Please check your Supabase URL and Anon Key in the .env file.' 
          : err.message || 'Failed to accept job.';
        setActionStatus({ type: 'error', msg });
      }
    } else {
      setAvailableJobs(prev => prev.filter(job => job.id !== jobId));
      setActionStatus({ type: 'success', msg: 'Job accepted! (Demo Mode)' });
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white p-6 pb-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
             <img src="https://picsum.photos/seed/worker1/40/40" alt="Profile" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Hi, Partner</h2>
            <p className="text-xs text-slate-500">Service Professional</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-100"></span>
          </button>
          <button onClick={onLogout} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {activeTab === 'jobs' ? (
          <>
            {/* Online Toggle */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <div>
                  <h3 className="font-bold text-slate-900">{isOnline ? "You're Online" : "You're Offline"}</h3>
                  <p className="text-xs text-slate-500">{isOnline ? "Waiting for new jobs..." : "Go online to receive jobs"}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Earnings Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/20">
                <p className="text-blue-200 text-xs font-medium mb-1">Today's Earnings</p>
                <h3 className="text-2xl font-bold">â¹1,250</h3>
                <p className="text-xs text-blue-200 mt-2">3 jobs completed</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-xs font-medium mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <h3 className="text-2xl font-bold text-slate-900">4.8</h3>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-xs text-green-600 font-medium mt-2">+0.2 this week</p>
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">AI Demand Alert</h4>
                <p className="text-xs text-amber-700 mt-1">High demand for AC Repair in DLF Phase 3 right now. Consider moving towards that area for more jobs.</p>
              </div>
            </div>

            {/* New Job Requests */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 text-lg">New Requests</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              {actionStatus && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${actionStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  {actionStatus.msg}
                </div>
              )}

              {!isOnline ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-500 text-sm">Go online to see available jobs in your area.</p>
                </div>
              ) : loading ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-500 text-sm animate-pulse">Searching for nearby jobs...</p>
                </div>
              ) : availableJobs.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
                  <p className="text-slate-500 text-sm">No new requests right now. We'll notify you when a job matches your skills.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableJobs.map(job => (
                    <div key={job.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900">{job.title || job.service_type}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" /> {job.location || job.address || 'Location not specified'}
                          </p>
                        </div>
                        <span className="font-bold text-emerald-600">â¹{job.price || job.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {job.time || new Date(job.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setAvailableJobs(prev => prev.filter(j => j.id !== job.id))}
                          className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => handleAcceptJob(job.id)}
                          className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                        >
                          Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 pt-20">
            <p className="font-medium capitalize">{activeTab} coming soon</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-4 pb-8 flex justify-between items-center z-20">
        {[
          { id: 'jobs', icon: Briefcase, label: 'Jobs' },
          { id: 'earnings', icon: Zap, label: 'Earnings' },
          { id: 'group', icon: Users, label: 'Group' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
