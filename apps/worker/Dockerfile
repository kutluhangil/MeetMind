FROM node:20-alpine AS base

RUN apk add --no-cache ffmpeg python3 make g++

WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S worker -u 1001

COPY --from=deps    --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/dist         ./dist
COPY --from=builder --chown=worker:nodejs /app/package.json ./

RUN mkdir -p /tmp/meetmind && chown worker:nodejs /tmp/meetmind

USER worker

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3002
CMD ["node", "dist/index.js"]
