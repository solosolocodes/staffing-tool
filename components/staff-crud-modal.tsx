'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  Plus,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Clock,
  Star,
  Languages,
  Code,
  Briefcase
} from 'lucide-react';
import { Staff, Skill, SkillLevel } from '@/lib/types';

interface StaffCrudModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff) => void;
  onDelete?: (staffId: string) => void;
  mode: 'create' | 'edit' | 'view';
}

const initialStaff: Omit<Staff, 'id'> = {
  name: '',
  email: '',
  role: '',
  department: 'Engineering',
  status: 'available',
  availability: 100,
  billableHours: 0,
  totalHours: 168,
  billableUtilization: 0,
  skills: [],
  languages: [],
  programmingLanguages: [],
  experience: 0,
  internalRate: 50,
  clientRate: 100,
  currentProjects: [],
  location: '',
  timezone: 'EST',
  phone: '',
  startDate: new Date().toISOString().split('T')[0],
  employmentType: 'full-time'
};

export default function StaffCrudModal({
  staff,
  isOpen,
  onClose,
  onSave,
  onDelete,
  mode
}: StaffCrudModalProps) {
  const [formData, setFormData] = useState<Staff | Omit<Staff, 'id'>>(initialStaff);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'junior' as SkillLevel, yearsOfExperience: 0 });
  const [newLanguage, setNewLanguage] = useState('');
  const [newProgLanguage, setNewProgLanguage] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (staff && mode !== 'create') {
        setFormData(staff);
      } else {
        setFormData({ ...initialStaff, id: `staff-${Date.now()}` });
      }
    }
  }, [staff, isOpen, mode]);

  const handleInputChange = (field: keyof Staff, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const updatedSkills = [...(formData.skills || []), newSkill];
      setFormData({ ...formData, skills: updatedSkills });
      setNewSkill({ name: '', level: 'junior', yearsOfExperience: 0 });
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updatedSkills });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage)) {
      setFormData({ ...formData, languages: [...formData.languages, newLanguage] });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({ ...formData, languages: formData.languages.filter(l => l !== language) });
  };

  const addProgLanguage = () => {
    if (newProgLanguage.trim() && !formData.programmingLanguages.includes(newProgLanguage)) {
      setFormData({ ...formData, programmingLanguages: [...formData.programmingLanguages, newProgLanguage] });
      setNewProgLanguage('');
    }
  };

  const removeProgLanguage = (language: string) => {
    setFormData({ ...formData, programmingLanguages: formData.programmingLanguages.filter(l => l !== language) });
  };

  const calculateProfit = () => {
    return formData.clientRate - formData.internalRate;
  };

  const calculateProfitMargin = () => {
    if (formData.clientRate === 0) return 0;
    return ((formData.clientRate - formData.internalRate) / formData.clientRate) * 100;
  };

  const handleSave = () => {
    onSave(formData as Staff);
    onClose();
  };

  const handleDelete = () => {
    if (staff && onDelete) {
      onDelete(staff.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C89A9] to-[#4a90b8] flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreateMode ? 'Add New Staff Member' : 
                 isViewMode ? 'Staff Details' : 'Edit Staff Member'}
              </h2>
              {!isCreateMode && (
                <p className="text-sm text-gray-500">{formData.role} • {formData.department}</p>
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

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Data & Analytics">Data & Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contractor">Contractor</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

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
                Experience (years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                disabled={isViewMode}
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
                disabled={isViewMode}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="available">Available</option>
                <option value="partially-booked">Partially Booked</option>
                <option value="fully-booked">Fully Booked</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Internal Rate ($/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.internalRate}
                  onChange={(e) => handleInputChange('internalRate', parseFloat(e.target.value))}
                  disabled={isViewMode}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">What company pays staff member</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Client Rate ($/hr)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.clientRate}
                  onChange={(e) => handleInputChange('clientRate', parseFloat(e.target.value))}
                  disabled={isViewMode}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">What client pays for this staff member</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">Profit Analysis</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profit/hr:</span>
                    <span className={`text-sm font-medium ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${calculateProfit().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Margin:</span>
                    <span className={`text-sm font-medium ${calculateProfitMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateProfitMargin().toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability & Utilization */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability & Utilization</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', parseInt(e.target.value))}
                  disabled={isViewMode}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billable Utilization %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.billableUtilization}
                  onChange={(e) => handleInputChange('billableUtilization', parseInt(e.target.value))}
                  disabled={isViewMode}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Billable Hours/Week
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.billableHours}
                  onChange={(e) => handleInputChange('billableHours', parseInt(e.target.value))}
                  disabled={isViewMode}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Hours/Week
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalHours}
                  onChange={(e) => handleInputChange('totalHours', parseInt(e.target.value))}
                  disabled={isViewMode}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Star className="h-5 w-5 inline mr-2" />
              Skills
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <span className="text-xs text-gray-500">({skill.level})</span>
                    {!isViewMode && (
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {!isViewMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Skill name"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
                  />
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as SkillLevel })}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="expert">Expert</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Years"
                    min="0"
                    value={newSkill.yearsOfExperience}
                    onChange={(e) => setNewSkill({ ...newSkill, yearsOfExperience: parseInt(e.target.value) })}
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
                  />
                  <button
                    onClick={addSkill}
                    className="rounded-lg bg-[#3C89A9] px-3 py-2 text-white hover:bg-[#2c6b87]"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Languages className="h-5 w-5 inline mr-2" />
                Languages
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-100 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-blue-700">{language}</span>
                      {!isViewMode && (
                        <button
                          onClick={() => removeLanguage(language)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {!isViewMode && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add language"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
                    />
                    <button
                      onClick={addLanguage}
                      className="rounded-lg bg-[#3C89A9] px-3 py-2 text-white hover:bg-[#2c6b87]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Code className="h-5 w-5 inline mr-2" />
                Programming Languages
              </h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.programmingLanguages.map((language, index) => (
                    <div key={index} className="flex items-center gap-2 bg-green-100 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-green-700">{language}</span>
                      {!isViewMode && (
                        <button
                          onClick={() => removeProgLanguage(language)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {!isViewMode && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add programming language"
                      value={newProgLanguage}
                      onChange={(e) => setNewProgLanguage(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3C89A9] focus:outline-none focus:ring-1 focus:ring-[#3C89A9]"
                    />
                    <button
                      onClick={addProgLanguage}
                      className="rounded-lg bg-[#3C89A9] px-3 py-2 text-white hover:bg-[#2c6b87]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {!isViewMode && !isCreateMode && onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Staff Member
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#3C89A9] rounded-lg hover:bg-[#2c6b87] transition-colors"
              >
                <Save className="h-4 w-4" />
                {isCreateMode ? 'Create Staff Member' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}