import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Server, Cloud, PowerOff, Ghost, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useProvider } from '../context/ProviderContext';

export default function Settings() {
 const navigate = useNavigate();
 const { providerType, providerService, modelId, disconnect } = useProvider();

 const handleDisconnect = async () => {
 await disconnect();
 navigate('/');
 };

 return (
 <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 ">
 <Navbar />

 <main className="flex-1 p-6 lg:p-8 max-w-4xl w-full mx-auto animate-fade-in">
 <div className="flex items-center gap-4 mb-8">
 <button 
 onClick={() => navigate('/dashboard')}
 className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100  "
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>
 <p className="text-zinc-500 text-sm mt-1">Manage your AI provider connection</p>
 </div>
 </div>
 <div className="bg-white dark:bg-[#141414] p-8 rounded-2xl">
 <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-6">
 AI Provider Connection
 </h2>

 {providerType ? (
 <div className="space-y-6">
 <div className={`flex items-start gap-4 p-6 rounded-2xl  ${
 providerType === 'local' 
 ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 ' 
 : providerType === 'skip' 
 ? 'bg-zinc-100 dark:bg-zinc-900 ' 
 : 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 '
 }`}>
 <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
 providerType === 'local' 
 ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' 
 : providerType === 'skip' 
 ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' 
 : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
 }`}>
 {providerType === 'local' ? <Server className="w-5 h-5" /> : providerType === 'skip' ? <Ghost className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
 {providerType === 'skip' ? 'No AI Connection (Skip)' : providerService}
 </h3>
 <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-2xl text-[10px] font-semibold tracking-wider uppercase ${
 providerType === 'skip'
 ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 '
 : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 '
 }`}>
 <div className={`w-1.5 h-1.5 rounded-full ${providerType === 'skip' ? 'bg-zinc-500' : 'bg-emerald-500'}`} />
 {providerType === 'skip' ? 'Skipped' : 'Connected'}
 </div>
 </div>
 <p className="text-xs text-zinc-500 mb-2">
 Type: <span className="capitalize text-zinc-700 dark:text-zinc-300 font-medium">{providerType}</span>
 </p>
 {modelId && modelId !== 'default' && (
 <p className="text-xs text-zinc-500">
 Model: <span className="text-zinc-700 dark:text-zinc-300 font-mono bg-zinc-100 dark:bg-[#0a0a0a] px-2 py-0.5 rounded-xl ml-1">{modelId}</span>
 </p>
 )}
 </div>
 </div>
 <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
 <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
 <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
 Your AI provider is active and ready for analysis. You can disconnect at any time to switch providers.
 </p>
 </div>
 <div className="pt-4">
 <button 
 onClick={handleDisconnect}
 className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 text-sm font-medium "
 >
 <PowerOff className="w-4 h-4" />
 Disconnect Provider
 </button>
 <p className="text-xs text-center text-zinc-500 mt-3">
 Disconnecting will stop all AI analysis until a new provider is connected.
 </p>
 </div>
 </div>
 ) : (
 <div className="text-center py-12">
 <div className="inline-block p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
 <Ghost className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mx-auto" />
 </div>
 <p className="text-zinc-500 mb-6 text-sm">No AI provider currently connected.</p>
 <button 
 onClick={() => navigate('/')}
 className="px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-sm font-medium "
 >
 Connect Provider
 </button>
 </div>
 )}
 </div>
 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl">
 <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Local Model</h3>
 <p className="text-xs text-zinc-500 leading-relaxed">Run AI analysis privately on your machine using LM Studio. No data leaves your computer.</p>
 </div>
 <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl">
 <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Cloud Services</h3>
 <p className="text-xs text-zinc-500 leading-relaxed">Use OpenAI, Anthropic, or Groq APIs for faster analysis with advanced models.</p>
 </div>
 </div>

 </main>
 </div>
 );
}

