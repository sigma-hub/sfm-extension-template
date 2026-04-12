import type { ExtensionActivationContext } from '@sigma-file-manager/api';

const t = sigma.i18n.extensionT;

function formatFileSize(sizeBytes: number | null | undefined): string {
  if (sizeBytes == null) {
    return t('notAvailable');
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1048576) {
    return `${(sizeBytes / 1024).toFixed(2)} KB`;
  }

  return `${(sizeBytes / 1048576).toFixed(2)} MB`;
}

export async function activate(_context: ExtensionActivationContext): Promise<void> {
  await sigma.i18n.mergeFromPath('locales');

  sigma.contextMenu.registerItem(
    {
      id: 'my-extension.show-file-details',
      title: t('fileDetailsActionTitle'),
      icon: 'Info',
      group: 'extensions',
      order: 1,
      when: {
        selectionType: 'single',
        entryType: 'file',
      },
    },
    async (menuContext) => {
      const file = menuContext.selectedEntries[0];
      if (!file) {
        return;
      }

      sigma.ui.createModal({
        title: t('fileDetailsTitle', { fileName: file.name }),
        width: 640,
        content: [
          sigma.ui.input({ id: 'name', label: t('nameLabel'), value: file.name, disabled: true }),
          sigma.ui.input({ id: 'path', label: t('pathLabel'), value: file.path, disabled: true }),
          sigma.ui.input({
            id: 'extension',
            label: t('extensionLabel'),
            value: file.extension || t('noneValue'),
            disabled: true,
          }),
          sigma.ui.input({
            id: 'size',
            label: t('sizeLabel'),
            value: formatFileSize(file.size),
            disabled: true,
          }),
        ],
      });
    }
  );

  sigma.commands.registerCommand(
    {
      id: 'my-extension.open-file-dialog',
      title: t('openFileDialogTitle'),
      description: t('openFileDialogDescription'),
    },
    async () => {
      const result = await sigma.dialog.openFile({
        title: t('selectFileTitle'),
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      const selectedValue = Array.isArray(result)
        ? result.join(', ')
        : result || t('nothingSelected');

      sigma.ui.createModal({
        title: t('dialogResultTitle'),
        width: 720,
        content: [
          sigma.ui.input({
            id: 'selection',
            label: t('dialogResultLabel'),
            value: selectedValue,
            disabled: true,
          }),
        ],
      });
    }
  );
}

export async function deactivate(): Promise<void> {}
