import React, { useState, useCallback } from 'react';
import { Header } from '../Layout/Header';
import { StatsCards } from './StatsCards';
import { DatasetUpload } from './DatasetUpload';
import { LeakageTable } from './LeakageTable';
import { ChartsSection } from './ChartsSection';
import { SuccessModal } from '../UI/SuccessModal';
import { PerformanceMonitor } from '../UI/PerformanceMonitor';
import { APITest } from '../UI/APITest';

export const AdminDashboard = React.memo(() => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTicketGenerated = useCallback((ticketId: string) => {
    setSuccessMessage(`✅ Ticket ${ticketId} Generated Successfully and assigned to the appropriate team!`);
    setShowSuccessModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <PerformanceMonitor componentName="AdminDashboard" />
      <Header />
      
      <main className="p-6 space-y-8">
        {/* API Test Component - Temporary for testing */}
        <APITest />

        {/* Statistics Cards */}
        <StatsCards />

        {/* Dataset Upload Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <DatasetUpload />
          </div>
          
          <div className="lg:col-span-2">
            <ChartsSection />
          </div>
        </div>

        {/* Leakage Detection Results */}
        <LeakageTable onTicketGenerated={handleTicketGenerated} />
      </main>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        message={successMessage}
      />
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';