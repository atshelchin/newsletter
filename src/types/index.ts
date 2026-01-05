/**
 * Newsletter API Type Definitions
 */

// ============================================================================
// Database Types
// ============================================================================

export interface Subscriber {
  id: number;
  email: string;
  source: string;
  status: SubscriptionStatus;
  locale_language: string | null;
  locale_timezone: string | null;
  locale_utc_offset: number | null;
  device_type: string | null;
  device_platform: string | null;
  device_browser: string | null;
  device_screen_width: number | null;
  device_screen_height: number | null;
  device_touch_support: number | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = "subscribed" | "unsubscribed";

// ============================================================================
// Request Types
// ============================================================================

export interface LocaleInfo {
  language: string;
  timezone: string;
  utcOffset: number;
}

export interface DeviceInfo {
  userAgent: string;
  deviceType: string;
  platform: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  touchSupport: boolean;
}

export interface SubscribeRequest {
  email: string;
  source: string;
  locale?: LocaleInfo;
  device?: DeviceInfo;
  referrer?: string;
  timestamp?: string;
}

export interface UnsubscribeRequest {
  email: string;
  source: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface SuccessResponse {
  success: true;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
}

export type ErrorCode =
  | "INVALID_EMAIL"
  | "ALREADY_SUBSCRIBED"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export type SubscribeResponse = SuccessResponse | ErrorResponse;

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

export interface StatsResponse {
  success: boolean;
  source?: string;
  stats:
    | SourceStats
    | SourceStats[];
  error?: string;
}

export interface SourceStats {
  source?: string;
  total: number;
  subscribed: number;
  unsubscribed: number;
}
