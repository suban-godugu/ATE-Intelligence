type ProgressEvent = {
  file: string;
  stage: string;
  message: string;
  timestamp: string;
  data?: any;
};

class UploadProgressStore {
  private progress: Map<string, ProgressEvent[]> = new Map();

  add(uploadId: string, event: ProgressEvent) {
    const existing = this.progress.get(uploadId) || [];
    existing.push(event);
    this.progress.set(uploadId, existing);
  }

  get(uploadId: string): ProgressEvent[] {
    return this.progress.get(uploadId) || [];
  }

  delete(uploadId: string) {
    this.progress.delete(uploadId);
  }
}

export const progressStore = new UploadProgressStore();
