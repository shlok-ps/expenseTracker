# Dockerfile
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build (optional, if using TypeScript)
RUN npm run generate
RUN npm run build

# Download wait tool
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

CMD ["npm", "start"]

