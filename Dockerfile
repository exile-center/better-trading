FROM node:10.15-alpine

WORKDIR /opt/app

RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache git

COPY package.json package-lock.json ./

COPY scripts ./scripts

RUN npm ci --no-audit --no-color --unsafe-perm

COPY . .

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
