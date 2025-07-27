// import { v4 as uuidv4 } from 'uuid'; // Currently unused

export interface MockChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface MockStreamChunk {
    content: string;
    isDone: boolean;
}

export class FallbackService {
    private responses = [
        '안녕하세요! 현재 OpenAI API 키가 설정되지 않아 모의 응답을 제공하고 있습니다.',
        'OpenAI API 키를 설정하면 실제 AI 응답을 받을 수 있습니다.',
        '이것은 fallback 모드에서의 응답입니다. 실제 설정을 위해 README.md를 참고해주세요.',
        '현재 데모 모드로 작동 중입니다. 실제 AI 기능을 사용하려면 .env 파일에 OPENAI_API_KEY를 설정해주세요.',
    ];

    async createMockChatCompletion(messages: MockChatMessage[]): Promise<{ role: 'assistant'; content: string }> {
        // 약간의 지연을 추가하여 실제 API 호출처럼 보이게 함
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

        const lastMessage = messages[messages.length - 1];
        let response: string;

        // 사용자 메시지에 따른 맞춤 응답
        if (lastMessage.content.toLowerCase().includes('hello') || lastMessage.content.toLowerCase().includes('안녕')) {
            response =
                '안녕하세요! 현재 데모 모드로 작동 중입니다. OpenAI API 키를 설정하면 실제 AI와 대화할 수 있습니다.';
        } else if (
            lastMessage.content.toLowerCase().includes('설정') ||
            lastMessage.content.toLowerCase().includes('config')
        ) {
            response =
                'API 키 설정 방법:\n1. .env 파일을 열어주세요\n2. OPENAI_API_KEY=your-key-here 를 입력하세요\n3. 서버를 재시작해주세요';
        } else if (lastMessage.content.toLowerCase().includes('test')) {
            response = '테스트 응답입니다. 현재 OpenAI API가 연결되지 않아 모의 응답을 제공하고 있습니다.';
        } else {
            // 랜덤 응답 선택
            const randomIndex = Math.floor(Math.random() * this.responses.length);
            response = this.responses[randomIndex];

            // 사용자 메시지에 대한 간단한 에코 추가
            response += `\n\n참고: 귀하의 메시지 "${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}"를 받았습니다.`;
        }

        return {
            role: 'assistant',
            content: response,
        };
    }

    async *createMockStreamingCompletion(messages: MockChatMessage[]): AsyncGenerator<MockStreamChunk> {
        const response = await this.createMockChatCompletion(messages);
        const { content } = response;

        // 문자 단위로 스트리밍 시뮬레이션
        for (let i = 0; i < content.length; i++) {
            yield {
                content: content[i],
                isDone: i === content.length - 1,
            };

            // 타이핑 효과를 위한 지연
            await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 70));
        }
    }

    getSystemInfo(): { mode: string; message: string; instructions: string } {
        return {
            mode: 'fallback',
            message: 'OpenAI API가 설정되지 않아 데모 모드로 작동 중입니다.',
            instructions: 'OpenAI API 키를 .env 파일에 설정하고 서버를 재시작하면 실제 AI 응답을 받을 수 있습니다.',
        };
    }
}

export const fallbackService = new FallbackService();
