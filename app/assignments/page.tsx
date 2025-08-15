'use client';

import { useState } from 'react';
import {
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Briefcase,
  Clock,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { mockProjects, mockStaff, mockAssignments } from '@/lib/mock-data';
import { formatPercentage, getStatusColor, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Assignment } from '@/lib/types';
import AssignmentModal from '@/components/assignment-modal';

export default function AssignmentsPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const getStaffById = (staffId: string) => mockStaff.find(s => s.id === staffId);
  const getProjectById = (projectId: string) => mockProjects.find(p => p.id === projectId);

  const activeProjects = mockProjects.filter(p => p.status === 'active' || p.status === 'planning');
  
  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = !showAvailableOnly || staff.availability > 0;
    return matchesSearch && matchesAvailability;
  });

  const getProjectAssignments = (projectId: string) => {
    return assignments.filter(a => a.projectId === projectId);
  };

  const getStaffAssignments = (staffId: string) => {
    return assignments.filter(a => a.staffId === staffId);
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveAssignment = (assignmentData: Assignment) => {
    if (modalMode === 'create') {
      setAssignments([...assignments, assignmentData]);
    } else {
      setAssignments(assignments.map(a => a.id === assignmentData.id ? assignmentData : a));
    }
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleAssignToProject = () => {
    if (selectedProject) {
      setSelectedAssignment(null);
      setModalMode('create');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage staff assignments to projects</p>
        </div>
        <button 
          onClick={() => handleCreateAssignment()}
          className="flex items-center gap-2 rounded-lg bg-[#3C89A9] px-4 py-2 text-sm font-medium text-white hover:bg-[#2c6b87] shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          New Assignment
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
            <div className="space-y-3">
              {activeProjects.map((project) => {
                const assignments = getProjectAssignments(project.id);
                const isSelected = selectedProject === project.id;
                
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#3C89A9] bg-[#3C89A9]/5' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{project.client}</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Team Size</p>
                        <p className="font-medium text-gray-900">{assignments.length}/{project.teamSize}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Progress</p>
                        <p className="font-medium text-gray-900">{formatPercentage(project.progress)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-medium text-gray-900">{format(new Date(project.endDate), 'MMM dd')}</p>
                      </div>
                    </div>

                    {isSelected && assignments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Team</p>
                        <div className="space-y-2">
                          {assignments.map((assignment) => {
                            const staff = getStaffById(assignment.staffId);
                            if (!staff) return null;
                            
                            return (
                              <div key={assignment.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      {staff.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-700">{staff.name}</span>
                                  <span className="text-xs text-gray-500">({assignment.role})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{assignment.allocation}%</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewAssignment(assignment);
                                      }}
                                      className="text-gray-400 hover:text-[#3C89A9]"
                                      title="View Assignment"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAssignment(assignment);
                                      }}
                                      className="text-gray-400 hover:text-gray-600"
                                      title="Edit Assignment"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAssignment(assignment.id);
                                      }}
                                      className="text-gray-400 hover:text-red-600"
                                      title="Delete Assignment"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Staff</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="rounded border-gray-300 text-[#3C89A9] focus:ring-[#3C89A9]"
                />
                <span className="text-gray-600">Available only</span>
              </label>
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredStaff.map((staff) => {
                const assignments = getStaffAssignments(staff.id);
                const canAssign = staff.availability > 0;
                
                return (
                  <div
                    key={staff.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{staff.name}</h3>
                          <p className="text-sm text-gray-500">{staff.role}</p>
                        </div>
                      </div>
                      {selectedProject && (
                        <button
                          onClick={() => handleAssignToProject()}
                          disabled={!canAssign}
                          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                            canAssign
                              ? 'bg-[#3C89A9] text-white hover:bg-[#2c6b87]'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Assign
                        </button>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {staff.availability === 0 ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : staff.availability < 50 ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-gray-600">{staff.availability}% available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{assignments.length} projects</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{staff.billableHours}h/week</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {staff.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {skill.name}
                          </span>
                        ))}
                        {staff.skills.length > 3 && (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            +{staff.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {assignments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Current Assignments</p>
                        <div className="space-y-1">
                          {assignments.map((assignment) => {
                            const project = getProjectById(assignment.projectId);
                            if (!project) return null;
                            
                            return (
                              <div key={assignment.id} className="flex items-center justify-between group">
                                <span className="text-sm text-gray-700 truncate">{project.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{assignment.allocation}%</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleViewAssignment(assignment)}
                                      className="text-gray-400 hover:text-[#3C89A9]"
                                      title="View Assignment"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleEditAssignment(assignment)}
                                      className="text-gray-400 hover:text-gray-600"
                                      title="Edit Assignment"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Staff Member</th>
                {activeProjects.map((project) => (
                  <th key={project.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[120px]">
                    <div className="truncate">{project.name}</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockStaff.map((staff) => {
                const staffAssignments = getStaffAssignments(staff.id);
                const totalAllocation = staffAssignments.reduce((sum, a) => sum + a.allocation, 0);
                
                return (
                  <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-500">{staff.role}</div>
                        </div>
                      </div>
                    </td>
                    {activeProjects.map((project) => {
                      const assignment = staffAssignments.find(a => a.projectId === project.id);
                      
                      return (
                        <td key={project.id} className="px-4 py-3 text-center">
                          {assignment ? (
                            <div className="group relative">
                              <button
                                onClick={() => handleViewAssignment(assignment)}
                                className="inline-flex rounded-full bg-[#3C89A9]/10 px-2 py-1 text-xs font-medium text-[#3C89A9] hover:bg-[#3C89A9]/20 transition-colors"
                              >
                                {assignment.allocation}%
                              </button>
                              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                {assignment.role}<br/>
                                {formatCurrency(assignment.totalCost)}/week
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        totalAllocation === 0 ? 'bg-green-100 text-green-700' :
                        totalAllocation < 100 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {totalAllocation}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        assignment={selectedAssignment}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveAssignment}
        onDelete={handleDeleteAssignment}
        mode={modalMode}
        preselectedProject={selectedProject || undefined}
      />
    </div>
  );
}