# Build step #1: build the React front end
FROM node:16-alpine AS build-step
WORKDIR /app

ENV PATH=/app/node_modules/.bin:$PATH
ENV VITE_API_URL=http://127.0.0.1:5001

COPY ./ ./
RUN npm install

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
