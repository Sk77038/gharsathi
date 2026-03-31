import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Map, DollarSign, Settings, Bell, Search, Menu, Zap, Shield, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'motion/react';

const STATS = [
  { title: 'Total Users', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Active Workers', value: '842', change: '+5%', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { title: 'Today Bookings', value: '345', change: '+18%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
  { title: 'Revenue (Today)', value: 'â¹45,200', change: '+8%', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
];

const RECENT_BOOKINGS = [
  { id: '#BK-1024', customer: 'Rahul Verma', worker: 'Amit Singh', service: 'AC Repair', amount: 'â¹499', status: 'In Progress' },
  { id: '#BK-1025', customer: 'Priya Sharma', worker: 'Rajesh Kumar', service: 'Cleaning', amount: 'â¹899', status: 'Completed' },
  { id: '#BK-1026', customer: 'Vikram Singh', worker: 'Pending', service: 'Plumbing', amount: 'â¹299', status: 'Searching' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Ghar Sathi Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Customers' },
            { id: 'workers', icon: Briefcase, label: 'Workers & KYC' },
            { id: 'map', icon: Map, label: 'Live Map' },
            { id: 'b2b', icon: TrendingUp, label: 'B2B Jobs' },
            { id: 'finance', icon: DollarSign, label: 'Finance & Payouts' },
            { id: 'ai', icon: Zap, label: 'AI Insights' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors">
            <span className="text-sm">Back to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500 hover:text-slate-900">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold capitalize">{activeTab.replace('-', ' ')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-64"
              />
            </div>
            <button className="relative text-slate-500 hover:text-slate-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
              <img src="https://picsum.photos/seed/admin/32/32" alt="Admin" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* AI Insight Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">AI System Insight</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    Demand for AC Repair is expected to surge by 45% this weekend due to the heatwave. 
                    Consider sending a push notification to inactive workers in the Delhi NCR region to come online.
                  </p>
                  <button className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                    Take Action
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Live Bookings</h3>
                    <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-6 py-3 font-medium">ID</th>
                          <th className="px-6 py-3 font-medium">Customer</th>
                          <th className="px-6 py-3 font-medium">Worker</th>
                          <th className="px-6 py-3 font-medium">Service</th>
                          <th className="px-6 py-3 font-medium">Amount</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {RECENT_BOOKINGS.map((booking, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{booking.id}</td>
                            <td className="px-6 py-4">{booking.customer}</td>
                            <td className="px-6 py-4">{booking.worker}</td>
                            <td className="px-6 py-4">{booking.service}</td>
                            <td className="px-6 py-4 font-medium">{booking.amount}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                booking.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pending KYC */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Pending KYC</h3>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">12 New</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                            <img src={`https://picsum.photos/seed/kyc${i}/40/40`} alt="Worker" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900">Worker Name {i}</p>
                            <p className="text-xs text-slate-500">Plumber â€¢ Submitted 2h ago</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                          <Shield className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button className="mt-auto w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      Review All Applications
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <Settings className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 capitalize">{activeTab.replace('-', ' ')} Module</h2>
              <p className="max-w-md text-center">This module is part of the full production build. In this preview, only the Dashboard is fully interactive.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
