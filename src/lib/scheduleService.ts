import { Schedule, ScheduleFormData } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';

// 로컬 스토리지 키 (사용자별로 분리)
const getScheduleKey = (userId: string) => `hem_schedules_${userId}`;

// 일정 목록 가져오기 (사용자별)
export const getSchedules = (userId: string): Schedule[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = getScheduleKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const schedules = JSON.parse(stored);
    return schedules.map((schedule: any) => ({
      ...schedule,
      startDate: new Date(schedule.startDate),
      endDate: new Date(schedule.endDate),
      createdAt: new Date(schedule.createdAt),
      updatedAt: new Date(schedule.updatedAt),
    }));
  } catch (error) {
    console.error('Failed to load schedules:', error);
    return [];
  }
};

// 일정 저장하기 (사용자별)
export const saveSchedules = (userId: string, schedules: Schedule[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getScheduleKey(userId);
    localStorage.setItem(key, JSON.stringify(schedules));
  } catch (error) {
    console.error('Failed to save schedules:', error);
  }
};

// 일정 생성하기 (사용자별)
export const createSchedule = (userId: string, data: ScheduleFormData): Schedule => {
  const now = new Date();
  const schedule: Schedule = {
    id: uuidv4(),
    title: data.title,
    description: data.description,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    createdAt: now,
    updatedAt: now,
  };
  
  const schedules = getSchedules(userId);
  schedules.push(schedule);
  saveSchedules(userId, schedules);
  
  return schedule;
};

// 일정 수정하기 (사용자별)
export const updateSchedule = (userId: string, id: string, data: ScheduleFormData): Schedule | null => {
  const schedules = getSchedules(userId);
  const index = schedules.findIndex(s => s.id === id);
  
  if (index === -1) return null;
  
  schedules[index] = {
    ...schedules[index],
    title: data.title,
    description: data.description,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    updatedAt: new Date(),
  };
  
  saveSchedules(userId, schedules);
  return schedules[index];
};

// 일정 삭제하기 (사용자별)
export const deleteSchedule = (userId: string, id: string): boolean => {
  const schedules = getSchedules(userId);
  const filtered = schedules.filter(s => s.id !== id);
  
  if (filtered.length === schedules.length) return false;
  
  saveSchedules(userId, filtered);
  return true;
};

// 일정 검색하기 (사용자별)
export const searchSchedules = (userId: string, query: string): Schedule[] => {
  const schedules = getSchedules(userId);
  const lowerQuery = query.toLowerCase();
  
  return schedules.filter(schedule => 
    schedule.title.toLowerCase().includes(lowerQuery) ||
    schedule.description?.toLowerCase().includes(lowerQuery)
  );
};

// 특정 날짜의 일정 조회하기 (사용자별)
export const getSchedulesByDate = (userId: string, targetDate: Date): Schedule[] => {
  const schedules = getSchedules(userId);
  const targetDateStr = targetDate.toDateString(); // YYYY-MM-DD 형식
  
  return schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startDate);
    return scheduleDate.toDateString() === targetDateStr;
  });
};

// 특정 주의 일정 조회하기 (사용자별)
export const getSchedulesByWeek = (userId: string, weekOffset: number): Schedule[] => {
  const schedules = getSchedules(userId);
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
  currentWeekStart.setHours(0, 0, 0, 0);
  
  const targetWeekStart = new Date(currentWeekStart);
  targetWeekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
  
  const targetWeekEnd = new Date(targetWeekStart);
  targetWeekEnd.setDate(targetWeekStart.getDate() + 6);
  targetWeekEnd.setHours(23, 59, 59, 999);
  
  return schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startDate);
    return scheduleDate >= targetWeekStart && scheduleDate <= targetWeekEnd;
  });
};

// 사용자별 일정 데이터 초기화 (새 사용자 생성 시)
export const initializeUserSchedules = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  const key = getScheduleKey(userId);
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify([]));
  }
};

// 사용자별 일정 데이터 삭제 (사용자 삭제 시)
export const deleteUserSchedules = (userId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getScheduleKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to delete user schedules:', error);
  }
};
