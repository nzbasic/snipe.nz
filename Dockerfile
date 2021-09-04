FROM node:14
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
RUN cd client
RUN npm run build
RUN cd ..
EXPOSE 8080
CMD ["npm", "run", "start"]