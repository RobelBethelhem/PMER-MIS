import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = value instanceof Function ? value(prev) : value;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [stored, setValue];
}

export interface DataSubmission {
  id: string;
  branch: string;
  periodType: string;
  period: string;
  year: string;
  entries: {
    indicator: string;
    target: number;
    actual: number;
    achievement: number;
    male: number;
    female: number;
    note: string;
  }[];
  submittedAt: string;
  status: "draft" | "submitted";
}

export const SUBMISSIONS_KEY = "pmer_submissions";
export const AUDIT_KEY = "pmer_audit_log";

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  type: string;
  module: string;
  timestamp: string;
  ip: string;
}

export function addAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp" | "ip">) {
  const existing = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
  existing.unshift({
    ...entry,
    id: crypto.randomUUID?.() || Date.now().toString(),
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    ip: "10.2.0." + Math.floor(Math.random() * 100),
  });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(existing.slice(0, 50)));
}
