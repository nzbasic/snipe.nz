FROM node:14
WORKDIR /usr/src/app
COPY collection/package.json .
RUN npm i
COPY collection /usr/src/app/collect
COPY models /usr/src/app/models/
COPY shared /usr/src/app/shared/
CMD ["npm", "run", "start"]
