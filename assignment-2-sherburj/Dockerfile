FROM node:11
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY lib lib/
RUN npm install mongodb
ENV PORT=8000
EXPOSE ${PORT} 
CMD [ "npm", "start" ]
