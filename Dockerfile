FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force


FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force

COPY . .
RUN npm run build && mkdir -p /app/uploads


FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json
COPY --from=builder --chown=nonroot:nonroot /app/uploads ./uploads

EXPOSE 5000

CMD ["dist/server.js"]
