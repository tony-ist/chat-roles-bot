FROM node:18.17.0 as builder

WORKDIR /app
COPY . /app
RUN ls /app
RUN npm install
RUN npm run build

FROM node:18.17.0

WORKDIR /app
COPY --from=builder /app /app
RUN rm -rf /app/src /app/node_modules
RUN ls /app

ARG GIT_COMMIT
LABEL commit=${GIT_COMMIT}
ENV COMMIT_SHA=${GIT_COMMIT}

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]