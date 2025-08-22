import { User, UserProfile, EmployeeUser } from '@/types/user';
import { Employee } from '@/types/organization';
import { getEmployees } from './organizationService';
import { v4 as uuidv4 } from 'uuid';

// 로컬 스토리지 키
const USERS_KEY = 'hem_users';
const CURRENT_USER_KEY = 'hem_current_user';

// 기본 사용자들 생성 (조직도 기반)
const createDefaultUsers = (): EmployeeUser[] => {
  const employees = getEmployees();
  
  return employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    avatar: emp.avatar,
    createdAt: emp.createdAt,
    lastLoginAt: emp.lastLoginAt,
    employeeId: emp.employeeId,
    departmentId: emp.departmentId,
    position: emp.position,
    level: emp.level,
    startDate: emp.startDate,
    isActive: emp.isActive
  }));
};

// 사용자 목록 가져오기
export const getUsers = (): EmployeeUser[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      // 기본 사용자 생성 및 저장
      const defaultUsers = createDefaultUsers();
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    
    const users = JSON.parse(stored);
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: new Date(user.lastLoginAt),
      startDate: new Date(user.startDate),
    }));
  } catch (error) {
    console.error('Failed to load users:', error);
    return createDefaultUsers();
  }
};

// 사용자 저장하기
export const saveUsers = (users: EmployeeUser[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

// 새 사용자 생성
export const createUser = (name: string, email: string, avatar?: string): EmployeeUser => {
  const newUser: EmployeeUser = {
    id: uuidv4(),
    name,
    email,
    avatar: avatar || '👤',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    employeeId: `EMP${String(Date.now()).slice(-6)}`,
    departmentId: 'dept-1', // 기본값
    position: '사원',
    level: 8,
    startDate: new Date(),
    isActive: true
  };
  
  const users = getUsers();
  users.push(newUser);
  saveUsers(users);
  
  return newUser;
};

// 사용자 수정
export const updateUser = (id: string, updates: Partial<EmployeeUser>): EmployeeUser | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  users[index] = {
    ...users[index],
    ...updates,
    lastLoginAt: new Date()
  };
  
  saveUsers(users);
  return users[index];
};

// 사용자 삭제
export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  
  if (filtered.length === users.length) return false;
  
  saveUsers(filtered);
  
  // 현재 사용자가 삭제된 경우 기본 사용자로 설정
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === id) {
    const remainingUsers = filtered.length > 0 ? filtered : createDefaultUsers();
    setCurrentUser(remainingUsers[0]);
  }
  
  return true;
};

// 현재 사용자 가져오기
export const getCurrentUser = (): EmployeeUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) {
      // 기본 사용자 중 첫 번째를 현재 사용자로 설정
      const users = getUsers();
      if (users.length > 0) {
        setCurrentUser(users[0]);
        return users[0];
      }
      return null;
    }
    
    const user = JSON.parse(stored);
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLoginAt: new Date(user.lastLoginAt),
      startDate: new Date(user.startDate),
    };
  } catch (error) {
    console.error('Failed to load current user:', error);
    return null;
  }
};

// 현재 사용자 설정
export const setCurrentUser = (user: EmployeeUser): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // 마지막 로그인 시간 업데이트
    const updatedUser = { ...user, lastLoginAt: new Date() };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    
    // 사용자 목록도 업데이트
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
    }
  } catch (error) {
    console.error('Failed to set current user:', error);
  }
};

// 사용자 전환
export const switchUser = (userId: string): EmployeeUser | null => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (user) {
    setCurrentUser(user);
    return user;
  }
  
  return null;
};
