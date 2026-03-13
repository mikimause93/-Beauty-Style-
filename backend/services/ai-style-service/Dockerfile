FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose service port
EXPOSE 4005

# Default command starts the HTTP server
CMD ["node", "src/index.js"]
