import app from './app';
import { config } from './config/env';
import prisma from './prisma';

const server = app.listen(parseInt(config.PORT), () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
  console.log(`📦 Environment: ${config.NODE_ENV}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Prisma disconnected. Goodbye.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
