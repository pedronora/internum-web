FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

ARG APP_VERSION=dev
LABEL org.opencontainers.image.version=$APP_VERSION

ENV VITE_API_BASE_URL=http://localhost:8000
ENV APP_VERSION=$APP_VERSION

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/40-env.sh /docker-entrypoint.d/40-env.sh
COPY --from=build /app/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-env.sh

EXPOSE 80
