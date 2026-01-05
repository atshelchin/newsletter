/**
 * Unsubscribe Route
 */

import { Elysia, t } from 'elysia';
import { unsubscribe } from '../services/subscriber.service';
import type { UnsubscribeRequest } from '../db';

const unsubscribeSchema = t.Object({
  email: t.String(),
  source: t.String(),
});

export const unsubscribeRoute = new Elysia().post(
  '/v1/unsubscribe',
  ({ body }) => {
    return unsubscribe(body as UnsubscribeRequest);
  },
  {
    body: unsubscribeSchema,
  }
);
