import { useState, useEffect, useCallback } from 'react';
import { Users, AlertTriangle, AlertCircle, CheckCircle, RefreshCw, Database, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import CustomerCard from '../components/CustomerCard';
import RiskDistributionChart from '../components/RiskDistributionChart';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
 const [customers, setCustomers] = useState([]);
 const [stats, setStats] = useState({ total: 0, atRisk: 0, warning: 0, healthy: 0 });
 const [isLoading, setIsLoading] = useState(true);
 const [isFetching, setIsFetching] = useState(false);
 const [isGenerating, setIsGenerating] = useState(false);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortBy, setSortBy] = useState('risk');
 const { addToast } = useToast();

 const fetchCustomers = useCallback(async (firstLoad = false) => {
 if (firstLoad) setIsLoading(true);
 else setIsFetching(true);
 try {
 const [customersData, statsData] = await Promise.all([
 api.getCustomers(),
 api.getDashboardStats()
 ]);
 setCustomers(Array.isArray(customersData) ? customersData : []);
 setStats({
 total: statsData.total_customers ?? 0,
 atRisk: statsData.at_risk_customers ?? 0,
 warning: statsData.warning_customers ?? 0,
 healthy: statsData.healthy_customers ?? 0,
 });
 } catch (error) {
 addToast('Failed to load customer data. Is the backend running?', 'error');
 } finally {
 setIsLoading(false);
 setIsFetching(false);
 }
 }, [addToast]);

 useEffect(() => {
 fetchCustomers(true);
 }, [fetchCustomers]);

 const handleGenerateData = async () => {
 setIsGenerating(true);
 try {
 await api.generateData();
 await fetchCustomers(false);
 addToast('Sample data generated successfully.', 'success');
 } catch (error) {
 addToast('Failed to generate sample data. Check backend logs.', 'error');
 } finally {
 setIsGenerating(false);
 }
 };

 const handleRefreshAnalysis = async (mode = 'demo') => {
 setIsRefreshing(true);
 try {
 await api.refreshAnalysis(mode);
 await fetchCustomers(false);
 addToast('AI Analysis completed successfully.', 'success');
 } catch (error) {
 addToast('Analysis failed. Ensure an AI provider is connected.', 'error');
 } finally {
 setIsRefreshing(false);
 }
 };
 const filteredCustomers = customers.filter(c => 
 (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
 (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
 );

 const sortedCustomers = [...filteredCustomers].sort((a, b) => {
 if (sortBy === 'risk') {
 return (b.current_risk_score || 0) - (a.current_risk_score || 0);
 } else if (sortBy === 'name') {
 return (a.name || '').localeCompare(b.name || '');
 }
 return 0;
 });
 const groupedByStatus = {
 at_risk: sortedCustomers.filter(c => c.risk_status?.toLowerCase() === 'at_risk'),
 warning: sortedCustomers.filter(c => c.risk_status?.toLowerCase() === 'warning'),
 healthy: sortedCustomers.filter(c => c.risk_status?.toLowerCase() === 'healthy'),
 };

 return (
 <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 ">
 <Navbar />

 <main className="flex-1 flex">
 <aside className="hidden lg:flex flex-col w-64 p-6 gap-8">
 <div>
 <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Status</h3>
 <div className="space-y-1">
 <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950">
 <span className="text-sm font-medium text-rose-700 dark:text-rose-300">At Risk</span>
 <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900 px-2 py-0.5 rounded-full">{stats.atRisk}</span>
 </div>
 <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950">
 <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Warning</span>
 <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded-full">{stats.warning}</span>
 </div>
 <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950">
 <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Healthy</span>
 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">{stats.healthy}</span>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Sort By</h3>
 <div className="space-y-2">
 <button 
 onClick={() => setSortBy('risk')}
 className={`w-full text-left px-3 py-2 rounded-2xl text-sm  ${sortBy === 'risk' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 ' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
 >
 Risk Score
 </button>
 <button 
 onClick={() => setSortBy('name')}
 className={`w-full text-left px-3 py-2 rounded-2xl text-sm  ${sortBy === 'name' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 ' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
 >
 Name (A-Z)
 </button>
 </div>
 </div>
 </aside>
 <div className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
 <div className="mb-8">
 <div className="flex flex-col gap-4">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight ">Customers</h1>
 <p className="text-zinc-500 text-sm mt-1">Monitor and analyze churn risk.</p>
 </div>
 <div className="flex gap-3 w-full sm:w-auto">
 <button 
 onClick={handleGenerateData}
 disabled={isGenerating || isRefreshing}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-all disabled:opacity-50"
 >
 <Database className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
 <span className="text-sm font-medium">{isGenerating ? 'Generating...' : 'Sample Data'}</span>
 </button>
 <button 
 onClick={() => handleRefreshAnalysis('demo')}
 disabled={isRefreshing || isGenerating}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 rounded-2xl  disabled:opacity-50 font-medium"
 >
 <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
 <span className="text-sm">{isRefreshing ? 'Analyzing...' : 'Run Analysis (Demo)'}</span>
 </button>
 <button 
 onClick={() => handleRefreshAnalysis('all')}
 disabled={isRefreshing || isGenerating}
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl  disabled:opacity-50 font-medium"
 >
 <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
 <span className="text-sm">{isRefreshing ? 'Analyzing...' : 'Analyze All (15)'}</span>
 </button>
 </div>
 </div>
 <div className="relative max-w-md w-full">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
 <input 
 type="text"
 placeholder="Search customers..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full bg-white dark:bg-[#141414] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
 />
 </div>
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 <StatCard title="Total Customers" value={stats.total} icon={Users} colorClass="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" />
 <StatCard title="At Risk" value={stats.atRisk} icon={AlertTriangle} colorClass="bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400" />
 <StatCard title="Warning" value={stats.warning} icon={AlertCircle} colorClass="bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400" />
 <StatCard title="Healthy" value={stats.healthy} icon={CheckCircle} colorClass="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" />
 </div>
 {isLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
 {[1, 2, 3].map((col) => (
 <div key={col} className="space-y-4">
 <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl w-full"></div>
 <div className="space-y-3">
 {[1, 2, 3, 4].map((item) => (
 <div key={item} className="h-24 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl w-full"></div>
 ))}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="relative">
 {isFetching && (
 <div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a0a]/90 rounded-3xl z-10 flex items-center justify-center">
 <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
 </div>
 )}
 <div className="mb-8">
   <RiskDistributionChart customers={sortedCustomers} />
 </div>
 {sortedCustomers.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <div className="space-y-3">
 <div className="flex items-center justify-between mb-2 px-1">
 <h3 className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
 <AlertTriangle className="w-3.5 h-3.5" />
 At Risk
 </h3>
 <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900 px-2 py-0.5 rounded-full">{groupedByStatus.at_risk.length}</span>
 </div>
 {groupedByStatus.at_risk.length > 0 ? (
 groupedByStatus.at_risk.map((customer, index) => (
 <CustomerCard key={customer.id} customer={customer} index={index} />
 ))
 ) : (
 <div className="text-center py-8 text-zinc-400 text-sm">No at-risk customers</div>
 )}
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between mb-2 px-1">
 <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
 <AlertCircle className="w-3.5 h-3.5" />
 Warning
 </h3>
 <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded-full">{groupedByStatus.warning.length}</span>
 </div>
 {groupedByStatus.warning.length > 0 ? (
 groupedByStatus.warning.map((customer, index) => (
 <CustomerCard key={customer.id} customer={customer} index={index} />
 ))
 ) : (
 <div className="text-center py-8 text-zinc-400 text-sm">No warning customers</div>
 )}
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between mb-2 px-1">
 <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
 <CheckCircle className="w-3.5 h-3.5" />
 Healthy
 </h3>
 <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">{groupedByStatus.healthy.length}</span>
 </div>
 {groupedByStatus.healthy.length > 0 ? (
 groupedByStatus.healthy.map((customer, index) => (
 <CustomerCard key={customer.id} customer={customer} index={index} />
 ))
 ) : (
 <div className="text-center py-8 text-zinc-400 text-sm">No healthy customers</div>
 )}
 </div>
 </div>
 ) : (
 <div className="col-span-full py-16 text-center">
 <div className="inline-block p-6 rounded-3xl bg-white dark:bg-[#141414]">
 <Database className="w-12 h-12 text-slate-500 mx-auto mb-4" />
 <p className="text-slate-300 font-medium mb-2">No customers found</p>
 <p className="text-slate-500 text-sm">Click <strong>Sample Data</strong> to generate demo customers</p>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </main>
 </div>
 );
}

