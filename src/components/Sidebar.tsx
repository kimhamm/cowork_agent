'use client';

import React from 'react';
import { Calendar, MessageSquare, Users } from 'lucide-react';

interface SidebarProps {
  activeView: 'chat' | 'calendar' | 'organization';
  onViewChange: (view: 'chat' | 'calendar' | 'organization') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    {
      id: 'chat' as const,
      name: '채팅',
      icon: MessageSquare,
      description: '자연어로 일정 관리'
    },
    {
      id: 'calendar' as const,
      name: '캘린더',
      icon: Calendar,
      description: '일정 확인 및 관리'
    },
    {
      id: 'organization' as const,
      name: '조직도',
      icon: Users,
      description: '회사 조직 구조'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
