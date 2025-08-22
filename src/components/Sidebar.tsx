'use client';

import { Calendar, MessageCircle, Building, MoreHorizontal } from 'lucide-react';

export default function Sidebar({ activeView, onViewChange }: { 
  activeView: 'chat' | 'calendar' | 'organization'; 
  onViewChange: (view: 'chat' | 'calendar' | 'organization') => void; 
}) {
  const menuItems = [
    {
      id: 'chat' as const,
      label: '채팅',
      icon: MessageCircle,
      description: '자연어로 일정 관리'
    },
    {
      id: 'calendar' as const,
      label: '캘린더',
      icon: Calendar,
      description: '일정을 캘린더로 보기'
    },
    {
      id: 'organization' as const,
      label: '조직도',
      icon: Building,
      description: '회사 조직 구조 보기'
    }
    // 향후 확장을 위한 메뉴 아이템들
    // { id: 'tasks', label: '할일', icon: CheckSquare, description: '할일 목록 관리' },
    // { id: 'projects', label: '프로젝트', icon: Folder, description: '프로젝트 관리' },
    // { id: 'reports', label: '보고서', icon: BarChart, description: '일정 분석 및 보고' }
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* 로고 및 제목 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HEM</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">일정 관리</h2>
        </div>
      </div>

      {/* 메뉴 목록 */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            );
          })}
        </div>
      </nav>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>HEM Agent v1.0</p>
          <p>MCP 기반 일정 관리</p>
        </div>
      </div>
    </aside>
  );
}
