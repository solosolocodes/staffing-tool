'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  FolderKanban,
  DollarSign,
  Activity
} from 'lucide-react';
import MetricCard from '@/components/metric-card';
import { mockProjects, mockStaff } from '@/lib/mock-data';
import { formatCurrency, formatPercentage, getPriorityColor } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState(2024);

  const metrics = useMemo(() => {
    const totalProjects = mockProjects.length;
    const activeProjects = mockProjects.filter(p => p.status === 'active').length;
    const totalStaff = mockStaff.length;
    const availableStaff = mockStaff.filter(s => s.status === 'available').length;
    
    // Calculate totals from actual project data
    const totalRevenue = mockProjects.reduce((sum, p) => sum + p.revenue, 0);
    const totalReceived = mockProjects.reduce((sum, p) => sum + p.receivedAmount, 0);
    const totalSpent = mockProjects.reduce((sum, p) => sum + p.spent, 0);
    const totalProfit = totalReceived - totalSpent;
    
    // Calculate utilization from staff data
    const averageUtilization = mockStaff.reduce((sum, s) => sum + (100 - s.availability), 0) / totalStaff;
    const averageBillableUtilization = mockStaff.reduce((sum, s) => sum + s.billableUtilization, 0) / totalStaff;
    
    // Projects at risk based on progress and priority
    const projectsAtRisk = mockProjects.filter(p => p.progress < 50 && (p.priority === 'high' || p.priority === 'critical')).length;

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
      projectsAtRisk
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

  // Generate year-based financial data with Jan-Dec layout and projections
  const financialData = useMemo(() => {
    const yearData: Record<number, Array<{period: string; received: number; spent: number; profit: number; isProjection: boolean}>> = {
      2024: [
        // Q1 2024 - Healthcare + E-commerce starting
        { period: 'Jan', received: 180000, spent: 140000, profit: 40000, isProjection: false },
        { period: 'Feb', received: 220000, spent: 170000, profit: 50000, isProjection: false },
        { period: 'Mar', received: 280000, spent: 210000, profit: 70000, isProjection: false },
        // Q2 2024 - All projects active, peak activity
        { period: 'Apr', received: 350000, spent: 265000, profit: 85000, isProjection: false },
        { period: 'May', received: 420000, spent: 315000, profit: 105000, isProjection: false },
        { period: 'Jun', received: 450000, spent: 340000, profit: 110000, isProjection: false },
        // Q3 2024 - Some projects completing
        { period: 'Jul', received: 380000, spent: 285000, profit: 95000, isProjection: false },
        { period: 'Aug', received: 360000, spent: 270000, profit: 90000, isProjection: false },
        { period: 'Sep', received: 320000, spent: 240000, profit: 80000, isProjection: false },
        // Q4 2024 - Project completions, new ones starting
        { period: 'Oct', received: 290000, spent: 220000, profit: 70000, isProjection: false },
        { period: 'Nov', received: 350000, spent: 260000, profit: 90000, isProjection: true },
        { period: 'Dec', received: 420000, spent: 310000, profit: 110000, isProjection: true },
      ],
      2025: [
        // 2025 - Major projects: VW, Commerzbank, BASF, Allianz
        { period: 'Jan', received: 480000, spent: 360000, profit: 120000, isProjection: false },
        { period: 'Feb', received: 520000, spent: 390000, profit: 130000, isProjection: false },
        { period: 'Mar', received: 580000, spent: 435000, profit: 145000, isProjection: false },
        { period: 'Apr', received: 620000, spent: 465000, profit: 155000, isProjection: false },
        { period: 'May', received: 680000, spent: 510000, profit: 170000, isProjection: false },
        { period: 'Jun', received: 720000, spent: 540000, profit: 180000, isProjection: false },
        { period: 'Jul', received: 690000, spent: 520000, profit: 170000, isProjection: false },
        { period: 'Aug', received: 650000, spent: 490000, profit: 160000, isProjection: false },
        { period: 'Sep', received: 620000, spent: 465000, profit: 155000, isProjection: false },
        { period: 'Oct', received: 580000, spent: 435000, profit: 145000, isProjection: true },
        { period: 'Nov', received: 550000, spent: 415000, profit: 135000, isProjection: true },
        { period: 'Dec', received: 520000, spent: 390000, profit: 130000, isProjection: true },
      ],
      2026: [
        // 2026 - Allianz continues, Metro starts, some projects ending
        { period: 'Jan', received: 480000, spent: 360000, profit: 120000, isProjection: false },
        { period: 'Feb', received: 450000, spent: 340000, profit: 110000, isProjection: false },
        { period: 'Mar', received: 420000, spent: 315000, profit: 105000, isProjection: true },
        { period: 'Apr', received: 390000, spent: 295000, profit: 95000, isProjection: true },
        { period: 'May', received: 360000, spent: 270000, profit: 90000, isProjection: true },
        { period: 'Jun', received: 330000, spent: 250000, profit: 80000, isProjection: true },
        { period: 'Jul', received: 300000, spent: 225000, profit: 75000, isProjection: true },
        { period: 'Aug', received: 280000, spent: 210000, profit: 70000, isProjection: true },
        { period: 'Sep', received: 260000, spent: 195000, profit: 65000, isProjection: true },
        { period: 'Oct', received: 240000, spent: 180000, profit: 60000, isProjection: true },
        { period: 'Nov', received: 220000, spent: 165000, profit: 55000, isProjection: true },
        { period: 'Dec', received: 200000, spent: 150000, profit: 50000, isProjection: true },
      ]
    };

    return yearData[selectedYear] || [];
  }, [selectedYear]);

  // Process data to create separate series for actual and projected values
  const chartData = useMemo(() => {
    return financialData.map((item) => ({
      period: item.period,
      // Actual values (solid lines)
      received: !item.isProjection ? item.received : null,
      spent: !item.isProjection ? item.spent : null,
      profit: !item.isProjection ? item.profit : null,
      // Projected values (dotted lines)
      receivedProjected: item.isProjection ? item.received : null,
      spentProjected: item.isProjection ? item.spent : null,
      profitProjected: item.isProjection ? item.profit : null,
    }));
  }, [financialData]);


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
            <h2 className="text-lg font-semibold text-gray-900">Financial Performance</h2>
            <div className="flex items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
              <div className="text-sm text-gray-500">
                Solid: Actual • Dotted: Projections
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `€${value/1000}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)} 
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend />
              {/* Actual Data - Solid Lines */}
              <Line 
                type="monotone" 
                dataKey="received" 
                stroke="#3C89A9" 
                strokeWidth={2} 
                name="Client Paid"
                connectNulls={true}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="spent" 
                stroke="#DC2626" 
                strokeWidth={2} 
                name="Staffing Costs"
                connectNulls={true}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={2} 
                name="Gross Profit"
                connectNulls={true}
                dot={false}
              />
              {/* Projected Data - Dashed Lines */}
              <Line 
                type="monotone" 
                dataKey="receivedProjected" 
                stroke="#3C89A9" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                connectNulls={true}
                dot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="spentProjected" 
                stroke="#DC2626" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                connectNulls={true}
                dot={false}
                legendType="none"
              />
              <Line 
                type="monotone" 
                dataKey="profitProjected" 
                stroke="#10B981" 
                strokeWidth={2} 
                strokeDasharray="8 4"
                connectNulls={true}
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