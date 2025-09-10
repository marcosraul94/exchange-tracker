FROM node:24-bookworm

RUN apt-get update && \
    apt-get install -y \
    cmake

WORKDIR /var/task

COPY package*.json ./
COPY tsconfig.json ./

RUN npm i

RUN npx playwright install chromium --with-deps

COPY src ./src

RUN npx tsc

ENTRYPOINT ["npx", "aws-lambda-ric"]
CMD ["index.handler"]
