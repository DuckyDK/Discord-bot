FROM node:18

# Install Python for node-gyp
RUN apt-get update && apt-get install -y python3 make g++ 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/index.js"]
