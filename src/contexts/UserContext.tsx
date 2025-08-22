'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { getCurrentUser, switchUser, getUsers } from '@/lib/userService';
import { initializeUserSchedules } from '@/lib/scheduleService';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  switchCurrentUser: (userId: string) => void;
  refreshUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // 초기 사용자 로드
  useEffect(() => {
    const loadInitialData = () => {
      const loadedUsers = getUsers();
      setUsers(loadedUsers);
      
      const loadedCurrentUser = getCurrentUser();
      if (loadedCurrentUser) {
        setCurrentUser(loadedCurrentUser);
        // 사용자별 일정 데이터 초기화
        initializeUserSchedules(loadedCurrentUser.id);
      }
    };

    loadInitialData();
  }, []);

  // 사용자 전환
  const switchCurrentUser = (userId: string) => {
    const newUser = switchUser(userId);
    if (newUser) {
      setCurrentUser(newUser);
      // 사용자별 일정 데이터 초기화
      initializeUserSchedules(newUser.id);
    }
  };

  // 사용자 목록 새로고침
  const refreshUsers = () => {
    const loadedUsers = getUsers();
    setUsers(loadedUsers);
  };

  const value: UserContextType = {
    currentUser,
    users,
    switchCurrentUser,
    refreshUsers,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
