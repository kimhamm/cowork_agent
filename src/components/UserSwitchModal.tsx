'use client';

import { useState } from 'react';
import { X, Plus, Edit, Trash2, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { createUser, updateUser, deleteUser } from '@/lib/userService';

interface UserSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSwitchModal({ isOpen, onClose }: UserSwitchModalProps) {
  const { currentUser, users, switchCurrentUser, refreshUsers } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '👤'
  });

  const handleCreateUser = () => {
    if (formData.name.trim() && formData.email.trim()) {
      createUser(formData.name, formData.email, formData.avatar);
      setFormData({ name: '', email: '', avatar: '👤' });
      setIsCreating(false);
      refreshUsers();
    }
  };

  const handleUpdateUser = (userId: string) => {
    if (formData.name.trim() && formData.email.trim()) {
      updateUser(userId, {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      });
      setFormData({ name: '', email: '', avatar: '👤' });
      setEditingUser(null);
      refreshUsers();
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까? 모든 일정 데이터가 삭제됩니다.')) {
      deleteUser(userId);
      refreshUsers();
    }
  };

  const startEdit = (user: any) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      avatar: user.avatar || '👤'
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', avatar: '👤' });
  };

  const avatarOptions = ['👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🏫', '👩‍🏫'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">사용자 전환</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 사용자 목록 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  currentUser?.id === user.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl">{user.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="flex space-x-2">
                  {currentUser?.id === user.id ? (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      현재 사용자
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => switchCurrentUser(user.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        선택
                      </button>
                      <button
                        onClick={() => startEdit(user)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {users.length > 1 && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 새 사용자 생성 */}
        {!isCreating && (
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>새 사용자 추가</span>
            </button>
          </div>
        )}

        {/* 사용자 생성/수정 폼 */}
        {(isCreating || editingUser) && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isCreating ? '새 사용자 생성' : '사용자 수정'}
            </h3>
            
            <div className="space-y-4">
              {/* 아바타 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  아바타
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setFormData({ ...formData, avatar })}
                      className={`w-8 h-8 text-lg rounded border-2 transition-colors ${
                        formData.avatar === avatar
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="사용자 이름"
                />
              </div>

              {/* 이메일 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@company.com"
                />
              </div>

              {/* 버튼 */}
              <div className="flex space-x-3">
                <button
                  onClick={isCreating ? handleCreateUser : () => handleUpdateUser(editingUser!)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? '생성' : '수정'}
                </button>
                <button
                  onClick={isCreating ? () => setIsCreating(false) : cancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
