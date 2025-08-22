# HEM 일정 관리 시스템

AI 기반 자연어 일정 관리 시스템입니다. 사용자의 자연스러운 말투로 일정을 생성, 수정, 삭제, 조회할 수 있습니다.

## 🚀 주요 기능

- **🤖 AI 통합 어시스턴트**: 일정 관리 + 일반 대화 모두 지원
- **📅 자연어 일정 관리**: AI가 사용자의 자연스러운 말투를 이해
- **💬 일반 대화 기능**: 인사, 회사 소개, 일상 대화 등
- **🔄 대화형 정보 수집**: 부족한 정보를 대화를 통해 수집
- **🔍 스마트한 일정 조회**: 날짜별, 제목별, 키워드별 조회
- **👥 사용자별 데이터**: 다중 사용자 지원
- **🏢 조직도 관리**: 회사 조직 구조 및 직원 관리

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-3.5-turbo (자연어 이해)
- **MCP**: Model Context Protocol (도구 연결)
- **Database**: Local Storage (개발용)
- **State Management**: React Context API

## 📋 설치 및 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 다음을 추가하세요:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Optional: Customize the system prompt
SYSTEM_PROMPT=당신은 HEM 회사의 일정 관리 AI 어시스턴트입니다. 사용자의 자연어 요청을 이해하고 적절한 MCP 도구를 선택하여 일정을 관리해주세요.
```

### 3. OpenAI API 키 발급
1. [OpenAI Platform](https://platform.openai.com/)에서 계정 생성
2. API 키 발급
3. `.env.local`에 API 키 입력

### 4. 개발 서버 실행
```bash
npm run dev
```

## 🎯 사용법

### 📅 일정 관리
```
"내일 오후 2시에 팀 미팅 일정을 추가해줘"
"다음 주 수요일 오전 10시에 고객 상담 잡아줘"
"오늘 밤 9시에 it팀 미팅이야"
"오늘 일정 보여줘"
"팀 미팅 일정 삭제해줘"
"미팅 관련 일정 찾아줘"
```

### 💬 일반 대화
```
"안녕하세요"
"HEM 회사에 대해 알려주세요"
"오늘 날씨는 어때요?"
"좋은 하루 보내세요"
"감사합니다"
"도움이 되었습니다"
```

### 🔄 혼합 대화
```
사용자: "안녕하세요! 오늘 하루 어땠나요?"
AI: "안녕하세요! 저는 AI라서 하루가 어땠다고 말하기는 어렵지만..."

사용자: "그럼 내일 오후 2시에 팀 미팅 일정 잡아주세요"
AI: "네! 내일 오후 2시에 팀 미팅 일정을 생성하겠습니다..."
```

## 🤖 AI 기반 통합 어시스턴트

이 시스템은 OpenAI GPT 모델을 사용하여 사용자의 자연어를 이해합니다:

- **🎯 의도 분석**: 일정 관리 vs 일반 대화 자동 구분
- **🧠 맥락 이해**: 이전 대화와 연관성 파악
- **🗣️ 유연한 표현**: 다양한 말투와 표현 방식 지원
- **⚡ 지능형 파싱**: 정규식이 아닌 AI가 의미를 이해
- **💭 대화형 정보 수집**: 부족한 정보를 자연스럽게 요청
- **🔄 자연스러운 전환**: 일반 대화에서 일정 관리로 자연스럽게 전환

## 🏗️ 아키텍처

```
사용자 입력 → LLM 분석 → 의도 분석 → 응답 생성
     ↓              ↓         ↓         ↓
  자연어        맥락 이해   ┌─ 일반 대화 → 직접 응답
                          └─ 일정 관리 → MCP 도구 실행 → 결과 반환
```

### 처리 흐름
1. **입력 분석**: 사용자의 자연어 입력을 받음
2. **의도 파악**: LLM이 일정 관리 vs 일반 대화 구분
3. **응답 생성**: 
   - 일반 대화 → 직접 한국어 응답
   - 일정 관리 → MCP 도구 선택 및 실행

### MCP 도구들
- `create_schedule`: 일정 생성
- `update_schedule`: 일정 수정
- `delete_schedule`: 일정 삭제
- `search_schedules`: 일정 검색
- `list_schedules`: 전체 일정 조회
- `get_schedules_by_date`: 날짜별 일정 조회

## 🔧 개발자 정보

### 프로젝트 구조
```
src/
├── components/          # React 컴포넌트
├── contexts/           # React Context
├── lib/               # 서비스 로직
├── types/             # TypeScript 타입 정의
└── app/               # Next.js App Router
```

### 주요 파일
- `src/lib/llmService.ts`: LLM 통합 서비스
- `src/lib/mcpService.ts`: MCP 도구 실행
- `src/components/ChatInterface.tsx`: 메인 채팅 인터페이스
- `src/contexts/UserContext.tsx`: 사용자 상태 관리

## 🚧 개발 중인 기능

- [ ] 일정 알림 시스템
- [ ] 캘린더 동기화
- [ ] 팀 일정 공유
- [ ] 모바일 앱

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
