'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Crown,
  Save
} from 'lucide-react';
import { Project, Staff, Assignment } from '@/lib/types';
import { mockStaff, mockAssignments } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

interface ProjectEditModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  mode: 'create' | 'edit' | 'view';
}

const initialProject: Omit<Project, 'id'> = {
  name: '',
  client: '',
  description: '',
  status: 'planning',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
  budget: 0,
  spent: 0,
  revenue: 0,
  receivedAmount: 0,
  teamSize: 0,
  techStack: [],
  priority: 'medium',
  progress: 0,
  projectManager: '',
  teamLead: '',
  staffAssigned: []
};

export default function ProjectEditModal({
  project,
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode
}: ProjectEditModalProps) {
  const [formData, setFormData] = useState<Project | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (project && mode !== 'create') {
        setFormData({ ...project });
        const projectAssignments = mockAssignments.filter(a => a.projectId === project.id);
        setAssignments(projectAssignments);
        
        // Get staff not assigned to this project
        const assignedStaffIds = projectAssignments.map(a => a.staffId);
        const available = mockStaff.filter(s => !assignedStaffIds.includes(s.id));
        setAvailableStaff(available);
      } else {
        // Create mode
        setFormData({ ...initialProject, id: `proj-${Date.now()}` } as Project);
        setAssignments([]);
        setAvailableStaff(mockStaff);
      }
    }
  }, [project, isOpen, mode]);

  const handleInputChange = (field: keyof Project, value: string | number) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const addStaffMember = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId);
    if (!staff || !formData) return;

    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      projectId: formData.id,
      staffId,
      role: staff.role,
      allocation: 50,
      startDate: formData.startDate,
      endDate: formData.endDate,
      billableHours: 84,
      hourlyRate: staff.clientRate,
      totalCost: 84 * staff.clientRate,
      isTeamLead: false
    };

    setAssignments([...assignments, newAssignment]);
    setAvailableStaff(availableStaff.filter(s => s.id !== staffId));
  };

  const removeStaffMember = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const staff = mockStaff.find(s => s.id === assignment.staffId);
    if (staff) {
      setAvailableStaff([...availableStaff, staff]);
    }

    setAssignments(assignments.filter(a => a.id !== assignmentId));
  };

  const updateAssignment = (assignmentId: string, field: keyof Assignment, value: string | number | boolean) => {
    setAssignments(assignments.map(a => {
      if (a.id === assignmentId) {
        const updated = { ...a, [field]: value };
        if (field === 'allocation' || field === 'billableHours' || field === 'hourlyRate') {
          updated.totalCost = updated.billableHours * updated.hourlyRate;
        }
        return updated;
      }
      return a;
    }));
  };

  const setTeamLead = (assignmentId: string) => {
    setAssignments(assignments.map(a => ({
      ...a,
      isTeamLead: a.id === assignmentId
    })));

    const leadAssignment = assignments.find(a => a.id === assignmentId);
    if (leadAssignment && formData) {
      setFormData({ ...formData, teamLead: leadAssignment.staffId });
    }
  };

  const calculateTotalCost = () => {
    return assignments.reduce((sum, a) => sum + a.totalCost, 0);
  };

  const handleSave = () => {
    if (!formData) return;
    
    const updatedProject = {
      ...formData,
      staffAssigned: assignments.map(a => a.staffId),
      teamSize: assignments.length,
      spent: calculateTotalCost()
    };

    onSave(updatedProject);
    onClose();
  };

  const handleDelete = () => {
    if (project && onDelete) {
      onDelete(project.id);
      onClose();
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create New Project' : 
               mode === 'view' ? 'Project Details' : 'Edit Project'}
            </h2>
            {!mode || mode !== 'create' ? (
              <p className="text-sm text-gray-500 mt-1">{formData?.client} • {formData?.status}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={mode === 'view'}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Received Amount
              </label>
              <input
                type="number"
                value={formData.receivedAmount}
                onChange={(e) => handleInputChange('receivedAmount', parseInt(e.target.value))}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={mode === 'view'}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Team Management */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Assignment</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total Cost: {formatCurrency(calculateTotalCost())}</span>
                <span>Team Size: {assignments.length}</span>
              </div>
            </div>

            {/* Current Team */}
            <div className="space-y-3 mb-6">
              {assignments.map((assignment) => {
                const staff = mockStaff.find(s => s.id === assignment.staffId);
                if (!staff) return null;

                return (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center text-white text-sm font-medium">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{staff.name}</span>
                            {assignment.isTeamLead && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{assignment.role}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStaffMember(assignment.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Role
                        </label>
                        <input
                          type="text"
                          value={assignment.role}
                          onChange={(e) => updateAssignment(assignment.id, 'role', e.target.value)}
                          disabled={mode === 'view'}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Allocation %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={assignment.allocation}
                          onChange={(e) => updateAssignment(assignment.id, 'allocation', parseInt(e.target.value))}
                          disabled={mode === 'view'}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Hours/Week
                        </label>
                        <input
                          type="number"
                          value={assignment.billableHours}
                          onChange={(e) => updateAssignment(assignment.id, 'billableHours', parseInt(e.target.value))}
                          disabled={mode === 'view'}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Rate/Hour
                        </label>
                        <input
                          type="number"
                          value={assignment.hourlyRate}
                          onChange={(e) => updateAssignment(assignment.id, 'hourlyRate', parseInt(e.target.value))}
                          disabled={mode === 'view'}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        Total Cost: {formatCurrency(assignment.totalCost)}
                      </div>
                      {mode !== 'view' && (
                        <div className="flex items-center gap-2">
                          {!assignment.isTeamLead && (
                            <button
                              onClick={() => setTeamLead(assignment.id)}
                              className="text-sm text-[#3C89A9] hover:text-[#2c6b87] font-medium"
                            >
                              Make Team Lead
                            </button>
                          )}
                          <button
                            onClick={() => removeStaffMember(assignment.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Staff */}
            {availableStaff.length > 0 && mode !== 'view' && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Team Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addStaffMember(staff.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{staff.name}</div>
                          <div className="text-xs text-gray-500 truncate">{staff.role}</div>
                        </div>
                        <Plus className="h-4 w-4 text-[#3C89A9]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {mode === 'edit' && project && onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'Close' : 'Cancel'}
            </button>
            {mode !== 'view' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#3C89A9] rounded-lg hover:bg-[#2c6b87] transition-colors"
              >
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Create Project' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}