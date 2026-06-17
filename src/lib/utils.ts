import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}



export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}




export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 4) return "****";
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

export function maskPan(pan: string): string {
  if (!pan || pan.length < 4) return "****";
  return `${pan.slice(0, 2)}****${pan.slice(-2)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getTrendColor(value: number): string {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-600";
  return "text-gray-500";
}

export function getTrendIcon(value: number): string {
  if (value > 0) return "↑";
  if (value < 0) return "↓";
  return "→";
}
