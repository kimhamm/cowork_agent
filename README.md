# HEM Agent - MCP 기반 일정 관리 애플리케이션

HEM Agent는 Model Context Protocol (MCP) 기반으로 자연어를 통해 일정을 관리할 수 있는 현대적인 웹 애플리케이션입니다.

## 🚀 주요 기능

### 💬 자연어 일정 관리
- **일정 생성**: "내일 오후 2시에 "팀 미팅" 일정을 추가해줘"
- **일정 수정**: "ID abc123 일정을 "고객 미팅"으로 수정해줘"
- **일정 삭제**: "ID abc123 일정을 삭제해줘"
- **일정 검색**: ""미팅" 일정을 검색해줘"
- **일정 목록**: "모든 일정을 보여줘"

### 📅 캘린더 뷰
- 월간 캘린더로 일정을 한눈에 확인
- 날짜별 일정 상세 보기
- 직관적인 UI/UX

### 🎨 현대적인 인터페이스
- 반응형 디자인
- 다크/라이트 테마 지원
- 직관적인 네비게이션

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 14, TypeScript, Tailwind CSS
- **상태 관리**: React Hooks
- **날짜 처리**: date-fns
- **아이콘**: Lucide React
- **데이터 저장**: LocalStorage (로컬)

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
```
http://localhost:3000
```

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/             # React 컴포넌트
│   ├── Header.tsx         # 헤더 (프로필, 설정)
│   ├── Sidebar.tsx        # 사이드바 (메뉴)
│   ├── ChatInterface.tsx  # 채팅 인터페이스
│   └── Calendar.tsx       # 캘린더 뷰
├── lib/                   # 유틸리티 및 서비스
│   ├── scheduleService.ts # 일정 관리 서비스
│   └── mcpService.ts      # MCP 자연어 처리
└── types/                 # TypeScript 타입 정의
    └── schedule.ts        # 일정 관련 타입
```

## 🔧 MCP (Model Context Protocol) 구현

### 자연어 파싱
애플리케이션은 사용자의 자연어 입력을 분석하여 다음과 같은 패턴을 인식합니다:

- **일정 생성 패턴**: `[시간]에 "[제목]" 일정을 추가해줘`
- **일정 수정 패턴**: `ID [ID] 일정을 [수정사항]으로 수정해줘`
- **일정 삭제 패턴**: `ID [ID] 일정을 삭제해줘`
- **일정 검색 패턴**: `"[검색어]" 일정을 검색해줘`

### MCP 도구
- `create_schedule`: 새 일정 생성
- `update_schedule`: 기존 일정 수정
- `delete_schedule`: 일정 삭제
- `search_schedules`: 일정 검색
- `list_schedules`: 전체 일정 목록

## 📱 사용법

### 1. 일정 추가
```
"내일 오후 2시에 "팀 미팅" 일정을 추가해줘"
"다음주 월요일 오전 10시에 "고객 상담" 일정을 등록해줘"
```

### 2. 일정 관리
```
"ID abc123 일정을 "프로젝트 회의"로 수정해줘"
"ID abc123 일정을 삭제해줘"
```

### 3. 일정 조회
```
""미팅" 일정을 검색해줘"
"모든 일정을 보여줘"
```

## 🔮 향후 계획

- [ ] 데이터베이스 연동 (PostgreSQL, MongoDB)
- [ ] 사용자 인증 및 권한 관리
- [ ] 팀 일정 공유 기능
- [ ] 알림 및 리마인더
- [ ] 모바일 앱 개발
- [ ] API 엔드포인트 제공
- [ ] 웹훅 및 통합 기능

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**HEM Agent** - 자연어로 일정을 관리하는 스마트한 방법
