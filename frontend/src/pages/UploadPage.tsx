import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Play, CheckCircle2, AlertCircle, Trash2, Upload, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useFilterStore } from '@/stores/useFilterStore';
import apiClient from '@/api/client';
import { uploadProgressUrl } from '@/api/config';
import { toast } from '@/hooks/useToast';

interface FileUploadState {
  file: File | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
}

interface ProgressEvent {
  stage: string;
  message: string;
  timestamp: string;
  data?: any;
}

// ─── Upload Card ─────────────────────────────────────────────────
interface UploadCardProps {
  title: string;
  description: string;
  extension: string;
  iconColor: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const UploadCard: React.FC<UploadCardProps> = ({
  title,
  description,
  extension,
  iconColor,
  onFileSelect,
  selectedFile,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={`
        relative group rounded-[var(--radius-xl)] border-2 transition-all duration-200 p-6 flex flex-col items-center text-center gap-3 cursor-pointer
        ${selectedFile
          ? 'border-[var(--accent-teal)] bg-[rgba(16,185,129,0.04)] shadow-[0_0_20px_rgba(16,185,129,0.08)]'
          : dragOver
            ? 'border-[var(--accent-primary)] bg-[rgba(108,99,255,0.04)]'
            : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]'
        }
      `}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      {/* Icon zone */}
      <div
        className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center transition-colors ${selectedFile ? 'bg-[rgba(16,185,129,0.1)]' : 'bg-white/[0.03] group-hover:bg-white/[0.05]'}`}
      >
        <FileText className="w-5 h-5" style={{ color: selectedFile ? 'var(--accent-teal)' : iconColor }} />
      </div>

      {/* Labels */}
      <div className="space-y-0.5">
        <h3 className="text-[13px] font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
        <span
          className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded mono-value"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          {extension}
        </span>
      </div>

      {/* Drop zone hint */}
      {!selectedFile && (
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          Click to browse or drag & drop
        </p>
      )}

      {/* Selected file pill */}
      {selectedFile && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full w-full max-w-[200px] justify-between"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <CheckCircle2 className="w-3 h-3 text-[var(--accent-teal)] shrink-0" />
          <span
            className="text-[10px] text-[var(--accent-teal)] font-semibold truncate flex-1 text-left"
            title={selectedFile.name}
          >
            {selectedFile.name}
          </span>
          <button
            className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors shrink-0"
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            aria-label="Remove file"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
      />
    </div>
  );
};

// ─── Progress Step ───────────────────────────────────────────────
const ProgressStep = ({ event, index, total }: { event: ProgressEvent; index: number; total: number }) => {
  const isError    = event.stage === 'Error';
  const isComplete = event.stage === 'Complete';
  const isActive   = index === total - 1;

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* Timeline connector */}
      <div className="flex flex-col items-center shrink-0 h-full min-h-[48px]">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            isError    ? 'border-[var(--accent-red)] bg-[rgba(239,68,68,0.1)]' :
            isComplete ? 'border-[var(--accent-teal)] bg-[rgba(16,185,129,0.1)]' :
            isActive   ? 'border-[var(--accent-primary)] bg-[rgba(108,99,255,0.1)]' :
                         'border-[var(--accent-teal)]/40 bg-[rgba(16,185,129,0.04)]'
          }`}
        >
          {isError    ? <AlertCircle  className="w-3 h-3 text-[var(--accent-red)]" /> :
           isComplete ? <CheckCircle2 className="w-3 h-3 text-[var(--accent-teal)]" /> :
           isActive   ? <div className="w-2.5 h-2.5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /> :
                        <CheckCircle2 className="w-3 h-3 text-[var(--accent-teal)]/60" />
          }
        </div>
        {index < total - 1 && (
          <div className="w-px flex-1 bg-[var(--border)] mt-1 min-h-[16px]" />
        )}
      </div>

      <div className="pt-1 pb-3 flex-1 min-w-0">
        <p className="text-[13px] text-[var(--text-primary)] font-medium leading-snug">{event.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[9px] mono-value px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              isError    ? 'text-[var(--accent-red)]' :
              isComplete ? 'text-[var(--accent-teal)]' :
                           'text-[var(--accent-primary)]'
            }`}
          >
            {event.stage}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────
export const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<Record<string, FileUploadState>>({
    STIL:         { file: null, status: 'idle', message: '' },
    ATE_LOG:      { file: null, status: 'idle', message: '' },
    ATPG_REPORT:  { file: null, status: 'idle', message: '' },
    MBIST_REPORT: { file: null, status: 'idle', message: '' },
    LBIST_REPORT: { file: null, status: 'idle', message: '' },
  });

  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [progress, setProgress]         = useState<ProgressEvent[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleFileChange = (type: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [type]: { ...prev[type], file, status: file ? 'success' : 'idle' },
    }));
  };

  const { data: storedLots, refetch: refetchLots } = useQuery({
    queryKey: ['stored-lots'],
    queryFn: async () => {
      const { data } = await apiClient.get('/lots');
      return data.data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/lots/${id}`);
      refetchLots();
      setDeleteConfirm(null);
      if (useFilterStore.getState().lotId === id) {
        useFilterStore.getState().setLot(null);
      }
    } catch {
      console.error('Delete failed');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await apiClient.delete('/lots');
      refetchLots();
      setDeleteConfirm(null);
      useFilterStore.getState().setLot(null);
    } catch {
      console.error('Delete all failed');
    }
  };

  const handleAnalyze = async () => {
    if (!files.STIL.file && !files.ATE_LOG.file) return;
    setIsAnalyzing(true);
    setProgress([]);

    const formData = new FormData();
    if (files.STIL.file)         formData.append('STIL',         files.STIL.file);
    if (files.ATE_LOG.file)      formData.append('ATE_LOG',      files.ATE_LOG.file);
    if (files.ATPG_REPORT.file)  formData.append('ATPG_REPORT',  files.ATPG_REPORT.file);
    if (files.MBIST_REPORT.file) formData.append('MBIST_REPORT', files.MBIST_REPORT.file);
    if (files.LBIST_REPORT.file) formData.append('LBIST_REPORT', files.LBIST_REPORT.file);

    try {
      const { data } = await apiClient.post('/upload', formData);
      const uploadId = data.uploadId ?? data.data?.uploadId;
      if (!uploadId) {
        throw new Error('No upload id returned from server');
      }
      const eventSource = new EventSource(uploadProgressUrl(uploadId));

      eventSource.onmessage = (e) => {
        const newEvents: ProgressEvent[] = JSON.parse(e.data);
        setProgress(prev => [...prev, ...newEvents]);
        if (newEvents.some(ev => ev.stage === 'Complete')) {
          const completeEvent = newEvents.find(ev => ev.stage === 'Complete');
          if (completeEvent?.data?.lotId) {
            useFilterStore.getState().setLot(completeEvent.data.lotId);
          }
          eventSource.close();
          setIsAnalyzing(false);
          refetchLots();
        } else if (newEvents.some(ev => ev.stage === 'Error')) {
          eventSource.close();
          setIsAnalyzing(false);
        }
      };
      eventSource.onerror = () => {
        eventSource.close();
        setIsAnalyzing(false);
      };
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      toast.error('Upload failed', 'Check that the API is running and files are valid.');
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = (files.STIL.file || files.ATE_LOG.file) && !isAnalyzing;

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      <PageHeader
        title="Forensic Data Ingestion"
        subtitle="Upload STIL, ATE Logs, and ATPG Reports to power the analysis engine"
        badge="v2.4"
      />

      {/* Primary upload row */}
      <div>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">
          Required Files
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UploadCard
            title="STIL"
            description="Standard Test Interface Language"
            extension=".stil"
            iconColor="var(--accent-teal)"
            onFileSelect={(f) => handleFileChange('STIL', f)}
            selectedFile={files.STIL.file}
          />
          <UploadCard
            title="ATE LOG"
            description="Tester log — SmarTest, G-XL, CSV"
            extension=".log / .csv"
            iconColor="var(--accent-blue)"
            onFileSelect={(f) => handleFileChange('ATE_LOG', f)}
            selectedFile={files.ATE_LOG.file}
          />
          <UploadCard
            title="ATPG REPORT"
            description="Fault report — TetraMAX, Modus"
            extension=".rpt"
            iconColor="var(--accent-purple)"
            onFileSelect={(f) => handleFileChange('ATPG_REPORT', f)}
            selectedFile={files.ATPG_REPORT.file}
          />
        </div>
      </div>

      {/* Optional files */}
      <div>
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-3">
          Optional BIST Reports
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadCard
            title="MBIST REPORT"
            description="Memory BIST diagnostics"
            extension=".rpt / .xml"
            iconColor="var(--accent-primary)"
            onFileSelect={(f) => handleFileChange('MBIST_REPORT', f)}
            selectedFile={files.MBIST_REPORT.file}
          />
          <UploadCard
            title="LBIST REPORT"
            description="Logic BIST diagnostics"
            extension=".rpt / .xml"
            iconColor="var(--accent-cyan)"
            onFileSelect={(f) => handleFileChange('LBIST_REPORT', f)}
            selectedFile={files.LBIST_REPORT.file}
          />
        </div>
      </div>

      {/* Validation hint */}
      {!files.STIL.file && !files.ATE_LOG.file && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-md)] border text-[12px] text-[var(--text-secondary)]"
          style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] shrink-0" />
          At minimum, upload a STIL file or ATE LOG to begin analysis.
        </div>
      )}

      {/* Analyze CTA */}
      <div className="flex justify-center">
        <button
          id="analyze-btn"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`
            flex items-center gap-2.5 px-10 py-3.5 rounded-[var(--radius-lg)] font-bold text-[14px] transition-all duration-200
            ${canAnalyze
              ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] shadow-[0_0_24px_rgba(108,99,255,0.3)] hover:shadow-[0_0_32px_rgba(108,99,255,0.4)] hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-white/[0.04] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border)]'
            }
          `}
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isAnalyzing ? 'Analysing…' : 'Run Analysis'}
        </button>
      </div>

      {/* Progress Timeline */}
      {progress.length > 0 && (
        <div
          className="w-full max-w-2xl mx-auto rounded-[var(--radius-xl)] border overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div
            className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Analysis Pipeline
            </span>
            <span className="badge badge-primary">{progress.length} steps</span>
          </div>
          <div className="px-5 py-4 space-y-0">
            {progress.map((event, i) => (
              <ProgressStep key={i} event={event} index={i} total={progress.length} />
            ))}
          </div>
        </div>
      )}

      {/* ── Stored Lots ──────────────────────────────── */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3
              className="text-[15px] font-bold text-[var(--text-primary)]"
              style={{ letterSpacing: '-0.015em' }}
            >
              Stored Forensic Lots
            </h3>
            {storedLots && storedLots.length > 0 && (
              <span className="badge badge-muted">{storedLots.length} files</span>
            )}
          </div>

          {storedLots && storedLots.length > 0 && (
            deleteConfirm === 'all' ? (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-[12px]"
                style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.18)' }}
              >
                <span className="text-[var(--accent-red)] font-semibold">Confirm delete all?</span>
                <button
                  onClick={handleDeleteAll}
                  className="text-[var(--accent-red)] font-bold hover:underline"
                >Yes</button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm('all')}
                className="btn btn-danger text-[11px] py-1.5 px-3 rounded-[var(--radius-sm)]"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            )
          )}
        </div>

        {storedLots && storedLots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storedLots.map((lot: any) => {
              const isActiveLot = useFilterStore.getState().lotId === lot.id;
              return (
                <div
                  key={lot.id}
                  onClick={() => useFilterStore.getState().setLot(lot.id)}
                  className={`
                    relative cursor-pointer rounded-[var(--radius-xl)] border p-5 transition-all duration-200 group
                    ${isActiveLot
                      ? 'border-[var(--accent-primary)] shadow-[0_0_20px_rgba(108,99,255,0.12)]'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]'
                    }
                  `}
                  style={isActiveLot ? { background: 'rgba(108,99,255,0.05)' } : {}}
                >
                  {/* Active badge */}
                  {isActiveLot && (
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-primary">Active</span>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
                      style={{ background: 'rgba(108,99,255,0.1)' }}
                    >
                      <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                    </div>

                    {deleteConfirm === lot.id ? (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-[var(--accent-red)] font-semibold">Delete?</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(lot.id); }}
                          className="text-[var(--accent-red)] font-bold hover:underline"
                        >Yes</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                          className="text-[var(--text-muted)]"
                        >No</button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(lot.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[rgba(239,68,68,0.08)] rounded-[var(--radius-sm)] transition-all"
                        aria-label="Delete lot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lot info */}
                  <h4 className="text-[13px] font-bold text-[var(--text-primary)] mb-0.5">
                    Lot {lot.lotNumber}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lot.product && (
                      <span className="badge badge-muted">{lot.product}</span>
                    )}
                    {lot.tester && (
                      <span className="badge badge-muted">{lot.tester}</span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div
                    className="grid grid-cols-2 gap-3 pt-3 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Patterns</p>
                      <p className="text-[13px] mono-value mt-0.5">{lot._count?.patterns ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Uploaded</p>
                      <p className="text-[13px] mono-value mt-0.5">
                        {new Date(lot.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-[var(--radius-2xl)] border p-16 flex flex-col items-center justify-center text-center"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-[var(--radius-xl)] flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
            >
              <Upload className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-1">
              No stored files found
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Uploaded lots will appear here after analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
