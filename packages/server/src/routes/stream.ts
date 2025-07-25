import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { ChatCompletionRequest, ChatStreamChunk } from 'shared/types/chat';
import { fallbackService, openaiService } from '@/services';
import OpenAI from 'openai';

export function registerStreamRoutes(fastify: FastifyInstance) {
    // 스트리밍 응답을 위한 라우트
    fastify.post<{ Body: ChatCompletionRequest }>('/api/chat/stream', async (request, reply) => {
        try {
            const { messages, conversationId } = request.body;

            const messageId = uuidv4();
            const convoId = conversationId || uuidv4();

            // 응답 헤더 설정
            reply.raw.writeHead(200, {
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked',
            });

            // OpenAI가 설정되었는지 확인
            if (!openaiService.isInitialized()) {
                // Fallback 서비스 사용
                const fallbackMessages = messages.map((msg) => ({
                    role: msg.role as 'user' | 'assistant' | 'system',
                    content: msg.content,
                }));

                // 초기 경고 메시지
                const warningMessage = '⚠️ OpenAI API가 설정되지 않았습니다.\n\n';
                for (const char of warningMessage) {
                    const chunk: ChatStreamChunk = {
                        id: messageId,
                        content: char,
                        role: 'assistant',
                        conversationId: convoId,
                        isDone: false,
                    };
                    reply.raw.write(JSON.stringify(chunk) + '\n');
                    await new Promise((resolve) => setTimeout(resolve, 30));
                }

                // Fallback 응답 스트리밍
                for await (const mockChunk of fallbackService.createMockStreamingCompletion(fallbackMessages)) {
                    const streamChunk: ChatStreamChunk = {
                        id: messageId,
                        content: mockChunk.content,
                        role: 'assistant',
                        conversationId: convoId,
                        isDone: false,
                    };
                    reply.raw.write(JSON.stringify(streamChunk) + '\n');
                }

                // 설정 안내 메시지
                const setupMessage =
                    '\n\n💡 실제 AI 응답을 받으려면:\n1. .env 파일에 OPENAI_API_KEY를 설정하세요\n2. 서버를 재시작하세요';
                for (const char of setupMessage) {
                    const chunk: ChatStreamChunk = {
                        id: messageId,
                        content: char,
                        role: 'assistant',
                        conversationId: convoId,
                        isDone: false,
                    };
                    reply.raw.write(JSON.stringify(chunk) + '\n');
                    await new Promise((resolve) => setTimeout(resolve, 30));
                }

                // 완료 청크
                const finalChunk: ChatStreamChunk = {
                    id: messageId,
                    content: '',
                    role: 'assistant',
                    conversationId: convoId,
                    isDone: true,
                };
                reply.raw.write(JSON.stringify(finalChunk) + '\n');
            } else {
                // OpenAI 메시지 형식으로 변환
                const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map((msg) => ({
                    role: msg.role as 'user' | 'assistant' | 'system',
                    content: msg.content,
                }));

                // OpenAI 스트리밍 호출
                const stream = await openaiService.createStreamingChatCompletion(openaiMessages);

                // OpenAI 스트림 처리
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    const finishReason = chunk.choices[0]?.finish_reason;

                    if (content) {
                        const streamChunk: ChatStreamChunk = {
                            id: messageId,
                            content,
                            role: 'assistant',
                            conversationId: convoId,
                            isDone: finishReason === 'stop',
                        };

                        // JSON 형식으로 각 청크 전송
                        reply.raw.write(JSON.stringify(streamChunk) + '\n');
                    }

                    // 스트리밍 완료 시 종료
                    if (finishReason === 'stop') {
                        break;
                    }
                }
            }

            reply.raw.end();
        } catch (err) {
            fastify.log.error(err);
            reply.code(500).send({ error: '스트리밍 처리 중 오류가 발생했습니다.' });
        }
    });
}
