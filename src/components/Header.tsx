'use client';

import { useState } from 'react';
import { User, Settings, Bell, Search, ChevronDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import UserSwitchModal from './UserSwitchModal';

export default function Header() {
  const { currentUser } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showUserSwitchModal, setShowUserSwitchModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HEM</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">일정 관리</h1>
          </div>

          {/* 검색바 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="일정 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center space-x-4">
            {/* 알림 */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 설정 */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      테마 설정
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      알림 설정
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      데이터 백업
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 프로필 */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                  {currentUser?.avatar || '👤'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {currentUser?.name || '사용자'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentUser?.email || 'user@company.com'}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-2xl">
                        {currentUser?.avatar || '👤'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {currentUser?.name || '사용자'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currentUser?.email || 'user@company.com'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button 
                      onClick={() => {
                        setShowUserSwitchModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      사용자 전환
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      프로필 편집
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      계정 설정
                    </button>
                    <hr className="my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 사용자 전환 모달 */}
      <UserSwitchModal 
        isOpen={showUserSwitchModal} 
        onClose={() => setShowUserSwitchModal(false)} 
      />
    </>
  );
}
