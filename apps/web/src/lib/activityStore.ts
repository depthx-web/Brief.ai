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
//
// Persisted to localStorage so job history survives an app restart —
// a "running" job that never got to complete/fail before the app closed
// (killed mid-operation) is downgraded to "failed" on load, since it
// otherwise wouldn't be, and never will be, honestly resolved.
const STORAGE_KEY = 'brief-ai-desktop-activity';
const MAX_STORED_JOBS = 50;

function loadPersisted(): ActivityJob[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityJob[];
    return parsed.map((j) => (j.status === 'running' ? { ...j, status: 'failed', error: 'Interrupted — the app closed before this finished.' } : j));
  } catch {
    return [];
  }
}

function persist() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.slice(0, MAX_STORED_JOBS)));
  } catch {
    // Storage can fail (quota, private mode) — job history is a convenience,
    // never worth breaking the file operation that triggered it.
  }
}

let jobs: ActivityJob[] = loadPersisted();
const listeners = new Set<() => void>();

function emit() {
  persist();
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
  jobs = [{ id, filename, status: 'running' as const, startedAt: Date.now() }, ...jobs].slice(0, MAX_STORED_JOBS);
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
