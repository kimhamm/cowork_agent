'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Calendar, Clock, MapPin } from 'lucide-react';
import { ChatMessage } from '@/types/schedule';
import { parseNaturalLanguage, executeMCPRequest, mcpTools } from '@/lib/mcpService';
import { format } from 'date-fns';
import { useUser } from '@/contexts/UserContext';

export default function ChatInterface() {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '안녕하세요! 자연어로 일정을 관리할 수 있습니다. 예시: "내일 오후 2시에 "팀 미팅" 일정을 추가해줘"',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing || !currentUser) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // 자연어를 MCP 요청으로 파싱
      const mcpRequest = parseNaturalLanguage(inputValue);
      
      if (mcpRequest) {
        // MCP 요청 실행 (사용자 ID 전달)
        const result = await executeMCPRequest(mcpRequest, currentUser.id);
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: result.message,
          role: 'assistant',
          timestamp: new Date(),
          scheduleId: result.data?.id
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // 자연어 파싱 실패 시 도움말 제공
        const helpMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `일정을 관리하려면 다음과 같이 말씀해 주세요:

• 일정 추가: "내일 오후 2시에 "팀 미팅" 일정을 추가해줘"
• 일정 수정: "ID abc123 일정을 "고객 미팅"으로 수정해줘"
• 일정 삭제: "ID abc123 일정을 삭제해줘"
• 일정 검색: ""미팅" 일정을 검색해줘"
• 일정 목록: "모든 일정을 보여줘"`,
          role: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, helpMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-600'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          
          <div className={`px-4 py-3 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
            {message.scheduleId && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  일정 ID: {message.scheduleId}
                </div>
              </div>
            )}
            <div className={`text-xs mt-2 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {format(message.timestamp, 'HH:mm')}
            </div>
          </div>
        </div>
      </div>
    );
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
      {/* 채팅 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">HEM Assistant</h2>
            <p className="text-sm text-gray-500">
              {currentUser.name}님의 일정을 자연어로 관리하세요
            </p>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(renderMessage)}
        {isProcessing && (
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
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="자연어로 일정을 입력하세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>전송</span>
          </button>
        </div>
        
        {/* 도움말 */}
        <div className="mt-3 text-xs text-gray-500">
          <p>💡 예시: "내일 오후 2시에 "팀 미팅" 일정을 추가해줘"</p>
        </div>
      </div>
    </div>
  );
}
