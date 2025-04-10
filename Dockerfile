FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build-only

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8084

CMD ["nginx", "-g", "daemon off;"]