const t = sigma.i18n.extensionT;
function decodeUtf8Body(body) {
    return new TextDecoder().decode(body);
}
export function decodeResponseBody(body, maxLength = 8000) {
    const decodedText = decodeUtf8Body(body);
    if (decodedText.length <= maxLength) {
        return decodedText;
    }
    return `${decodedText.slice(0, maxLength)}\n\n... truncated ...`;
}
export function formatHeaders(headers) {
    const headerLines = Object.entries(headers)
        .sort(([headerA], [headerB]) => headerA.localeCompare(headerB))
        .map(([headerName, headerValue]) => `${headerName}: ${headerValue}`);
    return headerLines.join('\n') || '(none)';
}
export async function requestJson(options) {
    const response = await sigma.http.request({
        url: options.url,
        method: 'GET',
        query: options.query,
        headers: {
            Accept: 'application/json',
        },
        timeoutMs: options.timeoutMs ?? 10000,
    });
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return JSON.parse(decodeUtf8Body(response.body));
}
export function showHttpErrorNotification(error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    sigma.ui.showNotification({
        title: t('notificationErrorTitle'),
        subtitle: t('notificationErrorSubtitle', { message: errorMessage }),
        type: 'error',
    });
}
export function showHttpSuccessNotification(subtitleKey, params) {
    sigma.ui.showNotification({
        title: t('notificationSuccessTitle'),
        subtitle: t(subtitleKey, params),
        type: 'success',
    });
}
