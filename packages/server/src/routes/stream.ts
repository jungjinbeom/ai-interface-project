import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { ChatCompletionRequest, ChatStreamChunk } from 'shared/types/chat';

export function registerStreamRoutes(fastify: FastifyInstance) {
    // 스트리밍 응답을 위한 라우트
    fastify.post<{ Body: ChatCompletionRequest }>('/api/chat/stream', async (request, reply) => {
        try {
            const { messages, conversationId } = request.body;

            // 마지막 메시지 가져오기
            const lastMessage = messages[messages.length - 1];

            // 스트리밍 응답을 위한 컨텐츠 준비
            const responseContent = `이것은 "${lastMessage.content}"에 대한 스트리밍 응답입니다. 모의 API에서 생성된 답변입니다.`;
            const messageId = uuidv4();
            const convoId = conversationId || uuidv4();

            // 응답 헤더 설정
            reply.raw.writeHead(200, {
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked',
            });

            // 문자 단위로 스트리밍
            for (let i = 0; i < responseContent.length; i++) {
                const chunk: ChatStreamChunk = {
                    id: messageId,
                    content: responseContent[i],
                    role: 'assistant',
                    conversationId: convoId,
                    isDone: i === responseContent.length - 1,
                };

                // JSON 형식으로 각 청크 전송
                reply.raw.write(JSON.stringify(chunk) + '\n');

                // 약간의 지연을 추가하여 스트리밍 효과 생성
                await new Promise((resolve) => setTimeout(resolve, 50));
            }

            reply.raw.end();
        } catch (err) {
            fastify.log.error(err);
            reply.code(500).send({ error: '스트리밍 처리 중 오류가 발생했습니다.' });
        }
    });
}
