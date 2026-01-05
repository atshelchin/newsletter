/**
 * Stats Route
 */

import { Elysia } from 'elysia';
import { getStats } from '../services/subscriber.service';

export const statsRoute = new Elysia().get('/v1/stats', ({ query }) => {
  return getStats(query.source);
});
