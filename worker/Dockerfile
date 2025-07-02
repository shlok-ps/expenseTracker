FROM node:20
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["./wait-for-all.sh", "node", "dist/worker.js"]

