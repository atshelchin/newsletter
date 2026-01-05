/**
 * Newsletter API
 * A simple email subscription service built with Elysia and bun:sqlite
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { healthRoute, subscribeRoute, unsubscribeRoute, statsRoute } from './routes';

const app = new Elysia()
  // Enable CORS
  .use(
    cors({
      origin: true, // Allow all origins, or specify: ['https://biubiu.tools']
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    })
  )
  // Mount routes
  .use(healthRoute)
  .use(subscribeRoute)
  .use(unsubscribeRoute)
  .use(statsRoute)
  .listen(3000);

console.log(`Newsletter API is running at ${app.server?.hostname}:${app.server?.port}`);
