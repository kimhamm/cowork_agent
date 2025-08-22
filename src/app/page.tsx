'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import Calendar from '@/components/Calendar';
import OrganizationChart from '@/components/OrganizationChart';

export default function Home() {
  const [activeView, setActiveView] = useState<'chat' | 'calendar' | 'organization'>('chat');

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 overflow-hidden">
          {/* 메인 콘텐츠 */}
          <div className="h-full">
            {activeView === 'chat' ? (
              <ChatInterface />
            ) : activeView === 'calendar' ? (
              <Calendar />
            ) : (
              <OrganizationChart />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
