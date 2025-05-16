import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import fastifySSEPlugin from 'fastify-sse-v2';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 라우트 handlers
import { registerChatRoutes } from './routes/chat.js';
import { registerStreamRoutes } from './routes/stream.js';
import { registerSSERoutes } from './routes/sse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
    const fastify = Fastify({
        logger: true,
    });

    // CORS 설정
    await fastify.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    // Swagger 문서 설정 - OpenAPI 3.0 사용
    await fastify.register(swagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Seamless AI Interface API',
                description: 'AI 인터페이스를 위한 API 문서',
                version: '0.1.0',
            },
            servers: [
                {
                    url: 'http://localhost:3001',
                    description: 'Development server',
                },
            ],
            tags: [
                { name: 'chat', description: '채팅 관련 API' },
                { name: 'stream', description: '스트리밍 관련 API' },
                { name: 'sse', description: 'SSE 관련 API' },
            ],
            components: {
                securitySchemes: {
                    apiKey: {
                        type: 'apiKey',
                        name: 'apiKey',
                        in: 'header',
                    },
                },
            },
        },
    });

    // Swagger UI 설정
    await fastify.register(swaggerUI, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
        uiHooks: {
            onRequest: function (request, reply, next) {
                next();
            },
            preHandler: function (request, reply, next) {
                next();
            },
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => swaggerObject,
    });

    // 플러그인 등록
    await fastify.register(websocket);
    await fastify.register(fastifySSEPlugin);

    // 라우트 등록
    registerChatRoutes(fastify);
    registerStreamRoutes(fastify);
    registerSSERoutes(fastify);

    // 서버 시작
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
        console.log('서버가 http://localhost:3001 에서 실행 중입니다.');
        console.log('API 문서는 http://localhost:3001/documentation 에서 확인할 수 있습니다.');

        // Swagger JSON 엔드포인트 확인
        console.log('Swagger JSON: http://localhost:3001/documentation/json');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

startServer();
