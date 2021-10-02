FROM node:12-alpine

RUN apk add bash --no-cache
SHELL ["/bin/bash", "-c"]

# Git is neeeded by tests that watch files
RUN apk add git --no-cache \
  # firebase emulators dependency
  && apk add openjdk11 --no-cache \
  # firebase dependencies
  && npm install -g firebase-tools \
  && firebase setup:emulators:firestore

COPY functions/package*.json /usr/src/app/functions/
WORKDIR /usr/src/app/functions

# install dependencies
# deliverful-types dependency is gotten as a NPM package, gotten from a private github repository. Need SSH to auth.
COPY .deliverful_builder_rsa.ssh.key /tmp/ssh.key
COPY ssh-find-agent.sh /tmp/ssh-find-agent.sh
RUN apk add openssh --no-cache \
  && mkdir -p -m 0600 ~/.ssh \
  && ssh-keyscan github.com >> ~/.ssh/known_hosts \
  && eval `ssh-agent` \
  && chmod 600 /tmp/ssh.key \
  && ssh-add /tmp/ssh.key \
  && npm install

COPY . .

EXPOSE 5061

ENV FIREBASE_TOKEN=1//0h7tXM9huiSt5CgYIARAAGBESNwF-L9IrxvUNR97s82szxE6J7kmV_HlLaR3xnqTpiAV3-sY_G7MFmSmXYI8cgg1MDX8KfBfKlyc

CMD npm run serve -- --token ${FIREBASE_TOKEN}