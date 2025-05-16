import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { ChatCompletionRequest } from 'shared/types/chat';

export function registerSSERoutes(fastify: FastifyInstance) {
    // SSE 라우트
    fastify.get('/api/sse', (request, reply) => {
        reply.sse({
            data: JSON.stringify({ message: 'SSE 연결이 설정되었습니다.' }),
        });

        // 연결 종료를 위해 setTimeout 추가 (옵션)
        setTimeout(() => {
            reply.sse({ data: '[DONE]' });
        }, 1000);
    });

    // SSE를 통한 채팅 응답
    fastify.post<{ Body: ChatCompletionRequest }>('/api/chat/sse', async (request, reply) => {
        try {
            const { messages, conversationId } = request.body;
            const lastMessage = messages[messages.length - 1];

            const responseContent = `이것은 "${lastMessage.content}"에 대한 SSE 응답입니다. 모의 API에서 생성된 답변입니다.`;
            const messageId = uuidv4();
            const convoId = conversationId || uuidv4();

            // 헤더 설정 (fastify-sse-v2는 자동으로 처리하지만 명시적으로 설정 가능)
            reply.raw.setHeader('Content-Type', 'text/event-stream');
            reply.raw.setHeader('Cache-Control', 'no-cache');
            reply.raw.setHeader('Connection', 'keep-alive');

            // 문자 단위로 스트리밍
            for (let i = 0; i < responseContent.length; i++) {
                const chunk = {
                    id: messageId,
                    content: responseContent.substring(0, i + 1),
                    role: 'assistant',
                    conversationId: convoId,
                    isDone: i === responseContent.length - 1,
                };

                // 이벤트와 데이터 전송
                reply.sse({
                    event: 'message',
                    data: JSON.stringify(chunk),
                });

                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // 완료 이벤트 전송
            reply.sse({
                event: 'done',
                data: JSON.stringify({ conversationId: convoId }),
            });

            // 연결 종료 신호
            reply.sse({ data: '[DONE]' });
        } catch (err) {
            fastify.log.error(err);
            reply.sse({
                event: 'error',
                data: JSON.stringify({ error: 'SSE 처리 중 오류가 발생했습니다.' }),
            });
            reply.sse({ data: '[DONE]' });
        }
    });

    // WebSocket 라우트는 그대로 유지
    fastify.register(async (fastify) => {
        fastify.get('/api/ws', { websocket: true }, (connection, req) => {
            connection.socket.on('message', async (message: string) => {
                try {
                    const data = JSON.parse(message.toString());
                    const { messages, conversationId } = data;

                    if (!messages || !messages.length) {
                        connection.socket.send(JSON.stringify({ error: '메시지가 필요합니다.' }));
                        return;
                    }

                    const lastMessage = messages[messages.length - 1];
                    const responseContent = `이것은 "${lastMessage.content}"에 대한 WebSocket 응답입니다.`;
                    const messageId = uuidv4();
                    const convoId = conversationId || uuidv4();

                    // 문자 단위로 스트리밍
                    for (let i = 0; i < responseContent.length; i++) {
                        const chunk = {
                            id: messageId,
                            content: responseContent.substring(0, i + 1),
                            role: 'assistant',
                            conversationId: convoId,
                            isDone: i === responseContent.length - 1,
                        };

                        connection.socket.send(JSON.stringify(chunk));
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                } catch (err) {
                    fastify.log.error(err);
                    connection.socket.send(JSON.stringify({ error: '처리 중 오류가 발생했습니다.' }));
                }
            });

            connection.socket.on('close', () => {
                fastify.log.info('WebSocket 연결이 닫혔습니다.');
            });
        });
    });
}
