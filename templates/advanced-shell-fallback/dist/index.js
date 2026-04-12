import { escapeForPowerShellSingleQuotes, getDenoCommandCandidates, getErrorMessage, getWindowsPowerShellCandidates, runFirstAvailableCommandWithProgress, } from './lib/shell-runtime.js';
const t = sigma.i18n.extensionT;
function showFileAnalysisModal(fileName, hashValue) {
    sigma.ui.createModal({
        title: t('resultTitle', { fileName }),
        width: 720,
        content: [
            sigma.ui.input({
                id: 'fileHash',
                label: t('hashLabel'),
                value: hashValue,
                disabled: true,
            }),
        ],
    });
}
export async function activate(context) {
    await sigma.i18n.mergeFromPath('locales');
    const fileAnalysisScriptPath = await sigma.platform.joinPath(context.extensionPath, 'scripts', 'file-analysis.js');
    sigma.contextMenu.registerItem({
        id: 'my-extension.analyze-file-with-fallback',
        title: t('actionTitle'),
        icon: 'FileSearch',
        group: 'extensions',
        order: 1,
        when: {
            selectionType: 'single',
            entryType: 'file',
        },
    }, async (menuContext) => {
        const file = menuContext.selectedEntries[0];
        if (!file) {
            return;
        }
        const escapedPath = escapeForPowerShellSingleQuotes(file.path);
        const powerShellScript = `$targetPath = '${escapedPath}'; $hash = (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash.ToLower(); [PSCustomObject]@{ hash = $hash } | ConvertTo-Json -Compress`;
        try {
            const fallbackCandidates = sigma.platform.isWindows
                ? getWindowsPowerShellCandidates(powerShellScript)
                : [];
            const execution = await sigma.ui.withProgress({
                subtitle: t('progressSubtitle', { fileName: file.name }),
                location: 'notification',
                cancellable: true,
            }, async (progress, cancellationToken) => {
                progress.report({
                    description: t('preparingProgress'),
                    increment: 6,
                });
                return runFirstAvailableCommandWithProgress([
                    ...(await getDenoCommandCandidates([
                        'run',
                        '--quiet',
                        '--allow-read',
                        fileAnalysisScriptPath,
                        file.path,
                    ])),
                    ...fallbackCandidates,
                ], progress, cancellationToken, t);
            });
            if (execution.cancelled) {
                sigma.ui.showNotification({
                    title: t('cancelledTitle'),
                    subtitle: t('cancelledSubtitle', { fileName: file.name }),
                    type: 'warning',
                });
                return;
            }
            if (!('result' in execution)) {
                return;
            }
            if (execution.result.code !== 0) {
                sigma.ui.showNotification({
                    title: t('errorTitle'),
                    subtitle: execution.result.stderr || `${execution.commandName} failed`,
                    type: 'error',
                });
                return;
            }
            const payload = JSON.parse(execution.result.stdout.trim());
            showFileAnalysisModal(file.name, payload.hash);
        }
        catch (error) {
            sigma.ui.showNotification({
                title: t('errorTitle'),
                subtitle: getErrorMessage(error),
                type: 'error',
            });
        }
    });
}
export async function deactivate() { }
