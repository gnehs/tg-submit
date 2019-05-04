FROM node:alpine
WORKDIR /app
COPY . /app 
RUN npm install --production
# 環境設定
ENV NODE_ENV=production
EXPOSE 3000
# 啟動
CMD ["npm", "start"]

