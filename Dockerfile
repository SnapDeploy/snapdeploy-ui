# Stage 1: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
RUN echo "VITE_API_URL=$VITE_API_URL" > .env
RUN echo "VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY" >> .env

RUN echo "=== Build Args Verification ===" && \
    echo "VITE_API_URL: ${VITE_API_URL}" && \
    echo "VITE_CLERK_PUBLISHABLE_KEY (first 20 chars): ${VITE_CLERK_PUBLISHABLE_KEY:0:20}..." && \
    echo "=============================="
RUN pnpm build && \
    echo "=== Build Complete ===" && \
    echo "Dist folder contents:" && \
    ls -la dist/ && \
    echo "Index.html preview:" && \
    head -20 dist/index.html

# Stage 2: Serve static files via nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
