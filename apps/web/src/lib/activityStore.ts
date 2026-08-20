import { useSyncExternalStore } from 'react';
import { notifyJobComplete } from './notify';

export interface ActivityJob {
  id: string;
  filename: string;
  status: 'running' | 'done' | 'failed';
  error?: string;
  startedAt: number;
}

// Module-level store, not React context — invokeLocalFileOp (convertApi.ts)
// reports here directly without needing a provider in the tree, and the
// Activity Ball/Panel (rendered once in the desktop shell) is the only
// consumer. No progress percentage is tracked: the underlying Tauri
// commands are single awaited promises with no progress events, so
// "running" is the only state we can honestly report mid-flight.
let jobs: ActivityJob[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return jobs;
}

function getServerSnapshot() {
  return [] as ActivityJob[];
}

export function useActivityJobs(): ActivityJob[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function startJob(filename: string): string {
  const id = crypto.randomUUID();
  jobs = [{ id, filename, status: 'running', startedAt: Date.now() }, ...jobs];
  emit();
  return id;
}

export function completeJob(id: string) {
  const job = jobs.find((j) => j.id === id);
  jobs = jobs.map((j) => (j.id === id ? { ...j, status: 'done' } : j));
  emit();
  if (job) notifyJobComplete(job.filename, true);
}

export function failJob(id: string, error: string) {
  const job = jobs.find((j) => j.id === id);
  jobs = jobs.map((j) => (j.id === id ? { ...j, status: 'failed', error } : j));
  emit();
  if (job) notifyJobComplete(job.filename, false, error);
}

export function clearFinished() {
  jobs = jobs.filter((j) => j.status === 'running');
  emit();
}
