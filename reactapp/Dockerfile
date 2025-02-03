# build environment
FROM node:alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

ENV HOME=/app
RUN npm run build

# runtime environment
FROM nginx:stable-alpine
COPY --from=build /app/dist /var/transcribe/www

EXPOSE 4173

