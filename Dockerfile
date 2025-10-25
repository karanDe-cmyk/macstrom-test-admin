# ------------------------
# Stage 1: Build the app
# ------------------------
    FROM node:25-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install --legacy-peer-deps
    
    # Copy source code
    COPY . .
    
    # Build the Vite app for production
    RUN npm run build
    
    # ------------------------
    # Stage 2: Serve with NGINX
    # ------------------------
    FROM nginx:1.27-alpine AS production
    
    # Remove default nginx static assets
    RUN rm -rf /usr/share/nginx/html/*
    
    # Copy built files from builder stage
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Copy custom nginx config (optional)
    # Uncomment the next line if you have your own nginx.conf
    # COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose the default Nginx port
    EXPOSE 80
    
    # Start Nginx server
    CMD ["nginx", "-g", "daemon off;"]
    