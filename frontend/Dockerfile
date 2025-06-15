# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY . .

# Allow API URL to be specified at build time so the frontend
# knows where to send requests when running inside Docker
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm ci
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
