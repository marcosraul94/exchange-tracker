FROM node:24-bookworm

WORKDIR /var/task

RUN apt-get update && \
    apt-get install -y cmake && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/lib/package.json ./apps/lib/
COPY apps/scraper/package.json ./apps/scraper/
COPY apps/scheduler/package.json ./apps/scheduler/

RUN npm ci

COPY apps/lib ./apps/lib
COPY apps/scheduler ./apps/scheduler

RUN npm run build -w @repo/lib
RUN npm run build -w @repo/scheduler

WORKDIR /var/task/apps/scheduler

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD ["./dist/index.handler"]
