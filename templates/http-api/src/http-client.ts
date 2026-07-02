import type { ExtensionHttpResponse } from '@sigma-file-manager/api';

const t = sigma.i18n.extensionT;

function decodeUtf8Body(body: Uint8Array): string {
  return new TextDecoder().decode(body);
}

export function decodeResponseBody(body: Uint8Array, maxLength = 8000): string {
  const decodedText = decodeUtf8Body(body);

  if (decodedText.length <= maxLength) {
    return decodedText;
  }

  return `${decodedText.slice(0, maxLength)}\n\n... truncated ...`;
}

export function formatHeaders(headers: Record<string, string>): string {
  const headerLines = Object.entries(headers)
    .sort(([headerA], [headerB]) => headerA.localeCompare(headerB))
    .map(([headerName, headerValue]) => `${headerName}: ${headerValue}`);

  return headerLines.join('\n') || '(none)';
}

export async function requestJson<T>(options: {
  url: string;
  query?: Record<string, string | number | boolean>;
  timeoutMs?: number;
}): Promise<T> {
  const response = await sigma.http.request({
    url: options.url,
    method: 'GET',
    query: options.query,
    headers: {
      Accept: 'application/json',
    },
    timeoutMs: options.timeoutMs ?? 10_000,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return JSON.parse(decodeUtf8Body(response.body)) as T;
}

export function showHttpErrorNotification(error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);

  sigma.ui.showNotification({
    title: t('notificationErrorTitle'),
    subtitle: t('notificationErrorSubtitle', { message: errorMessage }),
    type: 'error',
  });
}

export function showHttpSuccessNotification(subtitleKey: string, params: Record<string, string | number>): void {
  sigma.ui.showNotification({
    title: t('notificationSuccessTitle'),
    subtitle: t(subtitleKey, params),
    type: 'success',
  });
}

export type { ExtensionHttpResponse };
