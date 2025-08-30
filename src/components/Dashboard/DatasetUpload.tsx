import React, { useState } from 'react';
import { Upload, FileText, Brain, CheckCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function DatasetUpload() {
  const [selectedSector, setSelectedSector] = useState<'telecom' | 'healthcare' | 'banking' | ''>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [detectedLeakages, setDetectedLeakages] = useState<number>(0);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('');
  const { uploadDataset, processDataset, refreshData } = useData();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setProcessComplete(false);
      setCurrentDatasetId('');
    }
  };

  const handleProcess = async () => {
    if (!selectedSector || !uploadedFile) return;

    setIsProcessing(true);
    
    try {
      // Step 1: Upload dataset
      const uploadSuccess = await uploadDataset(uploadedFile.name, selectedSector);
      if (!uploadSuccess) {
        throw new Error('Dataset upload failed');
      }

      // Generate a temporary dataset ID for processing
      const tempDatasetId = `dataset_${Date.now()}`;
      setCurrentDatasetId(tempDatasetId);
      
      // Step 2: Process dataset (this will trigger AI pipeline)
      const processResult = await processDataset(tempDatasetId);
      if (!processResult.success) {
        throw new Error('Dataset processing failed');
      }

      setDetectedLeakages(processResult.leakages_detected || 0);
      setProcessComplete(true);
      
      // Refresh all data to show new leakages
      await refreshData();
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const processingSteps = [
    { name: 'Chunking Dataset', icon: '📊', duration: 2000 },
    { name: 'Generating Embeddings', icon: '🧠', duration: 1500 },
    { name: 'Vector DB Storage', icon: '💾', duration: 1000 },
    { name: 'LLM + Agentic AI Analysis', icon: '🤖', duration: 2000 },
    { name: 'Crew AI Root Cause Detection', icon: '🔍', duration: 1500 }
  ];

  React.useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < processingSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 1500);
      
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [isProcessing]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-white">AI Dataset Processing</h2>
      </div>

      <div className="space-y-6">
        {/* Sector Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Select Sector Dataset
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value as any)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">Choose a sector...</option>
            <option value="telecom">📱 Telecom</option>
            <option value="healthcare">🏥 Healthcare</option>
            <option value="banking">🏦 Banking</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Upload Dataset File
          </label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv,.xlsx,.json"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-300 mb-2">Click to upload dataset</p>
              <p className="text-slate-500 text-sm">CSV, Excel, or JSON files</p>
            </label>
          </div>
          
          {uploadedFile && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-slate-300">
              <FileText className="w-4 h-4" />
              <span>{uploadedFile.name}</span>
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={!selectedSector || !uploadedFile || isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing with AI...</span>
            </div>
          ) : (
            'Start AI Analysis'
          )}
        </button>

        {/* Processing Steps */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">AI Processing Pipeline</h4>
              {processingSteps.map((step, index) => (
                <div key={step.name} className={`flex items-center space-x-3 py-2 ${
                  index <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    index < currentStep ? 'bg-emerald-500' : 
                    index === currentStep ? 'bg-purple-600 animate-pulse' : 'bg-slate-600'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-lg">{step.icon}</span>
                    )}
                  </div>
                  <span className={`text-sm ${index <= currentStep ? 'text-white' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                  {index === currentStep && (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {processComplete && (
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-emerald-400 font-medium">Analysis Complete</p>
                <p className="text-slate-300 text-sm">
                  🎯 Detected {detectedLeakages} potential revenue leakages with AI-powered root cause analysis
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}