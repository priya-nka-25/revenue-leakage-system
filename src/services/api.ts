import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'finance' | 'it';
  name: string;
}

export interface Leakage {
  id: string;
  dataset_id: string;
  sector: 'telecom' | 'healthcare' | 'banking';
  severity: 'low' | 'medium' | 'high' | 'critical';
  cause: string;
  root_cause: string;
  amount: number;
  status: 'detected' | 'ticket-generated' | 'resolved';
  detected_at: string;
}

export interface Ticket {
  id: string;
  leakage_id: string;
  assigned_to: 'finance' | 'it';
  status: 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  root_cause: string;
  ai_suggestions: string[];
  resolution_method?: 'ai' | 'manual';
  created_at: string;
  resolved_at?: string;
  sector: string;
  amount: number;
}

export interface Stats {
  total_leakages: number;
  total_tickets: number;
  resolved_tickets: number;
  pending_tickets: number;
  ai_resolutions: number;
  manual_resolutions: number;
  severity_distribution: Record<string, number>;
  sector_distribution: Record<string, number>;
}

export const authAPI = {
  login: async (username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  },
};

export const datasetAPI = {
  upload: async (filename: string, sector: string, uploadedBy: string): Promise<{ success: boolean; dataset_id?: string; message?: string }> => {
    try {
      const response = await api.post('/datasets/upload', {
        filename,
        sector,
        uploaded_by: uploadedBy,
      });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Upload failed' };
    }
  },

  process: async (datasetId: string): Promise<{ success: boolean; leakages_detected?: number; leakages?: Leakage[]; message?: string }> => {
    try {
      const response = await api.post(`/datasets/${datasetId}/process`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Processing failed' };
    }
  },
};

export const leakageAPI = {
  getAll: async (): Promise<Leakage[]> => {
    try {
      const response = await api.get('/leakages');
      return response.data.leakages;
    } catch (error) {
      console.error('Failed to fetch leakages:', error);
      return [];
    }
  },

  getDetails: async (leakageId: string): Promise<Leakage & { assigned_department: string } | null> => {
    try {
      const response = await api.get(`/leakages/${leakageId}/details`);
      return response.data.leakage;
    } catch (error) {
      console.error('Failed to fetch leakage details:', error);
      return null;
    }
  },
};

export const ticketAPI = {
  generate: async (leakageId: string): Promise<{ success: boolean; ticket_id?: string; assigned_to?: string; message?: string }> => {
    try {
      const response = await api.post('/tickets/generate', { leakage_id: leakageId });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Ticket generation failed' };
    }
  },

  getByRole: async (role: string): Promise<Ticket[]> => {
    try {
      const response = await api.get(`/tickets?role=${role}`);
      return response.data.tickets;
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      return [];
    }
  },

  resolve: async (ticketId: string, method: 'ai' | 'manual', solutions?: string[]): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/tickets/${ticketId}/resolve`, {
        method,
        solutions,
      });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Resolution failed' };
    }
  },
};

export const statsAPI = {
  get: async (): Promise<Stats | null> => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return null;
    }
  },
};