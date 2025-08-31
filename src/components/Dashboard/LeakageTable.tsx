import React, { useState, useMemo, useCallback } from 'react';
import { AlertTriangle, DollarSign, FileText, ExternalLink, Eye, Brain, TrendingDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TicketDetailsModal } from './TicketDetailsModal';

interface LeakageTableProps {
  onTicketGenerated: (ticketId: string) => void;
}

export const LeakageTable = React.memo(({ onTicketGenerated }: LeakageTableProps) => {
  const { leakages } = useData();
  const [sortBy, setSortBy] = useState<'severity' | 'amount' | 'date'>('severity');
  const [selectedLeakage, setSelectedLeakage] = React.useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = React.useState(false);

  const handleViewDetails = useCallback((leakageId: string) => {
    setSelectedLeakage(leakageId);
    setShowTicketModal(true);
  }, []);

  const handleTicketGenerated = useCallback((ticketId: string) => {
    setShowTicketModal(false);
    setSelectedLeakage(null);
    onTicketGenerated(ticketId);
  }, [onTicketGenerated]);

  const { sortedLeakages, totalLeakageAmount, criticalLeakages } = useMemo(() => {
    const sorted = [...leakages].sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                 (severityOrder[a.severity as keyof typeof severityOrder] || 0);
        case 'amount':
          return b.amount - a.amount;
        case 'date':
          return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();
        default:
          return 0;
      }
    });

    const total = leakages.reduce((sum, leakage) => sum + leakage.amount, 0);
    const critical = leakages.filter(l => l.severity === 'critical').length;

    return { sortedLeakages: sorted, totalLeakageAmount: total, criticalLeakages: critical };
  }, [leakages, sortBy]);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'detected': return 'text-amber-500 bg-amber-500/10';
      case 'ticket-generated': return 'text-blue-500 bg-blue-500/10';
      case 'resolved': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  }, []);

  const getSectorEmoji = useCallback((sector: string) => {
    switch (sector) {
      case 'telecom': return '📱';
      case 'healthcare': return '🏥';
      case 'banking': return '🏦';
      default: return '📊';
    }
  }, []);

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingDown className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">AI Revenue Leakage Detection Results</h2>
              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm font-medium">
                {leakages.length} Detected
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-slate-400 text-sm">Total Impact</p>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-white font-bold text-lg">
                    ${totalLeakageAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-slate-400 text-sm">Critical Issues</p>
                <span className="text-red-400 font-bold text-lg">{criticalLeakages}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  <button
                    onClick={() => setSortBy('severity')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Severity</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  <button
                    onClick={() => setSortBy('amount')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Amount</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  <span>Sector</span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  <span>Status</span>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  <button
                    onClick={() => setSortBy('date')}
                    className="flex items-center space-x-1 hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Detected</span>
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedLeakages.map((leakage) => (
                <tr key={leakage.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(leakage.severity)}`}>
                      {leakage.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span className="text-white font-medium">
                        ${leakage.amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSectorEmoji(leakage.sector)}</span>
                      <span className="text-white capitalize">{leakage.sector}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leakage.status)}`}>
                      {leakage.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {new Date(leakage.detected_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(leakage.id)}
                        className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {leakage.status === 'detected' && (
                        <button
                          onClick={() => handleViewDetails(leakage.id)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/20"
                          title="Generate Ticket"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeakage && (
        <TicketDetailsModal
          isOpen={showTicketModal}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedLeakage(null);
          }}
          leakageId={selectedLeakage}
          onTicketGenerated={handleTicketGenerated}
        />
      )}
    </>
  );
});

LeakageTable.displayName = 'LeakageTable';