FROM node:24-bookworm

RUN apt-get update && \
    apt-get install -y \
    cmake && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/task

COPY package.json package-lock.json ./
COPY lib/package.json ./lib/
COPY apps/scraper/package.json ./apps/scraper/

RUN npm ci

RUN npx playwright install chromium --with-deps

COPY lib ./lib
COPY apps/scraper ./apps/scraper

RUN npm run build -w @repo/lib
RUN npm run build -w @repo/scraper

WORKDIR /var/task/apps/scraper

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD ["./dist/index.handler"]
