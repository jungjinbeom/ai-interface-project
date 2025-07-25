import { FastifyInstance } from 'fastify';
import { testOpenAIConnection } from '../utils/testOpenAI.js';
import { openaiService } from '../services/openai.js';

export function registerTestRoutes(fastify: FastifyInstance) {
    // GET OpenAI connection test
    fastify.get('/api/test/openai', async (request, reply) => {
        try {
            const result = await testOpenAIConnection();

            if (result.success) {
                return reply.send({
                    success: true,
                    message: result.message,
                    model: result.model,
                    timestamp: new Date().toISOString(),
                });
            } else {
                return reply.code(400).send({
                    success: false,
                    error: result.message,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({
                success: false,
                error: 'Internal server error while testing OpenAI connection',
                timestamp: new Date().toISOString(),
            });
        }
    });

    // GET comprehensive server health check
    fastify.get('/api/test/health', async (request, reply) => {
        const openaiTest = await testOpenAIConnection();

        return reply.send({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            server: {
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
                },
            },
            openai: {
                configured: openaiService.isInitialized(),
                connectionStatus: openaiTest.success ? 'connected' : 'failed',
                model: openaiService.getModel(),
                maxTokens: openaiService.getMaxTokens(),
                temperature: openaiService.getTemperature(),
                error: openaiTest.success ? null : openaiTest.message,
                fallbackMode: !openaiService.isInitialized(),
            },
            endpoints: {
                chat: '/api/chat',
                stream: '/api/chat/stream',
                conversations: '/api/conversations',
                openaiTest: '/api/test/openai',
                documentation: '/documentation',
            },
            instructions: openaiService.isInitialized()
                ? 'OpenAI is properly configured and ready to use!'
                : 'OpenAI is not configured. Add OPENAI_API_KEY to .env file and restart the server to enable AI features.',
        });
    });
}
