FROM node:boron

# Create app directory
WORKDIR /

# Install app dependencies
COPY package.json .
# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

# Bundle app source
COPY . .

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
