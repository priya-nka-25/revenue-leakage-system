import React, { useState, useEffect } from 'react';
import { X, FileText, DollarSign, AlertTriangle, Users, ArrowLeft, Loader2, Send, Brain } from 'lucide-react';
import { leakageAPI } from '../../services/api';
import { useData } from '../../context/DataContext';
import type { Leakage } from '../../services/api';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leakageId: string | null;
  onTicketGenerated: (ticketId: string) => void;
}

export function TicketDetailsModal({ isOpen, onClose, leakageId, onTicketGenerated }: TicketDetailsModalProps) {
  const [leakageDetails, setLeakageDetails] = useState<(Leakage & { assigned_department: string }) | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { generateTicket } = useData();

  useEffect(() => {
    if (isOpen && leakageId) {
      fetchLeakageDetails();
    }
  }, [isOpen, leakageId]);

  const handleViewDetails = () => {
    setShowConfirmation(true);
  };

  const fetchLeakageDetails = async () => {
    if (!leakageId) return;
    
    try {
      const details = await leakageAPI.getDetails(leakageId);
      setLeakageDetails(details);
    } catch (error) {
      console.error('Failed to fetch leakage details:', error);
    }
  };

  const handleGenerateTicket = async () => {
    if (!leakageId) return;
    
    setIsGenerating(true);
    try {
      const result = await generateTicket(leakageId);
      if (result.success && result.ticket_id) {
        onTicketGenerated(result.ticket_id);
      }
    } catch (error) {
      console.error('Failed to generate ticket:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToDetails = () => {
    setShowConfirmation(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500';
    }
  };

  const getSectorEmoji = (sector: string) => {
    switch (sector) {
      case 'telecom': return '📱';
      case 'healthcare': return '🏥';
      case 'banking': return '🏦';
      default: return '📊';
    }
  };

  if (!isOpen || !leakageDetails) return null;

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <Send className="w-6 h-6 text-emerald-500" />
              <h2 className="text-xl font-semibold text-white">Confirm Ticket Generation</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Ticket Summary */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-semibold text-white">AI-Generated Ticket Summary</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Ticket ID</label>
                    <p className="text-white font-mono">#{ticket.id || 'AUTO-GENERATED'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Assigned Department</label>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-white font-semibold">{leakageDetails.assigned_department}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Priority Level</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getSeverityColor(leakageDetails.severity)}`}>
                      {leakageDetails.severity}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Revenue Impact</label>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      <span className="text-white font-bold text-xl">
                        ${leakageDetails.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Sector</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSectorEmoji(leakageDetails.sector)}</span>
                      <span className="text-white capitalize">{leakageDetails.sector}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Detection Date</label>
                    <p className="text-white">
                      {new Date(leakageDetails.detected_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Issue Detected</span>
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">{leakageDetails.cause}</p>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span>AI Root Cause Analysis</span>
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">{leakageDetails.root_cause}</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex space-x-3 p-6 border-t border-slate-700">
            <button
              onClick={handleBackToDetails}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Details</span>
              </div>
            </button>
            
            <button
              onClick={handleGenerateTicket}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Ticket...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Generate & Send Ticket</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Revenue Leakage Analysis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Leakage Overview */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>{getSectorEmoji(leakageDetails.sector)}</span>
              <span>Critical Revenue Leakage Detected</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <label className="block text-sm font-medium text-slate-400 mb-1">Sector</label>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">{getSectorEmoji(leakageDetails.sector)}</span>
                  <p className="text-white capitalize font-semibold">{leakageDetails.sector}</p>
                </div>
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold capitalize border ${getSeverityColor(leakageDetails.severity)}`}>
                  {leakageDetails.severity}
                </span>
              </div>
              
              <div className="text-center">
                <label className="block text-sm font-medium text-slate-400 mb-1">Revenue Impact</label>
                <div className="flex items-center justify-center space-x-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-white font-bold text-xl">
                    ${leakageDetails.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Results */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Issue Identified</span>
              </h4>
              <p className="text-white leading-relaxed">{leakageDetails.cause}</p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span>AI Root Cause Analysis</span>
              </h4>
              <p className="text-white leading-relaxed">{leakageDetails.root_cause}</p>
            </div>
          </div>

          {/* Department Assignment Preview */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-5 h-5 text-blue-500" />
              <h4 className="text-blue-400 font-medium">Smart Department Assignment</h4>
            </div>
            <p className="text-slate-300 mb-3">
              AI recommends assigning this ticket to: <span className="font-semibold text-white">{leakageDetails.assigned_department}</span>
            </p>
            <p className="text-slate-400 text-sm">
              🤖 Assignment based on sector expertise, leakage type, and team workload analysis.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </div>
          </button>
          
          <button
            onClick={handleViewDetails}
            className="flex-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Proceed to Generate Ticket</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}