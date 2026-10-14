import { apiRequest } from './base';

export interface AlertConfig {
  alert_telegram_chat_id: number | null;
  alert_dedupe_seconds: number;
  /** Fields whose value comes from the admin override row (vs. env default). */
  overridden_keys: string[];
  /** Whether the backend's Telegram bot is initialized (alerts can be sent). */
  bot_ready: boolean;
}

export interface AlertConfigUpdate {
  /** null clears the override (falls back to env); omit to leave unchanged. */
  alert_telegram_chat_id?: number | null;
  alert_dedupe_seconds?: number;
  reason: string;
}

export interface AlertTestResult {
  ok: boolean;
  chat_id: number | null;
  error: string | null;
}

export class AlertConfigAPI {
  static get() {
    return apiRequest<AlertConfig>('/admin/alert-config');
  }

  static update(data: AlertConfigUpdate) {
    return apiRequest<AlertConfig>('/admin/alert-config', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /** Send a test message; `chat_id` lets ops verify a candidate before saving. */
  static test(chat_id: number | null) {
    return apiRequest<AlertTestResult>('/admin/alert-config/test', {
      method: 'POST',
      body: JSON.stringify({ chat_id })
    });
  }
}
