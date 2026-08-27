FROM node:22-alpine AS build

WORKDIR /site
COPY . .
RUN node build.js

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site /usr/share/nginx/html
