import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ icon: Icon, title, value, trend, trendLabel, className = '' }) {
  const trendColor =
    trend > 0
      ? 'text-emerald-400'
      : trend < 0
        ? 'text-red-400'
        : 'text-[#a0a0a0]';

  const TrendIcon =
    trend > 0
      ? TrendingUp
      : trend < 0
        ? TrendingDown
        : Minus;

  return (
    <div
      className={`bg-[#1a1a2e] rounded-2xl p-5 sm:p-6 border border-white/5 hover:border-[#e94560]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#e94560]/5 group ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#e94560]/10 flex items-center justify-center group-hover:bg-[#e94560]/20 transition-colors duration-300">
          {Icon && <Icon className="w-5 h-5 text-[#e94560]" />}
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <p className="text-[#a0a0a0] text-sm font-medium mb-1">{title}</p>
      <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>

      {trendLabel && (
        <p className="text-[#a0a0a0] text-xs mt-2">{trendLabel}</p>
      )}
    </div>
  );
}
