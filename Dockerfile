FROM node:18-alpine AS base

# 기본 환경 설정
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 설치
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# 빌드
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 프로덕션 서버
FROM base AS runner
WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV production

# 필요한 파일만 복사
COPY --from=builder /app/packages/server/dist ./server/dist
COPY --from=builder /app/packages/server/package.json ./server/
COPY --from=builder /app/packages/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

# 서버 실행
CMD ["node", "server/dist/index.js"]
