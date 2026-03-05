# Production Dockerfile for HartfordVapes Backend

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source
COPY src ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
