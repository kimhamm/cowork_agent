'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Calendar } from 'lucide-react';
import { ChatMessage } from '@/types/schedule';
import { parseNaturalLanguageWithLLM, collectMissingInfoWithLLM, processUserInputWithLLM } from '@/lib/llmService';
import { executeMCPRequest, handleMoreInfoRequest } from '@/lib/mcpService';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';

export default function ChatInterface() {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `안녕하세요! 저는 HEM 일정 관리 AI 어시스턴트입니다. 🤖

⏰ 현재 시간: ${new Date().toLocaleString('ko-KR', { 
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit'
})}

OpenAI API 키를 설정하고 다음과 같은 기능을 사용할 수 있습니다:

📅 **일정 관리**:
• "내일 오후 2시에 팀 미팅 일정을 추가해줘"
• "오늘 일정 보여줘"
• "팀 미팅 일정을 삭제해줘"

💬 **일반 대화**:
• "안녕하세요"
• "HEM 회사에 대해 알려주세요"
• "좋은 하루 보내세요"

무엇을 도와드릴까요?`,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingScheduleRequest, setPendingScheduleRequest] = useState<Record<string, unknown> | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isModelTesting, setIsModelTesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentUser) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 이전에 추가 정보를 요청한 상태라면, 사용자 입력을 추가 정보로 처리
      if (pendingScheduleRequest) {
        const updatedRequest = await processAdditionalInfo(inputValue, pendingScheduleRequest, apiKey);
        
        if (updatedRequest.isComplete) {
          // 모든 정보가 완성되었으므로 일정 생성
          const result = await executeMCPRequest({
            tool: 'create_schedule',
            arguments: {
              title: updatedRequest.title as string,
              when: updatedRequest.when,
              description: updatedRequest.description as string
            }
          }, currentUser.id);
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: result.message,
            role: 'assistant',
            timestamp: new Date(),
            scheduleId: result.data?.id
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setPendingScheduleRequest(null); // 대기 상태 해제
        } else {
          // 아직 부족한 정보가 있음
          const response = handleMoreInfoRequest({
            tool: 'request_more_info',
            arguments: {
              type: 'schedule_creation',
              title: updatedRequest.title || '',
              when: updatedRequest.when,
              missingFields: updatedRequest.missingFields
            }
          });
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: response.message,
            role: 'assistant',
            timestamp: new Date(),
            requiresMoreInfo: response.requiresMoreInfo,
            missingFields: response.missingFields,
            suggestions: response.suggestions
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setPendingScheduleRequest(updatedRequest); // 업데이트된 요청으로 저장
        }
              } else {
          // 통합된 자연어 처리 (일반 응답 + MCP 기능)
          const result = await processUserInputWithLLM(inputValue, apiKey);
          
          if (result.type === 'mcp_request' && result.tool && result.arguments) {
            // MCP 도구 실행
            if (result.tool === 'request_more_info') {
              // 추가 정보 요청 처리
              const response = handleMoreInfoRequest({
                tool: result.tool,
                arguments: result.arguments
              });
              
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: response.message,
                role: 'assistant',
                timestamp: new Date(),
                requiresMoreInfo: response.requiresMoreInfo,
                missingFields: response.missingFields,
                suggestions: response.suggestions
              };
              
              setMessages(prev => [...prev, assistantMessage]);
              setPendingScheduleRequest(result.arguments); // 대기 상태로 설정
            } else {
              // MCP 요청 실행 (사용자 ID 전달)
              console.log('🔍 MCP 요청 실행:', {
                tool: result.tool,
                arguments: result.arguments
              });
              
              const mcpResult = await executeMCPRequest({
                tool: result.tool,
                arguments: result.arguments
              }, currentUser.id);
              
              const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: mcpResult.message,
                role: 'assistant',
                timestamp: new Date(),
                scheduleId: mcpResult.data?.id
              };

              setMessages(prev => [...prev, assistantMessage]);
            }
          } else if (result.type === 'general_response' && result.message) {
            // 일반 응답 처리
            const assistantMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: result.message,
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
          } else {
            // 처리 실패 시 기본 응답
            const helpMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: `안녕하세요! 저는 HEM 일정 관리 AI 어시스턴트입니다.

일정 관리나 일반적인 질문 모두 도와드릴 수 있습니다:

📅 **일정 관리**:
• "내일 오후 2시에 팀 미팅 일정을 추가해줘"
• "오늘 일정 보여줘"
• "팀 미팅 일정을 삭제해줘"

💬 **일반 대화**:
• "안녕하세요"
• "오늘 날씨는 어때요?"
• "회사 소개해주세요"

무엇을 도와드릴까요?`,
              role: 'assistant',
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, helpMessage]);
          }
        }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSetApiKey = async () => {
    if (apiKey.trim()) {
      setIsModelTesting(true);
      
      try {
        // 간단한 테스트로 모델 접근 가능 여부 확인
        const testRequest = await parseNaturalLanguageWithLLM("테스트", apiKey);
        
        if (testRequest) {
          setIsApiKeySet(true);
          localStorage.setItem('openai_api_key', apiKey);
          
          // 모델 정보 저장 (간단한 추정)
          const modelInfo = 'gpt-4o-mini'; // 기본값
          setSelectedModel(modelInfo);
          localStorage.setItem('selected_model', modelInfo);
          
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: `✅ OpenAI API 키가 설정되었습니다!

⏰ 현재 시간: ${new Date().toLocaleString('ko-KR', { 
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit'
})}

이제 다음과 같은 기능을 사용할 수 있습니다:

📅 **일정 관리**: "내일 오후 2시에 팀 미팅 일정을 추가해줘"
📋 **일정 조회**: "오늘 일정 보여줘"
🗑️ **일정 삭제**: "팀 미팅 일정 삭제해줘"
💬 **일반 대화**: "안녕하세요", "HEM 회사 소개해주세요"

무엇을 도와드릴까요?`,
            role: 'assistant',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, successMessage]);
        } else {
          throw new Error('모델 응답을 받을 수 없습니다.');
        }
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `❌ API 키 설정 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}\n\n다음 사항을 확인해주세요:\n1. API 키가 올바른지\n2. 계정에 충분한 크레딧이 있는지\n3. API 키가 활성화되어 있는지`,
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsModelTesting(false);
      }
    }
  };

  const handleRemoveApiKey = () => {
    setIsApiKeySet(false);
    setApiKey('');
    setSelectedModel('');
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('selected_model');
    
    const removeMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: '🗑️ API 키가 제거되었습니다. 다시 설정해주세요.',
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, removeMessage]);
  };

  // 컴포넌트 마운트 시 저장된 API 키 확인
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedModel = localStorage.getItem('selected_model');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    }
    
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // 추가 정보를 처리하여 이전 정보와 결합 (LLM 기반)
  const processAdditionalInfo = async (userInput: string, previousRequest: {
    title?: string;
    when?: {
      relativeWeek: string;
      weekday: string;
      time: string;
      durationMinutes: number;
    };
    missingFields?: string[];
    [key: string]: unknown;
  }, apiKey: string) => {
    try {
      const result = await collectMissingInfoWithLLM(userInput, previousRequest, previousRequest.missingFields || [], apiKey);
      
      if (result && result.updatedRequest) {
        return {
          title: result.updatedRequest.title || previousRequest.title || '',
          when: result.updatedRequest.when || previousRequest.when,
          description: result.updatedRequest.description || '',
          isComplete: result.isComplete || false,
          missingFields: result.missingFields || []
        };
      }
    } catch (error) {
      console.error('LLM 정보 수집 실패:', error);
    }
    
    // LLM 실패 시 간단한 폴백 로직
    const { title, when, missingFields = [] } = previousRequest;
    let updatedTitle = title;
    let updatedWhen = when;
    let updatedMissingFields = [...missingFields];

    // 제목만 간단하게 추출
    if (missingFields.includes('title') && !title) {
      updatedTitle = userInput.trim();
      updatedMissingFields = updatedMissingFields.filter(field => field !== 'title');
    }

    return {
      title: updatedTitle,
      when: updatedWhen,
      description: '',
      isComplete: updatedMissingFields.length === 0,
      missingFields: updatedMissingFields
    };
  };

  // 정규식 기반 날짜/시간 파싱 함수들은 제거됨 - LLM만 사용

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentUser ? `${currentUser.name}님의 일정 관리` : '일정 관리'}
              </h2>
              <p className="text-sm text-gray-500">자연어로 일정을 관리하세요</p>
            </div>
          </div>
          
          {/* API 키 설정 */}
          <div className="flex items-center space-x-2">
            {!isApiKeySet ? (
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="OpenAI API 키 입력"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSetApiKey}
                  disabled={!apiKey.trim() || isModelTesting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  {isModelTesting ? '테스트 중...' : '설정'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-green-600">✅ API 키 설정됨</span>
                {selectedModel && (
                  <span className="text-xs text-gray-500">({selectedModel})</span>
                )}
                <button
                  onClick={handleRemoveApiKey}
                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  제거
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {/* 추가 정보 요청 시 제안 버튼들 */}
                {msg.requiresMoreInfo && msg.suggestions && (
                  <div className="mt-3 space-y-2">
                    {msg.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(suggestion)}
                        className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm transition-colors"
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {format(msg.timestamp, 'HH:mm')}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 bg-gray-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="px-6 py-4 border-t border-gray-200">
        {!currentUser ? (
          <div className="text-center text-gray-500 py-4">
            사용자를 선택해주세요
          </div>
        ) : !isApiKeySet ? (
          <div className="text-center text-gray-500 py-4">
            <p>🤖 LLM 기능을 사용하려면 OpenAI API 키를 설정해주세요.</p>
            <p className="text-sm mt-2">헤더에서 API 키를 입력하고 설정 버튼을 클릭하세요.</p>
          </div>
        ) : (
          <>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={pendingScheduleRequest ? "추가 정보를 입력하세요..." : "자연어로 일정을 입력하세요..."}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>전송</span>
              </button>
            </div>
            
            {/* 도움말 */}
            <div className="mt-3 text-xs text-gray-500">
              <p>📅 일정: "내일 오후 2시에 팀 미팅 일정을 추가해줘"</p>
              <p>📅 조회: "오늘 일정", "내일 일정", "이번주 일정"</p>
              <p>📅 삭제: "팀 미팅 일정 삭제해줘", "오늘 일정 삭제해줘"</p>
              <p>💬 대화: "안녕하세요", "HEM 회사 소개해주세요"</p>
              <p>🤖 AI가 자연어를 이해하므로 편하게 말씀해 주세요!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
