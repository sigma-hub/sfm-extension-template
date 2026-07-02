import { decodeResponseBody, formatHeaders, showHttpErrorNotification, showHttpSuccessNotification, } from './http-client.js';
const t = sigma.i18n.extensionT;
const PUBLIC_DEMO_URL = 'https://httpbin.org/get';
const LOCALHOST_DEMO_URL = 'http://127.0.0.1:8080/';
function buildResultModalContent(requestUrl, response) {
    return [
        sigma.ui.input({
            id: 'requestUrl',
            label: t('requestUrlLabel'),
            value: requestUrl,
            disabled: true,
        }),
        sigma.ui.input({
            id: 'status',
            label: t('statusLabel'),
            value: String(response.status),
            disabled: true,
        }),
        sigma.ui.input({
            id: 'ok',
            label: t('okLabel'),
            value: response.ok ? t('yesValue') : t('noValue'),
            disabled: true,
        }),
        sigma.ui.textarea({
            id: 'responseHeaders',
            label: t('responseHeadersLabel'),
            value: formatHeaders(response.headers),
            rows: 6,
            disabled: true,
        }),
        sigma.ui.textarea({
            id: 'responseBody',
            label: t('responseBodyLabel'),
            value: decodeResponseBody(response.body),
            rows: 14,
            disabled: true,
        }),
    ];
}
function buildErrorModalContent(requestUrl, errorMessage) {
    return [
        sigma.ui.input({
            id: 'requestUrl',
            label: t('requestUrlLabel'),
            value: requestUrl,
            disabled: true,
        }),
        sigma.ui.alert({
            title: t('notificationErrorTitle'),
            description: errorMessage,
            tone: 'error',
        }),
    ];
}
async function showHttpResultModal(title, requestUrl, response, errorMessage) {
    const content = response
        ? buildResultModalContent(requestUrl, response)
        : buildErrorModalContent(requestUrl, errorMessage ?? 'Unknown error');
    await new Promise((resolve) => {
        const modal = sigma.ui.createModal({
            title,
            width: 760,
            content,
            buttons: [
                { id: 'close', label: t('closeButton'), variant: 'primary', shortcut: { key: 'Enter' } },
            ],
        });
        modal.onSubmit(() => {
            resolve();
        });
        modal.onClose(() => {
            resolve();
        });
    });
}
async function runHttpFormDemo(options) {
    try {
        const response = await sigma.http.request({
            url: options.requestUrl,
            method: 'GET',
            query: options.query,
            headers: {
                Accept: 'application/json',
                'User-Agent': 'SFM-HTTP-API-Template/1.0',
            },
            timeoutMs: 10000,
        });
        showHttpSuccessNotification(options.successNotificationSubtitleKey, { status: response.status });
        await showHttpResultModal(options.modalTitle, options.requestUrl, response, null);
    }
    catch (requestError) {
        const errorMessage = requestError instanceof Error
            ? requestError.message
            : String(requestError);
        showHttpErrorNotification(requestError);
        await showHttpResultModal(options.modalTitle, options.requestUrl, null, errorMessage);
    }
}
export async function openHttpFormDemo() {
    await runHttpFormDemo({
        requestUrl: PUBLIC_DEMO_URL,
        query: {
            source: 'sfm-http-api-template',
        },
        modalTitle: t('modalFormTitle'),
        successNotificationSubtitleKey: 'notificationFormSubtitle',
    });
}
export async function openLocalhostHttpDemo() {
    await runHttpFormDemo({
        requestUrl: LOCALHOST_DEMO_URL,
        modalTitle: t('modalLocalhostTitle'),
        successNotificationSubtitleKey: 'notificationLocalhostSubtitle',
    });
}
