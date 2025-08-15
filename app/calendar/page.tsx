'use client';

import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Users,
  Filter
} from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';
import { format, startOfYear, endOfYear, eachWeekOfInterval, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { Project } from '@/lib/types';

export default function CalendarPage() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const availableYears = [2024, 2025, 2026];

  // Generate weeks for the selected year
  const weeks = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
    return eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 }); // Monday start
  }, [selectedYear]);

  // Filter projects based on status
  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      if (statusFilter === 'all') return true;
      return project.status === statusFilter;
    });
  }, [statusFilter]);

  // Calculate project position and width for each week
  const getProjectWeeks = (project: Project) => {
    const projectStart = parseISO(project.startDate);
    const projectEnd = parseISO(project.endDate);
    
    const projectWeeks = weeks.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      // Check if project overlaps with this week
      const overlaps = isWithinInterval(projectStart, { start: weekStart, end: weekEnd }) ||
                     isWithinInterval(projectEnd, { start: weekStart, end: weekEnd }) ||
                     isWithinInterval(weekStart, { start: projectStart, end: projectEnd });
      
      return {
        weekIndex: index,
        weekStart,
        weekEnd,
        overlaps,
        isStart: isWithinInterval(projectStart, { start: weekStart, end: weekEnd }),
        isEnd: isWithinInterval(projectEnd, { start: weekStart, end: weekEnd })
      };
    });

    return projectWeeks;
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">View project timelines and team schedules</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
            >
              <option value="all">All Projects</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {filteredProjects.length} projects • {weeks.length} weeks
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        {/* Header with months */}
        <div className="border-b border-gray-200 p-4">
          <div className="grid grid-cols-12 gap-1 text-xs font-medium text-gray-500 mb-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="text-center">
                {format(new Date(selectedYear, i, 1), 'MMM')}
              </div>
            ))}
          </div>
          
          {/* Week grid header */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `200px repeat(${weeks.length}, 1fr)` }}>
            <div className="text-sm font-medium text-gray-700">Project</div>
            {weeks.map((week, index) => (
              <div 
                key={index} 
                className="text-xs text-center text-gray-500 min-w-[12px]"
                title={`Week ${index + 1}: ${format(week, 'MMM dd')}`}
              >
                {index % 4 === 0 ? format(week, 'dd') : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="divide-y divide-gray-100">
          {filteredProjects.map((project) => {
            const projectWeeks = getProjectWeeks(project);
            const activeWeeks = projectWeeks.filter(w => w.overlaps);
            
            return (
              <div key={project.id} className="p-2 hover:bg-gray-50">
                <div className="grid gap-1 items-center" style={{ gridTemplateColumns: `200px repeat(${weeks.length}, 1fr)` }}>
                  {/* Project Info */}
                  <div className="flex items-center gap-2 pr-4">
                    <button
                      onClick={() => handleProjectClick(project)}
                      className="flex-1 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-medium text-sm text-gray-900 group-hover:text-[#3C89A9] truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{project.client}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users className="h-3 w-3" />
                        {project.teamSize}
                      </div>
                    </button>
                  </div>

                  {/* Timeline Bars */}
                  {weeks.map((week, weekIndex) => {
                    const weekData = projectWeeks[weekIndex];
                    
                    if (!weekData.overlaps) {
                      return <div key={weekIndex} className="h-6"></div>;
                    }

                    const isFirst = activeWeeks[0]?.weekIndex === weekIndex;
                    const isLast = activeWeeks[activeWeeks.length - 1]?.weekIndex === weekIndex;
                    
                    return (
                      <div 
                        key={weekIndex} 
                        className="h-6 flex items-center"
                        title={`${project.name} - Week ${weekIndex + 1}`}
                      >
                        <div 
                          className={`h-4 w-full relative group cursor-pointer transition-all hover:h-5 ${
                            project.status === 'active' ? 'bg-[#3C89A9]' :
                            project.status === 'planning' ? 'bg-yellow-500' :
                            project.status === 'on-hold' ? 'bg-gray-400' :
                            'bg-green-500'
                          } ${
                            isFirst && isLast ? 'rounded-md' :
                            isFirst ? 'rounded-l-md' :
                            isLast ? 'rounded-r-md' : ''
                          }`}
                        >
                          {/* Team size indicator */}
                          {isFirst && (
                            <div className="absolute left-1 top-0 bottom-0 flex items-center">
                              <span className="text-xs font-bold text-white">
                                {project.teamSize}
                              </span>
                            </div>
                          )}
                          
                          {/* Progress indicator */}
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                          
                          {/* Hover tooltip */}
                          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                            {project.name}<br/>
                            {project.teamSize} people • {project.progress}%<br/>
                            {formatCurrency(project.budget)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#3C89A9] rounded"></div>
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Planning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>On Hold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="text-gray-500">
          • Numbers show team size • Progress bar at bottom
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedProject.client}</p>
              </div>
              <button
                onClick={closeProjectModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedProject.status)} mt-1`}>
                    {selectedProject.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`text-sm font-medium ${getPriorityColor(selectedProject.priority)} mt-1`}>
                    {selectedProject.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timeline</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {format(parseISO(selectedProject.startDate), 'MMM dd, yyyy')} - {format(parseISO(selectedProject.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Size</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedProject.teamSize} members</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Progress</label>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-[#3C89A9] rounded-full transition-all"
                          style={{ width: `${selectedProject.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{selectedProject.progress}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Budget</label>
                  <p className="text-sm text-gray-900 mt-1">{formatCurrency(selectedProject.budget)}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Financial Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Client Budget:</span>
                    <div className="font-medium text-gray-900">{formatCurrency(selectedProject.budget)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Client Paid:</span>
                    <div className="font-medium text-green-600">{formatCurrency(selectedProject.receivedAmount)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Staffing Costs:</span>
                    <div className="font-medium text-red-600">{formatCurrency(selectedProject.spent)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Gross Profit:</span>
                    <div className={`font-medium ${(selectedProject.receivedAmount - selectedProject.spent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedProject.receivedAmount - selectedProject.spent)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeProjectModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}