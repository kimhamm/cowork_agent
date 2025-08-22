export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  level: number;
  employeeCount: number;
  description?: string;
  order: number;
}

export interface OrganizationTree {
  id: string;
  name: string;
  code: string;
  employeeCount: number;
  level: number;
  children: OrganizationTree[];
  parentId?: string;
  order: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar?: string;
  departmentId: string;
  position: string;
  level: number;
  startDate: Date;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
}

export interface Position {
  id: string;
  name: string;
  level: number;
  description?: string;
}

export interface DepartmentWithEmployees extends Department {
  employees: Employee[];
  children: DepartmentWithEmployees[];
}
