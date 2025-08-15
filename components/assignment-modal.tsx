'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  Percent
} from 'lucide-react';
import { Assignment } from '@/lib/types';
import { mockProjects, mockStaff } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

interface AssignmentModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Assignment) => void;
  onDelete?: (assignmentId: string) => void;
  mode: 'create' | 'edit' | 'view';
  preselectedProject?: string;
  preselectedStaff?: string;
}

const initialAssignment: Omit<Assignment, 'id'> = {
  projectId: '',
  staffId: '',
  role: '',
  allocation: 50,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  billableHours: 20,
  hourlyRate: 0,
  totalCost: 0,
  isTeamLead: false
};

export default function AssignmentModal({
  assignment,
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode,
  preselectedProject,
  preselectedStaff
}: AssignmentModalProps) {
  const [formData, setFormData] = useState<Assignment | Omit<Assignment, 'id'>>(initialAssignment);

  useEffect(() => {
    if (isOpen) {
      if (assignment && mode !== 'create') {
        setFormData(assignment);
      } else {
        const newAssignment = { 
          ...initialAssignment, 
          id: `assign-${Date.now()}`,
          projectId: preselectedProject || '',
          staffId: preselectedStaff || ''
        };
        
        // Set default hourly rate from staff data
        if (preselectedStaff) {
          const staff = mockStaff.find(s => s.id === preselectedStaff);
          if (staff) {
            newAssignment.hourlyRate = staff.clientRate;
            newAssignment.role = staff.role;
          }
        }
        
        setFormData(newAssignment as Assignment);
      }
    }
  }, [assignment, isOpen, mode, preselectedProject, preselectedStaff]);

  const handleInputChange = (field: keyof Assignment, value: string | number | boolean) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-calculate total cost when relevant fields change
    if (field === 'billableHours' || field === 'hourlyRate') {
      updatedData.totalCost = (updatedData.billableHours || 0) * (updatedData.hourlyRate || 0);
    }
    
    // Update hourly rate when staff changes
    if (field === 'staffId') {
      const staff = mockStaff.find(s => s.id === value);
      if (staff) {
        updatedData.hourlyRate = staff.clientRate;
        updatedData.role = staff.role;
        updatedData.totalCost = (updatedData.billableHours || 0) * staff.clientRate;
      }
    }
    
    setFormData(updatedData);
  };

  const handleSave = () => {
    if (!formData) return;
    
    const finalData = {
      ...formData,
      totalCost: (formData.billableHours || 0) * (formData.hourlyRate || 0)
    };
    
    onSave(finalData as Assignment);
    onClose();
  };

  const handleDelete = () => {
    if (assignment && onDelete) {
      onDelete(assignment.id);
      onClose();
    }
  };

  if (!isOpen || !formData) return null;

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  const selectedProject = mockProjects.find(p => p.id === formData.projectId);
  const selectedStaff = mockStaff.find(s => s.id === formData.staffId);
  const availableProjects = mockProjects.filter(p => p.status === 'active' || p.status === 'planning');
  const availableStaff = mockStaff.filter(s => s.availability > 0 || s.id === formData.staffId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreateMode ? 'Create Assignment' : 
                 isViewMode ? 'Assignment Details' : 'Edit Assignment'}
              </h2>
              {!isCreateMode && selectedProject && selectedStaff && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedStaff.name} → {selectedProject.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project and Staff Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Project</option>
                {availableProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.client})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Staff Member
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => handleInputChange('staffId', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Staff</option>
                {availableStaff.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role}) - {staff.availability}% available
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role and Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role in Project
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isViewMode}
                placeholder="e.g., Frontend Developer, QA Engineer"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Percent className="h-4 w-4 inline mr-1" />
                Allocation %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.allocation}
                onChange={(e) => handleInputChange('allocation', parseInt(e.target.value) || 0)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Billable Hours/Week
              </label>
              <input
                type="number"
                min="0"
                value={formData.billableHours}
                onChange={(e) => handleInputChange('billableHours', parseInt(e.target.value) || 0)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Hourly Rate ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Cost/Week
              </label>
              <div className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-900 font-medium">
                {formatCurrency((formData.billableHours || 0) * (formData.hourlyRate || 0))}
              </div>
            </div>
          </div>

          {/* Team Lead Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="teamLead"
              checked={formData.isTeamLead || false}
              onChange={(e) => handleInputChange('isTeamLead', e.target.checked)}
              disabled={isViewMode}
              className="rounded border-gray-300 text-[#3C89A9] focus:ring-[#3C89A9] disabled:opacity-50"
            />
            <label htmlFor="teamLead" className="text-sm font-medium text-gray-700">
              Team Lead for this project
            </label>
          </div>

          {/* Summary Information */}
          {selectedProject && selectedStaff && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Assignment Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Project:</span>
                  <div className="font-medium text-gray-900">{selectedProject.name}</div>
                </div>
                <div>
                  <span className="text-gray-500">Staff Member:</span>
                  <div className="font-medium text-gray-900">{selectedStaff.name}</div>
                </div>
                <div>
                  <span className="text-gray-500">Weekly Cost:</span>
                  <div className="font-medium text-green-600">
                    {formatCurrency((formData.billableHours || 0) * (formData.hourlyRate || 0))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Staff Availability:</span>
                  <div className="font-medium text-gray-900">{selectedStaff.availability}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {mode === 'edit' && assignment && onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Assignment
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button
                onClick={handleSave}
                disabled={!formData.projectId || !formData.staffId}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#3C89A9] rounded-lg hover:bg-[#2c6b87] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {isCreateMode ? 'Create Assignment' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}