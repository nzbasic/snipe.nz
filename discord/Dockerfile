FROM node
WORKDIR /app
COPY discord/package.json .
RUN npm i
COPY discord /app/bot
COPY models /app/models/
COPY shared /app/shared/
CMD ["npm", "run", "start"]
