'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Users, Building, User } from 'lucide-react';
import { OrganizationTree, Employee } from '@/types/organization';
import { getOrganizationTree, getEmployeesByDepartment } from '@/lib/organizationService';

interface OrganizationChartProps {
  onEmployeeSelect?: (employee: Employee) => void;
}

export default function OrganizationChart({ onEmployeeSelect }: OrganizationChartProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['dept-1', 'dept-2']));
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [organizationTree] = useState<OrganizationTree[]>(() => getOrganizationTree());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (nodeId: string) => expandedNodes.has(nodeId);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 4: return 'bg-green-100 text-green-800 border-green-200';
      case 5: return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return '👑';
      case 2: return '🏢';
      case 3: return '🏛️';
      case 4: return '🏢';
      case 5: return '🏠';
      default: return '🏢';
    }
  };

  const renderTreeNode = (node: OrganizationTree, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const expanded = isExpanded(node.id);
    const isSelected = selectedDepartment === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
            isSelected ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => setSelectedDepartment(node.id)}
        >
          {/* 확장/축소 버튼 */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="w-4 h-4 text-gray-500 hover:text-gray-700"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* 부서 아이콘 */}
          <div className="text-lg">{getLevelIcon(node.level)}</div>

          {/* 부서 정보 */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{node.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getLevelColor(node.level)}`}>
                {node.code}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{node.employeeCount}명</span>
              <span>•</span>
              <span>Level {node.level}</span>
            </div>
          </div>
        </div>

        {/* 하위 부서들 */}
        {hasChildren && expanded && (
          <div className="mt-1">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderEmployeeList = () => {
    if (!selectedDepartment) return null;

    const employees = getEmployeesByDepartment(selectedDepartment);
    const department = organizationTree.flatMap(level1 => 
      level1.children?.flatMap(level2 => 
        level2.children?.flatMap(level3 => 
          level3.children?.flatMap(level4 => 
            level4.children?.find(dept => dept.id === selectedDepartment) || []
          ) || []
        ) || []
      ) || []
    ).find(dept => dept.id === selectedDepartment);

    if (!department) return null;

    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{department.name} 직원 목록</h3>
          <span className="text-sm text-gray-500">({employees.length}명)</span>
        </div>
        
        {employees.length > 0 ? (
          <div className="grid gap-3">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => onEmployeeSelect?.(employee)}
              >
                <div className="text-2xl">{employee.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-600">{employee.employeeId}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{employee.position}</div>
                  <div className="text-xs text-gray-500">{employee.email}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>이 부서에는 직원이 없습니다.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">조직도</h2>
            <p className="text-sm text-gray-500">회사 조직 구조와 직원 정보를 확인하세요</p>
          </div>
        </div>
      </div>

      {/* 조직도 트리 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-2">
          {organizationTree.map(node => renderTreeNode(node))}
        </div>
        
        {/* 선택된 부서의 직원 목록 */}
        {renderEmployeeList()}
      </div>

      {/* 하단 정보 */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>총 {organizationTree.flatMap(level1 => 
            level1.children?.flatMap(level2 => 
              level2.children?.flatMap(level3 => 
                level3.children?.flatMap(level4 => 
                  level4.children || []
                ) || []
              ) || []
            ) || []
          ).length}개 부서</p>
          <p>클릭하여 부서별 직원 정보를 확인하세요</p>
        </div>
      </div>
    </div>
  );
}
