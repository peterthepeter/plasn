# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app

ARG PLASN_SITE_URL=""

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN --mount=type=secret,id=vite_cf_web_analytics_token,required=false \
    PLASN_SITE_URL="$PLASN_SITE_URL" \
    VITE_CF_WEB_ANALYTICS_TOKEN="$(cat /run/secrets/vite_cf_web_analytics_token 2>/dev/null || true)" \
    npm run build

# Static hosting does not need the optional modules in the full Alpine image.
FROM nginx:1.31-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
