'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Crown
} from 'lucide-react';
import { mockProjects, mockStaff } from '@/lib/mock-data';
import { formatCurrency, formatPercentage, getStatusColor, getPriorityColor } from '@/lib/utils';
import { format } from 'date-fns';
import { Project } from '@/lib/types';
import ProjectEditModal from '@/components/project-edit-modal';

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateProject = () => {
    setSelectedProject(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveProject = (projectData: Project) => {
    if (modalMode === 'create') {
      // Add new project
      setProjects([...projects, projectData]);
    } else {
      // Update existing project
      setProjects(projects.map(p => p.id === projectData.id ? projectData : p));
    }
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const getTeamLead = (project: Project) => {
    if (!project.teamLead) return null;
    return mockStaff.find(s => s.id === project.teamLead);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all your projects</p>
        </div>
        <button 
          onClick={handleCreateProject}
          className="flex items-center gap-2 rounded-lg bg-[#3C89A9] px-4 py-2 text-sm font-medium text-white hover:bg-[#2c6b87] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg px-3 py-2 text-sm ${
              viewMode === 'grid' 
                ? 'bg-gray-200 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg px-3 py-2 text-sm ${
              viewMode === 'list' 
                ? 'bg-gray-200 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{project.client}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900">{formatPercentage(project.progress)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3C89A9] transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {/* Team Lead */}
                {getTeamLead(project) && (
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">Lead: {getTeamLead(project)?.name}</span>
                  </div>
                )}
                
                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <div className="font-medium text-gray-900">{formatCurrency(project.budget)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Received:</span>
                      <div className="font-medium text-green-600">{formatCurrency(project.receivedAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Spent:</span>
                      <div className="font-medium text-red-600">{formatCurrency(project.spent)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit:</span>
                      <div className={`font-medium ${(project.receivedAmount - project.spent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(project.receivedAmount - project.spent)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{project.teamSize} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {format(new Date(project.startDate), 'MMM dd')} - {format(new Date(project.endDate), 'MMM dd')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                <button 
                  onClick={() => handleViewProject(project)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-[#3C89A9] px-3 py-1.5 text-sm font-medium text-[#3C89A9] hover:bg-[#3C89A9] hover:text-white transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button 
                  onClick={() => handleEditProject(project)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.client}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{project.teamSize}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{formatCurrency(project.budget)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(project.spent)} spent</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3C89A9]"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-900">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {format(new Date(project.endDate), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewProject(project)}
                        className="text-gray-400 hover:text-[#3C89A9]"
                        title="View Project"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProjectEditModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        mode={modalMode}
      />
    </div>
  );
}