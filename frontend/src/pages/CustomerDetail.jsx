import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Utensils, TrendingDown, TrendingUp, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import RiskBadge from '../components/RiskBadge';
import RiskChart from '../components/RiskChart';
import TimelineItem from '../components/TimelineItem';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function CustomerDetail() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { addToast } = useToast();
 
 const [customer, setCustomer] = useState(null);
 const [timeline, setTimeline] = useState([]);
 const [chartData, setChartData] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [draftEmail, setDraftEmail] = useState('');
 const [isDrafting, setIsDrafting] = useState(false);

 useEffect(() => {
 const fetchData = async () => {
 setIsLoading(true);
 try {
 const [customerData, timelineData] = await Promise.all([
 api.getCustomer(id),
 api.getCustomerTimeline(id)
 ]);

 setCustomer(customerData);
 const timelineArr = Array.isArray(timelineData) ? timelineData : [];
 const mappedChartData = timelineArr.map(pt => ({
 date: new Date(pt.calculated_at).toLocaleDateString(),
 overall: Math.round((pt.score || 0) * 100),
 email: pt.email_score != null ? Math.round(pt.email_score * 100) : null,
 maps: pt.maps_score != null ? Math.round(pt.maps_score * 100) : null,
 food: pt.food_score != null ? Math.round(pt.food_score * 100) : null,
 }));
 setChartData(mappedChartData);
 const emails = Array.isArray(customerData.emails) ? customerData.emails.map(e => ({
 id: `email-${e.id}`,
 source: 'email',
 direction: e.direction,
 rawDate: new Date(e.sent_at),
 date: new Date(e.sent_at).toLocaleString(),
 subject: e.subject,
 content: e.body,
 sentiment: e.sentiment_score != null ? Math.round(e.sentiment_score * 100) : null,
 analysisReason: e.analysis_reason
 })) : [];

 const mapsReviews = Array.isArray(customerData.maps_reviews) ? customerData.maps_reviews.map(m => ({
 id: `maps-${m.id}`,
 source: 'maps',
 rawDate: new Date(m.review_date),
 date: new Date(m.review_date).toLocaleString(),
 subject: `${m.rating} Stars`,
 content: m.text,
 sentiment: m.sentiment_score != null ? Math.round(m.sentiment_score * 100) : null,
 analysisReason: m.analysis_reason
 })) : [];

 const foodReviews = Array.isArray(customerData.food_reviews) ? customerData.food_reviews.map(f => ({
 id: `food-${f.id}`,
 source: 'food',
 rawDate: new Date(f.review_date),
 date: new Date(f.review_date).toLocaleString(),
 subject: `${f.rating} Stars (${f.platform_name})`,
 content: f.text,
 sentiment: f.sentiment_score != null ? Math.round(f.sentiment_score * 100) : null,
 analysisReason: f.analysis_reason
 })) : [];

 const combinedTimeline = [...emails, ...mapsReviews, ...foodReviews]
 .sort((a, b) => b.rawDate - a.rawDate);
 
 setTimeline(combinedTimeline);

 } catch (error) {
 } finally {
 setIsLoading(false);
 }
 };

 fetchData();
 }, [id]);

 if (isLoading) {
 return (
 <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] flex items-center justify-center">
 <div className="flex flex-col items-center gap-4">
 <div className="w-8 h-8 border-4 border-emerald-500 border-transparent rounded-full animate-spin"></div>
 <p className="text-slate-400">Loading customer details...</p>
 </div>
 </div>
 );
 }

 const handleGenerateDraft = async () => {
 setIsDrafting(true);
 setDraftEmail('');
 try {
 const res = await api.generateDraftReply(id);
 setDraftEmail(res.draft);
 } catch (e) {
 const errorMsg = e.response?.data?.detail || 'Failed to generate draft. Ensure AI provider is correctly configured.';
 addToast(errorMsg, 'error');
 } finally {
 setIsDrafting(false);
 }
 };

 if (!customer) return null;

 const riskScoreDisplay = Math.round((customer.current_risk_score || 0) * 100);
 const statusColors = {
 'healthy': 'from-emerald-500/20 to-emerald-500/5',
 'warning': 'from-amber-500/20 to-amber-500/5',
 'at_risk': 'from-rose-500/20 to-rose-500/5'
 };
 const textColors = {
 'healthy': 'text-emerald-400',
 'warning': 'text-amber-400',
 'at_risk': 'text-rose-400'
 };
 const borderColors = {
 'healthy': 'border-emerald-500/30',
 'warning': 'border-amber-500/30',
 'at_risk': 'border-rose-500/30'
 };
 const statusGradient = statusColors[customer.risk_status?.toLowerCase()] || 'from-slate-500/20 to-slate-500/5';
 const textColor = textColors[customer.risk_status?.toLowerCase()] || 'text-slate-400';
 const borderColor = borderColors[customer.risk_status?.toLowerCase()] || 'border-slate-500/30';
 const riskHistory = Array.isArray(customer.risk_history) ? customer.risk_history : [];
 const lastRiskEntry = riskHistory.length > 0 ? riskHistory[riskHistory.length - 1] : {};
 let trendDisplay = null;
 if (riskHistory.length >= 2) {
 const prev = riskHistory[riskHistory.length - 2].score ?? 0;
 const curr = riskHistory[riskHistory.length - 1].score ?? 0;
 const diff = Math.round((curr - prev) * 100);
 trendDisplay = { value: Math.abs(diff), improving: diff >= 0 };
 }

 const emailScore = lastRiskEntry.email_score != null ? Math.round(lastRiskEntry.email_score * 100) : '-';
 const mapsScore = lastRiskEntry.maps_score != null ? Math.round(lastRiskEntry.maps_score * 100) : '-';
 const foodScore = lastRiskEntry.food_score != null ? Math.round(lastRiskEntry.food_score * 100) : '-';

 return (
 <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
 <Navbar />

 <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
 <div className="flex items-center gap-4 mb-8">
 <button 
 onClick={() => navigate('/dashboard')}
 className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100  "
 >
 <ChevronLeft className="w-5 h-5" />
 </button>
 <div className="flex-1">
 <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">{customer.name}</h1>
 <div className="flex items-center gap-2 text-zinc-500 text-sm">
 <Mail className="w-4 h-4" />
 <p>{customer.email}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <RiskBadge status={customer.risk_status} />
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 <div className="lg:col-span-1 bg-white dark:bg-[#141414] p-8 rounded-2xl flex flex-col items-center justify-center text-center">
 
 <p className="text-zinc-500 font-medium mb-4 text-xs uppercase tracking-wider">Overall Risk Score</p>
 <div className={`text-6xl font-bold tracking-tight mb-6 ${textColor}`}>
 {riskScoreDisplay}%
 </div>
 
 {trendDisplay && (
 <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-2xl ${
 trendDisplay.improving ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 '
 }`}>
 {trendDisplay.improving ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
 <span>{trendDisplay.value}pt vs previous</span>
 </div>
 )}

 <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
 {customer.risk_reason || 'No specific reason provided.'}
 </p>
  {(customer.risk_status === 'at_risk' || customer.risk_status === 'warning') && (
  <div className="w-full mt-4 flex flex-col gap-3" key="recovery-email-action-box">
    <div key="recovery-btn-wrapper">
      <button
        type="button"
        onClick={handleGenerateDraft}
        disabled={isDrafting}
        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span className="flex items-center justify-center gap-2">
          {isDrafting ? (
            <span key="spinner-icon" className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span key="mail-icon" className="inline-flex items-center">
              <Mail className="w-4 h-4" />
            </span>
          )}
          <span>{isDrafting ? 'Drafting...' : 'Generate AI Recovery Email'}</span>
        </span>
      </button>
    </div>
    
    <div key="recovery-draft-wrapper">
      {draftEmail ? (
        <div key="draft-card" className="w-full mt-2 text-left bg-zinc-100 dark:bg-[#0f0f12] p-4 rounded-2xl animate-fade-in">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            <span>AI Drafted Reply</span>
          </p>
          <textarea 
            readOnly 
            className="w-full h-40 bg-transparent text-sm text-zinc-700 dark:text-zinc-300 resize-none outline-none" 
            value={draftEmail}
          />
          <button 
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(draftEmail);
              addToast('Copied to clipboard!', 'success');
            }}
            className="mt-2 w-full py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl"
          >
            <span>Copy to Clipboard</span>
          </button>
        </div>
      ) : null}
    </div>
  </div>
  )}
 </div>
 <div className="lg:col-span-2 flex flex-col gap-6">
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl">
 <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
 <div className="p-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950">
 <Mail className="w-4 h-4" />
 </div>
 <span className="text-xs font-semibold uppercase tracking-wider">Email</span>
 </div>
 <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{emailScore}{emailScore !== '-' && '%'}</div>
 </div>
 <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl">
 <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-3">
 <div className="p-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950">
 <MapPin className="w-4 h-4" />
 </div>
 <span className="text-xs font-semibold uppercase tracking-wider">Maps</span>
 </div>
 <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{mapsScore}{mapsScore !== '-' && '%'}</div>
 </div>
 <div className="bg-white dark:bg-[#141414] p-5 rounded-2xl">
 <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-3">
 <div className="p-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950">
 <Utensils className="w-4 h-4" />
 </div>
 <span className="text-xs font-semibold uppercase tracking-wider">Food</span>
 </div>
 <div className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{foodScore}{foodScore !== '-' && '%'}</div>
 </div>
 </div>
 <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl flex-1">
 <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-4">Risk Timeline</h3>
 <RiskChart data={chartData} />
 </div>
 </div>
 </div>
 <div className="bg-white dark:bg-[#141414] p-6 lg:p-8 rounded-2xl">
 <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-8">
 Communication History
 </h3>
 
 <div className="space-y-4">
 {timeline.length === 0 ? (
 <div className="text-zinc-500 text-center py-8 text-sm">No communication history.</div>
 ) : (
 timeline.map((item, index) => (
 <TimelineItem key={item.id} item={item} index={index} />
 ))
 )}
 </div>
 </div>

 </main>
 </div>
 );
}
