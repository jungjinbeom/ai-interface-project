# Streaming Architecture Enhancement - Group Study Assignment

## 📚 학습 목표

이 과제는 AI Interface Project의 SSE(Server-Sent Events) 스트리밍 아키텍처를 분석하고 개선하는 것을 목표로 합니다. 실제 프로덕션 환경에서 발생할 수 있는 다양한 문제점들을 식별하고, 이를 해결하기 위한 구체적인 개선 방안을 구현해보세요.

## 🎯 과제 개요

### 현재 스트리밍 핸들러 구조 분석

#### 📁 파일 구조

```
packages/client/src/features/chat/
├── api/
│   ├── queries.ts              # 리팩토링된 useSendMessageMutation
│   └── chatApi.ts              # HTTP 클라이언트
├── lib/
│   ├── streamingHandler.ts     # 새로 추가된 SSE 핸들러 클래스
│   └── useChatViewModel.ts     # 비즈니스 로직 훅
└── model/
    └── store.ts                # Zustand 상태 관리
```

#### 🔧 SSEStreamingHandler 클래스 개요

**핵심 책임**:

- SSE 스트림 데이터 수신 및 파싱
- 청크 단위 텍스트 디코딩
- 이벤트 기반 콜백 처리
- 타임아웃 및 에러 관리
- 리소스 정리

**주요 메서드**:

```typescript
class SSEStreamingHandler {
    handleStream(response: Response): Promise<string | undefined>;
    private processStreamChunks(): Promise<void>;
    private processSSELine(line: string): StreamingEvent | null;
    private setupTimeout(): void;
    private cleanup(): void;
    cancel(): void;
}
```

**데이터 플로우**:

1. `Response.body.getReader()`로 스트림 리더 생성
2. `while` 루프로 청크 단위 데이터 읽기
3. `TextDecoder`로 UTF-8 디코딩
4. 라인 단위 파싱 (`data: `, `event: ` 처리)
5. JSON 파싱 후 이벤트 콜백 호출
6. `[DONE]` 신호 시 스트림 완료

**현재 지원하는 SSE 이벤트**:

- `data: {...}` - 메시지 데이터
- `data: [DONE]` - 스트림 완료
- `event: error` - 에러 발생

#### 🔄 useSendMessageMutation 리팩토링 효과

**Before (기존)**: 170줄의 복잡한 인라인 스트리밍 로직
**After (개선)**: 50줄의 깔끔한 콜백 기반 처리

**주요 개선점**:

- 관심사 분리: 스트리밍 로직 vs 상태 관리
- 재사용성: 다른 컴포넌트에서도 사용 가능
- 테스트 용이성: 독립적인 클래스로 단위 테스트 가능
- 가독성: 비즈니스 로직과 기술적 구현 분리

### 개선 대상 영역

1. **에러 처리 및 복구**
2. **성능 최적화**
3. **사용자 경험 개선**
4. **테스트 가능성**
5. **코드 분석 및 문서화**

## 🔧 개선 과제 목록

### 1. 현재 시스템 분석 및 문서화 (난이도: ⭐ - 초급자용)

#### 문제점

- 새로운 팀원이 스트리밍 아키텍처를 이해하기 어려움
- 코드 흐름과 데이터 구조에 대한 체계적인 문서 부족

#### 개선 과제

```markdown
// TODO: packages/client/src/features/chat/STREAMING_ANALYSIS.md 생성

# 스트리밍 시스템 분석 보고서

## 1. 코드 플로우 분석

- useSendMessageMutation 실행 과정 단계별 설명
- SSEStreamingHandler 생명주기 분석
- Zustand store 상태 변화 추적

## 2. 데이터 구조 분석

- SSEMessageData 인터페이스 필드별 설명
- StreamingEvent 타입들의 용도와 발생 조건
- ChatMessage 상태(sending, success, error) 전환 조건

## 3. 에러 케이스 분석

- 현재 처리되는 에러 유형들
- 각 에러에 대한 사용자 피드백 방식
- 개선이 필요한 에러 시나리오들
```

**구현 요구사항**:

- 코드를 직접 읽고 실행 흐름 파악
- 브라우저 개발자 도구로 네트워크 탭 관찰
- 실제 스트리밍 과정을 단계별로 기록
- 개선점 3-5개 제안

**학습 포인트**:

- 코드 리딩 스킬 향상
- SSE 프로토콜 이해
- React 상태 관리 패턴 학습

### 2. SSE 스트림 Abort 로직 구현 (난이도: ⭐⭐⭐)

#### 문제점

- 사용자가 스트리밍 중 응답을 중단할 수 없음
- 새로운 메시지 전송 시 이전 스트림이 계속 실행됨
- 메모리 누수 및 불필요한 네트워크 사용

#### 개선 과제

```typescript
// TODO: packages/client/src/features/chat/lib/streamingController.ts 생성

interface StreamController {
    abortController: AbortController;
    streamId: string;
    isActive: boolean;
}

class StreamingAbortManager {
    private activeStreams: Map<string, StreamController>;

    // 구현해야 할 메서드들:
    startStream(streamId: string): AbortController;
    abortStream(streamId: string): void;
    abortAllStreams(): void;
    isStreamActive(streamId: string): boolean;
    cleanup(): void;
}
```

**구현 요구사항**:

- AbortController를 활용한 스트림 취소
- 여러 스트림 동시 관리
- 컴포넌트 언마운트 시 자동 정리
- 사용자 인터페이스에 "중단" 버튼 추가
- 중단된 메시지 상태 처리

**학습 포인트**:

- AbortController API 활용
- 리소스 생명주기 관리
- 사용자 경험 개선

### 3. 스트림 출력 속도 조절 및 청크 최적화 (난이도: ⭐⭐⭐)

#### 문제점

- 스트리밍 속도가 너무 빨라 사용자가 읽기 어려움
- 청크 크기가 일정하지 않아 UI 깜빡임 발생
- 네트워크 대역폭에 따른 적응형 처리 부족

#### 개선 과제

```typescript
// TODO: packages/client/src/features/chat/lib/streamThrottler.ts 생성

interface ThrottleConfig {
    minDelay: number; // 최소 지연 시간
    maxDelay: number; // 최대 지연 시간
    chunkSize: number; // 청크 크기
    adaptiveMode: boolean; // 적응형 모드
}

class StreamThrottler {
    // 구현해야 할 메서드들:
    throttleChunk(chunk: string, config: ThrottleConfig): Promise<string[]>;
    calculateOptimalDelay(networkSpeed: number): number;
    adjustChunkSize(contentType: string): number;
    enableTypingEffect(element: HTMLElement): void;
}
```

**구현 요구사항**:

- 타이핑 효과로 점진적 텍스트 표시
- 네트워크 속도 감지 및 적응형 조절
- 청크 크기 동적 조정
- 사용자 설정으로 속도 커스터마이징
- 코드 블록과 일반 텍스트 구분 처리

**학습 포인트**:

- 성능과 UX 밸런스
- 적응형 알고리즘 설계
- DOM 조작 최적화

### 4. SSE 이벤트 처리 로직 최적화 (난이도: ⭐⭐⭐⭐)

#### 문제점

- 이벤트 처리 중 메모리 누수 발생 가능
- 대용량 스트림 처리 시 성능 저하
- 에러 복구 로직 부족
- 이벤트 순서 보장 미흡

#### 개선 과제

```typescript
// TODO: packages/client/src/features/chat/lib/optimizedSSEHandler.ts 생성

interface OptimizedSSEConfig {
    bufferSize: number;
    maxMemoryUsage: number;
    enableCompression: boolean;
    enableRetry: boolean;
    eventPriority: EventPriority[];
}

class OptimizedSSEHandler extends SSEStreamingHandler {
    private eventQueue: PriorityQueue<SSEEvent>;
    private memoryMonitor: MemoryMonitor;
    private compressionWorker: Worker;

    // 구현해야 할 메서드들:
    processEventQueue(): void;
    handleBackpressure(): void;
    compressLargePayloads(data: string): Promise<string>;
    validateEventSequence(event: SSEEvent): boolean;
    recoverFromError(error: Error): Promise<void>;
}
```

**구현 요구사항**:

- 이벤트 우선순위 큐 구현
- 메모리 사용량 모니터링 및 제한
- Web Worker를 활용한 압축 처리
- 이벤트 순서 검증 및 재정렬
- 자동 에러 복구 메커니즘
- 백프레셔(backpressure) 처리

**학습 포인트**:

- 고성능 이벤트 처리
- 메모리 관리 고급 기법
- Web Worker 활용
- 분산 시스템 개념

## 🎨 UI/UX 개선 과제

### 5. 에러 상태 UI 개선 (난이도: ⭐⭐)

#### 개선 과제

- 에러 유형별 아이콘 및 메시지
- 재시도 버튼 추가
- 에러 상세 정보 표시 (개발자 모드)
- 사용자 친화적 에러 안내

## 🚀 시작하기

### 1. 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 테스트 실행
pnpm test --watch
```

### 2. 과제 선택 및 브랜치 생성

```bash
# 개선하고 싶은 영역으로 브랜치 생성 (본인 이름 포함)
git checkout -b feature/system-analysis-{your-name}
git checkout -b feature/stream-abort-{your-name}
git checkout -b feature/stream-throttle-{your-name}
git checkout -b feature/sse-optimization-{your-name}
git checkout -b feature/error-ui-{your-name}

# 예시:
git checkout -b feature/system-analysis-jihoon
git checkout -b feature/stream-abort-sarah
git checkout -b feature/stream-throttle-alex
git checkout -b feature/sse-optimization-mike
```

### 3. 구현 및 테스트

- 선택한 개선 과제 구현
- 테스트 코드 작성
- 기존 기능 동작 확인

## 💡 추가 학습 리소스

### 관련 기술 문서

- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [ReadableStream API](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [Zod 스키마 검증](https://zod.dev/)
- [React Query 최적화](https://tanstack.com/query/latest)

### 성능 최적화 가이드

- [Web Vitals](https://web.dev/vitals/)
- [Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [Worker Threads](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)

### 테스팅 도구

- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/)

**전체 과제를 다 읽으셨다면 지금 바로 스터디장에게 API key를 달라고 요청해주세요!**
**화이팅! 🚀**
