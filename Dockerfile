FROM node:14-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    npm \
    openssh-server

RUN mkdir /var/run/sshd
RUN ssh-keygen -A
RUN sed -i 's/^#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    echo 'root:velodrome' | chpasswd

WORKDIR /app

COPY index.js ./
COPY package*.json ./

RUN npm install

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

CMD /usr/sbin/sshd -D & node index.js

