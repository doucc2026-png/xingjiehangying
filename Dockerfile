# 使用 Node.js 20 作为基础镜像
FROM node:20-slim AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 构建应用
RUN npm run build

# 运行阶段
FROM node:20-slim

WORKDIR /app

# 从构建阶段复制构建后的产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# 如果有本地存储的数据文件夹，也需要确保存在
RUN mkdir -p uploads data

# 暴露端口（AI Studio 和大多数云平台默认为 3000）
EXPOSE 3000

# 环境变量默认值
ENV PORT=3000
ENV NODE_ENV=production

# 启动服务器
CMD ["node", "dist/app/server/server.mjs"]
