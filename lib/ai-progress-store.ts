export type AiJobStatus = {
  jobId: string;
  state: 'queued' | 'planning' | 'generating' | 'reviewing' | 'completed' | 'failed';
  progress: number;
  message: string;
  updatedAt: string;
};

const aiJobStore = new Map<string, AiJobStatus>();

export const upsertJobStatus = (status: AiJobStatus) => {
  aiJobStore.set(status.jobId, status);
  return status;
};

export const getJobStatus = (jobId: string) => aiJobStore.get(jobId);
