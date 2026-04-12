import { runPowerShellScript } from './lib/powershell.js';
const t = sigma.i18n.extensionT;
export async function activate(_context) {
    await sigma.i18n.mergeFromPath('locales');
    sigma.commands.registerCommand({
        id: 'my-extension.show-powershell-runtime',
        title: t('commandTitle'),
        description: t('commandDescription'),
    }, async () => {
        if (!sigma.platform.isWindows) {
            sigma.ui.showNotification({
                title: t('unsupportedTitle'),
                subtitle: t('unsupportedSubtitle'),
                type: 'warning',
            });
            return;
        }
        try {
            const output = await runPowerShellScript('$topProcesses = Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 ProcessName, Id, CPU; '
                + '$topProcessLines = $topProcesses | ForEach-Object { $cpuValue = if ($null -eq $_.CPU) { 0 } else { [double]$_.CPU }; "{0} (PID {1}) CPU {2}" -f $_.ProcessName, $_.Id, $cpuValue.ToString("0.00") }; '
                + '[PSCustomObject]@{ '
                + 'hostName = $env:COMPUTERNAME; '
                + 'powerShellVersion = $PSVersionTable.PSVersion.ToString(); '
                + 'processCount = (Get-Process).Count; '
                + 'topProcesses = ($topProcessLines -join "`n") '
                + '} | ConvertTo-Json -Compress');
            const payload = JSON.parse(output.trim());
            sigma.ui.createModal({
                title: t('resultTitle'),
                width: 720,
                content: [
                    sigma.ui.input({ id: 'hostName', label: t('hostNameLabel'), value: payload.hostName, disabled: true }),
                    sigma.ui.input({
                        id: 'powerShellVersion',
                        label: t('powerShellVersionLabel'),
                        value: payload.powerShellVersion,
                        disabled: true,
                    }),
                    sigma.ui.input({
                        id: 'processCount',
                        label: t('processCountLabel'),
                        value: String(payload.processCount),
                        disabled: true,
                    }),
                    sigma.ui.textarea({
                        id: 'topProcesses',
                        label: t('topProcessesLabel'),
                        value: payload.topProcesses || t('noProcessData'),
                        rows: 8,
                        disabled: true,
                    }),
                ],
            });
        }
        catch (error) {
            sigma.ui.showNotification({
                title: t('errorTitle'),
                subtitle: error instanceof Error ? error.message : String(error),
                type: 'error',
            });
        }
    });
}
export async function deactivate() { }
