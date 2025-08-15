'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  FolderKanban,
  DollarSign,
  Activity,
  Filter
} from 'lucide-react';
import MetricCard from '@/components/metric-card';
import { mockProjects, mockStaff } from '@/lib/mock-data';
import { formatCurrency, formatPercentage, getPriorityColor } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type FilterPeriod = 'month' | 'quarter' | 'year';

export default function DashboardPage() {
  const [financialFilterPeriod, setFinancialFilterPeriod] = useState<FilterPeriod>('month');

  const metrics = useMemo(() => {
    const totalProjects = mockProjects.length;
    const activeProjects = mockProjects.filter(p => p.status === 'active').length;
    const totalStaff = mockStaff.length;
    const availableStaff = mockStaff.filter(s => s.status === 'available').length;
    const totalRevenue = mockProjects.reduce((sum, p) => sum + p.revenue, 0);
    const totalReceived = mockProjects.reduce((sum, p) => sum + p.receivedAmount, 0);
    const totalSpent = mockProjects.reduce((sum, p) => sum + p.spent, 0);
    const totalProfit = totalReceived - totalSpent;
    const averageUtilization = mockStaff.reduce((sum, s) => sum + (100 - s.availability), 0) / totalStaff;
    const averageBillableUtilization = mockStaff.reduce((sum, s) => sum + s.billableUtilization, 0) / totalStaff;
    const projectsAtRisk = mockProjects.filter(p => p.progress < 50 && (p.priority === 'high' || p.priority === 'critical')).length;
    
    // Calculate staff financial metrics
    const totalStaffProfit = mockStaff.reduce((sum, s) => sum + (s.clientRate - s.internalRate), 0);
    const averageStaffMargin = mockStaff.reduce((sum, s) => {
      const margin = s.clientRate > 0 ? ((s.clientRate - s.internalRate) / s.clientRate) * 100 : 0;
      return sum + margin;
    }, 0) / totalStaff;

    return {
      totalProjects,
      activeProjects,
      totalStaff,
      availableStaff,
      totalRevenue,
      totalReceived,
      totalSpent,
      totalProfit,
      averageUtilization,
      averageBillableUtilization,
      projectsAtRisk,
      totalStaffProfit,
      averageStaffMargin
    };
  }, []);

  const utilizationData = [
    { month: 'Jan', utilization: 72, billable: 65 },
    { month: 'Feb', utilization: 78, billable: 70 },
    { month: 'Mar', utilization: 85, billable: 75 },
    { month: 'Apr', utilization: 82, billable: 72 },
    { month: 'May', utilization: 88, billable: 78 },
    { month: 'Jun', utilization: 76, billable: 68 },
  ];

  const departmentData = [
    { name: 'Engineering', value: 45, color: '#3C89A9' },
    { name: 'Design', value: 15, color: '#4a90b8' },
    { name: 'QA', value: 12, color: '#5ba0c4' },
    { name: 'Product', value: 18, color: '#2c6b87' },
    { name: 'Infrastructure', value: 10, color: '#1e5468' },
  ];

  // Generate dynamic financial data based on filter selection
  const financialData = useMemo(() => {
    const baseData = {
      year: [
        { period: '2022', received: 2850000, spent: 2200000, profit: 650000, isProjection: false },
        { period: '2023', received: 3400000, spent: 2600000, profit: 800000, isProjection: false },
        { period: '2024', received: 4200000, spent: 3100000, profit: 1100000, isProjection: false },
        // Projections
        { period: '2025', received: 4850000, spent: 3550000, profit: 1300000, isProjection: true },
        { period: '2026', received: 5500000, spent: 4000000, profit: 1500000, isProjection: true },
      ],
      quarter: [
        { period: 'Q1 2024', received: 950000, spent: 720000, profit: 230000, isProjection: false },
        { period: 'Q2 2024', received: 1100000, spent: 850000, profit: 250000, isProjection: false },
        { period: 'Q3 2024', received: 1200000, spent: 900000, profit: 300000, isProjection: false },
        { period: 'Q4 2024', received: 950000, spent: 630000, profit: 320000, isProjection: false },
        // Projections
        { period: 'Q1 2025', received: 1150000, spent: 820000, profit: 330000, isProjection: true },
        { period: 'Q2 2025', received: 1250000, spent: 900000, profit: 350000, isProjection: true },
      ],
      month: [
        { period: 'Jan', received: 270000, spent: 210000, profit: 60000, isProjection: false },
        { period: 'Feb', received: 320000, spent: 245000, profit: 75000, isProjection: false },
        { period: 'Mar', received: 355000, spent: 260000, profit: 95000, isProjection: false },
        { period: 'Apr', received: 380000, spent: 285000, profit: 95000, isProjection: false },
        { period: 'May', received: 430000, spent: 320000, profit: 110000, isProjection: false },
        { period: 'Jun', received: 405000, spent: 305000, profit: 100000, isProjection: false },
        { period: 'Jul', received: 395000, spent: 290000, profit: 105000, isProjection: false },
        { period: 'Aug', received: 420000, spent: 315000, profit: 105000, isProjection: false },
        // Projections for next 6 months
        { period: 'Sep', received: 445000, spent: 330000, profit: 115000, isProjection: true },
        { period: 'Oct', received: 465000, spent: 345000, profit: 120000, isProjection: true },
        { period: 'Nov', received: 485000, spent: 360000, profit: 125000, isProjection: true },
        { period: 'Dec', received: 520000, spent: 380000, profit: 140000, isProjection: true },
        { period: 'Jan 2025', received: 550000, spent: 400000, profit: 150000, isProjection: true },
        { period: 'Feb 2025', received: 575000, spent: 420000, profit: 155000, isProjection: true },
      ]
    };

    return baseData[financialFilterPeriod] || baseData.month;
  }, [financialFilterPeriod]);

  // Split data into historical and projection for different line styles
  const historicalData = financialData.filter(d => !d.isProjection);
  const projectionData = financialData.filter(d => d.isProjection);
  // Add the last historical point to projection data to connect the lines
  const connectedProjectionData = historicalData.length > 0 ? 
    [historicalData[historicalData.length - 1], ...projectionData] : projectionData;

  const getFinancialPeriodLabel = () => {
    const periodName = financialFilterPeriod === 'month' ? 'Monthly' : 
                      financialFilterPeriod === 'quarter' ? 'Quarterly' : 'Annual';
    return `${periodName} Financial Performance`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your staffing and project metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Projects"
          value={`${metrics.activeProjects}/${metrics.totalProjects}`}
          icon={FolderKanban}
          trend={{ value: 12, isPositive: true }}
          description="Currently in progress"
        />
        <MetricCard
          title="Total Staff"
          value={metrics.totalStaff}
          icon={Users}
          description={`${metrics.availableStaff} available`}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Billable Utilization"
          value={formatPercentage(metrics.averageBillableUtilization)}
          icon={Activity}
          trend={{ value: 12, isPositive: true }}
          description="Average billable time"
        />
        <MetricCard
          title="Gross Profit"
          value={formatCurrency(metrics.totalProfit)}
          icon={DollarSign}
          trend={{ value: 18, isPositive: metrics.totalProfit > 0 }}
          description={`${formatCurrency(metrics.totalReceived)} paid - ${formatCurrency(metrics.totalSpent)} staffing costs`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{getFinancialPeriodLabel()}</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={financialFilterPeriod}
                onChange={(e) => setFinancialFilterPeriod(e.target.value as FilterPeriod)}
                className="text-sm rounded-md border border-gray-300 px-2 py-1 focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
              >
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
                <option value="year">Annual</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `€${value/1000}k`} />
              <Tooltip 
                formatter={(value: number, name: string, entry: { payload?: { isProjection?: boolean } }) => [
                  formatCurrency(value), 
                  `${name}${entry.payload?.isProjection ? ' (Projected)' : ''}`
                ]} 
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend />
              {/* Historical Data - Solid Lines */}
              <Line 
                type="monotone" 
                dataKey="received" 
                stroke="#3C89A9" 
                strokeWidth={2} 
                name="Client Paid"
                data={historicalData}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="spent" 
                stroke="#2c6b87" 
                strokeWidth={2} 
                name="Staffing Costs"
                data={historicalData}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={2} 
                name="Gross Profit"
                data={historicalData}
                connectNulls={false}
              />
              {/* Projected Data - Dashed Lines */}
              <Line 
                type="monotone" 
                dataKey="received" 
                stroke="#3C89A9" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                name="Projected Paid"
                data={connectedProjectionData}
                connectNulls={false}
                dot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="spent" 
                stroke="#2c6b87" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                name="Projected Costs"
                data={connectedProjectionData}
                connectNulls={false}
                dot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                name="Projected Profit"
                data={connectedProjectionData}
                connectNulls={false}
                dot={false}
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#3C89A9]"></div>
              <span>Historical Data</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#3C89A9] border-dashed border-t border-[#3C89A9]" style={{borderStyle: 'dashed'}}></div>
              <span>Projections</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {mockProjects
              .filter(p => p.status === 'active')
              .slice(0, 5)
              .map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">{project.client}</p>
                      {project.teamLead && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            Lead: {mockStaff.find(s => s.id === project.teamLead)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{project.teamSize} members</p>
                      <p className="text-xs text-gray-500">{formatPercentage(project.progress)} complete</p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3C89A9] transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Staff</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {mockStaff
              .filter(s => s.status === 'available' || s.availability > 50)
              .slice(0, 6)
              .map((staff) => (
                <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{staff.availability}%</p>
                    <p className="text-xs text-gray-500">available</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilization & Billability Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Bar dataKey="utilization" fill="#3C89A9" radius={[4, 4, 0, 0]} name="Utilization" />
            <Bar dataKey="billable" fill="#2c6b87" radius={[4, 4, 0, 0]} name="Billable" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}