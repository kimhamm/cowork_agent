import OpenAI from 'openai';
import { MCPRequest } from '@/types/schedule';

// 사용 가능한 모델들 (우선순위 순)
const AVAILABLE_MODELS = [
  'gpt-4o-mini',      // 가장 안정적이고 빠름
];

// OpenAI 클라이언트 초기화
const createOpenAIClient = (apiKey?: string) => {
  if (!apiKey) {
    throw new Error('OpenAI API 키가 필요합니다. 환경 변수나 직접 입력으로 제공해주세요.');
  }
  
  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // 브라우저에서 사용할 경우
  });
};

// 사용 가능한 모델 확인 및 선택
const selectAvailableModel = async (openai: OpenAI): Promise<string> => {
  for (const model of AVAILABLE_MODELS) {
    try {
      // 간단한 테스트 요청으로 모델 접근 가능 여부 확인
      await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      console.log(`✅ 사용 가능한 모델: ${model}`);
      return model;
    } catch (error: any) {
      if (error.status === 403) {
        console.log(`❌ 모델 ${model} 접근 불가: ${error.message}`);
        continue;
      }
      // 다른 오류는 무시하고 다음 모델 시도
      continue;
    }
  }
  
  // 모든 모델이 실패한 경우 기본값 반환
  console.warn('⚠️ 모든 모델 접근 실패, gpt-4o-mini 사용');
  return 'gpt-4o-mini';
};

// 시스템 프롬프트 정의 (의도 추출만)
const SYSTEM_PROMPT = `당신은 HEM 회사의 일정 관리 AI 어시스턴트입니다.

## 🎯 LLM의 역할:
LLM은 오직 "의도"만 추출합니다. 날짜를 직접 계산하지 마세요.

## 📝 응답 형식:
일정 생성 요청 시:
{
  "type": "mcp_request",
  "tool": "create_schedule",
  "arguments": {
    "title": "일정 제목",
    "when": {
      "relativeWeek": "this",        // "this" | "next"
      "weekday": "수",               // "월" | "화" | "수" | "목" | "금" | "토" | "일"
      "time": "14:00",              // 24시간 형식 (HH:mm)
      "durationMinutes": 60          // 분 단위
    }
  }
}

## 💡 예시:
- "다음주 수요일 오후 2시" → relativeWeek: "next", weekday: "수", time: "14:00"
- "이번주 금요일 오전 9시" → relativeWeek: "this", weekday: "금", time: "09:00"
- "내일 오후 3시" → relativeWeek: "next", weekday: "목", time: "15:00"`;

// LLM을 사용하여 자연어를 처리 (일반 응답 + MCP 기능)
export const processUserInputWithLLM = async (userInput: string, apiKey?: string): Promise<{
  type: 'mcp_request' | 'general_response';
  tool?: string;
  arguments?: Record<string, unknown>;
  message?: string;
  reasoning?: string;
}> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    // 사용 가능한 모델 선택
    const selectedModel = await selectAvailableModel(openai);
    
    // 현재 시간 정보를 포함한 동적 시스템 프롬프트 생성
    const currentTime = new Date();
    const dynamicSystemPrompt = SYSTEM_PROMPT.replace(
      /\$\{new Date\(\)\.toLocaleString\('ko-KR', \{[\s\S]*?\}\)\}/g,
      currentTime.toLocaleString('ko-KR', { 
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );
    
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: dynamicSystemPrompt
        },
        {
          role: 'user',
          content: `사용자 요청: "${userInput}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return { type: 'general_response', message: '죄송합니다. 응답을 생성할 수 없습니다.' };

    console.log('🔍 LLM 원본 응답:', response);
    console.log('🔍 LLM 모델:', selectedModel);
    console.log('🔍 LLM 시스템 프롬프트:', dynamicSystemPrompt);

    // JSON 응답 파싱
    try {
      const parsed = JSON.parse(response);
      console.log('🔍 LLM 파싱된 응답:', parsed);
      
      if (parsed.type === 'mcp_request' && parsed.tool && parsed.arguments) {
        return {
          type: 'mcp_request',
          tool: parsed.tool,
          arguments: parsed.arguments,
          reasoning: parsed.reasoning
        };
      } else if (parsed.type === 'general_response' && parsed.message) {
        return {
          type: 'general_response',
          message: parsed.message,
          reasoning: parsed.context
        };
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 일반 응답으로 처리
      console.error('LLM 응답 파싱 실패:', parseError);
      return {
        type: 'general_response',
        message: response // 원본 응답을 그대로 사용
      };
    }

    return { type: 'general_response', message: '요청을 처리할 수 없습니다.' };
  } catch (error) {
    console.error('LLM API 호출 실패:', error);
    return { type: 'general_response', message: '죄송합니다. 오류가 발생했습니다.' };
  }
};

// 기존 함수는 호환성을 위해 유지
export const parseNaturalLanguageWithLLM = async (userInput: string, apiKey?: string): Promise<MCPRequest | null> => {
  const result = await processUserInputWithLLM(userInput, apiKey);
  
  if (result.type === 'mcp_request' && result.tool && result.arguments) {
    return {
      tool: result.tool,
      arguments: result.arguments
    };
  }
  
  return null;
};

// 대화형 정보 수집을 위한 LLM 서비스
export const collectMissingInfoWithLLM = async (
  userInput: string, 
  previousRequest: Record<string, unknown>, 
  missingFields: string[], 
  apiKey?: string
): Promise<{
  updatedRequest: Record<string, unknown>;
  isComplete: boolean;
  missingFields: string[];
  message: string;
} | null> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    // 사용 가능한 모델 선택
    const selectedModel = await selectAvailableModel(openai);
    
    // 현재 시간 정보를 포함한 동적 컨텍스트 생성
    const currentTime = new Date();
    const currentTimeString = currentTime.toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const contextPrompt = `
## ⏰ 현재 시간 정보:
현재 시점: ${currentTimeString}

## 📅 날짜 관련 규칙 (반드시 현재 시간 기준으로 계산):
- "오늘" = ${currentTime.toISOString().split('T')[0]} (현재 날짜)
- "내일" = ${new Date(currentTime.getTime() + 24*60*60*1000).toISOString().split('T')[0]} (현재 날짜 + 1일)
- "다음 주" = 현재 날짜 기준 다음 주 (월요일부터 일요일)
- "이번 주" = 현재 날짜가 속한 주 (월요일부터 일요일)

## 🕐 시간 관련 규칙:
- "오전" = 00:00-11:59
- "오후" = 12:00-23:59 (오후 2시 = 14:00)
- "밤" = 18:00-23:59
- "아침" = 06:00-11:59
- "점심" = 12:00-13:59

## 📝 응답 형식 (반드시 JSON 형식으로 응답):
{
  "updatedRequest": {
    "title": "일정 제목",
    "when": {
      "relativeWeek": "this",        // "this" | "next"
      "weekday": "수",               // "월" | "화" | "수" | "목" | "금" | "토" | "일"
      "time": "14:00",              // 24시간 형식 (HH:mm)
      "durationMinutes": 60          // 분 단위
    }
  },
  "isComplete": true/false,
  "missingFields": ["부족한 필드 목록"],
  "message": "사용자에게 보여줄 메시지"
}

## 🔍 분석할 정보:
이전 요청: ${JSON.stringify(previousRequest)}
부족한 필드: ${missingFields.join(', ')}
사용자 입력: "${userInput}"

## 💡 예시:
- "다음주 수요일 오후 2시" → relativeWeek: "next", weekday: "수", time: "14:00"
- "이번주 금요일 오전 9시" → relativeWeek: "this", weekday: "금", time: "09:00"
- "내일 오후 3시" → relativeWeek: "next", weekday: "목", time: "15:00"

사용자의 입력을 분석하여 이전 정보와 결합하고, when 객체를 생성해주세요.
반드시 위의 JSON 형식으로만 응답해주세요.`;

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: '당신은 일정 생성에 필요한 정보를 수집하는 AI 어시스턴트입니다.'
        },
        {
          role: 'user',
          content: contextPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return null;

    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (parseError) {
      console.error('LLM 응답 파싱 실패:', parseError);
      return null;
    }
  } catch (error) {
    console.error('LLM API 호출 실패:', error);
    return null;
  }
};

// LLM을 사용한 일정 삭제 확인
export const confirmScheduleDeletionWithLLM = async (
  userInput: string,
  foundSchedules: Array<{ id: string; title: string; startDate: string }>,
  apiKey?: string
): Promise<{
  confirmed: boolean;
  selectedSchedule?: string;
  message: string;
}> => {
  try {
    const openai = createOpenAIClient(apiKey);
    
    // 사용 가능한 모델 선택
    const selectedModel = await selectAvailableModel(openai);
    
    // 현재 시간 정보를 포함한 동적 컨텍스트 생성
    const currentTime = new Date();
    const currentTimeString = currentTime.toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const contextPrompt = `
## ⏰ 현재 시간 정보:
현재 시점: ${currentTimeString}

찾은 일정들:
${foundSchedules.map(s => `- ID: ${s.id}, 제목: ${s.title}, 날짜: ${s.startDate}`).join('\n')}

사용자 입력: "${userInput}"

사용자가 어떤 일정을 삭제하려고 하는지 분석하고, 명확하지 않으면 확인 질문을 해주세요.
현재 시간을 기준으로 날짜 관련 표현을 정확하게 이해해주세요.

응답 형식:
{
  "confirmed": true/false,
  "selectedSchedule": "선택된일정ID또는null",
  "message": "사용자에게 보여줄 메시지"
}`;

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: '당신은 일정 삭제를 확인하는 AI 어시스턴트입니다.'
        },
        {
          role: 'user',
          content: contextPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return { confirmed: false, message: '삭제 확인 중 오류가 발생했습니다.' };

    try {
      const parsed = JSON.parse(response);
      return {
        confirmed: parsed.confirmed || false,
        selectedSchedule: parsed.selectedSchedule,
        message: parsed.message
      };
    } catch (parseError) {
      console.error('LLM 응답 파싱 실패:', parseError);
      return { confirmed: false, message: '삭제 확인 중 오류가 발생했습니다.' };
    }
  } catch (error) {
    console.error('LLM API 호출 실패:', error);
    return { confirmed: false, message: '삭제 확인 중 오류가 발생했습니다.' };
  }
};
