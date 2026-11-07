FROM node:22-alpine
WORKDIR /app
COPY tools/koyeb-console/server.mjs tools/koyeb-console/index.html tools/koyeb-console/login.html ./
USER node
ENV REMOTE=1 PORT=8000
EXPOSE 8000
CMD ["node", "server.mjs"]
