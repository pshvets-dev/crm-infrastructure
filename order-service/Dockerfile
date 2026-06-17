FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma

# Prisma 7 config requires DATABASE_URL at generate time (value is not used for client generation).
ENV DATABASE_URL=postgresql://user:password@postgres:5432/crm_development?schema=public
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN cp -r src/generated dist/generated

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "/usr/local/bin/docker-entrypoint.sh"]
