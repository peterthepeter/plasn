FROM node:22-alpine AS build
WORKDIR /app

ARG PLASN_SITE_URL=""
ARG VITE_CF_WEB_ANALYTICS_TOKEN=""
ENV PLASN_SITE_URL=$PLASN_SITE_URL
ENV VITE_CF_WEB_ANALYTICS_TOKEN=$VITE_CF_WEB_ANALYTICS_TOKEN

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
