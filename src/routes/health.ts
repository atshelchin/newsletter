/**
 * Health Check Route
 */

import { Elysia } from 'elysia';

export const healthRoute = new Elysia().get('/', () => ({
  status: 'ok',
  service: 'newsletter-api',
  version: '1.0.0',
}));
