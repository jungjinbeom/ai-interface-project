# Seamless AI 인터페이스 프로젝트

LLM 기반 인터페이스를 위한 컴포넌트 및 인터페이스 구현 스터디 프로젝트

## 기술 스택

- **클라이언트**: React, TypeScript, Vite, TailwindCSS
- **서버**: Fastify, TypeScript
- **패키지 관리**: PNPM 워크스페이스 (모노레포)
- **코드 품질**: ESLint, Prettier, Husky, lint-staged
- **테스트**: Jest, React Testing Library
- **배포**: Docker

## 프로젝트 구조

```
ai-interface-project/
├── packages/
│   ├── client/             # React + TypeScript 클라이언트
│   ├── server/             # Fastify 서버
│   └── shared/             # 공통 타입 및 유틸
├── .github/                # GitHub Actions 워크플로우
├── .husky/                 # Git hooks
├── .vscode/                # VS Code 설정
└── docker-compose.yml      # Docker 컴포즈 설정
```

## 지원 기능

- REST API (GET/POST)
- Server-Sent Events (SSE)
- WebSocket
- 스트리밍 응답

## 시작하기

### 필수 환경

- Node.js v16 이상
- PNPM v7 이상

### 설치

```bash
# 모든 패키지의 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 클라이언트와 서버 동시 실행
pnpm dev

# 클라이언트만 실행
pnpm dev:client

# 서버만 실행
pnpm dev:server
```

### 코드 품질 관리

```bash
# 린트 실행
pnpm lint

# 린트 후 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format
```

### 테스트

```bash
# 테스트 실행
pnpm test

# 테스트 감시 모드
pnpm test:watch

# 테스트 커버리지 보고서
pnpm test:coverage
```

### 빌드

```bash
# 모든 패키지 빌드
pnpm build
```

### Docker로 실행

```bash
# 프로덕션 빌드 및 실행
docker-compose up --build

# 개발 환경에서 실행
docker-compose up --build dev
```

## 개발 가이드

### 컴포넌트 추가하기

새로운 컴포넌트를 추가할 때는 다음 구조를 따라주세요:

```
src/components/ComponentName/
├── index.tsx           # 컴포넌트 코드
├── ComponentName.test.tsx  # 테스트 코드
└── ComponentName.module.css  # (선택적) 스타일
```

### 커스텀 훅 개발하기

커스텀 훅은 다음 구조를 따라주세요:

```
src/hooks/useHookName.ts
src/hooks/useHookName.test.ts
```

## 문서화

- 각 컴포넌트와 중요 함수에는 JSDoc 주석을 추가해주세요.
- README.md 파일을
