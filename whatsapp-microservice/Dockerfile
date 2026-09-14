FROM ghcr.io/puppeteer/puppeteer:latest
USER root
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Puppeteer image uses pptruser by default, switch back for security
USER pptruser
ENV PORT=4001
EXPOSE 4001
CMD ["node", "index.js"]
