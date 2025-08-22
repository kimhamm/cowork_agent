export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: 'ko' | 'en';
    timezone: string;
  };
}

// 직원 정보 확장
export interface EmployeeUser extends User {
  employeeId: string;
  departmentId: string;
  position: string;
  level: number;
  startDate: Date;
  isActive: boolean;
}
