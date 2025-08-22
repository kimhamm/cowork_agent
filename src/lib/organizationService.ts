import { Department, OrganizationTree, Employee, Position } from '@/types/organization';

// 로컬 스토리지 키
const DEPARTMENTS_KEY = 'hem_departments';
const EMPLOYEES_KEY = 'hem_employees';
const POSITIONS_KEY = 'hem_positions';

// 직급 데이터
const createDefaultPositions = (): Position[] => [
  { id: 'pos-1', name: '대표이사', level: 1, description: '최고경영자' },
  { id: 'pos-2', name: 'C레벨', level: 2, description: 'C레벨 임원' },
  { id: 'pos-3', name: '연구소장', level: 3, description: '연구소장' },
  { id: 'pos-4', name: '센터장', level: 4, description: '센터장' },
  { id: 'pos-5', name: '실장', level: 5, description: '실장' },
  { id: 'pos-6', name: '부장', level: 6, description: '부장' },
  { id: 'pos-7', name: '팀장', level: 7, description: '팀장' },
  { id: 'pos-8', name: '파트장', level: 8, description: '파트장' },
  { id: 'pos-9', name: '선임', level: 9, description: '선임' },
  { id: 'pos-10', name: '팀원', level: 10, description: '팀원' },
  { id: 'pos-11', name: '인턴', level: 11, description: '인턴' },
];

// 조직도 데이터 생성 (새로운 구조)
const createDefaultDepartments = (): Department[] => [
  // 최상위
  { id: 'dept-1', name: 'CEO', code: 'CEO', level: 1, employeeCount: 1, order: 1 },
  
  // CSA
  { id: 'dept-2', name: 'CSA', code: 'CSA', parentId: 'dept-1', level: 2, employeeCount: 1, order: 1 },
  
  // 마케팅사업본부
  { id: 'dept-3', name: '마케팅사업본부', code: 'MKT', parentId: 'dept-1', level: 2, employeeCount: 0, order: 2 },
  { id: 'dept-4', name: '마케팅', code: 'MKT_TEAM', parentId: 'dept-3', level: 3, employeeCount: 10, order: 1 },
  
  // 신사업개발실
  { id: 'dept-5', name: '신사업개발실', code: 'NEW_BIZ', parentId: 'dept-1', level: 2, employeeCount: 0, order: 3 },
  { id: 'dept-6', name: 'OD', code: 'OD', parentId: 'dept-5', level: 3, employeeCount: 1, order: 1 },
  { id: 'dept-7', name: '소재개발', code: 'MATERIAL', parentId: 'dept-5', level: 3, employeeCount: 2, order: 2 },
  { id: 'dept-8', name: '해외사업', code: 'OVERSEAS', parentId: 'dept-5', level: 3, employeeCount: 1, order: 3 },
  { id: 'dept-9', name: '신사업개발팀', code: 'NEW_DEV', parentId: 'dept-5', level: 3, employeeCount: 3, order: 4 },
  
  // 생산본부
  { id: 'dept-10', name: '생산본부', code: 'PROD', parentId: 'dept-1', level: 2, employeeCount: 0, order: 4 },
  { id: 'dept-11', name: '생산기획', code: 'PROD_PLAN', parentId: 'dept-10', level: 3, employeeCount: 2, order: 1 },
  { id: 'dept-12', name: '공정지원실', code: 'PROCESS', parentId: 'dept-10', level: 3, employeeCount: 0, order: 2 },
  { id: 'dept-13', name: '밸리데이션팀', code: 'VALID', parentId: 'dept-12', level: 4, employeeCount: 4, order: 1 },
  { id: 'dept-14', name: '공정개발팀', code: 'PROC_DEV', parentId: 'dept-12', level: 4, employeeCount: 4, order: 2 },
  { id: 'dept-15', name: 'CMC', code: 'CMC', parentId: 'dept-10', level: 3, employeeCount: 1, order: 3 },
  { id: 'dept-16', name: '품질경영', code: 'QUALITY', parentId: 'dept-10', level: 3, employeeCount: 8, order: 4 },
  
  // 경영관리본부
  { id: 'dept-17', name: '경영관리본부', code: 'MGMT', parentId: 'dept-1', level: 2, employeeCount: 0, order: 5 },
  { id: 'dept-18', name: '자문', code: 'ADV', parentId: 'dept-17', level: 3, employeeCount: 1, order: 1 },
  { id: 'dept-19', name: 'HR', code: 'HR', parentId: 'dept-17', level: 3, employeeCount: 3, order: 2 },
  { id: 'dept-20', name: '재무', code: 'FIN', parentId: 'dept-17', level: 3, employeeCount: 2, order: 3 },
  { id: 'dept-21', name: '회계', code: 'ACC', parentId: 'dept-17', level: 3, employeeCount: 4, order: 4 },
  { id: 'dept-22', name: '경영지원실', code: 'SUPPORT', parentId: 'dept-17', level: 3, employeeCount: 1, order: 5 },
  
  // 마이크로바이옴 연구소
  { id: 'dept-23', name: '마이크로바이옴 연구소', code: 'RESEARCH', parentId: 'dept-1', level: 2, employeeCount: 0, order: 6 },
  { id: 'dept-24', name: '연구지원', code: 'RES_SUPPORT', parentId: 'dept-23', level: 3, employeeCount: 2, order: 1 },
  { id: 'dept-25', name: '바이오인포메틱스 센터', code: 'BIOINFO', parentId: 'dept-23', level: 3, employeeCount: 0, order: 2 },
  { id: 'dept-26', name: '바이오인포메틱스 팀', code: 'BIOINFO_TEAM', parentId: 'dept-25', level: 4, employeeCount: 3, order: 1 },
  { id: 'dept-27', name: 'IT 팀', code: 'IT_TEAM', parentId: 'dept-25', level: 4, employeeCount: 3, order: 2 },
  { id: 'dept-28', name: '멀티오믹스센터', code: 'OMICS', parentId: 'dept-23', level: 3, employeeCount: 0, order: 3 },
  { id: 'dept-29', name: '연구개발', code: 'RND', parentId: 'dept-28', level: 4, employeeCount: 4, order: 1 },
  { id: 'dept-30', name: '분석', code: 'ANALYSIS', parentId: 'dept-28', level: 4, employeeCount: 15, order: 2 },
  { id: 'dept-31', name: '연구기획', code: 'RES_PLAN', parentId: 'dept-23', level: 3, employeeCount: 2, order: 4 },
];

// 기본 직원 데이터 생성 (실제 인원수에 맞춰서)
const createDefaultEmployees = (): Employee[] => [
  // CEO (1명)
  { id: 'emp-1', employeeId: 'EMP001', name: '김대표', email: 'ceo@company.com', avatar: '👑', departmentId: 'dept-1', position: '대표이사', level: 1, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // CSA (1명)
  { id: 'emp-2', employeeId: 'EMP002', name: '이CSA', email: 'csa@company.com', avatar: '👩‍💼', departmentId: 'dept-2', position: 'C레벨', level: 2, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 마케팅사업본부 (10명)
  { id: 'emp-3', employeeId: 'EMP003', name: '문마케팅1', email: 'mkt1@company.com', avatar: '👩‍💼', departmentId: 'dept-4', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-4', employeeId: 'EMP004', name: '김마케팅2', email: 'mkt2@company.com', avatar: '👨‍💼', departmentId: 'dept-4', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-5', employeeId: 'EMP005', name: '이마케팅3', email: 'mkt3@company.com', avatar: '👩‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-6', employeeId: 'EMP006', name: '박마케팅4', email: 'mkt4@company.com', avatar: '👨‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-7', employeeId: 'EMP007', name: '최마케팅5', email: 'mkt5@company.com', avatar: '👩‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-8', employeeId: 'EMP008', name: '정마케팅6', email: 'mkt6@company.com', avatar: '👨‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-9', employeeId: 'EMP009', name: '강마케팅7', email: 'mkt7@company.com', avatar: '👩‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-10', employeeId: 'EMP010', name: '조마케팅8', email: 'mkt8@company.com', avatar: '👨‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-11', employeeId: 'EMP011', name: '윤마케팅9', email: 'mkt9@company.com', avatar: '👩‍💼', departmentId: 'dept-4', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-12', employeeId: 'EMP012', name: '임마케팅10', email: 'mkt10@company.com', avatar: '👨‍💼', departmentId: 'dept-4', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 신사업개발실 (3명)
  { id: 'emp-13', employeeId: 'EMP013', name: '고신사업1', email: 'newbiz1@company.com', avatar: '👨‍💼', departmentId: 'dept-9', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-14', employeeId: 'EMP014', name: '김신사업2', email: 'newbiz2@company.com', avatar: '👩‍💼', departmentId: 'dept-9', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-15', employeeId: 'EMP015', name: '이신사업3', email: 'newbiz3@company.com', avatar: '👨‍💼', departmentId: 'dept-9', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 생산본부 (2명)
  { id: 'emp-16', employeeId: 'EMP016', name: '송CMC', email: 'cmc@company.com', avatar: '👨‍💼', departmentId: 'dept-15', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-17', employeeId: 'EMP017', name: '김생산1', email: 'prod1@company.com', avatar: '👩‍💼', departmentId: 'dept-11', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-18', employeeId: 'EMP018', name: '이생산2', email: 'prod2@company.com', avatar: '👨‍💼', departmentId: 'dept-11', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 공정개발팀 (4명)
  { id: 'emp-19', employeeId: 'EMP019', name: '김공정1', email: 'proc1@company.com', avatar: '👩‍💼', departmentId: 'dept-14', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-20', employeeId: 'EMP020', name: '이공정2', email: 'proc2@company.com', avatar: '👨‍💼', departmentId: 'dept-14', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-21', employeeId: 'EMP021', name: '박공정3', email: 'proc3@company.com', avatar: '👩‍💼', departmentId: 'dept-14', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-22', employeeId: 'EMP022', name: '최공정4', email: 'proc4@company.com', avatar: '👨‍💼', departmentId: 'dept-14', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 밸리데이션팀 (4명)
  { id: 'emp-23', employeeId: 'EMP023', name: '정밸리1', email: 'valid1@company.com', avatar: '👩‍💼', departmentId: 'dept-13', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-24', employeeId: 'EMP024', name: '강밸리2', email: 'valid2@company.com', avatar: '👨‍💼', departmentId: 'dept-13', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-25', employeeId: 'EMP025', name: '조밸리3', email: 'valid3@company.com', avatar: '👩‍💼', departmentId: 'dept-13', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-26', employeeId: 'EMP026', name: '윤밸리4', email: 'valid4@company.com', avatar: '👨‍💼', departmentId: 'dept-13', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 품질경영 (8명)
  { id: 'emp-27', employeeId: 'EMP027', name: '김품질1', email: 'quality1@company.com', avatar: '👩‍💼', departmentId: 'dept-16', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-28', employeeId: 'EMP028', name: '이품질2', email: 'quality2@company.com', avatar: '👨‍💼', departmentId: 'dept-16', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-29', employeeId: 'EMP029', name: '박품질3', email: 'quality3@company.com', avatar: '👩‍💼', departmentId: 'dept-16', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-30', employeeId: 'EMP030', name: '최품질4', email: 'quality4@company.com', avatar: '👨‍💼', departmentId: 'dept-16', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-31', employeeId: 'EMP031', name: '정품질5', email: 'quality5@company.com', avatar: '👩‍💼', departmentId: 'dept-16', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-32', employeeId: 'EMP032', name: '강품질6', email: 'quality6@company.com', avatar: '👨‍💼', departmentId: 'dept-16', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-33', employeeId: 'EMP033', name: '윤품질7', email: 'quality7@company.com', avatar: '👩‍💼', departmentId: 'dept-16', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-34', employeeId: 'EMP034', name: '임품질8', email: 'quality8@company.com', avatar: '👨‍💼', departmentId: 'dept-16', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // OD (1명)
  { id: 'emp-35', employeeId: 'EMP035', name: '전OD', email: 'od@company.com', avatar: '👩‍💼', departmentId: 'dept-6', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 소재개발 (2명)
  { id: 'emp-36', employeeId: 'EMP036', name: '김소재1', email: 'material1@company.com', avatar: '👩‍💼', departmentId: 'dept-7', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-37', employeeId: 'EMP037', name: '이소재2', email: 'material2@company.com', avatar: '👨‍💼', departmentId: 'dept-7', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 해외사업 (1명)
  { id: 'emp-38', employeeId: 'EMP038', name: '박해외', email: 'overseas@company.com', avatar: '👩‍💼', departmentId: 'dept-8', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 신사업개발팀 (3명)
  { id: 'emp-39', employeeId: 'EMP039', name: '김신사업1', email: 'newbiz1@company.com', avatar: '👩‍💼', departmentId: 'dept-9', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-40', employeeId: 'EMP040', name: '이신사업2', email: 'newbiz2@company.com', avatar: '👨‍💼', departmentId: 'dept-9', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-41', employeeId: 'EMP041', name: '박신사업3', email: 'newbiz3@company.com', avatar: '👩‍💼', departmentId: 'dept-9', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 마이크로바이옴 연구소 (15명)
  { id: 'emp-42', employeeId: 'EMP042', name: '김분석1', email: 'analysis1@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-43', employeeId: 'EMP043', name: '이분석2', email: 'analysis2@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-44', employeeId: 'EMP044', name: '박분석3', email: 'analysis3@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-45', employeeId: 'EMP045', name: '최분석4', email: 'analysis4@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-46', employeeId: 'EMP046', name: '정분석5', email: 'analysis5@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-47', employeeId: 'EMP047', name: '강분석6', email: 'analysis6@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-48', employeeId: 'EMP048', name: '윤분석7', email: 'analysis7@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-49', employeeId: 'EMP049', name: '임분석8', email: 'analysis8@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-50', employeeId: 'EMP050', name: '백분석9', email: 'analysis9@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-51', employeeId: 'EMP051', name: '송분석10', email: 'analysis10@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-52', employeeId: 'EMP052', name: '정분석11', email: 'analysis11@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-53', employeeId: 'EMP053', name: '강분석12', email: 'analysis12@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-54', employeeId: 'EMP054', name: '조분석13', email: 'analysis13@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-55', employeeId: 'EMP055', name: '윤분석14', email: 'analysis14@company.com', avatar: '👨‍💼', departmentId: 'dept-30', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-56', employeeId: 'EMP056', name: '임분석15', email: 'analysis15@company.com', avatar: '👩‍💼', departmentId: 'dept-30', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 연구지원 (2명)
  { id: 'emp-57', employeeId: 'EMP057', name: '김연구지원1', email: 'res_support1@company.com', avatar: '👩‍💼', departmentId: 'dept-24', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-58', employeeId: 'EMP058', name: '이연구지원2', email: 'res_support2@company.com', avatar: '👨‍💼', departmentId: 'dept-24', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 바이오인포메틱스 센터 (3명)
  { id: 'emp-59', employeeId: 'EMP059', name: '김BIOINFO1', email: 'bioinfo1@company.com', avatar: '👩‍💼', departmentId: 'dept-26', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-60', employeeId: 'EMP060', name: '이BIOINFO2', email: 'bioinfo2@company.com', avatar: '👨‍💼', departmentId: 'dept-26', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-61', employeeId: 'EMP061', name: '박BIOINFO3', email: 'bioinfo3@company.com', avatar: '👩‍💼', departmentId: 'dept-26', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // IT 팀 (3명)
  { id: 'emp-62', employeeId: 'EMP062', name: '정IT1', email: 'it1@company.com', avatar: '👩‍💼', departmentId: 'dept-27', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-63', employeeId: 'EMP063', name: '강IT2', email: 'it2@company.com', avatar: '👨‍💼', departmentId: 'dept-27', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-64', employeeId: 'EMP064', name: '조IT3', email: 'it3@company.com', avatar: '👩‍💼', departmentId: 'dept-27', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 멀티오믹스센터 (0명)
  // 연구개발 (4명)
  { id: 'emp-65', employeeId: 'EMP065', name: '임연구1', email: 'rnd1@company.com', avatar: '👩‍💼', departmentId: 'dept-29', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-66', employeeId: 'EMP066', name: '김연구2', email: 'rnd2@company.com', avatar: '👨‍💼', departmentId: 'dept-29', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-67', employeeId: 'EMP067', name: '이연구3', email: 'rnd3@company.com', avatar: '👩‍💼', departmentId: 'dept-29', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-68', employeeId: 'EMP068', name: '박연구4', email: 'rnd4@company.com', avatar: '👨‍💼', departmentId: 'dept-29', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 연구기획 (2명)
  { id: 'emp-69', employeeId: 'EMP069', name: '김연구기획1', email: 'res_plan1@company.com', avatar: '👩‍💼', departmentId: 'dept-31', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-70', employeeId: 'EMP070', name: '이연구기획2', email: 'res_plan2@company.com', avatar: '👨‍💼', departmentId: 'dept-31', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 추가 직원들 (경영관리본부, 생산본부 등)
  // 자문 (1명)
  { id: 'emp-71', employeeId: 'EMP071', name: '홍자문', email: 'advisor@company.com', avatar: '👨‍💼', departmentId: 'dept-18', position: 'C레벨', level: 2, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // HR (3명)
  { id: 'emp-72', employeeId: 'EMP072', name: '강인사1', email: 'hr1@company.com', avatar: '👩‍💼', departmentId: 'dept-19', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-73', employeeId: 'EMP073', name: '조인사2', email: 'hr2@company.com', avatar: '👨‍💼', departmentId: 'dept-19', position: '파트장', level: 8, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-74', employeeId: 'EMP074', name: '백인사3', email: 'hr3@company.com', avatar: '👩‍💼', departmentId: 'dept-19', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 재무 (2명)
  { id: 'emp-75', employeeId: 'EMP075', name: '최재무1', email: 'finance1@company.com', avatar: '👩‍💼', departmentId: 'dept-20', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-76', employeeId: 'EMP076', name: '정재무2', email: 'finance2@company.com', avatar: '👨‍💼', departmentId: 'dept-20', position: '팀원', level: 10, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 회계 (4명)
  { id: 'emp-77', employeeId: 'EMP077', name: '한회계1', email: 'account1@company.com', avatar: '👩‍💼', departmentId: 'dept-21', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-78', employeeId: 'EMP078', name: '윤회계2', email: 'account2@company.com', avatar: '👨‍💼', departmentId: 'dept-21', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-79', employeeId: 'EMP079', name: '임회계3', email: 'account3@company.com', avatar: '👩‍💼', departmentId: 'dept-21', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  { id: 'emp-80', employeeId: 'EMP080', name: '김회계4', email: 'account4@company.com', avatar: '👨‍💼', departmentId: 'dept-21', position: '선임', level: 9, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 경영지원실 (1명)
  { id: 'emp-81', employeeId: 'EMP081', name: '남지원', email: 'support@company.com', avatar: '👨‍💼', departmentId: 'dept-22', position: '실장', level: 5, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 마케팅사업본부장 (1명)
  { id: 'emp-82', employeeId: 'EMP082', name: '문마케팅본부장', email: 'mkt_mgr@company.com', avatar: '👨‍💼', departmentId: 'dept-3', position: '부장', level: 6, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 신사업개발실장 (1명)
  { id: 'emp-83', employeeId: 'EMP083', name: '고신사업실장', email: 'newbiz_mgr@company.com', avatar: '👩‍💼', departmentId: 'dept-5', position: '실장', level: 5, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 생산본부장 (1명)
  { id: 'emp-84', employeeId: 'EMP084', name: '송생산본부장', email: 'prod_mgr@company.com', avatar: '👨‍💼', departmentId: 'dept-10', position: 'C레벨', level: 2, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 경영관리본부장 (1명)
  { id: 'emp-85', employeeId: 'EMP085', name: '김경영본부장', email: 'mgmt_mgr@company.com', avatar: '👩‍💼', departmentId: 'dept-17', position: 'C레벨', level: 2, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 마이크로바이옴 연구소장 (1명)
  { id: 'emp-86', employeeId: 'EMP086', name: '안연구소장', email: 'research_mgr@company.com', avatar: '👨‍💼', departmentId: 'dept-23', position: '연구소장', level: 3, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 바이오인포메틱스 센터장 (1명)
  { id: 'emp-87', employeeId: 'EMP087', name: '장바이오센터장', email: 'bioinfo_mgr@company.com', avatar: '👩‍💼', departmentId: 'dept-25', position: '센터장', level: 4, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 멀티오믹스센터장 (1명)
  { id: 'emp-88', employeeId: 'EMP088', name: '윤오믹스센터장', email: 'omics_mgr@company.com', avatar: '👨‍💼', departmentId: 'dept-28', position: '센터장', level: 4, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 공정지원실장 (1명)
  { id: 'emp-89', employeeId: 'EMP089', name: '박공정실장', email: 'process_mgr@company.com', avatar: '👩‍💼', departmentId: 'dept-12', position: '실장', level: 5, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
  
  // 생산기획팀장 (1명)
  { id: 'emp-90', employeeId: 'EMP090', name: '임생산기획팀장', email: 'prod_plan_mgr@company.com', avatar: '👨‍💼', departmentId: 'dept-11', position: '팀장', level: 7, startDate: new Date('2020-01-01'), createdAt: new Date('2020-01-01'), lastLoginAt: new Date(), isActive: true },
];

// 직급 데이터 가져오기
export const getPositions = (): Position[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(POSITIONS_KEY);
    if (!stored) {
      const defaultPositions = createDefaultPositions();
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(defaultPositions));
      return defaultPositions;
    }
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load positions:', error);
    return createDefaultPositions();
  }
};

// 부서 데이터 가져오기
export const getDepartments = (): Department[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(DEPARTMENTS_KEY);
    if (!stored) {
      const defaultDepartments = createDefaultDepartments();
      localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(defaultDepartments));
      return defaultDepartments;
    }
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load departments:', error);
    return createDefaultDepartments();
  }
};

// 직원 데이터 가져오기
export const getEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    if (!stored) {
      const defaultEmployees = createDefaultEmployees();
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaultEmployees));
      return defaultEmployees;
    }
    
    const employees = JSON.parse(stored);
    return employees.map((emp: any) => ({
      ...emp,
      startDate: new Date(emp.startDate),
      createdAt: new Date(emp.createdAt),
      lastLoginAt: new Date(emp.lastLoginAt),
    }));
  } catch (error) {
    console.error('Failed to load employees:', error);
    return createDefaultEmployees();
  }
};

// 조직도 트리 구조 생성
export const getOrganizationTree = (): OrganizationTree[] => {
  const departments = getDepartments();
  const employees = getEmployees();
  
  const buildTree = (parentId?: string): OrganizationTree[] => {
    return departments
      .filter(dept => dept.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(dept => {
        const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          employeeCount: deptEmployees.length,
          level: dept.level,
          parentId: dept.parentId,
          order: dept.order,
          children: buildTree(dept.id)
        };
      });
  };
  
  return buildTree();
};

// 부서별 직원 목록 가져오기
export const getEmployeesByDepartment = (departmentId: string): Employee[] => {
  const employees = getEmployees();
  return employees.filter(emp => emp.departmentId === departmentId);
};

// 직원 검색
export const searchEmployees = (query: string): Employee[] => {
  const employees = getEmployees();
  const lowerQuery = query.toLowerCase();
  
  return employees.filter(emp => 
    emp.name.toLowerCase().includes(lowerQuery) ||
    emp.employeeId.toLowerCase().includes(lowerQuery) ||
    emp.email.toLowerCase().includes(lowerQuery) ||
    emp.position.toLowerCase().includes(lowerQuery)
  );
};
