#!/bin/bash

# Dockerfile for Backend

cat > payment-app-backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY src ./src

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
EOF

cat > payment-app-backend/docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: payment_collection_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./src/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: payment_collection_db
      NODE_ENV: production
    depends_on:
      - mysql
    volumes:
      - ./src:/app/src

volumes:
  mysql_data:
EOF

echo "✅ Docker files created!"
