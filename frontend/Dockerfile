FROM node:14.15.0-buster
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && apt-get install -y tzdata
RUN npm install -g --unsafe-perm firebase-tools@8.17.0
RUN npm install -g --unsafe-perm @ionic/cli@6.12.1 cordova-res@0.15.2 