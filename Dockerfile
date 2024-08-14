FROM node:current

ARG buildno
ARG commitsha

ENV NODE_ENV=production


LABEL author="Curtis Fowler (curtisf)" \
      repository="https://github.com/curtisf/logger"

RUN mkdir /opt/bot
# Copy files and install modules
COPY *.js /opt/bot/
COPY *.json /opt/bot/
COPY *.md /opt/bot/
COPY src /opt/bot/src
WORKDIR /opt/bot
RUN npm i --production

CMD ["node", "index.js"]