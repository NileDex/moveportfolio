import React, { useState } from 'react';
import { 
  FaDownload, 
  FaFileExport, 
  FaFileCsv, 
  FaFileCode,
  FaCalendarAlt,
  FaFilter,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MovementDataService from '../services/MovementDataService';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  dateRange: {
    from: string;
    to: string;
  };
  dataType: 'transactions' | 'blocks' | 'validators' | 'network-stats';
  filters: {
    transactionTypes?: string[];
    status?: string[];
    minAmount?: number;
    maxAmount?: number;
  };
  limit: number;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  options: ExportOptions;
}

export interface ExportDataToolsProps {
  className?: string;
  onExportComplete?: (job: ExportJob) => void;
}

/**
 * ExportDataTools Component
 * Comprehensive data export and analysis tools
 * Supports multiple formats and advanced filtering options
 */
const ExportDataTools: React.FC<ExportDataToolsProps> = ({
  className,
  onExportComplete
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: { from: '', to: '' },
    dataType: 'transactions',
    filters: {},
    limit: 1000
  });
  
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <FaFileCsv />, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', icon: <FaFileCode />, description: 'JavaScript Object Notation' },
    { value: 'xlsx', label: 'Excel', icon: <FaFileExport />, description: 'Microsoft Excel format' }
  ];

  const dataTypeOptions = [
    { value: 'transactions', label: 'Transactions', description: 'Transaction history and details' },
    { value: 'blocks', label: 'Blocks', description: 'Block data and metadata' },
    { value: 'validators', label: 'Validators', description: 'Validator information and stats' },
    { value: 'network-stats', label: 'Network Stats', description: 'Historical network metrics' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    const jobId = Date.now().toString();
    const newJob: ExportJob = {
      id: jobId,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      options: { ...exportOptions }
    };
    
    setExportJobs(prev => [newJob, ...prev]);
    
    try {
      // Simulate export process with progress updates
      const updateProgress = (progress: number) => {
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, progress } : job
        ));
      };
      
      // Fetch data based on options
      let data: any[] = [];
      
      updateProgress(25);
      
      switch (exportOptions.dataType) {
        case 'transactions':
          data = await MovementDataService.getLatestTransactions(exportOptions.limit);
          break;
        case 'blocks':
          data = await MovementDataService.getLatestBlocks(exportOptions.limit);
          break;
        case 'validators':
          data = await MovementDataService.getValidators();
          break;
        case 'network-stats':
          const days = exportOptions.dateRange.from && exportOptions.dateRange.to 
            ? Math.ceil((new Date(exportOptions.dateRange.to).getTime() - new Date(exportOptions.dateRange.from).getTime()) / (1000 * 60 * 60 * 24))
            : 30;
          data = await MovementDataService.getNetworkActivity(days);
          break;
      }
      
      updateProgress(75);
      
      // Generate file content based on format
      let fileContent: string;
      let fileName: string;
      let mimeType: string;
      
      switch (exportOptions.format) {
        case 'csv':
          fileContent = generateCSV(data);
          fileName = `${exportOptions.dataType}_${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          fileContent = JSON.stringify(data, null, 2);
          fileName = `${exportOptions.dataType}_${Date.now()}.json`;
          mimeType = 'application/json';
          break;
        case 'xlsx':
          // For demo purposes, we'll export as CSV with .xlsx extension
          // In production, you'd use a library like xlsx or exceljs
          fileContent = generateCSV(data);
          fileName = `${exportOptions.dataType}_${Date.now()}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      updateProgress(90);
      
      // Create download URL
      const blob = new Blob([fileContent], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      
      updateProgress(100);
      
      // Update job status
      const completedJob: ExportJob = {
        ...newJob,
        status: 'completed',
        progress: 100,
        downloadUrl
      };
      
      setExportJobs(prev => prev.map(job => 
        job.id === jobId ? completedJob : job
      ));
      
      onExportComplete?.(completedJob);
      
    } catch (error) {
      console.error('Export failed:', error);
      
      setExportJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Export failed'
        } : job
      ));
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (job: ExportJob) => {
    if (job.downloadUrl) {
      const link = document.createElement('a');
      link.href = job.downloadUrl;
      link.download = `${job.options.dataType}_${job.id}.${job.options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getJobStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'processing':
        return <FaSpinner className="export-tools__job-icon export-tools__job-icon--spinning" />;
      case 'completed':
        return <FaCheckCircle className="export-tools__job-icon export-tools__job-icon--success" />;
      case 'failed':
        return <FaExclamationTriangle className="export-tools__job-icon export-tools__job-icon--error" />;
      default:
        return <FaInfoCircle className="export-tools__job-icon" />;
    }
  };

  return (
    <div className={cn('export-data-tools', className)}>
      <div className="space-y-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Export Configuration</CardTitle>
            <p className="text-sm text-muted-foreground">Configure your data export settings</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Data Type Selection */}
              <div className="export-tools__section">
                <h4 className="export-tools__section-title">Data Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {dataTypeOptions.map(option => (
                    <div key={option.value}>
                      <Button
                        variant={exportOptions.dataType === option.value ? 'default' : 'ghost'}
                        onClick={() => setExportOptions(prev => ({ ...prev, dataType: option.value as any }))}
                        className="export-tools__option-button w-full"
                      >
                        <div className="export-tools__option-content">
                          <div className="export-tools__option-label">{option.label}</div>
                          <div className="export-tools__option-description">{option.description}</div>
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="export-tools__section">
                <h4 className="export-tools__section-title">Export Format</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {formatOptions.map(option => (
                    <div key={option.value}>
                      <Button
                        variant={exportOptions.format === option.value ? 'default' : 'ghost'}
                        onClick={() => setExportOptions(prev => ({ ...prev, format: option.value as any }))}
                        className="export-tools__format-button w-full"
                      >
                        <span className="mr-2">{option.icon}</span>
                        <div>
                          <div>{option.label}</div>
                          <div className="export-tools__format-description">{option.description}</div>
                        </div>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="export-tools__section">
                <h4 className="export-tools__section-title">
                  <FaCalendarAlt /> Date Range (Optional)
                </h4>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={exportOptions.dateRange.from}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value }
                    }))}
                    className="export-tools__date-input"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={exportOptions.dateRange.to}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value }
                    }))}
                    className="export-tools__date-input"
                  />
                </div>
              </div>

              {/* Record Limit */}
              <div className="export-tools__section">
                <h4 className="export-tools__section-title">Record Limit</h4>
                <select
                  value={exportOptions.limit}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="export-tools__select"
                >
                  <option value={100}>100 records</option>
                  <option value={500}>500 records</option>
                  <option value={1000}>1,000 records</option>
                  <option value={5000}>5,000 records</option>
                  <option value={10000}>10,000 records</option>
                </select>
              </div>

              {/* Export Button */}
              <div className="flex justify-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="export-tools__export-button"
                >
                  <FaDownload className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Start Export'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Jobs */}
        {exportJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <p className="text-sm text-muted-foreground">Track your export jobs and download completed files</p>
            </CardHeader>
            <CardContent>
              <div className="export-tools__jobs">
                {exportJobs.map(job => (
                  <div key={job.id} className="export-tools__job">
                    <div className="flex items-center gap-4">
                      {getJobStatusIcon(job.status)}

                      <div className="export-tools__job-info">
                        <div className="export-tools__job-title">
                          {job.options.dataType} export ({job.options.format.toUpperCase()})
                        </div>
                        <div className="export-tools__job-meta">
                          {job.createdAt.toLocaleString()} • {job.options.limit} records
                        </div>
                        {job.status === 'processing' && (
                          <div className="export-tools__progress">
                            <div
                              className="export-tools__progress-bar"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        )}
                        {job.error && (
                          <div className="export-tools__job-error">{job.error}</div>
                        )}
                      </div>

                      {job.status === 'completed' && job.downloadUrl && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => downloadFile(job)}
                        >
                          <FaDownload className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExportDataTools;
export type { ExportOptions, ExportJob, ExportDataToolsProps };
