FROM node:6.12

LABEL maintainer "osoken.devel@outlook.jp"

WORKDIR /app
ADD . /app

RUN npm install

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
CMD ["npm start"]
