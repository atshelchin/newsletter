/**
 * Subscribe Route
 */

import { Elysia, t } from 'elysia';
import { subscribe } from '../services/subscriber.service';
import type { SubscribeRequest } from '../db';

const subscribeSchema = t.Object({
  email: t.String(),
  source: t.String(),
  locale: t.Optional(
    t.Object({
      language: t.String(),
      timezone: t.String(),
      utcOffset: t.Number(),
    })
  ),
  device: t.Optional(
    t.Object({
      userAgent: t.String(),
      deviceType: t.String(),
      platform: t.String(),
      browser: t.String(),
      screenWidth: t.Number(),
      screenHeight: t.Number(),
      touchSupport: t.Boolean(),
    })
  ),
  referrer: t.Optional(t.String()),
  timestamp: t.Optional(t.String()),
});

export const subscribeRoute = new Elysia().post(
  '/v1/subscribe',
  ({ body }) => {
    return subscribe(body as SubscribeRequest);
  },
  {
    body: subscribeSchema,
  }
);
