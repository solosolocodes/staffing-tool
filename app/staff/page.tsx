'use client';

import { useState } from 'react';
import {
  Search,
  MapPin,
  MoreVertical,
  Mail,
  Briefcase,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Phone,
  TrendingUp,
  Activity
} from 'lucide-react';
import { mockStaff, mockProjects } from '@/lib/mock-data';
import { getStatusColor, formatCurrency } from '@/lib/utils';
import { Staff } from '@/lib/types';
import StaffCrudModal from '@/components/staff-crud-modal';

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  const departments = Array.from(new Set(mockStaff.map(s => s.department)));

  const filteredStaff = staff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.skills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || staffMember.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || staffMember.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getProjectNames = (projectIds: string[]) => {
    return projectIds.map(id => {
      const project = mockProjects.find(p => p.id === id);
      return project?.name || '';
    }).filter(Boolean);
  };

  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleViewStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveStaff = (staffData: Staff) => {
    if (modalMode === 'create') {
      setStaff([...staff, staffData]);
    } else {
      setStaff(staff.map(s => s.id === staffData.id ? staffData : s));
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(staff.filter(s => s.id !== staffId));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your team members and their availability</p>
        </div>
        <button 
          onClick={handleCreateStaff}
          className="flex items-center gap-2 rounded-lg bg-[#3C89A9] px-4 py-2 text-sm font-medium text-white hover:bg-[#2c6b87] shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff Member
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, or skills..."
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
            <option value="available">Available</option>
            <option value="partially-booked">Partially Booked</option>
            <option value="fully-booked">Fully Booked</option>
            <option value="on-leave">On Leave</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStaff.map((staffMember) => (
            <div key={staffMember.id} className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center text-white font-medium cursor-pointer"
                       onClick={() => handleViewStaff(staffMember)}>
                    {staffMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-[#3C89A9]" 
                        onClick={() => handleViewStaff(staffMember)}>
                      {staffMember.name}
                    </h3>
                    <p className="text-sm text-gray-500">{staffMember.role}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(staffMember.status)}`}>
                    {staffMember.status.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">{staffMember.employmentType}</span>
                </div>

                {/* Availability Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Availability
                    </span>
                    <span className="font-medium text-gray-900">{staffMember.availability}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        staffMember.availability === 0 ? 'bg-red-500' :
                        staffMember.availability < 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${staffMember.availability}%` }}
                    />
                  </div>
                </div>

                {/* Billability Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Billability
                    </span>
                    <span className="font-medium text-gray-900">{staffMember.billableUtilization}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3C89A9] transition-all"
                      style={{ width: `${staffMember.billableUtilization}%` }}
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Client Rate:</span>
                      <div className="font-medium text-green-600">{formatCurrency(staffMember.clientRate)}/hr</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Internal:</span>
                      <div className="font-medium text-gray-600">{formatCurrency(staffMember.internalRate)}/hr</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Profit:</span>
                      <div className={`font-medium ${(staffMember.clientRate - staffMember.internalRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(staffMember.clientRate - staffMember.internalRate)}/hr
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Margin:</span>
                      <div className={`font-medium ${((staffMember.clientRate - staffMember.internalRate) / staffMember.clientRate * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {staffMember.clientRate > 0 ? ((staffMember.clientRate - staffMember.internalRate) / staffMember.clientRate * 100).toFixed(0) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span>{staffMember.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{staffMember.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{staffMember.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{staffMember.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-1">
                  {staffMember.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      {skill.name}
                    </span>
                  ))}
                  {staffMember.skills.length > 3 && (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                      +{staffMember.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Current Projects</p>
                {staffMember.currentProjects.length > 0 ? (
                  <div className="space-y-1">
                    {getProjectNames(staffMember.currentProjects).slice(0, 2).map((name, idx) => (
                      <p key={idx} className="text-sm text-gray-700 truncate">{name}</p>
                    ))}
                    {staffMember.currentProjects.length > 2 && (
                      <p className="text-xs text-gray-500">+{staffMember.currentProjects.length - 2} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active projects</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button
                  onClick={() => handleViewStaff(staffMember)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-[#3C89A9] border border-[#3C89A9] rounded-lg hover:bg-[#3C89A9] hover:text-white transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={() => handleEditStaff(staffMember)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-3 w-3" />
                  Edit
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
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Billability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{staff.department}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(staff.status)}`}>
                      {staff.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                staff.availability === 0 ? 'bg-red-500' :
                                staff.availability < 50 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${staff.availability}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">{staff.availability}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#3C89A9]"
                              style={{ width: `${staff.billableUtilization}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">{staff.billableUtilization}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Client:</span>
                        <span className="font-medium text-green-600">{formatCurrency(staff.clientRate)}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Internal:</span>
                        <span className="font-medium text-gray-600">{formatCurrency(staff.internalRate)}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Margin:</span>
                        <span className={`font-medium ${((staff.clientRate - staff.internalRate) / staff.clientRate * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {staff.clientRate > 0 ? ((staff.clientRate - staff.internalRate) / staff.clientRate * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {staff.skills.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          {skill.name}
                        </span>
                      ))}
                      {staff.skills.length > 2 && (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          +{staff.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{staff.currentProjects.length} active</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewStaff(staff)}
                        className="text-gray-400 hover:text-[#3C89A9]"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditStaff(staff)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit Staff"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Staff"
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

      {/* Staff CRUD Modal */}
      <StaffCrudModal
        staff={selectedStaff}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveStaff}
        onDelete={handleDeleteStaff}
        mode={modalMode}
      />
    </div>
  );
}