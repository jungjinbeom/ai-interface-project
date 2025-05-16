import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage } from 'shared/types/chat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerChatRoutes(fastify: FastifyInstance) {
    // GET 메시지 목록 조회
    fastify.get('/api/conversations', async (request, reply) => {
        try {
            // JSON 파일에서 대화 목록 읽기
            const dataPath = join(__dirname, '../data/mockMessages.json');
            const data = await fs.readFile(dataPath, 'utf-8');
            const { conversations } = JSON.parse(data);

            return reply.send({ conversations });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: '대화 목록을 불러오는데 실패했습니다.' });
        }
    });

    // GET 특정 대화 조회
    fastify.get<{ Params: { id: string } }>('/api/conversations/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const dataPath = join(__dirname, '../data/mockMessages.json');
            const data = await fs.readFile(dataPath, 'utf-8');
            const { conversations } = JSON.parse(data);

            const conversation = conversations.find((conv: any) => conv.id === id);

            if (!conversation) {
                return reply.code(404).send({ error: '대화를 찾을 수 없습니다.' });
            }

            return reply.send({ conversation });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: '대화를 불러오는데 실패했습니다.' });
        }
    });

    // POST 메시지 전송
    fastify.post<{ Body: ChatCompletionRequest }>('/api/chat', async (request, reply) => {
        try {
            const { messages, conversationId } = request.body;

            // 마지막 메시지 가져오기
            const lastMessage = messages[messages.length - 1];

            // 봇 응답 생성
            const botResponse: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `이것은 "${lastMessage.content}"에 대한 응답입니다. 모의 API에서 생성된 답변입니다.`,
                createdAt: new Date().toISOString(),
                status: 'success',
            };

            // 응답 준비
            const response: ChatCompletionResponse = {
                id: uuidv4(),
                message: botResponse,
                conversationId: conversationId || uuidv4(),
            };

            // 약간의 지연을 추가하여 실제 API 호출처럼 보이게 함
            await new Promise((resolve) => setTimeout(resolve, 500));

            return reply.send(response);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: '메시지 처리 중 오류가 발생했습니다.' });
        }
    });
}
