export type QueueJob = {
  jobId: string;
  clerkUserId: string;
  prompt: string;
  status: 'queued' | 'planning' | 'generating' | 'reviewing' | 'completed' | 'failed';
  queuePosition: number;
  progress: number;
  message: string;
  createdAt: string;
  updatedAt: string;
};

const queue: QueueJob[] = [];

export const enqueueJob = (job: Omit<QueueJob, 'queuePosition'>) => {
  const queuePosition = queue.filter((item) => item.status !== 'completed' && item.status !== 'failed').length + 1;
  const fullJob: QueueJob = { ...job, queuePosition };
  queue.push(fullJob);
  return fullJob;
};

export const updateQueueJob = (jobId: string, patch: Partial<QueueJob>) => {
  const index = queue.findIndex((item) => item.jobId === jobId);
  if (index === -1) return null;
  queue[index] = { ...queue[index], ...patch, updatedAt: new Date().toISOString() };
  return queue[index];
};

export const getQueueJob = (jobId: string) => queue.find((item) => item.jobId === jobId);
