const t = sigma.i18n.extensionT;
export async function activate(_context) {
    await sigma.i18n.mergeFromPath('locales');
    sigma.contextMenu.registerItem({
        id: 'my-extension.example-notification',
        title: t('notificationActionTitle'),
        icon: 'Bell',
        group: 'extensions',
        order: 1,
    }, async (menuContext) => {
        const entry = menuContext.selectedEntries[0];
        sigma.ui.showNotification({
            title: t('notificationTitle'),
            subtitle: t('notificationSubtitle'),
            description: entry ? t('selectedEntry', { name: entry.name }) : t('noSelection'),
            type: 'info',
        });
    });
    sigma.contextMenu.registerItem({
        id: 'my-extension.count-selected',
        title: t('countSelectedTitle'),
        icon: 'Hash',
        group: 'extensions',
        order: 2,
        when: {
            selectionType: 'multiple',
        },
    }, async (menuContext) => {
        const selectedCount = menuContext.selectedEntries.length;
        const fileCount = menuContext.selectedEntries.filter(entry => !entry.isDirectory).length;
        const folderCount = menuContext.selectedEntries.filter(entry => entry.isDirectory).length;
        sigma.ui.showNotification({
            title: t('selectionCountTitle'),
            subtitle: t('selectionCountSubtitle', {
                count: selectedCount,
                files: fileCount,
                folders: folderCount,
            }),
            type: 'success',
        });
    });
    sigma.contextMenu.registerItem({
        id: 'my-extension.copy-path',
        title: t('copyPathTitle'),
        icon: 'Copy',
        group: 'extensions',
        order: 3,
        when: {
            selectionType: 'single',
        },
    }, async (menuContext) => {
        const entry = menuContext.selectedEntries[0];
        if (!entry) {
            return;
        }
        await sigma.ui.copyText(entry.path);
        sigma.ui.showNotification({
            title: t('copyPathSuccessTitle'),
            subtitle: t('copyPathSuccessSubtitle'),
            description: entry.path,
            type: 'success',
        });
    });
}
export async function deactivate() { }
