import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import { connectDB } from './db';
import { setupChatHandlers } from './socket/chat';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

dotenv.config();

async function startServer() {
  // 初始化 Express
  const app = express();
  const httpServer = http.createServer(app);
  
  // 中间件
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());
  
  // 连接数据库
  await connectDB();
  
  // 设置 Apollo Server (GraphQL)
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ 
    app: app as any,
    path: '/graphql',
    cors: false // 因为我们已经设置了全局 CORS
  });
  
  // 设置 Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  setupChatHandlers(io);
  
  // 简单的健康检查路由
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // 启动服务器
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
