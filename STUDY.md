## 스터디 과제

### 2. 컴포넌트 개선 (난이도: ⭐)

#### 문제점

- 기존 컴포넌트들의 UX 및 성능상 개선 여지 존재
- 사용자 경험 최적화 필요

#### 개선 과제

```typescript
// 어떤 부분이라도, 개선이 필요한 컴포넌트 개선
// 예시: MessageList, MessageItem, InputBox, Sidebar 등

// UX적 개선 예시:
- 더 나은 로딩 상태 표시
- 애니메이션 및 트랜지션 개선
- 에러 상태 피드백 개선
- 인터랙션 개선 (hover, focus 등)

// 성능상 개선 예시:
- 불필요한 리렌더링 방지
- 메모이제이션 최적화
- 상태 관리 최적화
- DOM 조작 최적화
```

**구현 요구사항**:

- 개선 대상 컴포넌트 선택 및 이유 설명
- UX적 개선 혹은 성능상의 개선 등 어떠한 개선이든 이유와 함께 리팩토링
- 개선 전후 비교 및 측정 가능한 지표 제시

## 개선 사항

```typescript
- InputBox
  이유 : abort 기능 및 버튼을 통해 AI 제대로 호출 했는지 여부를 알기 위해 추가
  개선 : API 호출 시 정지 기능에 대한 아이콘
  
- ThreadSidebar
  이유
   - isCollapsed 상태 시 MessageSquare 아이콘, ChevronRight 아이콘 UI 부자연스럽게 변경
  개선
   - 마우스 hover 통해 처음에는 MessageSquare 아이콘에서 hover 시 ChevronRight 아이콘으로 변경
  추후 개선사항
   - 채팅 목록 아이콘, 채팅 목록 UI 추가 예정
   - 채팅 목록 아이콘 클릭 시 메인 컨텐츠 채팅 목록 UI로 변경 
  참고 - ChatGPT

- MarkdownMessageItem
  이유 : AI 컨텐츠 내용에 길이 따라 너비가 초과되어 스크롤이 생김
  개선 : 메시지 템플릿에 맞게 마크다운 템플릿 너비 조정, 콘텐츠 길이에 맞게 너비 조정

- useChatStore isStreaming 상태, SetIsStreaming 상태 변경 함수 추가
  이유 : API 호출 이후 streaming 처리에 대한 상태를 관리하고 isStreaming 상태를 사용하여 세밀한 컴포넌트 조작을 위해
  추후 개선 사항 : isStreaming 상태를 사용한 Loading 컴포넌트 추가 예정 

```
