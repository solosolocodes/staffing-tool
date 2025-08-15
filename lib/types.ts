export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';
export type StaffStatus = 'available' | 'partially-booked' | 'fully-booked' | 'on-leave';
export type SkillLevel = 'junior' | 'mid' | 'senior' | 'expert';

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  revenue: number;
  teamSize: number;
  techStack: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectManager: string;
  staffAssigned: string[];
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: StaffStatus;
  availability: number;
  billableHours: number;
  totalHours: number;
  skills: Skill[];
  languages: string[];
  programmingLanguages: string[];
  experience: number;
  rate: number;
  currentProjects: string[];
  avatar?: string;
  location: string;
  timezone: string;
}

export interface Skill {
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
}

export interface Assignment {
  id: string;
  projectId: string;
  staffId: string;
  role: string;
  allocation: number;
  startDate: string;
  endDate: string;
  billableHours: number;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalStaff: number;
  availableStaff: number;
  utilization: number;
  revenue: number;
  projectsAtRisk: number;
  upcomingDeadlines: number;
}