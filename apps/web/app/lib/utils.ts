import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return `${(parts[0] ?? "").charAt(0)}${(parts[1] ?? "").charAt(0)}`.toUpperCase();
}

/** Deterministic day index for a date key like "2026-10-27". */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function levelFromXp(xp: number): { level: number; title: string } {
  const titles = [
    "Novice",
    "Apprentice",
    "Craftsman",
    "Journeyman",
    "Specialist",
    "Architect",
    "Sage",
  ];
  const level = Math.max(1, Math.floor(xp / 400) + 1);
  const title = titles[Math.min(level - 1, titles.length - 1)] ?? "Sage";
  return { level, title };
}

export function xpForLevel(level: number): number {
  return level * 400;
}
