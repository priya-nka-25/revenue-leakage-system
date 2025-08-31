import React, { useMemo } from 'react';
import { BarChart3, PieChart, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ChartsSection = React.memo(() => {
  const { stats, leakages } = useData();

  const { severityData, sectorData, totalRevenueLoss, avgLeakageAmount } = useMemo(() => {
    if (!stats) {
      return { severityData: {}, sectorData: {}, totalRevenueLoss: 0, avgLeakageAmount: 0 };
    }

    const severityData = stats.severity_distribution || {};
    const sectorData = stats.sector_distribution || {};
    const totalRevenueLoss = leakages.reduce((sum, l) => sum + l.amount, 0);
    const avgLeakageAmount = leakages.length > 0 ? totalRevenueLoss / leakages.length : 0;

    return { severityData, sectorData, totalRevenueLoss, avgLeakageAmount };
  }, [stats, leakages]);

  if (!stats) {
    return (
      <div className="grid gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6 animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Severity chart
  const SeverityChart = () => {
    const maxValue = Math.max(...Object.values(severityData));
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    const textColors: Record<string, string> = {
      critical: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-green-400',
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>AI Severity Analysis</span>
        </h3>
        <div className="space-y-3">
          {Object.entries(severityData).map(([severity, count]) => (
            <div key={severity} className="flex items-center space-x-3">
              <div className={`w-20 text-sm capitalize font-medium ${textColors[severity]}`}>
                {severity}
              </div>
              <div className="flex-1 bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colors[severity]} transition-all duration-1000`}
                  style={{ width: maxValue > 0 ? `${(count / maxValue) * 100}%` : '0%' }}
                />
              </div>
              <div className="w-12 text-sm text-white font-bold">{count}</div>
              <div className="w-16 text-xs text-slate-400">
                {maxValue > 0 ? `${Math.round((count / maxValue) * 100)}%` : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Sector chart
  const SectorChart = () => {
    const total = Object.values(sectorData).reduce((sum, val) => sum + val, 0);
    const colors: Record<string, string> = {
      telecom: 'bg-blue-500',
      healthcare: 'bg-emerald-500',
      banking: 'bg-purple-500',
    };
    const textColors: Record<string, string> = {
      telecom: 'text-blue-400',
      healthcare: 'text-emerald-400',
      banking: 'text-purple-400',
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Sector Impact Analysis</span>
        </h3>
        <div className="space-y-3">
          {Object.entries(sectorData).map(([sector, count]) => (
            <div key={sector} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${colors[sector]}`} />
                <span className={`capitalize font-medium ${textColors[sector]}`}>
                  {sector}
                </span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{count}</div>
                <div className="text-xs text-slate-400">
                  {total > 0 ? `${Math.round((count / total) * 100)}%` : '0%'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <span>Analytics Dashboard</span>
        </h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-red-400" />
            <span className="text-slate-400">Total Loss:</span>
            <span className="text-white font-bold">${Math.round(totalRevenueLoss / 1000)}K</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Avg:</span>
            <span className="text-white font-bold">${Math.round(avgLeakageAmount)}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <SeverityChart />
        <SectorChart />
      </div>
    </div>
  );
});

ChartsSection.displayName = 'ChartsSection';

