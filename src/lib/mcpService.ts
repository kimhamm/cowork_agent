import { Schedule, ScheduleFormData, MCPTool, MCPRequest } from '@/types/schedule';
import { createSchedule, updateSchedule, deleteSchedule, searchSchedules, getSchedules } from './scheduleService';
import { format, parseISO } from 'date-fns';

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
        startDate: { type: 'string', description: '시작 날짜 (YYYY-MM-DD HH:mm 형식)' },
        endDate: { type: 'string', description: '종료 날짜 (YYYY-MM-DD HH:mm 형식)' }
      },
      required: ['title', 'startDate', 'endDate']
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
        id: { type: 'string', description: '일정 ID' }
      },
      required: ['id']
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
  }
];

// 자연어를 MCP 요청으로 파싱
export const parseNaturalLanguage = (text: string): MCPRequest | null => {
  const lowerText = text.toLowerCase();
  
  // 일정 생성 패턴
  if (lowerText.includes('일정') && (lowerText.includes('추가') || lowerText.includes('생성') || lowerText.includes('등록'))) {
    const titleMatch = text.match(/[""]([^""]+)[""]/);
    const dateMatch = text.match(/(\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s*\d{1,2}시\s*\d{1,2}분)/g);
    
    if (titleMatch && dateMatch && dateMatch.length >= 2) {
      return {
        tool: 'create_schedule',
        arguments: {
          title: titleMatch[1],
          startDate: parseKoreanDate(dateMatch[0]),
          endDate: parseKoreanDate(dateMatch[1])
        }
      };
    }
  }
  
  // 일정 수정 패턴
  if (lowerText.includes('일정') && (lowerText.includes('수정') || lowerText.includes('변경'))) {
    const idMatch = text.match(/ID\s*(\w+)/);
    const titleMatch = text.match(/[""]([^""]+)[""]/);
    
    if (idMatch) {
      return {
        tool: 'update_schedule',
        arguments: {
          id: idMatch[1],
          ...(titleMatch && { title: titleMatch[1] })
        }
      };
    }
  }
  
  // 일정 삭제 패턴
  if (lowerText.includes('일정') && (lowerText.includes('삭제') || lowerText.includes('제거'))) {
    const idMatch = text.match(/ID\s*(\w+)/);
    
    if (idMatch) {
      return {
        tool: 'delete_schedule',
        arguments: {
          id: idMatch[1]
        }
      };
    }
  }
  
  // 일정 검색 패턴
  if (lowerText.includes('일정') && (lowerText.includes('검색') || lowerText.includes('찾기'))) {
    const queryMatch = text.match(/[""]([^""]+)[""]/);
    
    if (queryMatch) {
      return {
        tool: 'search_schedules',
        arguments: {
          query: queryMatch[1]
        }
      };
    }
  }
  
  // 일정 목록 패턴
  if (lowerText.includes('일정') && (lowerText.includes('목록') || lowerText.includes('조회') || lowerText.includes('보기'))) {
    return {
      tool: 'list_schedules',
      arguments: {}
    };
  }
  
  return null;
};

// 한국어 날짜를 ISO 형식으로 변환
const parseKoreanDate = (koreanDate: string): string => {
  const match = koreanDate.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2})시\s*(\d{1,2})분/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }
  return new Date().toISOString();
};

// MCP 요청 실행 (사용자별)
export const executeMCPRequest = async (request: MCPRequest, userId: string): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    switch (request.tool) {
      case 'create_schedule':
        const newSchedule = createSchedule(userId, request.arguments as ScheduleFormData);
        return {
          success: true,
          message: `일정 "${newSchedule.title}"이(가) 성공적으로 생성되었습니다.`,
          data: newSchedule
        };
        
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
        const deleted = deleteSchedule(userId, request.arguments.id);
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
        
      case 'search_schedules':
        const searchResults = searchSchedules(userId, request.arguments.query);
        return {
          success: true,
          message: `"${request.arguments.query}" 검색 결과: ${searchResults.length}건`,
          data: searchResults
        };
        
      case 'list_schedules':
        const allSchedules = getSchedules(userId);
        return {
          success: true,
          message: `전체 일정: ${allSchedules.length}건`,
          data: allSchedules
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
