const t = sigma.i18n.extensionT;
export async function activate(_context) {
    await sigma.i18n.mergeFromPath('locales');
    sigma.commands.registerCommand({
        id: 'my-extension.say-hello',
        title: t('commandTitle'),
        description: t('commandDescription'),
    }, () => {
        sigma.ui.showNotification({
            title: t('notificationTitle'),
            subtitle: t('notificationSubtitle'),
            type: 'success',
        });
    });
}
export async function deactivate() { }
