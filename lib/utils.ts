import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    planning: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    available: 'bg-green-100 text-green-800',
    'partially-booked': 'bg-yellow-100 text-yellow-800',
    'fully-booked': 'bg-red-100 text-red-800',
    'on-leave': 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };
  return priorityColors[priority] || 'text-gray-500';
}