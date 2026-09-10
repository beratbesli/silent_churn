import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import PropTypes from 'prop-types';

function CustomTooltip({ active, payload }) {
 if (active && payload && payload.length) {
   const data = payload[0].payload;
   return (
     <div className="bg-zinc-900 text-zinc-100 p-3 rounded-2xl shadow-xl text-sm border border-white/10">
       <p className="font-semibold mb-1">{data.name}</p>
       <div className="flex justify-between gap-4 text-xs text-zinc-400">
         <span>Risk Level:</span>
         <span className="font-medium text-white">{data.risk}%</span>
       </div>
       <div className="flex justify-between gap-4 text-xs text-zinc-400 mt-1">
         <span>Customer Value:</span>
         <span className="font-medium text-white">${data.clv.toLocaleString()}</span>
       </div>
     </div>
   );
 }
 return null;
}

CustomTooltip.propTypes = {
 active: PropTypes.bool,
 payload: PropTypes.arrayOf(PropTypes.shape({
   payload: PropTypes.shape({
     name: PropTypes.string,
     risk: PropTypes.number,
     clv: PropTypes.number,
   }),
 })),
};

const getColor = (status) => {
 if (status === 'healthy') return '#10b981';
 if (status === 'warning') return '#f59e0b';
 return '#f43f5e';
};

export default function RiskDistributionChart({ customers }) {
  if (!customers || customers.length === 0) return null;

  const data = customers.map(c => {
    const mockCLV = ((c.id * 3731) % 14000) + 1000;
    const riskPercent = Math.round((1 - (c.current_risk_score || 0)) * 100);
    
    return {
      id: c.id,
      name: c.name,
      status: c.risk_status,
      risk: riskPercent,
      clv: mockCLV,
    };
  });

  return (
    <div className="bg-zinc-50 dark:bg-[#141414] rounded-2xl p-6 w-full h-[350px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">CLV vs Risk Matrix</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Identify high-value customers at risk</p>
        </div>
      </div>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} vertical={false} />
            <XAxis 
              type="number" 
              dataKey="risk" 
              name="Risk" 
              domain={[0, 100]} 
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Risk Probability (%)', position: 'insideBottom', offset: -15, fill: '#71717a', fontSize: 11 }}
            />
            <YAxis 
              type="number" 
              dataKey="clv" 
              name="CLV" 
              tickFormatter={(val) => `$${val / 1000}k`}
              tick={{ fontSize: 11, fill: '#71717a' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#71717a', opacity: 0.5 }} />
            <ReferenceLine x={50} stroke="#71717a" strokeOpacity={0.3} strokeDasharray="3 3" />
            <ReferenceLine y={7500} stroke="#71717a" strokeOpacity={0.3} strokeDasharray="3 3" />
            <Scatter name="Customers" data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.status)} opacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

RiskDistributionChart.propTypes = {
 customers: PropTypes.arrayOf(PropTypes.shape({
   id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
   name: PropTypes.string,
   risk_status: PropTypes.string,
   current_risk_score: PropTypes.number,
 })),
};
