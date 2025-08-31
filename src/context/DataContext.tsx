import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { leakageAPI, ticketAPI, statsAPI, datasetAPI, type Leakage, type Ticket, type Stats } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  leakages: Leakage[];
  tickets: Ticket[];
  stats: Stats | null;
  isLoading: boolean;
  uploadDataset: (filename: string, sector: string) => Promise<{ success: boolean; dataset_id?: string; message?: string }>;
  processDataset: (datasetId: string) => Promise<{ success: boolean; leakages_detected?: number }>;
  generateTicket: (leakageId: string) => Promise<{ success: boolean; ticket_id?: string; assigned_to?: string }>;
  resolveTicket: (ticketId: string, method: 'ai' | 'manual', solutions?: string[]) => Promise<boolean>;
  getTicketsByRole: (role: 'finance' | 'it') => Ticket[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [leakages, setLeakages] = useState<Leakage[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [leakagesData, statsData] = await Promise.all([
        leakageAPI.getAll(),
        statsAPI.get()
      ]);
      
      setLeakages(leakagesData);
      setStats(statsData);
      
      if (user && (user.role === 'finance' || user.role === 'it')) {
        const ticketsData = await ticketAPI.getByRole(user.role);
        setTickets(ticketsData);
      } else if (user?.role === 'admin') {
        const ticketsData = await ticketAPI.getByRole('all');
        setTickets(ticketsData);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const uploadDataset = useCallback(async (filename: string, sector: string): Promise<{ success: boolean; dataset_id?: string; message?: string }> => {
    if (!user) return { success: false, message: 'User not authenticated' };
    
    setIsLoading(true);
    try {
      const result = await datasetAPI.upload(filename, sector, user.id);
      return result;
    } catch (error) {
      console.error('Upload failed:', error);
      return { success: false, message: 'Upload failed' };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const processDataset = useCallback(async (datasetId: string): Promise<{ success: boolean; leakages_detected?: number }> => {
    setIsLoading(true);
    try {
      const result = await datasetAPI.process(datasetId);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('Processing failed:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  const generateTicket = useCallback(async (leakageId: string): Promise<{ success: boolean; ticket_id?: string; assigned_to?: string }> => {
    try {
      const result = await ticketAPI.generate(leakageId);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('Ticket generation failed:', error);
      return { success: false };
    }
  }, [refreshData]);

  const resolveTicket = useCallback(async (ticketId: string, method: 'ai' | 'manual', solutions?: string[]): Promise<boolean> => {
    try {
      const result = await ticketAPI.resolve(ticketId, method, solutions);
      if (result.success) {
        await refreshData();
      }
      return result.success;
    } catch (error) {
      console.error('Ticket resolution failed:', error);
      return false;
    }
  }, [refreshData]);

  const getTicketsByRole = useCallback((role: 'finance' | 'it') => {
    return tickets.filter(ticket => ticket.assigned_to === role);
  }, [tickets]);

  return (
    <DataContext.Provider value={{
      leakages,
      tickets,
      stats,
      isLoading,
      uploadDataset,
      processDataset,
      generateTicket,
      resolveTicket,
      getTicketsByRole,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}