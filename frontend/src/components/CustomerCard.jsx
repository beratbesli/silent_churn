import { useNavigate } from 'react-router-dom';
import { ChevronRight, Mail } from 'lucide-react';
import PropTypes from 'prop-types';
import RiskBadge from './RiskBadge';

export default function CustomerCard({ customer }) {
  const navigate = useNavigate();

  const getAccentColor = () => {
    switch (customer.risk_status?.toLowerCase()) {
      case 'healthy': return 'text-emerald-600 dark:text-emerald-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'at_risk':  return 'text-rose-600 dark:text-rose-400';
      default:        return 'text-zinc-500 dark:text-zinc-400';
    }
  };

  const getScoreBg = () => {
    switch (customer.risk_status?.toLowerCase()) {
      case 'healthy': return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
      case 'at_risk':  return 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300';
      default:        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400';
    }
  };

  const riskScoreDisplay = Math.round((customer.current_risk_score || 0) * 100);

  return (
    <div
      className="bg-white dark:bg-[#141414] rounded-2xl p-5 cursor-pointer card-interactive"
      onClick={() => navigate(`/customer/${customer.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {customer.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Mail className="w-3 h-3 text-zinc-400 flex-shrink-0" />
            <p className="text-xs text-zinc-400 truncate max-w-[160px]">{customer.email}</p>
          </div>
        </div>
        <RiskBadge status={customer.risk_status} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className={`text-2xl font-bold tracking-tight ${getAccentColor()}`}>
          {riskScoreDisplay}%
        </div>
        <div className={`text-[10px] px-2.5 py-1 rounded-full ${getScoreBg()} font-semibold uppercase tracking-wider`}>
          Risk Score
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
        {customer.risk_reason || 'No analysis available.'}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-xs font-medium text-zinc-400">View Details</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
      </div>
    </div>
  );
}

CustomerCard.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    risk_status: PropTypes.string,
    current_risk_score: PropTypes.number,
    risk_reason: PropTypes.string,
  }).isRequired,
};
