'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Schedule } from '@/types/schedule';
import { getSchedules } from '@/lib/scheduleService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useUser } from '@/contexts/UserContext';

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
}

export default function Calendar() {
  const { currentUser } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadSchedules();
    }
  }, [currentUser]);

  const loadSchedules = () => {
    if (!currentUser) return;
    
    const loadedSchedules = getSchedules(currentUser.id);
    setSchedules(loadedSchedules);
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 주차별로 날짜 그룹화
  const weeks: DayInfo[][] = [];
  let currentWeek: DayInfo[] = [];
  
  // 이전 달의 날짜들로 첫 주 채우기
  const firstDayOfWeek = monthStart.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDate = new Date(monthStart);
    prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
    currentWeek.push({ date: prevDate, isCurrentMonth: false });
  }

  monthDays.forEach(day => {
    currentWeek.push({ date: day, isCurrentMonth: true });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // 마지막 주 채우기
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const nextDate = new Date(monthEnd);
      nextDate.setDate(nextDate.getDate() + (currentWeek.length - 6));
      currentWeek.push({ date: nextDate, isCurrentMonth: false });
    }
    weeks.push(currentWeek);
  }

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => 
      isSameDay(new Date(schedule.startDate), date)
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-500">사용자를 선택해주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 캘린더 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">캘린더</h2>
            <div className="flex items-center space-x-2">
              <div className="text-lg">{currentUser.avatar}</div>
              <span className="text-sm text-gray-600">{currentUser.name}님의 일정</span>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              오늘
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h3>
            
            <button
              onClick={nextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="px-6 py-2 border-b border-gray-200">
        <div className="grid grid-cols-7 gap-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-medium py-2 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="flex-1 px-6 py-4">
        <div className="grid grid-cols-7 gap-1 h-full">
          {weeks.map((week, weekIndex) =>
            week.map(({ date, isCurrentMonth }, dayIndex) => {
              const daySchedules = getSchedulesForDate(date);
              const dayKey = `${weekIndex}-${dayIndex}`;
              
              return (
                <div
                  key={dayKey}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'
                  } ${
                    isToday(date) ? 'bg-blue-50 border-blue-300' : ''
                  } ${
                    isSelected(date) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(date) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  
                  {/* 일정 표시 */}
                  <div className="space-y-1">
                    {daySchedules.slice(0, 2).map((schedule) => (
                      <div
                        key={schedule.id}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded truncate"
                        title={schedule.title}
                      >
                        {schedule.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{daySchedules.length - 2}개 더
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 선택된 날짜의 일정 상세 */}
      {selectedDate && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">
              {format(selectedDate, 'M월 d일 (E)', { locale: ko })}
            </h4>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              일정 추가
            </button>
          </div>
          
          <div className="space-y-2">
            {getSchedulesForDate(selectedDate).length > 0 ? (
              getSchedulesForDate(selectedDate).map((schedule) => (
                <div
                  key={schedule.id}
                  className="p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 mb-1">
                        {schedule.title}
                      </h5>
                      {schedule.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {schedule.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {format(new Date(schedule.startDate), 'HH:mm')} - {format(new Date(schedule.endDate), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        수정
                      </button>
                      <button className="p-1 text-red-400 hover:text-red-600">
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                이 날에는 일정이 없습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
