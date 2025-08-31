import React, { useState } from 'react';
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { datasetAPI, leakageAPI, statsAPI, ticketAPI } from '../../services/api';

export const APITest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runAPITests = async () => {
    setIsRunning(true);
    const results: Record<string, { success: boolean; message: string }> = {};

    try {
      // Test 1: Stats API
      console.log('Testing Stats API...');
      const stats = await statsAPI.get();
      results.stats = {
        success: !!stats,
        message: stats ? 'Stats API working' : 'Stats API failed'
      };

      // Test 2: Leakages API
      console.log('Testing Leakages API...');
      const leakages = await leakageAPI.getAll();
      results.leakages = {
        success: Array.isArray(leakages),
        message: Array.isArray(leakages) ? `Found ${leakages.length} leakages` : 'Leakages API failed'
      };

      // Test 3: Dataset Upload API
      console.log('Testing Dataset Upload API...');
      const uploadResult = await datasetAPI.upload('test_dataset.csv', 'telecom', 'test_user');
      results.upload = {
        success: uploadResult.success,
        message: uploadResult.success ? `Upload successful, ID: ${uploadResult.dataset_id}` : uploadResult.message || 'Upload failed'
      };

      // Test 4: Dataset Process API (if upload was successful)
      if (uploadResult.success && uploadResult.dataset_id) {
        console.log('Testing Dataset Process API...');
        const processResult = await datasetAPI.process(uploadResult.dataset_id);
        results.process = {
          success: processResult.success,
          message: processResult.success ? `Processed ${processResult.leakages_detected} leakages` : processResult.message || 'Processing failed'
        };
      } else {
        results.process = {
          success: false,
          message: 'Skipped - Upload failed'
        };
      }

      // Test 5: Ticket Generation API (if we have leakages)
      if (leakages.length > 0) {
        console.log('Testing Ticket Generation API...');
        const ticketResult = await ticketAPI.generate(leakages[0].id);
        results.ticket = {
          success: ticketResult.success,
          message: ticketResult.success ? `Ticket generated: ${ticketResult.ticket_id}` : ticketResult.message || 'Ticket generation failed'
        };
      } else {
        results.ticket = {
          success: false,
          message: 'Skipped - No leakages available'
        };
      }

    } catch (error) {
      console.error('API Test Error:', error);
      results.error = {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TestTube className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-white">API Integration Test</h2>
      </div>

      <button
        onClick={runAPITests}
        disabled={isRunning}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none mb-6"
      >
        {isRunning ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Running Tests...</span>
          </div>
        ) : (
          'Run API Tests'
        )}
      </button>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white mb-4">Test Results:</h3>
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div className="flex-1">
                <div className="text-white font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1').trim()}</div>
                <div className={`text-sm ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
