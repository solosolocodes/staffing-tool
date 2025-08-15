import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className
}: MetricCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}