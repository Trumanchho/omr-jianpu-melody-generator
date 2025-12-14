# Build step #1: build the React front end
FROM node:16-alpine AS build-step
WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH
ENV VITE_API_URL=https://backend-6hw8.onrender.com/

COPY ./ ./
RUN npm install

EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host"]
