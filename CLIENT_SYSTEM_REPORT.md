### 스트리밍 SSE 및 연관 로직 분석 보고서 (packages/client)

#### 범위

- 본 문서는 클라이언트 내 스트리밍 SSE 처리 및 연관 로직에 한정합니다.
- 주요 파일: `features/chat/api/{client.ts, chatApi.ts, queries.ts}`, `features/chat/lib/streamingHandler.ts`, `shared/api/base.ts`.

#### 구성 요소 개요

- **BaseApiClient (`shared/api/base.ts`)**
    - `streamRequest(endpoint, options)`: 인증 헤더를 주입하여 `fetch`로 스트리밍 가능한 `Response` 반환.
- **ChatApiClient (`features/chat/api/client.ts`)**
    - `sendMessage(messages, conversationId)`: `/api/chat/stream` 엔드포인트에 POST, 서버에서 SSE 응답을 반환받음.
- **Streaming Handler (`features/chat/lib/streamingHandler.ts`)**
    - `SSEStreamingHandler`: `ReadableStream`을 읽어 라인 단위로 파싱, 이벤트(`message`, `done`, `error`, `timeout`)를 콜백으로 전달.
    - AbortController 통합: 내부 `abortController` 및 선택적 외부 `signal`과 연동, `cancel()`/타임아웃/외부 abort 시 스트림과 리소스를 정리.
- **Mutation 파이프라인 (`features/chat/api/queries.ts`)**
    - `useSendMessageMutation`: 낙관적 사용자 메시지 추가 → 서버에 스트리밍 요청 → 핸들러 이벤트에 맞춰 어시스턴트 메시지 실시간 갱신/완료/에러 처리 및 React Query 캐시 무효화.

#### SSE 데이터 플로우 (상세)

1. 입력/요청 준비
    - 사용자가 메시지를 제출하면 `useSendMessageMutation.mutationFn`이 실행됨.
    - `MessageFactory.createUserMessage(content)`로 사용자 메시지를 생성하여 스토어에 즉시 추가(낙관적 업데이트).
    - 현재 스토어의 성공 상태 메시지 + 방금 생성한 사용자 메시지를 합쳐 서버 요청 페이로드(`ChatCompletionRequest`)를 구성.

2. 스트리밍 요청 전송
    - `chatApi.sendMessage(currentMessages, threadId)` 호출 → 내부적으로 `ChatApiClient.sendMessage` 실행.
    - `ChatApiClient.sendMessage`는 `BaseApiClient.streamRequest('/api/chat/stream', { method: 'POST', body })`를 호출하고, 인증 헤더를 포함한 `fetch`를 통해 스트리밍 가능한 `Response`를 반환받음.
    - 클라이언트는 어시스턴트 응답을 표시하기 위한 플레이스홀더 메시지(`createAssistantMessage('')`)를 생성하여 스토어에 추가하고, 이후의 스트리밍 청크를 여기에 누적.

3. 스트림 핸들링 시작
    - `createStreamingHandler({ messageId, currentThreadId, timeout, onEvent, onError, onComplete })`로 핸들러 인스턴스 생성.
    - `handler.handleStream(response)` 호출 시 내부적으로 `response.body.getReader()`를 얻고, 타임아웃 타이머 설정 후 청크 처리 루프 진입.
    - Abort 연동: 내부 `attachAbortHandlers`가 외부 `signal`(옵션) 및 내부 `abortController.signal`에 리스너를 걸어, abort 시 `reader.cancel()` → 정리 → `AbortError`로 종료.

4. SSE 청크 처리/파싱
    - 스트림에서 `Uint8Array` 청크를 읽고 `TextDecoder`로 텍스트 누적(`buffer`).
    - `\n` 기준으로 분리된 각 라인을 검사:
        - `data: [DONE]` → `done` 이벤트 처리: 타이머 해제, 정리, `onComplete(threadId)` 호출 및 Promise resolve.
        - `data: { ...json }` → JSON 파싱 후 `message` 이벤트 방출: `SSEMessageData`에 포함된 `id`, `content`, `conversationId`, `isDone` 등을 전달.
        - `event: error` → `error` 이벤트로 간주하여 에러 처리 루트로 이동.

5. 이벤트 기반 UI/스토어 갱신
    - `onEvent({ type: 'message', data })`에서 수행되는 작업(`useSendMessageMutation` 내부):
        - `conversationId` 수신 시: 기존에 스레드 ID가 비어 있었다면 `setCurrentThreadId(conversationId)`로 설정.
        - 메시지 ID 동기화: 서버에서 최초로 부여하는 `id`가 플레이스홀더 ID와 다르면, 기존 플레이스홀더 제거 후 새로운 ID로 대체.
        - 콘텐츠 누적: `accumulatedContent += data.content` 방식으로 청크를 이어붙이고, 해당 ID의 어시스턴트 메시지를 `status: 'sending'`으로 갱신.
    - `onEvent({ type: 'timeout' })`: 타임아웃 시 어시스턴트 메시지 `status: 'error'`로 표시.

6. 완료 처리
    - `onComplete(responseThreadId)`에서 로딩 상태 해제 및 최종적으로 어시스턴트 메시지를 `status: 'success'`로 변경.
    - React Query 캐시 무효화: 스레드 목록(`QUERY_KEYS.threads.list()`), 그리고 `responseThreadId`가 있으면 해당 스레드 메시지 쿼리 무효화.

7. 오류/중단 처리 경로
    - 네트워크/파싱 오류: `handleError` → 정리 → `onError(error)` 콜백 호출, 뮤테이션 쪽에서 어시스턴트 메시지를 `error`로 표시하고 로딩 해제.
    - 타임아웃: 타이머 만료 시 `timeout` 이벤트 방출, 내부적으로 `abortController.abort('timeout')` 및 `reader.cancel()` 호출 → 정리 후 Promise reject.
    - 수동 취소(`cancel()`): 내부 abort 발생 → `reader.cancel()` → 정리 → `AbortError`로 종료.
    - 외부 AbortSignal: 전달된 `options.signal`이 abort되면 동일한 경로로 정리 및 종료.

#### 개선 포인트 (SSE 한정)

- `fetch` Abort 연동: 현재 핸들러는 Abort를 처리하지만 `BaseApiClient.streamRequest`가 `signal`을 전달하지 않음. 요청 호출부에서 `signal: handler.getSignal()`을 `fetch`에 연결하면 네트워크 레벨에서 즉시 중단 가능.
- 스키마 검증: `SSEMessageData`에 Zod 스키마를 적용해 파싱 실패/필드 누락 시 조기 감지 및 안전 처리.
- UI 업데이트 백프레셔: 긴 스트림에서 스토어 업데이트를 배치(`requestAnimationFrame`, throttle/debounce)하여 렌더/스토어 부하를 줄임.
- 에러 유형 구분: `error` 이벤트/네트워크 오류/Abort 구분하여 사용자 메시지 및 재시도 UX 차별화.

#### 시퀀스(요약)

1. 사용자 입력 → 뮤테이션 트리거 → 사용자 메시지 낙관적 추가
2. `/api/chat/stream` POST → `Response.body.getReader()`로 스트림 생성
3. 핸들러가 청크 반복 읽기 → 라인 분리 → `data:` 파싱 → 이벤트 콜백 호출
4. 스토어: 콘텐츠 누적/ID 동기화/스레드 ID 설정/상태 갱신
5. `[DONE]` 수신 시 완료 처리 및 캐시 무효화, 에러/타임아웃/취소는 각 경로에 따라 정리 및 상태 반영

#### 스트리밍(SSE)

- `features/chat/lib/streamingHandler.ts`
    - 줄 단위 `data:` 라인을 파싱하여 `message`/`done`/`error`/`timeout` 이벤트 방출
    - 내부 버퍼와 `TextDecoder`로 `ReadableStreamDefaultReader` 청크 처리
    - 타임아웃(기본 30초, 채팅에선 60초 사용) 시 `timeout` 이벤트, abort, 정리 수행

- `features/chat/api/queries.ts`의 `useSendMessageMutation`
    - 사용자 메시지 낙관적 추가 → 스트리밍 요청 → 어시스턴트 플레이스홀더 생성
    - `onEvent`에서 `content` 누적, 어시스턴트 메시지 ID 재동기화, `conversationId` 수신 시 저장
    - `onComplete`: 로딩 해제, 성공 처리, 스레드/메시지 쿼리 무효화
    - `onError`/timeout: 에러 표시 및 로딩 해제

#### 채팅 뷰 모델

- `features/chat/lib/useChatViewModel.ts`
    - 스레드 목록/메시지 쿼리 구독
    - 라우트 변경 시 `currentThreadId` 동기화, thread 전환 시에만 메시지 초기화
    - `handleSendMessage(content)`를 통해 mutation 호출 노출

#### 스레드 기능(개요)

- 사이드바 컨테이너/훅으로 스레드 목록/선택 관리
- 쿼리 키 유틸(`shared/lib/react-query.ts`, import로 추정)로 목록/스레드별 메시지 캐시 키 관리

#### 데이터 플로우 요약

1. 사용자가 `ChatContainer`에서 입력 → 뮤테이션 실행
2. 사용자 메시지 낙관적 추가 후 스트리밍 요청 전송
3. 서버 SSE 응답을 핸들러가 수신하여 `message` 이벤트로 청크 전달
4. 누적 콘텐츠로 어시스턴트 메시지를 점진적으로 갱신
5. `[DONE]` 수신 시 완료 처리 및 캐시 무효화/성공 표시
6. 에러/타임아웃 시 abort 및 에러 상태 표시

#### 권장사항

- **Abort 연동**: `BaseApiClient.streamRequest`에 `signal` 옵션을 받아 `fetch`에 전달하고, 호출부에서 `streamingHandler.getSignal()` 연결
- **스키마 검증**: SSE 메시지에 Zod 스키마 적용하여 파싱 안정성 확보
- **백프레셔**: UI 업데이트 배치(예: `requestAnimationFrame`, 디바운스)로 스토어 업데이트 빈도 완화
- **메트릭**: 바이트/메시지/지연시간 수집 및 개발 시 가시화
- **라우터-스레드 동기화**: 새로고침 시에도 일관되도록 URL 중심 스레드 선택 유지
- **에러 UX**: 타임아웃/중단 사유를 사용자 친화적으로 표시하고 재시도 제공

#### 빠른 연동 예시(Abort 전달)

```ts
// BaseApiClient.streamRequest
protected async streamRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const headers = await this.getAuthHeaders();
  const response = await fetch(`${this.apiBase}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
    // signal: options.signal, // 옵션으로 signal 전달 가능하도록 확장
  });
  if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
  return response;
}

// 호출부 예시
const handler = createStreamingHandler({ /* ... */ });
// chatApiClient.sendMessage를 확장하여 signal을 넘기도록 변경 권장
// await chatApiClient.sendMessage(messages, threadId, { signal: handler.getSignal() })
```
