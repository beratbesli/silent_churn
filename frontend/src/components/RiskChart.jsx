import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RiskChart({ data }) {
 if (!data || data.length === 0) {
 return (
 <div className="h-56 flex items-center justify-center text-slate-600 text-sm">
 No chart data available
 </div>
 );
 }

 const CustomTooltip = ({ active, payload, label }) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-[#0f172a]/95 backdrop-blur-md p-3 rounded-2xl border-white/[0.06]">
 <p className="text-slate-300 text-xs mb-2 font-medium">{label}</p>
 {payload.map((entry, index) => (
 <div key={index} className="flex items-center gap-2 text-xs mb-1">
 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
 <span className="text-slate-500 capitalize">{entry.name}:</span>
 <span className="text-slate-200 font-medium">{entry.value}</span>
 </div>
 ))}
 </div>
 );
 }
 return null;
 };

 return (
 <div className="h-60 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
 <XAxis 
 dataKey="date" 
 stroke="#334155" 
 fontSize={11} 
 tickLine={false} 
 axisLine={false}
 dy={8}
 />
 <YAxis 
 stroke="#334155" 
 fontSize={11} 
 tickLine={false} 
 axisLine={false} 
 domain={[0, 100]}
 />
 <Tooltip content={<CustomTooltip />} />
 <Legend 
 wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#475569' }} 
 iconType="circle"
 iconSize={6}
 />
 
 <Line 
 type="monotone" 
 dataKey="overall" 
 name="Overall"
 stroke="#10b981" 
 strokeWidth={2.5}
 dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
 activeDot={{ r: 5, strokeWidth: 0, fill: '#34d399' }}
 />
 <Line 
 type="monotone" 
 dataKey="email" 
 name="Email"
 stroke="#6366f1" 
 strokeWidth={1.5}
 strokeDasharray="4 4"
 dot={false}
 />
 <Line 
 type="monotone" 
 dataKey="maps" 
 name="Maps"
 stroke="#f59e0b" 
 strokeWidth={1.5}
 strokeDasharray="4 4"
 dot={false}
 />
 <Line 
 type="monotone" 
 dataKey="food" 
 name="Food"
 stroke="#f43f5e" 
 strokeWidth={1.5}
 strokeDasharray="4 4"
 dot={false}
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 );
}
