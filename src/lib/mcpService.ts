import { Schedule, ScheduleFormData, MCPTool, MCPRequest, MCPResponse } from '@/types/schedule';
import { createSchedule, updateSchedule, deleteSchedule, searchSchedules, getSchedules, getSchedulesByDate, getSchedulesByWeek } from './scheduleService';
import { format, startOfWeek, addWeeks, addMinutes, setHours, setMinutes } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

// MCP 도구 정의
export const mcpTools: MCPTool[] = [
  {
    name: 'create_schedule',
    description: '새로운 일정을 생성합니다',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '일정 제목' },
        description: { type: 'string', description: '일정 설명 (선택사항)' },
        when: {
          type: 'object',
          properties: {
            relativeWeek: { type: 'string', description: '상대적 주차 (this | next)' },
            weekday: { type: 'string', description: '요일 (월 | 화 | 수 | 목 | 금 | 토 | 일)' },
            time: { type: 'string', description: '시간 (24시간 형식 HH:mm)' },
            durationMinutes: { type: 'number', description: '지속 시간 (분)' }
          },
          required: ['relativeWeek', 'weekday', 'time', 'durationMinutes']
        },
        startDate: { type: 'string', description: '시작 날짜 (서버에서 자동 생성, ISO8601+09:00)', nullable: true },
        endDate: { type: 'string', description: '종료 날짜 (서버에서 자동 생성, ISO8601+09:00)', nullable: true }
      },
      required: ['title', 'when']
    }
  },
  {
    name: 'update_schedule',
    description: '기존 일정을 수정합니다',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '일정 ID' },
        title: { type: 'string', description: '일정 제목' },
        description: { type: 'string', description: '일정 설명 (선택사항)' },
        startDate: { type: 'string', description: '시작 날짜 (YYYY-MM-DD HH:mm 형식)' },
        endDate: { type: 'string', description: '종료 날짜 (YYYY-MM-DD HH:mm 형식)' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_schedule',
    description: '일정을 삭제합니다',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '일정 ID (ID로 삭제할 때)' },
        title: { type: 'string', description: '일정 제목 (제목으로 삭제할 때)' },
        date: { type: 'string', description: '일정 날짜 (날짜로 삭제할 때)' },
        type: { type: 'string', description: '삭제 타입 (by_id, by_title, by_date)' }
      },
      required: ['type']
    }
  },
  {
    name: 'search_schedules',
    description: '일정을 검색합니다',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '검색어' }
      },
      required: ['query']
    }
  },
  {
    name: 'list_schedules',
    description: '모든 일정을 조회합니다',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_schedules_by_date',
    description: '특정 날짜의 일정을 조회합니다',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: '조회할 날짜 (today, tomorrow, dayAfterTomorrow, nextWeek, thisWeek, 또는 YYYY-MM-DD 형식)' }
      },
      required: ['date']
    }
  },
  {
    name: 'request_more_info',
    description: '일정 생성에 필요한 추가 정보를 요청합니다',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', description: '요청 타입 (schedule_creation 등)' },
        title: { type: 'string', description: '일정 제목 (있는 경우)' },
        startDate: { type: 'string', description: '시작 날짜 (있는 경우)' },
        endDate: { type: 'string', description: '종료 날짜 (있는 경우)' },
        missingFields: { type: 'array', items: { type: 'string' }, description: '부족한 필드 목록' }
      },
      required: ['type', 'missingFields']
    }
  }
];

// 날짜 계산 함수 (새로운 로직)
const calculateScheduleDateTime = (when: {
  relativeWeek: string;
  weekday: string;
  time: string;
  durationMinutes: number;
}): { startDate: string; endDate: string } => {
  const now = new Date();
  const seoulTimeZone = 'Asia/Seoul';
  
  // 현재 주의 시작 (월요일)
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  
  // 목표 주차 계산
  const targetWeekStart = when.relativeWeek === 'next' 
    ? addWeeks(currentWeekStart, 1) 
    : currentWeekStart;
  
  // 요일 인덱스 (월=0, 화=1, 수=2, 목=3, 금=4, 토=5, 일=6)
  const weekdayMap: Record<string, number> = {
    '월': 0, '화': 1, '수': 2, '목': 3, '금': 4, '토': 5, '일': 6
  };
  
  const targetWeekday = weekdayMap[when.weekday];
  if (targetWeekday === undefined) {
    throw new Error(`잘못된 요일: ${when.weekday}`);
  }
  
  // 목표 날짜 계산
  const targetDate = new Date(targetWeekStart);
  targetDate.setDate(targetWeekStart.getDate() + targetWeekday);
  
  // 시간 설정
  const [hours, minutes] = when.time.split(':').map(Number);
  const startDateTime = setMinutes(setHours(targetDate, hours), minutes);
  
  // 종료 시간 계산
  const endDateTime = addMinutes(startDateTime, when.durationMinutes);
  
  // 서울 시간대로 변환하여 ISO8601+09:00 형식으로 반환
  const startDateSeoul = toZonedTime(startDateTime, seoulTimeZone);
  const endDateSeoul = toZonedTime(endDateTime, seoulTimeZone);
  
  return {
    startDate: startDateSeoul.toISOString(),
    endDate: endDateSeoul.toISOString()
  };
};

// 날짜 레이블 생성 (오늘, 내일, 모레 등)
const getDateLabel = (dateString: string): string => {
  const now = new Date();
  const targetDate = new Date(dateString);

  if (dateString === 'today') {
    return '오늘';
  } else if (dateString === 'tomorrow') {
    return '내일';
  } else if (dateString === 'dayAfterTomorrow') {
    return '모레';
  } else if (dateString === 'nextWeek') {
    return '다음주';
  } else if (dateString === 'thisWeek') {
    return '이번주';
  } else {
    return format(targetDate, 'MM월 dd일');
  }
};

// MCP 요청 실행 (사용자별)
export const executeMCPRequest = async (request: MCPRequest, userId: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    switch (request.tool) {
      case 'create_schedule':
        try {
          const args = request.arguments as any;
          
          // when 객체에서 startDate, endDate 계산
          if (args.when) {
            const { startDate, endDate } = calculateScheduleDateTime(args.when);
            
            // ScheduleFormData 형식으로 변환
            const scheduleData: ScheduleFormData = {
              title: args.title,
              description: args.description || '',
              startDate: startDate,
              endDate: endDate
            };
            
            const newSchedule = createSchedule(userId, scheduleData);
            return {
              success: true,
              message: `일정 "${newSchedule.title}"이(가) 성공적으로 생성되었습니다.`,
              data: newSchedule
            };
          } else {
            return {
              success: false,
              message: 'when 객체가 필요합니다.'
            };
          }
        } catch (error) {
          return {
            success: false,
            message: `일정 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          };
        }
        
      case 'update_schedule':
        const updatedSchedule = updateSchedule(userId, request.arguments.id, request.arguments as ScheduleFormData);
        if (updatedSchedule) {
          return {
            success: true,
            message: `일정이 성공적으로 수정되었습니다.`,
            data: updatedSchedule
          };
        } else {
          return {
            success: false,
            message: '해당 ID의 일정을 찾을 수 없습니다.'
          };
        }
        
      case 'delete_schedule':
        const { type, id, title, date } = request.arguments;
        let deletedSchedules: Schedule[] = [];
        
        try {
          if (type === 'by_id' && id) {
            // ID로 삭제
            const deleted = deleteSchedule(userId, id);
            if (deleted) {
              return {
                success: true,
                message: '일정이 성공적으로 삭제되었습니다.'
              };
            } else {
              return {
                success: false,
                message: '해당 ID의 일정을 찾을 수 없습니다.'
              };
            }
          } else if (type === 'by_title' && title) {
            // 제목으로 삭제
            const schedules = getSchedules(userId);
            const matchingSchedules = schedules.filter(s => s.title.toLowerCase().includes(title.toLowerCase()));
            
            if (matchingSchedules.length === 0) {
              return {
                success: false,
                message: `"${title}" 제목의 일정을 찾을 수 없습니다.`
              };
            }
            
            if (matchingSchedules.length === 1) {
              // 하나만 있으면 바로 삭제
              deleteSchedule(userId, matchingSchedules[0].id);
              return {
                success: true,
                message: `"${matchingSchedules[0].title}" 일정이 삭제되었습니다.`
              };
            } else {
              // 여러 개가 있으면 목록을 보여주고 선택하도록 안내
              const scheduleList = matchingSchedules.map(s => 
                `• ID: ${s.id} | ${format(new Date(s.startDate), 'MM월 dd일 HH:mm')} | ${s.title}`
              ).join('\n');
              
              return {
                success: false,
                message: `"${title}" 제목의 일정이 ${matchingSchedules.length}개 있습니다. 정확한 ID를 사용하여 삭제해주세요:\n\n${scheduleList}`
              };
            }
          } else if (type === 'by_date' && date) {
            // 날짜로 삭제
            let targetDate: Date;
            
            if (date === 'today') {
              targetDate = new Date();
            } else if (date === 'tomorrow') {
              targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + 1);
            } else if (date === 'dayAfterTomorrow') {
              targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + 2);
            } else if (date === 'nextWeek') {
              targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + 7);
            } else if (date === 'thisWeek') {
              targetDate = new Date();
            } else {
              targetDate = new Date(date);
            }
            
            const schedules = getSchedulesByDate(userId, targetDate);
            
            if (schedules.length === 0) {
              const dateLabel = getDateLabel(date);
              return {
                success: false,
                message: `${dateLabel} 등록된 일정이 없습니다.`
              };
            }
            
            if (schedules.length === 1) {
              // 하나만 있으면 바로 삭제
              deleteSchedule(userId, schedules[0].id);
              const dateLabel = getDateLabel(date);
              return {
                success: true,
                message: `${dateLabel} "${schedules[0].title}" 일정이 삭제되었습니다.`
              };
            } else {
              // 여러 개가 있으면 목록을 보여주고 선택하도록 안내
              const dateLabel = getDateLabel(date);
              const scheduleList = schedules.map(s => 
                `• ID: ${s.id} | ${format(new Date(s.startDate), 'HH:mm')} | ${s.title}`
              ).join('\n');
              
              return {
                success: false,
                message: `${dateLabel} 일정이 ${schedules.length}개 있습니다. 정확한 ID를 사용하여 삭제해주세요:\n\n${scheduleList}`
              };
            }
          } else {
            return {
              success: false,
              message: '삭제할 일정을 찾을 수 없습니다. ID, 제목, 또는 날짜를 정확히 입력해주세요.'
            };
          }
        } catch (error) {
          return {
            success: false,
            message: `일정 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          };
        }
        
      case 'list_schedules':
        const allSchedules = getSchedules(userId);
        if (allSchedules.length === 0) {
          return {
            success: true,
            message: '등록된 일정이 없습니다.',
            data: []
          };
        }
        
        // 일정을 보기 좋게 포맷팅
        const formattedSchedules = allSchedules.map(schedule => ({
          ...schedule,
          formattedStartDate: format(new Date(schedule.startDate), 'MM월 dd일 HH:mm'),
          formattedEndDate: format(new Date(schedule.endDate), 'HH:mm')
        }));
        
        const scheduleList = formattedSchedules.map(schedule => 
          `• ${schedule.formattedStartDate}~${schedule.formattedEndDate}: ${schedule.title}${schedule.description ? ` (${schedule.description})` : ''}`
        ).join('\n');
        
        return {
          success: true,
          message: `📅 전체 일정 (${allSchedules.length}건):\n\n${scheduleList}`,
          data: formattedSchedules
        };
        
      case 'get_schedules_by_date':
        const targetDate = request.arguments.date;
        let dateSchedules: Schedule[] = [];
        
        if (targetDate === 'today') {
          dateSchedules = getSchedulesByDate(userId, new Date());
        } else if (targetDate === 'tomorrow') {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateSchedules = getSchedulesByDate(userId, tomorrow);
        } else if (targetDate === 'dayAfterTomorrow') {
          const dayAfterTomorrow = new Date();
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
          dateSchedules = getSchedulesByDate(userId, dayAfterTomorrow);
        } else if (targetDate === 'nextWeek') {
          dateSchedules = getSchedulesByWeek(userId, 1);
        } else if (targetDate === 'thisWeek') {
          dateSchedules = getSchedulesByWeek(userId, 0);
        } else {
          // YYYY-MM-DD 형식
          const parsedDate = new Date(targetDate);
          if (!isNaN(parsedDate.getTime())) {
            dateSchedules = getSchedulesByDate(userId, parsedDate);
          }
        }
        
        if (dateSchedules.length === 0) {
          const dateLabel = getDateLabel(targetDate);
          return {
            success: true,
            message: `${dateLabel} 등록된 일정이 없습니다.`,
            data: []
          };
        }
        
        // 날짜별 일정을 보기 좋게 포맷팅
        const formattedDateSchedules = dateSchedules.map(schedule => ({
          ...schedule,
          formattedStartDate: format(new Date(schedule.startDate), 'HH:mm'),
          formattedEndDate: format(new Date(schedule.endDate), 'HH:mm')
        }));
        
        const dateScheduleList = formattedDateSchedules.map(schedule => 
          `• ${schedule.formattedStartDate}~${schedule.formattedEndDate}: ${schedule.title}${schedule.description ? ` (${schedule.description})` : ''}`
        ).join('\n');
        
        const dateLabel = getDateLabel(targetDate);
        return {
          success: true,
          message: `📅 ${dateLabel} 일정 (${dateSchedules.length}건):\n\n${dateScheduleList}`,
          data: formattedDateSchedules
        };
        
      case 'search_schedules':
        const searchResults = searchSchedules(userId, request.arguments.query);
        if (searchResults.length === 0) {
          return {
            success: true,
            message: `"${request.arguments.query}" 검색 결과가 없습니다.`,
            data: []
          };
        }
        
        // 검색 결과를 보기 좋게 포맷팅
        const formattedSearchResults = searchResults.map(schedule => ({
          ...schedule,
          formattedStartDate: format(new Date(schedule.startDate), 'MM월 dd일 HH:mm'),
          formattedEndDate: format(new Date(schedule.endDate), 'HH:mm')
        }));
        
        const searchList = formattedSearchResults.map(schedule => 
          `• ${schedule.formattedStartDate}~${schedule.formattedEndDate}: ${schedule.title}${schedule.description ? ` (${schedule.description})` : ''}`
        ).join('\n');
        
        return {
          success: true,
          message: `🔍 "${request.arguments.query}" 검색 결과 (${searchResults.length}건):\n\n${searchList}`,
          data: formattedSearchResults
        };
        
      default:
        return {
          success: false,
          message: '알 수 없는 도구입니다.'
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
};

// 추가 정보 요청 처리
export const handleMoreInfoRequest = (request: MCPRequest): MCPResponse => {
  try {
    if (request.tool === 'request_more_info' && request.arguments.type === 'schedule_creation') {
      const { title, startDate, endDate, missingFields } = request.arguments;
      
      let message = '일정을 생성하기 위해 추가 정보가 필요합니다:\n\n';
      const suggestions: string[] = [];
      
      if (missingFields.includes('title')) {
        message += '📝 **일정 제목**을 알려주세요.\n';
        message += '예시: "팀 미팅", "고객 상담", "프로젝트 회의"\n\n';
        suggestions.push('제목을 입력해주세요');
      }
      
      if (missingFields.includes('startDate')) {
        message += '📅 **일정 날짜와 시간**을 알려주세요.\n';
        message += '예시: "내일 오후 2시", "다음주 월요일 오전 10시", "8월 24일 오후 4시"\n\n';
        suggestions.push('날짜와 시간을 입력해주세요');
      }
      
      if (missingFields.includes('endDate')) {
        message += '⏰ **종료 시간**을 알려주세요.\n';
        message += '예시: "오후 3시", "1시간 후", "2시간 후"\n\n';
        suggestions.push('종료 시간을 입력해주세요');
      }
      
      message += '💡 **완전한 예시**: "내일 오후 2시에 팀 미팅 일정을 추가해줘"';
      
      return {
        success: true,
        message: message,
        requiresMoreInfo: true,
        missingFields: missingFields,
        suggestions: suggestions
      };
    } else if (request.tool === 'request_more_info' && request.arguments.type === 'schedule_deletion') {
      let message = '삭제할 일정을 찾기 위해 추가 정보가 필요합니다:\n\n';
      const suggestions: string[] = [];
      
      message += '🗑️ **삭제할 일정**을 다음 중 하나로 지정해주세요:\n\n';
      message += '1. **제목으로**: "팀 미팅" 일정 삭제해줘\n';
      message += '2. **날짜로**: 오늘 일정 삭제해줘\n';
      message += '3. **ID로**: ID abc123 일정 삭제해줘\n\n';
      
      suggestions.push('"팀 미팅" 일정 삭제해줘');
      suggestions.push('오늘 일정 삭제해줘');
      suggestions.push('ID로 삭제하기');
      
      message += '💡 **예시**: "팀 미팅 일정 삭제해줘", "오늘 일정 삭제해줘"';
      
      return {
        success: true,
        message: message,
        requiresMoreInfo: true,
        missingFields: ['target'],
        suggestions: suggestions
      };
    }
    
    return {
      success: false,
      message: '알 수 없는 요청 타입입니다.'
    };
  } catch (error) {
    return {
      success: false,
      message: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    };
  }
};
