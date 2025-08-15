'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Trophy,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { mockStaff, mockAssignments } from '@/lib/mock-data';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { startOfYear, endOfYear, startOfQuarter, endOfQuarter, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

type FilterPeriod = 'month' | 'quarter' | 'year';
type FilterValue = 'current' | 'previous' | 'all';

export default function AnalyticsPage() {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('quarter');
  const [filterValue, setFilterValue] = useState<FilterValue>('current');
  const [selectedYear, setSelectedYear] = useState(2024);

  // Calculate billable USD for each staff member
  const calculateStaffMetrics = useMemo(() => {
    const currentDate = new Date(selectedYear, new Date().getMonth(), new Date().getDate());
    
    // Determine the date range based on filter
    let startDate: Date, endDate: Date;
    
    if (filterValue === 'current') {
      if (filterPeriod === 'month') {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      } else if (filterPeriod === 'quarter') {
        startDate = startOfQuarter(currentDate);
        endDate = endOfQuarter(currentDate);
      } else {
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
      }
    } else if (filterValue === 'previous') {
      if (filterPeriod === 'month') {
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        startDate = startOfMonth(prevMonth);
        endDate = endOfMonth(prevMonth);
      } else if (filterPeriod === 'quarter') {
        const prevQuarter = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        startDate = startOfQuarter(prevQuarter);
        endDate = endOfQuarter(prevQuarter);
      } else {
        startDate = startOfYear(new Date(selectedYear - 1, 0, 1));
        endDate = endOfYear(new Date(selectedYear - 1, 0, 1));
      }
    } else {
      // All time
      startDate = new Date(2020, 0, 1);
      endDate = new Date(2030, 11, 31);
    }

    return mockStaff.map(staff => {
      // Get assignments for this staff member in the date range
      const staffAssignments = mockAssignments.filter(assignment => {
        if (assignment.staffId !== staff.id) return false;
        if (filterValue === 'all') return true;
        
        const assignmentStart = parseISO(assignment.startDate);
        const assignmentEnd = parseISO(assignment.endDate);
        
        // Check if assignment overlaps with our filter period
        return isWithinInterval(assignmentStart, { start: startDate, end: endDate }) ||
               isWithinInterval(assignmentEnd, { start: startDate, end: endDate }) ||
               isWithinInterval(startDate, { start: assignmentStart, end: assignmentEnd });
      });

      // Calculate metrics
      const totalBillableUSD = staffAssignments.reduce((sum, assignment) => {
        // Estimate weeks in the period (simplified calculation)
        const weeksInPeriod = filterValue === 'all' ? 52 : 
                             filterPeriod === 'month' ? 4 :
                             filterPeriod === 'quarter' ? 13 : 52;
        return sum + (assignment.totalCost * weeksInPeriod);
      }, 0);

      const totalHours = staffAssignments.reduce((sum, assignment) => {
        const weeksInPeriod = filterValue === 'all' ? 52 : 
                             filterPeriod === 'month' ? 4 :
                             filterPeriod === 'quarter' ? 13 : 52;
        return sum + (assignment.billableHours * weeksInPeriod);
      }, 0);

      const averageHourlyRate = staffAssignments.length > 0 
        ? staffAssignments.reduce((sum, a) => sum + a.hourlyRate, 0) / staffAssignments.length 
        : staff.clientRate;

      const projectCount = staffAssignments.length;
      const utilizationScore = Math.min(100, (100 - staff.availability) + staff.billableUtilization);

      return {
        staff,
        totalBillableUSD,
        totalHours,
        averageHourlyRate,
        projectCount,
        utilizationScore,
        availability: staff.availability,
        billableUtilization: staff.billableUtilization,
        assignments: staffAssignments
      };
    });
  }, [filterPeriod, filterValue, selectedYear]);

  const topEarners = useMemo(() => {
    return [...calculateStaffMetrics]
      .sort((a, b) => b.totalBillableUSD - a.totalBillableUSD)
      .slice(0, 10);
  }, [calculateStaffMetrics]);

  const topAvailable = useMemo(() => {
    return [...calculateStaffMetrics]
      .sort((a, b) => b.availability - a.availability)
      .slice(0, 10);
  }, [calculateStaffMetrics]);

  const topUtilization = useMemo(() => {
    return [...calculateStaffMetrics]
      .sort((a, b) => b.utilizationScore - a.utilizationScore)
      .slice(0, 10);
  }, [calculateStaffMetrics]);

  const getPeriodLabel = () => {
    const periodName = filterPeriod === 'month' ? 'Month' : 
                      filterPeriod === 'quarter' ? 'Quarter' : 'Year';
    const timeName = filterValue === 'current' ? 'Current' :
                     filterValue === 'previous' ? 'Previous' : 'All Time';
    return `${timeName} ${filterValue === 'all' ? '' : periodName}`;
  };

  const LeaderboardCard = ({ 
    title, 
    data, 
    valueKey, 
    formatValue, 
    icon: Icon, 
    color 
  }: {
    title: string;
    data: typeof calculateStaffMetrics;
    valueKey: keyof typeof calculateStaffMetrics[0];
    formatValue: (value: number) => string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <div className="rounded-xl bg-white border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{getPeriodLabel()}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={item.staff.id} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              index === 0 ? 'bg-yellow-100 text-yellow-700' :
              index === 1 ? 'bg-gray-100 text-gray-700' :
              index === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-gray-50 text-gray-600'
            }`}>
              {index + 1}
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center text-white text-sm font-medium">
              {item.staff.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{item.staff.name}</div>
              <div className="text-sm text-gray-500 truncate">{item.staff.role}</div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatValue(item[valueKey] as number)}
              </div>
              {valueKey === 'totalBillableUSD' && (
                <div className="text-xs text-gray-500">
                  {item.projectCount} projects
                </div>
              )}
              {valueKey === 'availability' && (
                <div className="text-xs text-gray-500">
                  {formatPercentage(item.billableUtilization)} billable
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Deep insights into your projects and team performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>

          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value as FilterValue)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
          >
            <option value="current">Current</option>
            <option value="previous">Previous</option>
            <option value="all">All Time</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing data for {getPeriodLabel().toLowerCase()}
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LeaderboardCard
          title="Top Earners"
          data={topEarners}
          valueKey="totalBillableUSD"
          formatValue={(value) => formatCurrency(value)}
          icon={Trophy}
          color="bg-yellow-500"
        />

        <LeaderboardCard
          title="Most Available"
          data={topAvailable}
          valueKey="availability"
          formatValue={(value) => formatPercentage(value)}
          icon={Activity}
          color="bg-green-500"
        />

        <LeaderboardCard
          title="Top Performers"
          data={topUtilization}
          valueKey="utilizationScore"
          formatValue={(value) => `${Math.round(value)}%`}
          icon={Award}
          color="bg-[#3C89A9]"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(topEarners.reduce((sum, item) => sum + item.totalBillableUSD, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {topEarners.reduce((sum, item) => sum + item.totalHours, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculateStaffMetrics.filter(item => item.totalBillableUSD > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  calculateStaffMetrics.reduce((sum, item) => sum + item.averageHourlyRate, 0) / 
                  Math.max(1, calculateStaffMetrics.length)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billable Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topEarners.map((item) => (
                <tr key={item.staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center text-white text-sm font-medium">
                        {item.staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.staff.name}</div>
                        <div className="text-sm text-gray-500">{item.staff.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(item.totalBillableUSD)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{item.totalHours.toLocaleString()}h</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{formatCurrency(item.averageHourlyRate)}/hr</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{item.projectCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{formatPercentage(item.availability)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-[#3C89A9] rounded-full transition-all"
                          style={{ width: `${Math.min(100, item.utilizationScore)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{Math.round(item.utilizationScore)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}