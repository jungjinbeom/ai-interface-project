import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage } from 'shared/types/chat';
import { openaiService } from '@/services/openai';
import { fallbackService } from '@/services/fallback';
import { threadManager, ChatThread } from '@/services/threadManager';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerChatRoutes(fastify: FastifyInstance) {
    // GET all threads
    fastify.get('/api/threads', async (request, reply) => {
        try {
            const threads = threadManager.getAllThreads();
            return reply.send({ threads });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to get threads' });
        }
    });

    // GET specific thread
    fastify.get<{ Params: { id: string } }>('/api/threads/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const thread = threadManager.getThread(id);

            if (!thread) {
                return reply.code(404).send({ error: 'Thread not found' });
            }

            return reply.send({ thread });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to get thread' });
        }
    });

    // POST create new thread
    fastify.post('/api/threads', async (request, reply) => {
        try {
            const thread = threadManager.createThread();
            return reply.send({ thread });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to create thread' });
        }
    });

    // DELETE thread
    fastify.delete<{ Params: { id: string } }>('/api/threads/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const deleted = threadManager.deleteThread(id);

            if (!deleted) {
                return reply.code(404).send({ error: 'Thread not found' });
            }

            return reply.send({ success: true });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to delete thread' });
        }
    });

    // PUT update thread title
    fastify.put<{ Params: { id: string }; Body: { title: string } }>('/api/threads/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const { title } = request.body;
            const updated = threadManager.updateThreadTitle(id, title);

            if (!updated) {
                return reply.code(404).send({ error: 'Thread not found' });
            }

            return reply.send({ success: true });
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to update thread' });
        }
    });

    // POST send message to thread
    fastify.post<{ Body: ChatCompletionRequest & { threadId?: string } }>('/api/chat', async (request, reply) => {
        try {
            const { messages, threadId } = request.body;
            let currentThreadId = threadId;
            let responseContent: string;

            // Create new thread if none provided
            if (!currentThreadId) {
                const userMessage = messages[messages.length - 1];
                const newThread = threadManager.createThread(userMessage?.content);
                currentThreadId = newThread.id;
            }

            // Get or create thread
            let thread = threadManager.getThread(currentThreadId);
            if (!thread) {
                const userMessage = messages[messages.length - 1];
                thread = threadManager.createThread(userMessage?.content);
                currentThreadId = thread.id;
            }

            // Add user message to thread
            const userMessage = messages[messages.length - 1];
            const userChatMessage: ChatMessage = {
                id: uuidv4(),
                role: userMessage.role,
                content: userMessage.content,
                createdAt: new Date().toISOString(),
                status: 'success',
            };
            threadManager.addMessageToThread(currentThreadId, userChatMessage);

            // Generate AI response
            console.log('OpenAI initialized:', openaiService.isInitialized());
            console.log('OpenAI init error:', openaiService.getInitError());
            if (!openaiService.isInitialized()) {
                // Fallback service
                const fallbackMessages = messages.map((msg) => ({
                    role: msg.role as 'user' | 'assistant' | 'system',
                    content: msg.content,
                }));

                const fallbackResponse = await fallbackService.createMockChatCompletion(fallbackMessages);
                responseContent = `⚠️ OpenAI API가 설정되지 않았습니다.\n\n${fallbackResponse.content}\n\n💡 실제 AI 응답을 받으려면:\n1. .env 파일에 OPENAI_API_KEY를 설정하세요\n2. 서버를 재시작하세요`;
            } else {
                // OpenAI API call
                const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map((msg) => ({
                    role: msg.role as 'user' | 'assistant' | 'system',
                    content: msg.content,
                }));

                const openaiResponse = await openaiService.createChatCompletion(openaiMessages);

                if (!openaiResponse || !openaiResponse.content) {
                    throw new Error('OpenAI API 응답이 유효하지 않습니다.');
                }

                responseContent = openaiResponse.content;
            }

            // Create bot response
            const botResponse: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: responseContent,
                createdAt: new Date().toISOString(),
                status: 'success',
            };

            // Add bot response to thread
            threadManager.addMessageToThread(currentThreadId, botResponse);

            // Prepare response
            const response: ChatCompletionResponse = {
                id: uuidv4(),
                message: botResponse,
                conversationId: currentThreadId,
            };

            return reply.send(response);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: 'Failed to process message' });
        }
    });
}
