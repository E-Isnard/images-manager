FROM node:10-alpine

# Installs latest Chromium (77) package.

WORKDIR /usr/src/app
COPY . .
RUN ls


#RUN	npm install -g \
#  pa11y-ci@2.*  --unsafe-perm=true
#RUN	npm install -g \
#  pa11y-ci-reporter-html@2.*  --unsafe-perm=true
  

RUN npm install
RUN npm run prestart:prod
EXPOSE 3000
# Serve the app

#RUN npm run generate-accessibility-report

CMD ["npm", "run", "start:prod"]
