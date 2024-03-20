FROM nvidia/cuda:12.2.0-base-ubuntu22.04 AS base

ENV DEBIAN_FRONTEND=noninteractive
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility

RUN apt-get update && apt-get install -y \
    nvidia-container-toolkit

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y \
  xvfb \
  libcurl4-openssl-dev \
  libglfw3-dev \
  libuv1-dev \
  libjpeg-dev \
  libpng-dev \
  libwebp-dev

# Install Node.js
RUN apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y
RUN npm install -g yarn

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

ENV NODE_ENV=production

RUN yarn run build

CMD [ "/bin/sh", "-c", "/usr/bin/xvfb-run -a node ./dist/main.js" ]
